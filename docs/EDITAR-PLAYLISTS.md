# Editar playlists locais — G04

Os detalhes da playlist oferecem Editar playlist, que abre /local-playlist/[id]/edit. A tela permite renomear, remover faixas e excluir a playlist. Remoção e exclusão exigem confirmação; cancelar não grava dados.

Nomes usam a validação existente de 1 a 80 caracteres. As operações preservam createdAt, ID, curtidas, histórico, preferências e outras playlists. updatedAt não retrocede. Excluir uma playlist não exclui suas músicas de outras listas ou das curtidas.

As alterações passam pela fila de localData.update e só são confirmadas após salvar. Falhas preservam dados e oferecem recuperação pelo aviso global. A tela não modifica a conta Spotify. A G04 acrescenta a 15ª tela principal.

O serviço src/services/editLocalPlaylist.mjs contém renameLocalPlaylist, removeLocalPlaylistTrack e deleteLocalPlaylist. Remoções repetidas são idempotentes e as funções recebem sempre o registro atual do repositório.

## Validação

314 testes unitários aprovados, incluindo oito novos de edição, remoção, exclusão, concorrência, persistência e falhas. 314 testes unitários, lint e bundles Android/web aprovados; nove cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários verificam validação, renomeação, cancelamento, recuperação, outra playlist preservada, largura de 320 pixels e reabertura.

## Conferência no Android ao concluir o projeto completo

Renomear uma playlist com faixas; cancelar e confirmar remoção; conferir a mesma faixa em outra playlist; cancelar e confirmar exclusão; reabrir o app e conferir persistência. Não gerar APK nesta etapa.

Depois do commit G04, continuar somente G05: playlists Spotify e suas faixas reais.
