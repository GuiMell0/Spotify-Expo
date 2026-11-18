import { LocalDataError, localDataError } from './localDataErrors.mjs';

export function createLocalDataStore(repository, accountId) {
  let state = { accountId, status: 'idle', data: null, error: null };
  let active = false, generation = 0, blocked = true, flight = null, writes = Promise.resolve(), pendingWrites = 0;
  const listeners = new Set();
  const emit = patch => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const current = version => active && generation === version;

  function hydrate() {
    if (!active) return Promise.resolve();
    if (flight) return flight.promise;
    const version = ++generation;
    blocked = true;
    emit({ status: 'loading', error: null });
    const operation = { promise: null };
    operation.promise = writes.then(() => repository.load(accountId, { isActive: () => current(version) })).then(data => {
      if (current(version)) { blocked = false; emit({ status: 'ready', data, error: null }); }
    }).catch(error => {
      if (current(version)) emit({ status: 'error', error: localDataError(error, 'read') });
    }).finally(() => { if (flight === operation) flight = null; });
    flight = operation;
    return operation.promise;
  }

  function update(change) {
    if (!active || blocked) return Promise.reject(new LocalDataError('not_ready'));
    const version = generation;
    pendingWrites++;
    emit({ status: 'saving', error: null });
    const operation = writes.then(async () => {
      if (!current(version)) throw new LocalDataError('cancelled');
      if (blocked) throw new LocalDataError('not_ready');
      try {
        const data = await repository.update(accountId, change, { isActive: () => current(version) });
        if (current(version)) emit({ data });
        return data;
      } catch (error) {
        if (current(version)) { blocked = true; emit({ status: 'error', error: localDataError(error, 'write') }); }
        throw error;
      }
    }).finally(() => {
      pendingWrites--;
      if (current(version) && !blocked && pendingWrites === 0) emit({ status: 'ready' });
    });
    writes = operation.catch(() => {});
    return operation;
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    start: () => { if (active) return flight?.promise ?? Promise.resolve(); active = true; return hydrate(); },
    retry: hydrate, update,
    suspend: () => { active = false; generation++; blocked = true; flight = null; emit({ status: 'idle', data: null, error: null }); },
  };
}
