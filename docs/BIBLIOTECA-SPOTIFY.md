# Playlists da conta na Biblioteca — G06

A Biblioteca apresenta uma seção Playlists da conta Spotify em Tudo e Playlists. Os cards remotos usam identificação Spotify e proprietário, enquanto os locais continuam identificados como Playlist local e abrem rotas diferentes.

A consulta usa catalog.getMyPlaylists com páginas de 20 e nextPage com o cursor original. Atualizar refaz a consulta; carregar mais preserva as páginas anteriores e remove duplicatas por ID. Falhas mantêm resultados confirmados e não alteram os dados locais.

A lista remota usa a ordem fornecida pelo Spotify, pois a API não informa a data de criação dessas playlists. A opção Título ordena as playlists já carregadas. Grade/lista e ordenação reutilizam as preferências locais. Trocar filtros e layout preserva as páginas em memória durante a sessão da Biblioteca.

O controlador em src/services/spotifyLibrary.mjs é separado por conta, cancela consultas ao sair e ignora respostas atrasadas. A demonstração não cria esse controlador. Dados remotos não são salvos como playlists locais. A tela continua acessível para dados locais se a consulta falhar.

## Validação

330 testes unitários aprovados, incluindo oito novos de paginação, cache em memória, duplicatas, concorrência, falhas e isolamento. 330 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários cobrem distinção local/remoto, paginação com recuperação, cache após filtros e layout, navegação, erro de acesso, vazio, troca de conta e demonstração. A largura de 320 pixels também foi conferida.

## Conferência Android somente ao final do projeto

Entrar com a conta autorizada, abrir Biblioteca, conferir listas locais/remotas, carregar próxima página e abrir detalhes Spotify. Trocar filtros e visualização, voltar e conferir os dados. Verificar outra conta e recuperação sem rede.

A G06 reutiliza a Biblioteca: permanecem 15 telas principais. Não gerar APK nesta etapa. Depois do commit G06, continuar somente G07: artistas acompanhados localmente.
