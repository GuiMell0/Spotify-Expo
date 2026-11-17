# Configuração Spotify — P2

Este guia prepara etapas futuras. A01 altera apenas documentação; ainda não há login real, arquivo de ambiente ou development build configurado.

## O que já sabemos

A Ana possui Premium e vai testar no Android. O fluxo escolhido é Authorization Code com PKCE: o navegador autoriza o usuário e o aplicativo troca um código temporário usando um verificador. O Client Secret não participa desse fluxo no cliente. Referência: [PKCE do Spotify](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow).

Client Credentials é apropriado para comunicação de servidor com servidor, sem acesso à conta do usuário; exigiria manter o segredo em um backend. Não será usado diretamente no aplicativo. Referência: [autorização Spotify](https://developer.spotify.com/documentation/web-api/concepts/authorization).

## Passos que dependem da Ana

1. Entrar no [Dashboard Spotify for Developers](https://developer.spotify.com/dashboard) com a conta Premium.
2. Criar um aplicativo para o projeto acadêmico, preenchendo nome, descrição e os termos exigidos pelo formulário. Selecionar Web API quando essa opção for apresentada.
3. Abrir as configurações e copiar o Client ID. O painel também fornece o Client Secret, mas não é necessário copiá-lo para este projeto. Referência: [cadastro de apps](https://developer.spotify.com/documentation/web-api/concepts/apps).
4. Cadastrar os retornos de autenticação descritos abaixo. O valor utilizado no código precisa corresponder ao cadastrado.
5. Em Settings > Users Management, permitir acesso às contas usadas pela dupla e, se necessário, à do avaliador. Novos apps em Development Mode aceitam até cinco usuários autorizados e exigem Premium do proprietário. Uma conta fora da lista pode conseguir login e ainda receber 403 na API. Referência: [modo de desenvolvimento](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
6. Informar no chat somente o Client ID, os retornos aceitos pelo painel e se o Android Studio já está instalado. Não enviar senha, Client Secret, código OAuth ou tokens.

## Retorno para Android e navegador

Na etapa A03, preparar o scheme exclusivo spotifyexpo-login. O retorno nativo proposto é:

    spotifyexpo-login://callback

A documentação de cadastro do Spotify descreve schemes próprios para apps nativos. Confirmar que esse retorno foi aceito no painel antes de testar. Referência: [regras de apps nativos](https://developer.spotify.com/documentation/web-api/concepts/apps).

Para testar pelo navegador do próprio computador, o retorno previsto é:

    http://127.0.0.1:8081/callback

Abrir o aplicativo usando 127.0.0.1 e a mesma porta, em vez de localhost. Endereços web precisam de HTTPS, exceto loopback explícito. Se o painel rejeitar o scheme nativo, trazer a mensagem exata para configurar um retorno HTTPS apropriado; não substituir por endereço HTTP de rede local. Referência: [regras de redirect URI](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

Não usar 127.0.0.1 do celular para apontar ao computador. O retorno web acima é para o navegador do computador; o Android utilizará o retorno nativo configurado no build.

## Variáveis previstas para A03

O arquivo .env.example será versionado com valores de exemplo. O arquivo .env pessoal ficará fora do Git:

    EXPO_PUBLIC_SPOTIFY_CLIENT_ID=seu_client_id
    EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_ANDROID=spotifyexpo-login://callback
    EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_WEB=http://127.0.0.1:8081/callback

Esses nomes ainda são uma proposta de configuração. O código será implementado para selecionar o retorno conforme a plataforma. Reiniciar o Metro depois de alterar variáveis.

Não criar variável EXPO_PUBLIC para Client Secret: valores desse tipo são incluídos no aplicativo. Tokens também não vão para arquivos versionados nem logs.

## Como testar OAuth no Android

Expo Go não oferece o scheme personalizado necessário para esse teste de autenticação. A partir de A03, usar um development build com expo-dev-client. Referência: [autenticação no Expo](https://docs.expo.dev/guides/authentication/).

Caminho principal no Windows:

1. Informar se já existe Android Studio, SDK Android e dispositivo/emulador configurados.
2. Aguardar A03 preparar as dependências e a configuração nativa.
3. Com o ambiente Android instalado, gerar e instalar o aplicativo de desenvolvimento com npx expo run:android.
4. Para iniciar o Metro nas execuções seguintes, usar npx expo start --dev-client.
5. Abrir o development build instalado, iniciar o login pelo botão e conferir o retorno ao aplicativo.

Se não houver ambiente Android local, preparar a alternativa de build pelo EAS com a própria conta Expo quando chegarmos a A03. A instalação do APK, login na conta e aceite de permissões dependem da Ana. O guia será atualizado com os comandos adequados ao caminho escolhido.

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
