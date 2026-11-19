# Configurações — G10

Perfil → Configurações abre /settings, a 17ª tela principal. A tela oferece Grade/Lista e Recentes/Título, reutilizando as preferências persistentes da Biblioteca. Também mostra o apelido local, oferece acesso à edição e permite sair da conta.

A limpeza seletiva permite remover curtidas, recentes, playlists locais, artistas acompanhados ou redefinir preferências. Cada grupo exige confirmação e cancelar não grava nada. Redefinir preferências remove o apelido e restaura Grade/Recentes. Os demais grupos, a sessão e outras contas são preservados.

O serviço src/services/localSettings.mjs aceita somente grupos explícitos e usa a fila localData.update. Não chama AsyncStorage.clear, não apaga tokens e não modifica a conta Spotify. Falhas preservam o último registro confirmado; a interface mantém a confirmação e permite nova leitura antes de repetir.

Quando os dados não carregam, os controles de alteração ficam indisponíveis. Logout continua acessível. A demonstração não usa dados pessoais. O schema permanece na versão 1 e nenhuma biblioteca nativa nova é adicionada.

## Validação

362 testes unitários aprovados, incluindo oito novos de limpeza seletiva, idempotência, preservação, persistência, concorrência, falha de leitura e isolamento. 362 testes unitários, lint e bundles Android/web aprovados; doze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários verificam acesso protegido, navegação, preferências, cancelamento, limpeza de cada grupo, falha e recuperação, redefinição, persistência, contas distintas, largura de 320 pixels e logout.

## Conferência Android somente ao final

Trocar as preferências e conferir a Biblioteca, cancelar uma limpeza, confirmar somente um grupo e reabrir o aplicativo. Conferir redefinição do apelido e logout. Usar dados de teste para validar exclusões. Não gerar APK nesta etapa.

Após o commit G10, continuar somente G11: player com faixa real e abertura funcional no Spotify. O projeto ainda tem etapas de integração e revisão antes da validação final.
