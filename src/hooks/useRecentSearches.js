import { useCallback, useMemo } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';
import { listRecentSearches, saveRecentSearch, removeRecentSearch, removeAllRecentSearches } from '../services/recentSearches.mjs';

export function useRecentSearches() {
  const { localData, state } = useLocalData();
  const entries = useMemo(() => listRecentSearches(state.data), [state.data]);
  const record = useCallback(term => saveRecentSearch(localData, term), [localData]);
  const remove = useCallback(term => removeRecentSearch(localData, term), [localData]);
  const clear = useCallback(() => removeAllRecentSearches(localData), [localData]);
  const rememberIfReady = useCallback(term => {
    if (!['ready', 'saving'].includes(localData.getSnapshot().status)) return;
    record(term).catch(() => { /* O aviso global oferece recuperação sem interromper a busca. */ });
  }, [localData, record]);
  return { localData, state, entries, record, remove, clear, rememberIfReady };
}
