# Roteiro da P2 — Spotify Expo

## Acordo de trabalho

Planejamento iniciado em 17/11/2026 após leitura do README, código e imagem dos requisitos.

- Ana Carolina: 15 novos commits, A01 a A15.
- Guilherme: 15 novos commits, G01 a G15, depois das etapas da Ana.
- Histórico inicial: 29 commits (14 da Ana e 15 do Guilherme), incluindo um merge.
- Previsão final: 59 commits (29 da Ana e 30 do Guilherme). Mesmo desconsiderando o merge, supera o mínimo de 40.
- Branch atual: main. A mesma branch pode ser utilizada, trabalhando em sequência.
- A cada etapa: implementar somente seu escopo, verificar, entregar mensagem e comandos de commit e parar até a confirmação.
- Os integrantes fazem seus próprios commits e pushes, com suas identidades Git. Não reescrever o histórico da P1.
- Os títulos abaixo são propostas; se o escopo mudar, atualizar a mensagem para refletir a alteração real.
- Não criar commits vazios nem dividir uma alteração apenas para aumentar a contagem.

A primeira entrega é o planejamento solicitado. A01 não implementa funcionalidades no aplicativo. As demais etapas só serão consideradas concluídas depois da implementação e verificação.

## Diagnóstico da P1

O projeto possui 9 telas: Login, Home, Busca, Biblioteca, Playlist, Álbum, Artista, Player e Perfil.

A P1 foi auditada com Expo 57.0.24, React 19.2.3 e React Native 0.86.3. Na A02, o Expo foi alinhado em 57.0.33, mantendo o SDK 57. Os componentes já utilizam StyleSheet e Flexbox, mas existem estilos inline e botões demonstrativos.

Na P1, a entrada era App.js, com React Navigation em src/navigation/AppNavigation.js. A02 substituiu essa estrutura por Expo Router em app/. O catálogo está em src/data/media.js, com IDs fictícios e imagens remotas. Busca, curtidas e player são demonstrações sem persistência ou autenticação real.

Não foram disponibilizados slides de aula neste atendimento; o anexo recebido é a imagem com os requisitos. AsyncStorage será usado conforme solicitado, e o material da disciplina poderá orientar ajustes quando estiver disponível.

## Arquitetura prevista

- app/: arquivos de rotas do Expo Router, layouts de Stack e Tabs e callback OAuth.
- src/screens/: interfaces refatoradas da P1 e novas telas.
- src/components/: componentes compartilhados com StyleSheet.
- src/services/: autenticação e chamadas da Spotify Web API.
- src/storage/: leitura, validação e gravação dos dados locais.
- src/contexts/ e src/hooks/: sessão, biblioteca e faixa selecionada.
- src/theme/: identidade visual, espaçamentos e estilos reutilizáveis.

