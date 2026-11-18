import { snapshotTrack, LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';

export function changeLikedTrack(data, track, liked, savedAt = Date.now()) {
  if (typeof liked !== 'boolean') throw new LocalDataError('invalid_data');
  const snapshot = snapshotTrack(track);
  const exists = data.likedTracks.some(item => item.track.id === snapshot.id);
  if (exists === liked) return data;
  if (!liked) return { ...data, likedTracks: data.likedTracks.filter(item => item.track.id !== snapshot.id) };
  if (data.likedTracks.length >= LOCAL_DATA_LIMITS.likedTracks) throw new LocalDataError('too_large');
  if (!Number.isSafeInteger(savedAt) || savedAt < 0) throw new LocalDataError('invalid_data');
  return { ...data, likedTracks: [{ track: snapshot, savedAt }, ...data.likedTracks] };
}

export function saveLikedTrack(localData, track, liked, { now = Date.now } = {}) {
  return localData.update(current => changeLikedTrack(current, track, liked, now()));
}

export function listLikedTracks(data) {
  return [...(data?.likedTracks ?? [])].sort((a, b) => b.savedAt - a.savedAt);
}
