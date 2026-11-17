import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completeSpotifyLogin, readAuthorizationCode, getLoginBlocker, authErrorMessage, SpotifyAuthError } from '../src/services/spotifyAuth.mjs';

const base = {
  result: { type: 'success', params: { state: 'expected-state', code: 'authorization-code' } },
  expectedState: 'expected-state',
  codeVerifier: 'v'.repeat(64),
  clientId: 'a'.repeat(32),
  redirectUri: 'spotifyexpo-login://callback',
};
const token = { access_token: 'test-access-token', refresh_token: 'test-refresh-token', token_type: 'Bearer', expires_in: 3600 };
const profile = { id: 'test-user', display_name: null, images: null };
const response = (json, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => json });

test('troca código com verificador PKCE, sem Client Secret, e confirma a conta', async () => {
  const calls = [];
  const session = await completeSpotifyLogin({
    ...base, now: () => 10000,
    fetchImpl: async (url, options) => { calls.push({ url, options }); return response(calls.length === 1 ? token : profile); },
  });
  assert.equal(calls.length, 2);
  const form = new URLSearchParams(calls[0].options.body);
  assert.equal(form.get('grant_type'), 'authorization_code');
  assert.equal(form.get('code_verifier'), base.codeVerifier);
  assert.equal(form.get('redirect_uri'), base.redirectUri);
  assert.equal(form.get('client_id'), base.clientId);
  assert.equal(form.has('client_secret'), false);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-access-token');
  assert.equal(session.user.id, 'test-user');
  assert.equal(session.user.displayName, 'test-user');
  assert.equal(session.user.imageUrl, null);
  assert.equal(session.expiresAt, 3610000);
});

test('cancelamento e fechamento não fazem requisições à API', async () => {
  for (const type of ['cancel', 'dismiss']) {
    let called = false;
    const result = await completeSpotifyLogin({ ...base, result: { type }, fetchImpl: async () => { called = true; } });
    assert.equal(result, null);
    assert.equal(called, false);
  }
});

test('state incorreto ou ausente impede a troca de código', async () => {
  for (const params of [{ state: 'wrong', code: 'code' }, { code: 'code' }]) {
    let called = false;
    await assert.rejects(completeSpotifyLogin({ ...base, result: { type: 'success', params }, fetchImpl: async () => { called = true; } }), { code: 'state_mismatch' });
    assert.equal(called, false);
  }
});

test('recusa de permissão é tratada sem publicar mensagens privadas do provedor', () => {
  const result = { type: 'error', params: { state: base.expectedState, error: 'access_denied', error_description: 'private-provider-data' } };
  assert.throws(() => readAuthorizationCode(result, base.expectedState), error => error.code === 'access_denied' && !error.message.includes('private-provider-data'));
});

test('código e verificador ausentes são rejeitados antes de acessar a rede', async () => {
  assert.throws(() => readAuthorizationCode({ type: 'success', params: { state: base.expectedState } }, base.expectedState), { code: 'missing_code' });
  let called = false;
  await assert.rejects(completeSpotifyLogin({ ...base, codeVerifier: '', fetchImpl: async () => { called = true; } }), { code: 'missing_verifier' });
  assert.equal(called, false);
});

test('respostas inválidas de token não criam uma sessão', async () => {
  for (const invalid of [{}, { ...token, expires_in: -1 }, { ...token, access_token: '' }, { ...token, token_type: 'other' }]) {
    let count = 0;
    await assert.rejects(completeSpotifyLogin({ ...base, fetchImpl: async () => { count++; return response(invalid); } }), { code: 'invalid_token' });
    assert.equal(count, 1);
  }
});

test('conta sem acesso ao aplicativo recebe orientação em vez de entrar', async () => {
  let count = 0;
  await assert.rejects(completeSpotifyLogin({
    ...base, fetchImpl: async () => ++count === 1 ? response(token) : response({}, 403),
  }), error => error.code === 'forbidden' && error.message.includes('Users Management'));
});

test('conta sem identificador válido não conclui o login', async () => {
  let count = 0;
  await assert.rejects(completeSpotifyLogin({
    ...base, fetchImpl: async () => response(++count === 1 ? token : { display_name: 'Name' }),
  }), { code: 'invalid_profile' });
});

test('timeout encerra até uma requisição que ignore AbortSignal', async () => {
  await assert.rejects(completeSpotifyLogin({ ...base, timeoutMs: 5, fetchImpl: async () => new Promise(() => {}) }), { code: 'timeout' });
});

test('cancelamento antes da troca não acessa a rede', async () => {
  const controller = new AbortController();
  controller.abort();
  let called = false;
  await assert.rejects(completeSpotifyLogin({ ...base, signal: controller.signal, fetchImpl: async () => { called = true; } }), { code: 'cancelled' });
  assert.equal(called, false);
});

test('falha de rede e JSON inválido produzem mensagem legível', async () => {
  await assert.rejects(completeSpotifyLogin({ ...base, fetchImpl: async () => { throw new TypeError('network'); } }), { code: 'network' });
  await assert.rejects(completeSpotifyLogin({ ...base, fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('private-body'); } }) }), { code: 'invalid_response' });
});

test('erros de autorização e limite não geram repetição automática de requisições', async () => {
  for (const [status, code] of [[400, 'unauthorized'], [401, 'unauthorized'], [429, 'rate_limited'], [503, 'server']]) {
    let count = 0;
    await assert.rejects(completeSpotifyLogin({ ...base, fetchImpl: async () => { count++; return response({}, status); } }), { code });
    assert.equal(count, 1);
  }
});

test('Expo Go e origem web diferente bloqueiam somente o login real', () => {
  const config = { isConfigured: true, redirectUri: 'http://127.0.0.1:8081/callback' };
  assert.match(getLoginBlocker(config, { platform: 'android', expoGo: true }), /APK/);
  assert.match(getLoginBlocker(config, { platform: 'web', origin: 'http://localhost:8081' }), /127.0.0.1/);
  assert.equal(getLoginBlocker(config, { platform: 'web', origin: 'http://127.0.0.1:8081' }), null);
  assert.equal(getLoginBlocker(config, { platform: 'android', expoGo: false }), null);
});

test('erros desconhecidos não expõem dados do servidor e popup bloqueado orienta o usuário', () => {
  assert.equal(authErrorMessage(new Error('private-token')), 'Não foi possível entrar no Spotify. Confira a conexão e tente novamente.');
  assert.match(authErrorMessage({ code: 'ERR_WEB_BROWSER_BLOCKED' }), /janela/);
  assert.equal(authErrorMessage(new SpotifyAuthError('custom', 'Mensagem segura')), 'Mensagem segura');
});
