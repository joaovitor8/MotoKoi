-- =====================================================================
-- MotoKoi: dados iniciais para DESENVOLVIMENTO
-- Nomes e medidas vêm dos produtos MotoKoi vistos na Mac Atacado.
-- Códigos, anos, fotos e descrições ficam vazios até o dono informar.
-- Antes de ir para produção, revise com o dono e troque o que for preciso.
-- =====================================================================

insert into public.categorias (nome, slug, ordem, resumo) values
  ('Transmissão',    'transmissao',    1, 'Kit Transmissão Titan 150 · 43 × 16 · 428H'),
  ('Cabos',          'cabos',          2, 'Embreagem, acelerador e velocímetro'),
  ('Carburadores',   'carburadores',   3, 'Titan 150 e YBR 125'),
  ('Embreagem',      'embreagem',      4, 'Discos para Titan, Fan e Bros'),
  ('Câmaras de ar',  'camaras-de-ar',  5, 'Aro 14 e aro 18'),
  ('Capas de chuva', 'capas-de-chuva', 6, 'PVC e nylon');

insert into public.motos (fabricante, modelo, nome_curto, slug, ordem) values
  ('Honda',  'CG 150 Titan',  'Titan 150', 'honda-cg-150-titan',  1),
  ('Honda',  'CG 160 Titan',  'Titan 160', 'honda-cg-160-titan',  2),
  ('Honda',  'CG 160 Fan',    'Fan 160',   'honda-cg-160-fan',    3),
  ('Honda',  'CG 160 Start',  'Start 160', 'honda-cg-160-start',  4),
  ('Honda',  'NXR 150 Bros',  'Bros 150',  'honda-nxr-150-bros',  5),
  ('Honda',  'NXR 160 Bros',  'Bros 160',  'honda-nxr-160-bros',  6),
  ('Honda',  'Biz',           'Biz',       'honda-biz',           7), -- confirmar versões (100, 110i, 125)
  ('Honda',  'CG',            'CG',        'honda-cg',            8), -- genérico p/ câmara aro 18; confirmar modelos
  ('Yamaha', 'YBR 125',       'YBR 125',   'yamaha-ybr-125',      9);

-- Produtos (publicados para o catálogo de desenvolvimento ter conteúdo)
-- "novidade" segue a tela da Home: Kit, Disco 160, Carburador YBR e Cabo de Acelerador.
insert into public.produtos (nome, slug, categoria_id, resumo, descricao, status, novidade)
select v.nome, v.slug, c.id, v.resumo, v.descricao, 'publicado', v.novidade
from (values
  ('Kit Transmissão Titan 150', 'kit-transmissao-titan-150', 'transmissao', '43 × 16 · 428H · 118 elos',
   'Corrente, coroa e pinhão na mesma caixa. As três peças trabalham e se desgastam juntas, por isso a troca é do kit inteiro.', true),
  ('Disco de Embreagem Titan 150', 'disco-de-embreagem-titan-150', 'embreagem', 'Linha Motokoi Pro', null, false),
  ('Disco de Embreagem Titan 160 / Fan 160 / Bros 160', 'disco-de-embreagem-titan-160-fan-160-bros-160', 'embreagem', 'Linha Motokoi Pro', null, true),
  ('Carburador Titan 150', 'carburador-titan-150', 'carburadores', 'Linha Motokoi Pro', null, false),
  ('Carburador YBR 125 2000 a 2008', 'carburador-ybr-125-2000-a-2008', 'carburadores', 'Linha Motokoi Pro', null, true),
  ('Cabo de Acelerador Titan 160 / Fan 160 / Start 160', 'cabo-de-acelerador-titan-160-fan-160-start-160', 'cabos', 'Linha Motokoi Pro', null, true),
  ('Câmara de Ar Aro 18', 'camara-de-ar-aro-18', 'camaras-de-ar', 'Para CG', null, false),
  ('Câmara de Ar Aro 14', 'camara-de-ar-aro-14', 'camaras-de-ar', 'Para Biz', null, false),
  ('Capa de Chuva PVC', 'capa-de-chuva-pvc', 'capas-de-chuva', 'Conjunto jaqueta e calça', null, false)
) as v(nome, slug, categoria_slug, resumo, descricao, novidade)
join public.categorias c on c.slug = v.categoria_slug;

-- Ficha técnica do kit
insert into public.produto_especificacoes (produto_id, rotulo, valor, ordem)
select p.id, v.rotulo, v.valor, v.ordem
from public.produtos p
cross join (values
  ('Coroa', '43 dentes', 1),
  ('Pinhão', '16 dentes', 2),
  ('Corrente', '428H · 118 elos', 3),
  ('Material', 'Aço 1045', 4)
) as v(rotulo, valor, ordem)
where p.slug = 'kit-transmissao-titan-150';

-- Itens da caixa do kit
insert into public.produto_itens_caixa (produto_id, quantidade, descricao, ordem)
select p.id, 1, v.descricao, v.ordem
from public.produtos p
cross join (values
  ('Coroa de 43 dentes', 1),
  ('Pinhão de 16 dentes', 2),
  ('Corrente 428H com 118 elos', 3)
) as v(descricao, ordem)
where p.slug = 'kit-transmissao-titan-150';

-- Compatibilidade (anos ficam vazios até o dono confirmar)
insert into public.produto_motos (produto_id, moto_id, ano_inicio, ano_fim, observacao)
select p.id, m.id, v.ano_inicio, v.ano_fim, null
from (values
  ('kit-transmissao-titan-150',                       'honda-cg-150-titan', null::smallint, null::smallint),
  ('disco-de-embreagem-titan-150',                    'honda-cg-150-titan', null, null),
  ('disco-de-embreagem-titan-160-fan-160-bros-160',   'honda-cg-160-titan', null, null),
  ('disco-de-embreagem-titan-160-fan-160-bros-160',   'honda-cg-160-fan',   null, null),
  ('disco-de-embreagem-titan-160-fan-160-bros-160',   'honda-nxr-160-bros', null, null),
  ('carburador-titan-150',                            'honda-cg-150-titan', null, null),
  ('carburador-ybr-125-2000-a-2008',                  'yamaha-ybr-125',     2000, 2008),
  ('cabo-de-acelerador-titan-160-fan-160-start-160',  'honda-cg-160-titan', null, null),
  ('cabo-de-acelerador-titan-160-fan-160-start-160',  'honda-cg-160-fan',   null, null),
  ('cabo-de-acelerador-titan-160-fan-160-start-160',  'honda-cg-160-start', null, null),
  ('camara-de-ar-aro-18',                             'honda-cg',           null, null),
  ('camara-de-ar-aro-14',                             'honda-biz',          null, null)
) as v(produto_slug, moto_slug, ano_inicio, ano_fim)
join public.produtos p on p.slug = v.produto_slug
join public.motos m on m.slug = v.moto_slug;

-- Ponto de venda conhecido
insert into public.pontos_venda (tipo, nome, endereco, cidade, uf, ordem)
values ('loja_propria', 'Mac Atacado', 'Rua Marechal Deodoro, 1462', 'Araçatuba', 'SP', 1);

-- Números da marca: entram como rascunho; o dono preenche e publica no painel
insert into public.numeros_marca (valor, rotulo, publicado, ordem) values
  ('[N]', 'peças no catálogo',                                false, 1),
  ('[N]', 'modelos de moto atendidos',                        false, 2),
  ('[N]', 'pontos de venda',                                  false, 3),
  ('[N]', 'meses de garantia contra defeito de fabricação',   false, 4);
