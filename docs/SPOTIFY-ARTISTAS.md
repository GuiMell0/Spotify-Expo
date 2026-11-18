# Artistas e discografia real — A11

A rota /artist/[id] consulta os dados e lançamentos do artista na Spotify Web API. A11 mantém o Expo Router, StyleSheet/Flexbox e a identidade visual das telas já conectadas.

APK e login Android foram confirmados pela Ana. Busca, Home e álbum ainda não tiveram teste físico confirmado; a nova tela de artista também precisa ser conferida no aparelho.

## Conteúdo e navegação

- GET /artists/{id}: nome, imagem disponível e gêneros quando fornecidos.
- GET /artists/{id}/albums: álbuns e singles, com include_groups=album,single, limit=10 e offset.
- Dados do artista aparecem assim que chegam, mesmo enquanto a discografia está carregando.
- Cada lançamento mostra capa ou espaço reservado, título, tipo, data com a precisão fornecida e artistas creditados.
- Abrir um lançamento navega para /album/[id], com as faixas reais implementadas na A10. Voltar conserva as páginas da discografia e o termo da busca.
- Ver no Spotify abre a página do artista externamente.
- A tela autenticada não apresenta métricas inventadas, selo de verificado, botão de seguir demonstrativo ou lista fictícia de músicas populares. O projeto não depende do endpoint de top-tracks indisponível para este modo de acesso.
- Gêneros são opcionais. Seguidores não são exibidos; o campo pode estar ausente nas respostas atuais.
- O modo demonstração continua explícito, com a tela da P1 separada em DemoArtistScreen.

A consulta de lançamentos inclui os grupos album e single. A ação local de acompanhar artista continua planejada para G07. A reprodução permanece para a parte do Guilherme.

## Carregamento e recuperação

Cada ID e sessão recebe uma instância de estado. Não existe persistência em disco nesta etapa; AsyncStorage começa na A12.

- Carregar mais álbuns consulta somente a próxima página. O cursor original é usado pelo serviço da A07.
- Itens repetidos são unificados por ID. Edições distintas com o mesmo nome continuam separadas.
- Falha na próxima página preserva os álbuns e oferece repetição manual.
- Atualizar artista e puxar para atualizar consultam os detalhes e reiniciam a primeira página.
- Falha na atualização preserva os dados reais já carregados do mesmo ID.
- Falha inicial da discografia conserva os dados do artista, exibe o erro e não informa uma lista vazia.
- Uma lista realmente vazia informa que não há álbuns ou singles disponíveis.
- Ao sair, a operação é cancelada e respostas antigas são descartadas.
- Ao voltar do álbum, o conteúdo já concluído permanece em memória.
- ID inválido, conteúdo inexistente e acesso negado exibem mensagens legíveis. Não acionam a demonstração.
- 429 respeita a espera do cliente da A06 e exige nova tentativa manual.
- Voltar após erro não inicia consultas em ciclo.

## Arquivos

- src/screens/ArtistScreen.js: tela autenticada, atualização e navegação.
- src/screens/DemoArtistScreen.js: tela da P1 no modo demonstração.
- src/services/spotifyArtist.mjs: carregamento, paginação e cancelamento por rota/conta.
- tests/spotify-artist.test.mjs: testes da lógica e integração com o contrato do catálogo.
- app/artist/[id].js: rota dinâmica existente.

## Validação automática

- npm run test:artist: 21 testes aprovados.
- Regressão completa: 180 testes unitários aprovados.
- npm run lint aprovado; bundles Android/Hermes e web gerados.
- Edge: 73 cenários com Spotify simulado aprovados (16 novos), sem exceções JavaScript. Incluem dois artistas distintos, discografia paginada, retorno do álbum com estado preservado, recuperação de falhas, campos opcionais, lista vazia, 403/404/429, cancelamento e viewport de 320 pixels.
- Artefatos temporários em dist-check/a11/, ignorada pelo Git.

Os testes automatizados não acessam a conta da Ana. O teste físico no Android continua pendente.

## Testar no APK instalado

1. Execute npm run dev -- --clear e abra o aplicativo de desenvolvimento. A11 altera somente JavaScript; não precisa gerar outro APK.
2. Entre com Spotify, se necessário. Na Home, abra um artista ou use a busca e o filtro Artistas.
3. Confira nome e imagem, ou o espaço reservado quando não houver foto.
4. Aguarde a discografia e confira álbuns e singles do artista.
5. Se aparecer Carregar mais álbuns, toque e confirme que a lista cresce. Artistas com poucos lançamentos podem ter apenas uma página.
6. Abra um álbum da discografia. Confira o título e as faixas. Volte e confirme que a lista do artista foi conservada.
7. Volte à busca e abra outro artista. Confira que os dados e lançamentos correspondem ao segundo artista.
8. Toque em Atualizar artista e teste o gesto de puxar para atualizar.
9. Com dados carregados, desligue a internet e tente atualizar. Aguarde o erro e confira que os dados anteriores permanecem. Reative a conexão e tente novamente.
10. Toque em Ver no Spotify e confira se abre o artista correto no Spotify ou navegador.

Não precisa provocar 403, 404 ou 429 na conta real. Ao relatar falhas, informe o texto mostrado sem enviar tokens, senha ou Client Secret.

## Mensagem para continuar

    Fiz o commit A11 e o push.
    Busca, Home e álbum no Android: [resultado / erro exato]
    Dois artistas e discografia: [resultado]
    Álbum pela discografia e retorno: [resultado]
    Continue somente a A12 e pare antes do próximo commit.

Referências: [dados do artista](https://developer.spotify.com/documentation/web-api/reference/get-an-artist), [álbuns do artista](https://developer.spotify.com/documentation/web-api/reference/get-an-artists-albums) e [mudanças de acesso de fevereiro de 2026](https://developer.spotify.com/documentation/web-api/references/changes/february-2026).
