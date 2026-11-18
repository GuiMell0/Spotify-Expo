import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifyCatalog } from '../src/services/spotifyCatalog.mjs';
import { createSpotifyApiClient } from '../src/services/spotifyApi.mjs';
import { SpotifyApiError } from '../src/services/spotifyErrors.mjs';
import { imageSource, mapAlbum, mapArtist, mapPlaylist, mapPlaylistTrack, mapTrack } from '../src/services/spotifyModels.mjs';

const id = 'A'.repeat(22), secondId = 'B'.repeat(22), artistId = 'C'.repeat(22);
const artist = { id: artistId, type: 'artist', name: 'Artista de teste' };
const album = { id, type: 'album', name: 'Álbum de teste', artists: [artist], images: [{ url: 'https://i.scdn.co/image/synthetic' }], total_tracks: 2, release_date: '2026', release_date_precision: 'year' };
const track = { id: secondId, type: 'track', name: 'Faixa de teste', artists: [artist], duration_ms: 193000, album };
const playlist = { id, type: 'playlist', name: 'Minha playlist', owner: { id: 'username', display_name: 'Pessoa' } };
const page = (items = [], extra = {}) => ({ items, offset: 0, limit: 20, total: items.length, next: null, ...extra });
const fixture = handler => {
  const calls = [];
  const catalog = createSpotifyCatalog({ get: async (endpoint, options) => { calls.push({ endpoint, options }); return handler(endpoint, options, calls.length); } });
  return { catalog, calls };
};

