import test from 'node:test';
import assert from 'node:assert/strict';
import { addLocalPlaylist, createLocalPlaylist, listLocalPlaylists, normalizePlaylistName } from '../src/services/localPlaylists.mjs';
import { emptyLocalData, encodeLocalData, decodeLocalData, localDataKey } from '../src/storage/localDataSchema.mjs';
import { createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';
import { saveLikedTrack } from '../src/services/likedTracks.mjs';
import { saveRecentSearch } from '../src/services/recentSearches.mjs';
import { saveLibraryPreference, listLibraryItems } from '../src/services/library.mjs';
import { mapTrack } from '../src/services/spotifyModels.mjs';

const input = (id = 'local-one', name = 'Para estudar', createdAt = 1) => ({ id, name, createdAt });
const tick = () => new Promise(resolve => setImmediate(resolve));
const gate = () => { let resolve; const promise = new Promise(yes => { resolve = yes; }); return { promise, resolve }; };
function fixture(t, { data = emptyLocalData(), timeoutMs = 5000, beforeWrite } = {}) {
  const values = new Map([[localDataKey('ana'), encodeLocalData(data, 'ana')]]), writes = [];
  const flags = { failRead: false, failWrite: false, writeThenFail: false };
  const repository = createLocalDataRepository({
    getItem: async key => { if (flags.failRead) throw Error('private-read'); return values.get(key) ?? null; },
    setItem: async (key, raw) => {
      writes.push([key, raw]); if (beforeWrite) await beforeWrite();
      if (flags.failWrite) throw Error('private-write');
      values.set(key, raw); if (flags.writeThenFail) throw Error('unconfirmed-write');
    },
  }, { timeoutMs });
  function account(id = 'ana') { const store = createLocalDataStore(repository, id); t.after(store.suspend); return store; }
  return { values, writes, flags, account, saved(id = 'ana') { return decodeLocalData(values.get(localDataKey(id)) ?? null, id); } };
}
test('nome normaliza espaços sem perder acentos, símbolos e emoji', () => {
  assert.equal(normalizePlaylistName('  Águas  &   Rock 🎵  '), 'Águas & Rock 🎵');
});
test('nome vazio, inválido ou longo é recusado e oitenta caracteres são aceitos', () => {
  for (const value of ['', '   ', null, 123, 'x'.repeat(81), 'a\u0000b']) assert.throws(() => normalizePlaylistName(value), { code: 'invalid_name' });
  assert.equal(normalizePlaylistName('x'.repeat(80)).length, 80);
});
test('cria playlist vazia com datas coerentes sem mudar entrada ou outros grupos', () => {
  const base = emptyLocalData(), result = addLocalPlaylist(base, input());
  assert.deepEqual(result.playlists, [{ id: 'local-one', name: 'Para estudar', createdAt: 1, updatedAt: 1, tracks: [] }]);
  assert.deepEqual(base.playlists, []);
  for (const key of ['likedTracks', 'recentSearches', 'followedArtists', 'preferences']) assert.equal(result[key], base[key]);
});
test('nomes iguais são permitidos em playlists com IDs diferentes', () => {
  const data = addLocalPlaylist(addLocalPlaylist(emptyLocalData(), input()), input('local-two'));
  assert.equal(data.playlists.length, 2);
  assert.notEqual(data.playlists[0].id, data.playlists[1].id);
});
test('IDs inseguros e datas inválidas não entram na base', () => {
  for (const id of ['', '../playlist', 'local-a/b', 'spotify:playlist:a', 'local-' + 'x'.repeat(91)])
    assert.throws(() => addLocalPlaylist(emptyLocalData(), input(id)), { code: 'invalid_data' });
  for (const date of [-1, NaN, 1.5]) assert.throws(() => addLocalPlaylist(emptyLocalData(), input('local-one', 'Nome', date)), { code: 'invalid_data' });
});
test('repetir exatamente a tentativa é idempotente', () => {
  const data = addLocalPlaylist(emptyLocalData(), input());
  assert.equal(addLocalPlaylist(data, input()), data);
});
test('ID já usado com nome ou data diferentes não sobrescreve playlist existente', () => {
  const data = addLocalPlaylist(emptyLocalData(), input());
  assert.throws(() => addLocalPlaylist(data, input('local-one', 'Outro')), { code: 'id_conflict' });
  assert.throws(() => addLocalPlaylist(data, input('local-one', 'Para estudar', 2)), { code: 'id_conflict' });
  assert.equal(data.playlists[0].name, 'Para estudar');
});
test('limite permite cinquenta playlists e rejeita a seguinte sem apagar nenhuma', () => {
  let data = emptyLocalData();
  for (let i = 0; i < 50; i++) data = addLocalPlaylist(data, input('local-' + i));
  assert.equal(data.playlists.length, 50);
  assert.throws(() => addLocalPlaylist(data, input('local-extra')), { code: 'playlist_limit' });
  assert.equal(addLocalPlaylist(data, input('local-0')), data);
});
test('listagem ordena por atualização, resolve empate por ID e não modifica entrada', () => {
  const data = { ...emptyLocalData(), playlists: [
    { ...input('local-b'), updatedAt: 3, tracks: [] },
    { ...input('local-a'), updatedAt: 3, tracks: [] },
    { ...input('local-c'), updatedAt: 2, tracks: [] },
  ] };
  assert.deepEqual(listLocalPlaylists(data).map(item => item.id), ['local-a', 'local-b', 'local-c']);
  assert.equal(data.playlists[0].id, 'local-b'); assert.deepEqual(listLocalPlaylists(null), []);
});
test('biblioteca inclui resumo local e filtro exclusivo sem confundir com Spotify', () => {
  const data = addLocalPlaylist(emptyLocalData(), input());
  const [item] = listLibraryItems(data, { filter: 'playlists' });
  assert.equal(item.type, 'local-playlist'); assert.equal(item.key, 'local-playlist:local-one');
  assert.equal(item.title, 'Para estudar'); assert.equal(item.subtitle, 'Playlist local · 0 músicas');
  assert.equal(item.href, '/local-playlist/local-one');
  assert.deepEqual(listLibraryItems(data, { filter: 'tracks' }), []);
  assert.deepEqual(listLibraryItems(data, { filter: 'searches' }), []);
});
test('duas playlists sobrevivem ao encerramento e à reabertura', async t => {
  const f = fixture(t), first = f.account(); await first.start();
  await createLocalPlaylist(first, input()); await createLocalPlaylist(first, input('local-two', 'Viagem', 2)); first.suspend();
  const restored = f.account(); await restored.start();
  assert.deepEqual(listLocalPlaylists(restored.getSnapshot().data).map(item => item.name), ['Viagem', 'Para estudar']);
});
test('criações concorrentes preservam curtidas, recentes e preferências', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  const track = mapTrack({ id: 'A'.repeat(22), name: 'Faixa', type: 'track', artists: [] });
  await Promise.all([createLocalPlaylist(store, input()), createLocalPlaylist(store, input('local-two')),
    saveLikedTrack(store, track, true), saveRecentSearch(store, 'Jazz'), saveLibraryPreference(store, 'libraryView', 'list')]);
  assert.equal(f.saved().playlists.length, 2); assert.equal(f.saved().likedTracks.length, 1);
  assert.equal(f.saved().recentSearches.length, 1); assert.equal(f.saved().preferences.libraryView, 'list');
});
test('toques repetidos com a mesma tentativa geram somente uma gravação', async t => {
  const f = fixture(t), store = f.account(); await store.start();
  await Promise.all([createLocalPlaylist(store, input()), createLocalPlaylist(store, input())]);
  assert.equal(f.saved().playlists.length, 1); assert.equal(f.writes.length, 1);
});
test('falha de leitura bloqueia criação e preserva o registro anterior', async t => {
  const f = fixture(t, { data: addLocalPlaylist(emptyLocalData(), input()) });
  f.flags.failRead = true; const store = f.account(); await store.start();
  await assert.rejects(createLocalPlaylist(store, input('local-two')), { code: 'not_ready' });
  assert.equal(f.writes.length, 0);
  f.flags.failRead = false; await store.retry(); assert.equal(store.getSnapshot().data.playlists.length, 1);
});
test('falha de gravação conserva a lista e permite repetir a tentativa após leitura', async t => {
  const f = fixture(t), store = f.account(); await store.start(); f.flags.failWrite = true;
  await assert.rejects(createLocalPlaylist(store, input()), { code: 'write' });
  assert.equal(store.getSnapshot().data.playlists.length, 0); assert.equal(store.getSnapshot().status, 'error');
  f.flags.failWrite = false; await store.retry(); await createLocalPlaylist(store, input());
  assert.equal(f.saved().playlists.length, 1);
});
test('gravação concluída com erro de confirmação não duplica após recuperação', async t => {
  const f = fixture(t), store = f.account(); await store.start(); f.flags.writeThenFail = true;
  await assert.rejects(createLocalPlaylist(store, input()), { code: 'write' });
  assert.equal(store.getSnapshot().data.playlists.length, 0); assert.equal(f.saved().playlists.length, 1);
  f.flags.writeThenFail = false; await store.retry(); await createLocalPlaylist(store, input());
  assert.equal(store.getSnapshot().data.playlists.length, 1); assert.equal(f.writes.length, 1);
});
test('timeout seguido de conclusão nativa e nova leitura não cria duplicata', async t => {
  const pending = gate(), f = fixture(t, { timeoutMs: 30, beforeWrite: () => pending.promise });
  const store = f.account(); await store.start();
  await assert.rejects(createLocalPlaylist(store, input()), { code: 'timeout' });
  const restoring = store.retry(); pending.resolve(); await restoring;
  await createLocalPlaylist(store, input());
  assert.equal(f.saved().playlists.length, 1); assert.equal(f.writes.length, 1);
});
test('contas distintas mantêm playlists separadas', async t => {
  const f = fixture(t), ana = f.account(), gui = f.account('gui'); await ana.start(); await gui.start();
  await createLocalPlaylist(ana, input()); await createLocalPlaylist(gui, input('local-gui', 'Gui'));
  assert.deepEqual(listLocalPlaylists(ana.getSnapshot().data).map(item => item.name), ['Para estudar']);
  assert.deepEqual(listLocalPlaylists(gui.getSnapshot().data).map(item => item.name), ['Gui']);
});
test('sair durante operação pendente impede publicação dos dados na conta encerrada', async t => {
  const pending = gate(), f = fixture(t, { beforeWrite: () => pending.promise }), store = f.account(); await store.start();
  const creating = createLocalPlaylist(store, input()); await tick(); store.suspend(); pending.resolve();
  await assert.rejects(creating, { code: 'cancelled' }); assert.equal(store.getSnapshot().data, null);
  const other = f.account('gui'); await other.start(); assert.deepEqual(other.getSnapshot().data.playlists, []);
});
test('duas criações na última vaga não excedem o limite nem descartam a primeira', async t => {
  let data = emptyLocalData(); for (let i = 0; i < 49; i++) data = addLocalPlaylist(data, input('local-' + i));
  const f = fixture(t, { data }), store = f.account(); await store.start();
  const result = await Promise.allSettled([createLocalPlaylist(store, input('local-a')), createLocalPlaylist(store, input('local-b'))]);
  assert.equal(result[0].status, 'fulfilled'); assert.equal(result[1].status, 'rejected'); assert.equal(result[1].reason.code, 'playlist_limit');
  assert.equal(f.saved().playlists.length, 50); assert.equal(f.saved().playlists.some(item => item.id === 'local-a'), true);
});
