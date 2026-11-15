-- =====================================================================
-- MotoKoi: função salvar_produto (usada pelo formulário de produto do painel)
--
-- Por que uma função no banco: salvar um produto mexe em quatro tabelas (produtos,
-- ficha técnica, itens da caixa e motos compatíveis). Feito em chamadas separadas,
-- uma falha no meio deixaria o produto pela metade (por exemplo, sem ficha técnica).
-- Dentro de uma função tudo acontece em UMA transação: ou grava tudo, ou não grava nada.
--
-- security invoker: roda com as permissões de quem chama, então o RLS continua valendo.
-- Quem não é da equipe não consegue inserir nem alterar nada por aqui.
-- As fotos ficam de fora: são enviadas uma a uma pelo Storage.
-- =====================================================================
create or replace function public.salvar_produto(dados jsonb)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id bigint := (dados ->> 'id')::bigint;
begin
  if v_id is null then
    insert into public.produtos (nome, slug, codigo, categoria_id, resumo, descricao, status, novidade)
    values (
      dados ->> 'nome',
      dados ->> 'slug',
      nullif(dados ->> 'codigo', ''),
      (dados ->> 'categoria_id')::bigint,
      nullif(dados ->> 'resumo', ''),
      nullif(dados ->> 'descricao', ''),
      dados ->> 'status',
      coalesce((dados ->> 'novidade')::boolean, false)
    )
    returning id into v_id;
  else
    -- O slug não muda na edição: é o endereço da página, e trocar quebraria links já divulgados.
    update public.produtos set
      nome         = dados ->> 'nome',
      codigo       = nullif(dados ->> 'codigo', ''),
      categoria_id = (dados ->> 'categoria_id')::bigint,
      resumo       = nullif(dados ->> 'resumo', ''),
      descricao    = nullif(dados ->> 'descricao', ''),
      status       = dados ->> 'status',
      novidade     = coalesce((dados ->> 'novidade')::boolean, false)
    where id = v_id;
    if not found then
      raise exception 'Produto % não encontrado ou sem permissão para alterar', v_id using errcode = 'P0002';
    end if;

    -- Listas: apaga as linhas antigas e grava as novas, na ordem em que vieram.
    delete from public.produto_especificacoes where produto_id = v_id;
    delete from public.produto_itens_caixa where produto_id = v_id;
    delete from public.produto_motos where produto_id = v_id;
  end if;

  insert into public.produto_especificacoes (produto_id, rotulo, valor, ordem)
  select v_id, e ->> 'rotulo', e ->> 'valor', n
  from jsonb_array_elements(coalesce(dados -> 'especificacoes', '[]'::jsonb)) with ordinality as t(e, n);

  insert into public.produto_itens_caixa (produto_id, quantidade, descricao, ordem)
  select v_id, (i ->> 'quantidade')::integer, i ->> 'descricao', n
  from jsonb_array_elements(coalesce(dados -> 'itens', '[]'::jsonb)) with ordinality as t(i, n);

  insert into public.produto_motos (produto_id, moto_id, ano_inicio, ano_fim, observacao)
  select v_id, (m ->> 'moto_id')::bigint, (m ->> 'ano_inicio')::smallint, (m ->> 'ano_fim')::smallint, nullif(m ->> 'observacao', '')
  from jsonb_array_elements(coalesce(dados -> 'motos', '[]'::jsonb)) as m;

  return v_id;
end;
$$;

-- Função em "public" pode ser chamada pela API. Tira o acesso geral e libera só para quem fez login;
-- mesmo assim, o RLS das tabelas barra quem não é da equipe.
revoke execute on function public.salvar_produto(jsonb) from public, anon;
grant execute on function public.salvar_produto(jsonb) to authenticated;
