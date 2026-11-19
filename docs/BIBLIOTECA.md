# Biblioteca integrada — A15

Atualização G07: artistas acompanhados localmente aparecem em Tudo e Artistas. Ver [ARTISTAS-ACOMPANHADOS.md](ARTISTAS-ACOMPANHADOS.md).

Atualização G06: a seção de playlists da conta Spotify já possui consulta e paginação. Ver [BIBLIOTECA-SPOTIFY.md](BIBLIOTECA-SPOTIFY.md). Os registros históricos abaixo descrevem as etapas anteriores.

Atualização G02: a Biblioteca também apresenta playlists locais, o botão Criar playlist e cards que abrem os [detalhes por ID](DETALHES-PLAYLIST-LOCAL.md). Consulte [PLAYLISTS-LOCAIS.md](PLAYLISTS-LOCAIS.md) para o contrato atual; os detalhes abaixo registram a entrega original A15.

A Biblioteca autenticada usa os dados locais da conta. Os exemplos da P1 ficam em DemoLibraryScreen, acessível apenas pela demonstração explícita.

## Funcionalidades

- Atalhos Músicas curtidas e Buscas recentes com os contadores existentes.
- Itens combinados: músicas curtidas e termos de buscas confirmadas.
- Filtros Tudo, Músicas e Buscas, sem categorias fictícias.
- Ordem Recentes pela data de curtida ou pesquisa; Título por ordem alfabética em português.
- Grade ou lista; visualização e ordenação persistem separadamente por conta.
- Tocar numa música abre a faixa correta usando os metadados salvos. Tocar numa busca abre Buscar com filtro Tudo, registra seu uso e não duplica o histórico.
- Avatar da sessão, busca e retorno das telas de curtidas e histórico.
- Estados de carregamento, vazio e falha. Um erro não substitui a biblioteca por exemplos nem apaga dados existentes.

Não há player fictício nem botão Criar sem ação na Biblioteca autenticada. As playlists locais serão implementadas por Guilherme em G01/G02; artistas acompanhados, em G07.

## Contrato para a continuidade

src/services/library.mjs contém listLibraryItems(data, { filter, sort }) e saveLibraryPreference(localData, preference, value). O seletor é puro, não modifica o registro e retorna itens com key, type, title, subtitle, image e updatedAt. Músicas carregam track; buscas carregam term. Os filtros existentes são all, tracks e searches.

A chave da música usa seu ID Spotify; a da busca usa o termo normalizado. Ordenação recente usa updatedAt decrescente; empates têm desempate estável. A preferência padrão vem de data.preferences.librarySort.

As mudanças de libraryView (grid/list) e librarySort (recent/title) passam por localData.update(current => ...). Somente uma gravação confirmada altera os controles. Durante a gravação, os controles de preferências ficam indisponíveis; falhas preservam a última versão e o aviso global oferece nova leitura.

O schema versão 1 já prevê playlists e followedArtists. G01/G02 devem usar esses campos e acrescentar filtro e navegação somente quando as respectivas telas existirem. Não gravar novamente um objeto vazio ou uma cópia antiga do estado: isso poderia perder curtidas, buscas e preferências. O [guia de armazenamento](ARMAZENAMENTO-LOCAL.md) explica o repositório e seus limites.

## Validação automatizada

- npm run test:library: 16 testes de seleção, filtros, acentos, desempate, imutabilidade, preferências, reabertura, concorrência, falhas e contas distintas.
- Suíte completa: 260 testes unitários aprovados.
- Lint e bundles Android/Hermes e web aprovados.
- 39 cenários de navegador com Spotify simulado aprovados (19 da Biblioteca e 20 de regressão do histórico), sem exceções JavaScript.

Os testes de navegador usam Spotify simulado e não comprovam a execução nativa no Android. Ferramentas, capturas e bundles temporários ficam em dist-check/a15, ignorada pelo Git.

## Conferência no Android — somente no final do projeto

Por escolha da Ana, não gerar outro APK nem solicitar testes no aparelho durante A15 ou a continuidade habitual. Após concluir o projeto inteiro, gerar o APK independente com o perfil preview e seguir o [guia de instalação](INSTALAR-NO-CELULAR.md).

1. Entrar com Spotify, confirmar duas buscas e curtir duas músicas distintas.
2. Abrir Biblioteca; conferir atalhos e filtros Tudo, Músicas e Buscas.
3. Alternar Recentes/Título e Grade/Lista. Abrir uma música e voltar.
4. Tocar numa busca salva; conferir o termo e os resultados corretos.
5. Descurtir uma faixa em Curtidas e conferir sua remoção da Biblioteca.
6. Fechar e reabrir o aplicativo; conferir itens e preferências.
7. Com sessão válida e dados carregados, desligar a internet e conferir a biblioteca local. Capas externas podem não carregar.
8. Conferir uma segunda conta autorizada e voltar à primeira: os dados devem permanecer separados.

A15 reutiliza a Biblioteca existente: continuam 11 telas principais. O mínimo de 12 e a meta de 17 dependem das telas previstas para Guilherme.

## Passagem para a dupla

Depois de revisar, fazer o commit A15 e o push, enviar [ROTEIRO-DUPLA.md](ROTEIRO-DUPLA.md) ao Guilherme. Ele deve implementar uma etapa por vez e fazer seus próprios commits G01–G15. Não iniciar G01 junto com o commit A15.
