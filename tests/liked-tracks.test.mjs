import test from 'node:test';
import assert from 'node:assert/strict';
import { changeLikedTrack, listLikedTracks, saveLikedTrack } from '../src/services/likedTracks.mjs';
import { mapTrack } from '../src/services/spotifyModels.mjs';
import { emptyLocalData, encodeLocalData, localDataKey, LOCAL_DATA_LIMITS } from '../src/storage/localDataSchema.mjs';
import { createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';

const id = value => String(value).padStart(22, '0');
const track = value => mapTrack({ id: id(value), type: 'track', name: 'Música ' + value, artists: [{ id: 'C'.repeat(22), type: 'artist', name: 'Artista' }],
  album: { id: 'A'.repeat(22), type: 'album', name: 'Álbum', artists: [], images: [{ url: 'https://i.scdn.co/image/test' }], release_date: '2026-05' }, duration_ms: 183000 });
const tick = () => new Promise(resolve => setImmediate(resolve));
const gate = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
function fixture(t, { initial = new Map(), getItem, setItem } = {}) {
  const values = new Map(initial), writes = [];
  const storage = {
    getItem: async key => getItem ? getItem(key, values) : values.get(key) ?? null,
    setItem: async (key, value) => { writes.push([key, value]); if (setItem) await setItem(key, value, values); else values.set(key, value); },
  };
  const repository = createLocalDataRepository(storage);
  function account(name = 'ana') {
    const store = createLocalDataStore(repository, name);
    t.after(store.suspend);
    return store;
  }
  return { values, writes, repository, storage, account };
}

test('curtida guarda snapshot real, data e rotas canônicas sem credenciais ou páginas', () => {
  const value = track(1);
  value.accessToken = 'private-token'; value.href = 'https://invalid.example';
  value.album.tracks = [{ secret: 'private-token' }];
  const data = changeLikedTrack(emptyLocalData(), value, true, 100);
  assert.equal(data.likedTracks[0].savedAt, 100);
  assert.equal(data.likedTracks[0].track.href, '/player?trackId=' + value.id);
  assert.equal(JSON.stringify(data).includes('private-token'), false);
  assert.equal(value.href, 'https://invalid.example');
});

test('curtir novamente o mesmo ID conserva uma entrada, a data e o snapshot inicial', () => {
  const data = changeLikedTrack(emptyLocalData(), track(1), true, 10);
  const again = changeLikedTrack(data, { ...track(1), title: 'Outro título' }, true, 20);
  assert.equal(again, data);
  assert.equal(again.likedTracks.length, 1);
  assert.equal(again.likedTracks[0].savedAt, 10);
});

test('descurtir remove somente a faixa solicitada e faixa ausente não altera nada', () => {
  const first = changeLikedTrack(emptyLocalData(), track(1), true, 10);
  const two = changeLikedTrack(first, track(2), true, 20);
  const result = changeLikedTrack(two, track(1), false);
  assert.deepEqual(result.likedTracks.map(item => item.track.id), [id(2)]);
  assert.equal(changeLikedTrack(result, track(1), false), result);
  assert.equal(two.likedTracks.length, 2);
});

test('alteração preserva recentes, playlists, artistas e preferências existentes', () => {
  const base = emptyLocalData();
  const data = { ...base, recentSearches: [{ term: 'rock', searchedAt: 1 }], preferences: { ...base.preferences, displayName: 'Ana' } };
  const result = changeLikedTrack(data, track(1), true, 20);
  assert.equal(result.recentSearches, data.recentSearches);
  assert.equal(result.playlists, data.playlists);
  assert.equal(result.followedArtists, data.followedArtists);
  assert.equal(result.preferences, data.preferences);
  assert.equal(data.likedTracks.length, 0);
});

test('lista mostra curtidas mais recentes primeiro sem modificar o registro recebido', () => {
  const data = { ...emptyLocalData(), likedTracks: [{ track: track(1), savedAt: 10 }, { track: track(2), savedAt: 20 }] };
  assert.deepEqual(listLikedTracks(data).map(item => item.track.id), [id(2), id(1)]);
  assert.equal(data.likedTracks[0].track.id, id(1));
  assert.deepEqual(listLikedTracks(null), []);
});

test('ID fictício, tipo errado, intenção inválida e data inválida são rejeitados', () => {
  const base = emptyLocalData();
  for (const [value, liked, time] of [[{ ...track(1), id: 'fake' }, true, 1], [{ ...track(1), type: 'album' }, true, 1], [track(1), 'yes', 1], [track(1), true, -1]]) {
    assert.throws(() => changeLikedTrack(base, value, liked, time), { code: 'invalid_data' });
  }
  assert.deepEqual(base.likedTracks, []);
});

test('limite de curtidas mantém itens existentes e continua permitindo remoção', () => {
  const data = { ...emptyLocalData(), likedTracks: Array.from({ length: LOCAL_DATA_LIMITS.likedTracks }, (_, i) => ({ track: track(i), savedAt: i })) };
  assert.throws(() => changeLikedTrack(data, track(501), true), { code: 'too_large' });
  assert.equal(changeLikedTrack(data, track(1), true), data);
  assert.equal(changeLikedTrack(data, track(1), false).likedTracks.length, LOCAL_DATA_LIMITS.likedTracks - 1);
});

test('metadados simplificados sem capa, álbum ou duração continuam utilizáveis', () => {
  const simple = mapTrack({ id: id(1), type: 'track', name: 'Sem campos opcionais', artists: [] });
  const saved = changeLikedTrack(emptyLocalData(), simple, true, 0).likedTracks[0].track;
  assert.equal(saved.album, null);
  assert.equal(saved.image, null);
  assert.equal(saved.duration, null);
  assert.equal(saved.artist, 'Artista não informado');
});

test('curtir e descurtir persistem após encerrar e criar outra instância', async t => {
  const f = fixture(t), first = f.account();
  await first.start(); await saveLikedTrack(first, track(1), true, { now: () => 10 }); await saveLikedTrack(first, track(2), true, { now: () => 20 });
  first.suspend();
  const restored = f.account(); await restored.start();
  assert.deepEqual(listLikedTracks(restored.getSnapshot().data).map(item => item.track.id), [id(2), id(1)]);
  await saveLikedTrack(restored, track(1), false); restored.suspend();
  const again = f.account(); await again.start();
  assert.deepEqual(again.getSnapshot().data.likedTracks.map(item => item.track.id), [id(2)]);
});

test('ações concorrentes preservam faixas e pedidos repetidos não gravam duplicatas', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  await Promise.all([saveLikedTrack(store, track(1), true), saveLikedTrack(store, track(2), true), saveLikedTrack(store, track(1), true)]);
  assert.equal(store.getSnapshot().data.likedTracks.length, 2);
  assert.equal(f.writes.length, 2);
  await Promise.all([saveLikedTrack(store, track(1), false), saveLikedTrack(store, track(1), true, { now: () => 30 })]);
  assert.equal(store.getSnapshot().data.likedTracks.length, 2);
  assert.equal(store.getSnapshot().data.likedTracks.find(item => item.track.id === id(1)).savedAt, 30);
});

