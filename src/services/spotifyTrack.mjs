import { isSpotifyId } from './spotifyModels.mjs';
import { SpotifyApiError } from './spotifyErrors.mjs';
const matches=(track,id)=>track?.type==='track'&&track.id===id&&isSpotifyId(id);
export function findSavedTrack(search,data,id) {
 if(!isSpotifyId(id))return null;
 const cached=search?.getEntity('track',id);
 if(matches(cached,id))return cached;
 return data?.likedTracks.find(item=>item.track.id===id)?.track??data?.playlists.flatMap(item=>item.tracks).find(track=>track.id===id)??null;
}
export function spotifyTrackUrl(track) {
 if(track?.type!=='track'||!isSpotifyId(track.id))throw new SpotifyApiError('invalid_id');
 return 'https://open.spotify.com/track/'+track.id;
}
export const openSpotifyTrack=(track,openURL)=>openURL(spotifyTrackUrl(track));
export function createSpotifyTrack(catalog,id,{cached=null,scope=null}={}) {
 let state={scope,status:matches(cached,id)?'ready':'idle',track:matches(cached,id)?cached:null,error:null},active=false,generation=0,flight=null;
 const listeners=new Set(),emit=patch=>{state={...state,...patch};listeners.forEach(fn=>fn());};
 function cancel(){generation++;flight?.controller.abort();flight=null;}
 function provideCached(track){if(!state.track&&matches(track,id)){cancel();emit({status:'ready',track,error:null});}}
 function refresh(){
   if(!active)return Promise.resolve();
   if(flight)return flight.promise;
   if(!isSpotifyId(id)){emit({status:'error',error:new SpotifyApiError('invalid_id')});return Promise.resolve();}
   const version=generation,operation={controller:new AbortController(),promise:null};emit({status:'loading',error:null});
   operation.promise=Promise.resolve().then(async()=>{
     try{
       if(!active||version!==generation)return;
       const track=await catalog.getTrack(id,{signal:operation.controller.signal});
       if(!active||version!==generation)return;
       if(track?.type!=='track'||!isSpotifyId(track.id))throw new SpotifyApiError('invalid_response');
       emit({status:'ready',track,error:null});
     }catch(error){if(active&&version===generation)emit({status:error.code==='cancelled'?'paused':'error',error:error.code==='cancelled'?null:error});}
     finally{if(flight===operation)flight=null;}
   });flight=operation;return operation.promise;
 }
 function setActive(value){if(active===value)return;active=value;if(value){if(['idle','paused'].includes(state.status))return refresh();}else{cancel();if(state.status==='loading')emit({status:state.track?'ready':'paused'});}}
 return {getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},refresh,provideCached,setActive,suspend:()=>setActive(false)};
}
