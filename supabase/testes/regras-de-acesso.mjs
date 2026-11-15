import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import { fileURLToPath } from 'url';
// Uso: npm install @electric-sql/pglite && node supabase/testes/regras-de-acesso.mjs
// fileURLToPath: o .pathname da URL quebra no Windows e em pastas com espaço
const S = fileURLToPath(new URL('../', import.meta.url));
const db = new PGlite();
let ok = 0, falhas = 0;
const t = (nome, cond, extra='') => { if (cond) { ok++; console.log('  ok  ', nome); } else { falhas++; console.log('  FALHOU', nome, extra); } };
async function como(papel, uid, fn) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false); set role ${papel};`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
}
async function erro(sql) { try { const r = await db.query(sql); return { erro: null, r }; } catch (e) { return { erro: e.message }; } }

// Simula o que o Supabase já traz pronto: auth.users, auth.uid(), papéis anon/authenticated e o Storage
await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth; create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated; grant select, insert, update, delete on storage.objects to authenticated;
`);
for (const f of fs.readdirSync(S + 'migrations').sort()) { await db.exec(fs.readFileSync(S + 'migrations/' + f, 'utf8')); console.log('migração aplicada:', f); }
await db.exec(fs.readFileSync(S + 'seed.sql', 'utf8')); console.log('seed aplicado');

const ADMIN = '11111111-1111-1111-1111-111111111111', COMUM = '22222222-2222-2222-2222-222222222222';
await db.exec(`insert into auth.users values ('${ADMIN}'), ('${COMUM}'); insert into public.perfis (id, nome) values ('${ADMIN}', 'Dono');`);
await db.exec(`update public.produtos set status = 'rascunho' where slug = 'capa-de-chuva-pvc';`);

console.log('\nVisitante (anon)');
await como('anon', null, async () => {
  const p = await db.query(`select count(*)::int n from public.produtos`); t('vê só produtos publicados (8 de 9)', p.rows[0].n === 8, p.rows[0].n);
  const nov = await db.query(`select nome from public.produtos where novidade and status='publicado' order by atualizado_em desc limit 4`); t('Novidades da Home trazem 4', nov.rows.length === 4);
  const f = await db.query(`select p.nome from public.produtos p join public.produto_motos pm on pm.produto_id=p.id join public.motos m on m.id=pm.moto_id where m.slug='honda-cg-150-titan' order by p.nome`); t('filtro por moto (Titan 150) acha 3 peças', f.rows.length === 3, JSON.stringify(f.rows));
  const e = await db.query(`select count(*)::int n from public.produto_especificacoes`); t('lê a ficha técnica do kit', e.rows[0].n === 4);
  const c = await db.query(`select nome, total_publicados::int n from public.categorias_com_contagem order by ordem`); t('contagem por categoria (capas = 0, rascunho não conta)', c.rows.find(r=>r.nome==='Capas de chuva').n === 0 && c.rows.find(r=>r.nome==='Embreagem').n === 2, JSON.stringify(c.rows));
  const rs = await db.query(`select (select resumo from public.categorias_com_contagem where slug='cabos') c, (select resumo from public.produtos where slug='camara-de-ar-aro-14') p`); t('lê o resumo da categoria (pela view) e do produto', rs.rows[0].c === 'Embreagem, acelerador e velocímetro' && rs.rows[0].p === 'Para Biz', JSON.stringify(rs.rows));
  const ins = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, mensagem, aceite_contato) values ('Loja Teste','12.345.678/0001-90','loja_pecas','Fulano','18999990000','a@b.com','Presidente Prudente','SP','Oi',true)`); t('envia cadastro de revenda', !ins.erro, ins.erro);
  const sit = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato, situacao) values ('X','12345678901','oficina','F','18999990000','a@b.com','C','SP',true,'aprovado')`); t('não consegue se auto-aprovar (coluna situacao bloqueada)', !!sit.erro, sit.erro);
  const sem = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato) values ('X','12345678901','oficina','F','18999990000','a@b.com','C','SP',false)`); t('cadastro sem aceite é recusado', !!sem.erro);
  const em = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato) values ('X','12345678901','oficina','F','18999990000','nao-e-email','C','SP',true)`); t('e-mail inválido é recusado', !!em.erro);
  const le = await erro(`select count(*)::int n from public.cadastros_revenda`); t('não lê os cadastros', !!le.erro, JSON.stringify(le.r?.rows));
  const up = await erro(`update public.produtos set nome='hack'`); t('não edita produtos', !!up.erro || up.r.affectedRows === 0, up.erro);
  const pf = await erro(`select * from public.perfis`); t('não lê perfis', !!pf.erro);
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','x.webp')`); t('não envia foto', !!st.erro);
  const sp = await erro(`select public.salvar_produto('{"nome":"Hack","slug":"hack","categoria_id":1,"status":"publicado"}')`); t('não chama salvar_produto', !!sp.erro);
});

