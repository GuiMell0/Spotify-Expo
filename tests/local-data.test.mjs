import test from 'node:test';
import assert from 'node:assert/strict';
import { mapTrack, mapArtist } from '../src/services/spotifyModels.mjs';
import { createAsyncStorageDriver, createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';
import { LocalDataError } from '../src/storage/localDataErrors.mjs';
import { emptyLocalData, encodeLocalData, decodeLocalData, localDataKey, LOCAL_DATA_LIMITS } from '../src/storage/localDataSchema.mjs';

const account = 'ana@example';
const gate = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
const track = (id = 'A'.repeat(22)) => mapTrack({ id, type: 'track', name: 'Música çã 日本 🎵', artists: [{ id: 'C'.repeat(22), type: 'artist', name: 'Artista' }],
  album: { id: 'B'.repeat(22), type: 'album', name: 'Álbum', artists: [], images: [{ url: 'https://i.scdn.co/image/test' }], release_date: '2026-05' },
  duration_ms: 183000, track_number: 1, disc_number: 1 });
const recent = (data, term) => ({ ...data, recentSearches: [...data.recentSearches, { term, searchedAt: 10 }] });
function disk(initial = new Map(), overrides = {}) {
  const values = new Map(initial), reads = [], writes = [];
  const storage = {
    getItem: async key => { reads.push(key); return overrides.getItem ? overrides.getItem(key, values) : values.get(key) ?? null; },
    setItem: async (key, value) => { writes.push([key, value]); if (overrides.setItem) await overrides.setItem(key, value, values); else values.set(key, value); },
  };
  return { storage, values, reads, writes, repository: createLocalDataRepository(storage, { timeoutMs: 1000 }) };
}
function storeFixture(t, d = disk(), id = account) {
  const store = createLocalDataStore(d.repository, id);
  t.after(store.suspend);
  return { ...d, store, state: store.getSnapshot };
}

test('conta sem registro recebe padrão imutável sem gravar uma lista vazia', async () => {
  const d = disk();
  const data = await d.repository.load(account);
  assert.deepEqual(data, emptyLocalData());
  assert.ok(Object.isFrozen(data.preferences));
  assert.equal(d.writes.length, 0);
});

test('grava registro versionado e outro repositório restaura todos os grupos', async () => {
  const d = disk();
  const data = { ...emptyLocalData(), likedTracks: [{ track: track(), savedAt: 2 }],
    recentSearches: [{ term: 'música brasileira', searchedAt: 3 }],
    playlists: [{ id: 'local-1', name: 'Minha playlist', createdAt: 1, updatedAt: 2, tracks: [track()] }],
    followedArtists: [{ artist: mapArtist({ id: 'C'.repeat(22), type: 'artist', name: 'Artista', genres: [] }), savedAt: 4 }],
    preferences: { displayName: 'Ana', libraryView: 'list', librarySort: 'title' } };
  await d.repository.update(account, () => data);
  const record = JSON.parse(d.values.get(localDataKey(account)));
  assert.equal(record.version, 1);
  assert.equal(record.accountId, account);
  const fresh = createLocalDataRepository(d.storage);
  assert.deepEqual(await fresh.load(account), data);
});

test('chaves isolam contas com caracteres especiais e recusam identidade inválida', () => {
  assert.notEqual(localDataKey('a/b'), localDataKey('a%2Fb'));
  assert.notEqual(localDataKey('ana'), localDataKey('gui'));
  for (const id of ['', null, ' ', '\ud800']) assert.throws(() => localDataKey(id), { code: 'invalid_data' });
});

test('alterar uma conta não modifica registro ou estado de outra', async () => {
  const d = disk();
  await d.repository.update('ana', data => recent(data, 'Ana'));
  await d.repository.update('gui', data => recent(data, 'Gui'));
  assert.equal((await d.repository.load('ana')).recentSearches[0].term, 'Ana');
  assert.equal((await d.repository.load('gui')).recentSearches[0].term, 'Gui');
});

test('JSON corrompido não é apagado ou substituído nem em uma tentativa de alteração', async () => {
  const key = localDataKey(account), raw = '{quebrado';
  const d = disk(new Map([[key, raw]]));
  await assert.rejects(d.repository.load(account), { code: 'invalid_data' });
  await assert.rejects(d.repository.update(account, data => recent(data, 'novo')), { code: 'invalid_data' });
  assert.equal(d.values.get(key), raw);
  assert.equal(d.writes.length, 0);
});

test('versão desconhecida é preservada sem migração destrutiva', async () => {
  const key = localDataKey(account), raw = JSON.stringify({ version: 2, accountId: account, data: {} });
  const d = disk(new Map([[key, raw]]));
  await assert.rejects(d.repository.update(account, () => emptyLocalData()), { code: 'unsupported_version' });
  assert.equal(d.values.get(key), raw);
  assert.equal(d.writes.length, 0);
});

test('registro de outra conta e estrutura incompleta são rejeitados sem gravação', async () => {
  for (const raw of [encodeLocalData(emptyLocalData(), 'gui'), JSON.stringify({ version: 1, accountId: account, data: {} }), 'null']) {
    const d = disk(new Map([[localDataKey(account), raw]]));
    await assert.rejects(d.repository.load(account), { code: 'invalid_data' });
    assert.equal(d.writes.length, 0);
  }
});

test('falha de leitura impede alterações e preserva o conteúdo existente', async () => {
  const key = localDataKey(account), raw = encodeLocalData(recent(emptyLocalData(), 'anterior'), account);
  const d = disk(new Map([[key, raw]]), { getItem: async () => { throw new Error('private-read-detail'); } });
  await assert.rejects(d.repository.update(account, data => recent(data, 'novo')), { code: 'read' });
  assert.equal(d.values.get(key), raw);
  assert.equal(d.writes.length, 0);
});

test('gravações concorrentes leem o resultado anterior e não perdem alterações', async () => {
  const d = disk();
  await Promise.all(['primeiro', 'segundo', 'terceiro'].map(term => d.repository.update(account, data => recent(data, term))));
  assert.deepEqual((await d.repository.load(account)).recentSearches.map(item => item.term), ['primeiro', 'segundo', 'terceiro']);
  assert.equal(d.writes.length, 3);
});

test('leitura aguarda a gravação original e outra conta continua acessível', async () => {
  const pending = gate();
  const d = disk(new Map(), { setItem: async (key, raw, values) => { await pending.promise; values.set(key, raw); } });
  const save = d.repository.update(account, data => recent(data, 'salvo'));
  await tick();
  let loaded = false;
  const read = d.repository.load(account).then(value => { loaded = true; return value; });
  assert.deepEqual(await d.repository.load('gui'), emptyLocalData());
  assert.equal(loaded, false);
  pending.resolve(); await save;
  assert.equal((await read).recentSearches[0].term, 'salvo');
});

test('nenhuma alteração evita uma gravação desnecessária', async () => {
  const d = disk(); await d.repository.update(account, value => value);
  assert.equal(d.writes.length, 0);
});

test('snapshots removem campos extras e credenciais sem guardar páginas de catálogo', async () => {
  const d = disk(), value = track();
  value.accessToken = 'secret'; value.album.refreshToken = 'secret'; value.album.tracks = [{ token: 'secret' }];
  await d.repository.update(account, data => ({ ...data, likedTracks: [{ track: value, savedAt: 0 }] }));
  const raw = d.values.get(localDataKey(account));
  assert.equal(raw.includes('secret'), false);
  assert.equal(raw.includes('refreshToken'), false);
  const saved = (await d.repository.load(account)).likedTracks[0].track;
  assert.equal(saved.duration, '3:03');
  assert.equal(saved.album.releaseDate, '2026-05');
  assert.equal(saved.href, '/player?trackId=' + value.id);
});

test('preferências desconhecidas não podem sobrescrever o esquema', async () => {
  const d = disk();
  await assert.rejects(d.repository.update(account, data => ({ ...data, preferences: { ...data.preferences, token: 'secret' } })), { code: 'invalid_data' });
  assert.equal(d.writes.length, 0);
});

test('IDs, duplicatas, datas e limites inválidos são rejeitados', () => {
  const base = emptyLocalData();
  for (const data of [
    { ...base, likedTracks: [{ track: { ...track(), id: 'fake' }, savedAt: 0 }] },
    { ...base, likedTracks: [{ track: track(), savedAt: -1 }] },
    { ...base, recentSearches: [{ term: 'Rock', searchedAt: 0 }, { term: 'rock', searchedAt: 1 }] },
    { ...base, playlists: [{ id: 'p', name: 'Nome', createdAt: 10, updatedAt: 1, tracks: [] }] },
    { ...base, playlists: [{ id: 'p', name: '', createdAt: 0, updatedAt: 0, tracks: [] }] },
  ]) assert.throws(() => encodeLocalData(data, account), { code: 'invalid_data' });
  assert.throws(() => encodeLocalData({ ...base, recentSearches: Array.from({ length: 21 }, (_, i) => ({ term: String(i), searchedAt: 0 })) }, account), { code: 'too_large' });
});

test('limite em bytes considera Unicode e impede gravação grande sem apagar dados', async () => {
  const d = disk();
  await d.repository.update(account, data => recent(data, 'antes'));
  const before = d.values.get(localDataKey(account));
  const longTrack = i => ({ ...track(String(i).padStart(22, '0')), title: '🎵'.repeat(150), album: { ...track().album, image: { uri: 'https://i.scdn.co/' + 'x'.repeat(1950) } } });
  const large = { ...emptyLocalData(), likedTracks: Array.from({ length: LOCAL_DATA_LIMITS.likedTracks }, (_, i) => ({ track: longTrack(i), savedAt: i })) };
  await assert.rejects(d.repository.update(account, () => large), { code: 'too_large' });
  assert.equal(d.values.get(localDataKey(account)), before);
});

test('falha de gravação retorna mensagem segura e não publica dado não confirmado', async t => {
  const d = disk(new Map(), { setItem: async () => { throw new Error('private-native-detail'); } });
  const f = storeFixture(t, d);
  await f.store.start();
  await assert.rejects(f.store.update(data => recent(data, 'novo')), error => error instanceof LocalDataError && error.code === 'write');
  assert.equal(f.state().error.code, 'write');
  assert.equal(f.state().error.message.includes('private'), false);
  assert.deepEqual(f.state().data.recentSearches, []);
});

test('hidratação é compartilhada e alterações aguardam a restauração', async t => {
  const pending = gate(), d = disk(new Map(), { getItem: () => pending.promise });
  const f = storeFixture(t, d);
  const loading = f.store.start();
  assert.equal(f.store.start(), loading);
  await assert.rejects(f.store.update(data => data), { code: 'not_ready' });
  pending.resolve(null); await loading;
  assert.equal(f.state().status, 'ready');
});

test('fila de alterações do estado publica só valores confirmados e termina pronta', async t => {
  const f = storeFixture(t);
  await f.store.start();
  const one = f.store.update(data => recent(data, 'um')), two = f.store.update(data => recent(data, 'dois'));
  assert.equal(f.state().status, 'saving');
  await Promise.all([one, two]);
  assert.equal(f.state().status, 'ready');
  assert.deepEqual(f.state().data.recentSearches.map(item => item.term), ['um', 'dois']);
  assert.ok(Object.isFrozen(f.state().data.recentSearches[0]));
});

test('falha de gravação bloqueia alterações já enfileiradas até recarregar', async t => {
  let fail = true;
  const d = disk(new Map(), { setItem: async (key, raw, values) => { if (fail) throw new Error('disk'); values.set(key, raw); } });
  const f = storeFixture(t, d); await f.store.start();
  const results = await Promise.allSettled([f.store.update(data => recent(data, 'um')), f.store.update(data => recent(data, 'dois'))]);
  assert.deepEqual(results.map(item => item.status), ['rejected', 'rejected']);
  assert.equal(d.writes.length, 1);
  await assert.rejects(f.store.update(data => data), { code: 'not_ready' });
  fail = false; await f.store.retry();
  await f.store.update(data => recent(data, 'recuperado'));
  assert.equal(f.state().data.recentSearches[0].term, 'recuperado');
});

test('erro de leitura conserva registro e repetição manual recupera a biblioteca', async t => {
  let fail = true;
  const key = localDataKey(account), raw = encodeLocalData(recent(emptyLocalData(), 'antigo'), account);
  const d = disk(new Map([[key, raw]]), { getItem: async (key, values) => { if (fail) throw new Error('read'); return values.get(key) ?? null; } });
  const f = storeFixture(t, d); await f.store.start();
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().data, null);
  fail = false; await f.store.retry();
  assert.equal(f.state().data.recentSearches[0].term, 'antigo');
  assert.equal(d.writes.length, 0);
});

