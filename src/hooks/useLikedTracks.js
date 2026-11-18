import { useCallback, useMemo } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { listLikedTracks, saveLikedTrack } from '../services/likedTracks.mjs';

export function useLikedTracks() {
  const { localData, state } = useLocalData();
  const entries = useMemo(() => listLikedTracks(state.data), [state.data]);
  const ids = useMemo(() => new Set(entries.map(item => item.track.id)), [entries]);
  const setLiked = useCallback((track, liked) => saveLikedTrack(localData, track, liked), [localData]);
  return { localData, state, entries, isLiked: id => ids.has(id), setLiked };
}