console.log('\nUsuário logado que NÃO é da equipe');
await como('authenticated', COMUM, async () => {
  const p = await db.query(`select count(*)::int n from public.produtos`); t('vê só publicados', p.rows[0].n === 8);
  const le = await db.query(`select count(*)::int n from public.cadastros_revenda`); t('não vê cadastros (0 linhas)', le.rows[0].n === 0);
  const up = await erro(`update public.produtos set nome='hack' where slug='carburador-titan-150'`); t('não edita produtos (0 linhas)', !!up.erro || up.r.affectedRows === 0);
  const ins = await erro(`insert into public.categorias (nome, slug) values ('Hack','hack')`); t('não cria categoria', !!ins.erro);
  const sp = await erro(`select public.salvar_produto('{"nome":"Hack","slug":"hack","categoria_id":1,"status":"publicado"}')`); t('salvar_produto não cria produto', !!sp.erro, JSON.stringify(sp.r?.rows));
  const se = await erro(`select public.salvar_produto(jsonb_build_object('id', (select id from public.produtos where slug='carburador-titan-150'), 'nome','Hack','categoria_id',1,'status','publicado'))`); t('salvar_produto não altera produto', !!se.erro, JSON.stringify(se.r?.rows));
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','x.webp')`); t('não envia foto', !!st.erro);
});

