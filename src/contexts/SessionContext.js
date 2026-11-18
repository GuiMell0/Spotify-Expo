import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getSpotifyConfig } from '../config/spotify.mjs';
import { authErrorMessage, completeSpotifyLogin, refreshSpotifySession, getLoginBlocker, SPOTIFY_DISCOVERY, SPOTIFY_SCOPES, SpotifyAuthError } from '../services/spotifyAuth.mjs';
import { createSpotifyCatalog } from '../services/spotifyCatalog.mjs';
import { createSpotifyApiClient } from '../services/spotifyApi.mjs';
import { createSessionManager } from '../services/sessionManager.mjs';
import { createSessionStorage } from '../storage/sessionStorage';

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.pathname === '/callback') {
  // O SDK verifica origem e retorno antes de avisar a janela que iniciou o login.
  try { WebBrowser.maybeCompleteAuthSession(); } catch { /* A tela oferece reiniciar quando não há tentativa válida. */ }
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const config = useMemo(() => getSpotifyConfig(Platform.OS), []);
  const blocker = getLoginBlocker(config, {
    platform: Platform.OS,
    expoGo: Platform.OS !== 'web' && isRunningInExpoGo(),
    origin: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : undefined,
  });
  const [isRestoring, setIsRestoring] = useState(true);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [logoutBlocked, setLogoutBlocked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRetryRestore, setCanRetryRestore] = useState(false);
  const [session, setSession] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [request, setRequest] = useState(null);
  const [generation, setGeneration] = useState(0);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState(null);
  const activeAttempt = useRef(null);
  const pendingBrowser = useRef(null);
  const alive = useRef(true);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const manager = useMemo(() => createSessionManager({
    clientId: config.clientId,
    storage: createSessionStorage(config.clientId, {
      enabled: config.isConfigured && Platform.OS === 'android' && !isRunningInExpoGo(),
    }),
    refreshSession: refreshSpotifySession,
    onChange: setSession,
    onRefreshing: setIsRefreshing,
  }), [config]);

  const invalidateApiSession = useCallback(async ({ sessionVersion }) => {
    if (manager.getSessionVersion() !== sessionVersion) return;
    setIsEndingSession(true);
    const clearing = manager.clear();
    const clearedVersion = manager.getSessionVersion();
    try {
      await clearing;
      if (manager.getSessionVersion() !== clearedVersion) return;
      setMessage('Sua sessão Spotify expirou. Entre novamente para continuar.');
      setLogoutBlocked(false);
    } catch {
      if (manager.getSessionVersion() !== clearedVersion) return;
      setLogoutBlocked(true);
      setMessage('Não foi possível apagar a sessão salva. Toque em Limpar sessão novamente antes de entrar em outra conta.');
    } finally {
      setIsEndingSession(false);
      if (manager.getSessionVersion() === clearedVersion) {
        setCanRetryRestore(false);
        setRequest(null);
        setStatus('idle');
        setGeneration(value => value + 1);
      }
    }
  }, [manager]);

  const api = useMemo(() => createSpotifyApiClient({
    getAccessToken: manager.getAccessToken,
    getSessionVersion: manager.getSessionVersion,
    onUnauthorized: invalidateApiSession,
  }), [manager, invalidateApiSession]);

  const catalog = useMemo(() => createSpotifyCatalog(api, { getSessionVersion: manager.getSessionVersion }), [api, manager]);

  const reportSessionError = useCallback(error => {
    if (!alive.current || error.code === 'cancelled') return;
    setMessage(authErrorMessage(error));
    setCanRetryRestore(!['reauth_required', 'unauthorized', 'forbidden'].includes(error.code));
  }, []);

  const restoreSession = useCallback(async () => {
    setIsRestoring(true);
    setMessage(null);
    setCanRetryRestore(false);
    try { await manager.restore(); }
    catch (error) { reportSessionError(error); }
    finally { if (alive.current) setIsRestoring(false); }
  }, [manager, reportSessionError]);

  useEffect(() => {
    let mounted = true;
    manager.restore().catch(error => {
      if (mounted) reportSessionError(error);
    }).finally(() => { if (mounted) setIsRestoring(false); });
    return () => { mounted = false; };
  }, [manager, reportSessionError]);

  const getAccessToken = useCallback(async options => {
    try { return await manager.getAccessToken(options); }
    catch (error) { reportSessionError(error); throw error; }
  }, [manager, reportSessionError]);

  useEffect(() => {
    if (!session || isDemo) return undefined;
    const refresh = () => { getAccessToken().catch(() => {}); };
    // Uma tentativa ao vencer; falhas exigem retorno ao app ou repetição manual.
    const timer = setTimeout(refresh, Math.max(0, session.expiresAt - Date.now()));
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [session, isDemo, getAccessToken]);

  useEffect(() => {
    if (blocker || session || isDemo || isRestoring || isEndingSession || logoutBlocked) return undefined;
    let mounted = true;
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new SpotifyAuthError('preparation', 'Não foi possível preparar a entrada. Tente novamente.')), 10000);
    });
    Promise.resolve().then(() => {
      if (!mounted) return null;
      setRequest(null);
      setStatus('preparing');
      return Promise.race([deadline, AuthSession.loadAsync({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        scopes: SPOTIFY_SCOPES,
      }, SPOTIFY_DISCOVERY)]);
    }).then(prepared => {
      if (mounted && prepared) { setRequest(prepared); setStatus('ready'); }
    }).catch(error => {
      if (mounted) { setStatus('error'); setMessage(authErrorMessage(error)); }
    }).finally(() => clearTimeout(timer));
    return () => { mounted = false; clearTimeout(timer); };
  }, [blocker, config, generation, session, isDemo, isRestoring, isEndingSession, logoutBlocked]);

  const stopAttempt = useCallback(() => {
    const attempt = activeAttempt.current;
    if (!attempt) return;
    activeAttempt.current = null;
    clearTimeout(attempt.timer);
    attempt.controller.abort();
    attempt.cancel();
    if (Platform.OS === 'web') {
      // Fechar a Window permite que o SDK resolva o cancelamento e libere seu bloqueio.
      // dismissAuthSession desta versão fecha a janela, mas deixa a Promise pendente.
      attempt.popup?.close();
    } else {
      try { AuthSession.dismiss(); } catch { /* No Android, feche a aba de autorização. */ }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; stopAttempt(); manager.deactivate(); };
  }, [stopAttempt, manager]);

  const cancelSignIn = useCallback(() => {
    stopAttempt();
    setRequest(null);
    setMessage(Platform.OS === 'android'
      ? 'Entrada cancelada. Feche a aba de autorização antes de tentar novamente.'
      : 'Entrada cancelada. Você pode tentar novamente.');
    setStatus('idle');
    setGeneration(value => value + 1);
  }, [stopAttempt]);

  const signIn = useCallback(async () => {
    if (isRestoring || isEndingSession || logoutBlocked || blocker || !request || activeAttempt.current || pendingBrowser.current || session || isDemo) return;
    const attempt = { controller: new AbortController(), cancel: null, timer: null };
    const interrupted = new Promise(resolve => { attempt.cancel = () => resolve({ type: 'cancel' }); });
    activeAttempt.current = attempt;
    setMessage(null);
    setStatus('authenticating');
    attempt.timer = setTimeout(() => {
      if (activeAttempt.current === attempt) {
        cancelSignIn();
        setMessage('A entrada demorou a concluir. Feche a janela de autorização e tente novamente.');
      }
    }, 180000);
    try {
      // A URL e o PKCE já estão preparados: abrir a janela durante o clique evita bloqueio de popup.
      const windowName = 'spotifyexpo-auth-' + request.state;
      if (Platform.OS === 'web') {
        // Capturar a janela durante o clique preserva a ativação do usuário e permite cancelar.
        attempt.popup = window.open('about:blank', windowName, 'popup=yes,width=500,height=650,location=yes,resizable=yes,scrollbars=yes');
        if (!attempt.popup) throw new SpotifyAuthError('popup_blocked', 'Permita a abertura da janela de login no navegador e tente novamente.');
      }
      pendingBrowser.current = attempt;
      setIsBrowserOpen(true);
      const prompted = request.promptAsync(SPOTIFY_DISCOVERY, { windowName }).finally(() => {
        attempt.popup?.close();
        if (pendingBrowser.current === attempt) {
          pendingBrowser.current = null;
          if (alive.current) setIsBrowserOpen(false);
        }
      });
      const result = await Promise.race([prompted, interrupted]);
      if (activeAttempt.current !== attempt) return;
      setStatus('exchanging');
      const authenticated = await completeSpotifyLogin({
        result, expectedState: request.state, codeVerifier: request.codeVerifier,
        clientId: config.clientId, redirectUri: config.redirectUri, signal: attempt.controller.signal,
      });
      if (activeAttempt.current !== attempt) return;
      if (authenticated) {
        await manager.accept(authenticated, { signal: attempt.controller.signal });
        if (activeAttempt.current !== attempt) return;
        setCanRetryRestore(false);
        setIsDemo(false);
        setMessage(null);
        setStatus('authenticated');
      } else {
        setMessage('Entrada cancelada. Você pode tentar novamente.');
        setStatus('idle');
      }
    } catch (error) {
      if (activeAttempt.current === attempt) { setMessage(authErrorMessage(error)); setStatus('error'); }
    } finally {
      clearTimeout(attempt.timer);
      if (activeAttempt.current === attempt) {
        activeAttempt.current = null;
        setRequest(null);
        setGeneration(value => value + 1);
      }
    }
  }, [blocker, request, config, session, isDemo, cancelSignIn, manager, isRestoring, isEndingSession, logoutBlocked]);

  const startDemo = useCallback(() => {
    stopAttempt();
    manager.deactivate();
    setCanRetryRestore(false);
    setIsDemo(true);
    setMessage(null);
    setStatus('demo');
  }, [stopAttempt, manager]);

  const signOut = useCallback(async () => {
    stopAttempt();
    setIsEndingSession(true);
    setCanRetryRestore(false);
    setIsDemo(false);
    setRequest(null);
    setMessage(null);
    setStatus('idle');
    try {
      await manager.clear();
      setLogoutBlocked(false);
    } catch {
      setLogoutBlocked(true);
      setMessage('Não foi possível apagar a sessão salva. Toque em Limpar sessão novamente antes de entrar em outra conta.');
    } finally {
      if (alive.current) { setIsEndingSession(false); setGeneration(value => value + 1); }
    }
  }, [stopAttempt, manager]);

  const retryPreparation = useCallback(() => {
    setMessage(null);
    setGeneration(value => value + 1);
  }, []);

  const value = {
    session, api, catalog, isDemo, status, message, blocker, isBrowserOpen,
    isRestoring, isEndingSession, logoutBlocked, isRefreshing, canRetryRestore,
    canAccess: Boolean(session) || isDemo,
    isBusy: ['authenticating', 'exchanging'].includes(status),
    isPreparing: status === 'preparing',
    isReady: Boolean(request) && !blocker && !isBrowserOpen && !logoutBlocked && !isRestoring && !isEndingSession,
    signIn, cancelSignIn, startDemo, signOut, retryPreparation, restoreSession, getAccessToken,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession precisa estar dentro de SessionProvider.');
  return context;
}
