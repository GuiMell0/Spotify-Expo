# Recuperação de falhas e dados locais — G13

## Sessão vencida sem conexão

Antes da G13, uma falha de rede ao renovar um token vencido retirava a conta da interface e escondia a Biblioteca local. Agora, quando existe uma sessão previamente salva e válida no armazenamento, falhas transitórias de rede, timeout, servidor ou limitação da renovação conservam sua identidade para abrir os dados locais da mesma conta.

Isso vale para a sessão já aberta e para a restauração de uma sessão salva no Android. Não permite um primeiro login offline nem usa um token vencido para consultar a API: getAccessToken continua rejeitando a consulta enquanto a renovação não for concluída.

O aviso Sem acesso ao Spotify no momento oferece Tentar reconectar ao Spotify. Durante a tentativa, o botão fica desativado. A reconexão bem-sucedida atualiza as credenciais e remove o aviso, preservando a conta e a geração dos dados locais, da busca e da fila.

Sair, trocar de conta ou receber uma rejeição definitiva da sessão continua encerrando o acesso da conta atual. Um token revogado exige nova entrada; uma resposta atrasada de renovação não restaura uma sessão encerrada. As coleções pessoais no AsyncStorage não são apagadas pelo encerramento da sessão.

## Consulta ao catálogo

ApiFeedback centraliza a mensagem segura, a opção de repetição e um caminho Abrir Biblioteca local para contas autenticadas. A política está em src/services/apiRecovery.mjs.

| Situação | Comportamento |
| --- | --- |
| Rede ou timeout | Mensagem legível, repetição manual e acesso à Biblioteca local |
| Servidor indisponível ou resposta inválida | Repetição manual; resultados já carregados são preservados pelos controladores |
| 401 persistente após renovação | Encerra a sessão e pede novo login |
| 403 | Explica a falta de permissão e oferece Biblioteca local |
| 404 | Informa conteúdo ausente ou indisponível para a conta |
| Cota esgotada | Orienta aguardar e verificar o painel; não oferece retry imediato |
| 429 | Respeita Retry-After e só habilita a repetição após o prazo |
| Lista vazia | Mostra o estado vazio da tela, sem substituir por catálogo demonstrativo |

O relógio do contador é atualizado por temporizadores do efeito React, inclusive ao receber um novo prazo de espera. Não há chamadas de horário impuras durante o render.

## Uso local

Com os dados já salvos da conta, é possível abrir e editar playlists locais, consultar curtidas, alterar curtidas e abrir metadados salvos de faixas sem conexão. Busca e catálogo novos dependem da API. Capas remotas podem não carregar sem internet.

A fila contém metadados em memória e os dados pessoais permanecem no AsyncStorage. O aplicativo não baixa arquivos de música nem reproduz áudio offline; Ouvir no Spotify mantém o comportamento da G11.

## Validação

394 testes unitários aprovados, incluindo 12 novos de recuperação. Foi atualizado o contrato do teste anterior de restauração: uma falha de rede restaura a identidade local, enquanto a obtenção do token vencido continua rejeitada.

Lint sem avisos e bundles Android/web aprovados. 36 cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript: 15 de recuperação e uso offline e 21 de regressão do player, mini-player e fila.

No navegador foram exercitados expiração por avanço do relógio, falha na renovação, edição e gravação de playlist offline, curtidas offline, reconexão, permissão, conteúdo ausente, cota, 429, lista vazia, 401 e novo login. A restauração inicial a partir de sessão persistente é coberta por testes unitários; o navegador mantém credenciais somente em memória. Os testes não usam a conta real.

## Conferência no Android somente ao concluir o projeto

1. Entrar online e salvar curtidas, buscas e uma playlist com faixas.
2. Desativar a conexão e abrir os dados locais, editar a playlist e alterar uma curtida.
3. Com a sessão vencida, reabrir o app e conferir o aviso e os dados da mesma conta.
4. Reativar a conexão, tocar em Tentar reconectar ao Spotify e repetir uma consulta que falhou.
5. Confirmar que as alterações locais permaneceram e que sair exige nova entrada.

Não gerar APK nesta etapa. Permanecem 17 telas principais. Depois do commit G13, continuar somente G14: revisão visual com StyleSheet e Flexbox.
