-- =====================================================================
-- MotoKoi: o que a análise dos concorrentes pediu
--   - código original da montadora em cada peça (busca do lojista)
--   - garantia por peça + garantia padrão da marca
--   - registro Inmetro e ficha técnica em PDF
--   - números da marca, materiais para lojista e depoimentos (editáveis no painel)
--   - busca do catálogo por termo, categoria, moto e ano
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Produtos: garantia, Inmetro e ficha técnica
-- ---------------------------------------------------------------------
alter table public.produtos
  add column garantia_meses        smallint check (garantia_meses between 1 and 120), -- vazio = usa o padrão da marca
  add column inmetro_registro      text check (char_length(inmetro_registro) between 1 and 60),
  add column ficha_tecnica_caminho text check (char_length(ficha_tecnica_caminho) between 1 and 300); -- no bucket "materiais", ex.: fichas/kit-transmissao-titan-150.pdf

-- ---------------------------------------------------------------------
-- 2. Códigos originais (uma peça pode substituir vários códigos)
-- ---------------------------------------------------------------------
create table public.produto_codigos_originais (
  id          bigint generated always as identity primary key,
  produto_id  bigint not null references public.produtos (id) on delete cascade,
  fabricante  text not null check (char_length(fabricante) between 1 and 40), -- Honda, Yamaha...
  codigo      text not null check (char_length(codigo) between 1 and 40),
  -- versão só com letras e números, para "40530-KVS-305" achar "40530KVS305"
  codigo_busca text generated always as (regexp_replace(upper(codigo), '[^A-Z0-9]', '', 'g')) stored,
  unique (produto_id, fabricante, codigo)
);
create index produto_codigos_originais_produto_id_idx on public.produto_codigos_originais (produto_id);
create index produto_codigos_originais_busca_idx on public.produto_codigos_originais (codigo_busca);

-- ---------------------------------------------------------------------
-- 3. Configurações do site (uma linha só)
-- ---------------------------------------------------------------------
create table public.configuracoes_site (
  id                     boolean primary key default true check (id), -- garante uma única linha
  garantia_meses_padrao  smallint check (garantia_meses_padrao between 1 and 120),
  garantia_prazo_resposta_dias smallint check (garantia_prazo_resposta_dias between 1 and 90),
  whatsapp               text check (whatsapp ~ '^[0-9]{10,13}$'),
  catalogo_pdf_caminho   text check (char_length(catalogo_pdf_caminho) between 1 and 300), -- no bucket "materiais"
  atualizado_em          timestamptz not null default now(),
  atualizado_por         uuid references public.perfis (id) on delete set null default auth.uid()
);
create index configuracoes_site_atualizado_por_idx on public.configuracoes_site (atualizado_por);
insert into public.configuracoes_site (id) values (true);

-- ---------------------------------------------------------------------
-- 4. Números da marca (Home e A marca)
-- ---------------------------------------------------------------------
create table public.numeros_marca (
  id         bigint generated always as identity primary key,
  valor      text not null check (char_length(valor) between 1 and 12),  -- "5.500", "+300", "12"
  rotulo     text not null check (char_length(rotulo) between 1 and 80),
  publicado  boolean not null default false,
  ordem      integer not null default 0
);
create index numeros_marca_publicados_idx on public.numeros_marca (ordem) where publicado;

-- ---------------------------------------------------------------------
-- 5. Materiais para lojista (catálogo, fotos, fichas, logo)
-- ---------------------------------------------------------------------
create table public.materiais (
  id             bigint generated always as identity primary key,
  titulo         text not null check (char_length(titulo) between 1 and 80),
  descricao      text check (char_length(descricao) <= 160),
  tipo           text not null check (tipo in ('catalogo', 'fotos', 'fichas', 'logo', 'outro')),
  caminho        text not null unique check (char_length(caminho) between 1 and 300), -- no bucket "materiais"
  tamanho_bytes  bigint check (tamanho_bytes >= 0),
  publico        boolean not null default true,
  ordem          integer not null default 0,
  atualizado_em  timestamptz not null default now()
);
create index materiais_publicos_idx on public.materiais (ordem) where publico;

-- ---------------------------------------------------------------------
-- 6. Depoimentos de revendedores (só com autorização por escrito)
-- ---------------------------------------------------------------------
create table public.depoimentos (
  id                bigint generated always as identity primary key,
  nome              text not null check (char_length(nome) between 1 and 80),
  loja              text not null check (char_length(loja) between 1 and 120),
  cidade            text not null check (char_length(cidade) between 1 and 80),
  uf                char(2) not null check (uf ~ '^[A-Z]{2}$'),
  texto             text not null check (char_length(texto) between 10 and 400),
  autorizado_em     date,       -- data da autorização por escrito
  publicado         boolean not null default false,
  ordem             integer not null default 0,
  criado_em         timestamptz not null default now(),
  -- não publica sem registrar a autorização
  check (not publicado or autorizado_em is not null)
);
create index depoimentos_publicados_idx on public.depoimentos (ordem) where publicado;

-- carimbo de atualização: a função da migração inicial passa a registrar
-- também quem mexeu nas configurações
create or replace function private.marcar_atualizacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  if tg_table_name in ('produtos', 'configuracoes_site') then
    new.atualizado_por := (select auth.uid());
  end if;
  return new;
end;
$$;
revoke execute on function private.marcar_atualizacao() from public, anon, authenticated;

