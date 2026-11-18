import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifyAlbum, albumTrackKey } from '../src/services/spotifyAlbum.mjs';
import { createSpotifyCatalog } from '../src/services/spotifyCatalog.mjs';
import { SpotifyApiError } from '../src/services/spotifyErrors.mjs';

const track = (id, trackNumber = 1, discNumber = 1) => ({ id, type: 'track', title: id, trackNumber, discNumber });
const page = (items = [], next = null, skippedCount = 0) => ({ items, next, skippedCount });
const album = (id = 'first', tracks = page([track('one')])) => ({ id, type: 'album', title: id, artists: [], image: null, totalTracks: null, tracks });
const gate = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function fixture(t, overrides = {}, id = 'first') {
  const calls = [];
  const catalog = {
    getAlbum: async (...args) => { calls.push(['album', ...args]); return overrides.getAlbum ? overrides.getAlbum(...args) : album(id); },
    getAlbumTracks: async (...args) => { calls.push(['tracks', ...args]); return overrides.getAlbumTracks ? overrides.getAlbumTracks(...args) : page([track('fallback')]); },
    nextPage: async (...args) => { calls.push(['next', ...args]); return overrides.nextPage ? overrides.nextPage(...args) : page([track('two', 2)]); },
  };
  const store = createSpotifyAlbum(catalog, id);
  t.after(store.suspend);
  return { store, calls, state: store.getSnapshot };
}

