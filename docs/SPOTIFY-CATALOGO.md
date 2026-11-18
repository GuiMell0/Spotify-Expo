# Serviços de catálogo — A07

A07 adiciona uma camada de consultas à Spotify Web API e converte as respostas para os modelos usados nas próximas telas. Ela usa o cliente da A06, sem Client Secret ou dados de demonstração. O objeto catalog está disponível em useSession().

As telas da P1 permanecem demonstrativas nesta etapa. A08 conecta a busca; A09, a Home; A10, álbuns; A11, artistas. A exibição de playlists remotas fica para G05/G06.

## Métodos disponíveis

| Método | Consulta |
| --- | --- |
| search(term, options) | GET /search; álbuns, artistas, faixas e, quando solicitado, playlists. |
| getAlbum(id, options) | GET /albums/{id}; detalhes e primeira página de faixas quando fornecida. |
| getAlbumTracks(id, options) | GET /albums/{id}/tracks. |
| getArtist(id, options) | GET /artists/{id}. |
| getArtistAlbums(id, options) | GET /artists/{id}/albums; grupos album e single por padrão. |
| getTrack(id, options) | GET /tracks/{id}. |
| getPlaylist(id, options) | GET /playlists/{id}; metadados e conteúdo quando acessível. |
| getPlaylistTracks(id, options) | GET /playlists/{id}/items; somente faixas suportadas. |
| getMyPlaylists(options) | GET /me/playlists. |
| nextPage(page, options) | Próxima página, preservando tipo, filtros e contexto; null ao terminar. |

options pode receber signal. Métodos paginados recebem limit e offset; métodos compatíveis recebem market opcional com duas letras. Não há país fixo: o token do usuário define o acesso efetivo.

Busca: limite padrão/máximo de 10 por tipo e offset até 1000. Discografia: 10 por página, com groups opcional entre album, single, compilation e appears_on. Demais listagens: 20 por padrão, máximo de 50; playlists da conta aceitam offset até 100000.

IDs de entidades devem ter 22 caracteres alfanuméricos de Spotify. Slugs da P1, URLs, URIs e caminhos não são aceitos como ID. Os modelos preservam o ID retornado pela API; não geram IDs substitutos. Uma faixa relinkada pode ter ID diferente do solicitado.

## Usar nas próximas telas

Dentro de um componente ou hook:

    const { catalog, isDemo } = useSession();

Somente no modo de conta:

    const controller = new AbortController();
    const result = await catalog.search('música brasileira', {
      types: ['album', 'artist', 'track'],
      limit: 10,
      signal: controller.signal,
    });

    const firstAlbums = result.albums;
    const moreAlbums = firstAlbums.next
      ? await catalog.nextPage(firstAlbums, { signal: controller.signal })
      : null;

A paginação de cada tipo de busca é independente. O serviço não baixa todas as páginas automaticamente. Uma página contém items, next, offset, limit, total e skippedCount. total representa o total informado pelo Spotify e pode ser null; skippedCount conta itens não suportados ou inválidos da página, sem alterar o deslocamento.

Passe a página original para nextPage. Os cursores são mantidos em WeakMap dentro da instância e não devem ser clonados, serializados ou gravados no AsyncStorage. É possível salvar faixas e entidades normalizadas, mas uma página deve ser recarregada para recuperar sua paginação.

O cursor aceita apenas o mesmo recurso em api.spotify.com e um offset crescente. O serviço reconstrói a URL com os filtros originais, sem seguir parâmetros extras do servidor. Isso também mantém a busca quando o cursor usa query em vez de q. Ao trocar de conta ou encerrar a sessão, respostas e cursores antigos são descartados.

A interface deve cancelar com controller.abort() ao trocar o termo ou desmontar, descartar respostas antigas e encerrar o carregamento em finally. Falhas continuam sendo SpotifyApiError da A06; não são convertidas em listas vazias nem substituídas por mocks.

## Modelos e campos opcionais

As entidades possuem id, type, title, href, uri, spotifyUrl e image. image é um objeto { uri } ou null; as telas devem exibir um espaço reservado quando não houver capa. spotifyUrl é o link canônico de atribuição e abertura no Spotify.

- Artista: round, genres e followers. Seguidores ausentes ficam null; ouvintes mensais e popularidade não são inventados.
- Álbum: artists, artist, artistId, releaseDate, releaseDatePrecision, totalTracks e albumType. Datas parciais são preservadas, sem inventar dia ou mês.
- Faixa: artists, artist, album, durationMs, duration, discNumber, trackNumber, explicit, isPlayable e restriction. Duração e disponibilidade ausentes ficam null. A ausência de preview não é tratada como falha, e não há promessa de áudio.
- Créditos com nome e sem ID continuam visíveis, com id/href nulos. Não criar um botão de artista navegável sem ID.
- Playlist: owner, description, totalItems, public, collaborative e snapshotId. totalItems pode incluir episódios; não equivale necessariamente ao número de músicas exibidas.

getAlbum retorna tracks como página, ou null quando não fornecida. Ao chamar getAlbumTracks, pode-se passar options.album com o álbum normalizado do mesmo ID para associar capa e metadados às faixas simplificadas.

getPlaylist retorna tracks como página ou null, além de contentStatus. available indica conteúdo fornecido, inclusive uma lista vazia; not_provided indica que o Spotify não forneceu a lista. Não apresentar not_provided como playlist vazia ou presumir permissão para consultar qualquer playlist pública.

O formato atual usa items e item. Há compatibilidade de leitura com tracks e track nas respostas antigas; as requisições sempre usam /items. Itens removidos, nulos, locais, episódios e entidades com IDs inválidos são descartados, com skippedCount disponível. Uma página sem faixas suportadas ainda pode ter próxima página.

O href de uma faixa aponta para /player?trackId=ID como contrato para a seleção futura. O player demonstrativo ainda não consome esse parâmetro na A07; G11/G12 cuidarão do fluxo de faixa selecionada e abertura no Spotify.

## Verificação e acesso real

- npm run test:catalog: 29 testes aprovados de modelos, endpoints, campos opcionais, paginação, isolamento de sessão e integração com o cliente HTTP usando respostas simuladas.
- Regressão: 78 testes anteriores aprovados; total de 107 testes unitários.
- npm run lint aprovado e bundles Android/Hermes e web gerados com sucesso.
- Edge: 18 cenários com Spotify simulado aprovados, sem exceções JavaScript. Artefatos em dist-check/a07/, ignorada pelo Git.
- A compatibilidade dos endpoints foi conferida na documentação oficial vigente. O teste com a conta real no Android continua pendente; o acesso efetivo será conferido ao conectar as telas nas próximas etapas.
- Não foi usado token copiado manualmente, nem foi feita consulta à conta real por estes testes.
- Não houve nova dependência nativa; permanece válido o APK atualizado da A05. [Preparar Android](ANDROID-EAS.md).

Para a busca real da A08, informe se o APK foi instalado e se Entrar com Spotify conclui normalmente. Para playlists na G05/G06, use uma playlist acessível pela própria conta; acesso ao catálogo público não garante acesso aos seus itens.

Referências: [mudanças de fevereiro de 2026](https://developer.spotify.com/documentation/web-api/references/changes/february-2026), [busca](https://developer.spotify.com/documentation/web-api/reference/search), [discografia](https://developer.spotify.com/documentation/web-api/reference/get-an-artists-albums), [itens da playlist](https://developer.spotify.com/documentation/web-api/reference/get-playlists-items), [playlists da conta](https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists).
