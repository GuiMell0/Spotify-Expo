import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifySearch } from '../src/services/spotifySearch.mjs';
import { SpotifyApiError } from '../src/services/spotifyErrors.mjs';

const item = (id, title = id, type = 'track') => ({ id, title, type, href: '/player?trackId=' + id });
const page = (items = [], next = null) => ({ items, next, total: null, offset: 0 });
const delay = (ms = 20) => new Promise(resolve => setTimeout(resolve, ms));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function fixture(t, catalog = {}) {
  const calls = [];
  const store = createSpotifySearch({
    search: async (...args) => { calls.push(args); return catalog.search ? catalog.search(...args) : { tracks: page([item('one')]) }; },
    nextPage: catalog.nextPage ?? (async () => page()),
  }, { debounceMs: 5 });
  t.after(() => store.suspend());
  store.setActive(true);
  return { store, calls, state: () => store.getSnapshot() };
}

test('digitação rápida produz somente a consulta final após o debounce', async t => {
  const f = fixture(t);
  f.store.setQuery('r'); f.store.setQuery('ro'); f.store.setQuery('rock');
  assert.equal(f.calls.length, 0);
  await delay();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0][0], 'rock');
  assert.deepEqual(f.calls[0][1].types, ['album', 'artist', 'track', 'playlist']);
  assert.equal(f.calls[0][1].limit, 10);
  assert.equal(f.state().status, 'ready');
});
test('termo vazio não chama API e espaços externos não repetem busca equivalente', async t => {
  const f = fixture(t);
  f.store.setQuery('   '); await delay();
  assert.equal(f.calls.length, 0);
  f.store.setQuery('rock'); await delay();
  f.store.setQuery('rock  '); await delay();
  assert.equal(f.calls.length, 1);
});
test('limpar campo aborta consulta e descarta sucesso atrasado', async t => {
  const gate = deferred();
  const f = fixture(t, { search: () => gate.promise });
  f.store.setQuery('rock'); await delay();
  const signal = f.calls[0][1].signal;
  f.store.setQuery('');
  assert.equal(signal.aborted, true);
  gate.resolve({ tracks: page([item('old')]) }); await delay();
  assert.equal(f.state().status, 'idle');
  assert.deepEqual(f.state().groups, {});
});
test('resposta de termo antigo não substitui a pesquisa atual', async t => {
  const old = deferred();
  const f = fixture(t, { search: term => term === 'old' ? old.promise : Promise.resolve({ tracks: page([item('new')]) }) });
  f.store.setQuery('old'); await delay();
  f.store.setQuery('new'); await delay();
  old.resolve({ tracks: page([item('old')]) }); await delay();
  assert.equal(f.state().groups.tracks.items[0].id, 'new');
});
test('falha antiga não aparece como erro da consulta nova', async t => {
  const old = deferred();
  const f = fixture(t, { search: term => term === 'old' ? old.promise : Promise.resolve({ tracks: page([item('new')]) }) });
  f.store.setQuery('old'); await delay();
  f.store.setQuery('new'); await delay();
  old.reject(new SpotifyApiError('network')); await delay();
  assert.equal(f.state().status, 'ready');
  assert.equal(f.state().error, null);
});
test('mudança de termo remove resultados antigos na mesma notificação', async t => {
  const f = fixture(t);
  f.store.setQuery('old'); await delay();
  const snapshots = [];
  const unsubscribe = f.store.subscribe(() => snapshots.push(f.state()));
  f.store.setQuery('new');
  assert.ok(snapshots.every(state => state.query !== 'new' || Object.keys(state.groups).length === 0));
  unsubscribe();
});
test('filtro reinicia pesquisa e descarta resposta do filtro anterior', async t => {
  const gate = deferred();
  const f = fixture(t, { search: (_, options) => options.types.length > 1 ? gate.promise : Promise.resolve({ artists: page([item('artist', 'Artista', 'artist')]) }) });
  f.store.setQuery('teste'); await delay();
  f.store.setFilter('artist'); await delay();
  gate.resolve({ tracks: page([item('old')]) }); await delay();
  assert.equal(f.state().filter, 'artist');
  assert.deepEqual(f.calls[1][1].types, ['artist']);
  assert.deepEqual(Object.keys(f.state().groups), ['artists']);
});
test('falha encerra carregamento e permite repetição manual', async t => {
  let failing = true;
  const f = fixture(t, { search: async () => { if (failing) throw new SpotifyApiError('network'); return { tracks: page() }; } });
  f.store.setQuery('teste'); await delay();
  assert.equal(f.state().status, 'error');
  assert.equal(f.calls.length, 1);
  failing = false; f.store.retry(); await delay();
  assert.equal(f.state().status, 'ready');
  assert.equal(f.state().error, null);
  assert.deepEqual(f.state().groups.tracks.items, []);
});
test('mudar de tela cancela pendências e retoma pesquisa interrompida ao voltar', async t => {
  const gate = deferred();
  const f = fixture(t, { search: () => f.calls.length === 1 ? gate.promise : Promise.resolve({ tracks: page([item('fresh')]) }) });
  f.store.setQuery('teste'); await delay();
  f.store.setActive(false);
  assert.equal(f.calls[0][1].signal.aborted, true);
  assert.equal(f.state().status, 'paused');
  gate.resolve({ tracks: page([item('old')]) }); await delay();
  f.store.setActive(true); await delay();
  assert.equal(f.state().groups.tracks.items[0].id, 'fresh');
});
test('voltar de detalhe preserva consulta pronta sem nova chamada', async t => {
  const f = fixture(t);
  f.store.setQuery('teste'); await delay();
  f.store.setActive(false); f.store.setActive(true); await delay();
  assert.equal(f.calls.length, 1);
  assert.equal(f.state().query, 'teste');
  assert.equal(f.state().groups.tracks.items[0].id, 'one');
});
test('paginação ignora cliques duplicados, remove duplicatas e mantém itens anteriores', async t => {
  const gate = deferred(); let more = 0;
  const f = fixture(t, { search: async () => ({ tracks: page([item('one')], 'next') }), nextPage: async () => { more++; return gate.promise; } });
  f.store.setQuery('teste'); await delay();
  const loading = f.store.loadMore('tracks');
  await f.store.loadMore('tracks');
  assert.equal(more, 1);
  gate.resolve(page([item('one'), item('two')]));
  await loading;
  assert.deepEqual(f.state().groups.tracks.items.map(value => value.id), ['one', 'two']);
  assert.equal(f.state().groups.tracks.page.next, null);
});
test('falha de próxima página preserva resultados e cursor para tentar novamente', async t => {
  let failing = true;
  const f = fixture(t, {
    search: async () => ({ tracks: page([item('one')], 'next') }),
    nextPage: async () => { if (failing) throw new SpotifyApiError('timeout'); return page([item('two')]); },
  });
  f.store.setQuery('teste'); await delay();
  await f.store.loadMore('tracks');
  assert.equal(f.state().groups.tracks.error.code, 'timeout');
  assert.equal(f.state().groups.tracks.items.length, 1);
  failing = false;
  await f.store.loadMore('tracks');
  assert.equal(f.state().groups.tracks.items.length, 2);
  assert.equal(f.state().groups.tracks.error, null);
});
test('paginação antiga não mistura itens depois de trocar o termo', async t => {
  const gate = deferred();
  const f = fixture(t, { search: async term => ({ tracks: page([item(term)], term === 'old' ? 'next' : null) }), nextPage: () => gate.promise });
  f.store.setQuery('old'); await delay();
  const pending = f.store.loadMore('tracks');
  f.store.setQuery('new'); await delay();
  gate.resolve(page([item('old-page')])); await pending;
  assert.deepEqual(f.state().groups.tracks.items.map(value => value.id), ['new']);
});
test('categorias paginam de forma independente', async t => {
  const f = fixture(t, {
    search: async () => ({ tracks: page([item('one')], 'next'), artists: page([item('artist', 'Artista', 'artist')]) }),
    nextPage: async () => page([item('two')]),
  });
  f.store.setQuery('teste'); await delay();
  await f.store.loadMore('tracks');
  assert.equal(f.state().groups.artists.items[0].id, 'artist');
  assert.equal(f.state().groups.tracks.items.length, 2);
});
test('entidade selecionada e créditos são recuperados para navegação sem inventar metadados', async t => {
  const model = { ...item('track'), album: { id: 'album', type: 'album' }, artists: [{ id: 'artist', type: 'artist' }] };
  const f = fixture(t, { search: async () => ({ tracks: page([model]) }) });
  f.store.setQuery('teste'); await delay();
  assert.equal(f.store.getEntity('track', 'track'), model);
  assert.equal(f.store.getEntity('album', 'album'), model.album);
  assert.equal(f.store.getEntity('artist', 'artist'), model.artists[0]);
  assert.equal(f.store.getEntity('playlist', 'missing'), null);
});
test('instâncias de contas diferentes começam sem dados compartilhados', async t => {
  const f = fixture(t);
  f.store.setQuery('private'); await delay();
  const other = createSpotifySearch({}, { scope: 'other-account' });
  t.after(other.suspend);
  assert.equal(other.getSnapshot().scope, 'other-account');
  assert.equal(other.getSnapshot().query, '');
  assert.deepEqual(other.getSnapshot().groups, {});
});

test('visualização prioriza o artista completo da busca sobre créditos simplificados de álbum', async t => {
  const brief = { id: 'artist', type: 'artist', title: 'Crédito' };
  const full = { ...item('artist', 'Artista completo', 'artist'), image: { uri: 'https://images.test/artist' } };
  const f = fixture(t, { search: async () => ({
    albums: page([{ ...item('album', 'Álbum', 'album'), artists: [brief] }]),
    artists: page([full]),
  }) });
  f.store.setQuery('teste'); await delay();
  assert.equal(f.store.getEntity('artist', 'artist'), full);
});
