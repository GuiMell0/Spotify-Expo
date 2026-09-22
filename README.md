# Spotify Mock - React Native + Expo

Aplicativo mobile que reproduz visualmente partes da interface do Spotify utilizando React Native e Expo. O aplicativo foi desenvolvido para a disciplina de Aplicativos Híbridos.

O projeto é um mock de interface: não possui backend, reprodução real de áudio, autenticação, persistência de dados ou integração com a API do Spotify. As telas e interações foram desenvolvidas para demonstrar componentes, navegação e construção de interfaces híbridas.

## Principais recursos:

- Telas navegáveis;
- Navegação por abas e pilhas com React Navigation;
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
| Player | Capa, progresso, controles de reprodução, curtida e retorno à Home. |
| Perfil | Dados do usuário e listagem de playlists. |

## Tecnologias utilizadas

- JavaScript;
- React 19;
- React Native 0.86;
- Expo SDK 57;
- React Navigation 7;
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
