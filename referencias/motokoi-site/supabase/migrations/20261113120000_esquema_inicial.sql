-- =====================================================================
-- MotoKoi: esquema inicial do banco (Supabase / Postgres)
-- Catálogo de peças + painel administrativo + cadastros de revenda.
-- O site só MOSTRA produtos (sem preço, carrinho ou pedidos de compra).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Esquema privado para funções internas (não fica exposto na API)
-- ---------------------------------------------------------------------
create schema if not exists private;

-- ---------------------------------------------------------------------
-- 1. Usuários do painel
-- Cada pessoa da equipe é um usuário do Supabase Auth (auth.users).
-- Só quem também está em "perfis" e com ativo = true entra no painel.
-- Cadastro de perfis é feito pelo SQL Editor (ver docs/banco.md).
-- ---------------------------------------------------------------------
create table public.perfis (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null check (char_length(nome) between 1 and 120),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- Diz se quem está chamando é administrador do painel.
-- security definer: lê "perfis" sem esbarrar no RLS da própria tabela.
create or replace function private.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis p
    where p.id = (select auth.uid())
      and p.ativo
  );
$$;

-- ---------------------------------------------------------------------
-- 2. Categorias (Transmissão, Cabos, Carburadores...)
-- ---------------------------------------------------------------------
create table public.categorias (
  id          bigint generated always as identity primary key,
  nome        text not null unique check (char_length(nome) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ordem       integer not null default 0,
  criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Motos (usadas no filtro do catálogo e na compatibilidade)
-- ---------------------------------------------------------------------
create table public.motos (
  id          bigint generated always as identity primary key,
  fabricante  text not null check (char_length(fabricante) between 1 and 60),
  modelo      text not null check (char_length(modelo) between 1 and 80),   -- ex.: CG 150 Titan
  nome_curto  text not null check (char_length(nome_curto) between 1 and 40), -- ex.: Titan 150 (filtros e chips)
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  ordem       integer not null default 0,
  criado_em   timestamptz not null default now(),
  unique (fabricante, modelo)
);

-- ---------------------------------------------------------------------
-- 4. Produtos
-- ---------------------------------------------------------------------
create table public.produtos (
  id              bigint generated always as identity primary key,
  nome            text not null check (char_length(nome) between 1 and 160),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  codigo          text unique check (char_length(codigo) between 1 and 40), -- código da caixa; pode ficar vazio até o dono informar
  categoria_id    bigint not null references public.categorias (id) on delete restrict,
  descricao       text check (char_length(descricao) <= 2000),
  status          text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  novidade        boolean not null default false, -- aparece em "Novidades" na Home
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  atualizado_por  uuid references public.perfis (id) on delete set null default auth.uid()
);
create index produtos_categoria_id_idx on public.produtos (categoria_id);
create index produtos_atualizado_por_idx on public.produtos (atualizado_por);
-- Catálogo público e Novidades só leem produtos publicados
create index produtos_publicados_idx on public.produtos (atualizado_em desc) where status = 'publicado';

-- Ficha técnica: pares "Coroa = 43 dentes", em ordem
create table public.produto_especificacoes (
  id          bigint generated always as identity primary key,
  produto_id  bigint not null references public.produtos (id) on delete cascade,
  rotulo      text not null check (char_length(rotulo) between 1 and 60),
  valor       text not null check (char_length(valor) between 1 and 120),
  ordem       integer not null default 0
);
create index produto_especificacoes_produto_id_idx on public.produto_especificacoes (produto_id, ordem);

-- O que vem na caixa: "1 × Coroa de 43 dentes"
create table public.produto_itens_caixa (
  id          bigint generated always as identity primary key,
  produto_id  bigint not null references public.produtos (id) on delete cascade,
  quantidade  integer not null default 1 check (quantidade > 0),
  descricao   text not null check (char_length(descricao) between 1 and 120),
  ordem       integer not null default 0
);
create index produto_itens_caixa_produto_id_idx on public.produto_itens_caixa (produto_id, ordem);

-- Fotos: o arquivo fica no Storage (bucket "produtos"); aqui só o caminho.
-- A foto de menor "ordem" é a capa.
create table public.produto_fotos (
  id                 bigint generated always as identity primary key,
  produto_id         bigint not null references public.produtos (id) on delete cascade,
  caminho            text not null unique check (char_length(caminho) between 1 and 300), -- ex.: kit-transmissao-titan-150/1.webp
  texto_alternativo  text check (char_length(texto_alternativo) <= 200),
  ordem              integer not null default 0,
  criado_em          timestamptz not null default now()
);
create index produto_fotos_produto_id_idx on public.produto_fotos (produto_id, ordem);

-- Compatibilidade produto × moto (muitos para muitos)
create table public.produto_motos (
  produto_id  bigint not null references public.produtos (id) on delete cascade,
  moto_id     bigint not null references public.motos (id) on delete restrict,
  ano_inicio  smallint check (ano_inicio between 1950 and 2100),
  ano_fim     smallint check (ano_fim between 1950 and 2100),
  observacao  text check (char_length(observacao) <= 200),
  primary key (produto_id, moto_id),
  check (ano_fim is null or ano_inicio is null or ano_fim >= ano_inicio)
);
-- A PK já cobre buscas por produto; este índice cobre "peças para esta moto"
create index produto_motos_moto_id_idx on public.produto_motos (moto_id);

-- ---------------------------------------------------------------------
-- 5. Pontos de venda (lojas próprias e revendedores)
-- ---------------------------------------------------------------------
create table public.pontos_venda (
  id          bigint generated always as identity primary key,
  tipo        text not null check (tipo in ('loja_propria', 'revendedor')),
  nome        text not null check (char_length(nome) between 1 and 120),
  endereco    text not null check (char_length(endereco) between 1 and 200),
  cidade      text not null check (char_length(cidade) between 1 and 80),
  uf          text not null check (uf ~ '^[A-Z]{2}$'),
  cep         text check (cep ~ '^[0-9]{5}-?[0-9]{3}$'),
  horario     text check (char_length(horario) <= 200),
  whatsapp    text check (char_length(whatsapp) <= 20),
  latitude    numeric(9, 6) check (latitude between -90 and 90),
  longitude   numeric(9, 6) check (longitude between -180 and 180),
  ativo       boolean not null default true,
  ordem       integer not null default 0,
  criado_em   timestamptz not null default now()
);
create index pontos_venda_uf_cidade_idx on public.pontos_venda (uf, cidade) where ativo;

-- ---------------------------------------------------------------------
-- 6. Cadastros de revenda (formulário "Seja revendedor")
-- Visitante pode ENVIAR; só o painel pode LER e MUDAR.
-- ---------------------------------------------------------------------
create table public.cadastros_revenda (
  id              bigint generated always as identity primary key,
  nome_loja       text not null check (char_length(nome_loja) between 1 and 120),
  documento       text not null check (documento ~ '^[0-9./-]{11,18}$'), -- CNPJ ou CPF
  tipo_negocio    text not null check (tipo_negocio in ('loja_pecas', 'oficina', 'distribuidor', 'outro')),
  responsavel     text not null check (char_length(responsavel) between 1 and 120),
  whatsapp        text not null check (char_length(whatsapp) between 8 and 20),
  email           text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 160),
  cidade          text not null check (char_length(cidade) between 1 and 80),
  uf              text not null check (uf ~ '^[A-Z]{2}$'),
  mensagem        text check (char_length(mensagem) <= 2000),
  aceite_contato  boolean not null check (aceite_contato), -- o formulário exige o aceite (LGPD)
  situacao        text not null default 'novo' check (situacao in ('novo', 'em_contato', 'aprovado', 'recusado')),
  anotacoes       text check (char_length(anotacoes) <= 4000), -- só a equipe vê
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);
create index cadastros_revenda_situacao_idx on public.cadastros_revenda (situacao, criado_em desc);

-- ---------------------------------------------------------------------
-- 7. Atualização automática de "atualizado_em" / "atualizado_por"
-- ---------------------------------------------------------------------
create or replace function private.marcar_atualizacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  if tg_table_name = 'produtos' then
    new.atualizado_por := (select auth.uid());
  end if;
  return new;
end;
$$;

create trigger produtos_marcar_atualizacao
  before update on public.produtos
  for each row execute function private.marcar_atualizacao();

create trigger cadastros_revenda_marcar_atualizacao
  before update on public.cadastros_revenda
  for each row execute function private.marcar_atualizacao();

-- ---------------------------------------------------------------------
-- 8. Contagem de peças publicadas por categoria (barra lateral do catálogo)
-- security_invoker: a view respeita o RLS de quem consulta.
-- ---------------------------------------------------------------------
create view public.categorias_com_contagem
with (security_invoker = true) as
select
  c.id,
  c.nome,
  c.slug,
  c.ordem,
  count(p.id) filter (where p.status = 'publicado') as total_publicados
from public.categorias c
left join public.produtos p on p.categoria_id = c.id
group by c.id;

-- ---------------------------------------------------------------------
-- 9. Permissões
-- anon = visitante; authenticated = usuário logado (pode ou não ser admin).
-- Começa sem nada e libera só o necessário; o RLS decide as linhas.
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant usage on schema private to anon, authenticated;
grant execute on function private.eh_admin() to anon, authenticated;
revoke execute on function private.marcar_atualizacao() from public, anon, authenticated;

-- Leitura pública do catálogo
grant select on
  public.categorias, public.motos, public.produtos,
  public.produto_especificacoes, public.produto_itens_caixa,
  public.produto_fotos, public.produto_motos, public.pontos_venda,
  public.categorias_com_contagem
to anon, authenticated;

-- Escrita no catálogo: só usuário logado (o RLS exige ser admin)
grant insert, update, delete on
  public.categorias, public.motos, public.produtos,
  public.produto_especificacoes, public.produto_itens_caixa,
  public.produto_fotos, public.produto_motos, public.pontos_venda
to authenticated;

-- Formulário de revenda: visitante só preenche as colunas do formulário
grant insert (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, mensagem, aceite_contato)
  on public.cadastros_revenda to anon, authenticated;
grant select, update, delete on public.cadastros_revenda to authenticated;

grant select on public.perfis to authenticated;

-- ---------------------------------------------------------------------
-- 10. RLS (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.perfis                  enable row level security;
alter table public.categorias              enable row level security;
alter table public.motos                   enable row level security;
alter table public.produtos                enable row level security;
alter table public.produto_especificacoes  enable row level security;
alter table public.produto_itens_caixa     enable row level security;
alter table public.produto_fotos           enable row level security;
alter table public.produto_motos           enable row level security;
alter table public.pontos_venda            enable row level security;
alter table public.cadastros_revenda       enable row level security;

-- Perfis: cada um vê o próprio; admin vê todos. Criar/editar só pelo SQL Editor.
create policy perfis_ler on public.perfis
  for select to authenticated
  using (id = (select auth.uid()) or (select private.eh_admin()));

-- Categorias e motos: todo mundo lê; admin escreve
create policy categorias_ler on public.categorias
  for select to anon, authenticated using (true);
create policy categorias_admin on public.categorias
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy motos_ler on public.motos
  for select to anon, authenticated using (true);
create policy motos_admin on public.motos
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Produtos: visitante vê só publicados; admin vê e escreve tudo
create policy produtos_ler on public.produtos
  for select to anon, authenticated
  using (status = 'publicado' or (select private.eh_admin()));
create policy produtos_admin on public.produtos
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Tabelas filhas: seguem a visibilidade do produto
create policy produto_especificacoes_ler on public.produto_especificacoes
  for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy produto_especificacoes_admin on public.produto_especificacoes
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy produto_itens_caixa_ler on public.produto_itens_caixa
  for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy produto_itens_caixa_admin on public.produto_itens_caixa
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy produto_fotos_ler on public.produto_fotos
  for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy produto_fotos_admin on public.produto_fotos
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

create policy produto_motos_ler on public.produto_motos
  for select to anon, authenticated
  using (exists (select 1 from public.produtos p where p.id = produto_id));
create policy produto_motos_admin on public.produto_motos
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Pontos de venda: visitante vê os ativos; admin vê e escreve tudo
create policy pontos_venda_ler on public.pontos_venda
  for select to anon, authenticated
  using (ativo or (select private.eh_admin()));
create policy pontos_venda_admin on public.pontos_venda
  for all to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));

-- Cadastros de revenda: qualquer um envia (sempre como "novo"); só admin lê e muda
create policy cadastros_revenda_enviar on public.cadastros_revenda
  for insert to anon, authenticated
  with check (situacao = 'novo' and anotacoes is null);
create policy cadastros_revenda_admin_ler on public.cadastros_revenda
  for select to authenticated
  using ((select private.eh_admin()));
create policy cadastros_revenda_admin_mudar on public.cadastros_revenda
  for update to authenticated
  using ((select private.eh_admin())) with check ((select private.eh_admin()));
create policy cadastros_revenda_admin_apagar on public.cadastros_revenda
  for delete to authenticated
  using ((select private.eh_admin()));
