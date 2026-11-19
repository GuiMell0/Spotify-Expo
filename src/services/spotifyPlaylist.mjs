export function createSpotifyPlaylist(catalog, id, { scope = 'account' } = {}) {
  let state = { id, scope, status: 'idle', playlist: null, tracks: [], page: null, error: null, moreError: null, loadingMore: false, skippedCount: 0 };
  let active = false;
  let generation = 0;
  let flight = null;
  const listeners = new Set();
  const emit = patch => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const current = version => active && generation === version;

  function cancel() {
    generation++;
    flight?.controller.abort();
    flight = null;
  }

  function load() {
    if (!active) return Promise.resolve();
    if (flight) return flight.promise;
    const version = generation;
    const operation = { controller: new AbortController(), promise: null };
    emit({ status: 'loading', error: null, moreError: null });
    operation.promise = Promise.resolve().then(async () => {
      if (!current(version)) return;
      try {
        const playlist = await catalog.getPlaylist(id, { signal: operation.controller.signal });
        if (!current(version)) return;
        let page = playlist.tracks;
        if (!page) {
          emit({ playlist, page: null, tracks: [], skippedCount: 0 });
          page = await catalog.getPlaylistTracks(id, { signal: operation.controller.signal });
          if (!current(version)) return;
        }
        emit({ status: 'ready', playlist, page, tracks: page.items, skippedCount: page.skippedCount ?? 0, error: null });
      } catch (error) {
        if (current(version)) emit({ status: error.code === 'cancelled' ? 'paused' : 'error', error: error.code === 'cancelled' ? null : error });
      } finally { if (flight === operation) flight = null; }
    });
    flight = operation;
    return operation.promise;
  }

  function loadMore() {
    if (!active || state.status !== 'ready' || !state.page?.next) return Promise.resolve();
    if (flight) return flight.promise;
    const version = generation;
    const previous = state;
    const operation = { controller: new AbortController(), promise: null };
    emit({ loadingMore: true, moreError: null });
    operation.promise = Promise.resolve().then(async () => {
      if (!current(version)) return;
      try {
        const page = await catalog.nextPage(previous.page, { signal: operation.controller.signal });
        if (!current(version)) return;
        emit({
          page: page ?? { ...previous.page, next: null },
          tracks: [...previous.tracks, ...(page?.items ?? [])],
          skippedCount: previous.skippedCount + (page?.skippedCount ?? 0),
          loadingMore: false, moreError: null,
        });
      } catch (error) {
        if (current(version)) emit({ loadingMore: false, moreError: error.code === 'cancelled' ? null : error });
      } finally { if (flight === operation) flight = null; }
    });
    flight = operation;
    return operation.promise;
  }

  function setActive(value) {
    if (active === value) return Promise.resolve();
    active = value;
    if (active) return ['idle', 'paused'].includes(state.status) ? load() : Promise.resolve();
    cancel();
    emit({ loadingMore: false, status: state.status === 'loading' ? state.playlist && state.page ? 'ready' : 'paused' : state.status });
    return Promise.resolve();
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    setActive, loadMore, refresh: load,
    suspend: () => setActive(false),
  };
}
