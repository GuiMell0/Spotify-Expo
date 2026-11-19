import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSession } from './SessionContext';
import { createSpotifyHome } from '../services/spotifyHome.mjs';
const HomeContext = createContext(null);
export function HomeProvider({
  children
}) {
  const {
    catalog,
    session
  } = useSession();
  const scope = session?.user.id ?? null;
  const home = useMemo(() => createSpotifyHome(catalog, {
    scope
  }), [catalog, scope]);
  useEffect(() => () => home.suspend(), [home]);
  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
export function useHome() {
  const home = useContext(HomeContext);
  if (!home) throw new Error('useHome precisa estar dentro de HomeProvider.');
  const state = useSyncExternalStore(home.subscribe, home.getSnapshot, home.getSnapshot);
  return {
    home,
    state
  };
}
