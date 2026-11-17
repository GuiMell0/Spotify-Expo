# Spotify Mock - React Native + Expo

## Evolução para a P2

A P2 está em desenvolvimento gradual, com 30 novos commits planejados: 15 de Ana Carolina e 15 de Guilherme. A01 entregou o planejamento. A02 migrou as 9 telas para Expo Router; o catálogo, o login e o player continuam demonstrativos.

- [Roteiro completo, divisão dos commits e checklist da P2](docs/P2-ROTEIRO.md)
- [Configuração da Spotify Web API e testes no Android](docs/SPOTIFY-SETUP.md)
- [Roteiro de continuidade para Guilherme](docs/ROTEIRO-DUPLA.md)

A próxima etapa configura o ambiente Spotify e o desenvolvimento Android. A integração prevista usa OAuth com PKCE, AsyncStorage para dados locais e pelo menos 12 telas, com meta de 17. O status de cada requisito deve ser conferido no roteiro.

## Estado atual — P2 em desenvolvimento

Aplicativo mobile que reproduz visualmente partes da interface do Spotify utilizando React Native e Expo. O aplicativo foi desenvolvido para a disciplina de Aplicativos Híbridos.

O projeto é um mock de interface: não possui backend, reprodução real de áudio, autenticação, persistência de dados ou integração com a API do Spotify. As telas e interações foram desenvolvidas para demonstrar componentes, navegação e construção de interfaces híbridas.

Repositório: https://github.com/GuiMell0/Spotify-Expo

## Principais recursos:

- Telas navegáveis;
- Navegação por abas e pilhas com Expo Router;
- Login demonstrativo, sem autenticação real;
- Busca local por músicas e playlists;
- Biblioteca com filtros visuais;
- Páginas de playlist, álbum, artista e perfil;
- Mini-player disponível nas principais telas;
- Player com estados visuais de reprodução e curtida;
- Layout responsivo e suporte a áreas seguras;

## Telas implementadas

| Tela | Descrição |
| --- | --- |
| Login | Entrada demonstrativa com botões do Spotify, Google e Apple. |
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

Inicie o Expo:

```bash
npx expo start
```

No celular:

1. Conecte o celular e o computador à mesma rede Wi-Fi;
2. Abra o Expo Go;
3. Leia o QR Code exibido no terminal ou no navegador;
4. Aguarde o Metro Bundler finalizar a compilação.

Se a conexão pela rede local não funcionar, tente:

```bash
npx expo start --tunnel
```

## Navegação implementada na A02

A entrada é expo-router/entry, com layouts em app/_layout.js e app/(tabs)/_layout.js. App.js e o navegador antigo foram removidos. A rota / redireciona para o login demonstrativo; seus botões abrem /home. Não há proteção de sessão nesta etapa.

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

1. Reinicie o Metro após a mudança de entrada: npx expo start --clear.
2. Abra no Expo Go nesta etapa e toque no login demonstrativo.
3. Visite as três abas; abra uma playlist, o álbum, o artista e o perfil.
4. Em Buscar, pesquise Misadventures e abra o resultado.
5. Abra o player de uma tela de detalhes; feche e confirme o retorno à tela de origem.
6. Confira o botão Voltar e o gesto/botão do Android sem retornar ao login depois de entrar.

O teste de OAuth passará a exigir development build nas próximas etapas. Consulte docs/SPOTIFY-SETUP.md.

## Limitações atuais

- Não existe autenticação real;
- Não há backend ou banco de dados;
- O aplicativo não reproduz arquivos de áudio;
- Curtidas, filtros e controles são estados visuais locais;
- Os dados não permanecem salvos após reiniciar o aplicativo;
- Algumas imagens dependem de conexão com a internet;
- Não existe integração oficial com a API do Spotify.

## Integrantes

- Ana Carolina Gomes Soares;
- Guilherme Viana Ramos Mello.

## Aviso legal

Este é um projeto acadêmico, sem fins comerciais e sem vínculo oficial com o Spotify.

Spotify, suas marcas, capas, imagens e demais conteúdos pertencem aos seus respectivos titulares. Os elementos visuais são utilizados apenas como referência para estudo de desenvolvimento mobile e construção de interfaces.

## Licença

O repositório inclui um arquivo `LICENSE` baseado na licença MIT. Consulte esse arquivo para conhecer os termos aplicáveis ao código.
