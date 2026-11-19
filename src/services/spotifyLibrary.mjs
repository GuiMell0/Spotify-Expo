export function createSpotifyLibrary(catalog,{scope=null}={}) {
 let state={scope,status:'idle',items:[],page:null,error:null,moreError:null,loadingMore:false},active=false,generation=0,flight=null;
 const listeners=new Set(),emit=patch=>{state={...state,...patch};listeners.forEach(fn=>fn());};
 const merge=items=>[...new Map(items.map(item=>[item.id,item])).values()];
 async function run(more=false) {
   if(!active||flight||more&&(state.status!=='ready'||!state.page?.next))return flight?.promise;
   const version=generation,controller=new AbortController(),operation={controller,promise:null};
   emit(more?{loadingMore:true,moreError:null}:{status:'loading',error:null,moreError:null});
   operation.promise=Promise.resolve().then(async()=>{
     try {
       if(!active||version!==generation)return;
       const page=more?await catalog.nextPage(state.page,{signal:controller.signal}):await catalog.getMyPlaylists({limit:20,signal:controller.signal});
       if(!active||version!==generation)return;
       emit({status:'ready',items:merge(more?[...state.items,...(page?.items??[])]:page.items),page,loadingMore:false,error:null,moreError:null});
     }catch(error){if(active&&version===generation)emit(more?{loadingMore:false,moreError:error}:{status:error.code==='cancelled'?'paused':'error',error:error.code==='cancelled'?null:error});}
     finally{if(flight===operation)flight=null;}
   });flight=operation;return operation.promise;
 }
 function setActive(value){if(active===value)return;active=value;if(value){if(['idle','paused'].includes(state.status))return run();}else{generation++;flight?.controller.abort();flight=null;emit({loadingMore:false,status:state.status==='loading'?'paused':state.status});}}
 return {getSnapshot:()=>state,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},setActive,refresh:()=>run(),loadMore:()=>run(true),suspend:()=>setActive(false)};
}
