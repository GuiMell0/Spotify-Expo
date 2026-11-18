# Armazenamento local — A12

A12 instala @react-native-async-storage/async-storage 2.2.0, conforme a versão indicada pelo SDK 57 deste projeto, e integra a restauração dos dados locais à conta conectada.

O armazenamento é uma base compartilhada para as próximas etapas: curtidas na A13, recentes na A14, biblioteca na A15 e funcionalidades locais da dupla. Essas telas e seus controles continuam nos respectivos commits.

## Dados e isolamento

A chave é @spotify-expo/local/ seguida do ID da conta codificado com encodeURIComponent. O registro JSON possui version: 1, accountId e data.

| Campo em data | Conteúdo |
| --- | --- |
| likedTracks | Lista de { track, savedAt }. track é um modelo Spotify normalizado. |
| recentSearches | Lista de { term, searchedAt }, sem termos duplicados ignorando maiúsculas/minúsculas. |
| playlists | Lista de { id, name, createdAt, updatedAt, tracks }. IDs locais são independentes dos IDs Spotify. |
| followedArtists | Lista de { artist, savedAt }, com modelo normalizado do artista. |
| preferences | { displayName: null, libraryView: 'grid', librarySort: 'recent' } como padrão. |

As datas são números inteiros em milissegundos. Os modelos de faixa guardam apenas metadados selecionados: identidade, créditos, álbum resumido, duração e disponibilidade. URLs e rotas são reconstruídas pelos normalizadores da A07. Páginas completas do catálogo e campos extras não são gravados.

AsyncStorage não é criptografado. Tokens de acesso e renovação continuam exclusivamente no armazenamento de sessão da A05, com SecureStore no Android. Não guardar credenciais em data.

- Uma conta recebe uma instância de estado própria.
- Sair remove os dados da interface e preserva a biblioteca no disco para a próxima entrada da mesma conta.
- Outra conta lê sua própria chave.
- Login sem conta e demonstração não acessam registros pessoais.
- Não é usado AsyncStorage.clear(), nem há exclusão automática diante de erro.
- A fila coordena esta execução do app; não há sincronização entre dispositivos ou entre abas simultâneas.

## Hidratação, validação e gravação

LocalDataProvider acompanha a sessão e carrega o registro ao entrar. O catálogo pode continuar funcionando enquanto os dados locais carregam ou apresentam falha.

- Registro inexistente: oferece padrões vazios em memória, sem gravar automaticamente.
- JSON inválido, conta incompatível ou estrutura desconhecida: preserva o registro e bloqueia alterações.
- Outra versão: preserva o registro e pede atualização. Uma migração futura deverá ser explícita e testada antes de mudar a versão.
- Leitura com erro: não trata a falha como biblioteca vazia e não grava por cima.
- Alteração: lê a versão atual no disco, aplica uma função síncrona, valida e grava o registro inteiro em uma única chave.
- Alterações concorrentes da mesma conta aguardam a anterior. Outra conta possui fila independente.
- A interface só recebe o novo estado depois da confirmação da gravação.
- Falha de gravação: mantém o último estado confirmado e bloqueia novas alterações até a recuperação.
- Espera de cinco segundos: encerra o carregamento da interface. Uma operação nativa já iniciada pode terminar depois; a fila continua acompanhando essa operação antes de uma nova leitura.
- Sair ou substituir a conta: descarta respostas antigas e impede alterações que ainda não começaram.

Os dados são imutáveis no estado. Limites iniciais: 500 curtidas, 20 buscas, 50 playlists com até 300 faixas cada, 200 artistas e 1.000.000 bytes por registro. Duplicatas, datas inválidas, IDs Spotify fictícios e preferências desconhecidas são rejeitados.

## Contrato para as próximas etapas

Use useLocalData(), que retorna localData e state. Os estados são disabled, idle, loading, ready, saving e error. state.data é null antes da restauração e enquanto estiver desativado.

