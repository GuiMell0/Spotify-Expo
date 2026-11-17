export const SPOTIFY_ANDROID_REDIRECT_URI = 'spotifyexpo-login://callback';

const trim = value => typeof value === 'string' ? value.trim() : '';

function isValidWebRedirect(value) {
  try {
    const url = new URL(value);
    const loopback = ['127.0.0.1', '[::1]'].includes(url.hostname);
    const validProtocol = url.protocol === 'https:' || (url.protocol === 'http:' && loopback);
    return validProtocol
      && url.hostname !== 'localhost'
      && url.pathname === '/callback'
      && !url.hash && !url.search && !url.username && !url.password;
  } catch {
    return false;
  }
}

// Referências estáticas são necessárias para o Metro incluir as variáveis públicas.
export function getSpotifyConfig(platform, environment = {
  clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
  androidRedirectUri: process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_ANDROID,
  webRedirectUri: process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_WEB,
}) {
  const clientId = trim(environment.clientId);
  const issues = [];

  if (!clientId) {
    issues.push('Informe o Client ID do seu app no Spotify for Developers.');
  } else if (!/^[a-zA-Z0-9]{32}$/.test(clientId)) {
    issues.push('Confira o Client ID: copie os 32 caracteres exibidos no painel Spotify.');
  }

  let redirectUri = '';
  if (platform === 'android') {
    redirectUri = trim(environment.androidRedirectUri);
    if (redirectUri !== SPOTIFY_ANDROID_REDIRECT_URI) {
      issues.push('Configure o retorno Android como spotifyexpo-login://callback.');
    }
  } else if (platform === 'web') {
    redirectUri = trim(environment.webRedirectUri);
    if (!isValidWebRedirect(redirectUri)) {
      issues.push('Configure o retorno web em /callback, com HTTPS ou HTTP em 127.0.0.1.');
    }
  } else {
    issues.push('A conexão Spotify está sendo preparada para Android e navegador.');
  }

  return { clientId, redirectUri, issues, isConfigured: issues.length === 0 };
}
