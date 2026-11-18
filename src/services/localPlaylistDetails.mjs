// IDs de leitura seguem os registros existentes; "new" é reservado ao formulário.
export function isLocalPlaylistId(value) {
  if (typeof value !== 'string' || !value || value !== value.trim() || value.length > 100 || value === 'new' || /[\u0000-\u001F\u007F]/.test(value)) return false;
  try { encodeURIComponent(value); return true; } catch { return false; }
}
export function localPlaylistHref(id) {
  return isLocalPlaylistId(id) ? '/local-playlist/' + encodeURIComponent(id) : null;
}
export function findLocalPlaylist(data, id) {
  return isLocalPlaylistId(id) ? data?.playlists.find(item => item.id === id) ?? null : null;
}
export function localPlaylistCover(playlist) {
  return playlist?.tracks.find(track => track.image)?.image ?? null;
}
export function selectLocalPlaylist(state, id) {
  if (state?.status === 'disabled') return { status: 'disabled', playlist: null };
  if (!isLocalPlaylistId(id)) return { status: 'invalid', playlist: null };
  const playlist = findLocalPlaylist(state?.data, id);
  if (playlist) return { status: 'ready', playlist };
  if (!state || ['idle', 'loading'].includes(state.status)) return { status: 'loading', playlist: null };
  if (state.status === 'error') return { status: 'error', playlist: null };
  return { status: 'not_found', playlist: null };
}
