# Continuação da P2 — Guilherme

Este roteiro foi atualizado com a implementação da A15. Usar depois que a Ana fizer o commit e o push dessa etapa. São 15 novos commits de cada integrante, na mesma branch main, com autoria própria. O escopo e as mensagens de G01–G15 estão no [roteiro principal](P2-ROTEIRO.md).

**Decisão da Ana: gerar e testar o APK somente quando o projeto completo estiver pronto.** Durante G01–G14, validar com testes e bundles, sem exigir instalações a cada commit. O login no Android já foi confirmado anteriormente; os recursos novos e a persistência nativa ainda precisam da validação final.

## Estado após G12

G11 commitada (33177c8). G12 implementada e validada e aguarda commit: fila compartilhada da origem, mini-player sincronizado, seleção direta e anterior/próxima com limites. O estado representa seleção e a reprodução continua no Spotify. 382 testes unitários, lint sem avisos e bundles Android/web aprovados; 21 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 17 telas principais. Ver [guia de mini-player e fila](MINI-PLAYER-FILA.md). Depois do commit, continuar somente G13: recuperação de falhas e uso offline. APK e teste físico apenas ao concluir o projeto completo.

## Histórico após G11

G10 commitada (cc7a0f5). G11 implementada e validada e aguarda commit: player da faixa correta, abertura no Spotify e ações locais, sem letra ou progresso fictícios no modo autenticado. 370 testes unitários, lint e bundles Android/web aprovados; onze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 17 telas principais. Ver [guia do player](PLAYER-SPOTIFY.md). Depois do commit G11, continuar somente G12: estado compartilhado da seleção, mini-player e fila, sem indicar áudio tocando. APK e teste físico apenas no final do projeto completo.

## Histórico após G10

G09 commitada (e0f1c16). G10 implementada e validada e aguarda commit. 362 testes unitários, lint e bundles Android/web aprovados; doze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. São 17 telas principais; G11 será o player com faixa real e abertura no Spotify. As etapas de fila e revisão também permanecem pendentes. APK somente ao final.

## Histórico após G09

G08 commitada (8bb9764). G09 implementada e validada e aguarda commit. 354 testes unitários, lint e bundles Android/web aprovados; onze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. São 16 telas principais; G10 será configurações e preferências persistentes. APK somente ao final.

## Histórico após G08

G07 commitada (21c40bb). G08 implementada e validada e aguarda commit. 346 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais; G09 será edição do apelido local persistente. APK somente ao final.

## Histórico após G07

G06 commitada (cb5656c). G07 implementada e validada e aguarda commit. 338 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais; G08 será o perfil real da conta. APK somente ao final.

## Histórico após G06

G05 commitada (e8af19f). G06 implementada e validada e aguarda commit. 330 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais; G07 será artistas acompanhados localmente. APK somente ao final.

## Histórico após G05

G04 commitada (e76ac47). G05 implementada e validada e aguarda commit. 322 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais. G06 será a listagem de playlists Spotify da conta na Biblioteca. APK apenas ao concluir o projeto completo.

## Histórico após G04

G03 commitada (a113bf6). G04 implementada e validada e aguarda commit. 314 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. São 15 telas principais. G05 é a próxima etapa, ainda não iniciada. APK somente ao final.

## Histórico após G03

G02 commitada (7a8fa74). G03 implementada e validada e aguarda commit. 306 testes unitários, lint e bundles Android/web aprovados; sete cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. A inclusão pela interface já funciona; G04 é a próxima etapa. APK somente ao final.

## Continuidade iniciada

A15 foi conferida no Git (32125e6). Ana solicitou executar também a parte planejada para a dupla neste atendimento. G01 foi commitada (8d69537). G02 está implementada e validada e aguarda commit: 298 testes unitários, lint, bundles Android/web e 39 cenários de navegador simulados aprovados. A inclusão de músicas continua em G03, ainda não iniciada. O status dos testes e commits está no roteiro principal. Os identificadores G mantêm a sequência de funcionalidades; a autoria efetiva deve permanecer verdadeira e o balanceamento deve ser conferido antes da entrega.

## Preparar a continuidade

1. Aguardar a Ana concluir e enviar A15.
2. Na mesma branch main, conferir git status. Se houver alterações locais próprias, preservá-las antes de atualizar.
3. Com a árvore limpa, executar git pull --ff-only.
4. Conferir git log -5 --oneline e ler README.md, P2-ROTEIRO.md e SPOTIFY-SETUP.md.
5. Verificar a identidade local com git config user.name e git config user.email. Usar o próprio nome e um email vinculado à própria conta GitHub. Não usar o autor da Ana.
6. Executar npm ci para instalar o lockfile entregue.
7. Criar o próprio .env a partir do exemplo. Usar o Client ID combinado e ter a própria conta Spotify autorizada pelo dono do app.
8. Executar npm run lint, npm run test:library e os testes das áreas alteradas. Conferir o contrato abaixo. Não gerar APK nessa preparação; a instalação e o teste físico ficam para o encerramento do projeto.
9. Iniciar G01 e executar somente uma etapa por vez.

