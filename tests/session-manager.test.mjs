import test from 'node:test';
import assert from 'node:assert/strict';
import { createSessionManager } from '../src/services/sessionManager.mjs';
import { SpotifyAuthError } from '../src/services/spotifyAuth.mjs';
import { createVolatileSessionStorage } from '../src/storage/volatileSession.mjs';

const clientId = 'synthetic-client';
const initial = { accessToken: 'test-access', refreshToken: 'test-refresh', expiresAt: 1000000, scope: 'user-read-private', user: { id: 'user-a', displayName: 'Pessoa A', imageUrl: 'https://test.invalid/avatar' } };
const renewal = old => ({ ...old, accessToken: 'new-access', refreshToken: 'new-refresh', expiresAt: 2000000 });
const error = code => new SpotifyAuthError(code, 'Falha de teste');
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
function fixture(options = {}) {
  let raw = options.raw ?? null;
  let calls = 0;
  const changes = [];
  const storage = options.storage ?? { persistent: true, read: async () => raw, write: async value => { raw = value; }, remove: async () => { raw = null; } };
  const manager = createSessionManager({
    clientId, storage, now: () => 500000,
    refreshSession: async ({ session }) => { calls++; return renewal(session); },
    onChange: value => changes.push(value), ...options,
  });
  return { manager, storage, changes, raw: () => raw, calls: () => calls };
}
function stored(session = initial, overrides = {}) { return JSON.stringify({ version: 1, clientId, session, ...overrides }); }

