import { emptyLocalData } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';
export const LOCAL_CLEAR_GROUPS=Object.freeze([
 Object.freeze({key:'likedTracks',label:'músicas curtidas'}),
 Object.freeze({key:'recentSearches',label:'buscas recentes'}),
 Object.freeze({key:'playlists',label:'playlists locais'}),
 Object.freeze({key:'followedArtists',label:'artistas acompanhados'}),
 Object.freeze({key:'preferences',label:'preferências'}),
]);
export function clearLocalGroup(data,key) {
 if(!LOCAL_CLEAR_GROUPS.some(item=>item.key===key))throw new LocalDataError('invalid_data');
 if(key==='preferences'){
   const defaults=emptyLocalData().preferences;
   if(Object.keys(defaults).every(name=>data.preferences[name]===defaults[name]))return data;
   return {...data,preferences:defaults};
 }
 return data[key].length?{...data,[key]:[]}:data;
}
export const clearSavedGroup=(localData,key)=>localData.update(current=>clearLocalGroup(current,key));