Se git pull --ff-only falhar, verificar a divergência e pedir ajuda com a saída do comando. Não usar reset --hard nem forçar push para resolver.

## Código entregue pela Ana

- Expo Router com Tabs, Stack e rotas dinâmicas; 11 telas principais navegáveis. Callback e rota inexistente não contam. A meta final é 17 telas.
- OAuth PKCE, restauração e renovação de sessão no Android com SecureStore; não incluir Client Secret ou tokens manuais.
- Cliente HTTP com timeout, renovação limitada, erros legíveis e paginação do catálogo.
- Home, busca, álbuns, faixas e artistas conectados à API.
- AsyncStorage por conta, schema versão 1, validação, fila de gravações e aviso de falha recuperável.
- Curtidas sincronizadas e /liked; histórico de até 20 termos e /recent-searches.
- Biblioteca com dados reais salvos, filtros, ordem e grade/lista persistentes.
- Demonstração da P1 separada das telas autenticadas refatoradas.

Ainda faltam CRUD de playlists locais, playlists Spotify completas e sua listagem, artistas acompanhados locais, perfil real, edição local, configurações e fluxo de faixa/mini-player/fila. O aplicativo ainda não reproduz áudio. G11 permite abrir a faixa no Spotify; reprodução integral dentro do clone exige escopo adicional e não é prometida.

O perfil e partes das telas de playlist/player ainda preservam a P1. Não reutilizar contagens, letras ou progresso fictícios como se fossem dados da API. O projeto ainda não cumpre integralmente a P2.

## Arquivos e contratos a reutilizar

| Área | Entrada existente |
| --- | --- |
| Conta e catálogo | src/contexts/SessionContext.js: session, api e catalog; serviços e modelos em src/services. |
| Dados locais | src/contexts/LocalDataContext.js: useLocalData() retorna localData e state. |
| Atualização segura | localData.update(current => novoRegistro); callback síncrono recebe a versão atual na fila. Não substituir por estado antigo. |
| Schema e limites | src/storage/localDataSchema.mjs; manter versão 1 se usar os campos já previstos. |
| Biblioteca | src/screens/LibraryScreen.js e src/services/library.mjs; dados atuais: track/search/local-playlist; local-playlist já possui destino para os detalhes desde G02. |
| Curtidas e recentes | hooks useLikedTracks/useRecentSearches e serviços likedTracks.mjs/recentSearches.mjs. |
| Seleção de entidade | search.rememberEntity(item) conserva os metadados para abrir detalhes. |
| Rotas | app/_layout.js e app/(tabs)/_layout.js; componentes de tela ficam em src/screens. |
| Android independente | eas.json, perfil preview; instalação somente ao final. |

Registro local por usuário:

    {
      likedTracks: [{ track, savedAt }],
      recentSearches: [{ term, searchedAt }],
      playlists: [{ id, name, createdAt, updatedAt, tracks: [track] }],
      followedArtists: [{ artist, savedAt }],
      preferences: { displayName: null, libraryView: 'grid', librarySort: 'recent' }
    }

O envelope com version e accountId é responsabilidade do repositório. IDs de playlists locais são próprios; não usá-los nas rotas de playlists Spotify. O schema valida até 50 playlists, 300 faixas por playlist, nome de até 80 caracteres e ID de até 100. Usar modelos normalizados de faixas, sem tokens ou páginas da API.

G01 criou a tela /local-playlist/new e o acesso funcional pela Biblioteca, com validação e gravação pelo repositório existente. O filtro Playlists e os resumos locais já estão conectados; consultar [PLAYLISTS-LOCAIS.md](PLAYLISTS-LOCAIS.md). G02 implementou /local-playlist/[id] e conectou os cards aos detalhes; consultar [DETALHES-PLAYLIST-LOCAL.md](DETALHES-PLAYLIST-LOCAL.md). Ampliar os filtros e listLibraryItems conforme as rotas ficarem prontas. Não introduzir links para telas inexistentes. G07 poderá acrescentar artistas acompanhados do mesmo modo.

A15 preserva preferences.displayName ao salvar as preferências da Biblioteca; G09 deve conectar o apelido local às telas desejadas, sem alterar o nome da conta Spotify. As preferências libraryView/librarySort já funcionam e não devem ser reimplementadas em outro armazenamento.

## Situação dos testes na passagem