Na migração, configurar main como expo-router/entry no package.json, adicionar o plugin adequado e substituir App.js e o navegador antigo pela entrada app/_layout.js. Fazer a troca junto das rotas e chamadas de navegação, mantendo o aplicativo executável. Instalar dependências com npx expo install para respeitar a versão do SDK. Referência: [instalação do Expo Router](https://docs.expo.dev/router/installation/).

## Telas previstas

As 9 telas da P1 já possuem rotas na A02; as demais continuam como metas. Os grupos entre parênteses organizam as abas sem compor o endereço público.

| Nº | Tela | Arquivo de rota previsto | Entrada navegável |
| --- | --- | --- | --- |
| 1 | Login | app/login.js | Abertura sem sessão |
| 2 | Início | app/(tabs)/home.js | Aba Início |
| 3 | Buscar | app/(tabs)/search.js | Aba Buscar |
| 4 | Biblioteca | app/(tabs)/library.js | Aba Biblioteca |
| 5 | Álbum | app/album/[id].js | Resultado ou card de álbum |
| 6 | Artista | app/artist/[id].js | Resultado ou nome do artista |
| 7 | Playlist Spotify | app/playlist/[id].js | Playlist remota na biblioteca ou busca disponível |
| 8 | Player / faixa selecionada | app/player.js | Toque em faixa ou mini-player |
| 9 | Perfil | app/profile/index.js | Avatar |
| 10 | Músicas curtidas | app/liked.js | Biblioteca |
| 11 | Buscas recentes | app/recent-searches.js | Busca |
| 12 | Criar playlist local | app/local-playlist/new.js | Botão Criar na biblioteca |
| 13 | Playlist local | app/local-playlist/[id]/index.js | Biblioteca |
| 14 | Editar playlist local | app/local-playlist/[id]/edit.js | Ação Editar da playlist |
| 15 | Adicionar faixa a playlist | app/add-to-playlist.js | Ação de uma faixa |
| 16 | Editar perfil local | app/profile/edit.js | Perfil |
| 17 | Configurações | app/settings.js | Perfil |

Callback e página de rota inexistente serão utilitários e não entram na contagem. Vários IDs de álbum representam uma única tela. Cada tela deve permitir completar uma ação e voltar sem quebrar a navegação.

## Etapas da Ana — 15 commits

Status: A01 commitada; A02 implementada e validada por bundles Android/web, compatibilidade Expo e 9 cenários no navegador. Aguardando teste físico no Android e commit da Ana. A03–A15 pendentes.

| Etapa | Mensagem de commit | Entrega e critério de aceite |
| --- | --- | --- |
| A01 | docs: planeja etapas da P2 e configuracao do Spotify | Roteiro dos dois integrantes, guia de credenciais e verificação final; README aponta para a P2 e descreve o estado real. |
| A02 | feat: migra navegacao da P1 para Expo Router | Entrada, Stack, Tabs e rotas dinâmicas das 9 telas; remover navegador antigo e entrada App.js em conflito; navegar e voltar em todos os fluxos. |
| A03 | chore: configura ambiente Spotify e desenvolvimento Android | Exemplo de variáveis, proteção do arquivo local no Git, scheme e configuração do development build; mensagem legível quando faltar configuração. |
| A04 | feat: implementa login Spotify com PKCE | Login real, callback e troca de código; remover entradas falsas Google/Apple; tratar cancelamento, recusa e retorno inválido. |
| A05 | feat: restaura sessao e renova tokens do Spotify | Tokens em SecureStore no Android, restauração, refresh único concorrente e logout; reabrir app sem repetir login válido e não entrar em ciclo após falha. |
| A06 | feat: centraliza requisicoes e erros da API Spotify | Cliente HTTP com timeout, autenticação, renovação limitada e erros 401/403/404/429; interface sai do carregamento e oferece recuperação. |
| A07 | feat: adiciona servicos de catalogo Spotify | Consultas de artistas, álbuns, faixas e playlists com adaptação de campos opcionais e paginação; IDs reais e compatibilidade com o acesso da conta. |
| A08 | feat: substitui busca local por pesquisa Spotify | Pesquisa dinâmica com atraso entre digitações, filtros, paginação e descarte de respostas antigas; resultados abrem a entidade correta. |
| A09 | feat: carrega inicio com catalogo real do Spotify | Seções vindas da API e atalhos navegáveis; remover cards de catálogo fictício da Home; tratar lista vazia e falha. |
| A10 | feat: carrega albuns e faixas por rota dinamica | Detalhes e faixas do ID solicitado, paginação e link de artista; testar dois álbuns diferentes e um ID inválido. |
| A11 | feat: carrega artistas e discografia da API | Dados reais e álbuns do artista; não inventar ouvintes mensais ou depender de top-tracks removido; testar artistas distintos. |
| A12 | feat: cria persistencia local com AsyncStorage | Repositório com versão de dados, hidratação, validação e gravações em ordem; isolar por conta e preservar dados existentes diante de erro de leitura. |
| A13 | feat: persiste curtidas e adiciona tela de favoritas | Curtir e descurtir em telas conectadas; tela Curtidas, sem duplicatas e com estado vazio; conferir depois de fechar e abrir. |
| A14 | feat: salva historico e adiciona buscas recentes | Termos recentes sem duplicatas, limite, remoção e nova busca por toque; persistência após reinício. |
| A15 | feat: integra biblioteca com favoritos e historico | Biblioteca com atalhos reais, filtros e ordenação dos dados disponíveis; remover itens fictícios dessa tela e preparar entrada das playlists locais. |

A API real e a persistência devem estar utilizáveis ao fim de A15, com 11 telas principais. As playlists e telas adicionais continuam nas etapas do Guilherme.

## Etapas do Guilherme — 15 commits

Executar depois de A15. O [roteiro da dupla](ROTEIRO-DUPLA.md) contém as instruções para retomar no chat.

| Etapa | Mensagem de commit | Entrega e critério de aceite |
| --- | --- | --- |
| G01 | feat: cria playlists locais pela biblioteca | Tela Criar, nome validado, ID único e persistência; criar duas playlists e reabrir o app. |
| G02 | feat: exibe detalhes de playlists locais | Rota dinâmica local com capa, nome, quantidade e estado vazio; abrir playlists diferentes. |
| G03 | feat: adiciona musicas as playlists locais | Tela de escolha e ações nas faixas reais; incluir faixa e evitar duplicatas. |
| G04 | feat: permite editar e excluir playlists locais | Tela Editar, renomear, remover faixas e excluir playlist com confirmação; conferir persistência. |
| G05 | feat: exibe playlists Spotify e suas faixas reais | Refatorar tela remota, usar endpoint de itens compatível e paginação; validar com playlist acessível pela conta e explicar acesso negado. |
| G06 | feat: lista playlists Spotify na biblioteca | Consultar playlists do usuário e distinguir visualmente as remotas das locais; carregar próxima página e abrir detalhes. |
| G07 | feat: salva artistas acompanhados na biblioteca local | Seguir e deixar de seguir localmente, persistir e filtrar artistas na biblioteca; informar que a ação é local. |
| G08 | feat: substitui perfil demonstrativo por dados da conta | Perfil de /me e playlists disponíveis; tratar foto e nome ausentes e retirar contagens inventadas. |
| G09 | feat: adiciona edicao de perfil local persistente | Tela Editar perfil e apelido local refletido no app; deixar claro que não modifica a conta Spotify. |
| G10 | feat: adiciona configuracoes e preferencias persistentes | Tela de preferências, acesso a logout e limpeza seletiva de dados com confirmação; validar após reinício. |
| G11 | feat: conecta player a faixa real e abertura no Spotify | Metadados da faixa selecionada e ação funcional de abrir o Spotify; retirar letra e progresso fictícios. Reprodução integral interna fica fora do escopo base. |
| G12 | feat: sincroniza mini-player e fila de faixas | Mesmo estado de faixa selecionada nas telas e mini-player, fila de seleção e navegação anterior/próxima; não simular áudio que não está tocando. |
| G13 | fix: melhora recuperacao de falhas e uso offline | Dados locais continuam acessíveis sem rede; tratar sessão expirada, permissões, cota, lista vazia e repetição manual da consulta. |
| G14 | style: padroniza telas com StyleSheet e Flexbox | Revisar as 17 telas, eliminar estilos estáticos inline, ajustar teclado, áreas seguras, texto longo, alvos de toque e rótulos acessíveis no Android. |
| G15 | docs: registra validacao da P2 e roteiro do video | Executar checklist, registrar resultados reais, atualizar README para o estado final e preparar vídeo de até 5 minutos; corrigir falhas antes da entrega. |

## Decisões para manter o aplicativo funcional

1. Usar OAuth Authorization Code com PKCE. Nunca incluir Client Secret no bundle.
2. A Ana confirmou Spotify Premium e teste principal no Android. Preparar development build para OAuth; Expo Go pode servir antes dessa integração.
3. Armazenar preferências, curtidas, histórico e playlists locais em AsyncStorage. Separar dados por usuário. Guardar tokens no SecureStore no Android.
4. Substituir mocks gradualmente; ao final, nenhum catálogo fictício deve alimentar as telas de produção.
5. Tratar ausência de internet e credenciais com ações claras. Não trocar silenciosamente API com erro por dados fictícios.
6. Distinguir playlists locais e Spotify. CRUD local não modifica a conta Spotify.
7. O player base mostra uma faixa real e permite abri-la no Spotify. Reprodução integral dentro do app exige integração adicional e não será prometida pela simples Web API.
8. Verificar a disponibilidade efetiva de endpoints com a conta antes de fechar cada integração. Orientações práticas: [configuração Spotify](SPOTIFY-SETUP.md).

## Checklist de aceite da P2

- [ ] Todas as telas e componentes usam StyleSheet e Flexbox, mantendo a identidade Spotify.
- [x] app/ é a origem das rotas, com Tabs, Stack e IDs dinâmicos.
- [x] package.json usa expo-router/entry e não há entrada antiga concorrente.
- [ ] Login real no Android e cancelamento tratados.
- [ ] Sessão restaurada; renovação e logout funcionam sem loop.
- [ ] Artistas, álbuns, faixas, playlists e busca vêm da Spotify Web API.
- [ ] IDs distintos apresentam os dados correspondentes.
- [ ] Falhas de rede, autorização e limites encerram o carregamento.
- [ ] Favoritas, recentes, playlists e preferências persistem após reinício.
- [ ] Dados de usuários diferentes não se misturam.
- [ ] Pelo menos 12 telas distintas possuem entradas navegáveis; meta: 17.
- [ ] Código de produção não depende de src/data/media.js.
- [ ] Validar dependências com Expo e compilar os bundles; registrar comandos e resultados reais.
- [ ] Percorrer manualmente os fluxos no Android, incluindo voltar e teclado.
- [ ] 15 novos commits de cada integrante, com mensagens correspondentes às entregas.
- [ ] Nenhum segredo, token ou arquivo .env pessoal foi enviado ao GitHub.
- [ ] Vídeo de no máximo 5 minutos, com link acessível.
- [ ] Cada integrante envia individualmente o link do GitHub e do vídeo conforme orientação da disciplina.

## Protocolo para continuar

Após cada etapa, revisar git diff e executar a verificação indicada. Fazer o commit e push na própria conta. Em seguida enviar:

> Fiz o commit A01 e o push. Continue somente a etapa A02 do docs/P2-ROTEIRO.md. Implemente, valide e pare antes do próximo commit.

Trocar os identificadores a cada etapa. Se aparecer uma falha, enviar a mensagem completa sem tokens nem segredos. O próximo trabalho deve começar pela inspeção do status e do histórico para respeitar o que já foi commitado.