Para gravar, use localData.update(current => novoObjeto). A função deve ser síncrona e usar current, que representa os dados mais recentes. Exemplo de contrato:

    const { localData, state } = useLocalData();
    await localData.update(current => ({
      ...current,
      preferences: { ...current.preferences, libraryView: 'list' },
    }));

A alteração acima demonstra o contrato; o controle visual será conectado em sua etapa. Trate a Promise retornada. Só permita mudanças quando houver dados carregados e status ready ou saving. Em erro, localData.retry() recarrega o disco antes de liberar novas alterações.

Não montar uma atualização com uma cópia antiga de state.data: use o argumento current para evitar perda de mudanças concorrentes. Não modificar arrays ou objetos diretamente.

## Arquivos

- src/storage/localDataSchema.mjs: versão, modelos compactos, validação, limites e chave.
- src/storage/localDataRepository.mjs: driver, filas por conta, leitura e gravação.
- src/storage/localDataStore.mjs: hidratação e estado observável.
- src/storage/localDataErrors.mjs: erros com mensagens seguras.
- src/storage/localData.js: carregamento tardio do módulo e repositório compartilhado.
- src/contexts/LocalDataContext.js: instância vinculada à sessão.
- src/components/LocalDataNotice.js: aviso de falha e tentativa manual.
- app/_layout.js: provider e aviso integrados ao aplicativo.
- tests/local-data.test.mjs: testes da persistência.

## Validação automática

- npm run test:storage: 30 testes aprovados.
- Regressão completa: 210 testes unitários aprovados.
- npm run lint e npx expo install --check aprovados.
- Bundles Android/Hermes e web gerados.
- Edge: 81 cenários com Spotify simulado aprovados (8 novos), sem exceções JavaScript. Incluem registro corrompido, recuperação manual, restauração após recarregar, falha de leitura, logout, troca de conta, versão futura e demonstração isolada.
- Artefatos temporários em dist-check/a12/, ignorada pelo Git.

Os testes não acessam sua conta Spotify. O bundle Android verifica a compilação JavaScript; a instalação do módulo nativo precisa ser conferida no APK atualizado.

## Gerar e testar o APK da A12

1. Na pasta do projeto, execute:

       npx eas-cli@latest build --platform android --profile development

2. Acompanhe o link do EAS. Quando concluir, baixe e instale o APK no Android usando o mesmo projeto e assinatura já utilizados. Prefira atualizar a instalação existente para preservar os dados do aplicativo.
3. Se o terminal solicitar login ou vinculação da conta Expo, faça isso no próprio terminal. O [guia EAS](ANDROID-EAS.md) descreve esses passos.
4. Inicie o servidor:

       npm run dev -- --clear

5. Abra o APK atualizado e entre com Spotify, se necessário. Confira se a Home carrega sem aviso de falha dos dados salvos.
6. Visite busca, álbum e artista; saia e entre novamente. A navegação deve continuar funcionando.
7. Se aparecer que o aplicativo instalado precisa ser atualizado, confira se instalou o APK novo. O APK antigo não recebe o módulo por uma atualização do Metro.
8. Se persistir uma mensagem, informe o texto e em qual passo ocorreu. Não desinstale nem limpe dados como tentativa inicial.
9. A verificação visível de curtir, fechar e reabrir será feita na A13, quando o botão e a tela de favoritas estiverem conectados.

Não é necessário modificar Client ID, redirect URI ou gerar outro app no Spotify. A nova compilação serve para incluir o módulo nativo do armazenamento.

## Mensagem para continuar

    Fiz o commit A12 e o push.
    APK atualizado com AsyncStorage: [instalado / build em andamento / erro exato]
    Home e entrada na conta: [resultado]
    Aviso de dados salvos: [não apareceu / mensagem]
    Continue somente a A13 e pare antes do próximo commit.

Referências: [AsyncStorage no Expo](https://docs.expo.dev/versions/latest/sdk/async-storage/) e [implementação oficial](https://github.com/react-native-async-storage/async-storage).