A15 tem 260 testes unitários aprovados, lint e bundles Android/web aprovados. Também foram aprovados 39 cenários de navegador com Spotify simulado (19 da Biblioteca e 20 de regressão do histórico), sem exceções JavaScript. As simulações não substituem o teste Android com a conta real. Os scripts unitários ficam em tests e package.json; artefatos de navegador em dist-check são temporários, ignorados pelo Git e podem não existir no clone do Guilherme.

Leia [BIBLIOTECA.md](BIBLIOTECA.md), [ARMAZENAMENTO-LOCAL.md](ARMAZENAMENTO-LOCAL.md), [SPOTIFY-CATALOGO.md](SPOTIFY-CATALOGO.md), [MUSICAS-CURTIDAS.md](MUSICAS-CURTIDAS.md) e [BUSCAS-RECENTES.md](BUSCAS-RECENTES.md) conforme a área alterada.

## Sequência de entregas

| Ordem | Etapa | Resultado para verificar |
| --- | --- | --- |
| 1 | G01 | Criar playlists locais e encontrá-las após reinício. |
| 2 | G02 | Abrir a playlist local correta por ID. |
| 3 | G03 | Adicionar faixas reais sem duplicar. |
| 4 | G04 | Editar nome, remover faixas e excluir playlists. |
| 5 | G05 | Abrir detalhes e faixas de playlist Spotify permitida. |
| 6 | G06 | Consultar e paginar playlists da conta na biblioteca. |
| 7 | G07 | Acompanhar artistas localmente e encontrá-los na biblioteca. |
| 8 | G08 | Exibir perfil real, incluindo ausência de foto ou nome. |
| 9 | G09 | Alterar apelido local e confirmar persistência. |
| 10 | G10 | Usar configurações, preferências e logout. |
| 11 | G11 | Exibir faixa real no player e abrir a faixa no Spotify. |
| 12 | G12 | Manter faixa selecionada e fila coerentes no mini-player. |
| 13 | G13 | Recuperar de falhas e acessar dados locais sem rede. |
| 14 | G14 | Revisar StyleSheet, Flexbox e usabilidade no Android. |
| 15 | G15 | Concluir checklist, documentação final e roteiro do vídeo. |

## Mensagem pronta para o chat

    Vou continuar a P2 depois da Ana.
    Leia README.md, docs/P2-ROTEIRO.md, docs/SPOTIFY-SETUP.md e docs/ROTEIRO-DUPLA.md.
    Confira o Git e as funcionalidades já implementadas.
    Implemente somente G01, seguindo o contrato de dados existente.
    Não gerar APK nem pedir teste no celular até o projeto inteiro estar pronto.
    Valide com testes e bundles, informe os arquivos alterados e a mensagem exata do commit.
    Pare e aguarde eu fazer o commit e push antes de continuar.

Depois do primeiro commit:

    Fiz o commit G01 e o push. Continue somente G02.
    Implemente, valide e pare antes do próximo commit.

Repetir com o próximo identificador, consultando o escopo no roteiro principal.

## Ao terminar cada etapa

Revisar git diff, validar o critério com testes apropriados e conferir git status. A conferência física no Android será feita na validação final. Adicionar explicitamente os arquivos daquela etapa. Usar a mensagem da tabela principal, ajustando-a se o conteúdo mudou, e fazer git push origin main.

Não adicionar .env, tokens, node_modules ou arquivos temporários. Não registrar todos os 15 commits antes de implementar as respectivas funcionalidades.

## Encerramento em G15

1. Concluir as funcionalidades e corrigir falhas encontradas nos testes automatizados.
2. Conferir as 17 telas previstas e a autoria dos 15 commits novos de cada integrante, preservando o histórico da P1.
3. Gerar um único APK independente atualizado, com perfil preview, conforme [INSTALAR-NO-CELULAR.md](INSTALAR-NO-CELULAR.md). Um APK antigo não recebe os recursos novos pelo Metro.
4. Executar no Android os fluxos finais, incluindo login, favoritos/recentes, playlists, preferências, reinício e uso local sem rede. Registrar o que foi realmente conferido e corrigir falhas antes de marcar o checklist.
5. Gravar o vídeo de até cinco minutos, publicar um link acessível e preparar os links para a entrega individual no AVA.

## Vídeo de até cinco minutos

Proposta para ajustar quando o aplicativo estiver pronto:

- 0:00–0:30: identificar projeto e integrantes; mostrar login.
- 0:30–1:30: Home, busca real, álbum e artista.
- 1:30–2:15: curtir faixa, recentes e reiniciar o app para mostrar persistência.
- 2:15–3:20: criar playlist local, adicionar faixa, editar e abrir playlist Spotify.
- 3:20–4:15: player com abertura no Spotify, perfil, edição e configurações.
- 4:15–4:50: recuperação sem rede e visão do histórico de commits.

O vídeo deve demonstrar as funcionalidades reais. Conferir se o link abre para o avaliador. Cada integrante entrega individualmente os links indicados na imagem do trabalho.
