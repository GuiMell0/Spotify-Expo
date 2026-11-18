# Android com EAS — preparação A03 e sessão A04/A05

A Ana escolheu gerar o APK na nuvem. O projeto já inclui expo-dev-client, os schemes, o perfil development em eas.json e, desde A04, expo-auth-session e expo-crypto. A05 acrescenta expo-secure-store e seu plugin. Na A08, a Ana confirmou o APK atualizado instalado e o login Spotify funcionando no Android. Este guia continua disponível para novas instalações e para a dupla.

Para instalar o APK independente, que a Ana escolheu depois da A12, veja [Instalar no celular](INSTALAR-NO-CELULAR.md). Esse perfil inclui o aplicativo e funciona sem Metro.

## 1. Preparar o Spotify e a configuração local

Siga o [passo a passo do Spotify](SPOTIFY-SETUP.md). O .env local desta máquina já recebeu o Client ID informado pela Ana. O retorno Android foi confirmado no painel Spotify. Em outra máquina, preencha o próprio .env com o Client ID do projeto.

Em outra máquina, crie o arquivo somente se ele ainda não existir:

    if (-not (Test-Path -LiteralPath '.env')) { Copy-Item -LiteralPath '.env.example' -Destination '.env' }

O .env é ignorado pelo Git. O modelo .env.example é compartilhado com a dupla. Variáveis EXPO_PUBLIC são incluídas no JavaScript e devem conter somente dados públicos. Referência: [variáveis no Expo](https://docs.expo.dev/guides/environment-variables/).

## 2. Entrar na conta Expo e vincular o projeto

Crie ou entre na sua conta em [expo.dev](https://expo.dev/). No terminal da pasta Spotify-Expo, execute os comandos separadamente:

    npx eas-cli@latest login
    npx eas-cli@latest whoami
    npx eas-cli@latest init

Faça login no próprio terminal. No init, confira o nome da conta e crie ou selecione o projeto correto. Esse comando vincula o projeto ao EAS e pode adicionar extra.eas.projectId e owner ao app.json. Preserve o identificador que o EAS gerar.

O eas.json já está preparado; mantenha o perfil development. Referência: [primeiro build com Expo](https://docs.expo.dev/build/setup/).

## 3. Gerar o APK de desenvolvimento

    npx eas-cli@latest build --platform android --profile development

Se o EAS solicitar uma chave Android para este projeto novo, selecione a geração da chave pelo próprio serviço. Acompanhe o link do build mostrado no terminal.

O perfil usa developmentClient, distribuição internal e buildType apk. Ele gera um aplicativo instalável para desenvolvimento. Referência: [configuração do EAS](https://docs.expo.dev/build/eas-json/).

A05 adicionou expo-secure-store às bibliotecas nativas do login. A12 adiciona @react-native-async-storage/async-storage 2.2.0 para os dados locais. Gere e instale um APK atualizado com a A12; atualizar apenas o JavaScript não acrescenta esse módulo nativo. O [guia do armazenamento](ARMAZENAMENTO-LOCAL.md) contém a conferência desta etapa.

## 4. Instalar e abrir no Android

Abra no celular o link do build concluído, baixe o APK e instale. Se o Android pedir autorização para instalar pelo navegador utilizado, permita para concluir essa instalação.

Na pasta do projeto, execute:

    npm run dev -- --clear

Mantenha celular e computador na mesma rede. Abra o app instalado e use o QR Code ou o endereço do Metro. O APK de desenvolvimento depende desse servidor para carregar o JavaScript durante os testes. Referência: [development builds](https://docs.expo.dev/develop/development-builds/introduction/).

Se a rede local bloquear a conexão, tente:

    npm run dev -- --tunnel

O tunnel transporta a conexão com o Metro; o retorno OAuth continua sendo spotifyexpo-login://callback.

## 5. Como conferir a configuração e a A04/A05

- Sem configuração válida, o login mostra orientação e permite a demonstração.
- No Expo Go, a entrada real permanece bloqueada com orientação para usar o APK de desenvolvimento.
- No APK atualizado, Entrar com Spotify abre a autorização; após o retorno válido, a Home mostra Conta Spotify conectada.
- Teste também cancelamento e Sair da conta no Perfil. O passo a passo está em SPOTIFY-SETUP.md.
- Desde A05, fechar e reabrir no Android restaura a conta, quando válida. Teste também sair, reabrir e permanecer no login. O login no aparelho foi confirmado na A08; a nova busca tem um [passo a passo de validação](SPOTIFY-BUSCA.md).
- A geração e instalação do APK só ficam confirmadas depois de executar os passos acima.
- Ao adicionar bibliotecas nativas ou alterar schemes/plugins, gere e instale outro APK. Alterações comuns no JavaScript usam o Metro.

Para conferir a demonstração no Expo Go enquanto prepara o APK:

    npm run start:go -- --clear

Para testes no navegador, abra a origem correspondente ao retorno cadastrado, usando 127.0.0.1:8081. Se o Expo iniciar em outra porta, ajuste a execução e o retorno juntos.

## Ambiente local e ambiente da nuvem

O perfil seleciona o ambiente development no EAS. O .env ignorado não é enviado como parte do código. Durante o desenvolvimento, npm run dev lê as variáveis locais para servir o JavaScript ao APK.

Se precisar de variáveis durante um build que incorpore o JavaScript, configure as mesmas variáveis públicas no ambiente development do projeto no painel Expo. Referência: [variáveis em builds](https://docs.expo.dev/eas/environment-variables/usage/).

## Alternativa com Android Studio

Se optar por compilar neste computador depois, configure Android Studio, SDK Android, JDK compatível e um celular com depuração USB ou emulador. Execute npm run android:local. Esse caminho gera android/ pelo Expo; as pastas nativas geradas estão fora do Git. O caminho escolhido para esta etapa é o EAS.

## Mensagem para retomar no chat

    Fiz o commit A12.
    Login real no APK testado: [sim/não; informar o erro se houver]
    Projeto vinculado à conta Expo: [sim/não]
    APK gerado/instalado: [sim/não; pode aguardar as bibliotecas nativas]
    Continue somente a A13 e pare antes do próximo commit.

Se algum comando falhar, informe o comando e a mensagem completa, sem credenciais de conta ou tokens.
