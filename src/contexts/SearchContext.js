import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSession } from './SessionContext';
import { createSpotifySearch } from '../services/spotifySearch.mjs';
const SearchContext = createContext(null);
export function SearchProvider({
  children
}) {
  const {
    catalog,
    session
  } = useSession();
  const accountId = session?.user.id ?? null;
  const search = useMemo(() => createSpotifySearch(catalog, {
    scope: accountId
  }), [catalog, accountId]);
  useEffect(() => () => search.suspend(), [search]);
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
}
export function useSearch() {
  const search = useContext(SearchContext);
  if (!search) throw new Error('useSearch precisa estar dentro de SearchProvider.');
  const state = useSyncExternalStore(search.subscribe, search.getSnapshot, search.getSnapshot);
  return {
    search,
    state
  };
}
