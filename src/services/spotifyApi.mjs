import { SpotifyApiError, SpotifyAuthError } from './spotifyErrors.mjs';

const origin = 'https://api.spotify.com';
const baseUrl = origin + '/v1/';

function endpointUrl(endpoint, query) {
  try {
    if (typeof endpoint !== 'string' || !endpoint || endpoint.startsWith('//')) throw new Error();
    const relative = endpoint.startsWith('/v1/') ? endpoint.slice(4) : endpoint.replace(/^\//, '');
    const url = new URL(relative, baseUrl);
    if (url.origin !== origin || !url.pathname.startsWith('/v1/') || url.username || url.password || url.hash) throw new Error();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    if (['access_token', 'refresh_token', 'client_secret'].some(key => url.searchParams.has(key))) throw new Error();
    return url.toString();
  } catch { throw new SpotifyApiError('invalid_url'); }
}

function retryDeadline(response, now) {
  const value = response.headers?.get?.('Retry-After')?.trim();
  const seconds = value && /^\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
  const deadline = Number.isFinite(seconds) ? now + seconds * 1000 : Date.parse(value);
  return Number.isFinite(deadline) && deadline >= now ? deadline : now + 30000;
}

function normalize(error) {
  if (error instanceof SpotifyApiError) return error;
  if (error instanceof SpotifyAuthError) {
    const code = ['reauth_required', 'unauthorized', 'forbidden', 'network', 'timeout', 'cancelled', 'storage', 'rate_limited', 'server', 'invalid_response'].includes(error.code) ? error.code : 'invalid_response';
    return new SpotifyApiError(code);
  }
  return new SpotifyApiError('network');
}

export function createSpotifyApiClient({
  getAccessToken, getSessionVersion = () => 0, onUnauthorized = async () => {},
  fetchImpl = globalThis.fetch, now = Date.now, timeoutMs: defaultTimeout = 30000,
}) {
  let cooldownUntil = 0;

  async function get(endpoint, { query, signal, timeoutMs = defaultTimeout, retryUnauthorized = true } = {}) {
    const url = endpointUrl(endpoint, query);
    const version = getSessionVersion();
    const controller = new AbortController();
    let interruption = null;
    let timer;
    let onAbort;
    function check() {
      if (interruption) throw interruption;
      if (getSessionVersion() !== version) throw new SpotifyApiError('cancelled');
    }
    const interrupted = new Promise((_, reject) => {
      const interrupt = code => {
        interruption = new SpotifyApiError(code);
        reject(interruption);
        controller.abort();
      };
      onAbort = () => interrupt('cancelled');
      if (signal?.aborted) onAbort();
      else signal?.addEventListener('abort', onAbort, { once: true });
      timer = setTimeout(() => interrupt('timeout'), timeoutMs);
    });
    function checkCooldown() {
      if (cooldownUntil > now()) throw new SpotifyApiError('rate_limited', { status: 429, retryAt: cooldownUntil });
    }
    async function send(token) {
      check(); checkCooldown();
      if (typeof token !== 'string' || !/^\S+$/.test(token)) throw new SpotifyApiError('reauth_required');
      const response = await fetchImpl(url, {
        method: 'GET', headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
        signal: controller.signal, redirect: 'error',
      });
      check();
      if (response.status === 429) cooldownUntil = Math.max(cooldownUntil, retryDeadline(response, now()));
      return response;
    }
    try {
      return await Promise.race([interrupted, (async () => {
        check(); checkCooldown();
        let token = await getAccessToken();
        check();
        let response = await send(token);
        if (response.status === 401 && retryUnauthorized) {
          check();
          token = await getAccessToken({ forceRefresh: true, rejectedToken: token });
          check();
          response = await send(token);
        }
        check();
        if (response.status === 401) {
          // O callback confere a geração antes de encerrar uma sessão ainda atual.
          await onUnauthorized({ sessionVersion: version });
          throw new SpotifyApiError('unauthorized', { status: 401 });
        }
        if (!response.ok) {
          let body;
          try { body = await response.json(); } catch { /* Mensagens remotas não são exibidas. */ }
          check();
          const quota = body?.error?.reason === 'QUOTA_EXCEEDED' || body?.error?.code === 'QUOTA_EXCEEDED' || body?.error === 'QUOTA_EXCEEDED';
          const status = response.status;
          if (quota) throw new SpotifyApiError('quota_exceeded', { status });
          const code = status === 403 ? 'forbidden' : status === 404 ? 'not_found' : status === 429 ? 'rate_limited' : status >= 500 ? 'server' : 'bad_request';
          throw new SpotifyApiError(code, { status, retryAt: status === 429 ? cooldownUntil : null });
        }
        if (response.status === 204) return null;
        let body;
        try { body = await response.json(); }
        catch { throw new SpotifyApiError('invalid_response'); }
        check();
        return body;
      })()]);
    } catch (error) {
      if (interruption) throw interruption;
      const safe = normalize(error);
      if (getSessionVersion() !== version && !['unauthorized', 'reauth_required'].includes(safe.code)) throw new SpotifyApiError('cancelled');
      throw safe;
    }
    finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  return { get };
}