test('normaliza nomes, identidade, links e capas sem alterar resposta original', () => {
  const original = structuredClone(album);
  const model = mapAlbum(album);
  assert.equal(model.id, id);
  assert.equal(model.title, 'Álbum de teste');
  assert.equal(model.href, '/album/' + id);
  assert.equal(model.uri, 'spotify:album:' + id);
  assert.equal(model.spotifyUrl, 'https://open.spotify.com/album/' + id);
  assert.equal(model.artistId, artistId);
  assert.equal(model.releaseDate, '2026');
  assert.deepEqual(album, original);
});
test('campos opcionais não viram contagens, duração ou disponibilidade inventadas', () => {
  const model = mapTrack({ id: secondId, name: null });
  assert.equal(model.title, 'Faixa sem nome');
  assert.equal(model.duration, null);
  assert.equal(model.durationMs, null);
  assert.equal(model.image, null);
  assert.equal(model.isPlayable, null);
  assert.equal(mapArtist(artist).followers, null);
  assert.equal(mapAlbum({ id }).totalTracks, null);
});
test('créditos com nome e sem ID são preservados sem criar rota falsa', () => {
  const model = mapAlbum({ ...album, artists: [{ name: 'Crédito sem ID' }, artist] });
  assert.equal(model.artist, 'Crédito sem ID, Artista de teste');
  assert.equal(model.artists[0].href, null);
  assert.equal(model.artistId, artistId);
});
test('duração e restrição de faixa preservam os valores informados', () => {
  const model = mapTrack({ ...track, is_playable: false, restrictions: { reason: 'market' }, explicit: true });
  assert.equal(model.duration, '3:13');
  assert.equal(model.isPlayable, false);
  assert.equal(model.restriction, 'market');
  assert.equal(model.explicit, true);
  assert.equal(mapTrack({ ...track, duration_ms: 0 }).duration, '0:00');
});
test('capa aceita HTTPS sem credenciais e não usa imagem de outro catálogo', () => {
  assert.equal(imageSource([{ url: 'http://invalid/image' }, { url: 'https://user:pass@invalid/image' }]), null);
  assert.deepEqual(imageSource([null, { url: 'https://images.test/cover' }]), { uri: 'https://images.test/cover' });
  assert.equal(mapPlaylist(playlist).image, null);
});
test('itens nulos, locais, episódios e IDs fictícios não viram faixas navegáveis', () => {
  for (const item of [null, { ...track, id: 'mock-track' }, { ...track, type: 'episode' }, { ...track, is_local: true }]) assert.equal(mapTrack(item), null);
  assert.equal(mapPlaylistTrack({ item: null, track }), null);
  assert.equal(mapPlaylistTrack({ item: track, is_local: true }), null);
});
test('playlist atual usa item; formato legado é apenas compatibilidade de leitura', () => {
  assert.equal(mapPlaylistTrack({ item: track }).id, secondId);
  assert.equal(mapPlaylistTrack({ track }).id, secondId);
  assert.equal(mapPlaylist({ ...playlist, items: { total: 2 }, tracks: { total: 99 } }).totalItems, 2);
  assert.equal(mapPlaylist({ ...playlist, tracks: { total: 2 } }).totalItems, 2);
});
test('busca por tipos distintos preserva páginas independentes e limite de 10', async () => {
  const f = fixture(() => ({ albums: page([album], { limit: 10 }), artists: page([artist], { limit: 10 }), tracks: page([track], { limit: 10 }) }));
  const result = await f.catalog.search('  rock & música  ');
  assert.equal(f.calls[0].endpoint, '/search');
  assert.equal(f.calls[0].options.query.q, 'rock & música');
  assert.equal(f.calls[0].options.query.type, 'album,artist,track');
  assert.equal(f.calls[0].options.query.limit, 10);
  assert.equal(result.albums.items[0].type, 'album');
  assert.equal(result.artists.items[0].type, 'artist');
  assert.equal(result.tracks.items[0].type, 'track');
});
test('busca rejeita termo vazio, tipos e paginação inválidos antes da rede', async () => {
  const f = fixture(() => { throw new Error('never'); });
  for (const [term, options] of [[' ', {}], ['rock', { types: 'track' }], ['rock', { types: [] }], ['rock', { types: ['show'] }], ['rock', { limit: 11 }], ['rock', { limit: 0 }], ['rock', { offset: 1001 }], ['rock', { market: 'Brasil' }]]) {
    await assert.rejects(f.catalog.search(term, options), { code: 'bad_request' });
  }
  assert.equal(f.calls.length, 0);
});
test('IDs de rota inválidos são recusados sem fazer chamada externa', async () => {
  const f = fixture(() => { throw new Error('never'); });
  for (const method of ['getAlbum', 'getAlbumTracks', 'getArtist', 'getArtistAlbums', 'getTrack', 'getPlaylist', 'getPlaylistTracks']) {
    for (const invalid of ['daily', '../me', '', undefined]) await assert.rejects(f.catalog[method](invalid), { code: 'invalid_id' });
  }
  assert.equal(f.calls.length, 0);
});
test('detalhes e páginas usam endpoints individuais disponíveis', async () => {
  const f = fixture(endpoint => {
    if (endpoint === '/artists/' + artistId) return artist;
    if (endpoint === '/tracks/' + secondId) return track;
    if (endpoint === '/playlists/' + id) return playlist;
    return page();
  });
  await f.catalog.getArtist(artistId);
  await f.catalog.getTrack(secondId);
  await f.catalog.getPlaylist(id);
  await f.catalog.getArtistAlbums(artistId);
  await f.catalog.getAlbumTracks(id);
  await f.catalog.getPlaylistTracks(id);
  await f.catalog.getMyPlaylists();
  assert.deepEqual(f.calls.map(call => call.endpoint), ['/artists/' + artistId, '/tracks/' + secondId, '/playlists/' + id, '/artists/' + artistId + '/albums', '/albums/' + id + '/tracks', '/playlists/' + id + '/items', '/me/playlists']);
  assert.equal(f.calls[3].options.query.limit, 10);
  assert.equal(f.calls[3].options.query.include_groups, 'album,single');
});
test('álbum associa capa e identidade às faixas simplificadas sem ciclos no JSON', async () => {
  const { album: ignored, ...simplified } = track;
  const f = fixture(() => ({ ...album, tracks: page([simplified]) }));
  const model = await f.catalog.getAlbum(id, { market: 'br' });
  assert.equal(f.calls[0].options.query.market, 'BR');
  assert.equal(model.tracks.items[0].album.id, id);
  assert.deepEqual(model.tracks.items[0].image, model.image);
  assert.doesNotThrow(() => JSON.stringify(model));
  assert.equal(ignored.id, id);
});
test('album opcional na página de faixas deve corresponder ao ID solicitado', async () => {
  const f = fixture(() => page([track]));
  await assert.rejects(f.catalog.getAlbumTracks(id, { album: mapAlbum({ ...album, id: secondId }) }), { code: 'bad_request' });
  assert.equal(f.calls.length, 0);
});
test('playlist com metadados e sem conteúdo não é tratada como vazia', async () => {
  const f = fixture(() => ({ ...playlist, items: { total: 50 } }));
  const model = await f.catalog.getPlaylist(id);
  assert.equal(model.contentStatus, 'not_provided');
  assert.equal(model.tracks, null);
  assert.equal(model.totalItems, 50);
});
test('playlist vazia com conteúdo fornecido é diferente de conteúdo omitido', async () => {
  const f = fixture(() => ({ ...playlist, items: page() }));
  const model = await f.catalog.getPlaylist(id);
  assert.equal(model.contentStatus, 'available');
  assert.deepEqual(model.tracks.items, []);
  assert.equal(model.totalItems, 0);
});
test('playlist filtra itens indisponíveis preservando totais e avanço da página', async () => {
  const f = fixture(() => page([{ item: null }, { item: { ...track, type: 'episode' } }, { item: track }], { total: 20, next: 'https://api.spotify.com/v1/playlists/' + id + '/items?offset=20&limit=20' }));
  const result = await f.catalog.getPlaylistTracks(id);
  assert.equal(result.items.length, 1);
  assert.equal(result.skippedCount, 2);
  assert.equal(result.total, 20);
  assert.ok(result.next);
});
test('página sem músicas suportadas ainda pode avançar', async () => {
  const f = fixture((_, options, count) => count === 1 ? page([{ item: null }], { next: 'https://api.spotify.com/v1/playlists/' + id + '/items?offset=20&limit=20' }) : page([{ item: track }], { offset: 20 }));
  const first = await f.catalog.getPlaylistTracks(id);
  assert.deepEqual(first.items, []);
  assert.equal((await f.catalog.nextPage(first)).items[0].id, secondId);
});
test('paginação preserva filtros originais, mesmo quando o cursor usa query em vez de q', async () => {
  const f = fixture((_, options, count) => count === 1 ? { albums: page([album], { limit: 10, next: 'https://api.spotify.com/v1/search?query=other&type=album&offset=10&limit=50' }) } : { albums: page([{ ...album, id: secondId }], { offset: 10, limit: 10 }) });
  const first = (await f.catalog.search('termo original', { types: ['album'], market: 'BR' })).albums;
  const second = await f.catalog.nextPage(first);
  const next = new URL(f.calls[1].endpoint);
  assert.equal(next.searchParams.get('q'), 'termo original');
  assert.equal(next.searchParams.get('market'), 'BR');
  assert.equal(next.searchParams.get('limit'), '10');
  assert.equal(next.searchParams.get('offset'), '10');
  assert.equal(second.items[0].id, secondId);
});
test('cada categoria da busca carrega a própria próxima página', async () => {
  const f = fixture((_, options, count) => count === 1 ? {
    albums: page([album], { next: 'https://api.spotify.com/v1/search?type=album&offset=10' }),
    artists: page([artist], { next: 'https://api.spotify.com/v1/search?type=artist&offset=10' }),
  } : { artists: page([artist], { offset: 10 }) });
  const first = await f.catalog.search('teste', { types: ['album', 'artist'] });
  const next = await f.catalog.nextPage(first.artists);
  assert.equal(new URL(f.calls[1].endpoint).searchParams.get('type'), 'artist');
  assert.equal(next.items[0].type, 'artist');
});
for (const cursor of ['https://evil.test/v1/me/playlists?offset=20', 'https://api.spotify.com/v1/search?offset=20', 'https://api.spotify.com/v1/me/playlists?offset=0', 'https://api.spotify.com/v1/me/playlists?offset=-1']) {
  test('recusa cursor externo, de outro recurso ou sem avanço: ' + cursor, async () => {
    const f = fixture(() => page([], { next: cursor }));
    await assert.rejects(f.catalog.getMyPlaylists(), { code: 'invalid_response' });
    assert.equal(f.calls.length, 1);
  });
}
test('última página não faz nova chamada; cursor clonado não é aceito', async () => {
  const f = fixture(() => page());
  const result = await f.catalog.getMyPlaylists();
  assert.equal(await f.catalog.nextPage(result), null);
  await assert.rejects(f.catalog.nextPage({ ...result }), { code: 'bad_request' });
  assert.equal(f.calls.length, 1);
});
test('respostas incompletas são distinguíveis de busca sem resultados', async () => {
  const f = fixture(() => ({}));
  await assert.rejects(f.catalog.search('teste'), { code: 'invalid_response' });
  await assert.rejects(f.catalog.getAlbum(id), { code: 'invalid_response' });
  await assert.rejects(f.catalog.getMyPlaylists(), { code: 'invalid_response' });
  const empty = fixture(() => ({ tracks: page() }));
  assert.deepEqual((await empty.catalog.search('teste', { types: ['track'] })).tracks.items, []);
});
test('403/404/429 são propagados sem fallback para mocks e sem chamadas extras', async () => {
  for (const code of ['forbidden', 'not_found', 'rate_limited']) {
    const failure = new SpotifyApiError(code);
    const f = fixture(() => { throw failure; });
    await assert.rejects(f.catalog.getPlaylist(id), error => error === failure);
    assert.equal(f.calls.length, 1);
  }
});
test('sinal de cancelamento chega ao cliente HTTP', async () => {
  const controller = new AbortController();
  const f = fixture(() => page());
  await f.catalog.getAlbumTracks(id, { signal: controller.signal });
  assert.equal(f.calls[0].options.signal, controller.signal);
});
test('troca de sessão invalida cursor e descarta resposta atrasada', async () => {
  let version = 0; let release;
  const gate = new Promise(resolve => { release = resolve; });
  const catalog = createSpotifyCatalog({ get: async () => { await gate; return page(); } }, { getSessionVersion: () => version });
  const pending = catalog.getMyPlaylists();
  version++; release();
  await assert.rejects(pending, { code: 'cancelled' });
  const f = createSpotifyCatalog({ get: async () => page([], { next: 'https://api.spotify.com/v1/me/playlists?offset=20' }) }, { getSessionVersion: () => version });
  const first = await f.getMyPlaylists();
  version++;
  await assert.rejects(f.nextPage(first), { code: 'cancelled' });
});
test('cliente HTTP real e serviço compõem URL autenticada sem exigir Client Secret', async () => {
  let calls = 0;
  const api = createSpotifyApiClient({
    getAccessToken: async () => 'synthetic-access',
    fetchImpl: async (url, options) => {
      calls++;
      const parsed = new URL(url);
      assert.equal(parsed.pathname, '/v1/search');
      assert.equal(parsed.searchParams.get('q'), 'rock & música');
      assert.equal(options.headers.Authorization, 'Bearer synthetic-access');
      assert.equal(parsed.searchParams.has('client_secret'), false);
      return { ok: true, status: 200, json: async () => ({ tracks: page([track]) }) };
    },
  });
  const result = await createSpotifyCatalog(api).search('rock & música', { types: ['track'] });
  assert.equal(result.tracks.items[0].id, secondId);
  assert.equal(calls, 1);
});
