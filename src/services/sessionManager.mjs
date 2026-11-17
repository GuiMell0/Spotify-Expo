import { SpotifyAuthError } from './spotifyAuth.mjs';

const cancelled = () => new SpotifyAuthError('cancelled', 'A sessão foi encerrada ou substituída.');
const storageError = () => new SpotifyAuthError('storage', 'Não foi possível acessar a sessão salva no dispositivo. Tente novamente.');

function validSession(value) {
  return value && typeof value.accessToken === 'string' && /^\S+$/.test(value.accessToken)
    && (value.refreshToken === null || typeof value.refreshToken === 'string' && /^\S+$/.test(value.refreshToken))
    && Number.isFinite(value.expiresAt) && value.expiresAt > 0
    && typeof value.user?.id === 'string' && Boolean(value.user.id.trim());
}

function snapshot(session) {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? null,
    expiresAt: session.expiresAt,
    scope: typeof session.scope === 'string' ? session.scope : '',
    user: {
      id: session.user.id,
      displayName: typeof session.user.displayName === 'string' ? session.user.displayName : session.user.id,
      imageUrl: typeof session.user.imageUrl === 'string' ? session.user.imageUrl : null,
    },
  };
}

export function createSessionManager({
  storage, clientId, refreshSession, now = Date.now,
  onChange = () => {}, onRefreshing = () => {}, skewMs = 60000, storageTimeoutMs = 5000,
}) {
  let current = null;
  let epoch = 0;
  let flight = null;
  let io = Promise.resolve();

  function check(version, signal) {
    if (version !== epoch || signal?.aborted) throw cancelled();
  }

  function disk(operation) {
    // A fila acompanha a operação nativa original, mesmo se a espera da interface expirar.
    const pending = io.then(operation);
    io = pending.catch(() => {});
    let timer;
    return Promise.race([
      pending,
      new Promise((_, reject) => { timer = setTimeout(() => reject(storageError()), storageTimeoutMs); }),
    ]).catch(error => {
      if (error instanceof SpotifyAuthError) throw error;
      throw storageError();
    }).finally(() => clearTimeout(timer));
  }

  function deactivate() {
    epoch++;
    flight?.controller.abort();
    current = null;
    onChange(null);
    onRefreshing(false);
  }

  async function clear() {
    deactivate();
    await disk(() => storage.remove());
  }

  async function commit(session, version, signal) {
    const value = snapshot(session);
    await disk(async () => {
      check(version, signal);
      // A imagem é recarregável e fica fora do registro compacto de credenciais.
      const persisted = { ...value, user: { ...value.user, imageUrl: null } };
      await storage.write(JSON.stringify({ version: 1, clientId, session: persisted }));
      if (version !== epoch || signal?.aborted) {
        await storage.remove();
        throw cancelled();
      }
    });
    check(version, signal);
    current = value;
    onChange(value);
    return value;
  }

  async function accept(session, { signal } = {}) {
    if (!validSession(session)) throw new SpotifyAuthError('invalid_token', 'A sessão retornada não é válida. Entre novamente.');
    deactivate();
    const version = epoch;
    try { return await commit(session, version, signal); }
    catch (error) {
      if (epoch === version) deactivate();
      throw error;
    }
  }

  function getAccessToken({ forceRefresh = false } = {}) {
    if (flight?.version === epoch) return flight.promise;
    if (!current) return Promise.reject(new SpotifyAuthError('reauth_required', 'Entre no Spotify para continuar.'));
    if (!forceRefresh && current.expiresAt > now() + skewMs) return Promise.resolve(current.accessToken);
    const session = current;
    const version = epoch;
    const controller = new AbortController();
    const operation = { version, controller, promise: null };
    onRefreshing(true);
    operation.promise = Promise.resolve().then(async () => {
      try {
        if (!session.refreshToken) throw new SpotifyAuthError('reauth_required', 'Sua sessão expirou. Entre novamente no Spotify.');
        const renewed = await refreshSession({ session, clientId, signal: controller.signal });
        check(version, controller.signal);
        if (!validSession(renewed) || renewed.expiresAt <= now() || renewed.user.id !== session.user.id) {
          throw new SpotifyAuthError('invalid_token', 'Não foi possível validar a sessão renovada.');
        }
        const saved = await commit(renewed, version, controller.signal);
        return saved.accessToken;
      } catch (error) {
        if (version !== epoch) throw cancelled();
        if (['reauth_required', 'unauthorized', 'forbidden'].includes(error.code)) {
          await clear();
          throw error;
        }
        const transient = ['network', 'timeout', 'server', 'rate_limited'].includes(error.code);
        if (transient && !forceRefresh && session.expiresAt > now()) return session.accessToken;
        if (current?.expiresAt <= now() || error.code === 'storage') onChange(null);
        throw error;
      } finally {
        if (flight === operation) { flight = null; onRefreshing(false); }
      }
    });
    flight = operation;
    return operation.promise;
  }

  async function restore() {
    const fallback = current;
    deactivate();
    const version = epoch;
    const raw = await disk(() => storage.read());
    check(version);
    let saved = !storage.persistent ? fallback : null;
    if (raw !== null) {
      try {
        const record = JSON.parse(raw);
        saved = record.version === 1 && record.clientId === clientId && validSession(record.session) ? record.session : null;
      } catch { saved = null; }
      if (!saved) {
        await disk(async () => { check(version); await storage.remove(); });
        return null;
      }
    }
    if (!saved) return null;
    current = snapshot(saved);
    await getAccessToken();
    check(version);
    onChange(current);
    return current;
  }

  return {
    accept, restore, clear, deactivate, getAccessToken,
    getSession: () => current,
    persistent: storage.persistent,
  };
}