test('troca de conta ignora hidratação tardia sem mostrar dados anteriores', async t => {
  const pending = gate(), d = disk(new Map(), { getItem: key => key === localDataKey('ana') ? pending.promise : Promise.resolve(null) });
  const ana = storeFixture(t, d, 'ana'), gui = storeFixture(t, d, 'gui');
  const old = ana.store.start(); await tick(); ana.store.suspend();
  await gui.store.start();
  pending.resolve(encodeLocalData(recent(emptyLocalData(), 'privado'), 'ana')); await old;
  assert.equal(ana.state().data, null);
  assert.deepEqual(gui.state().data.recentSearches, []);
});

test('sair antes de uma alteração enfileirada impede sua gravação', async t => {
  const f = storeFixture(t); await f.store.start();
  const change = f.store.update(data => recent(data, 'cancelado'));
  f.store.suspend();
  await assert.rejects(change, { code: 'cancelled' });
  assert.equal(f.writes.length, 0);
  assert.equal(f.state().data, null);
});

test('encerrar durante gravação nativa não publica resultado na nova conta', async t => {
  const pending = gate(), d = disk(new Map(), { setItem: async (key, raw, values) => { await pending.promise; values.set(key, raw); } });
  const ana = storeFixture(t, d, 'ana'), gui = storeFixture(t, d, 'gui');
  await ana.store.start();
  const changing = ana.store.update(data => recent(data, 'Ana'));
  await tick(); ana.store.suspend(); await gui.store.start();
  pending.resolve(); await assert.rejects(changing, { code: 'cancelled' });
  assert.equal(ana.state().data, null);
  assert.deepEqual(gui.state().data.recentSearches, []);
  assert.equal((await d.repository.load('ana')).recentSearches[0].term, 'Ana');
});

