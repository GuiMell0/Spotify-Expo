# Artistas acompanhados localmente — G07

A tela real do artista oferece Acompanhar neste aparelho. A escolha é salva no registro AsyncStorage da conta, sem modificar seguidores no Spotify. A interface só confirma a alteração após gravar e bloqueia novos toques durante o salvamento.

A Biblioteca mostra artistas em Tudo e no filtro Artistas, com identificação de acompanhamento local. Os cards abrem /artist/[id]. A lista local pode ser consultada sem rede; o carregamento completo do artista e discografia continua dependendo da API.

O serviço src/services/followedArtists.mjs normaliza o snapshot, deduplica por ID e recebe a ação explícita de acompanhar ou remover. Repetições são idempotentes. O limite é de 200 artistas por conta no aparelho. Os demais dados são preservados; falhas oferecem nova leitura pelo aviso global.

Nenhum token, métrica de seguidores ou estado de seguir do Spotify é salvo como acompanhamento local. A demonstração não usa dados pessoais. Não há mudança do schema: followedArtists já existia na versão 1.

## Validação

338 testes unitários aprovados, incluindo oito novos de persistência, limites, duplicatas, concorrência, filtro e recuperação. 338 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários verificam sincronização, remoção, recuperação, reabertura, operação local sem rede, largura de 320 pixels, contas distintas e demonstração.

## Conferência Android ao final do projeto

Abrir um artista real, acompanhar, conferir o card na Biblioteca e reabrir. Remover e conferir a atualização da Biblioteca. Testar com sessão válida sem rede, após carregar os dados, e confirmar o isolamento de outra conta autorizada.

Permanecem 15 telas principais. Não gerar APK por etapa. Após o commit G07, continuar somente G08: perfil real da conta.
