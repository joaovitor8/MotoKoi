-- =====================================================================
-- MotoKoi: coluna "resumo" em produtos e categorias
-- É a linha curta que as telas mostram abaixo do nome:
--   produto   -> cartões do catálogo e da Home ("43 × 16 · 428H · 118 elos")
--   categoria -> lista "A linha" da Home ("Embreagem, acelerador e velocímetro")
-- Coluna, e não tabela: cada produto ou categoria tem no máximo um resumo.
-- Pode ficar vazia, como o código, até o dono informar.
-- =====================================================================
alter table public.produtos   add column resumo text check (char_length(resumo) <= 120);
alter table public.categorias add column resumo text check (char_length(resumo) <= 120);

-- A view da contagem passa a trazer o resumo da categoria.
-- "create or replace view" só aceita coluna nova no fim da lista.
create or replace view public.categorias_com_contagem
with (security_invoker = true) as
select
  c.id,
  c.nome,
  c.slug,
  c.ordem,
  count(p.id) filter (where p.status = 'publicado') as total_publicados,
  c.resumo
from public.categorias c
left join public.produtos p on p.categoria_id = c.id
group by c.id;
