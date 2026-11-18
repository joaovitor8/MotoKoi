# Site MotoKoi

Este arquivo dá o contexto do projeto para o Claude Code. Leia tudo antes de escrever código.

## 1. O que é o projeto

- **MotoKoi** é uma marca brasileira de peças para motocicletas (kit transmissão, cabos, carburadores, discos de embreagem, câmaras de ar, capas de chuva).
- O João Vitor (estudante de Ciência da Computação) está criando o site da marca por conta própria, para **apresentar e vender ao dono**. O dono ainda não viu nem aprovou nada.
- O site é um **catálogo com banco de dados próprio**, mais um **painel administrativo** para o dono cadastrar produtos sem depender de programador.
- O público principal nesta primeira versão é o **revendedor** (lojas de peças e oficinas). O motociclista comum é o segundo público.
- O dono da MotoKoi também é dono da **Mac Atacado** (macatacado.com.br), uma loja online multimarcas que já vende a linha MotoKoi.

## 2. Decisões já tomadas (não reabrir sem o João pedir)

- **Visual:** direção "Koi". Fundo branco, vermelho da marca, preto no texto. Títulos enormes em caixa alta, coroa de moto vermelha no topo da Home, padrão de ondas japonesas nas faixas vermelhas.
- **Cores da marca:** branco e vermelho. A versão com fundo preto foi avaliada e descartada.
- **Coroa da Home sem peixe.** Várias versões com um koi sobre a coroa foram testadas e o João pediu para retirar.
- **Sem animação 3D.** A ideia de um kit transmissão em 3D abrindo no scroll foi abandonada. Não construir.
- **Banco próprio:** os produtos ficam no banco do site, não vêm da Mac Atacado.
- **Idioma:** tudo em português do Brasil, inclusive mensagens de erro, textos do painel e nomes visíveis ao usuário.

## 3. Decisões em aberto (pergunte ao João antes de assumir)

1. **Vender ou só mostrar?** As telas foram desenhadas como "só mostrar": sem preço e sem carrinho. Os botões levam para "Onde comprar" e WhatsApp. Se o site for vender, Catálogo e Produto mudam e entram carrinho, pagamento e frete.
2. **Link para a Mac Atacado.** O João disse que o link para a Mac ficaria só no rodapé. A tela "Onde comprar" tem também uma faixa vermelha "Peça pelo site da Mac Atacado" e um cartão de loja da Mac. Confirmar se isso fica ou sai.
3. **Stack.** A sugestão abaixo ainda não foi confirmada por ele.
4. **Telas do painel que faltam:** Categorias, Motos e Lojas aparecem no menu do painel, mas não foram desenhadas.
5. **Versão para celular.** As telas foram desenhadas em 1440 px. O HTML já usa flex-wrap e clamp, então se adapta, mas o layout de celular não foi revisado tela a tela.

## 4. Stack sugerida

- **Next.js** (App Router) com **TypeScript**, na versão estável mais recente.
- **Supabase**: Postgres para os dados, Auth para o login do painel, Storage para as fotos dos produtos.
- **Vercel** para publicar.
- CSS: reaproveitar `design/motokoi.css` (variáveis + classes `.mk-*`). Pode virar CSS Modules ou Tailwind com os mesmos tokens, desde que o resultado visual seja o das telas.

Confira a documentação atual de cada ferramenta antes de usar; não confie em versões de memória.

## 5. Páginas e rotas

| Tela | Rota sugerida | Arquivo de referência |
|---|---|---|
| Home | `/` | `design/telas/01-home.html` |
| Catálogo | `/catalogo` | `design/telas/02-catalogo.html` |
| Página do produto | `/catalogo/[slug]` | `design/telas/03-produto.html` |
| Seja revendedor | `/seja-revendedor` | `design/telas/04-seja-revendedor.html` |
| Onde comprar | `/onde-comprar` | `design/telas/05-onde-comprar.html` |
| A marca | `/a-marca` | `design/telas/06-a-marca.html` |
| Garantia | `/garantia` | `design/telas/07-garantia.html` |
| Painel: entrar | `/painel/entrar` | `design/telas/08-painel-entrar.html` |
| Painel: produtos | `/painel/produtos` | `design/telas/09-painel-produtos.html` |
| Painel: editar produto | `/painel/produtos/[id]` | `design/telas/10-painel-editar-produto.html` |
| Painel: pedidos de revenda | `/painel/revenda` | `design/telas/11-painel-pedidos-de-revenda.html` |
| Painel: conteúdo do site | `/painel/conteudo` | `design/telas/12-painel-conteudo-do-site.html` |

