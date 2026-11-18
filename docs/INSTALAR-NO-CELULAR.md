# Instalar o APK independente no Android

Decisão da Ana em 18/11/2026: gerar e testar o APK somente quando o projeto estiver pronto. Os comandos de compilação e a conferência no celular descritos neste guia ficam para a validação final.

Esta é a opção escolhida pela Ana depois da A12: instalar e abrir no celular sem iniciar o Metro no computador.

## Quando o APK estiver disponível

1. Abra, no celular, o link de download enviado no chat.
2. Aguarde o arquivo .apk terminar de baixar.
3. Abra o arquivo pela notificação de download ou pela pasta Downloads do celular.
4. Se o Android solicitar, permita a instalação pelo navegador ou gerenciador de arquivos que você está usando.
5. Toque em Instalar e depois em Abrir.
6. O aplicativo aparece como Spotify UI Expo. Entre com Spotify ou use Explorar demonstração.

O login e o catálogo precisam de internet. As funcionalidades disponíveis correspondem ao código incluído nessa compilação, até a A12.

## Se já existir uma instalação

Prefira a opção de atualizar o aplicativo. Se aparecer conflito ou mensagem de que o aplicativo não foi instalado, envie o texto exibido antes de desinstalar ou limpar os dados.

## Atualizações futuras

O APK independente inclui o JavaScript na própria instalação. Para receber funcionalidades que forem criadas depois desta compilação, será necessário gerar e instalar outro APK.

O perfil preview foi acrescentado ao eas.json com developmentClient false, distribuição interna e formato apk. O ambiente preview do projeto Expo recebeu somente o Client ID público e o retorno Android do Spotify.

Para quem for gerar outra versão posteriormente:

    npx eas-cli@latest build --platform android --profile preview

O perfil development continua disponível para trabalhar no código com Metro. O [guia Android/EAS](ANDROID-EAS.md) contém esse fluxo.

## Estado da primeira geração independente

O envio foi feito ao Expo em 18/11/2026. O link do APK será entregue depois da conclusão da compilação. A configuração está pronta; a instalação e o teste físico precisam ser confirmados pela Ana.
