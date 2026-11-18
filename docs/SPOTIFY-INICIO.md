# Início com catálogo real — A09

A Home da conta conectada agora usa os serviços de catálogo da A07 e o cliente autenticado da A06. O APK e o login Android já foram confirmados pela Ana na A08; a Home nova deve ser conferida no aparelho.

## Conteúdo e navegação

- Temas Brasil, Rock e Indie. São pontos de exploração editorial, não recomendações pessoais nem rankings de popularidade.
- Cada tema faz uma única busca real, com até 6 músicas, 6 álbuns e 6 artistas. Não utiliza endpoints de categorias ou lançamentos removidos.
- Atalhos são montados a partir dos itens retornados pela API. Não há IDs, capas ou nomes de catálogo fictícios na Home autenticada.
- A saudação e o avatar usam os dados da sessão. Quando a foto não está disponível, aparece a inicial do nome.
- Cartões e atalhos abrem o item real nas rotas existentes. O item selecionado é lembrado em memória para que a visualização básica use seus metadados sem outra consulta desnecessária.
- Abrir um cartão não altera o termo nem o filtro da busca. Ver mais encaminha à busca com o tema atual e o tipo da seção.
- O mini-player fictício da P1 não aparece na Home autenticada. A reprodução continua nas etapas do Guilherme.
- O modo demonstração mantém a Home da P1 separada e identificada; não consulta a API.

A10 conecta a página completa de álbum, consultando detalhes e faixas pelo ID selecionado ([guia](SPOTIFY-ALBUNS.md)). A página completa de artista continua na A11. A exibição completa de playlists remotas e o perfil são etapas do Guilherme.

## Carregamento, cache e falhas

O cache permanece em memória, separado por conta e por tema, por até cinco minutos. O prazo é conferido ao trocar de tema ou voltar à tela; não existe atualização periódica em segundo plano.

Voltar de um detalhe usa o cache ainda válido. O botão Atualizar início e o gesto de puxar para atualizar forçam uma consulta nova. Solicitações repetidas durante uma mesma atualização compartilham a operação.

Ao trocar de tema ou sair da Home, a consulta pendente é cancelada. Respostas antigas não substituem o tema atual. Uma sessão nova começa com o tema Brasil e sem o cache anterior.

- Sem resultados: informa o estado vazio e oferece busca ou outro tema.
- Erro inicial: encerra carregamento e oferece recuperação manual, quando aplicável.
- Erro de atualização: preserva apenas dados reais já carregados do mesmo tema e exibe uma mensagem sobre a atualização que falhou.
- Erro em um tema novo: não reutiliza dados de outro tema e não ativa demonstração.
- 429: respeita a espera da A06, sem repetição automática.
- Depois de erro, voltar à tela não inicia um ciclo de novas tentativas.

Esse cache não é persistência local em disco. Curtidas, recentes e dados locais continuam nas etapas A12–A15.

## Arquivos

- src/services/spotifyHome.mjs: temas, consulta única, cache e estado observável.
- src/contexts/HomeContext.js: instância por conta/modo com useSyncExternalStore.
- src/screens/HomeScreen.js: interface real com StyleSheet/Flexbox, temas, cartões, atalhos e atualização.
- src/screens/DemoHomeScreen.js: Home da P1, somente em demonstração.
- spotifySearch.rememberEntity: reaproveita o item escolhido na navegação, sem modificar a pesquisa.

## Validação automática

- npm run test:home: 16 testes aprovados.
- Regressão completa: 140 testes unitários aprovados, incluindo busca, catálogo, sessão e API.
- npm run lint aprovado; bundles Android/Hermes e web gerados.
- Edge: 43 cenários com Spotify simulado aprovados, cobrindo Home, busca, login, sessão, cache, falhas, atalhos e viewport de 320 pixels, sem exceções JavaScript.
- Artefatos de validação em dist-check/a09/, ignorada pelo Git.

Os testes automatizados não acessam sua conta. A validação física da Home permanece para a Ana.

## Testar no APK já instalado

1. Execute npm run dev -- --clear e abra o aplicativo de desenvolvimento.
2. Entre com Spotify, se necessário. A Home deve exibir sua saudação e o tema Brasil.
3. Confira músicas, álbuns e artistas retornados. Se não houver imagem, deve aparecer um espaço reservado.
4. Alterne para Rock e Indie. Os resultados devem corresponder ao tema selecionado.
5. Abra um atalho de música, álbum e artista. Confira o título e volte; a Home deve conservar tema e conteúdo.
6. Toque em Ver mais de uma seção. A busca deve abrir com o termo e o filtro correspondentes.
7. Volte à Home e teste Atualizar início e o gesto de puxar para atualizar.
8. Com itens já carregados, desligue a internet e tente atualizar. Deve aparecer um erro e os itens anteriores do mesmo tema devem permanecer.
9. Reative a internet e use Tentar atualizar início.
10. Saia da conta e entre novamente: o tema deve voltar a Brasil e os dados devem ser consultados na nova sessão.

Não é necessário gerar outro APK: a A09 altera somente JavaScript. [Guia Android/EAS](ANDROID-EAS.md).

## Mensagem para continuar

    Fiz o commit A09 e o push.
    Home no Android: [funcionou / erro exato]
    Temas e atualização: [resultado]
    Atalhos e Ver mais: [resultado]
    Continue somente a A10 e pare antes do próximo commit.

Referências: [busca Spotify](https://developer.spotify.com/documentation/web-api/reference/search) e [mudanças de disponibilidade em 2026](https://developer.spotify.com/documentation/web-api/references/changes/february-2026).
