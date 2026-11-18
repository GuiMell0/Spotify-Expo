import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifyHome } from '../src/services/spotifyHome.mjs';
import { createSpotifySearch } from '../src/services/spotifySearch.mjs';
import { SpotifyApiError } from '../src/services/spotifyErrors.mjs';

const item = (id, type = 'track', title = id) => ({ id, type, title, href: '/' + type + '/' + id });
const result = () => ({ tracks: { items: [item('track')] }, albums: { items: [item('album', 'album')] }, artists: { items: [item('artist', 'artist')] } });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function fixture(t, handler = async () => result(), options = {}) {
  const calls = [];
  const home = createSpotifyHome({ search: async (...args) => { calls.push(args); return handler(...args); } }, options);
  t.after(home.suspend);
  return { home, calls, state: home.getSnapshot };
}

test('uma consulta real abastece as três seções sem rankings ou dados inventados', async t => {
  const f = fixture(t);
  await f.home.setActive(true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0][0], 'música brasileira');
  assert.deepEqual(f.calls[0][1].types, ['track', 'album', 'artist']);
  assert.equal(f.calls[0][1].limit, 6);
  assert.equal(f.state().status, 'ready');
  assert.deepEqual(f.state().sections.map(section => section.items[0].type), ['track', 'album', 'artist']);
});
test('instância inativa não busca dados e pode ser usada no provedor sem ativar a demonstração', async t => {
  const f = fixture(t);
  await f.home.refresh();
  await f.home.setTopic('rock');
  assert.equal(f.calls.length, 0);
});
test('voltar de detalhe preserva cache sem fazer outra consulta', async t => {
  const f = fixture(t);
  await f.home.setActive(true);
  await f.home.setActive(false);
  await f.home.setActive(true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.state().sections.length, 3);
});
test('cache vencido recarrega ao retornar à tela', async t => {
  let clock = 100;
  const f = fixture(t, async () => result(), { now: () => clock, cacheMs: 1000 });
  await f.home.setActive(true);
  await f.home.setActive(false);
  clock = 1101;
  await f.home.setActive(true);
  assert.equal(f.calls.length, 2);
  assert.equal(f.state().updatedAt, 1101);
});
test('cada tema possui cache próprio e parâmetros de consulta correspondentes', async t => {
  const f = fixture(t, async term => ({ ...result(), tracks: { items: [item(term)] } }));
  await f.home.setActive(true);
  await f.home.setTopic('rock');
  assert.equal(f.state().sections[0].items[0].id, 'rock');
  await f.home.setTopic('brasil');
  assert.equal(f.calls.length, 2);
  assert.equal(f.state().sections[0].items[0].id, 'música brasileira');
  assert.deepEqual(f.calls.map(call => call[0]), ['música brasileira', 'rock']);
});
test('atualização manual ignora cache e cliques repetidos compartilham a operação', async t => {
  const gate = deferred(); let blocked = false;
  const f = fixture(t, async () => { if (blocked) await gate.promise; return result(); });
  await f.home.setActive(true);
  blocked = true;
  const first = f.home.refresh();
  const second = f.home.refresh();
  assert.equal(first, second);
  gate.resolve();
  await first;
  assert.equal(f.calls.length, 2);
});
test('lista vazia é um resultado concluído e não dispara fallback ou repetição', async t => {
  const f = fixture(t, async () => ({ tracks: { items: [] }, albums: { items: [] }, artists: { items: [] } }));
  await f.home.setActive(true);
  assert.equal(f.state().status, 'ready');
  assert.ok(f.state().sections.every(section => section.items.length === 0));
  assert.equal(f.calls.length, 1);
});
test('erro inicial encerra carregamento e só repete por ação manual', async t => {
  let failed = true;
  const f = fixture(t, async () => { if (failed) throw new SpotifyApiError('network'); return result(); });
  await f.home.setActive(true);
  assert.equal(f.state().status, 'error');
  await f.home.setActive(false);
  await f.home.setActive(true);
  assert.equal(f.calls.length, 1);
  failed = false;
  await f.home.refresh();
  assert.equal(f.state().status, 'ready');
});
test('falha ao atualizar preserva dados reais do mesmo tema e sinaliza o erro', async t => {
  let failed = false;
  const f = fixture(t, async () => { if (failed) throw new SpotifyApiError('timeout'); return result(); });
  await f.home.setActive(true);
  const sections = f.state().sections;
  failed = true;
  await f.home.refresh();
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().error.code, 'timeout');
  assert.equal(f.state().sections, sections);
});
test('troca de tema não exibe cache de outro tema depois de falhar', async t => {
  const f = fixture(t, async term => { if (term === 'rock') throw new SpotifyApiError('server'); return result(); });
  await f.home.setActive(true);
  await f.home.setTopic('rock');
  assert.equal(f.state().topic, 'rock');
  assert.equal(f.state().status, 'error');
  assert.deepEqual(f.state().sections, []);
});
test('resposta antiga é descartada ao trocar de tema durante a consulta', async t => {
  const gate = deferred();
  const f = fixture(t, term => term === 'música brasileira' ? gate.promise : Promise.resolve(result()));
  const old = f.home.setActive(true);
  await Promise.resolve();
  await f.home.setTopic('rock');
  gate.resolve({ ...result(), tracks: { items: [item('old')] } });
  await old;
  assert.equal(f.calls[0][1].signal.aborted, true);
  assert.equal(f.state().topic, 'rock');
  assert.equal(f.state().sections[0].items[0].id, 'track');
});
test('sair durante carregamento cancela e retoma consulta interrompida ao voltar', async t => {
  const gate = deferred(); let blocked = true;
  const f = fixture(t, async () => blocked ? gate.promise : result());
  const old = f.home.setActive(true);
  await Promise.resolve();
  await f.home.setActive(false);
  assert.equal(f.state().status, 'paused');
  assert.equal(f.calls[0][1].signal.aborted, true);
  blocked = false;
  gate.resolve(result()); await old;
  await f.home.setActive(true);
  assert.equal(f.calls.length, 2);
  assert.equal(f.state().status, 'ready');
});
test('dados repetidos não criam cartões duplicados na mesma seção', async t => {
  const f = fixture(t, async () => ({ ...result(), tracks: { items: [item('same'), item('same'), item('other')] } }));
  await f.home.setActive(true);
  assert.deepEqual(f.state().sections[0].items.map(value => value.id), ['same', 'other']);
});
test('instâncias de contas diferentes começam sem cache compartilhado', async t => {
  const f = fixture(t, async () => result(), { scope: 'first' });
  await f.home.setActive(true);
  const other = createSpotifyHome({}, { scope: 'second' });
  t.after(other.suspend);
  assert.equal(other.getSnapshot().scope, 'second');
  assert.deepEqual(other.getSnapshot().sections, []);
});
test('item aberto na Home é lembrado sem alterar termo e filtro da busca', () => {
  const search = createSpotifySearch({});
  const selected = item('home-album', 'album', 'Álbum real da Home');
  search.rememberEntity(selected);
  assert.equal(search.getEntity('album', 'home-album'), selected);
  assert.equal(search.getSnapshot().query, '');
  assert.equal(search.getSnapshot().filter, 'all');
  const other = createSpotifySearch({});
  assert.equal(other.getEntity('album', 'home-album'), null);
});
test('entidade selecionada mais recentemente prevalece sobre metadados anteriores', async t => {
  const search = createSpotifySearch({ search: async () => ({ artists: { items: [item('same', 'artist', 'Nome anterior')] } }) }, { debounceMs: 0 });
  t.after(search.suspend);
  search.setActive(true);
  search.setQuery('teste');
  await new Promise(resolve => setTimeout(resolve, 20));
  const fresh = item('same', 'artist', 'Nome atual');
  search.rememberEntity(fresh);
  assert.equal(search.getEntity('artist', 'same'), fresh);
});
