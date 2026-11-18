import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useSession } from './SessionContext';
import { localDataRepository } from '../storage/localData';
import { createLocalDataStore } from '../storage/localDataStore.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';

const LocalDataContext = createContext(null);
const disabledState = Object.freeze({ accountId: null, status: 'disabled', data: null, error: null });
const disabledStore = { getSnapshot: () => disabledState, subscribe: () => () => {}, update: () => Promise.reject(new LocalDataError('not_ready')), retry: () => Promise.resolve() };

export function LocalDataProvider({ children }) {
  const { session, isDemo, isRestoring, isEndingSession } = useSession();
  const accountId = !isDemo && !isRestoring && !isEndingSession ? session?.user.id ?? null : null;
  const store = useMemo(() => accountId ? createLocalDataStore(localDataRepository, accountId) : disabledStore, [accountId]);
  useEffect(() => {
    if (!accountId) return undefined;
    store.start();
    return () => store.suspend();
  }, [accountId, store]);
  return <LocalDataContext.Provider value={store}>{children}</LocalDataContext.Provider>;
}
export function useLocalData() {
  const localData = useContext(LocalDataContext);
  if (!localData) throw new Error('useLocalData precisa estar dentro de LocalDataProvider.');
  const state = useSyncExternalStore(localData.subscribe, localData.getSnapshot, localData.getSnapshot);
  return { localData, state };
}