Notas:
- Abra os HTML no navegador para ver o resultado esperado. Eles são a fonte da verdade do visual.
- Na Home de referência, o menu aponta para âncoras da própria página. No site, o menu leva para as páginas da tabela.
- O menu do site tem quatro itens: Catálogo, A marca, Onde comprar, Revenda. O item da página atual ganha um traço vermelho embaixo.
- O rodapé é o mesmo em todas as páginas do site e traz o link "Também à venda na Mac Atacado".

### O que cada tela faz

- **Home:** título com a busca "Qual é a sua moto?" (marca, modelo, ano) logo no topo, modelos mais buscados, link "Buscar por código"; coroa; linhas de produto; Novidades (4 produtos marcados no painel); números da marca + faixa Inmetro; faixa de revenda; rodapé.
- **Catálogo:** busca por peça, código MotoKoi, código original ou moto; filtros de categoria, moto e ano; botão "Baixar PDF" do catálogo; cartões mostram código MotoKoi e código original; ordenação; paginação.
- **Produto:** fotos, categoria, selo "Novidade", nome, código MotoKoi e código original, descrição, ficha técnica, botões "Onde comprar" e "Falar no WhatsApp", garantia (com link "Como acionar"), selo Inmetro, download da ficha técnica em PDF, chamada para lojista, tabela "Serve em", lista "Na caixa", outras peças para a mesma moto.
- **Seja revendedor:** números, três passos, formulário, depoimentos de lojistas, materiais para baixar (catálogo, fotos, fichas, logo), dúvidas frequentes.
- **Onde comprar:** filtro por estado + cidade ou CEP, abas Todos / Lojas próprias / Revendedores, lista e mapa.
- **A marca:** texto do koi, foto, história, três valores, bloco "O que garante cada peça" (garantia, Inmetro, código original, aço 1045).
- **Garantia:** prazo, o que cobre e o que não cobre, quatro passos para acionar, WhatsApp.
- **Painel:** login; lista de produtos; formulário de produto (agora com códigos originais, garantia, Inmetro e ficha técnica PDF); pedidos de revenda; Conteúdo do site (números da marca, materiais para lojista, depoimentos, garantia padrão).

## 6. Design system

Arquivos em `design/`:

- `motokoi.css`: variáveis CSS (cores, espaços, raios, sombras, fontes) e componentes `.mk-*` (botão, selo, campo, checkbox, logo, cartão de loja).
- `painel.css`: classes `.ad-*`, usadas só no painel.
- `tokens.json`: os mesmos tokens com a explicação de uso de cada um.
- `icones.json`: os 14 ícones (traço de 2 px, viewBox 24).
- `coroa.svg`: a coroa do topo da Home (43 dentes, com o padrão de ondas).
- `logo-referencia.jpg`: a logo da marca em baixa resolução, só como referência. Pedir ao dono o arquivo original em vetor.

Regras visuais que as telas seguem:

- **Cores:** vermelho `#e3141f` (marca), `#be0f18` (hover), `#9c0f16` (texto e links vermelhos sobre branco), branco `#ffffff`, texto `#151413`, cinza de fundo `#f6f6f5`. O painel usa menu lateral preto `#0b0b0a`.
- **Fontes:** Barlow Condensed 600/700/800 nos títulos, sempre em caixa alta; Barlow 400/500/600 no resto.
- **Títulos:** muito grandes, peso 800, entrelinha apertada (0,86 a 0,92).
- **Rótulo acima do título:** 12 px, caixa alta, espaçamento de letras 0,2em, em vermelho escuro.
- **Linhas:** seções e listas começam com uma linha preta de 1,5 px; itens são separados por linha cinza de 1 px.
- **Faixas vermelhas:** fundo vermelho com o padrão de ondas por cima e texto branco.
- **Cantos:** 2, 4 e 8 px. Nada muito arredondado, exceto filtros em formato de pílula.
- **Fotos:** produto em fundo claro. Onde ainda não há foto, as telas mostram um espaço cinza com o texto `[FOTO ...]`.
- **Botões:** preto para a ação principal no site, vermelho para a ação principal no painel e no envio do formulário, contorno para ações secundárias.

