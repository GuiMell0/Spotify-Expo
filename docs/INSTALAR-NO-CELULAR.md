# Instalar o APK final independente no Android — G15

Esta é a opção escolhida pela Ana: instalar e abrir o aplicativo sem iniciar Metro nem conectar o computador. O perfil preview inclui o JavaScript e as bibliotecas nativas necessárias.

## Atualização com ícone e correção da Biblioteca

A pedido da Ana, o aplicativo recebeu um ícone próprio no launcher: símbolo Spotify verde em fundo escuro, com variantes adaptativa e monocromática. O versionCode Android foi atualizado para 2, mantendo o pacote e a assinatura existentes.

[Acompanhar e baixar o APK com ícone e correção](https://expo.dev/accounts/anacgsx/projects/spotify-static-clone/builds/de14145c-1d5a-44b3-88b1-01718a3522de)

ID: de14145c-1d5a-44b3-88b1-01718a3522de. Status no envio: NEW. Aguardar Finished para baixar.

Usar esta compilação para receber o ícone junto da correção do botão. Depois de instalar como atualização, conferir o ícone na lista de aplicativos e testar a Home sem internet: Atualizar início → Abrir Biblioteca local. Não é necessário instalar a versão intermediária abaixo antes desta.

## Compilação intermediária — correção da Biblioteca

Ana instalou a compilação f5579691-0b9f-474b-8ed6-d7b431781385 e confirmou os principais fluxos. Ela relatou uma falha no botão Abrir Biblioteca local da Home. O código foi corrigido e passou por lint, bundles e cinco cenários específicos de navegador. A nova compilação acrescenta essa correção à base funcional testada.

[Acompanhar e baixar a atualização corrigida](https://expo.dev/accounts/anacgsx/projects/spotify-static-clone/builds/94df52d4-69f8-420c-aa95-bb19d04fe0be)

ID: 94df52d4-69f8-420c-aa95-bb19d04fe0be. Status no envio: NEW. O download será liberado quando aparecer Finished.

Ao instalar a atualização, desativar a internet, abrir a Home, tocar em Atualizar início para exibir a falha e então tocar em Abrir Biblioteca local. Confirmar que a aba Sua Biblioteca aparece. Informar no chat: “Atualizei o APK e o botão da Home funciona”, ou enviar a mensagem/tela observada. As demais confirmações já recebidas permanecem registradas; os casos não testados continuam assim identificados.

## Compilação anterior testada

A compilação anterior foi gerada a partir do código funcional G14, commit 6b781cd, com a mensagem P2 final G15 - funcionalidades G14 6b781cd. Para conferir a correção do atalho, usar o link da atualização acima.

[Acompanhar o APK final no Expo](https://expo.dev/accounts/anacgsx/projects/spotify-static-clone/builds/f5579691-0b9f-474b-8ed6-d7b431781385)

ID: f5579691-0b9f-474b-8ed6-d7b431781385. Instalação e principais fluxos confirmados pela Ana. Enviado em 2026-11-19T03:20:48.040Z.

O download fica disponível quando a compilação terminar.

A compilação antiga da A12 não contém as funcionalidades completas. Para a conferência da P2, utilizar a compilação final identificada acima.

## Baixar e instalar no celular

1. Abrir no navegador do celular o link da compilação final.
2. Se o status ainda for In queue ou In progress, aguardar. O arquivo fica disponível somente quando o status for Finished.
3. Quando terminar, tocar em Install ou no download do arquivo .apk na página.
4. Aguardar o download e abrir o arquivo pela notificação ou pela pasta Downloads.
5. Se o Android solicitar autorização para instalar, permitir para o navegador ou gerenciador utilizado.
6. Preferir Atualizar se já houver uma instalação. Se aparecer conflito de assinatura ou erro, enviar o texto antes de desinstalar ou limpar dados.
7. Abrir Spotify UI Expo. Esse APK não precisa de npm, terminal, Expo Go, QR Code ou Metro.
8. Sem conexão, abrir a Home, tocar em Atualizar início e conferir o botão corrigido. Os demais resultados e casos não testados estão em VALIDACAO-P2.md.

Se o EAS mostrar Errored, enviar o link da compilação para investigar. Um link de acompanhamento não significa que o APK já esteja pronto.

## O que conferir

O login, a consulta do catálogo e as imagens remotas precisam de conexão. As coleções locais da conta já salvas podem ser acessadas sem rede. Ouvir no Spotify abre a faixa no Spotify ou no navegador, sem reprodução interna.

O [checklist final](VALIDACAO-P2.md) contém os testes e um modelo de resposta para colar no chat. A instalação só fica confirmada depois de abrir o aplicativo no aparelho.

## Se precisar gerar outra versão

A conta Expo deste computador foi confirmada na G15. O ambiente preview carregou EXPO_PUBLIC_SPOTIFY_CLIENT_ID e EXPO_PUBLIC_SPOTIFY_REDIRECT_URI_ANDROID. Não usa Client Secret.

    npx eas-cli build --platform android --profile preview

Executar somente se for necessário outro APK. A compilação final já iniciada deve ser acompanhada pelo link, sem criar builds duplicados. Uma alteração funcional posterior ao envio exigirá outra versão.

O perfil development continua disponível para desenvolvimento com Metro; ver ANDROID-EAS.md.
