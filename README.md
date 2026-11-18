# Spotify Mock - React Native + Expo

## Evolução para a P2

A P2 está em desenvolvimento gradual, com 30 novos commits planejados: 15 de Ana Carolina e 15 de Guilherme. A01 entregou o planejamento. A02 migrou as 9 telas para Expo Router; o catálogo e o player continuam demonstrativos. A04 adicionou login Spotify.

- [Roteiro completo, divisão dos commits e checklist da P2](docs/P2-ROTEIRO.md)
- [Configuração da Spotify Web API](docs/SPOTIFY-SETUP.md)
- [Cliente HTTP e tratamento de erros — A06](docs/SPOTIFY-API.md)
- [Serviços e modelos do catálogo — A07](docs/SPOTIFY-CATALOGO.md)
- [Geração e instalação do APK Android pelo EAS](docs/ANDROID-EAS.md)
- [Roteiro de continuidade para Guilherme](docs/ROTEIRO-DUPLA.md)

A04 implementou o login Spotify com PKCE; A05 adiciona persistência segura no Android, restauração e renovação. A integração prevista usa OAuth com PKCE, AsyncStorage para dados locais e pelo menos 12 telas, com meta de 17. O status de cada requisito deve ser conferido no roteiro.

## Estado atual — P2 em desenvolvimento

Aplicativo mobile que reproduz visualmente partes da interface do Spotify utilizando React Native e Expo. O aplicativo foi desenvolvido para a disciplina de Aplicativos Híbridos.

O projeto está evoluindo da interface da P1 para a P2. A04 implementa autenticação Spotify por PKCE e confirmação da conta em /me. Catálogo, player e conteúdo do perfil ainda usam dados demonstrativos. A05 salva a sessão Android com SecureStore e renova tokens. Catálogo real e dados locais com AsyncStorage continuam nas próximas etapas.

Repositório: https://github.com/GuiMell0/Spotify-Expo

## Principais recursos:

- Telas navegáveis;
- Navegação por abas e pilhas com Expo Router;
- Login Spotify com PKCE, tratamento de falhas e demonstração explícita;
- Sessão Android persistente no SecureStore, renovação compartilhada e logout;
- Busca local por músicas e playlists;
- Biblioteca com filtros visuais;
- Páginas de playlist, álbum, artista e perfil;
- Mini-player disponível nas principais telas;
- Player com estados visuais de reprodução e curtida;
- Layout responsivo e suporte a áreas seguras;

## Telas implementadas

| Tela | Descrição |
| --- | --- |
| Login | Entrada Spotify por PKCE, cancelamento, mensagens de erro e acesso explícito à demonstração. |
| Home | Atalhos, filtros, playlists e seções horizontais de conteúdo. |
| Busca | Campo de pesquisa local, resultados e categorias musicais. |
| Biblioteca | Filtros, ordenação e grade de playlists, álbuns e artistas. |
| Playlist | Capa, informações, controles e lista de músicas. |
| Álbum | Informações do álbum, artista, ações e faixas. |
| Artista | Imagem de destaque, seguidores, abas e músicas populares. |
| Player | Capa, progresso e controles demonstrativos, com retorno à tela de origem. |
| Perfil | Dados do usuário e listagem de playlists. |

## Tecnologias utilizadas

- JavaScript;
- React 19;
- React Native 0.86;
- Expo SDK 57;
- Expo Router 57;
- Expo AuthSession, Expo Crypto e Expo SecureStore;
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

O catálogo da P1 ainda é temporário. Exemplos para conferir: /album/misadventures, /artist/pierce-the-veil, /playlist/daily e /playlist/my-heart. Os IDs serão substituídos pelos IDs reais nas integrações futuras.

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

Para criar o app no Spotify e preencher o Client ID, siga [o passo a passo](docs/SPOTIFY-SETUP.md). Para vincular sua conta Expo e gerar o APK, siga [o guia EAS](docs/ANDROID-EAS.md). A03 configura o processo; A04 implementa o login. A geração e instalação do APK e o teste com a conta real seguem pendentes.

