# Playlists Spotify — G05

A rota /playlist/[id] agora consulta metadados e faixas reais da conta, com paginação. O modo demonstrativo da P1 fica exclusivamente em DemoPlaylistScreen. IDs locais não são usados nesta rota.

A tela mostra capa, nome, proprietário e informações disponíveis, com link para o Spotify. Músicas abrem os metadados corretos; curtidas e adição a playlists locais reutilizam as funções existentes. Não há reprodução, progresso ou download fictícios.

O controlador src/services/spotifyPlaylist.mjs cancela operações ao sair, descarta respostas antigas e preserva dados confirmados quando uma atualização falha. As páginas usam o cursor original do catálogo. Ocorrências repetidas de uma faixa são mantidas porque uma playlist pode conter a mesma música mais de uma vez.

Se os metadados não fornecerem itens, o catálogo consulta /playlists/{id}/items. Itens removidos, episódios e faixas locais não são inventados como músicas: são contabilizados como itens não disponibilizados. Playlist vazia, acesso negado e erro de rede são estados distintos.

As permissões playlist-read-private e playlist-read-collaborative já fazem parte do login. O acesso ainda depende do Spotify e da conta. Uma falha não ativa dados demonstrativos. A listagem das playlists da conta na Biblioteca continua em G06. A G05 reutiliza uma tela existente: permanecem 15 telas principais.

Referências oficiais: [Get Playlist](https://developer.spotify.com/documentation/web-api/reference/get-playlist) e [Get Playlist Items](https://developer.spotify.com/documentation/web-api/reference/get-playlists-items).

## Validação

322 testes unitários aprovados, incluindo oito novos de controlador e integração com catálogo. 322 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Navegador cobre paginação, recuperação, repetição de faixas, itens ausentes, curtidas, acesso negado, vazio e largura de 320 pixels. Os dados do navegador são simulados e não usam a conta real.

## Conferência Android no final do projeto

Abrir uma playlist acessível à conta pela busca ou pela listagem implementada em G06. Conferir proprietário, faixas, paginação, curtidas e inclusão em uma playlist local. Tentar um ID sem acesso e confirmar a orientação da tela. Em caso de 403, conferir conta autorizada, permissões e uma playlist acessível; não reenviar Client Secret ou tokens no chat.

A verificação com a conta real permanece pendente. Não gerar APK nesta etapa; testar o aparelho apenas quando o projeto completo estiver pronto.

Após o commit G05, continuar somente G06: listar as playlists Spotify da conta na Biblioteca, com paginação e distinção das playlists locais.
