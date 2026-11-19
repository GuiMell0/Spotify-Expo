import test from 'node:test';
import assert from 'node:assert/strict';
import { listLibraryItems, changeLibraryPreference, saveLibraryPreference } from '../src/services/library.mjs';
import { emptyLocalData, encodeLocalData, decodeLocalData, localDataKey } from '../src/storage/localDataSchema.mjs';
import { createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';
import { mapTrack, mapArtist } from '../src/services/spotifyModels.mjs';
import { saveLikedTrack } from '../src/services/likedTracks.mjs';
import { saveRecentSearch } from '../src/services/recentSearches.mjs';

const track = (id = 'A', title = 'Águas') => mapTrack({ id: id.repeat(22), type: 'track', name: title, artists: [{ id: 'C'.repeat(22), name: 'Artista', type: 'artist' }] });
function seed() {
  return { ...emptyLocalData(), likedTracks: [{ track: track(), savedAt: 10 }, { track: track('B', 'Zulu'), savedAt: 30 }],
    recentSearches: [{ term: 'Brasil', searchedAt: 20 }],
    playlists: [{ id: 'local-1', name: 'Minha seleção', createdAt: 1, updatedAt: 1, tracks: [] }],
    followedArtists: [{ artist: mapArtist({ id: 'C'.repeat(22), type: 'artist', name: 'Artista', genres: [] }), savedAt: 1 }] };
}
function fixture(t, { failRead = false, failWrite = false } = {}) {
  const values = new Map([[localDataKey('ana'), encodeLocalData(seed(), 'ana')]]), writes = [];
  const storage = {
    getItem: async key => { if (failRead) throw Error('read'); return values.get(key) ?? null; },
    setItem: async (key, value) => { if (failWrite) throw Error('write'); writes.push([key, value]); values.set(key, value); },
  };
  const repository = createLocalDataRepository(storage);
  const account = (id = 'ana') => { const store = createLocalDataStore(repository, id); t.after(store.suspend); return store; };
  return { values, writes, repository, account, recover() { failRead = false; failWrite = false; } };
}

test('biblioteca vazia ou não hidratada não inventa itens', () => {
  assert.deepEqual(listLibraryItems(null), []);
  assert.deepEqual(listLibraryItems(emptyLocalData()), []);
});
test('combina músicas e buscas pela data sem alterar o registro', () => {
  const data = seed(), before = JSON.stringify(data);
  assert.deepEqual(listLibraryItems(data).map(item => item.title), ['Zulu', 'Brasil', 'Águas', 'Artista', 'Minha seleção']);
  assert.equal(JSON.stringify(data), before);
});
test('filtros retornam somente o tipo solicitado', () => {
  assert.deepEqual(listLibraryItems(seed(), { filter: 'tracks' }).map(item => item.type), ['track', 'track']);
  assert.deepEqual(listLibraryItems(seed(), { filter: 'searches' }).map(item => item.title), ['Brasil']);
});
test('ordenação por título considera acentos em português', () => {
  assert.deepEqual(listLibraryItems(seed(), { sort: 'title' }).map(item => item.title), ['Águas', 'Artista', 'Brasil', 'Minha seleção', 'Zulu']);
});
test('preferência persistida define ordem padrão e opção explícita prevalece', () => {
  const data = changeLibraryPreference(seed(), 'librarySort', 'title');
  assert.equal(listLibraryItems(data)[0].title, 'Águas');
  assert.equal(listLibraryItems(data, { sort: 'recent' })[0].title, 'Zulu');
});
test('empates são estáveis mesmo quando a entrada muda de ordem', () => {
  const data = seed(); data.likedTracks = data.likedTracks.map(item => ({ ...item, savedAt: 1, track: { ...item.track, title: 'Mesmo' } }));
  const first = listLibraryItems(data, { filter: 'tracks', sort: 'title' }).map(item => item.key);
  assert.deepEqual(listLibraryItems({ ...data, likedTracks: [...data.likedTracks].reverse() }, { filter: 'tracks', sort: 'title' }).map(item => item.key), first);
});
test('tipos distintos com título igual têm chaves e destinos independentes', () => {
  const data = { ...seed(), recentSearches: [{ term: 'Águas', searchedAt: 20 }] };
  const items = listLibraryItems(data);
  assert.equal(new Set(items.map(item => item.key)).size, 5);
  assert.equal(items.find(item => item.type === 'track').track.href.startsWith('/player?trackId='), true);
  assert.equal(items.find(item => item.type === 'search').term, 'Águas');
  assert.equal(items.find(item => item.type === 'local-playlist').playlist.id, 'local-1');
});
test('buscas antigas equivalentes não são duplicadas na biblioteca', () => {
  const data = { ...emptyLocalData(), recentSearches: [{ term: 'Rock  nacional', searchedAt: 1 }, { term: 'rock nacional', searchedAt: 2 }] };
  assert.deepEqual(listLibraryItems(data).map(item => item.title), ['rock nacional']);
});
test('rejeita filtros, ordens e preferências desconhecidas sem aceitar campos extras', () => {
  assert.throws(() => listLibraryItems(seed(), { filter: 'podcasts' }), { code: 'invalid_data' });
  assert.throws(() => listLibraryItems(seed(), { sort: 'random' }), { code: 'invalid_data' });
  for (const [key, value] of [['librarySort', 'grid'], ['libraryView', 'title'], ['displayName', 'Ana'], ['__proto__', {}]])
    assert.throws(() => changeLibraryPreference(seed(), key, value), { code: 'invalid_data' });
});
test('mudança de preferência preserva todas as coleções e o apelido', () => {
  const base = { ...seed(), preferences: { ...emptyLocalData().preferences, displayName: 'Ana' } };
  const result = changeLibraryPreference(base, 'libraryView', 'list');
  for (const key of ['likedTracks', 'recentSearches', 'playlists', 'followedArtists']) assert.equal(result[key], base[key]);
  assert.deepEqual(result.preferences, { displayName: 'Ana', libraryView: 'list', librarySort: 'recent' });
  assert.equal(base.preferences.libraryView, 'grid');
  assert.equal(changeLibraryPreference(result, 'libraryView', 'list'), result);
});
test('persistência e reabertura restauram grade/lista e ordem sem perder registros', async t => {
  const f = fixture(t), first = f.account(); await first.start();
  await saveLibraryPreference(first, 'libraryView', 'list');
  await saveLibraryPreference(first, 'librarySort', 'title');
  first.suspend();
  const restored = f.account(); await restored.start();
  assert.deepEqual(restored.getSnapshot().data.preferences, { displayName: null, libraryView: 'list', librarySort: 'title' });
  assert.equal(listLibraryItems(restored.getSnapshot().data)[0].title, 'Águas');
  assert.equal(restored.getSnapshot().data.playlists[0].name, 'Minha seleção');
  assert.equal(restored.getSnapshot().data.followedArtists.length, 1);
});
test('preferências concorrentes com curtida e histórico não sobrescrevem dados', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  await Promise.all([saveLibraryPreference(store, 'libraryView', 'list'), saveLikedTrack(store, track('D', 'Nova'), true),
    saveLibraryPreference(store, 'librarySort', 'title'), saveRecentSearch(store, 'Jazz')]);
  const saved = decodeLocalData(f.values.get(localDataKey('ana')), 'ana');
  assert.equal(saved.preferences.libraryView, 'list'); assert.equal(saved.preferences.librarySort, 'title');
  assert.equal(saved.likedTracks.length, 3); assert.equal(saved.recentSearches.length, 2);
  assert.equal(saved.playlists.length, 1); assert.equal(saved.followedArtists.length, 1);
});
test('salvar valor já ativo não grava nem muda os registros', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  await saveLibraryPreference(store, 'libraryView', 'grid');
  assert.equal(f.writes.length, 0);
});
test('falha de gravação mantém preferência confirmada e permite recarregar', async t => {
  const f = fixture(t, { failWrite: true }), store = f.account(); await store.start();
  await assert.rejects(saveLibraryPreference(store, 'libraryView', 'list'), { code: 'write' });
  assert.equal(store.getSnapshot().status, 'error'); assert.equal(store.getSnapshot().data.preferences.libraryView, 'grid');
  f.recover(); await store.retry(); await saveLibraryPreference(store, 'libraryView', 'list');
  assert.equal(store.getSnapshot().data.preferences.libraryView, 'list');
});
test('falha de leitura bloqueia preferências sem substituir o registro', async t => {
  const f = fixture(t, { failRead: true }), store = f.account(); await store.start();
  await assert.rejects(saveLibraryPreference(store, 'librarySort', 'title'), { code: 'not_ready' });
  assert.equal(f.writes.length, 0); assert.equal(store.getSnapshot().data, null);
  f.recover(); await store.retry(); assert.equal(store.getSnapshot().data.likedTracks.length, 2);
});
test('contas inativas não herdam preferências ou biblioteca de outra conta', async t => {
  const f = fixture(t), ana = f.account(), gui = f.account('gui'); await ana.start(); await gui.start();
  await saveLibraryPreference(ana, 'libraryView', 'list');
  assert.equal(gui.getSnapshot().data.preferences.libraryView, 'grid');
  assert.deepEqual(listLibraryItems(gui.getSnapshot().data), []);
  ana.suspend(); assert.equal(ana.getSnapshot().data, null);
  await assert.rejects(saveLibraryPreference(ana, 'librarySort', 'title'), { code: 'not_ready' });
});
