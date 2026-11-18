import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifyArtist } from '../src/services/spotifyArtist.mjs';
import { createSpotifyCatalog } from '../src/services/spotifyCatalog.mjs';
import { SpotifyApiError } from '../src/services/spotifyErrors.mjs';

const artist = (id = 'first') => ({ id, type: 'artist', title: id, image: null, genres: [] });
const album = (id, title = id) => ({ id, type: 'album', title });
const page = (items = [album('one')], next = null, skippedCount = 0) => ({ items, next, skippedCount });
const gate = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function fixture(t, overrides = {}, id = 'first', scope = 'account') {
  const calls = [];
  const catalog = {
    getArtist: async (...args) => { calls.push(['artist', ...args]); return overrides.getArtist ? overrides.getArtist(...args) : artist(id); },
    getArtistAlbums: async (...args) => { calls.push(['albums', ...args]); return overrides.getArtistAlbums ? overrides.getArtistAlbums(...args) : page(); },
    nextPage: async (...args) => { calls.push(['next', ...args]); return overrides.nextPage ? overrides.nextPage(...args) : page([album('two')]); },
  };
  const store = createSpotifyArtist(catalog, id, { scope });
  t.after(store.suspend);
  return { store, calls, state: store.getSnapshot };
}

test('consulta artista e álbuns do mesmo ID com grupos e limite compatíveis', async t => {
  const f = fixture(t);
  await f.store.setActive(true);
  assert.deepEqual(f.calls.map(call => call.slice(0, 2)), [['artist', 'first'], ['albums', 'first']]);
  assert.deepEqual(f.calls[1][2].groups, ['album', 'single']);
  assert.equal(f.calls[1][2].limit, 10);
  assert.equal(f.calls[0][2].signal, f.calls[1][2].signal);
  assert.equal(f.state().status, 'ready');
});

test('publica metadados antes da discografia terminar', async t => {
  const pending = gate();
  const f = fixture(t, { getArtistAlbums: () => pending.promise });
  const run = f.store.setActive(true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.state().artist.id, 'first');
  assert.equal(f.state().page, null);
  assert.equal(f.state().status, 'loading');
  pending.resolve(page()); await run;
  assert.equal(f.state().status, 'ready');
});

test('falha na discografia conserva metadados e não apresenta falso estado vazio', async t => {
  const f = fixture(t, { getArtistAlbums: async () => { throw new SpotifyApiError('forbidden'); } });
  await f.store.setActive(true);
  assert.equal(f.state().artist.id, 'first');
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().page, null);
  assert.equal(f.state().error.code, 'forbidden');
});

test('403 e 404 no artista não consultam discografia nem demonstração', async t => {
  for (const code of ['forbidden', 'not_found']) {
    const f = fixture(t, { getArtist: async () => { throw new SpotifyApiError(code); } });
    await f.store.setActive(true);
    assert.equal(f.calls.length, 1);
    assert.equal(f.state().artist, null);
    assert.equal(f.state().error.code, code);
  }
});

test('ID malformado falha antes de qualquer chamada HTTP', async t => {
  let network = 0;
  const store = createSpotifyArtist(createSpotifyCatalog({ get: async () => { network++; } }), 'pierce-the-veil');
  t.after(store.suspend);
  await store.setActive(true);
  assert.equal(store.getSnapshot().error.code, 'invalid_id');
  assert.equal(network, 0);
});

test('IDs distintos e contas distintas não compartilham artista ou páginas', async t => {
  const first = fixture(t, {}, 'first', 'ana');
  const second = fixture(t, { getArtistAlbums: async () => page([album('other')]) }, 'second', 'ana');
  const anotherAccount = fixture(t, { getArtistAlbums: async () => page([]) }, 'first', 'gui');
  await Promise.all([first.store.setActive(true), second.store.setActive(true), anotherAccount.store.setActive(true)]);
  assert.equal(first.state().artist.id, 'first');
  assert.equal(second.state().artist.id, 'second');
  assert.deepEqual(second.state().albums.map(item => item.id), ['other']);
  assert.deepEqual(first.state().albums.map(item => item.id), ['one']);
  assert.deepEqual(anotherAccount.state().albums, []);
  assert.equal(anotherAccount.state().scope, 'gui');
});

