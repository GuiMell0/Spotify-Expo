import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchTerm, rememberRecentSearch, forgetRecentSearch, clearRecentSearches, listRecentSearches, saveRecentSearch, removeRecentSearch, removeAllRecentSearches } from '../src/services/recentSearches.mjs';
import { emptyLocalData, encodeLocalData, localDataKey } from '../src/storage/localDataSchema.mjs';
import { createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';
import { saveLikedTrack } from '../src/services/likedTracks.mjs';
import { mapTrack } from '../src/services/spotifyModels.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));
const gate = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
function fixture(t, { initial = new Map(), getItem, setItem } = {}) {
  const values = new Map(initial), writes = [];
  const storage = {
    getItem: async key => getItem ? getItem(key, values) : values.get(key) ?? null,
    setItem: async (key, value) => { writes.push([key, value]); if (setItem) await setItem(key, value, values); else values.set(key, value); },
  };
  const repository = createLocalDataRepository(storage);
  function account(name = 'ana') { const store = createLocalDataStore(repository, name); t.after(store.suspend); return store; }
  return { values, writes, repository, account };
}

test('normaliza espaços preservando acentos, caixa e caracteres da pesquisa', () => {
  assert.equal(normalizeSearchTerm('  Música   brasileira & rock  '), 'Música brasileira & rock');
  assert.equal(normalizeSearchTerm('日本  🎵 /? #'), '日本 🎵 /? #');
});

test('adiciona termo e data sem alterar a entrada nem os outros grupos', () => {
  const base = emptyLocalData();
  const result = rememberRecentSearch(base, 'rock', 10);
  assert.deepEqual(result.recentSearches, [{ term: 'rock', searchedAt: 10 }]);
  assert.deepEqual(base.recentSearches, []);
  assert.equal(result.likedTracks, base.likedTracks);
  assert.equal(result.playlists, base.playlists);
  assert.equal(result.followedArtists, base.followedArtists);
  assert.equal(result.preferences, base.preferences);
});

test('reutilizar termo move para o topo sem duplicata e atualiza a grafia e data', () => {
  let data = rememberRecentSearch(emptyLocalData(), 'Música brasileira', 1);
  data = rememberRecentSearch(data, 'Jazz', 2);
  data = rememberRecentSearch(data, '  MÚSICA   brasileira  ', 3);
  assert.deepEqual(data.recentSearches.map(item => item.term), ['MÚSICA brasileira', 'Jazz']);
  assert.equal(data.recentSearches[0].searchedAt, 3);
});

test('termos equivalentes de registros antigos são unificados na listagem e nova gravação', () => {
  const data = { ...emptyLocalData(), recentSearches: [{ term: 'Rock  nacional', searchedAt: 1 }, { term: 'rock nacional', searchedAt: 2 }] };
  assert.deepEqual(listRecentSearches(data).map(item => item.term), ['rock nacional']);
  assert.equal(rememberRecentSearch(data, 'jazz', 3).recentSearches.length, 2);
});

test('limite mantém os vinte termos mais recentes e descarta o mais antigo', () => {
  let data = emptyLocalData();
  for (let i = 1; i <= 21; i++) data = rememberRecentSearch(data, 'termo ' + i, i);
  assert.equal(data.recentSearches.length, 20);
  assert.equal(data.recentSearches[0].term, 'termo 21');
  assert.equal(data.recentSearches.at(-1).term, 'termo 2');
});

test('termos vazios e remoção inexistente não alteram o registro', () => {
  const data = emptyLocalData();
  assert.equal(rememberRecentSearch(data, '   '), data);
  assert.equal(forgetRecentSearch(data, 'inexistente'), data);
  assert.equal(forgetRecentSearch(data, ' '), data);
  assert.equal(clearRecentSearches(data), data);
});

test('tipo, comprimento e data inválidos são rejeitados antes de gravar', () => {
  for (const value of [null, 42, 'x'.repeat(151)]) assert.throws(() => normalizeSearchTerm(value), { code: 'invalid_data' });
  for (const date of [-1, NaN, 1.5]) assert.throws(() => rememberRecentSearch(emptyLocalData(), 'rock', date), { code: 'invalid_data' });
});

test('remoção usa termo normalizado sem apagar pesquisas diferentes', () => {
  let data = rememberRecentSearch(emptyLocalData(), 'Rock nacional', 1);
  data = rememberRecentSearch(data, 'Jazz', 2);
  const result = forgetRecentSearch(data, ' ROCK   nacional ');
  assert.deepEqual(result.recentSearches.map(item => item.term), ['Jazz']);
  assert.equal(data.recentSearches.length, 2);
});

test('limpar afeta somente o histórico e preserva favoritas e preferências', () => {
  const base = { ...emptyLocalData(), likedTracks: [{ track: { id: 'placeholder' }, savedAt: 1 }], preferences: { displayName: 'Ana', libraryView: 'list', librarySort: 'title' } };
  const data = rememberRecentSearch(base, 'rock', 1), result = clearRecentSearches(data);
  assert.deepEqual(result.recentSearches, []);
  assert.equal(result.likedTracks, data.likedTracks);
  assert.equal(result.preferences, data.preferences);
  assert.equal(data.recentSearches.length, 1);
});

test('listagem ordena sem modificar o array persistido e aceita dados não carregados', () => {
  const data = { ...emptyLocalData(), recentSearches: [{ term: 'antigo', searchedAt: 1 }, { term: 'novo', searchedAt: 2 }] };
  assert.deepEqual(listRecentSearches(data).map(item => item.term), ['novo', 'antigo']);
  assert.equal(data.recentSearches[0].term, 'antigo');
  assert.deepEqual(listRecentSearches(null), []);
});

test('histórico e remoções persistem depois de encerrar e reabrir', async t => {
  const f = fixture(t), first = f.account(); await first.start();
  await saveRecentSearch(first, 'Rock', { now: () => 1 });
  await saveRecentSearch(first, 'Jazz', { now: () => 2 });
  first.suspend();
  const restored = f.account(); await restored.start();
  assert.deepEqual(listRecentSearches(restored.getSnapshot().data).map(item => item.term), ['Jazz', 'Rock']);
  await removeRecentSearch(restored, 'rock'); restored.suspend();
  const again = f.account(); await again.start();
  assert.deepEqual(again.getSnapshot().data.recentSearches.map(item => item.term), ['Jazz']);
  await removeAllRecentSearches(again); again.suspend();
  const empty = f.account(); await empty.start();
  assert.deepEqual(empty.getSnapshot().data.recentSearches, []);
});

test('gravações concorrentes preservam termos únicos e o limite', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  await Promise.all(Array.from({ length: 22 }, (_, i) => saveRecentSearch(store, 'termo ' + i, { now: () => i })));
  await saveRecentSearch(store, ' TERMO  21 ', { now: () => 50 });
  const entries = store.getSnapshot().data.recentSearches;
  assert.equal(entries.length, 20);
  assert.equal(entries[0].term, 'TERMO 21');
  assert.equal(new Set(entries.map(item => item.term.toLowerCase())).size, 20);
});