## 7. Banco de dados

O banco já está modelado e testado. Leia `docs/banco.md` antes de mexer nele.

- Migrações em `supabase/migrations/`, dados de desenvolvimento em `supabase/seed.sql`.
- Teste das regras de acesso e da busca: `node supabase/testes/regras-de-acesso.mjs` (54 verificações).
- Mudanças no banco entram como **nova migração**; não edite as que já foram aplicadas.
- Explique ao João o porquê de cada mudança no banco: ele está aprendendo modelagem.

Dados que as telas mostram (para conferir com o banco):

- **Produto:** nome, código, categoria, descrição, especificações em pares (ex.: Coroa = 43 dentes), motos compatíveis (modelo, anos, observação), itens da caixa, fotos em ordem com uma capa, status (publicado ou rascunho), marcação "mostrar em Novidades", data e autor da última alteração.
- **Categoria:** nome e quantidade de peças. Hoje: Transmissão, Cabos, Carburadores, Embreagem, Câmaras de ar, Capas de chuva.
- **Moto:** modelo. Aparece no filtro do catálogo, na busca por moto e na página do produto.
- **Ponto de venda:** tipo (loja própria ou revendedor), nome, endereço, cidade e estado, horário, WhatsApp, posição no mapa.
- **Cadastro de revenda:** nome da loja, CNPJ ou CPF, tipo de negócio, nome do responsável, WhatsApp, e-mail, cidade e estado, mensagem, aceite de contato, data de recebimento, situação (novo, em contato, aprovado, recusado), anotações internas.
- **Usuário do painel:** e-mail, senha, nome.
- **Códigos originais:** fabricante + código da montadora, vários por produto. A busca ignora traço e espaço.
- **Conteúdo do site:** números da marca, materiais para baixar, depoimentos (só publica com data de autorização), garantia padrão, WhatsApp, PDF do catálogo.
- **Busca do catálogo:** use a função `buscar_produtos(termo, categoria, moto, ano)`; detalhes em `docs/banco.md`.

Regras de acesso a respeitar:
- Visitante só lê produtos publicados, categorias, motos e pontos de venda.
- Visitante pode enviar um cadastro de revenda, mas não pode ler os cadastros.
- Só usuário logado no painel cria, edita e exclui. No Supabase isso é feito com RLS em todas as tabelas.
- O formulário de revenda coleta dados pessoais. O site precisa de uma página de política de privacidade e do aceite que já está no formulário. O texto jurídico deve ser revisado por quem entende de LGPD.

## 8. Informações reais já levantadas

- Instagram da marca: `@moto.koi`.
- Mac Atacado: Rua Marechal Deodoro, 1462, Araçatuba, SP. Página da linha: `https://www.macatacado.com.br/motokoi-`. Página de revendedor: `https://www.macatacado.com.br/motokoi-revendedor`.
- Números da página de revendedor da Mac: 3 lojas próprias, resposta em 48 h, sem taxa de adesão e sem mensalidade.
- Texto da caixa do kit: "Fabricado em aço 1045" e "Maior confiança, Qualidade, Durabilidade".
- Produtos vistos na Mac Atacado com a marca MotoKoi:
  - Kit Transmissão Titan 150, 43 x 16, 428H, 118 elos
  - Cabos de embreagem, acelerador e velocímetro (linha Motokoi Pro), entre eles o cabo de acelerador Titan 160 / Fan 160 / Start 160
  - Carburador Titan 150 e Carburador YBR 125 2000 a 2008
  - Discos de embreagem para Titan 150, Titan 160, Fan 160, Bros 150 e Bros 160
  - Câmara de ar aro 14 (Biz) e aro 18 (CG)
  - Capas de chuva em PVC e em nylon