test('sair durante consulta do artista aborta e ignora retorno tardio', async t => {
  const pending = gate();
  const f = fixture(t, { getArtist: () => pending.promise });
  const run = f.store.setActive(true);
  await new Promise(resolve => setImmediate(resolve));
  await f.store.setActive(false);
  assert.equal(f.calls[0][2].signal.aborted, true);
  pending.resolve(artist()); await run;
  assert.equal(f.state().artist, null);
  assert.equal(f.calls.length, 1);
  assert.equal(f.state().status, 'paused');
});

test('sair durante a discografia não publica página de consulta antiga', async t => {
  const pending = gate();
  const f = fixture(t, { getArtistAlbums: () => pending.promise });
  const run = f.store.setActive(true);
  await new Promise(resolve => setImmediate(resolve));
  await f.store.setActive(false);
  pending.resolve(page([album('late')])); await run;
  assert.equal(f.calls[1][2].signal.aborted, true);
  assert.equal(f.state().artist.id, 'first');
  assert.equal(f.state().page, null);
  assert.deepEqual(f.state().albums, []);
});

test('voltar do álbum conserva todas as páginas sem repetir as consultas', async t => {
  const f = fixture(t, { getArtistAlbums: async () => page([album('one')], 'next') });
  await f.store.setActive(true); await f.store.loadMore();
  await f.store.setActive(false); await f.store.setActive(true);
  assert.equal(f.calls.length, 3);
  assert.deepEqual(f.state().albums.map(item => item.id), ['one', 'two']);
});

test('páginas deduplicam por ID e conservam edições distintas com mesmo título', async t => {
  const f = fixture(t, {
    getArtistAlbums: async () => page([album('one', 'Título')], 'next'),
    nextPage: async () => page([album('one', 'Título'), album('edition', 'Título')]),
  });
  await f.store.setActive(true); await f.store.loadMore();
  assert.deepEqual(f.state().albums.map(item => item.id), ['one', 'edition']);
});

test('paginação usa o cursor original e pode repetir após falha sem perder álbuns', async t => {
  const original = page([album('one')], 'next');
  let failed = true;
  const f = fixture(t, {
    getArtistAlbums: async () => original,
    nextPage: async value => { assert.equal(value, original); if (failed) throw new SpotifyApiError('timeout'); return page([album('two')]); },
  });
  await f.store.setActive(true); await f.store.loadMore();
  assert.deepEqual(f.state().albums.map(item => item.id), ['one']);
  assert.equal(f.state().page, original);
  assert.equal(f.state().moreError.code, 'timeout');
  failed = false; await f.store.loadMore();
  assert.equal(f.state().moreError, null);
  assert.deepEqual(f.state().albums.map(item => item.id), ['one', 'two']);
});

test('toques repetidos em carregar mais compartilham a operação', async t => {
  const pending = gate();
  const f = fixture(t, { getArtistAlbums: async () => page([album('one')], 'next'), nextPage: () => pending.promise });
  await f.store.setActive(true);
  const run = f.store.loadMore();
  assert.equal(f.store.loadMore(), run);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.calls.filter(call => call[0] === 'next').length, 1);
  pending.resolve(page()); await run;
});

test('sair durante próxima página aborta e conserva apenas a lista já exibida', async t => {
  const pending = gate();
  const f = fixture(t, { getArtistAlbums: async () => page([album('one')], 'next'), nextPage: () => pending.promise });
  await f.store.setActive(true);
  const run = f.store.loadMore();
  await new Promise(resolve => setImmediate(resolve));
  await f.store.setActive(false);
  pending.resolve(page([album('late')])); await run;
  assert.equal(f.calls.at(-1)[1].items[0].id, 'one'); // O cursor preserva os itens da primeira página.
  assert.equal(f.calls.at(-1)[2].signal.aborted, true);
  assert.deepEqual(f.state().albums.map(item => item.id), ['one']);
  assert.equal(f.state().loadingMore, false);
});

