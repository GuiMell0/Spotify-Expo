import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { useSession } from './SessionContext';
import { createTrackQueue } from '../services/trackQueue.mjs';
const TrackQueueContext = createContext(null);
export function TrackQueueProvider({
  children
}) {
  const {
    session
  } = useSession();
  const scope = session?.user.id ?? null;
  const queue = useMemo(() => createTrackQueue({
    scope
  }), [scope]);
  return <TrackQueueContext.Provider value={queue}>{children}</TrackQueueContext.Provider>;
}
export function useTrackQueue() {
  const queue = useContext(TrackQueueContext);
  if (!queue) throw new Error('useTrackQueue precisa estar dentro de TrackQueueProvider.');
  const state = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);
  return {
    queue,
    state
  };
}
