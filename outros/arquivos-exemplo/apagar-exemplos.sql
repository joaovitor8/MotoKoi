-- Remove os dados de exemplo "(EX)" do banco (rodar no SQL Editor do Supabase quando chegarem os dados reais).
-- Os textos "(EX)" escritos no código (Garantia, Seja revendedor, A marca, Privacidade) são trocados à mão.
begin;
delete from public.produtos where slug like '%-ex';                         -- os 2 produtos novos (o resto vai junto por cascade)
update public.produtos set descricao = nullif(replace(descricao, ' (EX)', ''), '');
update public.produtos set inmetro_registro = null where inmetro_registro like '(EX)%';
delete from public.produto_codigos_originais where fabricante like '%(EX)%';
update public.produto_motos set observacao = null where observacao like '(EX)%';
delete from public.pontos_venda where nome like '%(EX)%';                   -- fica só a Mac Atacado
update public.pontos_venda set horario = null where horario like '(EX)%';
delete from public.cadastros_revenda where nome_loja like '%(EX)%';
delete from public.numeros_marca where rotulo like '%(EX)%';
delete from public.depoimentos where nome like '%(EX)%';
update public.configuracoes_site set whatsapp = null;                       -- (18) 90000-0000 era de exemplo
commit;
