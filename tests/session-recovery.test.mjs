import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionManager } from '../src/services/sessionManager.mjs';
import { SpotifyAuthError, SpotifyApiError } from '../src/services/spotifyErrors.mjs';
import { createSpotifyApiClient } from '../src/services/spotifyApi.mjs';
import { getApiRecovery } from '../src/services/apiRecovery.mjs';
const saved={accessToken:'synthetic-expired',refreshToken:'synthetic-refresh',expiresAt:100,scope:'',user:{id:'local-owner',displayName:'Pessoa local'}};
function fixture(refreshSession) {
 let raw=JSON.stringify({version:1,clientId:'synthetic-client',session:saved});
 const changes=[],recovery=[];
 const manager=createSessionManager({
  clientId:'synthetic-client',now:()=>1000,refreshSession,
  storage:{persistent:true,read:async()=>raw,write:async value=>{raw=value;},remove:async()=>{raw=null;}},
  onChange:value=>changes.push(value),onRecoveryChange:value=>recovery.push(value),
 });
 return {manager,changes,recovery,raw:()=>raw};
}
for(const code of ['network','timeout','server','rate_limited'])test('restauração '+code+' preserva conta local sem liberar token vencido',async()=>{
 const f=fixture(async()=>{throw new SpotifyAuthError(code,'remote-private');});
 const original=f.raw();assert.equal((await f.manager.restore()).user.id,'local-owner');
 assert.equal(f.changes.at(-1).user.id,'local-owner');assert.equal(f.recovery.at(-1),code);
 await assert.rejects(f.manager.getAccessToken(),{code});assert.equal(f.raw(),original);
});
test('reconexão manual atualiza token e conserva geração e conta local',async()=>{
 let offline=true;const f=fixture(async({session})=>{if(offline)throw new SpotifyAuthError('network','private');return {...session,accessToken:'renewed',expiresAt:5000};});
 await f.manager.restore();const version=f.manager.getSessionVersion();offline=false;
 assert.equal(await f.manager.getAccessToken({forceRefresh:true}),'renewed');assert.equal(f.manager.getSessionVersion(),version);assert.equal(f.manager.getSession().user.id,'local-owner');assert.equal(f.recovery.at(-1),null);
});
test('cliente API bloqueia envio de token expirado na restauração offline',async()=>{
 const f=fixture(async()=>{throw new SpotifyAuthError('network','private');});await f.manager.restore();let http=0;
 const api=createSpotifyApiClient({getAccessToken:f.manager.getAccessToken,fetchImpl:async()=>{http++;}});
 await assert.rejects(api.get('/me'),{code:'network'});assert.equal(http,0);assert.equal(f.manager.getSession().user.id,'local-owner');
});
test('revogação após modo local limpa sessão e exige login',async()=>{
 let code='network';const f=fixture(async()=>{throw new SpotifyAuthError(code,'private');});await f.manager.restore();code='reauth_required';
 await assert.rejects(f.manager.getAccessToken(),{code});assert.equal(f.manager.getSession(),null);assert.equal(f.raw(),null);assert.equal(f.recovery.at(-1),null);
});
test('logout durante reconexão não restaura identidade offline nem token',async()=>{
 let finish;let first=true;const f=fixture(async({session})=>{if(first){first=false;throw new SpotifyAuthError('network','private');}await new Promise(resolve=>{finish=resolve;});return {...session,accessToken:'late',expiresAt:5000};});
 await f.manager.restore();const pending=f.manager.getAccessToken();await Promise.resolve();await f.manager.clear();finish();await assert.rejects(pending,{code:'cancelled'});assert.equal(f.manager.getSession(),null);assert.equal(f.changes.at(-1),null);
});
test('429 respeita Retry-After e oferece Biblioteca local',()=>{
 const error=new SpotifyApiError('rate_limited',{retryAt:3000});assert.deepEqual(getApiRecovery(error,1000),{message:error.message,retryAllowed:true,seconds:2,showLocalLibrary:true});assert.equal(getApiRecovery(error,3000).seconds,0);
});
test('permissão, conteúdo ausente e cota orientam acesso local sem repetição automática',()=>{
 for(const code of ['forbidden','not_found','quota_exceeded']){const state=getApiRecovery(new SpotifyApiError(code));assert.equal(state.retryAllowed,false);assert.equal(state.showLocalLibrary,true);assert.ok(state.message.length>0);}
});
test('erro desconhecido e erro de autenticação não expõem detalhes privados',()=>{
 const state=getApiRecovery(new Error('private-token'));assert.equal(state.message.includes('private'),false);assert.equal(state.showLocalLibrary,false);assert.equal(getApiRecovery(new SpotifyApiError('unauthorized')).retryAllowed,false);
});
test('prazo inválido ou vencido não trava recuperação manual',()=>{
 assert.equal(getApiRecovery(new SpotifyApiError('network',{retryAt:NaN}),1000).seconds,0);
 assert.equal(getApiRecovery(new SpotifyApiError('timeout',{retryAt:500}),1000).seconds,0);
});
