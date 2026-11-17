import test from 'node:test';
import assert from 'node:assert/strict';
import { refreshSpotifySession } from '../src/services/spotifyAuth.mjs';

const session = { accessToken: 'old-access', refreshToken: 'old-refresh', expiresAt: 1, scope: 'test-scope', user: { id: 'test-user' } };
const valid = { access_token: 'new-access', token_type: 'Bearer', expires_in: 3600 };
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
test('refresh PKCE envia client_id e refresh_token sem Client Secret nem perfil extra', async () => {
  let calls = 0;
  const renewed = await refreshSpotifySession({
    session, clientId: 'synthetic-client', now: () => 100,
    fetchImpl: async (url, options) => {
      calls++;
      assert.equal(url, 'https://accounts.spotify.com/api/token');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, undefined);
      const body = new URLSearchParams(options.body);
      assert.equal(body.get('grant_type'), 'refresh_token');
      assert.equal(body.get('client_id'), 'synthetic-client');
      assert.equal(body.get('refresh_token'), 'old-refresh');
      assert.equal(body.has('client_secret'), false);
      assert.equal(body.has('code_verifier'), false);
      return response({ ...valid, refresh_token: 'rotated-refresh', scope: 'new-scope' });
    },
  });
  assert.equal(calls, 1);
  assert.equal(renewed.accessToken, 'new-access');
  assert.equal(renewed.refreshToken, 'rotated-refresh');
  assert.equal(renewed.expiresAt, 3600100);
  assert.equal(renewed.scope, 'new-scope');
  assert.deepEqual(renewed.user, session.user);
});
test('preserva refresh token anterior quando Spotify não envia outro', async () => {
  const renewed = await refreshSpotifySession({ session, clientId: 'synthetic-client', fetchImpl: async () => response(valid) });
  assert.equal(renewed.refreshToken, 'old-refresh');
  assert.equal(renewed.scope, 'test-scope');
});
for (const status of [400, 401]) test('erro ' + status + ' exige reautenticação sem expor resposta remota', async () => {
  await assert.rejects(refreshSpotifySession({ session, clientId: 'synthetic-client', fetchImpl: async () => response({ secret: 'never-display' }, status) }),
    error => error.code === 'reauth_required' && !error.message.includes('never-display'));
});
test('falhas transitórias permanecem distinguíveis de revogação', async () => {
  for (const [status, code] of [[429, 'rate_limited'], [503, 'server']]) {
    await assert.rejects(refreshSpotifySession({ session, fetchImpl: async () => response({}, status) }), { code });
  }
});
test('timeout interrompe espera mesmo quando implementação fetch não respeita abort', async () => {
  await assert.rejects(refreshSpotifySession({ session, timeoutMs: 10, fetchImpl: () => new Promise(() => {}) }), { code: 'timeout' });
});
test('sinal cancelado impede qualquer requisição de renovação', async () => {
  const controller = new AbortController(); controller.abort();
  let called = false;
  await assert.rejects(refreshSpotifySession({ session, signal: controller.signal, fetchImpl: async () => { called = true; } }), { code: 'cancelled' });
  assert.equal(called, false);
});
test('renovação recusa token sem validade, com espaço ou tipo incorreto', async () => {
  for (const data of [{ ...valid, expires_in: 0 }, { ...valid, access_token: 'bad token' }, { ...valid, token_type: 'Basic' }]) {
    await assert.rejects(refreshSpotifySession({ session, fetchImpl: async () => response(data) }), { code: 'invalid_token' });
  }
});
