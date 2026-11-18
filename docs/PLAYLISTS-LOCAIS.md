# Playlists locais — G01

Atualização G02: os cards já abrem os [detalhes por ID](DETALHES-PLAYLIST-LOCAL.md). O conteúdo abaixo registra a criação entregue na G01; inclusão e edição de músicas continuam em G03/G04.

A G01 acrescenta /local-playlist/new, acessível pelo botão Criar playlist da Biblioteca autenticada. O aplicativo passa a ter 12 telas principais navegáveis.

## O que funciona nesta etapa

- Criar playlist com nome de 1 a 80 caracteres, normalizando espaços.
- Gerar ID próprio com expo-crypto.randomUUID, prefixado por local-.
- Salvar ID, nome, createdAt, updatedAt e tracks vazio no registro local existente.
- Mostrar resumos e quantidades na Biblioteca, em Tudo ou no filtro Playlists.
- Ordenar junto com os demais itens e respeitar grade/lista já persistentes.
- Encontrar os registros depois de sair e entrar novamente ou reabrir o aplicativo.

Nomes iguais são permitidos; os IDs identificam playlists diferentes. O limite é de 50 playlists por conta neste aparelho. A criação não modifica playlists da conta Spotify e não depende de uma chamada da Web API.

Os resumos ainda não abrem detalhes. A rota /local-playlist/[id] é a próxima etapa, G02. Adicionar músicas, editar e excluir continuam em G03/G04.

## Código e contrato

- app/local-playlist/new.js exporta src/screens/CreatePlaylistScreen.js; a rota está no Stack protegido.
- src/services/localPlaylists.mjs oferece normalizePlaylistName, addLocalPlaylist, createLocalPlaylist e listLocalPlaylists.
- O formulário usa o repositório de AsyncStorage por conta, sem outro armazenamento ou migração do schema versão 1.
- src/services/library.mjs inclui o tipo local-playlist e o filtro playlists. O item carrega playlist e não recebe href nesta etapa.
- A Biblioteca distingue resumos de playlists, apresentados como informação, dos botões de músicas e buscas.

A função createLocalPlaylist(localData, { id, name, createdAt }) grava por localData.update(current => ...). Preserva curtidas, recentes, artistas acompanhados e preferências. O ID e o instante identificam a tentativa; repetir a mesma tentativa é uma operação sem duplicação.

O formulário aguarda confirmação antes de voltar à Biblioteca. Salvar ou cancelar usa dismissTo para fechar a tela de criação e retornar à Biblioteca existente. Enquanto salva, campo, confirmação e cancelamento ficam indisponíveis. Em caso de erro, mantém o nome digitado e usa o aviso global para carregar os dados novamente.

Se o armazenamento gravar mas não confirmar o resultado, a nova leitura reconhece a playlist pelo ID e conclui a tela sem criá-la outra vez. Um registro inválido ou falha de hidratação bloqueia a criação e preserva os dados existentes.

Demonstração não mostra o botão Criar e não lê playlists pessoais. A rota exige sessão ou demonstração; uma abertura direta em demonstração orienta entrar com Spotify e não permite gravar.

## Validação

- npm run test:playlists: 20 testes de domínio, persistência, concorrência, limites, falhas, timeout e isolamento por conta.
- Suíte completa: 280 testes unitários aprovados.
- Lint e bundles Android/Hermes e web aprovados.
- 39 cenários de navegador com Spotify simulado aprovados (20 de criação e 19 de regressão da Biblioteca), sem exceções JavaScript. O navegador também confere que salvar fecha o formulário na pilha.

As ferramentas e capturas de navegador ficam em dist-check/g01, ignorada pelo Git. A simulação não acessa a conta real e não substitui validação nativa.

## Conferência no Android — ao concluir o projeto completo

Manter a decisão de gerar e testar o APK somente no final. Não criar outro build a cada etapa.

1. Abrir Biblioteca e tocar em Criar playlist.
2. Tentar confirmar sem nome; conferir a validação.
3. Criar Para estudar e Viagem, voltar e filtrar Playlists.
4. Conferir os nomes, quantidades e preferência de grade/lista.
5. Fechar e reabrir o aplicativo; conferir as duas playlists.
6. Com sessão válida, criar outra playlist sem internet e conferir os dados locais.
7. Entrar em outra conta autorizada e confirmar o isolamento.

## Próxima etapa

    Fiz o commit G01 e o push.
    Continue somente G02 do docs/P2-ROTEIRO.md.
    Implemente os detalhes da playlist local por ID e conecte os resumos da Biblioteca.
    Valide, informe a mensagem do commit e pare.
    Não gerar APK até o projeto completo estar pronto.
