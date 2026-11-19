import { normalizePlaylistName } from './localPlaylists.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';
function existing(data,id) { const playlist=data.playlists.find(item=>item.id===id); if(!playlist) throw new LocalDataError('playlist_missing'); return playlist; }
export function renameLocalPlaylist(data,id,value,now=Date.now()) {
  const name=normalizePlaylistName(value), playlist=existing(data,id);
  if(playlist.name===name)return data;
  if(!Number.isSafeInteger(now)||now<0)throw new LocalDataError('invalid_data');
  return {...data,playlists:data.playlists.map(item=>item.id===id?{...item,name,updatedAt:Math.max(now,item.updatedAt)}:item)};
}
export function removeLocalPlaylistTrack(data,id,trackId,now=Date.now()) {
  const playlist=existing(data,id),tracks=playlist.tracks.filter(track=>track.id!==trackId);
  if(tracks.length===playlist.tracks.length)return data;
  if(!Number.isSafeInteger(now)||now<0)throw new LocalDataError('invalid_data');
  return {...data,playlists:data.playlists.map(item=>item.id===id?{...item,tracks,updatedAt:Math.max(now,item.updatedAt)}:item)};
}
export function deleteLocalPlaylist(data,id) {
  const playlists=data.playlists.filter(item=>item.id!==id);
  return playlists.length===data.playlists.length?data:{...data,playlists};
}
