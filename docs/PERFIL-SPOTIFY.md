# Perfil real da conta — G08

O perfil autenticado consulta /me e mostra nome, foto disponível e identificação da conta atual. Sem nome, usa o ID; sem foto ou em caso de imagem quebrada, usa uma inicial. Seguidores aparecem somente se a API fornecer uma contagem válida. Não há contagem inventada de pessoas seguindo.

A tela permite atualizar o perfil, abrir o perfil no Spotify, consultar e paginar playlists reais e sair da conta. Botões falsos de edição, configuração e mini-player foram retirados da tela autenticada. A edição local e as configurações continuam nas próximas etapas G09/G10. A demonstração da P1 fica separada em DemoProfileScreen.

O serviço src/services/spotifyProfile.mjs valida se /me corresponde ao usuário da sessão, normaliza somente os campos usados e ignora email, país e demais informações desnecessárias. As consultas são canceladas ao sair e respostas antigas não substituem outra conta.

Durante o carregamento, a identificação pode vir da sessão existente. Falha preserva o último perfil confirmado ou a identificação da sessão e oferece recuperação. Logout continua disponível mesmo quando perfil ou playlists falham. A foto é recarregada pela consulta e não exige alterar o registro compacto de credenciais.

## Validação

346 testes unitários aprovados, incluindo oito novos de normalização, campos ausentes, imagens, identidade, concorrência, recuperação e isolamento. 346 testes unitários, lint e bundles Android/web aprovados; dez cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários conferem dados reais, playlists, nome e foto ausentes, imagem quebrada, falhas e recuperação, nome longo em 320 pixels, troca de conta e demonstração.

## Conferência Android somente no final

Conferir nome, imagem, playlists e logout com a conta autorizada. Testar atualização e recuperação sem rede; verificar uma conta sem imagem ou nome, se disponível. Conferir nome longo e outra conta. Não gerar APK nesta etapa.

A G08 reutiliza o perfil existente: permanecem 15 telas principais. Após o commit G08, continuar somente G09: edição do apelido local persistente.