create trigger configuracoes_site_marcar_atualizacao
  before update on public.configuracoes_site
  for each row execute function private.marcar_atualizacao();
create trigger materiais_marcar_atualizacao
  before update on public.materiais
  for each row execute function private.marcar_atualizacao();

-- ---------------------------------------------------------------------
-- 7. Busca do catálogo
--    buscar_produtos('titan', null, null, null)            -> por texto
--    buscar_produtos('40530-KVS', null, null, null)        -> por código original
--    buscar_produtos(null, 'transmissao', 'honda-cg-150-titan', 2012)
--    Roda com as permissões de quem chama (security invoker): visitante só vê publicados.
--    No site: supabase.rpc('buscar_produtos', {...}).select('*, categorias(nome, slug)')
-- ---------------------------------------------------------------------
create or replace function public.buscar_produtos(
  p_termo      text     default null,
  p_categoria  text     default null,  -- slug da categoria
  p_moto       text     default null,  -- slug da moto
  p_ano        smallint default null
)
returns setof public.produtos
language sql
stable
security invoker
set search_path = ''
as $$
  with t as (
    select nullif(btrim(p_termo), '') as termo,
           nullif(regexp_replace(upper(coalesce(p_termo, '')), '[^A-Z0-9]', '', 'g'), '') as cod
  )
  select p.*
  from public.produtos p
  cross join t
  where (p_categoria is null or exists (
          select 1 from public.categorias c where c.id = p.categoria_id and c.slug = p_categoria))
    and (p_moto is null and p_ano is null or exists (
          select 1
          from public.produto_motos pm
          join public.motos m on m.id = pm.moto_id
          where pm.produto_id = p.id
            and (p_moto is null or m.slug = p_moto)
            and (p_ano is null or ((pm.ano_inicio is null or pm.ano_inicio <= p_ano)
                               and (pm.ano_fim    is null or pm.ano_fim    >= p_ano)))))
    and (t.termo is null
         or p.nome ilike '%' || t.termo || '%'
         or p.codigo ilike '%' || t.termo || '%'
         or exists (select 1 from public.produto_codigos_originais co
                    where co.produto_id = p.id and t.cod is not null and co.codigo_busca like t.cod || '%')
         or exists (select 1 from public.produto_motos pm join public.motos m on m.id = pm.moto_id
                    where pm.produto_id = p.id
                      and (m.modelo ilike '%' || t.termo || '%' or m.nome_curto ilike '%' || t.termo || '%')))
  order by p.atualizado_em desc;
$$;

-- ---------------------------------------------------------------------
-- 8. Permissões
-- ---------------------------------------------------------------------
revoke all on public.produto_codigos_originais, public.configuracoes_site,
  public.numeros_marca, public.materiais, public.depoimentos from anon, authenticated;

grant select on public.produto_codigos_originais, public.configuracoes_site,
  public.numeros_marca, public.materiais, public.depoimentos to anon, authenticated;
grant insert, update, delete on public.produto_codigos_originais,
  public.numeros_marca, public.materiais, public.depoimentos to authenticated;
grant update on public.configuracoes_site to authenticated; -- linha única: não cria nem apaga

revoke execute on function public.buscar_produtos(text, text, text, smallint) from public;
grant execute on function public.buscar_produtos(text, text, text, smallint) to anon, authenticated;

alter table public.produto_codigos_originais enable row level security;
alter table public.configuracoes_site        enable row level security;
alter table public.numeros_marca             enable row level security;
alter table public.materiais                 enable row level security;
alter table public.depoimentos               enable row level security;

create policy produto_codigos_originais_ler on public.produto_codigos_originais
  for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy produto_codigos_originais_admin on public.produto_codigos_originais
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy configuracoes_site_ler on public.configuracoes_site
  for select to anon, authenticated using (true);
create policy configuracoes_site_admin on public.configuracoes_site
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy numeros_marca_ler on public.numeros_marca
  for select to anon, authenticated
  using (publicado or (select private.eh_admin()));
create policy numeros_marca_admin on public.numeros_marca
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy materiais_ler on public.materiais
  for select to anon, authenticated
  using (publico or (select private.eh_admin()));
create policy materiais_admin on public.materiais
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy depoimentos_ler on public.depoimentos
  for select to anon, authenticated
  using (publicado or (select private.eh_admin()));
create policy depoimentos_admin on public.depoimentos
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- ---------------------------------------------------------------------
-- 9. Bucket "materiais" (PDF e ZIP): download público, só admin envia
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materiais', 'materiais', true, 52428800,
        array['application/pdf', 'application/zip', 'application/x-zip-compressed', 'image/png', 'image/svg+xml'])
on conflict (id) do nothing;

create policy materiais_arquivos_admin_enviar on storage.objects
  for insert to authenticated
  with check (bucket_id = 'materiais' and (select private.eh_admin()));
create policy materiais_arquivos_admin_trocar on storage.objects
  for update to authenticated
  using (bucket_id = 'materiais' and (select private.eh_admin()))
  with check (bucket_id = 'materiais' and (select private.eh_admin()));
create policy materiais_arquivos_admin_apagar on storage.objects
  for delete to authenticated
  using (bucket_id = 'materiais' and (select private.eh_admin()));
create policy materiais_arquivos_admin_listar on storage.objects
  for select to authenticated
  using (bucket_id = 'materiais' and (select private.eh_admin()));
