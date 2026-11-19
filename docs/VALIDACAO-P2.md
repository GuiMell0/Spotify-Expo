# Validação final da P2 — G15

Iniciada em 19/11/2026 após conferir o commit G14: 6b781cd. O código funcional está preparado para a conferência final; G15 ainda não está concluída.

## Verificações realizadas

| Item | Resultado |
| --- | --- |
| npm test | 394 testes aprovados; zero falhas, cancelamentos ou testes ignorados |
| npm run lint | Aprovado sem avisos |
| Expo install --check | Dependências compatíveis |
| Expo Doctor | 21/21 verificações aprovadas |
| Bundles Android e web | Reexportados e aprovados na G15 após corrigir o atalho da Biblioteca |
| Navegador com Spotify simulado | 76 cenários da G14; cinco testes específicos aprovados na G15 para o atalho da Biblioteca |
| Quantidade de telas | 17 telas principais, conferidas em 320 e 768 pixels |
| Entrada e navegação | Expo Router em app/, Tabs, Stack e rotas dinâmicas; sem App.js concorrente |
| Dados locais | AsyncStorage por conta; SecureStore para a sessão Android |
| Arquivos e histórico | Nenhum arquivo sensível rastreado ou padrão verificado de token Spotify/chave privada encontrado |
| APK final | IN_PROGRESS — [Acompanhar no Expo](https://expo.dev/accounts/anacgsx/projects/spotify-static-clone/builds/f5579691-0b9f-474b-8ed6-d7b431781385) |
| Teste físico final | Ana confirmou instalação, login, catálogo, persistência, recursos locais, player e teclado; atalho da Biblioteca na Home foi corrigido no código e aguarda confirmação no APK atualizado |
| Vídeo e links de entrega | Pendentes |

A busca por credenciais verificou arquivos sensíveis rastreados e padrões de tokens Spotify extensos e cabeçalhos de chave privada, incluindo histórico Git. Checksums npm em formato SHA-512/SHA-1 foram distinguidos de tokens; o .env pessoal não foi lido. Isso é uma verificação delimitada, não uma garantia de ausência de qualquer segredo possível.

Os testes de navegador interceptam a API e a abertura externa. Os resultados de teclado por viewport não comprovam os eventos do teclado nativo, os insets reais ou o TalkBack. O login real Android já havia sido confirmado na A08; Ana confirmou os resultados físicos abaixo no APK G14/G15. Os itens não executados permanecem separados.

## Histórico e requisitos

Na abertura da G15: 58 commits totais. Ana Carolina: 29. Guilherme/GuiMell0: 29, reunindo os identificadores já presentes no histórico. São 15 commits A e 14 commits G desde os 29 iniciais. Depois de G15, a previsão é 59 totais, com 15 etapas em cada sequência.

A contagem trata da autoria registrada no Git. Os integrantes devem garantir que ela represente suas contribuições reais. Não alterar autores nem reescrever a P1 para ajustar números.

StyleSheet/Flexbox, navegação, API, armazenamento local e quantidade de telas estão implementados e passaram pela validação automatizada. A aceitação final no Android depende dos resultados reais, das permissões da conta e do APK instalado.

## Instalação

Seguir INSTALAR-NO-CELULAR.md. Usar o APK preview independente, que abre sem Metro. Atualizar a instalação existente quando possível. Se o Android apresentar conflito de assinatura ou erro, enviar a mensagem antes de desinstalar, para preservar os dados locais.

## Checklist do Android

Marcar apenas depois de executar no APK final.

- [x] APK instalado e aberto sem Metro nem computador conectado.
- [x] Login Spotify concluído e cancelamento retorna ao aplicativo.
- [x] Fechar e reabrir restaura a conta; Sair e reabrir mantém o login.
- [x] Home e busca carregam dados reais; dois termos/IDs mostram conteúdos diferentes.
- [x] Álbum carrega faixas e artista carrega discografia.
- [x] Biblioteca abre uma playlist Spotify permitida e seus detalhes; acesso negado tem mensagem legível.
- [x] Curtir e descurtir atualiza as telas; curtidas sobrevivem ao reinício.
- [x] Histórico salva, repete, remove e limpa termos com confirmação.
- [x] Criar uma playlist local, adicionar duas faixas e impedir repetição da mesma música.
- [x] Renomear, remover uma faixa e excluir uma playlist de teste com confirmação.
- [x] Playlists locais sobrevivem ao reinício.
- [x] Acompanhar artista localmente e encontrá-lo na Biblioteca.
- [x] Apelido, grade/lista e ordenação persistem; limpeza seletiva preserva os demais grupos.
- [x] Mini-player reabre a faixa correta; fila, anterior, próxima e voltar preservam a seleção.
- [x] Ouvir no Spotify abre a música escolhida no Spotify ou navegador.
- [x] Sem conexão, dados locais salvos continuam acessíveis e editáveis. (obs: botão "abrir biblioteca local" na tela inicial não funciona)
- [ ] Com o token vencido e sem rede, reabrir mantém a conta local e apresenta reconexão; ao voltar a rede, a tentativa manual recupera o catálogo. Não testado no aparelho, conforme informado pela Ana.
- [ ] Sair e entrar em outra conta autorizada não mistura coleções nem fila. (não testado)
- [x] Teclado não cobre salvar/cancelar; mini-player recolhe durante a digitação.
- [ ] Áreas seguras, nomes longos, fonte ampliada e TalkBack permitem operar as telas. (não testado)

O teste com token vencido pode exigir aguardar sua validade real terminar. Não alterar o relógio do Android nem inserir tokens manuais para forçar esse estado. Se não for executado, registrar como não testado.

Se só houver uma conta autorizada disponível, registrar a troca de conta como não testada no aparelho. A cobertura simulada não substitui esse resultado.

## Resultado recebido da Ana

A Ana confirmou no APK instalado: abertura sem Metro, login/cancelamento, restauração e saída, catálogo real, playlists Spotify, curtidas, histórico, CRUD de playlists locais, artistas locais, preferências, fila, abertura no Spotify e comportamento do teclado.

Os dados locais puderam ser acessados e editados sem conexão. Foi relatada uma falha específica: Abrir Biblioteca local não troca da Home para a Biblioteca. A correção usa navegação de abas quando o aviso está em (tabs) e retorno por pilha nas telas de detalhes. Lint, bundles Android/web e cinco cenários específicos de navegador passaram. Foram testados Home antes de visitar a Biblioteca, Home após a visita, Busca e retorno pelo Player, sem exceções JavaScript. Será necessário atualizar o APK e confirmar o caminho corrigido no Android.

Token vencido offline, troca de conta e a conferência completa de áreas seguras/fonte ampliada/TalkBack não foram executados no aparelho. A cobertura automatizada desses casos não os transforma em testes físicos aprovados.

O ícone solicitado depois dos testes foi acrescentado ao app.json, com arquivos em assets/icons e versionCode Android 2. A próxima compilação reúne o ícone e a correção de navegação; sua aparência no launcher e o botão ainda precisam ser confirmados na atualização.

## Se aparecer um problema

Informar a tela, a ação anterior, o texto exato do erro e se a conexão estava ativa. Não enviar tokens, senha, Client Secret ou o conteúdo de .env.

403 normalmente requer verificar permissões da conta e acesso ao conteúdo no Spotify; um erro de compilação precisa do link do build. Tratar o resultado observado antes de marcar a etapa como concluída.

## Resposta para continuar

    APK final instalado e abre sozinho: sim/não
    Login e restauração: ok/erro/não testado
    Home, busca, álbum e artista: ok/erro
    Playlists Spotify: ok/acesso negado/erro
    Curtidas, histórico e playlists locais após reinício: ok/erro
    Perfil, preferências e artistas locais: ok/erro
    Mini-player, fila e abrir no Spotify: ok/erro
    Uso offline: ok/erro/não testado
    Token vencido offline e troca de conta: ok/erro/não testado
    Teclado, áreas seguras e acessibilidade: ok/erro/não testado
    Problema encontrado: tela + ação + mensagem, se houver

Depois da conferência, corrigir eventuais falhas, registrar os resultados reais e preparar o commit G15. O roteiro do vídeo está em ROTEIRO-VIDEO.md.
