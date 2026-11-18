# Cliente Spotify — A06

A06 prepara as consultas autenticadas usadas pelo catálogo a partir da A07. A consulta GET /me feita na conclusão do login já utiliza este cliente. Os POSTs OAuth de código e refresh continuam no serviço de autenticação, com os testes da A04/A05 preservados.

## Usar nas próximas etapas

Dentro de uma tela ou hook React:

    const { api, isDemo } = useSession();

No modo de conta, consultar com:

    const controller = new AbortController();
    const page = await api.get('/search', {
      query: { q: 'música brasileira', type: 'album,artist,track', limit: 10 },
      signal: controller.signal,
    });

O exemplo mostra o contrato da camada HTTP. A07 adicionou serviços e normalização em catalog; consulte [o contrato do catálogo](SPOTIFY-CATALOGO.md). As telas continuam demonstrativas até suas etapas de integração.

- api é estável durante a vida do provedor. O token é obtido no momento da chamada.
- O cliente implementa GET. Escrita no Spotify não faz parte desta etapa.
- URLs relativas, como /albums/ID/tracks, e URLs absolutas de paginação em https://api.spotify.com/v1/ são aceitas.
- Query é codificada por URLSearchParams. Valores nulos ou indefinidos são omitidos.
- Endereços externos, credenciais na URL e caminhos fora de /v1/ são rejeitados antes de obter o token.
- Resposta 204 retorna null. Outras respostas bem-sucedidas retornam o JSON.
- Não chamar a API em demonstração. Falhas da API não são substituídas por dados fictícios.
- Ao desmontar ou mudar a busca, executar controller.abort() e descartar a resposta da consulta anterior.
- Ao tratar uma Promise na interface, sempre finalizar o carregamento. Cancelamento não deve produzir alerta de falha.

## Timeout, cancelamento e sessão

O prazo padrão é 30 segundos para toda a consulta, incluindo espera pelo token, eventual renovação, resposta e leitura do JSON. É possível informar timeoutMs para necessidades específicas. A implementação encerra a espera mesmo se fetch ignorar AbortSignal.

Ao receber 401, há no máximo uma renovação e uma repetição da consulta. Um segundo 401 apaga a sessão e leva ao login. A obtenção do token aproveita a renovação única da A05; um 401 atrasado do token antigo usa o token já renovado, sem iniciar outro refresh.

Logout, demonstração, restauração e troca de conta mudam a geração da sessão. O cliente descarta respostas dessa geração anterior, inclusive 401, sem apagar uma conta nova. Cancelar uma consulta não interrompe uma renovação compartilhada necessária a outras consultas; a consulta cancelada não prossegue para a API quando essa renovação termina.

No login inicial, GET /me usa o token recém-obtido e não tenta renová-lo; somente uma conta confirmada é salva.

## Erros e recuperação

SpotifyApiError contém code, status, retryable e retryAt. Não contém corpo remoto, token ou URL solicitada. apiErrorMessage oferece uma mensagem segura para erros inesperados.

| Código | Comportamento |
| --- | --- |
| unauthorized / reauth_required | Pedir nova entrada. |
| forbidden | Orientar sobre permissões e conta autorizada; não renovar nem repetir automaticamente. |
| not_found | Informar indisponibilidade do conteúdo; permitir voltar ou escolher outro item. |
| rate_limited | Respeitar Retry-After e aguardar antes de nova consulta manual. |
| quota_exceeded | Distinguir esgotamento de cota e orientar conferir o painel; não repetir automaticamente. |
| network / timeout / server | Encerrar carregamento e oferecer repetição manual. |
| invalid_response | Informar resposta inválida e permitir repetir. |
| cancelled | Ignorar a resposta cancelada, sem alerta. |
| storage | Orientar recuperação da sessão; não gravar tokens em outro armazenamento. |
| bad_request / invalid_url | Corrigir os parâmetros ou endereço da consulta. |

Após 429, o cliente compartilha o prazo de espera entre os endpoints. Não há espera bloqueante ou repetição automática. Sem Retry-After válido, adota 30 segundos de espera; zero permite tentar manualmente sem espera adicional.

ApiFeedback é um componente com StyleSheet/Flexbox para carregamento, mensagens e recuperação. Recebe loading, error, message, onRetry e retryLabel. Para erro temporário com retryAt, mostra a espera e desabilita o botão até o prazo. Já é utilizado nas mensagens e recuperação da tela de login; será usado nas telas de catálogo nas próximas etapas.

## Conferência desta etapa

- npm run test:api: 25 testes aprovados de HTTP, sessão, concorrência, segurança de URL, espera, cancelamento e erros.
- Regressão: 53 testes anteriores aprovados em test:config, test:auth e test:session; total de 78 testes unitários.
- npm run lint aprovado e bundles Android/Hermes e web gerados com sucesso.
- Edge: 18 cenários com Spotify simulado aprovados, incluindo erros de /me e recuperação do login, sem exceções JavaScript. Artefatos em dist-check/a06/, ignorada pelo Git.
- Login e sessão no aparelho com Spotify real continuam pendentes da Ana.

A06 modifica somente JavaScript e não adiciona bibliotecas nativas. Se o APK da A05 já estiver instalado, atualizar o código e reiniciar o Metro basta. Se ainda não estiver, seguir [Android/EAS](ANDROID-EAS.md).

Referências: [respostas HTTP da Spotify Web API](https://developer.spotify.com/documentation/web-api/concepts/api-calls), [Retry-After e limites](https://developer.spotify.com/documentation/web-api/concepts/rate-limits), [cotas em julho de 2026](https://developer.spotify.com/documentation/web-api/references/changes/july-2026).
