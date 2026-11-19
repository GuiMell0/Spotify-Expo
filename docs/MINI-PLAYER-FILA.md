# Mini-player e fila de seleção — G12

A faixa selecionada é compartilhada por um TrackQueueProvider acima da navegação. Home, busca, Biblioteca, curtidas, álbum e playlists locais ou Spotify utilizam useOpenTrack para selecionar a faixa e copiar a ordem das músicas carregadas na origem.

O mini-player mostra título, artista e posição da seleção nas demais telas autenticadas. Tocar nele reabre a faixa correta com a mesma fila, sem consultar novamente os metadados já disponíveis. Ele ocupa espaço próprio no layout com StyleSheet e Flexbox, sem cobrir listas ou abas. Só aparece depois de uma seleção real; o antigo componente da P1 está separado em DemoMiniPlayer e restrito à demonstração explícita.

## Comportamento da fila

- O player oferece Anterior, Próxima e escolha direta de uma música da fila. O ID da rota acompanha a seleção sem empilhar um player a cada troca.
- Os limites desativam Anterior e Próxima; não há repetição automática.
- A ordem corresponde à lista carregada no momento da seleção. Duplicatas pelo ID são removidas, preservando a primeira posição.
- A fila comporta até 300 músicas e sempre inclui a selecionada. Paginação posterior não acrescenta músicas automaticamente: selecionar novamente na origem monta uma nova fila.
- Os snapshots são cópias imutáveis. Remover uma curtida, editar uma playlist ou mudar o cache da busca não apaga os metadados da fila atual.
- Atualizar os dados da faixa preserva a posição e as demais músicas. Um ID equivalente devolvido pela API por mercado substitui a faixa atual sem duplicação.
- Uma faixa aberta diretamente que não seja a seleção atual inicia uma fila própria de um item quando seus metadados ficam disponíveis.
- A fila permanece na memória da sessão, sem gravação adicional no AsyncStorage. Trocar de conta, sair ou reiniciar o app inicia uma fila vazia; renovar a sessão da mesma conta conserva a seleção.

A fila representa escolha de músicas. Anterior e Próxima não controlam áudio. O mini-player não apresenta botão de pausa, progresso ou indicação de música tocando. Ouvir no Spotify continua abrindo o endereço da faixa selecionada, com reprodução no Spotify.

## Código

- src/services/trackQueue.mjs: snapshots, limite, deduplicação, posição e atualização.
- src/contexts/TrackQueueContext.js: estado compartilhado e isolamento por conta.
- src/hooks/useOpenTrack.js: seleção e abertura pela rota canônica.
- src/components/MiniPlayer.js: resumo da seleção real.
- src/screens/PlayerScreen.js: integração da fila, rota e metadados.

## Validação automatizada

382 testes unitários aprovados, incluindo 12 novos da fila. Lint sem avisos e bundles Android/web aprovados. 21 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript: regressão do player, fila, limites, escolha direta, mini-player, troca de abas, largura de 320 pixels, logout e outra conta.

Os testes interceptam a API e o endereço externo Spotify. Não acessam a conta real nem validam reprodução. Permanecem 17 telas principais.

## Conferência Android na conclusão do projeto

1. Abrir um álbum ou playlist com mais de uma música; selecionar uma faixa no meio da lista.
2. Conferir posição, Anterior, Próxima e seleção direta, inclusive nos limites.
3. Voltar, trocar de abas e tocar no mini-player; conferir a mesma música e fila.
4. Curtir/descurtir e editar uma playlist; a seleção já carregada deve continuar disponível.
5. Abrir Ouvir no Spotify e conferir a música escolhida no aparelho.
6. Sair e entrar novamente; não deve aparecer a seleção da sessão anterior.

Não gerar APK nesta etapa. Depois do commit G12, continuar somente G13: recuperação de falhas e uso offline.