### Verificações da A03

Validação em 17/11/2026:

- npm run test:config: 8 testes aprovados, incluindo campo vazio, token usado por engano como Client ID, retorno inválido e seleção de plataforma.
- npx expo install --check: dependências compatíveis.
- npx expo config --type introspect: schemes spotifyexpo, spotifyexpo-login e do launcher de desenvolvimento registrados no Android, sem gerar projeto nativo.
- Bundles Android/Hermes e web gerados com sucesso em dist-check/a03/.
- Edge em viewport móvel: 10 cenários aprovados, sem exceções JavaScript ou avisos de navegação.
- Mensagens de configuração pendente e preenchida verificadas; Client ID informado aplicado apenas ao .env local.
- Modelo .env.example compartilhável e .env pessoal ignorado pelo Git.
- Geração/instalação do APK pelo EAS e autenticação real da conta continuam pendentes.

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
- Os testes simulados não acessam a conta real. Teste físico com Spotify real: pendente da Ana e de um APK atualizado.
- Artefatos e ferramenta de navegador ficam em dist-check/a04/, ignorada pelo Git.

Para testar com a conta, siga [a configuração Spotify](docs/SPOTIFY-SETUP.md) e [o guia do APK](docs/ANDROID-EAS.md). Expo Go permite a demonstração; a entrada real no Android exige o development build atualizado. Como A04 adicionou bibliotecas nativas, um APK anterior precisa ser gerado novamente.

A reprodução permanece nas etapas do Guilherme, conforme confirmado pela Ana. Até A15, o foco é conta, catálogo, busca, favoritas e histórico.

## Sessão implementada na A05

- Android: tokens, vencimento e identificação mínima da conta ficam no SecureStore, separados pelo Client ID. A tela inicial aguarda a leitura antes de liberar as rotas.
- Reabrir com token válido dispensa nova autorização. A renovação ocorre próximo ao vencimento, no vencimento ou ao voltar ao app, sem repetição automática após uma falha.
- Chamadas concorrentes compartilham a renovação. Um novo refresh token é salvo quando enviado; quando não é enviado, o anterior é preservado.
- Revogação exige novo login. Falha de rede preserva o registro e oferece Tentar restaurar sessão; a demonstração continua sendo uma escolha explícita.
- Logout remove o registro e impede respostas atrasadas de reabrir a conta. Falha de exclusão é informada com Limpar sessão novamente.
- Navegador e Expo Go usam apenas memória. Recarregar o navegador exige nova entrada; tokens não são gravados em localStorage nem AsyncStorage.
- A06 poderá usar getAccessToken do contexto para as consultas autenticadas. O catálogo da P1 permanece nesta etapa.
- Esta etapa adiciona expo-secure-store e seu plugin. Gere e instale outro APK caso já tenha um anterior: [guia Android/EAS](docs/ANDROID-EAS.md).

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

## Limitações atuais

- O login implementado aguarda validação manual com a conta real no APK Android;
- Não há backend ou banco de dados;
- O aplicativo não reproduz arquivos de áudio;
- Curtidas, filtros e controles são estados visuais locais;
- Curtidas e histórico ainda não persistem; a sessão Android já possui armazenamento seguro na A05;
- Algumas imagens dependem de conexão com a internet;
- As telas ainda usam dados da P1; a API já é utilizada na autenticação e consulta de /me. Os serviços de catálogo estão prontos na A07; a conexão das telas será feita em A08–A11 e G05/G06.

## Integrantes

- Ana Carolina Gomes Soares;
- Guilherme Viana Ramos Mello.

## Aviso legal

Este é um projeto acadêmico, sem fins comerciais e sem vínculo oficial com o Spotify.

Spotify, suas marcas, capas, imagens e demais conteúdos pertencem aos seus respectivos titulares. Os elementos visuais são utilizados apenas como referência para estudo de desenvolvimento mobile e construção de interfaces.

## Licença

O repositório inclui um arquivo `LICENSE` baseado na licença MIT. Consulte esse arquivo para conhecer os termos aplicáveis ao código.
