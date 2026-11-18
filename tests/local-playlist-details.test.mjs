import test from 'node:test';
import assert from 'node:assert/strict';
import { findLocalPlaylist, isLocalPlaylistId, localPlaylistHref, localPlaylistCover, selectLocalPlaylist } from '../src/services/localPlaylistDetails.mjs';
import { listLibraryItems } from '../src/services/library.mjs';
import { addLocalPlaylist } from '../src/services/localPlaylists.mjs';
import { emptyLocalData, encodeLocalData, localDataKey, validateLocalData } from '../src/storage/localDataSchema.mjs';
import { createLocalDataRepository } from '../src/storage/localDataRepository.mjs';
import { createLocalDataStore } from '../src/storage/localDataStore.mjs';
import { mapTrack } from '../src/services/spotifyModels.mjs';

const track = (id, image = false) => mapTrack({ id: id.repeat(22), type: 'track', name: 'Faixa ' + id, artists: [],
  album: { id: 'Z'.repeat(22), type: 'album', name: 'Álbum', artists: [], images: image ? [{ url: 'https://i.scdn.co/image/test-' + id }] : [] } });
function seed() {
  let data = addLocalPlaylist(emptyLocalData(), { id: 'local-one', name: 'Mesmo nome', createdAt: 1 });
  data = addLocalPlaylist(data, { id: 'local-two', name: 'Mesmo nome', createdAt: 2 });
  return validateLocalData({ ...data, playlists: data.playlists.map(item => item.id === 'local-one' ? { ...item, tracks: [track('A'), track('B', true)] } : item) });
}
test('dois IDs com o mesmo nome selecionam playlists distintas e suas próprias faixas', () => {
  const data = seed();
  assert.equal(findLocalPlaylist(data, 'local-one').tracks.length, 2);
  assert.equal(findLocalPlaylist(data, 'local-two').tracks.length, 0);
  assert.notEqual(findLocalPlaylist(data, 'local-one'), findLocalPlaylist(data, 'local-two'));
});
test('playlist ausente ou dados ainda não carregados não retornam outra seleção', () => {
  assert.equal(findLocalPlaylist(null, 'local-one'), null);
  assert.equal(findLocalPlaylist(seed(), 'local-absent'), null);
});
test('IDs de leitura preservam espaços internos, Unicode e o limite do schema', () => {
  for (const id of ['local-one', 'local-Águas espaço', 'local-a/b', 'x'.repeat(100)]) assert.equal(isLocalPlaylistId(id), true);
});
test('rota rejeita ID ausente, múltiplo, reservado, inválido ou não codificável', () => {
  for (const id of [null, undefined, [], ['local-one'], '', ' ', ' local-one', 'local-one ', 'new', 'x'.repeat(101), 'local-\u0000', 'local-\uD800']) {
    assert.equal(isLocalPlaylistId(id), false); assert.equal(localPlaylistHref(id), null); assert.equal(findLocalPlaylist(seed(), id), null);
  }
});
test('URL codifica o ID como um segmento e mantém namespace local separado do Spotify', () => {
  assert.equal(localPlaylistHref('local-one'), '/local-playlist/local-one');
  assert.equal(localPlaylistHref('local-Águas espaço'), '/local-playlist/local-%C3%81guas%20espa%C3%A7o');
  assert.equal(localPlaylistHref('local-a/b'), '/local-playlist/local-a%2Fb');
});
test('lookup não decodifica uma segunda vez e não confunde IDs parecidos', () => {
  const data = { ...emptyLocalData(), playlists: [{ id: 'local-a%2Fb', tracks: [] }, { id: 'local-a/b', tracks: [] }] };
  assert.equal(findLocalPlaylist(data, 'local-a%2Fb').id, 'local-a%2Fb');
  assert.equal(findLocalPlaylist(data, 'local-a/b').id, 'local-a/b');
});
test('playlist vazia ou sem imagens usa ausência explícita de capa', () => {
  assert.equal(localPlaylistCover(null), null);
  assert.equal(localPlaylistCover(findLocalPlaylist(seed(), 'local-two')), null);
  assert.equal(localPlaylistCover({ tracks: [track('A')] }), null);
});
test('capa usa a primeira imagem disponível sem inventar uma imagem para a primeira faixa', () => {
  const playlist = findLocalPlaylist(seed(), 'local-one');
  assert.equal(localPlaylistCover(playlist).uri, 'https://i.scdn.co/image/test-B');
});
test('card da Biblioteca e detalhes compartilham ID, destino e capa', () => {
  const data = seed(), card = listLibraryItems(data, { filter: 'playlists' }).find(item => item.playlist.id === 'local-one');
  assert.equal(card.href, '/local-playlist/local-one');
  assert.equal(card.image.uri, localPlaylistCover(findLocalPlaylist(data, 'local-one')).uri);
  assert.equal(card.subtitle, 'Playlist local · 2 músicas');
});
test('selecionar e alternar IDs não altera datas, ordem, faixas ou outras coleções', () => {
  const data = seed(), before = JSON.stringify(data);
  findLocalPlaylist(data, 'local-two'); localPlaylistCover(findLocalPlaylist(data, 'local-one'));
  selectLocalPlaylist({ status: 'ready', data }, 'local-one');
  assert.equal(JSON.stringify(data), before);
});
test('hidratação pendente mostra carregamento e não informa playlist inexistente', () => {
  for (const state of [null, { status: 'idle', data: null }, { status: 'loading', data: null }])
    assert.equal(selectLocalPlaylist(state, 'local-one').status, 'loading');
});
test('ID malformado é tratado sem consulta e sem espera de hidratação', () => {
  assert.equal(selectLocalPlaylist({ status: 'loading', data: null }, ['local-one', 'local-two']).status, 'invalid');
});
test('contexto desabilitado não revela nem mesmo um registro entregue indevidamente', () => {
  assert.deepEqual(selectLocalPlaylist({ status: 'disabled', data: seed() }, 'local-one'), { status: 'disabled', playlist: null });
});
test('erro de leitura sem dados é distinto de playlist não encontrada', () => {
  assert.equal(selectLocalPlaylist({ status: 'error', data: null }, 'local-one').status, 'error');
  assert.equal(selectLocalPlaylist({ status: 'ready', data: emptyLocalData() }, 'local-one').status, 'not_found');
});
test('falha de atualização preserva a playlist confirmada para consulta', () => {
  const data = seed(), selected = selectLocalPlaylist({ status: 'error', data }, 'local-one');
  assert.equal(selected.status, 'ready'); assert.equal(selected.playlist, findLocalPlaylist(data, 'local-one'));
});
test('recarregamento e gravação de outros dados não apagam os detalhes disponíveis', () => {
  for (const status of ['loading', 'saving']) assert.equal(selectLocalPlaylist({ status, data: seed() }, 'local-one').playlist.tracks.length, 2);
});
test('depois de reabrir, os detalhes refletem apenas a conta hidratada e não fazem novas gravações', async t => {
  const values = new Map([[localDataKey('ana'), encodeLocalData(seed(), 'ana')]]); let writes = 0;
  const repository = createLocalDataRepository({ getItem: async key => values.get(key) ?? null, setItem: async () => { writes++; } });
  const ana = createLocalDataStore(repository, 'ana'), gui = createLocalDataStore(repository, 'gui');
  t.after(ana.suspend); t.after(gui.suspend); await ana.start(); await gui.start();
  assert.equal(selectLocalPlaylist(ana.getSnapshot(), 'local-one').playlist.tracks.length, 2);
  assert.equal(selectLocalPlaylist(gui.getSnapshot(), 'local-one').status, 'not_found');
  assert.equal(writes, 0);
});
test('trocar para ID desconhecido não reutiliza a playlist aberta anteriormente', () => {
  const state = { status: 'ready', data: seed() };
  assert.equal(selectLocalPlaylist(state, 'local-one').status, 'ready');
  assert.deepEqual(selectLocalPlaylist(state, 'local-other'), { status: 'not_found', playlist: null });
});
