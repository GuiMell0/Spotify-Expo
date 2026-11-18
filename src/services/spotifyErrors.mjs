export class SpotifyAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SpotifyAuthError';
    this.code = code;
  }
}

const messages = {
  unauthorized: 'Sua sessão Spotify expirou. Entre novamente para continuar.',
  reauth_required: 'Entre novamente no Spotify para continuar.',
  forbidden: 'Sua conta não tem permissão para acessar este conteúdo. Confira as permissões e Users Management no painel Spotify.',
  not_found: 'Este conteúdo não foi encontrado ou não está disponível para sua conta.',
  rate_limited: 'O Spotify limitou as solicitações. Aguarde antes de tentar novamente.',
  quota_exceeded: 'A cota de acesso ao Spotify foi esgotada. Tente mais tarde e confira o painel do aplicativo.',
  bad_request: 'Não foi possível realizar esta consulta. Confira os dados informados.',
  invalid_url: 'O endereço solicitado não é válido para a API Spotify.',
  invalid_response: 'O Spotify retornou uma resposta inválida. Tente novamente.',
  server: 'O Spotify está indisponível no momento. Tente novamente mais tarde.',
  network: 'Não foi possível acessar o Spotify. Confira sua conexão e tente novamente.',
  timeout: 'O Spotify demorou a responder. Confira sua conexão e tente novamente.',
  cancelled: 'A consulta foi cancelada.',
  storage: 'Não foi possível acessar a sessão salva no dispositivo. Tente novamente.',
};
const retryableCodes = new Set(['network', 'timeout', 'server', 'invalid_response', 'rate_limited', 'storage']);

export class SpotifyApiError extends Error {
  constructor(code, { status = 0, retryAt = null } = {}) {
    super(messages[code] ?? 'Não foi possível consultar o Spotify. Tente novamente.');
    this.name = 'SpotifyApiError';
    this.code = code;
    this.status = status;
    this.retryAt = retryAt;
    this.retryable = retryableCodes.has(code);
  }
}

export function apiErrorMessage(error) {
  return error instanceof SpotifyApiError ? error.message : 'Não foi possível consultar o Spotify. Tente novamente.';
}
