# Spotify Mock - React Native + Expo

## Evolução para a P2

A P2 está em desenvolvimento gradual, com 30 novos commits planejados: 15 de Ana Carolina e 15 de Guilherme. O aplicativo já usa Expo Router, login Spotify e sessão segura. A08 conectou a busca; A09 conectou a Home; A10 conectou os álbuns e suas faixas; A11 conectou artistas e discografia; A12 adicionou a base de armazenamento local; A13 conectou curtidas persistentes; A14 adicionou histórico e tela de buscas recentes; A15 integra a Biblioteca com esses dados e preferências persistentes. A G01 adicionou criação e listagem de playlists locais; a G02 conecta seus detalhes por ID. As demais etapas permanecem no roteiro.

- [Roteiro completo, divisão dos commits e checklist da P2](docs/P2-ROTEIRO.md)
- [Configuração da Spotify Web API](docs/SPOTIFY-SETUP.md)
- [Cliente HTTP e tratamento de erros — A06](docs/SPOTIFY-API.md)
- [Serviços e modelos do catálogo — A07](docs/SPOTIFY-CATALOGO.md)
- [Busca real e teste no Android — A08](docs/SPOTIFY-BUSCA.md)
- [Home real e teste no Android — A09](docs/SPOTIFY-INICIO.md)
- [Álbuns e faixas reais — A10](docs/SPOTIFY-ALBUNS.md)
- [Artistas e discografia real — A11](docs/SPOTIFY-ARTISTAS.md)
- [Armazenamento local e atualização do APK — A12](docs/ARMAZENAMENTO-LOCAL.md)
- [Curtidas persistentes e teste no Android — A13](docs/MUSICAS-CURTIDAS.md)
- [Histórico persistente e buscas recentes — A14](docs/BUSCAS-RECENTES.md)
- [Biblioteca integrada e passagem para a dupla — A15](docs/BIBLIOTECA.md)
- [Criação de playlists locais — G01](docs/PLAYLISTS-LOCAIS.md)
- [Detalhes de playlists locais por ID — G02](docs/DETALHES-PLAYLIST-LOCAL.md)
- [Geração e instalação do APK Android pelo EAS](docs/ANDROID-EAS.md)
- [Roteiro de continuidade para Guilherme](docs/ROTEIRO-DUPLA.md)

A04 implementou o login Spotify com PKCE; A05 adiciona persistência segura no Android, restauração e renovação. A integração prevista usa OAuth com PKCE, AsyncStorage para dados locais e pelo menos 12 telas, com meta de 17. O status de cada requisito deve ser conferido no roteiro.

**APK somente ao final do projeto completo**, conforme decisão da Ana. Durante os commits, usar validações automatizadas e bundles; os guias de instalação ficam como referência para a etapa final.

## Estado atual — P2 em desenvolvimento

Aplicativo mobile que reproduz visualmente partes da interface do Spotify utilizando React Native e Expo. O aplicativo foi desenvolvido para a disciplina de Aplicativos Híbridos.

O projeto está evoluindo da interface da P1 para a P2. A conta usa OAuth com PKCE e sessão segura no Android. Home e busca consultam o Spotify. A rota de álbum carrega os detalhes e as faixas do ID solicitado, com paginação e acesso ao artista. A rota de artista carrega nome, imagem disponível e discografia com álbuns e singles. A base local por conta já salva curtidas na busca, no álbum e nos detalhes da faixa, com uma tela própria de favoritas. O histórico também é salvo por conta e pode ser reutilizado ou removido na tela de buscas recentes. A Biblioteca reúne as curtidas e buscas salvas, com filtros e preferências de ordem e visualização. A G01 permite criar playlists locais e encontrá-las na Biblioteca. A G02 conecta os detalhes locais por ID; inclusão de faixas, edição, playlists remotas completas, perfil e player continuam nas próximas etapas.

Repositório: https://github.com/GuiMell0/Spotify-Expo

## Principais recursos:

- Telas navegáveis;
- Navegação por abas e pilhas com Expo Router;
- Login Spotify com PKCE, tratamento de falhas e demonstração explícita;
- Sessão Android persistente no SecureStore, renovação compartilhada e logout;
- Busca Spotify com filtros, paginação e recuperação de falhas;
- Curtidas locais persistentes, corações sincronizados e tela de músicas curtidas;
- Histórico local com até 20 termos, reutilização, remoção e limpeza confirmada;
- Biblioteca local com filtros funcionais, ordenação e grade/lista persistentes;
- Criação de playlists locais, com nomes validados, IDs próprios e resumos na Biblioteca;
- Páginas de playlist, álbum, artista e perfil;
- Mini-player demonstrativo nas telas ainda não refatoradas; integração prevista para G12;
- Detalhes de faixa real com curtida e link Spotify; player demonstrativo nas telas ainda não refatoradas;
- Layout responsivo e suporte a áreas seguras;

## Telas implementadas

| Tela | Descrição |
| --- | --- |
| Login | Entrada Spotify por PKCE, cancelamento, mensagens de erro e acesso explícito à demonstração. |
| Home | Temas Brasil, Rock e Indie com músicas, álbuns e artistas reais, cache e atualização. |
| Busca | Pesquisa Spotify com filtros, paginação e resultados reais; demonstração local separada. |
| Biblioteca | Dados locais e playlists da conta Spotify em seções identificadas, com filtros, paginação e visualização persistente. |
| Adicionar à playlist | Escolha de playlist local para uma faixa real, sem duplicatas e com confirmação de gravação. |
| Editar playlist local | Renomeação, remoção de músicas e exclusão com confirmação e persistência. |
| Playlist local | Detalhes do ID solicitado, nome, capa, quantidade e consulta às faixas salvas; estados de carregamento, vazio e falha. |
| Criar playlist local | Formulário com validação, gravação por conta e retorno à Biblioteca após confirmação. |
| Músicas curtidas | Favoritas salvas por conta neste aparelho, remoção, estado vazio e abertura dos metadados da faixa. |
| Buscas recentes | Histórico por conta, nova busca por toque, remoção individual e limpeza com confirmação. |
| Playlist | Metadados e músicas reais, paginação, tratamento de acesso negado e link Spotify; demonstração separada. |
| Álbum | Detalhes e faixas reais por ID, paginação, atualização e navegação ao artista e à faixa. |
| Artista | Dados reais por ID, discografia paginada de álbuns e singles, atualização e acesso aos álbuns. |
| Player | Metadados de faixa real, curtida local e link Spotify; player da P1 nas telas ainda não refatoradas. |
| Editar perfil local | Apelido persistente por conta, cancelamento e retorno ao nome do Spotify. |
| Perfil | Dados reais de /me, foto ou inicial, playlists da conta, atualização, link Spotify e logout. |

## Tecnologias utilizadas

- JavaScript;
- React 19;
- React Native 0.86;
- Expo SDK 57;
- Expo Router 57;
- Expo AuthSession, Expo Crypto e Expo SecureStore;
- AsyncStorage 2.2.0 para dados locais por conta;
- Expo Linear Gradient;
- Expo Status Bar;
- Expo Vector Icons;
- React Native Safe Area Context;
- React Native Screens;
- Git e GitHub.

## Pré-requisitos

Antes de executar, instale:

- [Node.js](https://nodejs.org/) em uma versão LTS;
- npm, instalado junto com o Node.js;
- [Expo Go](https://expo.dev/go) no celular;
- Git, caso o projeto seja clonado do GitHub;
- Um editor de código, como o Visual Studio Code.

Verifique o ambiente:

```bash
node --version
npm --version
git --version
```

## Instalação

Clone o repositório:

```bash
git clone https://github.com/GuiMell0/Spotify-Expo.git
```

Entre na pasta:

```bash
cd Spotify-Expo
```

Instale as dependências:

```bash
npm install
```

Para a demonstração no Expo Go:

```bash
npm run start:go
```

Para o APK de desenvolvimento instalado no Android:

```bash
npm run dev
```

A geração do APK pelo EAS está em [docs/ANDROID-EAS.md](docs/ANDROID-EAS.md).

No celular:

1. Conecte o celular e o computador à mesma rede Wi-Fi;
2. Abra o Expo Go;
3. Leia o QR Code exibido no terminal ou no navegador;
4. Aguarde o Metro Bundler finalizar a compilação.

Se a conexão pela rede local não funcionar, tente:

```bash
npm run start:go -- --tunnel
```

## Navegação implementada na A02

A entrada é expo-router/entry, com layouts em app/_layout.js e app/(tabs)/_layout.js. App.js e o navegador antigo foram removidos. Desde A04, / encaminha para o login ou para /home conforme a sessão. As rotas de conteúdo exigem login ou escolha explícita de demonstração.

- Abas: /home, /search e /library.
- Detalhes: /album/[id], /artist/[id], /playlist/[id].
- Perfil: /profile; player modal: /player.
- Links desconhecidos e IDs ausentes do catálogo exibem uma mensagem com retorno ao início.
- O botão Voltar retorna à origem; se não houver histórico, abre /home.
- As telas de detalhe ficam no Stack acima das abas. Ao voltar, a aba e seu conteúdo são preservados.

O catálogo da P1 permanece no modo de demonstração. Nessa modalidade, exemplos são /album/misadventures, /artist/pierce-the-veil, /playlist/daily e /playlist/my-heart. Na conta conectada, Home, busca, álbum e artista usam IDs reais; as rotas de álbum e artista rejeitam identificadores fictícios.

### Verificações da A02

Validação em 17/11/2026:

- Bundle Android/Hermes: npx expo export --platform android --output-dir dist-check/android --max-workers 2 — aprovado.
- Bundle web: npx expo export --platform web --output-dir dist-check/web --max-workers 2 — aprovado.
- Compatibilidade: npx expo install --check — dependências atualizadas.
- Navegador Edge em viewport móvel: 9 cenários aprovados, sem exceções JavaScript ou avisos de navegação. Incluem as 9 telas, ícones, IDs distintos, links diretos, IDs inválidos, retorno do player e preservação da pesquisa.
- Expo alinhado em 57.0.33 e Splash Screen em 57.0.11 durante a migração.
- Os artefatos e a verificação temporária ficam em dist-check/, ignorada pelo Git.
- Teste físico no Android: pendente de execução pela Ana, conforme os passos abaixo.

### Teste manual no Android

1. Reinicie o Metro após a mudança de entrada: npm run start:go -- --clear.
2. Abra no Expo Go nesta etapa e toque no login demonstrativo.
3. Visite as três abas; abra uma playlist, o álbum, o artista e o perfil.
4. Em Buscar, pesquise Misadventures e abra o resultado.
5. Abra o player de uma tela de detalhes; feche e confirme o retorno à tela de origem.
6. Confira o botão Voltar e o gesto/botão do Android sem retornar ao login depois de entrar.

O teste de OAuth passará a exigir development build nas próximas etapas. Consulte docs/SPOTIFY-SETUP.md.

## Ambiente preparado na A03

- .env.example: modelo compartilhado; .env pessoal ignorado pelo Git.
- Client ID e retornos validados por plataforma; desde A04, a tela orienta quando há configuração ou ambiente incompatível com o login.
- eas.json: perfil development com APK Android e expo-dev-client.
- Scripts: npm run dev, npm run start:go e alternativa npm run android:local.
- Schemes: spotifyexpo para navegação e spotifyexpo-login para autenticação.
- npm run test:config verifica retornos, campos incompletos e seleção de plataforma.

Para criar o app no Spotify e preencher o Client ID, siga [o passo a passo](docs/SPOTIFY-SETUP.md). Para vincular sua conta Expo e gerar o APK, siga [o guia EAS](docs/ANDROID-EAS.md). A03 configura o processo; A04 implementa o login. A Ana confirmou o APK instalado e o login real funcionando na A08; os passos permanecem disponíveis para a dupla.

### Verificações da A03

Validação em 17/11/2026:

- npm run test:config: 8 testes aprovados, incluindo campo vazio, token usado por engano como Client ID, retorno inválido e seleção de plataforma.
- npx expo install --check: dependências compatíveis.
- npx expo config --type introspect: schemes spotifyexpo, spotifyexpo-login e do launcher de desenvolvimento registrados no Android, sem gerar projeto nativo.
- Bundles Android/Hermes e web gerados com sucesso em dist-check/a03/.
- Edge em viewport móvel: 10 cenários aprovados, sem exceções JavaScript ou avisos de navegação.
- Mensagens de configuração pendente e preenchida verificadas; Client ID informado aplicado apenas ao .env local.
- Modelo .env.example compartilhável e .env pessoal ignorado pelo Git.
- Na conclusão da A03, APK e login estavam pendentes; foram confirmados pela Ana na A08.

Ao alterar o .env, encerre o Metro anterior e use npm run dev -- --clear; para a demonstração no Expo Go, npm run start:go -- --clear. Para exportar novamente após trocar variáveis, use --clear em npx expo export, evitando configuração antiga em cache.

## Login implementado na A04

O botão Entrar com Spotify usa Authorization Code com PKCE S256. A URL e o verificador são preparados antes do clique. O retorno confere state, troca o código e confirma a conta com GET /me. O aplicativo não utiliza Client Secret nem tokens copiados manualmente.

- /callback conclui ou orienta reiniciar uma tentativa expirada.
- A janela de login, a troca de código e a consulta da conta têm cancelamento e limites de espera.
- Permissão recusada, state incorreto, conta sem acesso, token inválido e rede indisponível geram mensagens legíveis.
- Os botões falsos Google e Apple foram removidos. Explorar demonstração é uma entrada separada e identificada na Home.
- As telas de conteúdo são protegidas; Sair da conta ou Sair da demonstração está no Perfil.
- A sessão fica somente em memória na A04. Reabrir/recarregar o app exige nova entrada; armazenamento seguro e renovação serão feitos na A05.
- O catálogo e o perfil de conteúdo ainda são da P1; o indicador Conta Spotify conectada confirma a autenticação.

### Verificações da A04

- npm run test:config: 8 testes aprovados.
- npm run test:auth: 14 testes aprovados.
- Compatibilidade Expo e bundles Android/Hermes e web aprovados.
- Edge com Spotify simulado: 12 cenários aprovados, sem exceções JavaScript. Cobrem PKCE S256, janela, cancelamento seguido de nova entrada, recusa, state incorreto, token inválido, 403, logout e callback sem tentativa.
- Os testes simulados não acessam a conta real. Login real no APK confirmado pela Ana na A08; os demais fluxos no aparelho seguem os guias de teste.
- Artefatos e ferramenta de navegador ficam em dist-check/a04/, ignorada pelo Git.

Para testar com a conta, siga [a configuração Spotify](docs/SPOTIFY-SETUP.md) e [o guia do APK](docs/ANDROID-EAS.md). Expo Go permite a demonstração; a entrada real no Android exige um APK próprio atualizado. O perfil preview abre sozinho e development usa Metro. A geração e a conferência física ficam para a conclusão do projeto completo.

A reprodução permanece nas etapas do Guilherme, conforme confirmado pela Ana. Até A15, o foco é conta, catálogo, busca, favoritas e histórico.

## Sessão implementada na A05

- Android: tokens, vencimento e identificação mínima da conta ficam no SecureStore, separados pelo Client ID. A tela inicial aguarda a leitura antes de liberar as rotas.
- Reabrir com token válido dispensa nova autorização. A renovação ocorre próximo ao vencimento, no vencimento ou ao voltar ao app, sem repetição automática após uma falha.
- Chamadas concorrentes compartilham a renovação. Um novo refresh token é salvo quando enviado; quando não é enviado, o anterior é preservado.
- Revogação exige novo login. Falha de rede preserva o registro e oferece Tentar restaurar sessão; a demonstração continua sendo uma escolha explícita.
- Logout remove o registro e impede respostas atrasadas de reabrir a conta. Falha de exclusão é informada com Limpar sessão novamente.
- Navegador e Expo Go usam apenas memória. Recarregar o navegador exige nova entrada; tokens não são gravados em localStorage nem AsyncStorage.
- A06 poderá usar getAccessToken do contexto para as consultas autenticadas. O catálogo da P1 permanece nesta etapa.
- Esta etapa adiciona expo-secure-store e seu plugin, que devem estar incluídos no APK final: [guia Android/EAS](docs/ANDROID-EAS.md).

### Verificações da A05

- npm run test:session: 31 testes aprovados de restauração, rotação, revogação, concorrência, cancelamento, armazenamento e timeout.
- npm run test:auth e npm run test:config: 22 testes anteriores aprovados.
- Bundles Android/Hermes e web gerados com sucesso.
- Edge com Spotify simulado: 15 cenários aprovados, incluindo expiração, renovação, recuperação manual após falha de rede e acesso revogado. Sem exceções JavaScript.
- npm run lint aprovado; configuração ESLint adicionada e pequenos problemas de importação/sintaxe da P1 corrigidos sem alterar a interface.
- npx expo install --check aprovado. Introspecção confirma o plugin e as regras Android de backup do SecureStore.
- O teste no aparelho com SecureStore e a conta Spotify real ainda depende da Ana; ver [passo a passo](docs/SPOTIFY-SETUP.md).
- Ferramentas temporárias e artefatos ficam em dist-check/a05/, ignorada pelo Git.

## Cliente da API implementado na A06

A consulta /me do login já usa o cliente centralizado. Ele obtém o token da sessão, codifica parâmetros, limita a espera, renova e repete uma vez após 401 e distingue permissões, conteúdo indisponível, limite e cota. Respostas antigas são descartadas após sair ou trocar de conta.

A tela de login reutiliza ApiFeedback para mensagens e recuperação. O catálogo e a busca nas telas continuam demonstrativos até A08–A11. O contrato para as próximas telas e os comandos de validação estão no [guia do cliente API](docs/SPOTIFY-API.md).

Validação da A06: 78 testes unitários aprovados (25 do cliente API e 53 anteriores), lint aprovado, bundles Android/Hermes e web gerados e 18 cenários Edge com Spotify simulado aprovados, sem exceções JavaScript. O teste no Android com a conta real continua pendente.

## Serviços de catálogo implementados na A07

O contexto da sessão oferece catalog para consultar artistas, discografia, álbuns, faixas, playlists e busca. Os serviços usam o cliente da A06, normalizam campos opcionais e oferecem paginação independente, sem baixar todo o catálogo automaticamente.

Os modelos preservam IDs Spotify, fornecem links e representam dados ausentes com null. Conteúdo não fornecido de uma playlist é distinguido de uma playlist vazia; respostas e cursores antigos são descartados após trocar de conta. Contrato e exemplos no [guia do catálogo](docs/SPOTIFY-CATALOGO.md).

As telas continuam demonstrativas nesta etapa. A08–A11 conectarão busca, Home, álbuns e artistas; playlists remotas ficam para G05/G06. Acesso com a conta real continua pendente.

Validação da A07: 107 testes unitários aprovados (29 novos e 78 anteriores), lint aprovado, bundles Android/Hermes e web gerados e 18 cenários Edge com Spotify simulado aprovados, sem exceções JavaScript. O acesso ao catálogo com a conta real ainda precisa ser validado ao conectar as telas.

## Busca real implementada na A08

A aba Buscar agora usa a API para a conta conectada, com filtros por tipo, debounce, paginação e descarte de respostas antigas. Resultados abrem visualizações básicas com os dados reais e link Spotify; voltar preserva a consulta. O modo de demonstração continua identificado e separado.

O APK e o login Android foram confirmados pela Ana nesta etapa. A08 não adiciona biblioteca nativa. O [guia de busca](docs/SPOTIFY-BUSCA.md) explica o que foi entregue e como testar no aparelho já instalado.

Validação da A08: 124 testes unitários (17 novos), lint e bundles Android/web aprovados; 31 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Busca no Android aguardando conferência da Ana.

## Home real implementada na A09

A Home autenticada carrega músicas, álbuns e artistas reais para os temas Brasil, Rock e Indie. Uma consulta por tema alimenta as seções e os atalhos. A saudação usa a conta conectada, e o catálogo da P1 permanece apenas no modo de demonstração.

O cache em memória é separado por tema e conta. Atualização manual, gesto de atualizar, estado vazio e recuperação de falhas estão implementados. Ver mais abre a busca com o tema e tipo corretos. O [guia da Home](docs/SPOTIFY-INICIO.md) contém os passos para o Android já instalado.

Validação da A09: 140 testes unitários (16 novos), lint e bundles Android/web aprovados; 43 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Home no Android aguardando conferência da Ana.

## Álbuns reais implementados na A10

A rota /album/[id] consulta os detalhes do álbum e aproveita a página de faixas incluída na resposta. Quando necessário, consulta o endpoint de faixas do mesmo ID. Carregar mais acumula as páginas sem repetir a mesma posição; falhas preservam a lista e permitem recuperação manual.

A tela mostra capa, artistas, data e duração conforme recebidos. Artistas e faixas abrem suas rotas; voltar mantém a lista carregada em memória. Ver no Spotify abre o álbum externamente. O [guia dos álbuns](docs/SPOTIFY-ALBUNS.md) descreve a implementação e o teste no Android.

Validação da A10: 159 testes unitários (19 novos), lint e bundles Android/web aprovados. 57 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Busca, Home e álbum no Android aguardam teste da Ana.

## Artistas e discografia real implementados na A11

A rota /artist/[id] consulta os dados do artista e sua discografia com álbuns e singles. Cada página traz até 10 lançamentos. Carregar mais preserva os itens anteriores, e abrir um álbum encaminha à tela com faixas da A10. Voltar mantém as páginas do artista em memória.

Nome, imagem e gêneros disponíveis vêm da API. A tela autenticada oferece Ver no Spotify, atualização e recuperação de falhas. O [guia dos artistas](docs/SPOTIFY-ARTISTAS.md) contém os passos para testar no APK instalado.

Validação da A11: 180 testes unitários (21 novos), lint e bundles Android/web aprovados. 73 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Teste físico do artista pendente.

## Base de armazenamento local implementada na A12

AsyncStorage 2.2.0 foi instalado na versão compatível com o Expo do projeto. A conta possui um registro versionado para curtidas, recentes, playlists, artistas acompanhados e preferências. A base valida os dados, restaura ao entrar e grava alterações em ordem, com isolamento por conta.

Falhas de leitura, registro inválido e versão desconhecida preservam o conteúdo existente. A interface oferece recuperação manual sem bloquear o catálogo. A13–A15 conectam os controles de curtidas, histórico e biblioteca a essa base; as funcionalidades da dupla também poderão utilizá-la.

A12 adiciona um módulo nativo que precisa estar no APK final. Por escolha da Ana, a geração e a instalação ficam para a conclusão do projeto. O [guia do armazenamento](docs/ARMAZENAMENTO-LOCAL.md) descreve o contrato e o passo a passo.

Validação da A12: 210 testes unitários (30 novos), lint, compatibilidade das dependências e bundles Android/web aprovados. 81 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. APK atualizado e persistência no Android pendentes.

## Curtidas persistentes implementadas na A13

Busca, álbum e detalhes da faixa possuem corações que salvam ou removem músicas na base local da conta. O estado só muda depois de confirmar a gravação. A Biblioteca oferece o atalho Músicas curtidas, com contador e acesso à nova rota /liked.

A lista mostra as curtidas mais recentes primeiro e abre os metadados salvos da faixa. Remover, sair e entrar novamente mantém a alteração; outra conta recebe sua própria lista. O [guia das curtidas](docs/MUSICAS-CURTIDAS.md) contém a conferência no Android.

Validação da A13: 226 testes unitários (16 novos), lint e bundles Android/web aprovados. 15 cenários específicos de navegador com Spotify simulado aprovados, sem exceções JavaScript. Fluxos anteriores também conferidos em regressão. Teste físico das curtidas pendente. Esta etapa adiciona a décima tela principal; as demais continuam no roteiro.

## Histórico persistente implementado na A14

A busca registra os termos ao confirmar pelo teclado ou lupa, selecionar uma sugestão ou abrir um resultado. O histórico mantém até 20 termos, normaliza espaços e evita duplicatas por maiúsculas/minúsculas.

Buscar → Buscas recentes abre a rota /recent-searches. Tocar em um termo volta à busca com o filtro Tudo; cada entrada pode ser removida, e a limpeza completa exige confirmação. As alterações usam a base local da A12 e preservam curtidas e demais dados.

Validação da A14: 244 testes unitários (18 novos), lint e bundles Android/web aprovados. 35 cenários de navegador com Spotify simulado aprovados (20 de histórico e 15 de regressão das curtidas), sem exceções JavaScript. A etapa acrescenta a décima primeira tela principal. O [guia das buscas recentes](docs/BUSCAS-RECENTES.md) descreve os fluxos.

Por decisão da Ana em 18/11/2026, a geração e o teste físico do APK ficam para a validação final do projeto. As verificações automatizadas continuam em cada etapa.

## Biblioteca integrada na A15

A Biblioteca autenticada substitui os cards fictícios da P1 por músicas curtidas e buscas confirmadas da conta. Os atalhos abrem /liked e /recent-searches. Os filtros Tudo, Músicas e Buscas modificam os itens exibidos; ordem Recentes/Título e Grade/Lista são salvas no registro local e restauradas na próxima entrada.

Preferências só mudam após confirmar a gravação, sem sobrescrever outras coleções. Falhas oferecem recuperação pelo aviso global. Contrato e teste final no [guia da Biblioteca](docs/BIBLIOTECA.md). O [roteiro da dupla](docs/ROTEIRO-DUPLA.md) está atualizado para G01–G15.

Validação: 260 testes unitários (16 novos), lint e bundles Android/web aprovados. 39 cenários de navegador com Spotify simulado aprovados (19 da Biblioteca e 20 de regressão do histórico), sem exceções JavaScript. São 11 telas principais; as telas adicionais serão criadas pelo Guilherme.

## Criação de playlists locais na G01

Biblioteca → Criar playlist abre /local-playlist/new. O nome é validado e a playlist vazia recebe ID próprio e datas; a gravação usa o mesmo registro local por conta, preservando curtidas, recentes e preferências.

A Biblioteca mostra os resumos salvos e oferece o filtro Playlists. A G01 acrescenta a décima segunda tela principal; detalhes por ID, inclusão de faixas e edição continuam em G02–G04. Contrato e próximos passos no [guia de playlists locais](docs/PLAYLISTS-LOCAIS.md).

Validação da G01: 280 testes unitários (20 novos), lint e bundles Android/web aprovados. 39 cenários de navegador com Spotify simulado aprovados (20 de criação e 19 de regressão da Biblioteca), sem exceções JavaScript. O teste físico do APK permanece reservado para o projeto completo.

## Detalhes de playlists locais na G02

Os cards da Biblioteca abrem /local-playlist/[id]. A tela mostra nome, capa disponível e quantidade, além das faixas que já existirem no registro local. Uma playlist vazia tem mensagem e acesso à busca; ID ausente, parâmetro inválido e erro de leitura recebem orientações próprias.

A consulta usa os dados da conta atual e funciona sem chamada de catálogo. Adicionar músicas pela interface continua na G03. A G02 acrescenta a décima terceira tela principal. Contrato e conferência final no [guia dos detalhes locais](docs/DETALHES-PLAYLIST-LOCAL.md).

Validação da G02: 298 testes unitários (18 novos), lint e bundles Android/web aprovados. 39 cenários de navegador com Spotify simulado aprovados (19 de detalhes e 20 de regressão da criação), sem exceções JavaScript. O teste físico do APK continua reservado para a conclusão do projeto completo.

## Adição de músicas na G03

Faixas na busca, álbum, curtidas e detalhes oferecem a ação de adicionar a uma playlist local. A nova tela /add-to-playlist permite escolher o destino, impede duplicatas e abre a playlist após a confirmação da gravação. A G03 acrescenta a 14ª tela principal. Ver [guia de inclusão](docs/ADICIONAR-MUSICAS.md).

Validação G03: 306 testes unitários, lint e bundles Android/web aprovados; sete cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. APK somente na conclusão do projeto completo.

## Edição de playlists na G04

Os detalhes oferecem Editar playlist: renomear, remover músicas e excluir a playlist, com confirmação nas remoções. Cancelar não grava alterações; falhas preservam os dados confirmados e oferecem recuperação. A G04 acrescenta a 15ª tela principal. Ver [guia de edição](docs/EDITAR-PLAYLISTS.md).

Validação G04: 314 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. O teste físico do APK permanece para o projeto completo.

## Playlists Spotify na G05

/playlist/[id] exibe os metadados e músicas permitidos pela API, com paginação e recuperação de falhas. A tela permite curtir faixas e adicioná-las às playlists locais. A demonstração da P1 fica separada, sem ativação automática em caso de erro. São 15 telas principais; a listagem das playlists da conta na Biblioteca fica para G06. Ver [guia de playlists Spotify](docs/SPOTIFY-PLAYLISTS.md).

Validação G05: 322 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Teste real no Android somente ao concluir o projeto completo.

## Playlists da conta na Biblioteca — G06

A Biblioteca lista playlists Spotify em uma seção própria, separada das playlists locais. Há atualização, paginação, abertura dos detalhes e preservação das páginas ao trocar filtros, layout e ordenação. Falhas não apagam resultados anteriores nem dados locais. Ver [guia da Biblioteca Spotify](docs/BIBLIOTECA-SPOTIFY.md).

Validação G06: 330 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais. APK e teste com a conta real somente na conclusão do projeto completo.

## Artistas acompanhados localmente — G07

A tela do artista permite acompanhar ou deixar de acompanhar neste aparelho. A Biblioteca mostra a escolha em Tudo e Artistas, com acesso ao artista correto. O estado persiste por conta, evita duplicatas e não modifica seguidores no Spotify. Ver [guia dos artistas acompanhados](docs/ARTISTAS-ACOMPANHADOS.md).

Validação G07: 338 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais. APK somente na conclusão do projeto completo.

## Perfil real da conta — G08

O perfil autenticado usa /me para apresentar a identificação da conta, com foto ou inicial e nome ou ID. Seguidores só aparecem se a API informar uma contagem válida. A tela oferece atualização, playlists reais, link Spotify e logout, sem os controles fictícios da P1. Ver [guia do perfil](docs/PERFIL-SPOTIFY.md).

Validação G08: 346 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Permanecem 15 telas principais. APK e teste físico somente ao concluir o projeto completo.

## Edição de apelido local — G09

Perfil → Editar apelido local permite salvar um apelido por conta, cancelar sem gravar ou voltar ao nome do Spotify. A preferência aparece no perfil e na Home, sem modificar a conta Spotify. A G09 acrescenta a 16ª tela principal. Ver [guia do apelido local](docs/APELIDO-LOCAL.md).

Validação G09: 354 testes unitários, lint e bundles Android/web aprovados; onze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. APK e teste físico somente ao concluir o projeto completo.

## Limitações atuais

- APK e login Android confirmados pela Ana; busca, Home, álbum e artista novos aguardam conferência no aparelho;
- Não há backend próprio; o catálogo vem do Spotify e os dados pessoais do aplicativo são salvos localmente;
- O aplicativo não reproduz arquivos de áudio;
- Curtidas de faixas reais persistem neste aparelho; controles demonstrativos da P1 permanecem nas telas ainda não refatoradas;
- Curtidas e histórico locais estão conectados. A sessão Android possui armazenamento seguro desde a A05;
- O módulo nativo do AsyncStorage precisa ser incluído em um APK atualizado da A12;
- Algumas imagens dependem de conexão com a internet;
- Home, busca, álbuns e artistas usam dados reais. Conteúdo completo de playlists continua nas etapas do Guilherme;

## Integrantes

- Ana Carolina Gomes Soares;
- Guilherme Viana Ramos Mello.

## Aviso legal

Este é um projeto acadêmico, sem fins comerciais e sem vínculo oficial com o Spotify.

Spotify, suas marcas, capas, imagens e demais conteúdos pertencem aos seus respectivos titulares. Os elementos visuais são utilizados apenas como referência para estudo de desenvolvimento mobile e construção de interfaces.
