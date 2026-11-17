# Continuação da P2 — Guilherme

Este roteiro é a passagem prevista depois dos 15 commits da Ana. O escopo e os critérios de cada G01–G15 estão na tabela do [roteiro principal](P2-ROTEIRO.md). Antes da passagem real, atualizar este documento conforme a implementação existente.

## Preparar a continuidade

1. Aguardar a Ana concluir e enviar A15.
2. Na mesma branch main, conferir git status. Se houver alterações locais próprias, preservá-las antes de atualizar.
3. Com a árvore limpa, executar git pull --ff-only.
4. Conferir git log -5 --oneline e ler README.md, P2-ROTEIRO.md e SPOTIFY-SETUP.md.
5. Verificar a identidade local com git config user.name e git config user.email. Usar o próprio nome e um email vinculado à própria conta GitHub. Não usar o autor da Ana.
6. Executar npm ci para instalar o lockfile entregue.
7. Criar o próprio .env a partir do exemplo. Usar o Client ID combinado e ter a própria conta Spotify autorizada pelo dono do app.
8. Preparar o development build Android conforme o guia atualizado e testar login, busca, álbum, artista, curtidas e recentes.
9. Iniciar G01 e executar somente uma etapa por vez.

Se git pull --ff-only falhar, verificar a divergência e pedir ajuda com a saída do comando. Não usar reset --hard nem forçar push para resolver.

## Sequência de entregas

| Ordem | Etapa | Resultado para verificar |
| --- | --- | --- |
| 1 | G01 | Criar playlists locais e encontrá-las após reinício. |
| 2 | G02 | Abrir a playlist local correta por ID. |
| 3 | G03 | Adicionar faixas reais sem duplicar. |
| 4 | G04 | Editar nome, remover faixas e excluir playlists. |
| 5 | G05 | Abrir detalhes e faixas de playlist Spotify permitida. |
| 6 | G06 | Consultar e paginar playlists da conta na biblioteca. |
| 7 | G07 | Acompanhar artistas localmente e encontrá-los na biblioteca. |
| 8 | G08 | Exibir perfil real, incluindo ausência de foto ou nome. |
| 9 | G09 | Alterar apelido local e confirmar persistência. |
| 10 | G10 | Usar configurações, preferências e logout. |
| 11 | G11 | Exibir faixa real no player e abrir a faixa no Spotify. |
| 12 | G12 | Manter faixa selecionada e fila coerentes no mini-player. |
| 13 | G13 | Recuperar de falhas e acessar dados locais sem rede. |
| 14 | G14 | Revisar StyleSheet, Flexbox e usabilidade no Android. |
| 15 | G15 | Concluir checklist, documentação final e roteiro do vídeo. |

## Mensagem pronta para o chat

    Vou continuar a P2 depois da Ana.
    Leia README.md, docs/P2-ROTEIRO.md, docs/SPOTIFY-SETUP.md e docs/ROTEIRO-DUPLA.md.
    Confira o Git e as funcionalidades já implementadas.
    Implemente somente G01, seguindo o contrato de dados existente.
    Valide, informe os arquivos alterados e a mensagem exata do commit.
    Pare e aguarde eu fazer o commit e push antes de continuar.

Depois do primeiro commit:

    Fiz o commit G01 e o push. Continue somente G02.
    Implemente, valide e pare antes do próximo commit.

Repetir com o próximo identificador, consultando o escopo no roteiro principal.

## Ao terminar cada etapa

Revisar git diff, testar o critério de aceite e conferir git status. Adicionar explicitamente os arquivos daquela etapa. Usar a mensagem da tabela principal, ajustando-a se o conteúdo mudou, e fazer git push origin main.

Não adicionar .env, tokens, node_modules ou arquivos temporários. Não registrar todos os 15 commits antes de implementar as respectivas funcionalidades.

## Vídeo de até cinco minutos

Proposta para ajustar quando o aplicativo estiver pronto:

- 0:00–0:30: identificar projeto e integrantes; mostrar login.
- 0:30–1:30: Home, busca real, álbum e artista.
- 1:30–2:15: curtir faixa, recentes e reiniciar o app para mostrar persistência.
- 2:15–3:20: criar playlist local, adicionar faixa, editar e abrir playlist Spotify.
- 3:20–4:15: player com abertura no Spotify, perfil, edição e configurações.
- 4:15–4:50: recuperação sem rede e visão do histórico de commits.

O vídeo deve demonstrar as funcionalidades reais. Conferir se o link abre para o avaliador. Cada integrante entrega individualmente os links indicados na imagem do trabalho.