console.log('\nAdmin (dono)');
await como('authenticated', ADMIN, async () => {
  const p = await db.query(`select count(*)::int n from public.produtos`); t('vê também o rascunho (9)', p.rows[0].n === 9);
  const le = await db.query(`select count(*)::int n from public.cadastros_revenda`); t('lê os cadastros de revenda', le.rows[0].n === 1);
  const up = await db.query(`update public.cadastros_revenda set situacao='em_contato', anotacoes='Ligar sexta' returning atualizado_em > criado_em as mudou`); t('muda situação e anota', up.rows.length === 1);
  const np = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'Teste', 'teste', id from public.categorias where slug='cabos' returning atualizado_por`); t('cria produto (sai como rascunho, com autor)', !np.erro && np.r.rows[0].atualizado_por === ADMIN, np.erro || JSON.stringify(np.r.rows));
  const ed = await db.query(`update public.produtos set status='publicado' where slug='teste' returning atualizado_por`); t('publica e registra quem alterou', ed.rows[0].atualizado_por === ADMIN);
  const cab = (await db.query(`select id from public.categorias where slug='cabos'`)).rows[0].id, tit = (await db.query(`select id from public.motos where slug='honda-cg-150-titan'`)).rows[0].id;
  const cria = await erro(`select public.salvar_produto('${JSON.stringify({ nome: 'Cabo Novo', slug: 'cabo-novo', codigo: 'MK-1', categoria_id: cab, resumo: 'Linha Pro', status: 'rascunho', novidade: true, especificacoes: [{ rotulo: 'Comprimento', valor: '1 m' }, { rotulo: 'Capa', valor: 'PVC' }], itens: [{ quantidade: 2, descricao: 'Cabo' }], motos: [{ moto_id: tit, ano_inicio: 2004, ano_fim: 2008, observacao: 'Só ES' }] })}'::jsonb) id`);
  const novoId = cria.r?.rows[0].id;
  const f1 = novoId && (await db.query(`select (select count(*)::int from public.produto_especificacoes where produto_id=${novoId}) e, (select count(*)::int from public.produto_itens_caixa where produto_id=${novoId}) i, (select ano_fim from public.produto_motos where produto_id=${novoId}) ano, (select atualizado_por from public.produtos where id=${novoId}) autor`)).rows[0];
  t('salvar_produto cria produto com ficha, caixa e moto', !cria.erro && f1.e === 2 && f1.i === 1 && f1.ano === 2008 && f1.autor === ADMIN, cria.erro || JSON.stringify(f1));
  const edita = await erro(`select public.salvar_produto('${JSON.stringify({ id: novoId, nome: 'Cabo Novo 2', slug: 'ignorado', categoria_id: cab, status: 'publicado', especificacoes: [{ rotulo: 'Capa', valor: 'Nylon' }] })}'::jsonb)`);
  const f2 = (await db.query(`select nome, slug, status, codigo, (select count(*)::int from public.produto_especificacoes where produto_id=${novoId}) e, (select count(*)::int from public.produto_motos where produto_id=${novoId}) m from public.produtos where id=${novoId}`)).rows[0];
  t('salvar_produto edita, troca as listas e mantém o slug', !edita.erro && f2.nome === 'Cabo Novo 2' && f2.slug === 'cabo-novo' && f2.status === 'publicado' && f2.codigo === null && f2.e === 1 && f2.m === 0, edita.erro || JSON.stringify(f2));
  const ruim = await erro(`select public.salvar_produto('${JSON.stringify({ id: novoId, nome: 'Cabo Novo 3', categoria_id: cab, status: 'publicado', especificacoes: [{ rotulo: '', valor: 'x' }] })}'::jsonb)`);
  const f3 = (await db.query(`select nome, (select count(*)::int from public.produto_especificacoes where produto_id=${novoId}) e from public.produtos where id=${novoId}`)).rows[0];
  t('salvar_produto com linha inválida não grava nada (transação)', !!ruim.erro && f3.nome === 'Cabo Novo 2' && f3.e === 1, JSON.stringify(f3));
  await db.query(`delete from public.produtos where id=${novoId}`); // limpa o produto de teste para não afetar as contagens abaixo
  const sl = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'X', 'Slug Errado', id from public.categorias limit 1`); t('slug fora do padrão é recusado', !!sl.erro);
  const dup = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'X', 'teste', id from public.categorias limit 1`); t('slug repetido é recusado', !!dup.erro);
  const del = await erro(`delete from public.categorias where slug='cabos'`); t('não apaga categoria que ainda tem produtos', !!del.erro);
  await db.query(`delete from public.produtos where slug='kit-transmissao-titan-150'`); const filhos = await db.query(`select (select count(*) from public.produto_especificacoes)::int e, (select count(*) from public.produto_itens_caixa)::int i`); t('apagar produto leva junto ficha e itens da caixa', filhos.rows[0].e === 0 && filhos.rows[0].i === 0);
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','kit/1.webp')`); t('envia foto', !st.erro, st.erro);
  const st2 = await erro(`insert into storage.objects (bucket_id, name) values ('outro','x.webp')`); t('não envia foto para outro bucket', !!st2.erro);
});

const fk = await db.query(`select conrelid::regclass::text t, a.attname c from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.contype='f' and connamespace='public'::regnamespace and not exists (select 1 from pg_index i where i.indrelid=c.conrelid and a.attnum = i.indkey[0])`);
t('toda chave estrangeira tem índice', fk.rows.length === 0, JSON.stringify(fk.rows));
console.log(`\n${ok} ok, ${falhas} falhas`);
process.exit(falhas ? 1 : 0);
