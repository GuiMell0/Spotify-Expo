# Apelido local — G09

Perfil → Editar apelido local abre /profile/edit, a 16ª tela principal. O formulário salva um nome de 1 a 80 caracteres, normaliza espaços e permite cancelar sem gravação. Usar nome do Spotify remove explicitamente a preferência local.

O apelido aparece no perfil e na saudação da Home; também é usado na inicial da Biblioteca quando não há foto. O perfil continua identificando o nome real no Spotify quando existe apelido. Nenhuma alteração é enviada à conta Spotify.

O serviço src/services/localDisplayName.mjs usa preferences.displayName no registro AsyncStorage já existente, sem migração. As demais preferências, curtidas, playlists, recentes e artistas acompanhados são preservados. Cada conta tem seu próprio valor.

Salvar só retorna ao perfil após confirmar a gravação. Falhas preservam o nome anterior e o texto digitado, com recuperação pelo aviso global. Durante a gravação os controles ficam indisponíveis; respostas após sair da tela não abrem o perfil indevidamente. A demonstração não permite editar dados pessoais.

## Validação

354 testes unitários aprovados, incluindo oito novos de validação, restauração, reset, preservação e isolamento. 354 testes unitários, lint e bundles Android/web aprovados; onze cenários de navegador com Spotify simulado aprovados, sem exceções JavaScript. Os cenários cobrem acesso protegido, validação, cancelamento, normalização, sincronização, reabertura, falha e recuperação, reset, contas distintas, largura de 320 pixels e demonstração.

## Conferência Android somente no final

Salvar um apelido, conferir perfil e Home, fechar e reabrir, cancelar outro nome e voltar ao nome do Spotify. Conferir outra conta e um nome longo no aparelho. Não gerar APK nesta etapa.

Depois do commit G09, continuar somente G10: configurações e preferências persistentes.
