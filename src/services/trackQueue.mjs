import { isSpotifyId } from './spotifyModels.mjs';

export const MAX_QUEUE_TRACKS = 300;
const valid = track => track?.type === 'track' && isSpotifyId(track.id) && typeof track.title === 'string';
function copy(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(copy));
  if (value && typeof value === 'object') return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, item]) => [key, copy(item)])));
  return value;
}
function snapshotTrack(track) {
  return copy({ ...track, href: '/player?trackId=' + track.id });
}

// Esta fila representa seleção de metadados, sem estado de reprodução de áudio.
export function createTrackQueue({ scope = null } = {}) {
  let state = Object.freeze({ scope, tracks: Object.freeze([]), index: -1, track: null });
  const listeners = new Set();
  function publish(tracks, index) {
    state = Object.freeze({ scope, tracks: Object.freeze(tracks), index, track: tracks[index] ?? null });
    listeners.forEach(listener => listener());
    return state.track;
  }
  function select(track, items = [track]) {
    if (!valid(track)) return null;
    const unique = new Map();
    for (const item of Array.isArray(items) ? items : []) {
      if (valid(item) && !unique.has(item.id) && unique.size < MAX_QUEUE_TRACKS) unique.set(item.id, item);
    }
    if (!unique.has(track.id) && unique.size === MAX_QUEUE_TRACKS) unique.delete([...unique.keys()].at(-1));
    unique.set(track.id, track);
    const tracks = [...unique.values()].map(snapshotTrack);
    return publish(tracks, tracks.findIndex(item => item.id === track.id));
  }
  function choose(id) {
    const index = state.tracks.findIndex(track => track.id === id);
    if (index < 0) return null;
    return index === state.index ? state.track : publish([...state.tracks], index);
  }
  function move(delta) {
    if (delta !== 1 && delta !== -1) return null;
    const index = state.index + delta;
    return index >= 0 && index < state.tracks.length ? choose(state.tracks[index].id) : null;
  }
  function adopt(track, requestedId) {
    if (!valid(track) || !isSpotifyId(requestedId)) return null;
    if (state.track?.id !== requestedId) return select(track);
    if (state.track === track) return track;
    // A API pode retornar um ID equivalente por relinking de mercado.
    const tracks = state.tracks.filter((item, index) => item.id !== track.id || index === state.index);
    const index = tracks.findIndex(item => item.id === requestedId);
    if (index < 0) return select(track);
    tracks[index] = snapshotTrack(track);
    return publish(tracks, index);
  }
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    getTrack: id => state.tracks.find(track => track.id === id) ?? null,
    select, choose, move, adopt,
    clear: () => publish([], -1),
  };
}