test('restaura sessão válida sem consultar Spotify e não persiste foto', async () => {
  const f = fixture();
  await f.manager.accept(initial);
  assert.equal(JSON.parse(f.raw()).session.user.imageUrl, null);
  const reopened = fixture({ raw: f.raw() });
  assert.equal((await reopened.manager.restore()).user.id, 'user-a');
  assert.equal(await reopened.manager.getAccessToken(), 'test-access');
  assert.equal(reopened.calls(), 0);
});
test('renova sessão vencida ao reabrir e persiste os tokens rotacionados', async () => {
  const f = fixture({ raw: stored({ ...initial, expiresAt: 100 }) });
  await f.manager.restore();
  assert.equal(f.calls(), 1);
  assert.equal(JSON.parse(f.raw()).session.refreshToken, 'new-refresh');
  assert.equal(f.manager.getSession().accessToken, 'new-access');
});
test('solicitações simultâneas compartilham uma única renovação', async () => {
  const gate = deferred(); let calls = 0;
  const f = fixture({ refreshSession: async ({ session }) => { calls++; await gate.promise; return renewal(session); } });
  await f.manager.accept(initial);
  const tokens = Array.from({ length: 8 }, () => f.manager.getAccessToken({ forceRefresh: true }));
  gate.resolve();
  assert.deepEqual(await Promise.all(tokens), Array(8).fill('new-access'));
  assert.equal(calls, 1);
});
test('consulta normal aguarda renovação forçada em curso', async () => {
  const gate = deferred();
  const f = fixture({ refreshSession: async ({ session }) => { await gate.promise; return renewal(session); } });
  await f.manager.accept(initial);
  const forced = f.manager.getAccessToken({ forceRefresh: true });
  const normal = f.manager.getAccessToken();
  gate.resolve();
  assert.equal(await normal, 'new-access');
  assert.equal(await forced, 'new-access');
});
test('logout durante renovação impede resposta tardia de restaurar conta', async () => {
  const gate = deferred(); let signal;
  const f = fixture({ refreshSession: async args => { signal = args.signal; await gate.promise; return renewal(args.session); } });
  await f.manager.accept(initial);
  const pending = f.manager.getAccessToken({ forceRefresh: true });
  await Promise.resolve();
  await f.manager.clear();
  assert.equal(signal.aborted, true);
  gate.resolve();
  await assert.rejects(pending, { code: 'cancelled' });
  assert.equal(f.manager.getSession(), null);
  assert.equal(f.raw(), null);
});
test('troca de conta não aceita renovação da conta anterior', async () => {
  const gate = deferred();
  const f = fixture({ refreshSession: async ({ session }) => { await gate.promise; return renewal(session); } });
  await f.manager.accept(initial);
  const pending = f.manager.getAccessToken({ forceRefresh: true });
  await Promise.resolve();
  await f.manager.accept({ ...initial, user: { id: 'user-b' } });
  gate.resolve();
  await assert.rejects(pending, { code: 'cancelled' });
  assert.equal(f.manager.getSession().user.id, 'user-b');
  assert.equal(JSON.parse(f.raw()).session.user.id, 'user-b');
});
test('invalid_grant limpa sessão e exige login, sem repetir renovação', async () => {
  let calls = 0;
  const f = fixture({ raw: stored({ ...initial, expiresAt: 100 }), refreshSession: async () => { calls++; throw error('reauth_required'); } });
  await assert.rejects(f.manager.restore(), { code: 'reauth_required' });
  await assert.rejects(f.manager.getAccessToken(), { code: 'reauth_required' });
  assert.equal(calls, 1);
  assert.equal(f.raw(), null);
  assert.equal(f.manager.getSession(), null);
});
test('falha de rede preserva refresh token e permite repetição manual', async () => {
  let failed = true;
  const f = fixture({ raw: stored({ ...initial, expiresAt: 100 }), refreshSession: async ({ session }) => { if (failed) throw error('network'); return renewal(session); } });
  await assert.rejects(f.manager.restore(), { code: 'network' });
  assert.equal(JSON.parse(f.raw()).session.refreshToken, 'test-refresh');
  assert.equal(f.changes.at(-1), null);
  failed = false;
  assert.equal((await f.manager.restore()).accessToken, 'new-access');
});
test('falha transitória permite usar token ainda válido até sua expiração', async () => {
  let clock = 990000; let calls = 0;
  const f = fixture({ now: () => clock, refreshSession: () => { calls++; throw error('network'); } });
  await f.manager.accept(initial);
  assert.equal(await f.manager.getAccessToken(), 'test-access');
  clock = 1000001;
  await assert.rejects(f.manager.getAccessToken(), { code: 'network' });
  assert.equal(calls, 2);
});
test('sessão vencida sem refresh token é apagada', async () => {
  const f = fixture({ raw: stored({ ...initial, refreshToken: null, expiresAt: 100 }) });
  await assert.rejects(f.manager.restore(), { code: 'reauth_required' });
  assert.equal(f.raw(), null);
});
for (const [name, raw] of [
  ['JSON corrompido', '{'],
  ['versão desconhecida', stored(initial, { version: 99 })],
  ['Client ID diferente', stored(initial, { clientId: 'other-client' })],
  ['token inválido', stored({ ...initial, accessToken: '' })],
  ['usuário ausente', stored({ ...initial, user: null })],
]) {
  test('descarta registro inválido: ' + name, async () => {
    const f = fixture({ raw });
    assert.equal(await f.manager.restore(), null);
    assert.equal(f.raw(), null);
    assert.equal(f.calls(), 0);
  });
}
test('falha de leitura não apaga credenciais e sai do carregamento por rejeição', async () => {
  let removed = false;
  const f = fixture({ storage: { persistent: true, read: async () => { throw new Error('native'); }, remove: async () => { removed = true; } } });
  await assert.rejects(f.manager.restore(), { code: 'storage' });
  assert.equal(removed, false);
});
test('falha ao salvar não autentica conta somente na memória', async () => {
  const f = fixture({ storage: { persistent: true, write: async () => { throw new Error('native'); } } });
  await assert.rejects(f.manager.accept(initial), { code: 'storage' });
  assert.equal(f.manager.getSession(), null);
});
test('logout reporta erro se a exclusão nativa falhar e já fecha acesso em memória', async () => {
  const f = fixture();
  await f.manager.accept(initial);
  f.storage.remove = async () => { throw new Error('native'); };
  await assert.rejects(f.manager.clear(), { code: 'storage' });
  assert.equal(f.manager.getSession(), null);
});
test('salvamento cancelado é removido antes de publicar sessão', async () => {
  const gate = deferred(); const started = deferred(); const f = fixture();
  const original = f.storage.write;
  f.storage.write = async raw => { started.resolve(); await gate.promise; await original(raw); };
  const controller = new AbortController();
  const saved = f.manager.accept(initial, { signal: controller.signal });
  await started.promise; controller.abort(); gate.resolve();
  await assert.rejects(saved, { code: 'cancelled' });
  assert.equal(f.raw(), null);
  assert.equal(f.manager.getSession(), null);
});
test('timeout de escrita não permite que operação tardia ressuscite sessão', async () => {
  const gate = deferred(); const f = fixture({ storageTimeoutMs: 10 });
  const original = f.storage.write;
  f.storage.write = async raw => { await gate.promise; await original(raw); };
  await assert.rejects(f.manager.accept(initial), { code: 'storage' });
  gate.resolve(); await f.manager.clear();
  assert.equal(f.raw(), null);
  assert.equal(f.manager.getSession(), null);
});
test('renovação não pode trocar identidade nem retornar token vencido', async () => {
  for (const changed of [{ user: { id: 'other' } }, { expiresAt: 1 }]) {
    const f = fixture({ refreshSession: async ({ session }) => ({ ...renewal(session), ...changed }) });
    await f.manager.accept(initial);
    await assert.rejects(f.manager.getAccessToken({ forceRefresh: true }), { code: 'invalid_token' });
    assert.equal(JSON.parse(f.raw()).session.accessToken, 'test-access');
  }
});
test('web mantém sessão só durante a execução e nunca usa armazenamento do navegador', async () => {
  const storage = createVolatileSessionStorage();
  const f = fixture({ storage });
  await f.manager.accept(initial);
  assert.equal(await storage.read(), null);
  const reopened = fixture({ storage: createVolatileSessionStorage() });
  assert.equal(await reopened.manager.restore(), null);
  assert.equal(f.manager.persistent, false);
});
test('demonstração desativa conta sem renovar tokens', async () => {
  const f = fixture();
  await f.manager.accept(initial);
  f.manager.deactivate();
  await assert.rejects(f.manager.getAccessToken(), { code: 'reauth_required' });
  assert.equal(f.calls(), 0);
});
