import { useRouter } from 'expo-router';
import { useSearch } from '../contexts/SearchContext';
import { useTrackQueue } from '../contexts/TrackQueueContext';

export function useOpenTrack() {
  const router = useRouter();
  const { search } = useSearch();
  const { queue } = useTrackQueue();
  return (track, tracks = [track]) => {
    const selected = queue.select(track, tracks);
    if (!selected) return;
    search.rememberEntity(selected);
    router.push(selected.href);
  };
}
