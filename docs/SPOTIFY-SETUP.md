# Configuração Spotify — P2

A03 prepara o ambiente, o modelo de variáveis e o perfil EAS para Android. A Ana escolheu APK pela nuvem, forneceu o Client ID e confirmou spotifyexpo-login://callback salvo no painel. O Client ID foi preenchido somente no .env local. A04 implementou o login PKCE e a consulta de confirmação em /me. A05 adiciona SecureStore no Android, restauração e renovação. Geração/instalação do APK e teste com a conta real continuam pendentes.

## O que já sabemos

A Ana possui Premium e vai testar no Android. O fluxo escolhido é Authorization Code com PKCE: o navegador autoriza o usuário e o aplicativo troca um código temporário usando um verificador. O Client Secret não participa desse fluxo no cliente. Referência: [PKCE do Spotify](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow).

Client Credentials é apropriado para comunicação de servidor com servidor, sem acesso à conta do usuário; exigiria manter o segredo em um backend. Não será usado diretamente no aplicativo. Referência: [autorização Spotify](https://developer.spotify.com/documentation/web-api/concepts/authorization).

## Criar o aplicativo no Spotify

1. Abra o [Dashboard](https://developer.spotify.com/dashboard) com a conta Premium.
2. Clique em Create app. Use nome Spotify Expo P2 e descrição Aplicativo acadêmico da disciplina de Aplicativos Híbridos.
3. Se houver Website, use https://github.com/GuiMell0/Spotify-Expo. Marque Web API e aceite os termos.
4. Em Redirect URIs, adicione spotifyexpo-login://callback e salve. Para teste web, adicione também http://127.0.0.1:8081/callback. Os campos podem aparecer na criação ou em Settings/Edit Settings.
5. Copie o Client ID e preencha EXPO_PUBLIC_SPOTIFY_CLIENT_ID no .env local. O Client Secret fica no painel e não será usado no aplicativo.
6. Se surgir um campo Android Package, use com.guimello.spotifyexpo, conforme app.json.

Referência: [cadastro de apps Spotify](https://developer.spotify.com/documentation/web-api/concepts/apps).

Em Settings > Users Management, adicione as contas da dupla que testarão o app; inclua a do avaliador se necessário. Apps novos em Development Mode admitem até cinco usuários autorizados e exigem Premium do proprietário. Referência: [acesso em desenvolvimento](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).

Se o painel rejeitar o retorno nativo, envie a mensagem exata antes de mudar a configuração. Para a A04, informe somente o Client ID e o retorno aceito.

## Client ID e token de acesso são diferentes

Client ID identifica o aplicativo e fica em Settings no Dashboard. Um valor copiado de const token em exemplos da API é um token de acesso da sessão; ele não deve ser preenchido no campo Client ID. O login PKCE obtém tokens automaticamente; desde A05, o Android usa armazenamento seguro e renovação. No navegador, os tokens continuam apenas em memória.

## Retorno para Android e navegador

A03 registra spotifyexpo-login como scheme de autenticação, mantendo spotifyexpo para a navegação geral. O retorno nativo configurado é:

    spotifyexpo-login://callback

A documentação de cadastro do Spotify descreve schemes próprios para apps nativos. Confirmar que esse retorno foi aceito no painel antes de testar. Referência: [regras de apps nativos](https://developer.spotify.com/documentation/web-api/concepts/apps).

Para testar pelo navegador do próprio computador, o retorno previsto é:

    http://127.0.0.1:8081/callback

Abrir o aplicativo usando 127.0.0.1 e a mesma porta, em vez de localhost. Endereços web precisam de HTTPS, exceto loopback explícito. Se o painel rejeitar o scheme nativo, trazer a mensagem exata para configurar um retorno HTTPS apropriado; não substituir por endereço HTTP de rede local. Referência: [regras de redirect URI](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

Não usar 127.0.0.1 do celular para apontar ao computador. O retorno web acima é para o navegador do computador; o Android utilizará o retorno nativo configurado no build.

## Variáveis implementadas na A03

O .env.example é versionado e mantém o Client ID vazio. O .env pessoal desta máquina recebeu o Client ID informado pela Ana e é ignorado pelo Git. O modelo é:

    EXPO_PUBLIC_SPOTIFY_CLIENT_ID=
    EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_ANDROID=spotifyexpo-login://callback
    EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_WEB=http://127.0.0.1:8081/callback

Preencha a primeira linha com o Client ID do painel. Depois da mudança, encerre o Metro e execute npm run dev -- --clear (ou npm run start:go -- --clear para a demonstração), garantindo a leitura da configuração atual. Em outra máquina, copie o modelo sem substituir um .env existente.

src/config/spotify.mjs seleciona e valida os campos da plataforma. Android exige o retorno correspondente ao scheme do build. Web usa /callback com HTTPS ou HTTP em loopback explícito; localhost não é aceito. Desde A04, a tela permite o login quando o ambiente estiver pronto e orienta sobre configuração, Expo Go ou origem web incompatível.

Não colocar Client Secret ou tokens em EXPO_PUBLIC, arquivos versionados ou logs. Referência: [variáveis do Expo](https://docs.expo.dev/guides/environment-variables/).

## Como preparar o Android

A Ana escolheu EAS, com APK gerado na nuvem. Siga o [guia Android/EAS](ANDROID-EAS.md) para entrar na conta Expo, vincular o projeto, gerar e instalar o APK e executar npm run dev.

O perfil development de eas.json e expo-dev-client já estão configurados. O APK ainda precisa ser gerado e instalado pela Ana. Expo Go pode exibir a demonstração, mas o teste OAuth exige o build de desenvolvimento. Referência: [autenticação no Expo](https://docs.expo.dev/guides/authentication/).

## Testar login e sessão reais — A04/A05

1. Gere e instale o APK de desenvolvimento atualizado pelo [guia EAS](ANDROID-EAS.md). A04 adicionou expo-auth-session e expo-crypto; A05 adicionou expo-secure-store. Um APK anterior precisa ser gerado novamente.
2. Execute npm run dev -- --clear e abra o aplicativo de desenvolvimento no Android.
3. Toque em Entrar com Spotify. Faça login na janela do Spotify e aceite as permissões.
4. Ao retornar, a Home deve mostrar Conta Spotify conectada. A conta é confirmada em /me; o catálogo ainda é demonstrativo nesta etapa.
5. Confira o cancelamento pela janela de autorização e, se disponível na tela, por Cancelar entrada. No Android, pode ser necessário fechar a aba do Chrome antes de outra tentativa.
6. No Perfil, use Sair da conta. A entrada deve reaparecer, sem permitir voltar às telas privadas.
7. Entre novamente. Feche completamente o aplicativo e reabra pelo development build com o Metro disponível: a Home deve abrir sem repetir a autorização.
8. Depois de o token vencer (normalmente cerca de uma hora), retorne ao aplicativo com internet: a sessão deve ser renovada. Não altere tokens manualmente para testar.
9. Para conferir falha transitória, reabra com token já vencido e sem internet: aguarde a mensagem de conexão; reconecte e use Tentar restaurar sessão. Não deve haver tentativas em ciclo.
10. Use Sair da conta, feche e reabra: o login deve continuar aparecendo. Se houver erro de exclusão, use Limpar sessão novamente.
11. Para testar revogação, remova a autorização deste aplicativo na conta Spotify; na próxima renovação o app deve pedir novo login. Sair da conta no aplicativo apaga a sessão local e não revoga a autorização no Spotify.

A persistência da sessão é própria do Android. No navegador e no Expo Go não gravamos tokens; recarregar exige nova entrada. O armazenamento seguro guarda credenciais, enquanto AsyncStorage será usado para curtidas, histórico e playlists nas próximas etapas. Referências: [SecureStore](https://docs.expo.dev/versions/v57.0.0/sdk/securestore/) e [renovação PKCE do Spotify](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens).

Se receber acesso negado, confira Users Management e o Premium do proprietário. O app solicita user-read-private, playlist-read-private e playlist-read-collaborative. Não solicita permissões de reprodução nesta etapa.

Para teste real pelo navegador, cadastre também http://127.0.0.1:8081/callback no painel Spotify, inicie o Expo web nessa porta e abra exatamente http://127.0.0.1:8081. A origem precisa corresponder à do retorno; localhost e outro endereço não completam essa sessão. Referência: [AuthSession no Expo](https://docs.expo.dev/guides/authentication/).

Os testes automatizados validam o fluxo com respostas simuladas. A validação real no Android depende do APK e da interação da Ana com a conta Spotify.

## Contrato da implementação

- Botão de login disponível somente após preparar a requisição.
- Estado e verificador PKCE conferidos antes de aceitar o retorno.
- Cancelamento e recusa deixam a pessoa tentar novamente.
- Tokens e vencimento restaurados no Android pelo SecureStore.
- Renovação compartilhada entre chamadas concorrentes, com limite de nova tentativa.
- Timeout nas requisições e saída de carregamento em todos os caminhos.
- Logout apaga a sessão Android e bloqueia respostas antigas; erros de exclusão são informados. A separação dos dados de biblioteca por conta será implementada na A12.
- Escopos mínimos para perfil e leitura das playlists; favoritas e playlists locais não precisam de permissão de escrita Spotify.
- Validar endpoints com a conta real antes de confirmar a integração.

## Cuidados de compatibilidade

A API sofreu alterações em 2026. A integração deve evitar endpoints de categorias, lançamentos e top-tracks removidos para novos apps em Development Mode. Para playlists, verificar o endpoint /playlists/{id}/items e as permissões de acesso; o acesso a qualquer playlist pública não deve ser presumido. Campos ausentes não serão substituídos por contagens inventadas. Referência: [mudanças de fevereiro de 2026](https://developer.spotify.com/documentation/web-api/references/changes/february-2026).

Para a Home, a proposta é consultar o catálogo por buscas válidas e aproveitar itens da conta. Para artistas, usar dados e discografia disponíveis, com faixas dos álbuns quando necessário.

Tratar 429 com a espera indicada quando disponível e distinguir QUOTA_EXCEEDED, sem repetir chamadas indefinidamente. Desde julho de 2026, a quota de desenvolvimento é compartilhada por conta de desenvolvedor; criar outro app não resolve esse limite. Referência: [mudanças de julho de 2026](https://developer.spotify.com/documentation/web-api/references/changes/july-2026).

## Mensagem pronta para enviar ao chat

    Tenho Premium e vou testar no Android.
    Client ID: [preencher]
    Redirect URI Android aceito pelo painel: [preencher]
    Redirect URI web aceito pelo painel: [preencher ou informar que não usarei web]
    Android Studio instalado: [sim/não]
    Dispositivo: [celular físico/emulador]
    Contas de teste adicionadas em Users Management: [sim/não]
    Continue apenas a próxima etapa do roteiro e pare antes do commit.

Os valores devem ser inseridos quando a etapa pedir. Não é necessário enviar informações privadas dos usuários autorizados.
