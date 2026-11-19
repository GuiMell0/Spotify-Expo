import { isSpotifyId, mapArtist, mapTrack } from '../services/spotifyModels.mjs';
import { LocalDataError } from './localDataErrors.mjs';

export const LOCAL_DATA_VERSION = 1;
export const LOCAL_DATA_LIMITS = Object.freeze({ likedTracks: 500, recentSearches: 20, playlists: 50, playlistTracks: 300, followedArtists: 200, bytes: 1000000 });
const fail = () => { throw new LocalDataError('invalid_data'); };
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const name = (value, max = 300) => typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : fail();
const time = value => Number.isSafeInteger(value) && value >= 0 ? value : fail();
const allowed = (value, keys) => { if (!object(value) || Object.keys(value).some(key => !keys.includes(key))) fail(); };
function collection(value, max, mapper, key) {
  if (!Array.isArray(value)) fail();
  if (value.length > max) throw new LocalDataError('too_large');
  const result = value.map(mapper);
  if (new Set(result.map(key)).size !== result.length) fail();
  return result;
}
function image(value) {
  if (!value) return [];
  if (typeof value.uri !== 'string' || value.uri.length > 2048) fail();
  return [{ url: value.uri }];
}
function credit(value) {
  if (!object(value) || value.type !== 'artist') fail();
  if (value.id !== null && !isSpotifyId(value.id)) fail();
  return { id: value.id, type: 'artist', name: name(value.title) };
}
function credits(value) {
  if (!Array.isArray(value) || value.length > 50) fail();
  return value.map(credit);
}
function rawAlbum(value) {
  if (!value) return undefined;
  if (value.type !== 'album' || !isSpotifyId(value.id)) fail();
  return { id: value.id, type: 'album', name: name(value.title), artists: credits(value.artists), images: image(value.image),
    album_type: value.albumType, release_date: value.releaseDate, release_date_precision: value.releaseDatePrecision, total_tracks: value.totalTracks };
}
export function snapshotTrack(value) {
  if (!object(value) || value.type !== 'track' || !isSpotifyId(value.id)) fail();
  return mapTrack({ id: value.id, type: 'track', name: name(value.title), artists: credits(value.artists), album: rawAlbum(value.album),
    duration_ms: value.durationMs, disc_number: value.discNumber, track_number: value.trackNumber,
    explicit: value.explicit, is_playable: value.isPlayable, restrictions: value.restriction ? { reason: name(value.restriction, 80) } : undefined });
}
export function snapshotArtist(value) {
  if (!object(value) || value.type !== 'artist' || !isSpotifyId(value.id)) fail();
  if (!Array.isArray(value.genres) || value.genres.length > 50) fail();
  return mapArtist({ id: value.id, type: 'artist', name: name(value.title), images: image(value.image), genres: value.genres.map(item => name(item, 80)) });
}
export function freezeLocalData(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freezeLocalData); Object.freeze(value); }
  return value;
}
export function emptyLocalData() {
  return freezeLocalData({ likedTracks: [], recentSearches: [], playlists: [], followedArtists: [], preferences: { displayName: null, libraryView: 'grid', librarySort: 'recent' } });
}
export function validateLocalData(value) {
  allowed(value, ['likedTracks', 'recentSearches', 'playlists', 'followedArtists', 'preferences']);
  allowed(value.preferences, ['displayName', 'libraryView', 'librarySort']);
  const prefs = value.preferences;
  if (!['grid', 'list'].includes(prefs.libraryView) || !['recent', 'title'].includes(prefs.librarySort)) fail();
  return freezeLocalData({
    likedTracks: collection(value.likedTracks, LOCAL_DATA_LIMITS.likedTracks, item => ({ track: snapshotTrack(item?.track), savedAt: time(item?.savedAt) }), item => item.track.id),
    recentSearches: collection(value.recentSearches, LOCAL_DATA_LIMITS.recentSearches, item => ({ term: name(item?.term, 150), searchedAt: time(item?.searchedAt) }), item => item.term.toLowerCase()),
    playlists: collection(value.playlists, LOCAL_DATA_LIMITS.playlists, item => {
      if (!object(item)) fail();
      const createdAt = time(item.createdAt), updatedAt = time(item.updatedAt);
      if (updatedAt < createdAt) fail();
      return { id: name(item.id, 100), name: name(item.name, 80), createdAt, updatedAt,
        tracks: collection(item.tracks, LOCAL_DATA_LIMITS.playlistTracks, snapshotTrack, track => track.id) };
    }, item => item.id),
    followedArtists: collection(value.followedArtists, LOCAL_DATA_LIMITS.followedArtists, item => ({ artist: snapshotArtist(item?.artist), savedAt: time(item?.savedAt) }), item => item.artist.id),
    preferences: { displayName: prefs.displayName === null ? null : name(prefs.displayName, 80), libraryView: prefs.libraryView, librarySort: prefs.librarySort },
  });
}
export function localDataKey(accountId) {
  if (typeof accountId !== 'string' || !accountId.trim() || accountId.length > 300) fail();
  try { return '@spotify-expo/local/' + encodeURIComponent(accountId); } catch { return fail(); }
}
export function decodeLocalData(raw, accountId) {
  if (raw === null) return emptyLocalData();
  let record;
  try { record = JSON.parse(raw); } catch { fail(); }
  if (!object(record) || !Number.isSafeInteger(record.version) || record.version < 1) fail();
  if (record.version !== LOCAL_DATA_VERSION) throw new LocalDataError('unsupported_version');
  if (record.accountId !== accountId) fail();
  return validateLocalData(record.data);
}
export function encodeLocalData(data, accountId) {
  localDataKey(accountId);
  const raw = JSON.stringify({ version: LOCAL_DATA_VERSION, accountId, data: validateLocalData(data) });
  let bytes = 0;
  for (const character of raw) {
    const point = character.codePointAt(0);
    bytes += point <= 127 ? 1 : point <= 2047 ? 2 : point <= 65535 ? 3 : 4;
    if (bytes > LOCAL_DATA_LIMITS.bytes) throw new LocalDataError('too_large');
  }
  return raw;
}
