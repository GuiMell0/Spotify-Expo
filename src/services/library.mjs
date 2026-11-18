import { listLocalPlaylists } from './localPlaylists.mjs';
import { listLikedTracks } from './likedTracks.mjs';
import { listRecentSearches } from './recentSearches.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';

export const LIBRARY_FILTERS = Object.freeze([
  Object.freeze({ id: 'all', label: 'Tudo' }),
  Object.freeze({ id: 'tracks', label: 'Músicas' }),
  Object.freeze({ id: 'playlists', label: 'Playlists' }),
  Object.freeze({ id: 'searches', label: 'Buscas' }),
]);

// Playlists locais aparecem como resumos na G01; a G02 conecta seus detalhes por ID.
export function listLibraryItems(data, { filter = 'all', sort = data?.preferences.librarySort ?? 'recent' } = {}) {
  if (!LIBRARY_FILTERS.some(item => item.id === filter) || !['recent', 'title'].includes(sort)) throw new LocalDataError('invalid_data');
  const tracks = !['all', 'tracks'].includes(filter) ? [] : listLikedTracks(data).map(({ track, savedAt }) => ({
    key: 'track:' + track.id, type: 'track', title: track.title,
    subtitle: 'Música curtida · ' + track.artist, image: track.image, updatedAt: savedAt, track,
  }));
  const searches = !['all', 'searches'].includes(filter) ? [] : listRecentSearches(data).map(({ term, searchedAt }) => ({
    key: 'search:' + term.toLowerCase(), type: 'search', title: term,
    subtitle: 'Busca recente', image: null, updatedAt: searchedAt, term,
  }));
  const playlists = !['all', 'playlists'].includes(filter) ? [] : listLocalPlaylists(data).map(playlist => ({
    key: 'local-playlist:' + playlist.id, type: 'local-playlist', title: playlist.name,
    subtitle: 'Playlist local · ' + playlist.tracks.length + (playlist.tracks.length === 1 ? ' música' : ' músicas'),
    image: playlist.tracks.find(track => track.image)?.image ?? null, updatedAt: playlist.updatedAt, playlist,
  }));
  return [...tracks, ...searches, ...playlists].sort((a, b) => {
    const byTitle = sort === 'title' ? a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }) : 0;
    return byTitle || b.updatedAt - a.updatedAt || a.key.localeCompare(b.key);
  });
}

export function changeLibraryPreference(data, preference, value) {
  const valid = preference === 'libraryView' ? ['grid', 'list'] : preference === 'librarySort' ? ['recent', 'title'] : [];
  if (!valid.includes(value)) throw new LocalDataError('invalid_data');
  if (data.preferences[preference] === value) return data;
  return { ...data, preferences: { ...data.preferences, [preference]: value } };
}
export const saveLibraryPreference = (localData, preference, value) =>
  localData.update(current => changeLibraryPreference(current, preference, value));
