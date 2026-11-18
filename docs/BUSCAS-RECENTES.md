# Histórico e buscas recentes — A14

A14 usa a persistência por conta da A12 e adiciona a rota /recent-searches, acessível em Buscar → Buscas recentes. O aplicativo passa a ter 11 telas principais; a Biblioteca completa e as telas restantes continuam no roteiro.

## Quando um termo é salvo

- Ao confirmar a busca pela lupa ou pelo botão de busca do teclado.
- Ao selecionar uma sugestão de pesquisa.
- Ao abrir um resultado da busca.

A digitação sozinha não gera entradas. Curtir uma faixa sem abrir o resultado também não confirma a busca.

Espaços nas pontas são removidos, espaços consecutivos são unificados e a deduplicação ignora maiúsculas/minúsculas. Acentos são preservados. Pesquisar novamente o mesmo termo atualiza sua data e o move para o topo, mantendo a última grafia utilizada.

São mantidos até 20 termos. Ao incluir o vigésimo primeiro, o mais antigo é descartado. O campo aceita até 150 caracteres, conforme o contrato da base local.

## Navegação e remoção

- Ver buscas recentes abre a nova tela pelo Expo Router.
- Tocar em um termo retorna à busca com esse termo e o filtro Tudo, iniciando uma nova consulta.
- O botão de remover afeta apenas a entrada correspondente e não inicia uma pesquisa.
- Limpar histórico pede confirmação. Cancelar conserva a lista.
- A limpeza confirmada afeta apenas recentSearches. Curtidas, playlists, artistas e preferências são preservados.
- A tela informa carregamento, histórico vazio e falha de leitura.
- Durante gravação, ações de remoção e limpeza ficam bloqueadas. A lista muda após confirmação do armazenamento.
- Falhas de gravação preservam o último estado confirmado e oferecem recuperação pelo aviso global da A12.

O histórico é salvo somente neste aparelho, separado por conta. A demonstração não consulta nem grava os registros pessoais. Sair conserva o registro no disco para a próxima entrada da mesma conta.

Se o histórico não estiver disponível por erro de armazenamento, a consulta do catálogo continua funcionando. O aplicativo não escreve uma lista vazia por cima de dados inválidos.

## Arquivos

- src/services/recentSearches.mjs: normalização, limite, ordem, inclusão e remoção.
- src/hooks/useRecentSearches.js: acesso compartilhado à persistência.
- src/components/RecentSearchesShortcut.js: entrada e contador na busca.
- src/screens/RecentSearchesScreen.js e app/recent-searches.js: tela com StyleSheet/Flexbox e lista.
- src/screens/SearchScreen.js: confirmação pelo teclado/lupa, sugestões e resultados.
- tests/recent-searches.test.mjs: regras e integração com armazenamento.

## Validação automática

- npm run test:recents: 18 testes aprovados.
- Regressão completa: 244 testes unitários aprovados.
- npm run lint aprovado.
- Bundles Android/Hermes e web gerados localmente.
- Edge: 20 cenários de histórico e 15 de regressão das curtidas aprovados, sem exceções JavaScript. Incluem confirmação pelo teclado/lupa, sugestões, resultados, deduplicação, limite, reutilização, remoção, confirmação de limpeza, reinício, contas diferentes, falhas e largura de 320 pixels.
- Artefatos temporários em dist-check/a14/, ignorada pelo Git.

Por escolha da Ana, geração e teste do APK ficam para quando o projeto estiver pronto. Nenhum novo build EAS é necessário para revisar este commit. A verificação física permanece pendente.

## Conferência final no Android

Executar estes passos na validação final do projeto, usando um APK que contenha a A14 ou etapa posterior.

1. Entre com Spotify e digite um termo sem confirmar. Confira que isso sozinho não o adiciona ao histórico.
2. Confirme pelo teclado ou pela lupa. Abra Buscas recentes e confira o termo.
3. Confirme outro termo e depois repita o primeiro variando maiúsculas e espaços. Ele deve aparecer uma única vez, no topo.
4. Selecione um termo recente. A busca deve abrir com esse termo e o filtro Tudo.
5. Remova uma entrada e confira que as demais continuam salvas.
6. Abra Limpar histórico e cancele. A lista deve permanecer.
7. Confirme a limpeza e confira o estado vazio.
8. Feche e reabra o aplicativo. Inclusões e remoções devem persistir.
9. Confira que músicas curtidas continuam presentes após limpar o histórico.
10. Se testar outra conta autorizada, confira que o histórico dela é separado.
11. Se ocorrer erro, informe a mensagem exibida sem limpar os dados do aplicativo como primeira tentativa.

## Mensagem para continuar

    Fiz o commit A14 e o push.
    Continue somente a A15 e pare antes do próximo commit.
    Manter geração e teste do APK para a conclusão do projeto.

Referência: [navegação com Expo Router](https://docs.expo.dev/router/basics/navigation/).
