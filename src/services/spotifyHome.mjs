export const HOME_TOPICS = [
  { id: 'brasil', label: 'Brasil', query: 'música brasileira' },
  { id: 'rock', label: 'Rock', query: 'rock' },
  { id: 'indie', label: 'Indie', query: 'indie' },
];
const groups = [
  { key: 'tracks', title: 'Músicas para explorar', type: 'track' },
  { key: 'albums', title: 'Álbuns para explorar', type: 'album' },
  { key: 'artists', title: 'Artistas para explorar', type: 'artist' },
];
const unique = items => [...new Map(items.map(item => [item.type + ':' + item.id, item])).values()];

export function createSpotifyHome(catalog, { now = Date.now, cacheMs = 300000, scope = 'account' } = {}) {
  let state = { scope, topic: 'brasil', status: 'idle', sections: [], updatedAt: null, error: null };
  let active = false;
  let generation = 0;
  let flight = null;
  const cache = new Map();
  const listeners = new Set();
  const emit = patch => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };

  function cancel() {
    generation++;
    flight?.controller.abort();
    flight = null;
  }

  function load(force = false) {
    if (!active) return Promise.resolve();
    if (flight) return flight.promise;
    const topic = HOME_TOPICS.find(item => item.id === state.topic);
    const saved = cache.get(topic.id);
    if (!force && saved && now() - saved.updatedAt < cacheMs) {
      emit({ status: 'ready', ...saved, error: null });
      return Promise.resolve();
    }
    const version = generation;
    const controller = new AbortController();
    const operation = { controller, promise: null };
    emit({ status: 'loading', sections: saved?.sections ?? [], updatedAt: saved?.updatedAt ?? null, error: null });
    operation.promise = Promise.resolve().then(async () => {
      if (!active || generation !== version) return;
      try {
        const result = await catalog.search(topic.query, { types: ['track', 'album', 'artist'], limit: 6, signal: controller.signal });
        if (!active || generation !== version) return;
        const sections = groups.map(group => ({ ...group, items: unique(result[group.key].items) }));
        const value = { sections, updatedAt: now() };
        cache.set(topic.id, value);
        emit({ status: 'ready', ...value, error: null });
      } catch (error) {
        if (active && generation === version) emit({
          status: error.code === 'cancelled' ? 'paused' : 'error',
          error: error.code === 'cancelled' ? null : error,
        });
      } finally { if (flight === operation) flight = null; }
    });
    flight = operation;
    return operation.promise;
  }

  function setTopic(topic) {
    if (!HOME_TOPICS.some(item => item.id === topic) || state.topic === topic) return Promise.resolve();
    cancel();
    const saved = cache.get(topic);
    emit({ topic, status: 'paused', sections: saved?.sections ?? [], updatedAt: saved?.updatedAt ?? null, error: null });
    return load();
  }

  function setActive(value) {
    if (active === value) return Promise.resolve();
    active = value;
    if (active) return state.status === 'error' ? Promise.resolve() : load();
    cancel();
    if (state.status === 'loading') {
      const saved = cache.get(state.topic);
      emit({ status: saved ? 'ready' : 'paused', sections: saved?.sections ?? [], updatedAt: saved?.updatedAt ?? null, error: null });
    }
    return Promise.resolve();
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    setActive, setTopic,
    refresh: () => load(true),
    suspend: () => setActive(false),
  };
}
