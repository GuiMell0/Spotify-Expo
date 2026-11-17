# Configuração Spotify — P2

A03 prepara o ambiente, o modelo de variáveis e o perfil EAS para Android. A Ana escolheu APK pela nuvem, forneceu o Client ID e confirmou spotifyexpo-login://callback salvo no painel. O Client ID foi preenchido somente no .env local. Login real é a A04; geração/instalação do APK e teste com a conta continuam pendentes.

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

Client ID identifica o aplicativo e fica em Settings no Dashboard. Um valor copiado de const token em exemplos da API é um token de acesso da sessão; ele não deve ser preenchido no campo Client ID. O login PKCE da A04 obterá tokens, e a sessão da A05 cuidará da renovação.

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

src/config/spotify.mjs seleciona e valida os campos da plataforma. Android exige o retorno correspondente ao scheme do build. Web usa /callback com HTTPS ou HTTP em loopback explícito; localhost não é aceito. A tela indica configuração pendente ou preenchida, sem realizar autenticação.

Não colocar Client Secret ou tokens em EXPO_PUBLIC, arquivos versionados ou logs. Referência: [variáveis do Expo](https://docs.expo.dev/guides/environment-variables/).

## Como preparar o Android

A Ana escolheu EAS, com APK gerado na nuvem. Siga o [guia Android/EAS](ANDROID-EAS.md) para entrar na conta Expo, vincular o projeto, gerar e instalar o APK e executar npm run dev.

O perfil development de eas.json e expo-dev-client já estão configurados. O APK ainda precisa ser gerado e instalado pela Ana. Expo Go pode exibir a demonstração, mas o teste OAuth exige o build de desenvolvimento. Referência: [autenticação no Expo](https://docs.expo.dev/guides/authentication/).

## Contrato da implementação

- Botão de login disponível somente após preparar a requisição.
- Estado e verificador PKCE conferidos antes de aceitar o retorno.
- Cancelamento e recusa deixam a pessoa tentar novamente.
- Tokens e vencimento restaurados no Android pelo SecureStore.
- Renovação compartilhada entre chamadas concorrentes, com limite de nova tentativa.
- Timeout nas requisições e saída de carregamento em todos os caminhos.
- Logout apaga a sessão; os dados locais ficam separados por conta.
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
