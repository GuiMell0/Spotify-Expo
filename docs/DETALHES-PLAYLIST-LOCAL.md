# Detalhes de playlists locais — G02

A Biblioteca agora abre a rota /local-playlist/[id], implementada em app/local-playlist/[id]/index.js. A etapa acrescenta a décima terceira tela principal.

## Funcionalidades

- Cada card abre a playlist local do ID correspondente, mesmo que duas playlists tenham o mesmo nome.
- O cabeçalho mostra nome, quantidade de músicas e capa da primeira faixa com imagem; sem capa, usa um ícone em fundo verde.
- Playlist vazia tem mensagem própria e ação funcional para abrir Buscar.
- Faixas já presentes no registro local mostram os metadados salvos e podem abrir seus detalhes. Os corações reutilizam as curtidas existentes.
- Os detalhes são derivados da conta atual, não de uma seleção temporária nem de uma consulta da Web API.
- Carregamento, ID inválido, registro ausente e erro de armazenamento possuem estados distintos.
- Uma falha de atualização preserva a última playlist confirmada e oferece nova leitura pelo aviso global.
- Voltar retorna à origem; sem histórico, abre a Biblioteca.

Adicionar músicas pela interface continua na G03; editar e excluir, na G04. A G02 não cria botões dessas funções antes de suas telas existirem. As faixas usadas no teste de conteúdo foram inseridas como snapshots normalizados pela ferramenta de simulação.

## Contrato de dados e rotas

src/services/localPlaylistDetails.mjs fornece:

- isLocalPlaylistId(id): valida o parâmetro de leitura, incluindo tipo, limite de 100 caracteres, controles e codificação. new é reservado ao formulário.
- localPlaylistHref(id): monta o caminho codificando o ID como segmento; retorna null para ID inválido.
- findLocalPlaylist(data, id): consulta apenas data.playlists pelo ID exato; não muda o registro e não procura em outras contas.
- localPlaylistCover(playlist): retorna a primeira imagem disponível ou null.
- selectLocalPlaylist(state, id): distingue disabled, invalid, loading, error, not_found e ready.

IDs lidos dos registros existentes podem conter espaços internos e Unicode; o helper preserva o valor e codifica o caminho. A criação da G01 mantém UUIDs próprios com prefixo local-. O namespace não se confunde com /playlist/[id], destinado ao Spotify.

A Biblioteca usa o mesmo helper de capa e o destino canônico do detalhe. O tipo local-playlist agora é um card com ação. G03/G04 devem continuar gravando pelo repositório existente, preservando as demais coleções e o isolamento por conta. Não criar outra base nem migrar o schema para adicionar funções já previstas.

## Validação

- npm run test:playlist-details: 18 testes de seleção por ID, URLs, imagens, estados de leitura e privacidade.
- Suíte completa: 298 testes unitários aprovados.
- Lint e bundles Android/Hermes e web aprovados.
- 39 cenários de navegador com Spotify simulado aprovados (19 de detalhes e 20 de regressão da criação), sem exceções JavaScript. Incluem duas playlists distintas, reabertura, estado vazio, dados com faixas, capa, curtidas, largura de 320 pixels, leitura pendente, recuperação e isolamento entre contas. IDs malformados e falha sem dados confirmados também são cobertos pelos testes unitários.

As simulações não usam a conta real e não comprovam a execução nativa. Ferramentas, capturas e bundles ficam em dist-check/g02, ignorada pelo Git.

## Conferência no Android — somente ao final do projeto completo

1. Criar duas playlists e abri-las alternadamente na Biblioteca.
2. Conferir nomes, quantidades e capa substituta nas playlists vazias.
3. Abrir Buscar pelo estado vazio e voltar à Biblioteca.
4. Depois da G03, incluir faixas e conferir capa, metadados, curtidas e retorno do player.
5. Fechar e reabrir o app; conferir os detalhes das mesmas playlists.
6. Com sessão válida e dados carregados, conferir os detalhes sem rede. Imagens externas podem depender de cache.
7. Conferir outra conta autorizada e um link de playlist ausente: não pode aparecer conteúdo pessoal da conta anterior.

Não gerar APK nesta etapa; manter o teste físico para a conclusão do projeto completo.

## Mensagem para continuar

    Fiz o commit G02 e o push.
    Continue somente G03 do docs/P2-ROTEIRO.md.
    Implemente a adição de músicas às playlists locais, reaproveitando os dados existentes.
    Valide, informe o commit e pare antes da próxima etapa.
    Não gerar APK até o projeto completo estar pronto.