test('falha de leitura antes de curtir conserva dados e não cria biblioteca vazia', async t => {
  let fail = false;
  const f = fixture(t, { getItem: async (key, values) => { if (fail) throw Error('private-read'); return values.get(key) ?? null; } });
  const store = f.account(); await store.start(); await saveLikedTrack(store, track(1), true);
  const previous = f.values.get(localDataKey('ana')); fail = true;
  await assert.rejects(saveLikedTrack(store, track(2), true), { code: 'read' });
  assert.equal(store.getSnapshot().data.likedTracks.length, 1);
  assert.equal(f.values.get(localDataKey('ana')), previous);
  assert.equal(f.writes.length, 1);
});

test('falha de gravação não marca coração como salvo e permite recuperar antes de repetir', async t => {
  let fail = true;
  const f = fixture(t, { setItem: async (key, value, values) => { if (fail) throw Error('private-write'); values.set(key, value); } });
  const store = f.account(); await store.start();
  await assert.rejects(saveLikedTrack(store, track(1), true), { code: 'write' });
  assert.equal(store.getSnapshot().data.likedTracks.length, 0);
  assert.equal(store.getSnapshot().status, 'error');
  fail = false; await store.retry(); await saveLikedTrack(store, track(1), true);
  assert.equal(store.getSnapshot().data.likedTracks.length, 1);
});

test('favoritas ficam isoladas por conta e voltam ao reentrar na conta original', async t => {
  const f = fixture(t), ana = f.account('ana'), gui = f.account('gui');
  await ana.start(); await gui.start();
  await saveLikedTrack(ana, track(1), true); await saveLikedTrack(gui, track(2), true);
  ana.suspend();
  const again = f.account('ana'); await again.start();
  assert.deepEqual(again.getSnapshot().data.likedTracks.map(item => item.track.id), [id(1)]);
  assert.deepEqual(gui.getSnapshot().data.likedTracks.map(item => item.track.id), [id(2)]);
});

test('sair antes de uma curtida enfileirada impede a gravação na conta antiga', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  const change = saveLikedTrack(store, track(1), true); store.suspend();
  await assert.rejects(change, { code: 'cancelled' });
  assert.equal(f.writes.length, 0);
});

test('registro corrompido ou versão futura nunca é substituído por curtidas novas', async t => {
  for (const raw of ['{broken', JSON.stringify({ version: 2, accountId: 'ana', data: {} })]) {
    const f = fixture(t, { initial: new Map([[localDataKey('ana'), raw]]) }), store = f.account();
    await store.start();
    await assert.rejects(saveLikedTrack(store, track(1), true), { code: 'not_ready' });
    assert.equal(f.values.get(localDataKey('ana')), raw);
    assert.equal(f.writes.length, 0);
  }
});

test('remoção lenta conserva último estado confirmado até terminar a gravação', async t => {
  const pending = gate();
  const saved = encodeLocalData(changeLikedTrack(emptyLocalData(), track(1), true, 1), 'ana');
  const f = fixture(t, { initial: new Map([[localDataKey('ana'), saved]]), setItem: async (key, value, values) => { await pending.promise; values.set(key, value); } });
  const store = f.account(); await store.start();
  const removal = saveLikedTrack(store, track(1), false); await tick();
  assert.equal(store.getSnapshot().status, 'saving');
  assert.equal(store.getSnapshot().data.likedTracks.length, 1);
  pending.resolve(); await removal;
  assert.equal(store.getSnapshot().data.likedTracks.length, 0);
});
