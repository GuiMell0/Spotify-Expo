# Busca Spotify — A08

A conta autenticada agora pesquisa o catálogo real na aba Buscar, usando catalog da A07 e o cliente HTTP da A06. A Ana confirmou nesta etapa que o APK atualizado já está instalado e o login Spotify funciona no Android.

## Comportamento entregue

- Digitação com espera de 350 ms; Enter inicia a pesquisa imediatamente.
- Filtros Tudo, Músicas, Artistas, Álbuns e Playlists, com até 10 resultados por tipo em cada página.
- Termo vazio não chama a API. Sugestões iniciam pesquisas reais.
- Ao trocar termo ou filtro, resultados anteriores são removidos e consultas pendentes são canceladas. Respostas e erros atrasados não substituem a consulta atual.
- Cada tipo tem seu próprio Carregar mais. Paginação evita cliques duplicados, elimina IDs repetidos e preserva os resultados caso a próxima página falhe.
- Rede, permissões e limite usam ApiFeedback. 429 mostra a espera antes de nova tentativa manual; não há repetição automática.
- Sair da tela interrompe consultas pendentes. Voltar de um resultado preserva o termo, filtro e dados já carregados, sem refazer uma consulta pronta.
- Logout e nova conta começam com uma busca nova. Esta etapa mantém somente estado em memória; histórico persistente será feito na A14.
- O modo de demonstração continua separado e identificado, sem consultar a API. Falha de rede de uma conta real não ativa dados demonstrativos.

A tela real usa StyleSheet/Flexbox, rótulos acessíveis, imagens sem corte de capa e espaços reservados para imagens ausentes. As categorias demonstrativas de podcasts/eventos não aparecem no modo de conta, pois não correspondiam aos serviços integrados.

## Abrir os resultados

Música, artista, álbum e playlist usam os IDs e rotas corretos do catálogo. A08 incluiu CatalogEntityPreview para os metadados básicos. A10 conecta a página de álbum com faixas; A11 conecta artista e discografia. A visualização básica continua para playlists e faixas, com título, imagem, metadados disponíveis e link Spotify.

A visualização aproveita a entidade já carregada pela pesquisa. Caso ela não esteja disponível na memória, consulta o serviço correspondente. Voltar retorna à busca preservada. A faixa com trackId mostra seus próprios dados; não exibe a música e o progresso fictícios do player antigo.

A10 adiciona a lista de faixas do álbum ([guia](SPOTIFY-ALBUNS.md)); A11, a discografia do artista ([guia](SPOTIFY-ARTISTAS.md)); G05/G06 implementarão o conteúdo e a biblioteca de playlists. G11/G12 continuam responsáveis pela experiência do player, seleção e fila. Abrir um link Spotify não implementa reprodução interna no aplicativo.

## Organização

- src/services/spotifySearch.mjs: controlador observável, debounce, cancelamento, paginação e estado da consulta.
- src/contexts/SearchContext.js: instância por conta/modo e assinatura React com useSyncExternalStore.
- src/screens/SearchScreen.js: interface da busca autenticada.
- src/screens/DemoSearchScreen.js: busca local da P1, somente após escolha explícita de demonstração.
- src/screens/CatalogEntityPreview.js: apresentação básica dos resultados reais.
- Rotas existentes de álbum, artista, playlist e player encaminham IDs reais à visualização básica, preservando a demonstração nas rotas antigas.

## Conferência automática

- npm run test:search: 17 testes aprovados de digitação, filtros, respostas atrasadas, cancelamento, recuperação, deduplicação, paginação e isolamento.
- Regressão: 107 testes anteriores aprovados; total de 124 testes.
- npm run lint aprovado; bundles Android/Hermes e web gerados.
- Edge: 31 cenários com Spotify simulado aprovados, incluindo os quatro tipos de resultado, retorno à busca, falhas, espera por limite e recuperação, sem exceções JavaScript.
- Artefatos temporários em dist-check/a08/, ignorada pelo Git.

Os testes simulados não consultam sua conta. O APK/login já foram confirmados pela Ana; a busca real no aparelho deve ser conferida pelos passos abaixo.

## Testar no Android já instalado

1. Na pasta do projeto, execute npm run dev -- --clear. Abra o APK existente pelo Metro, mantendo o celular e computador conectados.
2. Entre com Spotify, se necessário, e abra a aba Buscar.
3. Pesquise um termo com muitos resultados, como rock, e depois um artista conhecido. Confira se os nomes mudam e se aparecem capas ou espaços reservados.
4. Digite rapidamente outro termo: os resultados anteriores devem desaparecer até a pesquisa nova concluir.
5. Teste os filtros Músicas, Artistas, Álbuns e Playlists.
6. Quando Carregar mais estiver disponível, toque e confira novos itens. Não deve haver duplicação das linhas anteriores.
7. Abra cada tipo de resultado, confira os dados e volte. O termo e o filtro devem continuar na busca.
8. Limpe o campo: deve voltar às sugestões. Também é possível tocar numa sugestão para pesquisar.
9. Para recuperação, desligue a internet, faça outra busca e aguarde a mensagem. Reative a conexão e use Tentar novamente.
10. Saia da conta no Perfil e entre novamente; a busca anterior não deve ser reaproveitada nessa nova sessão.

A08 altera somente JavaScript: não é necessário gerar outro APK por causa desta etapa. [Guia Android/EAS](ANDROID-EAS.md).

## Mensagem para continuar

    Fiz o commit A08 e o push.
    Busca no Android: [funcionou / erro exato]
    Filtros e Carregar mais: [resultado]
    Abrir e voltar dos resultados: [resultado]
    Continue somente a A09 e pare antes do próximo commit.

Referência do contrato pesquisado: [Search for Item — Spotify](https://developer.spotify.com/documentation/web-api/reference/search).
