# Álbuns e faixas reais — A10

A tela /album/[id] agora carrega detalhes e faixas pela Spotify Web API para a conta conectada. O APK e o login Android já foram confirmados pela Ana. Em 18/11/2026, ela informou que ainda não havia testado busca e Home no celular; esses fluxos e os álbuns novos continuam pendentes de conferência física.

## Conteúdo e navegação

- A rota sempre consulta o ID solicitado em GET /albums/{id}. Não depende dos metadados de um resultado de busca para obter a lista completa.
- Usa a primeira página de tracks incluída nos detalhes. Se esse campo não vier, consulta GET /albums/{id}/tracks, preservando os metadados do álbum para complementar as faixas simplificadas.
- Exibe título, capa, créditos dos artistas, tipo, total e data de lançamento quando fornecidos. A data preserva a precisão original: 2026, 2026-05 ou 2026-05-20.
- Faixas exibem posição, disco quando houver mais de um, artista, duração, marca de conteúdo explícito e indisponibilidade quando informada.
- Campos ausentes não recebem números ou datas fictícios. Capa ausente usa um espaço reservado.
- Nome de artista com ID válido abre /artist/[id]. A página completa do artista e a discografia continuam na A11.
- Uma faixa abre /player?trackId=ID com seus metadados e contexto do álbum. Voltar conserva as páginas já carregadas.
- Ver no Spotify abre o álbum externamente; tocar em faixa ainda não inicia áudio dentro do aplicativo. A integração do player permanece para o Guilherme.
- Conta conectada com ID malformado, conteúdo inexistente ou sem permissão recebe erro legível. Não troca para catálogo fictício.
- O modo demonstração explícito mantém a tela da P1 em DemoAlbumScreen, sem consultar a API.

## Paginação, atualização e falhas

Carregar mais faixas consulta apenas a próxima página. O cursor original fornecido pelo serviço da A07 é preservado; as páginas não são reconstruídas a partir de URLs externas. Faixas repetidas com mesmo ID, disco e posição são unificadas. A mesma gravação em posições distintas permanece na lista.

Voltar do artista ou dos detalhes de uma faixa reutiliza o estado em memória do álbum. Atualizar álbum ou puxar para atualizar reinicia a primeira página. Esse estado não é persistência em disco; AsyncStorage começa na A12.

- Consulta em andamento: evita operações duplicadas.
- Saída da tela: cancela a operação e ignora respostas antigas.
- Troca de ID ou sessão: cria outra instância, sem exibir faixas de outra rota ou conta.
- Lista vazia concluída: informa que não há faixas disponíveis.
- Página com itens não fornecidos: informa omissões e mantém a próxima página disponível, quando houver.
- Falha ao carregar mais: mantém faixas e cursor para repetir manualmente.
- Falha na atualização inicial dos detalhes: mantém dados reais já carregados do mesmo ID; não usa dados de outro álbum.
- Metadados sem lista e falha no endpoint de faixas: mantém os metadados, exibe erro e não apresenta um falso estado vazio.
- 403 e 404: encerram o carregamento e orientam o usuário, sem repetição automática.
- 429: respeita Retry-After do cliente HTTP antes da tentativa manual.

## Arquivos

- src/screens/AlbumScreen.js: interface real com StyleSheet/Flexbox, estados de carregamento, navegação e atualização.
- src/screens/DemoAlbumScreen.js: tela da P1 restrita ao modo demonstração.
- src/services/spotifyAlbum.mjs: estado observável por rota/conta, cancelamento e paginação.
- tests/spotify-album.test.mjs: cenários de dados, falhas, posições, cancelamento e ID malformado.
- app/album/[id].js: rota dinâmica existente, mantida pelo Expo Router.

## Validação automática

- npm run test:album: 19 testes aprovados.
- Regressão completa: 159 testes unitários aprovados, incluindo autenticação, sessão, API, catálogo, busca e Home.
- npm run lint aprovado; bundles Android/Hermes e web gerados.
- Edge: 57 cenários com Spotify simulado aprovados (14 novos), sem exceções JavaScript. Cobrem dois álbuns distintos, artista e faixa, volta com páginas preservadas, paginação com falha e repetição, atualização, campos opcionais, lista vazia, consulta separada de faixas, 403/404/429, resposta antiga e largura de 320 pixels.
- Artefatos temporários em dist-check/a10/, ignorada pelo Git.

Os testes usam respostas simuladas e não acessam sua conta Spotify. O teste físico no Android continua pendente.

## Testar no APK instalado

1. Execute npm run dev -- --clear e abra o aplicativo de desenvolvimento já instalado. Não é necessário gerar outro APK: a A10 altera somente JavaScript.
2. Entre com Spotify e confira a Home. Se ocorrer erro, informe o texto mostrado.
3. Abra um álbum da Home. Confira capa, título e créditos.
4. Confira as faixas e suas durações. Se houver Carregar mais faixas, toque e confirme que a lista cresce. Álbuns curtos podem não ter outra página.
5. Abra o artista pelo nome e volte. A lista do álbum deve continuar carregada.
6. Abra uma faixa e confira os metadados. Volte e confirme que a lista foi conservada. A reprodução fica para a parte do Guilherme.
7. Volte à busca, pesquise um álbum diferente e abra-o. Confira que título, artista e faixas correspondem ao segundo álbum.
8. Use Atualizar álbum e também o gesto de puxar para atualizar.
9. Com o álbum carregado, desligue a internet e tente atualizar. Aguarde o erro; dados já carregados do mesmo álbum devem permanecer. Reative a conexão e tente novamente.
10. Toque em Ver no Spotify e confira se abre o álbum correto no aplicativo Spotify ou navegador.

Não precisa provocar 403, 404 ou 429 na conta real; esses cenários são cobertos pelos testes simulados. Não envie tokens, Client Secret ou senha ao relatar erros.

## Mensagem para continuar

    Fiz o commit A10 e o push.
    Busca e Home no Android: [funcionaram / erro exato]
    Dois álbuns e paginação: [resultado]
    Voltar do artista e da faixa: [resultado]
    Continue somente a A11 e pare antes do próximo commit.

Referências: [detalhes do álbum](https://developer.spotify.com/documentation/web-api/reference/get-an-album) e [faixas do álbum](https://developer.spotify.com/documentation/web-api/reference/get-an-albums-tracks).
