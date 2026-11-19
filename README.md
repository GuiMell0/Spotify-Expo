# Spotify Expo — P2

Aplicativo acadêmico em React Native e Expo, com identidade visual inspirada no Spotify, 17 telas, catálogo da Spotify Web API e dados pessoais persistentes por conta.

O código das etapas A01–A15 e G01–G14 está implementado. A G15 reúne a validação final, o APK independente e a preparação da entrega. Ana confirmou instalação e os principais fluxos com a conta real no Android. O atalho offline da Home foi corrigido e o ícone do launcher foi configurado; ambos aguardam confirmação no APK atualizado; os casos ainda não executados estão registrados no checklist.

[Repositório no GitHub](https://github.com/GuiMell0/Spotify-Expo)

## Instalar no Android

A opção principal é o APK independente: ele abre sem computador, Metro ou Expo Go. O link e as instruções ficam no [guia de instalação](docs/INSTALAR-NO-CELULAR.md).

Para conferir as funcionalidades no aparelho, siga o [checklist final da P2](docs/VALIDACAO-P2.md). Os resultados automatizados e as pendências reais estão separados nesse documento.

## Funcionalidades

- Login Spotify por Authorization Code com PKCE, sem Client Secret no aplicativo.
- Sessão Android no SecureStore, restauração, renovação compartilhada e logout.
- Home, busca com filtros e paginação, álbuns, artistas, faixas e playlists pela API.
- Biblioteca com playlists Spotify separadas das coleções locais.
- Curtidas, histórico recente, playlists locais, artistas acompanhados e preferências no AsyncStorage.
- Criação, edição, inclusão e remoção de músicas e exclusão de playlists locais com confirmação.
- Perfil da conta e apelido local que não altera o nome no Spotify.
- Configurações de grade/lista e ordenação, com limpeza seletiva dos dados.
- Faixa selecionada, mini-player e fila compartilhada com anterior, próxima e escolha direta.
- Recuperação de falhas, respeito a Retry-After e acesso aos dados locais quando a renovação falha temporariamente.
- StyleSheet, Flexbox e tratamento de textos longos, áreas seguras e teclado.

**Ouvir no Spotify abre a faixa no próprio Spotify.** O aplicativo não reproduz áudio internamente nem baixa músicas para ouvir offline. A fila representa seleção de metadados.

O modo de demonstração da P1 é uma opção explícita no login. Uma falha da API não troca o catálogo autenticado por dados fictícios.

## As 17 telas

| Tela | Rota |
| --- | --- |
| Login | /login |
| Home | /home |
| Busca | /search |
| Biblioteca | /library |
| Álbum | /album/[id] |
| Artista | /artist/[id] |
| Playlist Spotify | /playlist/[id] |
| Player / faixa selecionada | /player?trackId=… |
| Perfil | /profile |
| Músicas curtidas | /liked |
| Buscas recentes | /recent-searches |
| Criar playlist local | /local-playlist/new |
| Playlist local | /local-playlist/[id] |
| Editar playlist local | /local-playlist/[id]/edit |
| Adicionar à playlist | /add-to-playlist?trackId=… |
| Editar apelido local | /profile/edit |
| Configurações | /settings |

Callback OAuth, redirecionamento inicial e página inexistente não entram nessa contagem. A navegação usa Expo Router com Tabs, Stack e rotas dinâmicas em app/. O package.json aponta para expo-router/entry; não existe App.js concorrente.

## Preparar o projeto

Ambiente usado nas validações: Node.js 24.11, Expo 57.0.33, React 19.2.3 e React Native 0.86.3.

```powershell
git clone https://github.com/GuiMell0/Spotify-Expo.git
cd Spotify-Expo
npm ci
if (-not (Test-Path -LiteralPath '.env')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env'
}
```

Preencha EXPO_PUBLIC_SPOTIFY_CLIENT_ID no próprio .env. O retorno Android é spotifyexpo-login://callback e precisa estar salvo no app do Spotify. O [guia Spotify](docs/SPOTIFY-SETUP.md) explica credenciais, usuários autorizados e PKCE. Nunca coloque Client Secret, senha ou tokens manuais no código ou em EXPO_PUBLIC.

Para desenvolver com um development build instalado:

```powershell
npm run dev
```

A demonstração pode ser aberta com npm run start:go. Para o login real no Android, utilize um APK com os schemes e bibliotecas nativas do projeto. O perfil preview gera o aplicativo independente; development usa Metro. Veja [Android/EAS](docs/ANDROID-EAS.md).

## Verificação

```powershell
npm test
npm run lint
npx expo install --check
npx expo-doctor
```

A G15 confirmou 394 testes unitários aprovados, lint sem avisos, dependências compatíveis e 21/21 verificações do Expo Doctor. Os bundles Android/web e os 76 cenários de navegador da G14 passaram sobre o código funcional 6b781cd: 40 de layout, 15 de recuperação e 21 de player/fila. Após o retorno do teste Android, o atalho Abrir Biblioteca local foi corrigido: navegação de abas na Home/Busca e retorno por pilha nos detalhes. A G15 reexportou os bundles e aprovou cinco cenários específicos para essa correção. Os testes de navegador usam Spotify simulado e não substituem a conferência da API e dos módulos nativos no celular.

As 17 telas foram verificadas em larguras de 320 e 768 pixels; três formulários também foram exercitados com altura reduzida. O teclado real foi confirmado pela Ana. Token vencido offline, troca de conta e a conferência completa de insets, escala de fonte e TalkBack continuam não testados no aparelho.

## Dados e limites

As coleções locais são separadas pelo ID da conta. Tokens ficam no SecureStore Android; no navegador ficam somente em memória. A fila fica na memória da sessão e é limpa ao sair ou reiniciar.

Sem internet, os dados locais previamente salvos continuam disponíveis para a conta restaurada. Primeira autorização, novo catálogo e capas remotas dependem de conexão. Uma sessão efetivamente rejeitada exige novo login.

Playlists e acompanhamento de artistas locais não alteram a conta Spotify. O acesso a endpoints e playlists remotas depende das permissões e da disponibilidade para a conta autorizada.

## Entrega

O histórico conferido na abertura da G15 tem 58 commits: 29 da Ana e 29 nos identificadores Git de Guilherme/GuiMell0. São 15 etapas A e 14 etapas G registradas desde a P1. O commit G15 completará 59 commits e 15 etapas de cada sequência. A contagem registra autoria Git e não substitui a contribuição efetiva de cada integrante.

- [Validação final e resposta para retomar no chat](docs/VALIDACAO-P2.md)
- [Roteiro de vídeo com duração de 4min50s](docs/ROTEIRO-VIDEO.md)
- [Planejamento e histórico das etapas](docs/P2-ROTEIRO.md)
- [Continuidade da dupla](docs/ROTEIRO-DUPLA.md)
- [Revisão visual](docs/REVISAO-VISUAL.md)
- [Recuperação e uso offline](docs/RECUPERACAO-OFFLINE.md)
- [Player e abertura no Spotify](docs/PLAYER-SPOTIFY.md)
- [Mini-player e fila](docs/MINI-PLAYER-FILA.md)

O vídeo ainda precisa ser gravado e publicado por link. Cada integrante entrega individualmente os links exigidos na disciplina.

## Integrantes

Ana Carolina Gomes Soares e Guilherme Viana Ramos Mello.

Projeto acadêmico sem vínculo oficial com o Spotify. Marcas, capas e demais conteúdos pertencem aos respectivos titulares.
