import { SpotifyApiError } from './spotifyErrors.mjs';
import { isSpotifyId, mapAlbum, mapArtist, mapPlaylist, mapPlaylistTrack, mapTrack } from './spotifyModels.mjs';

const origin = 'https://api.spotify.com';
const typeKeys = { album: 'albums', artist: 'artists', track: 'tracks', playlist: 'playlists' };
const mappers = { album: mapAlbum, artist: mapArtist, track: mapTrack, playlist: mapPlaylist };
const invalidResponse = () => new SpotifyApiError('invalid_response');

function requireId(id) {
  if (!isSpotifyId(id)) throw new SpotifyApiError('invalid_id');
  return id;
}

function integer(value, fallback, maximum = Infinity) {
  const result = value === undefined ? fallback : value;
  if (!Number.isInteger(result) || result < 0 || result > maximum) throw new SpotifyApiError('bad_request');
  return result;
}

function pageQuery(options = {}, maximum = 50) {
  const limit = integer(options.limit, 20, maximum);
  if (!limit) throw new SpotifyApiError('bad_request');
  const query = { limit, offset: integer(options.offset, 0) };
  if (options.market !== undefined) {
    if (typeof options.market !== 'string' || !/^[A-Za-z]{2}$/.test(options.market)) throw new SpotifyApiError('bad_request');
    query.market = options.market.toUpperCase();
  }
  return query;
}

function requestUrl(endpoint, query) {
  const url = new URL(endpoint.startsWith('https://') ? endpoint : '/v1' + endpoint, origin);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, String(value));
  return url;
}

function nextUrl(value, current, offset) {
  if (value === undefined || value === null) return null;
  try {
    const url = new URL(value);
    if (url.origin !== origin || url.pathname !== current.pathname || url.username || url.password || url.hash) throw invalidResponse();
    const nextOffset = Number(url.searchParams.get('offset'));
    if (!url.searchParams.has('offset') || !Number.isInteger(nextOffset) || nextOffset <= offset) throw invalidResponse();
    if (current.pathname === '/v1/search' && nextOffset > 1000) return null;
    // Usa apenas o deslocamento do servidor; mantém os filtros e o tipo originais.
    // O Spotify também pode devolver "query" no lugar de "q" no cursor de busca.
    const next = new URL(current);
    next.searchParams.set('offset', String(nextOffset));
    return next.toString();
  } catch { throw invalidResponse(); }
}

