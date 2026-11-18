export const SEARCH_FILTERS = [
  { value: 'all', label: 'Tudo', types: ['album', 'artist', 'track', 'playlist'] },
  { value: 'track', label: 'Músicas', types: ['track'] },
  { value: 'artist', label: 'Artistas', types: ['artist'] },
  { value: 'album', label: 'Álbuns', types: ['album'] },
  { value: 'playlist', label: 'Playlists', types: ['playlist'] },
];
export const SEARCH_GROUPS = [
  { key: 'tracks', label: 'Músicas', type: 'track' },
  { key: 'artists', label: 'Artistas', type: 'artist' },
  { key: 'albums', label: 'Álbuns', type: 'album' },
  { key: 'playlists', label: 'Playlists', type: 'playlist' },
];
const unique = items => [...new Map(items.map(item => [item.type + ':' + item.id, item])).values()];

export function createSpotifySearch(catalog, { debounceMs = 350, scope = 'account' } = {}) {
  let state = { scope, query: '', filter: 'all', status: 'idle', groups: {}, error: null };
  let active = false;
  let generation = 0;
  let timer;
  const listeners = new Set();
  const requests = new Set();
  const emit = patch => { state = { ...state, ...patch }; listeners.forEach(listener => listener()); };
  const current = version => active && generation === version;

  function cancel() {
    generation++;
    clearTimeout(timer);
    requests.forEach(controller => controller.abort());
    requests.clear();
  }

  function schedule(delay = debounceMs) {
    cancel();
    if (!state.query.trim()) { emit({ status: 'idle', groups: {}, error: null }); return; }
    if (!active) { emit({ status: 'paused', groups: {}, error: null }); return; }
    emit({ status: 'debouncing', groups: {}, error: null });
    const version = generation;
    timer = setTimeout(async () => {
      if (!current(version)) return;
      const controller = new AbortController();
      requests.add(controller);
      emit({ status: 'loading' });
      try {
        const filter = SEARCH_FILTERS.find(item => item.value === state.filter);
        const pages = await catalog.search(state.query.trim(), { types: filter.types, limit: 10, signal: controller.signal });
        if (!current(version)) return;
        const groups = {};
        for (const [key, page] of Object.entries(pages)) groups[key] = { items: unique(page.items), page, loadingMore: false, error: null };
        emit({ status: 'ready', groups, error: null });
      } catch (error) {
        if (current(version)) emit({ status: error.code === 'cancelled' ? 'paused' : 'error', error: error.code === 'cancelled' ? null : error });
      } finally { requests.delete(controller); }
    }, delay);
  }

  function setQuery(query) {
    if (typeof query !== 'string' || query === state.query) return;
    const changed = query.trim() !== state.query.trim();
    if (changed) { state = { ...state, query }; schedule(); }
    else emit({ query });
  }

  function setFilter(filter) {
    if (!SEARCH_FILTERS.some(item => item.value === filter) || filter === state.filter) return;
    state = { ...state, filter };
    schedule(0);
  }

  function setActive(value) {
    if (active === value) return;
    active = value;
    if (active) {
      if (state.query.trim() && ['idle', 'paused', 'loading', 'debouncing'].includes(state.status)) schedule(0);
    } else {
      cancel();
      const groups = Object.fromEntries(Object.entries(state.groups).map(([key, group]) => [key, { ...group, loadingMore: false }]));
      emit({ groups, status: ['loading', 'debouncing'].includes(state.status) ? 'paused' : state.status });
    }
  }

  async function loadMore(key) {
    const group = state.groups[key];
    if (!active || state.status !== 'ready' || !group?.page.next || group.loadingMore) return;
    const version = generation;
    const controller = new AbortController();
    requests.add(controller);
    emit({ groups: { ...state.groups, [key]: { ...group, loadingMore: true, error: null } } });
    try {
      const page = await catalog.nextPage(group.page, { signal: controller.signal });
      if (!current(version)) return;
      emit({ groups: { ...state.groups, [key]: {
        items: unique([...group.items, ...(page?.items ?? [])]),
        page: page ?? { ...group.page, next: null }, loadingMore: false, error: null,
      } } });
    } catch (error) {
      if (current(version)) emit({ groups: { ...state.groups, [key]: { ...group, loadingMore: false, error: error.code === 'cancelled' ? null : error } } });
    } finally { requests.delete(controller); }
  }

  function getEntity(type, id) {
    const items = Object.values(state.groups).flatMap(group => group.items);
    const direct = items.find(item => item.type === type && item.id === id);
    if (direct) return direct;
    for (const item of items) {
      if (type === 'album' && item.album?.id === id) return item.album;
      if (type === 'artist') {
        const artist = item.artists?.find(value => value.id === id);
        if (artist) return artist;
      }
    }
    return null;
  }

  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    setQuery, setFilter, setActive, loadMore, getEntity,
    retry: () => schedule(0),
    suspend: () => setActive(false),
  };
}
