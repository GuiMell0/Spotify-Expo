import { imageSource } from './spotifyModels.mjs';
import { SpotifyApiError } from './spotifyErrors.mjs';
export function mapSpotifyProfile(raw,expectedId) {
 if(!raw||typeof raw.id!=='string'||!raw.id.trim()||raw.id!==expectedId)throw new SpotifyApiError('invalid_response');
 const name=typeof raw.display_name==='string'&&raw.display_name.trim()?raw.display_name.trim():raw.id;
 return {id:raw.id,name,image:imageSource(raw.images),followers:Number.isSafeInteger(raw.followers?.total)&&raw.followers.total>=0?raw.followers.total:null,spotifyUrl:'https://open.spotify.com/user/'+encodeURIComponent(raw.id)};
}
export function sessionProfile(user) {
 return mapSpotifyProfile({id:user.id,display_name:user.displayName,images:user.imageUrl?[{url:user.imageUrl}]:[]},user.id);
}
export function createSpotifyProfile(api,id) {
 let state={status:'idle',profile:null,error:null},active=false,generation=0,flight=null;
 const listeners=new Set(),emit=patch=>{state={...state,...patch};listeners.forEach(fn=>fn());};
 function refresh(){
   if(!active)return Promise.resolve();
   if(flight)return flight.promise;
   const version=generation,operation={controller:new AbortController(),promise:null};emit({status:'loading',error:null});
   operation.promise=Promise.resolve().then(async()=>{
     try {
       if(!active||version!==generation)return;
       const raw=await api.get('/me',{signal:operation.controller.signal});
       if(active&&version===generation)emit({status:'ready',profile:mapSpotifyProfile(raw,id),error:null});
     }catch(error){if(active&&version===generation)emit({status:error.code==='cancelled'?'paused':'error',error:error.code==='cancelled'?null:error});}
     finally{if(flight===operation)flight=null;}
   });flight=operation;return operation.promise;
 }
 function setActive(value){if(active===value)return;active=value;if(value){if(['idle','paused'].includes(state.status))return refresh();}else{generation++;flight?.controller.abort();flight=null;if(state.status==='loading')emit({status:state.profile?'ready':'paused'});}}
 return {getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},refresh,setActive,suspend:()=>setActive(false)};
}