## 9. O que falta e depende do dono

Tudo que está entre colchetes nas telas é espaço reservado. **Não invente esses dados.** Mantenha o colchete visível até a informação chegar.

- Códigos dos produtos, anos de cada moto compatível, descrições.
- Fotos reais das peças e das caixas (as telas usam espaços cinza).
- Número do WhatsApp.
- Nome e endereço das outras lojas e dos revendedores, horários.
- História da marca (ano, cidade, como começou).
- Respostas das dúvidas do revendedor (CNPJ, pedido mínimo, regiões de entrega, garantia).
- Confirmação dos textos de vantagem para o revendedor ("tabela exclusiva", "dá para começar com poucas peças", "atendimento direto"). Foram sugeridos no design, não vieram do dono.
- Confirmação de que o "Koi" do nome é mesmo o peixe. Todo o texto "contra a correnteza" depende disso.
- **Código original da montadora** de cada peça (ex.: código Honda). É o que o lojista mais usa para buscar.
- **Prazo de garantia** e o que ela cobre e não cobre. Os itens da página Garantia são sugestões marcadas com colchete.
- **Inmetro:** se o kit transmissão é certificado e o número do registro. Se não for, tire o selo das telas.
- **Números da marca** que dá para comprovar (peças, modelos atendidos, pontos de venda).
- **Depoimentos reais** de revendedores, com autorização por escrito.
- **Catálogo em PDF**, fotos para lojista, fichas técnicas e logo em arquivo.
- Logo original em vetor.

## 9.1 O que veio da análise dos concorrentes

Foram analisados os sites de 23 marcas que disputam o mesmo balcão (Riffel, Magnetron, Cofap, Cobreq, Pro Tork, Vaz, Tmac e outras). O que entrou no projeto por causa disso:

- Busca por moto e ano no topo da Home (Riffel e Cofap fazem; é como o lojista pensa).
- Código original da montadora em cada peça e na busca (Magnetron, Riffel).
- Página de Garantia e garantia na página do produto (Cobreq, WGK, Magnetron, Riffel).
- Números da marca e selo Inmetro, só com dado comprovável.
- Catálogo em PDF e materiais para o lojista baixar.
- Onde comprar com filtro por estado e tipo de loja (Cofap).
- Depoimentos de revendedores, só reais e autorizados.

O que não copiar: textos genéricos, rodapé com ano velho, páginas com "Lorem ipsum" ou "em construção" — vários concorrentes têm isso, e é uma vantagem da MotoKoi não ter.

## 10. Ordem de trabalho sugerida

1. Criar o projeto e publicar uma página vazia, para ter o deploy funcionando desde o início.
2. Levar os tokens e os componentes (`motokoi.css`) para o projeto. Montar cabeçalho, rodapé, botão, cartão de produto.
3. Construir as seis páginas do site com dados fixos, iguais às telas de referência.
4. Criar o projeto no Supabase, aplicar as migrações e o seed, criar o primeiro usuário do painel (passos em `docs/banco.md`).
5. Ligar Catálogo, Produto e Home (Novidades) ao banco.
6. Formulário de revenda gravando no banco.
7. Painel: login, lista de produtos, formulário de produto com envio de fotos, pedidos de revenda.
8. Revisar no celular, revisar acessibilidade (contraste, foco visível, navegação por teclado, textos alternativos).

## 11. Como trabalhar com o João

- Responder em português do Brasil.
- Ele prefere orientação direta e prática, sem detalhe demais.
- Não reescrever a mesma coisa várias vezes: se algo não agradou, perguntar o que mudar antes de refazer.
- Ao ensinar algo técnico novo, guiar com perguntas e raciocínio passo a passo.
- Antes de mudar o visual aprovado, perguntar.
- Ele pode pedir para ser guiado com perguntas ou para receber a solução pronta; siga o que ele pedir no momento.