test('curtida e histórico simultâneos preservam ambos os grupos', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  const track = mapTrack({ id: 'A'.repeat(22), type: 'track', name: 'Música', artists: [] });
  await Promise.all([saveRecentSearch(store, 'Música'), saveLikedTrack(store, track, true)]);
  assert.equal(store.getSnapshot().data.recentSearches.length, 1);
  assert.equal(store.getSnapshot().data.likedTracks.length, 1);
  await removeAllRecentSearches(store);
  assert.equal(store.getSnapshot().data.likedTracks.length, 1);
});

test('contas têm históricos separados e reentrada recupera os próprios termos', async t => {
  const f = fixture(t), ana = f.account('ana'), gui = f.account('gui'); await ana.start(); await gui.start();
  await saveRecentSearch(ana, 'Ana'); await saveRecentSearch(gui, 'Gui'); ana.suspend();
  const again = f.account('ana'); await again.start();
  assert.equal(again.getSnapshot().data.recentSearches[0].term, 'Ana');
  assert.equal(gui.getSnapshot().data.recentSearches[0].term, 'Gui');
});

test('falha de leitura e registro inválido ou futuro não são substituídos pelo histórico', async t => {
  for (const raw of ['{broken', JSON.stringify({ version: 2, accountId: 'ana', data: {} })]) {
    const f = fixture(t, { initial: new Map([[localDataKey('ana'), raw]]) }), store = f.account();
    await store.start(); await assert.rejects(saveRecentSearch(store, 'novo'), { code: 'not_ready' });
    assert.equal(f.values.get(localDataKey('ana')), raw); assert.equal(f.writes.length, 0);
  }
  const f = fixture(t, { getItem: async () => { throw Error('private-read'); } }), store = f.account();
  await store.start(); await assert.rejects(saveRecentSearch(store, 'novo'), { code: 'not_ready' });
  assert.equal(f.writes.length, 0);
});

test('falha de limpeza conserva o histórico confirmado e recupera manualmente', async t => {
  let fail = true;
  const saved = encodeLocalData(rememberRecentSearch(emptyLocalData(), 'mantido', 1), 'ana');
  const f = fixture(t, { initial: new Map([[localDataKey('ana'), saved]]), setItem: async (key, value, values) => { if (fail) throw Error('private-write'); values.set(key, value); } });
  const store = f.account(); await store.start();
  await assert.rejects(removeAllRecentSearches(store), { code: 'write' });
  assert.equal(store.getSnapshot().data.recentSearches[0].term, 'mantido');
  assert.equal(f.values.get(localDataKey('ana')), saved);
  fail = false; await store.retry(); await removeAllRecentSearches(store);
  assert.deepEqual(store.getSnapshot().data.recentSearches, []);
});

test('remoção pendente conserva o termo até receber confirmação da gravação', async t => {
  const pending = gate(), saved = encodeLocalData(rememberRecentSearch(emptyLocalData(), 'mantido', 1), 'ana');
  const f = fixture(t, { initial: new Map([[localDataKey('ana'), saved]]), setItem: async (key, value, values) => { await pending.promise; values.set(key, value); } });
  const store = f.account(); await store.start();
  const change = removeRecentSearch(store, 'mantido'); await tick();
  assert.equal(store.getSnapshot().data.recentSearches.length, 1);
  pending.resolve(); await change;
  assert.equal(store.getSnapshot().data.recentSearches.length, 0);
});

test('encerrar conta antes da alteração enfileirada impede gravação atrasada', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  const change = saveRecentSearch(store, 'não gravar'); store.suspend();
  await assert.rejects(change, { code: 'cancelled' });
  assert.equal(f.writes.length, 0);
});