test('timeout de leitura encerra a espera e a resposta tardia não dispara gravação', async () => {
  const pending = gate(), d = disk(new Map(), { getItem: () => pending.promise });
  const repo = createLocalDataRepository(d.storage, { timeoutMs: 20 });
  await assert.rejects(repo.update(account, data => recent(data, 'novo')), { code: 'timeout' });
  pending.resolve(null); await tick();
  assert.equal(d.writes.length, 0);
});

test('timeout de gravação conserva ordem nativa e exige leitura para confirmar resultado', async () => {
  const pending = gate(), d = disk(new Map(), { setItem: async (key, raw, values) => { await pending.promise; values.set(key, raw); } });
  const repo = createLocalDataRepository(d.storage, { timeoutMs: 30 });
  await assert.rejects(repo.update(account, data => recent(data, 'tardio')), { code: 'timeout' });
  const read = repo.load(account);
  await tick();
  assert.equal(d.reads.length, 1);
  pending.resolve();
  assert.equal((await read).recentSearches[0].term, 'tardio');
});

test('alteração que expira enquanto aguarda na fila nunca é executada depois', async () => {
  const pending = gate(), d = disk(new Map(), { getItem: () => pending.promise });
  const repo = createLocalDataRepository(d.storage, { timeoutMs: 20 });
  const results = await Promise.allSettled([repo.load(account), repo.update(account, data => recent(data, 'não gravar'))]);
  assert.ok(results.every(item => item.reason.code === 'timeout'));
  pending.resolve(null); await tick(); await tick();
  assert.equal(d.reads.length, 1);
  assert.equal(d.writes.length, 0);
});

