import { usePathname } from 'expo-router';
import { useSession } from '../contexts/SessionContext';
import { useTrackQueue } from '../contexts/TrackQueueContext';
import { useKeyboardVisible } from '../contexts/LayoutContext';
export function useMiniPlayerVisible() {
  const {
    session,
    isRestoring,
    isEndingSession
  } = useSession();
  const {
    state
  } = useTrackQueue();
  const pathname = usePathname();
  const keyboardVisible = useKeyboardVisible();
  return Boolean(session && !isRestoring && !isEndingSession && state.track && !keyboardVisible && !['/player', '/login', '/callback'].includes(pathname));
}
