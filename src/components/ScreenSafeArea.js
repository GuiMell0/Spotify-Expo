import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useSession } from '../contexts/SessionContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { useMiniPlayerVisible } from '../hooks/useMiniPlayerVisible';

// As barras irmãs já reservam seus insets; cada borda é aplicada uma vez.
export default function ScreenSafeArea({ edges = ['top', 'bottom'], ...props }) {
  const { session, sessionRecovery, isRestoring, isEndingSession } = useSession();
  const { state } = useLocalData();
  const miniVisible = useMiniPlayerVisible();
  const pathname = usePathname();
  const noticeVisible = !isRestoring && !isEndingSession && (Boolean(session && sessionRecovery) || state.status === 'error');
  const tabRoute = ['/home', '/search', '/library'].includes(pathname);
  const resolved = [...new Set([...edges, 'left', 'right'])].filter(edge =>
    !(edge === 'top' && noticeVisible) && !(edge === 'bottom' && (miniVisible || tabRoute)));
  return <SafeAreaView {...props} edges={resolved} />;
}
