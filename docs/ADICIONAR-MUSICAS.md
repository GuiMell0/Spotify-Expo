# Adicionar músicas a playlists locais — G03

A ação de playlist ao lado de uma faixa na busca, álbum, curtidas ou detalhes abre /add-to-playlist?trackId=ID. A tela permite escolher uma playlist local e confirma a inclusão somente depois de salvar.

A faixa é obtida dos metadados selecionados, das curtidas ou playlists já salvas; um link direto válido pode consultar getTrack. A consulta possui cancelamento e recuperação pela interface. Não há gravação na conta Spotify.

Playlists que já contêm o ID mostram Já adicionada e bloqueiam repetição. A mesma faixa pode estar em playlists diferentes. O limite é de 300 músicas por playlist. A inclusão preserva ordem, createdAt e demais coleções; updatedAt avança sem retroceder em caso de relógio atrasado.

Após confirmar, Ver playlist abre os detalhes atualizados. Se não houver playlists, Criar playlist abre o formulário existente. Depois de criar, volte à faixa para escolhê-la novamente.

O serviço src/services/playlistTracks.mjs usa snapshotTrack e a fila de localData.update. Nenhuma mudança aparece como concluída antes da confirmação. Falhas usam o aviso global para nova leitura e repetição segura. Contextos de contas diferentes não compartilham a confirmação.

A G03 acrescenta a 14ª tela principal. Edição, remoção de faixas e exclusão ficam para G04. Reprodução continua nas etapas previstas.

## Validação

306 testes unitários aprovados, incluindo oito novos testes de inclusão, duplicatas, limites, concorrência, persistência e falhas. 306 testes unitários, lint e bundles Android/web aprovados; sete cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários conferem inclusão, duplicatas, detalhes atualizados, recuperação, largura de 320 pixels e reabertura. Artefatos temporários ficam em dist-check/g03, ignorada pelo Git.

## Conferência no Android ao concluir o projeto

Buscar uma faixa, abrir a escolha de playlist, adicionar e conferir os detalhes. Repetir a tentativa e verificar o bloqueio de duplicata. Adicionar a outra playlist, reabrir o app e confirmar persistência. Conferir alvos de toque em telas pequenas e isolamento entre contas.

Não gerar APK por etapa: manter a decisão de testar o aparelho somente ao final do projeto completo.

## Continuidade

Depois do commit G03, solicitar somente G04: editar e excluir playlists locais, renomear e remover músicas, com confirmação e persistência.