test('atualizar reinicia primeira página e remove álbuns de páginas anteriores', async t => {
  const f = fixture(t, { getArtistAlbums: async () => page([album('one')], 'next') });
  await f.store.setActive(true); await f.store.loadMore(); await f.store.refresh();
  assert.deepEqual(f.state().albums.map(item => item.id), ['one']);
  assert.equal(f.calls.filter(call => call[0] === 'artist').length, 2);
});

test('falha na atualização mantém artista e álbuns reais da mesma rota', async t => {
  let fail = false;
  const f = fixture(t, { getArtist: async () => { if (fail) throw new SpotifyApiError('network'); return artist(); } });
  await f.store.setActive(true); fail = true; await f.store.refresh();
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().artist.id, 'first');
  assert.deepEqual(f.state().albums.map(item => item.id), ['one']);
});

test('discografia vazia concluída não é erro e não busca outras páginas', async t => {
  const f = fixture(t, { getArtistAlbums: async () => page([]) });
  await f.store.setActive(true); await f.store.loadMore();
  assert.equal(f.state().status, 'ready');
  assert.deepEqual(f.state().albums, []);
  assert.equal(f.calls.length, 2);
});

test('página sem itens válidos pode avançar e contabiliza omissões', async t => {
  const f = fixture(t, { getArtistAlbums: async () => page([], 'next', 2), nextPage: async () => page([album('two')], null, 1) });
  await f.store.setActive(true); await f.store.loadMore();
  assert.deepEqual(f.state().albums.map(item => item.id), ['two']);
  assert.equal(f.state().skippedCount, 3);
});

test('429 encerra carregamento e preserva prazo de espera sem repetir sozinho', async t => {
  const error = new SpotifyApiError('rate_limited', { retryAt: Date.now() + 2000 });
  const f = fixture(t, { getArtistAlbums: async () => { throw error; } });
  await f.store.setActive(true);
  assert.equal(f.state().error, error);
  assert.equal(f.state().status, 'error');
  assert.equal(f.calls.length, 2);
});

test('retornar após erro não reinicia consultas; recuperação é manual', async t => {
  let fail = true;
  const f = fixture(t, { getArtistAlbums: async () => { if (fail) throw new SpotifyApiError('server'); return page(); } });
  await f.store.setActive(true); await f.store.setActive(false); await f.store.setActive(true);
  assert.equal(f.calls.length, 2);
  fail = false; await f.store.refresh();
  assert.equal(f.state().status, 'ready');
});

test('retomar carregamento interrompido inicia operação nova e ignora a antiga', async t => {
  const pending = gate();
  let count = 0;
  const f = fixture(t, { getArtist: () => ++count === 1 ? pending.promise : Promise.resolve(artist('new')) });
  const previous = f.store.setActive(true);
  await new Promise(resolve => setImmediate(resolve));
  await f.store.setActive(false); await f.store.setActive(true);
  pending.resolve(artist('old')); await previous;
  assert.equal(f.state().artist.id, 'new');
  assert.equal(f.state().status, 'ready');
});

test('metadados de ID diferente são rejeitados antes de consultar álbuns', async t => {
  let calls = 0;
  const catalog = createSpotifyCatalog({ get: async () => { calls++; return { id: 'B'.repeat(22), type: 'artist', name: 'Outro' }; } });
  const store = createSpotifyArtist(catalog, 'A'.repeat(22));
  t.after(store.suspend);
  await store.setActive(true);
  assert.equal(store.getSnapshot().error.code, 'invalid_response');
  assert.equal(calls, 1);
});