test('carrega o ID solicitado e aproveita a primeira página incluída no álbum', async t => {
  const f = fixture(t);
  await f.store.setActive(true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0][1], 'first');
  assert.equal(f.state().status, 'ready');
  assert.equal(f.state().album.id, 'first');
  assert.equal(f.state().tracks[0].id, 'one');
});
test('quando a lista não vem nos detalhes, consulta faixas com contexto do mesmo álbum', async t => {
  const metadata = album('first', null);
  const f = fixture(t, { getAlbum: async () => metadata });
  await f.store.setActive(true);
  assert.deepEqual(f.calls.map(call => call[0]), ['album', 'tracks']);
  assert.equal(f.calls[1][2].album, metadata);
  assert.equal(f.calls[0][2].signal, f.calls[1][2].signal);
  assert.equal(f.state().tracks[0].id, 'fallback');
});
test('falha ao consultar a lista preserva metadados sem apresentar álbum vazio', async t => {
  const f = fixture(t, { getAlbum: async () => album('first', null), getAlbumTracks: async () => { throw new SpotifyApiError('forbidden'); } });
  await f.store.setActive(true);
  assert.equal(f.state().album.id, 'first');
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().page, null);
  assert.equal(f.state().error.code, 'forbidden');
});
test('instâncias de rotas diferentes não compartilham dados do álbum', async t => {
  const first = fixture(t, {}, 'first');
  const second = fixture(t, {}, 'second');
  await first.store.setActive(true);
  assert.equal(second.state().album, null);
  await second.store.setActive(true);
  assert.equal(first.state().album.id, 'first');
  assert.equal(second.state().album.id, 'second');
});
test('sair durante carregamento aborta e descarta resposta tardia', async t => {
  const pending = gate();
  const f = fixture(t, { getAlbum: () => pending.promise });
  const loading = f.store.setActive(true);
  await Promise.resolve();
  await f.store.setActive(false);
  assert.equal(f.calls[0][2].signal.aborted, true);
  pending.resolve(album());
  await loading;
  assert.equal(f.state().album, null);
  assert.equal(f.state().status, 'paused');
});
test('voltar do artista ou faixa preserva a lista carregada sem nova consulta', async t => {
  const f = fixture(t);
  await f.store.setActive(true);
  await f.store.setActive(false);
  await f.store.setActive(true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.state().tracks[0].id, 'one');
});
test('páginas acumulam faixas sem duplicar a mesma posição e ID', async t => {
  const f = fixture(t, {
    getAlbum: async () => album('first', page([track('one')], 'next')),
    nextPage: async () => page([track('one'), track('two', 2)]),
  });
  await f.store.setActive(true);
  await f.store.loadMore();
  assert.deepEqual(f.state().tracks.map(value => value.id), ['one', 'two']);
  assert.equal(f.state().page.next, null);
});
test('mesma gravação em posições ou discos distintos continua na lista', async t => {
  const f = fixture(t, {
    getAlbum: async () => album('first', page([track('same', 1, 1)], 'next')),
    nextPage: async () => page([track('same', 1, 1), track('same', 2, 1), track('same', 1, 2)]),
  });
  await f.store.setActive(true);
  await f.store.loadMore();
  assert.equal(f.state().tracks.length, 3);
  assert.equal(new Set(f.state().tracks.map(albumTrackKey)).size, 3);
});
test('toques repetidos durante paginação compartilham uma chamada', async t => {
  const pending = gate();
  const f = fixture(t, { getAlbum: async () => album('first', page([track('one')], 'next')), nextPage: () => pending.promise });
  await f.store.setActive(true);
  const first = f.store.loadMore();
  const second = f.store.loadMore();
  assert.equal(first, second);
  pending.resolve(page([track('two', 2)]));
  await first;
  assert.equal(f.calls.filter(call => call[0] === 'next').length, 1);
});
test('falha de paginação conserva lista e cursor para repetir manualmente', async t => {
  let fail = true;
  const f = fixture(t, {
    getAlbum: async () => album('first', page([track('one')], 'next')),
    nextPage: async () => { if (fail) throw new SpotifyApiError('timeout'); return page([track('two', 2)]); },
  });
  await f.store.setActive(true);
  await f.store.loadMore();
  assert.equal(f.state().moreError.code, 'timeout');
  assert.equal(f.state().tracks.length, 1);
  assert.equal(f.state().page.next, 'next');
  fail = false; await f.store.loadMore();
  assert.equal(f.state().moreError, null);
  assert.equal(f.state().tracks.length, 2);
});
test('sair durante paginação não acrescenta itens de uma resposta antiga', async t => {
  const pending = gate();
  const f = fixture(t, { getAlbum: async () => album('first', page([track('one')], 'next')), nextPage: () => pending.promise });
  await f.store.setActive(true);
  const loading = f.store.loadMore();
  await Promise.resolve();
  await f.store.setActive(false);
  pending.resolve(page([track('old', 2)])); await loading;
  await f.store.setActive(true);
  assert.deepEqual(f.state().tracks.map(value => value.id), ['one']);
  assert.equal(f.state().loadingMore, false);
});
test('atualizar reinicia pela primeira página e não preserva faixas de página antiga', async t => {
  let refreshed = false;
  const f = fixture(t, { getAlbum: async () => album('first', page([track(refreshed ? 'fresh' : 'one')], refreshed ? null : 'next')) });
  await f.store.setActive(true);
  await f.store.loadMore();
  refreshed = true;
  await f.store.refresh();
  assert.deepEqual(f.state().tracks.map(value => value.id), ['fresh']);
  assert.equal(f.state().page.next, null);
});
test('erro de atualização pode manter faixas reais já carregadas do mesmo ID', async t => {
  let fail = false;
  const f = fixture(t, { getAlbum: async () => { if (fail) throw new SpotifyApiError('network'); return album(); } });
  await f.store.setActive(true);
  fail = true; await f.store.refresh();
  assert.equal(f.state().status, 'error');
  assert.equal(f.state().tracks[0].id, 'one');
});
test('lista vazia concluída é diferente de metadados sem lista', async t => {
  const f = fixture(t, { getAlbum: async () => album('first', page()) });
  await f.store.setActive(true);
  assert.equal(f.state().status, 'ready');
  assert.deepEqual(f.state().tracks, []);
  assert.equal(f.calls.length, 1);
});
test('página sem itens suportados ainda permite carregar a próxima e soma omissões', async t => {
  const f = fixture(t, {
    getAlbum: async () => album('first', page([], 'next', 2)),
    nextPage: async () => page([track('two')], null, 1),
  });
  await f.store.setActive(true);
  await f.store.loadMore();
  assert.equal(f.state().tracks.length, 1);
  assert.equal(f.state().skippedCount, 3);
});
test('última página não faz requisição extra', async t => {
  const f = fixture(t);
  await f.store.setActive(true);
  await f.store.loadMore();
  assert.equal(f.calls.length, 1);
});
test('403, 404 e 429 encerram carregamento sem buscar demonstração', async t => {
  for (const code of ['forbidden', 'not_found', 'rate_limited']) {
    const f = fixture(t, { getAlbum: async () => { throw new SpotifyApiError(code); } });
    await f.store.setActive(true);
    assert.equal(f.state().status, 'error');
    assert.equal(f.state().error.code, code);
    assert.equal(f.state().album, null);
    assert.equal(f.calls.length, 1);
  }
});
test('voltar após erro não inicia tentativas em ciclo; recuperação é manual', async t => {
  let fail = true;
  const f = fixture(t, { getAlbum: async () => { if (fail) throw new SpotifyApiError('network'); return album(); } });
  await f.store.setActive(true);
  await f.store.setActive(false);
  await f.store.setActive(true);
  assert.equal(f.calls.length, 1);
  fail = false; await f.store.refresh();
  assert.equal(f.state().status, 'ready');
});
test('identificador malformado é rejeitado pelo catálogo antes de chegar à API', async t => {
  let network = 0;
  const catalog = createSpotifyCatalog({ get: async () => { network++; } });
  const store = createSpotifyAlbum(catalog, 'misadventures');
  t.after(store.suspend);
  await store.setActive(true);
  assert.equal(store.getSnapshot().error.code, 'invalid_id');
  assert.equal(network, 0);
});
