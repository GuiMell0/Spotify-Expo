import { LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';

export const MAX_PLAYLIST_NAME_LENGTH = 80;
const messages = {
  invalid_name: 'Digite um nome de 1 a 80 caracteres para a playlist.',
  playlist_limit: 'Você atingiu o limite de 50 playlists locais neste aparelho.',
  id_conflict: 'Esta tentativa já foi usada por outra playlist. Volte à Biblioteca e confira os dados salvos.',
};
export class LocalPlaylistError extends LocalDataError {
  constructor(code) { super('invalid_data'); this.name = 'LocalPlaylistError'; this.code = code; this.message = messages[code] ?? messages.invalid_name; }
}
export function normalizePlaylistName(value) {
  if (typeof value !== 'string' || /[\u0000-\u0008\u000E-\u001F\u007F]/.test(value)) throw new LocalPlaylistError('invalid_name');
  const name = value.trim().replace(/\s+/g, ' ');
  if (!name || name.length > MAX_PLAYLIST_NAME_LENGTH) throw new LocalPlaylistError('invalid_name');
  return name;
}
export function listLocalPlaylists(data) {
  return [...(data?.playlists ?? [])].sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
}
// O mesmo ID e instante identificam uma tentativa: repetir após erro não duplica a playlist.
export function addLocalPlaylist(data, { id, name: value, createdAt }) {
  const name = normalizePlaylistName(value);
  if (typeof id !== 'string' || !/^local-[A-Za-z0-9-]{1,90}$/.test(id) || !Number.isSafeInteger(createdAt) || createdAt < 0) throw new LocalDataError('invalid_data');
  const existing = data.playlists.find(item => item.id === id);
  if (existing) {
    if (existing.name === name && existing.createdAt === createdAt) return data;
    throw new LocalPlaylistError('id_conflict');
  }
  if (data.playlists.length >= LOCAL_DATA_LIMITS.playlists) throw new LocalPlaylistError('playlist_limit');
  return { ...data, playlists: [{ id, name, createdAt, updatedAt: createdAt, tracks: [] }, ...data.playlists] };
}
export const createLocalPlaylist = (localData, input) => localData.update(current => addLocalPlaylist(current, input));
