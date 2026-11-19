import { snapshotTrack, LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';
export function addPlaylistTrack(data, playlistId, value, now = Date.now()) {
  const track = snapshotTrack(value);
  const playlist = data.playlists.find(item => item.id === playlistId);
  if (!playlist) throw new LocalDataError('playlist_missing');
  if (playlist.tracks.some(item => item.id === track.id)) return data;
  if (playlist.tracks.length >= LOCAL_DATA_LIMITS.playlistTracks) throw new LocalDataError('playlist_full');
  if (!Number.isSafeInteger(now) || now < 0) throw new LocalDataError('invalid_data');
  return { ...data, playlists: data.playlists.map(item => item.id === playlistId ? { ...item, updatedAt: Math.max(item.updatedAt, now), tracks: [...item.tracks, track] } : item) };
}
export const savePlaylistTrack = (localData, playlistId, track) => localData.update(current => addPlaylistTrack(current, playlistId, track));
