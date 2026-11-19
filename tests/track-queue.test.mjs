import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrackQueue, MAX_QUEUE_TRACKS } from '../src/services/trackQueue.mjs';
import { mapTrack } from '../src/services/spotifyModels.mjs';
const track = (n, title = 'Faixa ' + n) => mapTrack({ id: String(n).padStart(22, 'A'), name: title, type: 'track', artists: [{id:'B'.repeat(22),name:'Artista'}] });
test('fila começa vazia e identifica a conta', () => {
 const q=createTrackQueue({scope:'ana'});assert.equal(q.getSnapshot().scope,'ana');assert.equal(q.getSnapshot().track,null);assert.equal(q.move(1),null);
});
test('seleção respeita posição e ordem da origem', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(b,[a,b]);assert.equal(q.getSnapshot().index,1);assert.deepEqual(q.getSnapshot().tracks.map(t=>t.id),[a.id,b.id]);
});
test('duplicatas e entidades inválidas são excluídas', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(b,[null,{...a,id:'bad'},a,a,{...a,type:'album'},b]);assert.equal(q.getSnapshot().tracks.length,2);
});
test('faixa ausente na origem é incluída e ID inválido não substitui a fila', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(b,[a]);const before=q.getSnapshot();assert.equal(before.index,1);assert.equal(q.select({...a,id:[]}),null);assert.equal(q.getSnapshot(),before);
});
test('anterior e próxima respeitam limites sem repetição automática', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(a,[a,b]);assert.equal(q.move(-1),null);assert.equal(q.move(1).id,b.id);assert.equal(q.move(1),null);assert.equal(q.move(-1).id,a.id);assert.equal(q.move(0),null);
});
test('escolha direta não muda ordem e rejeita ID ausente', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(a,[a,b]);q.choose(b.id);const before=q.getSnapshot();assert.equal(q.choose('bad'),null);assert.equal(q.getSnapshot(),before);assert.equal(q.getTrack(a.id).title,a.title);
});
test('snapshot não compartilha objetos mutáveis com origem', () => {
 const q=createTrackQueue(),a=track(1);q.select(a);a.title='Mutado';a.artists[0].title='Mutado';assert.equal(q.getSnapshot().track.title,'Faixa 1');assert.equal(q.getSnapshot().track.artists[0].title,'Artista');assert.throws(()=>q.getSnapshot().tracks.push(a),TypeError);assert.throws(()=>{q.getSnapshot().track.title='Mutado';},TypeError);
});
test('limite mantém selecionada mesmo quando ela está fora das primeiras 300', () => {
 const q=createTrackQueue(),items=Array.from({length:305},(_,n)=>track(n));q.select(items.at(-1),items);assert.equal(q.getSnapshot().tracks.length,MAX_QUEUE_TRACKS);assert.equal(q.getSnapshot().track.id,items.at(-1).id);
});
test('atualização dos metadados conserva fila e posição', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(b,[a,b]);q.adopt({...b,title:'Atualizada'},b.id);assert.equal(q.getSnapshot().track.title,'Atualizada');assert.equal(q.getSnapshot().index,1);assert.equal(q.getSnapshot().tracks.length,2);
});
test('relinking substitui faixa atual e evita duplicatas', () => {
 const q=createTrackQueue(),a=track(1),b=track(2),c=track(3);q.select(b,[a,b,c]);q.adopt(c,b.id);assert.deepEqual(q.getSnapshot().tracks.map(t=>t.id),[a.id,c.id]);assert.equal(q.getSnapshot().index,1);
});
test('entrada direta cria seleção própria sem reaproveitar outra faixa', () => {
 const q=createTrackQueue(),a=track(1),b=track(2);q.select(a);q.adopt(b,b.id);assert.equal(q.getSnapshot().tracks.length,1);assert.equal(q.getSnapshot().track.id,b.id);assert.equal(q.getSnapshot().track.href,'/player?trackId='+b.id);
});
test('limpeza e troca de conta isolam fila e notificam assinantes', () => {
 const q=createTrackQueue({scope:'ana'}),other=createTrackQueue({scope:'gui'});let calls=0;const off=q.subscribe(()=>calls++);q.select(track(1));assert.equal(other.getSnapshot().track,null);q.clear();assert.equal(q.getSnapshot().index,-1);assert.equal(calls,2);off();q.select(track(2));assert.equal(calls,2);assert.equal(other.getTrack(track(2).id),null);
});