export function createSpotifyCatalog(api, { getSessionVersion = () => 0 } = {}) {
  const pages = new WeakMap();

  async function read(endpoint, options) {
    const version = getSessionVersion();
    const raw = await api.get(endpoint, options);
    if (version !== getSessionVersion() || options?.signal?.aborted) throw new SpotifyApiError('cancelled');
    return raw;
  }

  function makePage(raw, current, mapper, select = value => value) {
    if (!raw || !Array.isArray(raw.items)) throw invalidResponse();
    const offset = raw.offset === undefined ? Number(current.searchParams.get('offset') ?? 0) : integerResponse(raw.offset);
    if (offset !== Number(current.searchParams.get('offset') ?? 0)) throw invalidResponse();
    const items = raw.items.map(item => mapper(item)).filter(Boolean);
    const next = nextUrl(raw.next, current, offset);
    const page = {
      items, next, offset,
      limit: raw.limit === undefined ? null : integerResponse(raw.limit),
      total: raw.total === undefined || raw.total === null ? null : integerResponse(raw.total),
      skippedCount: raw.items.length - items.length,
    };
    pages.set(page, { next, mapper, select, version: getSessionVersion() });
    return page;
  }

  function integerResponse(value) {
    if (!Number.isInteger(value) || value < 0) throw invalidResponse();
    return value;
  }

  async function fetchPage(endpoint, query, mapper, options = {}, select = value => value) {
    const raw = await read(endpoint, { query, signal: options.signal });
    return makePage(select(raw), requestUrl(endpoint, query), mapper, select);
  }

  async function detail(type, id, options = {}) {
    requireId(id);
    const query = {};
    if (type !== 'artist' && options.market !== undefined) query.market = pageQuery({ market: options.market }).market;
    const raw = await read('/' + typeKeys[type] + '/' + id, { query, signal: options.signal });
    const model = mappers[type](raw);
    if (!model || type !== 'track' && model.id !== id) throw invalidResponse();
    return { raw, model, query };
  }

  async function getAlbum(id, options) {
    const { raw, model, query } = await detail('album', id, options);
    const tracks = raw.tracks === undefined || raw.tracks === null ? null : makePage(raw.tracks,
      requestUrl('/albums/' + id + '/tracks', { ...query, limit: raw.tracks.limit ?? 20, offset: raw.tracks.offset ?? 0 }),
      item => mapTrack(item, model));
    return { ...model, tracks };
  }

  async function getArtist(id, options) { return (await detail('artist', id, options)).model; }
  async function getTrack(id, options) { return (await detail('track', id, options)).model; }

  async function getPlaylist(id, options) {
    const { raw, model, query } = await detail('playlist', id, options);
    const content = Object.hasOwn(raw, 'items') ? raw.items : raw.tracks;
    const hasItems = Array.isArray(content?.items);
    const tracks = hasItems ? makePage(content,
      requestUrl('/playlists/' + id + '/items', { ...query, limit: content.limit ?? 20, offset: content.offset ?? 0 }),
      mapPlaylistTrack) : null;
    return { ...model, tracks, contentStatus: hasItems ? 'available' : 'not_provided' };
  }

  async function getAlbumTracks(id, options = {}) {
    requireId(id);
    const album = options.album ?? null;
    if (album && (album.type !== 'album' || album.id !== id)) throw new SpotifyApiError('bad_request');
    return fetchPage('/albums/' + id + '/tracks', pageQuery(options), item => mapTrack(item, album), options);
  }

  async function getArtistAlbums(id, options = {}) {
    requireId(id);
    const query = pageQuery({ ...options, limit: options.limit ?? 10 }, 10);
    const groups = options.groups ?? ['album', 'single'];
    if (!Array.isArray(groups) || !groups.length || groups.some(group => !['album', 'single', 'appears_on', 'compilation'].includes(group))) throw new SpotifyApiError('bad_request');
    query.include_groups = [...new Set(groups)].join(',');
    return fetchPage('/artists/' + id + '/albums', query, mapAlbum, options);
  }

  async function getPlaylistTracks(id, options = {}) {
    requireId(id);
    return fetchPage('/playlists/' + id + '/items', pageQuery(options), mapPlaylistTrack, options);
  }

  async function getMyPlaylists(options = {}) {
    const query = pageQuery({ limit: options.limit, offset: options.offset });
    if (query.offset > 100000) throw new SpotifyApiError('bad_request');
    return fetchPage('/me/playlists', query, mapPlaylist, options);
  }

  async function search(term, options = {}) {
    if (typeof term !== 'string' || !term.trim()) throw new SpotifyApiError('bad_request');
    if (options.types !== undefined && !Array.isArray(options.types)) throw new SpotifyApiError('bad_request');
    const types = [...new Set(options.types ?? ['album', 'artist', 'track'])];
    if (!types.length || types.some(type => !Object.hasOwn(typeKeys, type))) throw new SpotifyApiError('bad_request');
    const query = { ...pageQuery({ ...options, limit: options.limit ?? 10 }, 10), q: term.trim(), type: types.join(',') };
    if (query.offset > 1000) throw new SpotifyApiError('bad_request');
    const raw = await read('/search', { query, signal: options.signal });
    if (!raw || typeof raw !== 'object') throw invalidResponse();
    const result = {};
    for (const type of types) {
      const key = typeKeys[type];
      if (raw[key] === undefined) throw invalidResponse();
      const select = value => value?.[key];
      // Cada tipo tem seu próprio cursor, evitando misturar páginas da busca.
      const current = requestUrl('/search', { ...query, type });
      result[key] = makePage(raw[key], current, mappers[type], select);
    }
    return result;
  }

  async function nextPage(page, options = {}) {
    const cursor = page && pages.get(page);
    if (!cursor) throw new SpotifyApiError('bad_request');
    if (cursor.version !== getSessionVersion()) throw new SpotifyApiError('cancelled');
    if (!cursor.next) return null;
    return fetchPage(cursor.next, undefined, cursor.mapper, options, cursor.select);
  }

  return { search, getAlbum, getAlbumTracks, getArtist, getArtistAlbums, getTrack, getPlaylist, getPlaylistTracks, getMyPlaylists, nextPage };
}