test('carregamento do módulo nativo é tardio e compartilhado', async () => {
  let count = 0;
  const driver = createAsyncStorageDriver(async () => { count++; return { getItem: async () => null }; });
  assert.equal(count, 0);
  await Promise.all([driver.getItem('a'), driver.getItem('b')]);
  assert.equal(count, 1);
});

test('APK sem módulo nativo oferece erro seguro e permite nova tentativa', async () => {
  let count = 0;
  const driver = createAsyncStorageDriver(async () => { if (++count === 1) throw new Error('NativeModule AsyncStorage is null'); return { getItem: async () => null }; });
  const repo = createLocalDataRepository(driver);
  await assert.rejects(repo.load(account), { code: 'unavailable' });
  assert.deepEqual(await repo.load(account), emptyLocalData());
});

test('atualizador inválido ou assíncrono é rejeitado sem gravação', async () => {
  const d = disk();
  await assert.rejects(d.repository.update(account, null), { code: 'invalid_data' });
  await assert.rejects(d.repository.update(account, async () => { throw new Error('change'); }), { code: 'invalid_data' });
  await assert.rejects(d.repository.update(account, () => { throw new Error('change'); }), { code: 'invalid_data' });
  assert.equal(d.writes.length, 0);
});

test('reiniciar a mesma instância restaura os dados e não reaproveita um estado encerrado', async t => {
  const f = storeFixture(t); await f.store.start();
  await f.store.update(data => recent(data, 'salvo')); f.store.suspend();
  assert.equal(f.state().data, null);
  await f.store.start();
  assert.equal(f.state().status, 'ready');
  assert.equal(f.state().data.recentSearches[0].term, 'salvo');
});
