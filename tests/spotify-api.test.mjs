import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpotifyApiClient } from '../src/services/spotifyApi.mjs';
import { SpotifyApiError, SpotifyAuthError, apiErrorMessage } from '../src/services/spotifyErrors.mjs';
import { createSessionManager } from '../src/services/sessionManager.mjs';
import { createVolatileSessionStorage } from '../src/storage/volatileSession.mjs';

const response = (data = { ok: true }, status = 200, retryAfter) => ({
  ok: status >= 200 && status < 300, status,
  headers: { get: key => key.toLowerCase() === 'retry-after' ? retryAfter ?? null : null },
  json: async () => data,
});
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const make = options => createSpotifyApiClient({ getAccessToken: async () => 'test-access', ...options });
const session = { accessToken: 'old-access', refreshToken: 'test-refresh', expiresAt: 1000000, scope: '', user: { id: 'test-user' } };
async function connected(fetchImpl, refreshSession) {
  const manager = createSessionManager({
    clientId: 'synthetic-client', storage: createVolatileSessionStorage(), now: () => 100,
    refreshSession: refreshSession ?? (async ({ session: old }) => ({ ...old, accessToken: 'new-access' })),
  });
  await manager.accept(session);
  const api = make({ fetchImpl, getAccessToken: manager.getAccessToken, getSessionVersion: manager.getSessionVersion, onUnauthorized: () => manager.clear() });
  return { manager, api };
}

