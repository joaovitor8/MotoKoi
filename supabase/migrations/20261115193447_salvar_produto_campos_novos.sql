-- =====================================================================
-- MotoKoi: salvar_produto passa a gravar os campos que vieram da análise dos concorrentes
--   - garantia_meses e inmetro_registro (colunas de produtos)
--   - códigos originais (tabela produto_codigos_originais), na lista "codigos"
--
-- Continua valendo o motivo da função: produto, ficha, caixa, motos e agora os códigos
-- são gravados numa transação só. A ficha técnica em PDF fica de fora, como as fotos:
-- é um arquivo, enviado à parte pelo Storage.
-- "create or replace" troca o corpo da função sem mexer em quem pode chamá-la.
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
    insert into public.produtos (nome, slug, codigo, categoria_id, resumo, descricao, status, novidade, garantia_meses, inmetro_registro)
    values (
      dados ->> 'nome',
      dados ->> 'slug',
      nullif(dados ->> 'codigo', ''),
      (dados ->> 'categoria_id')::bigint,
      nullif(dados ->> 'resumo', ''),
      nullif(dados ->> 'descricao', ''),
      dados ->> 'status',
      coalesce((dados ->> 'novidade')::boolean, false),
      (dados ->> 'garantia_meses')::smallint,
      nullif(dados ->> 'inmetro_registro', '')
    )
    returning id into v_id;
  else
    -- O slug não muda na edição: é o endereço da página, e trocar quebraria links já divulgados.
    update public.produtos set
      nome             = dados ->> 'nome',
      codigo           = nullif(dados ->> 'codigo', ''),
      categoria_id     = (dados ->> 'categoria_id')::bigint,
      resumo           = nullif(dados ->> 'resumo', ''),
      descricao        = nullif(dados ->> 'descricao', ''),
      status           = dados ->> 'status',
      novidade         = coalesce((dados ->> 'novidade')::boolean, false),
      garantia_meses   = (dados ->> 'garantia_meses')::smallint,
      inmetro_registro = nullif(dados ->> 'inmetro_registro', '')
    where id = v_id;
    if not found then
      raise exception 'Produto % não encontrado ou sem permissão para alterar', v_id using errcode = 'P0002';
    end if;

    -- Listas: apaga as linhas antigas e grava as novas, na ordem em que vieram.
    delete from public.produto_especificacoes where produto_id = v_id;
    delete from public.produto_itens_caixa where produto_id = v_id;
    delete from public.produto_motos where produto_id = v_id;
    delete from public.produto_codigos_originais where produto_id = v_id;
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

  insert into public.produto_codigos_originais (produto_id, fabricante, codigo)
  select v_id, c ->> 'fabricante', c ->> 'codigo'
  from jsonb_array_elements(coalesce(dados -> 'codigos', '[]'::jsonb)) as c;

  return v_id;
end;
$$;
