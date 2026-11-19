# Revisão visual e acessibilidade — G14

As 17 telas principais foram revisadas mantendo o tema escuro, o verde e os componentes visuais do projeto.

## Alterações

- Estilos estáticos que estavam inline nas telas demonstrativas e em componentes compartilhados foram movidos para StyleSheet.create.
- Flexbox continua definindo linhas, colunas, espaçamentos, quebra de ações e crescimento do conteúdo. Colunas de texto podem encolher sem empurrar os controles para fora da tela.
- ScreenSafeArea mantém o suporte nativo às áreas seguras, incluindo laterais, e desconta as bordas já reservadas pelos avisos, mini-player e abas.
- Quando dois avisos aparecem juntos, somente o primeiro reserva o inset superior.
- As abas deixam de repetir o inset inferior quando o mini-player já o reserva. Sua tipografia foi ajustada e as abas recolhem ao abrir o teclado.
- LayoutProvider acompanha os eventos nativos do teclado uma vez. O mini-player recolhe durante a digitação e reaparece depois, preservando a seleção.
- A edição de playlists ganhou KeyboardAvoidingView, os conteúdos roláveis recolhem o teclado ao arrastar e abrir uma faixa pela busca fecha o teclado.
- O Android foi configurado com softwareKeyboardLayoutMode: resize para ajustar o espaço do aplicativo ao teclado. Essa configuração será incorporada no APK final.
- IconButton possui área mínima de 44 por 44 pixels lógicos e informa quando está desativado. Cards e linhas compartilhados receberam rótulos de ação; ícones decorativos das abas não precisam ser anunciados.
- O título do login recebeu semântica de cabeçalho. A escala de fonte do sistema permanece habilitada.

Os objetos de estilo que continuam calculados em tempo de execução representam dimensões variáveis, como largura de card e insets. Os estilos estáticos ficam em StyleSheet.

## Telas conferidas

Login, Home, Busca, Biblioteca, Álbum, Artista, Playlist Spotify, Player, Perfil, Músicas curtidas, Buscas recentes, Criar playlist local, Playlist local, Editar playlist local, Adicionar à playlist, Editar apelido local e Configurações.

A demonstração da P1 também recebeu a remoção de estilos estáticos inline. Ela permanece separada do catálogo autenticado.

## Validação automatizada e visual

- 394 testes unitários aprovados, sem criar testes que apenas reproduzam as alterações de estilo.
- Lint sem avisos e bundles Android/web aprovados.
- 40 cenários de layout aprovados: cada uma das 17 telas nas larguras de 320 e 768 pixels, três formulários com viewport de 320 por 360 pixels, cards locais de nome longo em grade e lista e conferência de navegação sem exceções.
- 36 cenários de regressão aprovados: 15 de recuperação/uso offline e 21 de player, mini-player e fila.
- Total de 76 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript.
- Capturas de telas pequenas foram conferidas, incluindo player com título longo, busca e formulário de edição com altura reduzida.

Foram verificados limites horizontais de títulos e ações, ausência de overflow horizontal da página, alturas de pelo menos 44 pixels para as ações principais medidas, nomes longos e manutenção das funcionalidades. Isso não equivale a medir todos os alvos de toque do aplicativo.

O navegador usa insets de desktop e não reproduz o teclado nativo, a escala de fonte do Android ou o TalkBack. A redução da altura verifica apenas o espaço disponível para rolar até as ações. Os insets nativos e o recolhimento por evento do teclado continuam pendentes da conferência no aparelho.

## Conferência Android somente na conclusão do projeto

1. Abrir as 17 telas e conferir barras de status e navegação, avisos e mini-player.
2. Usar nomes longos e aumentar a fonte nas configurações do Android; conferir leitura e acesso às ações.
3. Digitar na busca e nos três formulários: criação de playlist, edição de playlist e edição de apelido.
4. Conferir que o mini-player recolhe com o teclado e retorna mantendo a faixa.
5. Rolar até salvar ou cancelar com o teclado aberto, sem perder alterações ou tocar duas vezes.
6. Usar TalkBack para conferir rótulos, seleção, controles desativados e ordem de leitura.

Não gerar APK nesta etapa. Depois do commit G14, continuar somente G15: validação final, APK, conferência do histórico e roteiro do vídeo.
