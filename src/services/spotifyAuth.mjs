export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};
export const SPOTIFY_SCOPES = ['user-read-private', 'playlist-read-private', 'playlist-read-collaborative'];

export class SpotifyAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SpotifyAuthError';
    this.code = code;
  }
}

export function authErrorMessage(error) {
  if (error instanceof SpotifyAuthError) return error.message;
  if (error?.code === 'ERR_WEB_BROWSER_BLOCKED') return 'Permita a abertura da janela de login no navegador e tente novamente.';
  return 'Não foi possível entrar no Spotify. Confira a conexão e tente novamente.';
}

export function getLoginBlocker(config, { platform, expoGo = false, origin } = {}) {
  if (!config.isConfigured) return config.issues[0];
  if (platform === 'android' && expoGo) return 'Para entrar no Spotify, abra o APK de desenvolvimento. No Expo Go, use a demonstração.';
  if (platform === 'web' && origin !== new URL(config.redirectUri).origin) {
    return 'Para entrar pelo navegador, abra ' + new URL(config.redirectUri).origin + '.';
  }
  return null;
}

export function readAuthorizationCode(result, expectedState) {
  if (['cancel', 'dismiss'].includes(result?.type)) return null;
  if (result?.type === 'locked') throw new SpotifyAuthError('locked', 'Feche a janela de autorização anterior antes de tentar novamente.');
  const params = result?.params;
  if (!expectedState || !params || params.state !== expectedState) {
    throw new SpotifyAuthError('state_mismatch', 'O retorno do login não corresponde à tentativa atual. Inicie novamente.');
  }
  if (params.error === 'access_denied') throw new SpotifyAuthError('access_denied', 'A autorização foi recusada. Você pode tentar novamente ou explorar a demonstração.');
  if (result.type !== 'success' || params.error) throw new SpotifyAuthError('authorization', 'O Spotify não concluiu a autorização. Inicie novamente.');
  if (typeof params.code !== 'string' || !params.code.trim()) throw new SpotifyAuthError('missing_code', 'O Spotify retornou sem código de autorização. Inicie novamente.');
  return params.code;
}

async function requestJson(url, options, { fetchImpl, signal, timeoutMs, reauthOnUnauthorized = false }) {
  const controller = new AbortController();
  let timer;
  let onAbort;
  const interrupted = new Promise((_, reject) => {
    const interrupt = (code, message) => {
      reject(new SpotifyAuthError(code, message));
      controller.abort();
    };
    onAbort = () => interrupt('cancelled', 'Entrada cancelada.');
    if (signal?.aborted) onAbort();
    else signal?.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => interrupt('timeout', 'O Spotify demorou a responder. Confira a conexão e tente novamente.'), timeoutMs);
  });
  try {
    return await Promise.race([
      interrupted,
      (async () => {
        if (signal?.aborted) throw new SpotifyAuthError('cancelled', 'Entrada cancelada.');
        const response = await fetchImpl(url, { ...options, signal: controller.signal });
        if (!response.ok) {
          if (reauthOnUnauthorized && [400, 401].includes(response.status)) throw new SpotifyAuthError('reauth_required', 'Sua sessão Spotify expirou ou foi revogada. Entre novamente.');
          if (response.status === 403) throw new SpotifyAuthError('forbidden', 'A conta não tem acesso a este aplicativo. Confira Users Management no painel Spotify e o Premium do proprietário.');
          if (response.status === 429) throw new SpotifyAuthError('rate_limited', 'O Spotify limitou as solicitações. Aguarde antes de tentar novamente.');
          if ([400, 401].includes(response.status)) throw new SpotifyAuthError('unauthorized', 'O Spotify não aceitou esta entrada. Confira o Client ID e o retorno cadastrado e tente novamente.');
          throw new SpotifyAuthError('server', 'O Spotify está indisponível no momento. Tente novamente mais tarde.');
        }
        try { return await response.json(); }
        catch { throw new SpotifyAuthError('invalid_response', 'O Spotify retornou uma resposta inválida. Tente novamente.'); }
      })(),
    ]);
  } catch (error) {
    if (error instanceof SpotifyAuthError) throw error;
    if (signal?.aborted) throw new SpotifyAuthError('cancelled', 'Entrada cancelada.');
    throw new SpotifyAuthError('network', 'Não foi possível acessar o Spotify. Confira sua conexão e tente novamente.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export async function completeSpotifyLogin({
  result, expectedState, codeVerifier, clientId, redirectUri, signal,
  fetchImpl = globalThis.fetch, timeoutMs = 15000, now = Date.now,
}) {
  const code = readAuthorizationCode(result, expectedState);
  if (code === null) return null;
  if (typeof codeVerifier !== 'string' || !/^[A-Za-z0-9._~-]{43,128}$/.test(codeVerifier)) {
    throw new SpotifyAuthError('missing_verifier', 'A tentativa de login expirou. Inicie novamente.');
  }
  const token = await requestJson(SPOTIFY_DISCOVERY.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', client_id: clientId, redirect_uri: redirectUri,
      code, code_verifier: codeVerifier,
    }).toString(),
  }, { fetchImpl, signal, timeoutMs });
  if (!token || typeof token.access_token !== 'string' || !/^\S+$/.test(token.access_token)
    || !/^Bearer$/i.test(token.token_type ?? '') || !Number.isFinite(token.expires_in) || token.expires_in <= 0) {
    throw new SpotifyAuthError('invalid_token', 'O Spotify retornou uma sessão inválida. Inicie o login novamente.');
  }
  const expiresAt = now() + token.expires_in * 1000;
  const user = await requestJson('https://api.spotify.com/v1/me', {
    headers: { Accept: 'application/json', Authorization: 'Bearer ' + token.access_token },
  }, { fetchImpl, signal, timeoutMs });
  if (!user || typeof user.id !== 'string' || !user.id) throw new SpotifyAuthError('invalid_profile', 'Não foi possível identificar a conta Spotify. Inicie novamente.');
  return {
    accessToken: token.access_token,
    refreshToken: typeof token.refresh_token === 'string' ? token.refresh_token : null,
    expiresAt,
    scope: typeof token.scope === 'string' ? token.scope : '',
    user: {
      id: user.id,
      displayName: typeof user.display_name === 'string' && user.display_name ? user.display_name : user.id,
      imageUrl: Array.isArray(user.images) ? user.images.find(image => typeof image?.url === 'string')?.url ?? null : null,
    },
  };
}

export async function refreshSpotifySession({
  session, clientId, signal, fetchImpl = globalThis.fetch, timeoutMs = 15000, now = Date.now,
}) {
  if (!session?.refreshToken) throw new SpotifyAuthError('reauth_required', 'Sua sessão não pode ser renovada. Entre novamente no Spotify.');
  const token = await requestJson(SPOTIFY_DISCOVERY.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken, client_id: clientId }).toString(),
  }, { fetchImpl, signal, timeoutMs, reauthOnUnauthorized: true });
  if (!token || typeof token.access_token !== 'string' || !/^\S+$/.test(token.access_token)
    || !/^Bearer$/i.test(token.token_type ?? '') || !Number.isFinite(token.expires_in) || token.expires_in <= 0) {
    throw new SpotifyAuthError('invalid_token', 'O Spotify retornou uma renovação inválida. Tente novamente.');
  }
  return {
    ...session,
    accessToken: token.access_token,
    refreshToken: typeof token.refresh_token === 'string' && token.refresh_token ? token.refresh_token : session.refreshToken,
    expiresAt: now() + token.expires_in * 1000,
    scope: typeof token.scope === 'string' ? token.scope : session.scope,
  };
}