test('envia Bearer e codifica busca sem gravar credenciais na URL', async () => {
  let called = 0;
  const api = make({ fetchImpl: async (url, options) => {
    called++;
    const parsed = new URL(url);
    assert.equal(parsed.origin, 'https://api.spotify.com');
    assert.equal(parsed.pathname, '/v1/search');
    assert.equal(parsed.searchParams.get('q'), 'rock & música brasileira');
    assert.equal(parsed.searchParams.get('limit'), '10');
    assert.equal(parsed.searchParams.has('empty'), false);
    assert.equal(url.includes('test-access'), false);
    assert.equal(options.headers.Authorization, 'Bearer test-access');
    assert.equal(options.method, 'GET');
    assert.equal(options.redirect, 'error');
    return response({ items: [] });
  } });
  assert.deepEqual(await api.get('/search', { query: { q: 'rock & música brasileira', limit: 10, empty: null } }), { items: [] });
  assert.equal(called, 1);
});
test('aceita URL absoluta de paginação somente no domínio e versão corretos', async () => {
  const api = make({ fetchImpl: async url => { assert.equal(url, 'https://api.spotify.com/v1/albums/test/tracks?offset=10'); return response(); } });
  await api.get('https://api.spotify.com/v1/albums/test/tracks?offset=10');
});
test('recusa URLs externas, credenciais, fragmentos e caminhos fora da API antes do token', async () => {
  let accesses = 0;
  const api = make({ getAccessToken: async () => { accesses++; }, fetchImpl: async () => { throw new Error('never'); } });
  for (const endpoint of ['https://evil.invalid/v1/me', '//evil.invalid/me', 'https://api.spotify.com/other/me', '../me', 'https://user:pass@api.spotify.com/v1/me', '/me#token', '/me?access_token=secret', '/me?client_secret=secret']) {
    await assert.rejects(api.get(endpoint), { code: 'invalid_url' });
  }
  assert.equal(accesses, 0);
});
test('204 não tenta interpretar corpo ausente', async () => {
  const api = make({ fetchImpl: async () => ({ ok: true, status: 204, json: async () => { throw new Error('never'); } }) });
  assert.equal(await api.get('/me'), null);
});
test('401 renova uma vez e repete a consulta com o novo token', async () => {
  const tokens = []; let refreshed = 0;
  const { api } = await connected(async (_, options) => {
    tokens.push(options.headers.Authorization);
    return response({}, tokens.length === 1 ? 401 : 200);
  }, async ({ session: old }) => { refreshed++; return { ...old, accessToken: 'new-access' }; });
  await api.get('/me');
  assert.deepEqual(tokens, ['Bearer old-access', 'Bearer new-access']);
  assert.equal(refreshed, 1);
});
test('segundo 401 encerra a sessão sem repetir indefinidamente', async () => {
  let calls = 0; let refreshed = 0;
  const { api, manager } = await connected(async () => { calls++; return response({}, 401); },
    async ({ session: old }) => { refreshed++; return { ...old, accessToken: 'new-access' }; });
  await assert.rejects(api.get('/me'), { code: 'unauthorized' });
  assert.equal(calls, 2);
  assert.equal(refreshed, 1);
  assert.equal(manager.getSession(), null);
});
test('401 simultâneo ou atrasado compartilha renovação já concluída', async () => {
  const late = deferred(); let refreshed = 0; let oldCalls = 0;
  const { api } = await connected(async (url, options) => {
    if (options.headers.Authorization === 'Bearer old-access') {
      oldCalls++;
      if (url.endsWith('/late')) await late.promise;
      return response({}, 401);
    }
    return response();
  }, async ({ session: old }) => { refreshed++; return { ...old, accessToken: 'new-access' }; });
  const pending = api.get('/late');
  await api.get('/first');
  late.resolve(); await pending;
  assert.equal(oldCalls, 2);
  assert.equal(refreshed, 1);
});
test('falha transitória na renovação não dispara outra consulta nem apaga conta', async () => {
  let calls = 0;
  const { api, manager } = await connected(async () => { calls++; return response({}, 401); },
    async () => { throw new SpotifyAuthError('network', 'synthetic'); });
  await assert.rejects(api.get('/me'), { code: 'network' });
  assert.equal(calls, 1);
  assert.equal(manager.getSession().user.id, 'test-user');
});
test('consulta inicial do login pode desativar repetição de 401', async () => {
  let calls = 0; let tokenCalls = 0;
  const api = make({ getAccessToken: async () => { tokenCalls++; return 'test'; }, fetchImpl: async () => { calls++; return response({}, 401); } });
  await assert.rejects(api.get('/me', { retryUnauthorized: false }), { code: 'unauthorized' });
  assert.equal(calls, 1); assert.equal(tokenCalls, 1);
});
for (const [status, code] of [[400, 'bad_request'], [403, 'forbidden'], [404, 'not_found'], [500, 'server'], [503, 'server']]) {
  test('HTTP ' + status + ' retorna erro próprio sem renovar nem exibir mensagem do servidor', async () => {
    let tokens = 0; let calls = 0;
    const api = make({ getAccessToken: async () => { tokens++; return 'test'; }, fetchImpl: async () => { calls++; return response({ error: { message: 'private-token-must-not-leak' } }, status); } });
    await assert.rejects(api.get('/me'), error => error instanceof SpotifyApiError && error.code === code && error.status === status && !error.message.includes('private-token'));
    assert.equal(tokens, 1); assert.equal(calls, 1);
  });
}
test('429 respeita Retry-After para todos os endpoints sem esperar nem repetir sozinho', async () => {
  let now = 1000; let calls = 0;
  const api = make({ now: () => now, fetchImpl: async () => { calls++; return calls === 1 ? response({}, 429, '2') : response(); } });
  await assert.rejects(api.get('/me'), { code: 'rate_limited', retryAt: 3000 });
  await assert.rejects(api.get('/albums/test'), { code: 'rate_limited', retryAt: 3000 });
  assert.equal(calls, 1);
  now = 3000; await api.get('/me');
  assert.equal(calls, 2);
});
test('Retry-After ausente usa espera conservadora e zero permite repetição manual imediata', async () => {
  for (const [header, expected] of [[undefined, 31000], ['0', 1000]]) {
    const api = make({ now: () => 1000, fetchImpl: async () => response({}, 429, header) });
    await assert.rejects(api.get('/me'), { code: 'rate_limited', retryAt: expected });
  }
});
test('QUOTA_EXCEEDED é distinguido de limite temporário', async () => {
  const api = make({ fetchImpl: async () => response({ error: { status: 429, reason: 'QUOTA_EXCEEDED', message: 'private' } }, 429, '10') });
  await assert.rejects(api.get('/me'), error => error.code === 'quota_exceeded' && !error.retryable);
});
test('timeout abrange fetch que ignora AbortSignal', async () => {
  const api = make({ timeoutMs: 10, fetchImpl: async () => new Promise(() => {}) });
  await assert.rejects(api.get('/me'), { code: 'timeout' });
});
test('timeout abrange leitura do JSON e espera de token', async () => {
  const never = () => new Promise(() => {});
  await assert.rejects(make({ timeoutMs: 10, getAccessToken: never }).get('/me'), { code: 'timeout' });
  await assert.rejects(make({ timeoutMs: 10, fetchImpl: async () => ({ ok: true, status: 200, json: never }) }).get('/me'), { code: 'timeout' });
});
test('cancelamento prévio não acessa token nem rede', async () => {
  const controller = new AbortController(); controller.abort(); let called = false;
  const api = make({ getAccessToken: async () => { called = true; } });
  await assert.rejects(api.get('/me', { signal: controller.signal }), { code: 'cancelled' });
  assert.equal(called, false);
});
test('cancelamento durante espera não executa fetch quando o token chega atrasado', async () => {
  const gate = deferred(); const controller = new AbortController(); let called = false;
  const api = make({ getAccessToken: () => gate.promise, fetchImpl: async () => { called = true; return response(); } });
  const pending = api.get('/me', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: 'cancelled' });
  gate.resolve('test'); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(called, false);
});
test('logout ou troca de conta descarta resposta e não invalida nova conta', async () => {
  const gate = deferred();
  const { api, manager } = await connected(async () => { await gate.promise; return response({}, 401); });
  const oldVersion = manager.getSessionVersion();
  const pending = api.get('/me');
  await new Promise(resolve => setTimeout(resolve, 0));
  await manager.accept({ ...session, user: { id: 'new-user' } });
  gate.resolve();
  await assert.rejects(pending, { code: 'cancelled' });
  assert.notEqual(manager.getSessionVersion(), oldVersion);
  assert.equal(manager.getSession().user.id, 'new-user');
});
test('JSON inválido e erro de rede saem da espera com mensagem segura', async () => {
  const api = make({ fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('private-response'); } }) });
  await assert.rejects(api.get('/me'), { code: 'invalid_response', retryable: true });
  await assert.rejects(make({ fetchImpl: async () => { throw new Error('private-token'); } }).get('/me'), error => error.code === 'network' && !error.message.includes('private'));
});
test('erros desconhecidos não exibem detalhes internos e ausência de sessão não acessa rede', async () => {
  assert.equal(apiErrorMessage(new Error('private-token')), 'Não foi possível consultar o Spotify. Tente novamente.');
  let called = false;
  const api = make({ getAccessToken: async () => { throw new SpotifyAuthError('reauth_required', 'private'); }, fetchImpl: async () => { called = true; } });
  await assert.rejects(api.get('/me'), { code: 'reauth_required' });
  assert.equal(called, false);
});

test('falha de rede atrasada é descartada depois da troca de sessão', async () => {
  let version = 0;
  const gate = deferred();
  const api = make({ getSessionVersion: () => version, fetchImpl: async () => { await gate.promise; throw new Error('private-old-request'); } });
  const pending = api.get('/me');
  await new Promise(resolve => setTimeout(resolve, 0));
  version++;
  gate.resolve();
  await assert.rejects(pending, { code: 'cancelled' });
});
