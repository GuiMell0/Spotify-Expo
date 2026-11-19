# Player com faixa real — G11

O player autenticado usa o trackId da rota para mostrar a faixa correta, capa disponível, artistas, duração e links para álbum e artista. Curtidas e inclusão em playlists locais reutilizam os recursos existentes.

Ouvir no Spotify abre o endereço HTTPS canônico da faixa. No Android, a abertura fica a cargo do sistema e do Spotify instalado ou navegador. A reprodução acontece no Spotify: o clone não reproduz áudio, não simula progresso, não apresenta letras inventadas e não indica que uma música esteja tocando.

Metadados selecionados, curtidas e faixas de playlists locais são aproveitados antes de uma consulta. Se não houver dados salvos, o catálogo carrega a faixa pela API. Atualização, erro, cancelamento e resposta antiga são tratados pelo controlador src/services/spotifyTrack.mjs.

O controlador retém os metadados ao navegar para álbum/artista e ao remover uma curtida. Um cache local que termine de carregar depois da consulta pode fornecer a faixa e cancelar a resposta antiga. Dados de outro ID não são usados como seleção. Sem ID ou com parâmetro inválido, o modo autenticado não cai na demonstração da P1.

O endereço externo é construído pelo ID válido e não por uma URL arbitrária recebida no objeto. Falha de abertura mostra uma mensagem e permite repetir. A demonstração antiga está separada em DemoPlayerScreen e só é usada na escolha explícita de demonstração.

## Validação

370 testes unitários aprovados, incluindo oito novos de seleção, cache, URL, falha de abertura, cancelamento, atualização e manutenção dos metadados. Lint e bundles Android/web aprovados. Onze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript: faixa e duração, link canônico, falha e nova tentativa de abertura, curtida, recuperação da consulta, troca de faixa, álbum/artista, descurtida sem rede, largura de 320 pixels, inclusão em playlist e ausência de alterações remotas. Os testes externos interceptam o endereço Spotify e não tocam áudio nem usam a conta real.

## Conferência Android somente ao final do projeto

Abrir duas faixas distintas, conferir capa, artistas e duração, curtir/descurtir e adicionar a uma playlist. Conferir links de álbum e artista e voltar à música. Tocar em Ouvir no Spotify e conferir o destino no aparelho. Se necessário, iniciar a reprodução no próprio Spotify.

Testar uma abertura sem faixa e um ID inválido com a sessão restaurada no aplicativo. Não gerar APK nesta etapa.

Permanecem 17 telas principais. Depois do commit G11, continuar somente G12: estado compartilhado da seleção, mini-player e fila. Não simular áudio tocando.
