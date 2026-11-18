# Músicas curtidas — A13

A13 conecta as faixas reais à persistência da A12 e cria a rota /liked. O aplicativo passa a ter 10 telas principais; recentes e as telas da dupla continuam no roteiro.

## Como funciona

- Busca, lista de faixas do álbum e detalhes da faixa possuem botão de curtir/descurtir.
- Biblioteca → Músicas curtidas abre a nova tela e informa a quantidade salva.
- Os corações e o contador refletem o mesmo estado da conta.
- A gravação é local neste aparelho. Não modifica a biblioteca da conta no aplicativo oficial do Spotify e não solicita novos escopos OAuth.
- Cada ID de faixa aparece apenas uma vez nas favoritas. Curtir novamente preserva a entrada existente.
- A lista apresenta as curtidas mais recentes primeiro.
- Os metadados são guardados no momento da curtida: título, artista, álbum disponível, imagem, duração e rotas reais.
- Tocar em uma música salva abre seus metadados; voltar conserva a lista.
- O modo demonstração mantém suas telas da P1 e não grava favoritas da conta.
- A remoção atualiza o registro e continua removida ao reabrir.
- Sem favoritas, a tela oferece Buscar músicas.

A lista e os metadados salvos podem ser acessados sem consultar a API, com uma sessão válida. A restauração de sessão expirada e a experiência offline completa continuam nas etapas previstas. A reprodução permanece na parte do Guilherme.

## Confirmação e falhas

O coração só muda depois que o armazenamento confirma a gravação. Enquanto salva, novos toques ficam bloqueados para impedir operações repetidas.

O mecanismo da A12 lê o registro atual a cada alteração, preservando os outros grupos de dados. JSON corrompido, leitura com erro ou versão desconhecida bloqueiam alterações sem substituir o registro por uma biblioteca vazia.

Em falha de gravação, a interface conserva a última lista confirmada. O aviso global oferece Tentar novamente para recarregar os dados antes de uma nova alteração. A listagem vazia é apresentada somente depois de um carregamento concluído.

As contas usam chaves diferentes. Sair remove os dados da interface e conserva a lista no disco para uma nova entrada da mesma conta. O limite inicial de 500 curtidas segue o contrato da A12.

## Arquivos

- src/services/likedTracks.mjs: inclusão e remoção por ID, snapshots e ordem de exibição.
- src/hooks/useLikedTracks.js: acesso ao estado compartilhado e gravação.
- src/components/LikeTrackButton.js: coração e indicação de gravação.
- src/components/LikedTracksShortcut.js: entrada da biblioteca e contador.
- src/screens/LikedScreen.js e app/liked.js: nova tela com StyleSheet/Flexbox e FlatList.
- AlbumScreen, SearchScreen e CatalogEntityPreview: botões e metadados salvos.
- tests/liked-tracks.test.mjs: regras e integração com a persistência.

A Biblioteca geral ainda será integrada completamente na A15. Nesta etapa foi incluído o acesso às músicas curtidas.

## Validação automática

- npm run test:likes: 16 testes aprovados.
- Regressão completa: 226 testes unitários aprovados.
- npm run lint aprovado.
- Bundles Android/Hermes e web gerados.
- Edge: 15 cenários específicos aprovados, sem exceções JavaScript, cobrindo sincronização entre telas, contador, ordem, restauração, remoção, uso sem rede com sessão válida, falhas de escrita/leitura, toques repetidos, contas distintas e largura de 320 pixels.
- Os fluxos anteriores de login, sessão, busca, Home, álbuns, artistas e armazenamento também foram conferidos em regressão.
- Artefatos temporários em dist-check/a13/, ignorada pelo Git.

O teste físico no Android continua pendente. Os testes não acessam a conta da Ana.

## Conferir no Android

Para o APK independente, estas mudanças precisam estar incluídas em uma nova compilação do perfil preview. O build solicitado antes da A13 contém a A12; ele não recebe novas telas automaticamente. O [guia de instalação](INSTALAR-NO-CELULAR.md) descreve essa modalidade.

Para quem utiliza um APK de desenvolvimento com AsyncStorage já incluído, npm run dev -- --clear carrega o código da A13 pelo Metro. A13 não adiciona outro módulo nativo.

1. Entre com Spotify e pesquise uma música.
2. Toque no coração na busca. Ele deve mudar após o salvamento, mantendo a pesquisa aberta.
3. Abra os detalhes da mesma faixa e confira que o coração está marcado.
4. Abra um álbum e curta outra faixa.
5. Vá a Biblioteca → Músicas curtidas. Confira as músicas e o contador.
6. Abra uma faixa salva e volte à lista.
7. Feche e reabra o aplicativo. As favoritas devem permanecer.
8. Descurta uma faixa, feche e reabra. Ela deve continuar removida.
9. Remova a última faixa e confira o estado vazio e o botão Buscar músicas.
10. Se testar outra conta autorizada, confirme que ela não recebe as favoritas da primeira.
11. Se aparecer aviso de armazenamento, informe o texto. Não limpe os dados ou desinstale como tentativa inicial.

## Mensagem para continuar

    Fiz o commit A13 e o push.
    Versão do APK instalada: [A12 / A13 / desenvolvimento com Metro]
    Curtir na busca, no álbum e nos detalhes: [resultado]
    Favoritas depois de fechar e abrir: [resultado]
    Remoção e troca de conta: [resultado]
    Continue somente a A14 e pare antes do próximo commit.
