import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
// Uso: npm install @electric-sql/pglite && node supabase/testes/regras-de-acesso.mjs
const S = new URL('../', import.meta.url).pathname;
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
  const ins = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, mensagem, aceite_contato) values ('Loja Teste','12.345.678/0001-90','loja_pecas','Fulano','18999990000','a@b.com','Presidente Prudente','SP','Oi',true)`); t('envia cadastro de revenda', !ins.erro, ins.erro);
  const sit = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato, situacao) values ('X','12345678901','oficina','F','18999990000','a@b.com','C','SP',true,'aprovado')`); t('não consegue se auto-aprovar (coluna situacao bloqueada)', !!sit.erro, sit.erro);
  const sem = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato) values ('X','12345678901','oficina','F','18999990000','a@b.com','C','SP',false)`); t('cadastro sem aceite é recusado', !!sem.erro);
  const em = await erro(`insert into public.cadastros_revenda (nome_loja, documento, tipo_negocio, responsavel, whatsapp, email, cidade, uf, aceite_contato) values ('X','12345678901','oficina','F','18999990000','nao-e-email','C','SP',true)`); t('e-mail inválido é recusado', !!em.erro);
  const le = await erro(`select count(*)::int n from public.cadastros_revenda`); t('não lê os cadastros', !!le.erro, JSON.stringify(le.r?.rows));
  const up = await erro(`update public.produtos set nome='hack'`); t('não edita produtos', !!up.erro || up.r.affectedRows === 0, up.erro);
  const pf = await erro(`select * from public.perfis`); t('não lê perfis', !!pf.erro);
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','x.webp')`); t('não envia foto', !!st.erro);
});

console.log('\nUsuário logado que NÃO é da equipe');
await como('authenticated', COMUM, async () => {
  const p = await db.query(`select count(*)::int n from public.produtos`); t('vê só publicados', p.rows[0].n === 8);
  const le = await db.query(`select count(*)::int n from public.cadastros_revenda`); t('não vê cadastros (0 linhas)', le.rows[0].n === 0);
  const up = await erro(`update public.produtos set nome='hack' where slug='carburador-titan-150'`); t('não edita produtos (0 linhas)', !!up.erro || up.r.affectedRows === 0);
  const ins = await erro(`insert into public.categorias (nome, slug) values ('Hack','hack')`); t('não cria categoria', !!ins.erro);
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','x.webp')`); t('não envia foto', !!st.erro);
});

console.log('\nAdmin (dono)');
await como('authenticated', ADMIN, async () => {
  const p = await db.query(`select count(*)::int n from public.produtos`); t('vê também o rascunho (9)', p.rows[0].n === 9);
  const le = await db.query(`select count(*)::int n from public.cadastros_revenda`); t('lê os cadastros de revenda', le.rows[0].n === 1);
  const up = await db.query(`update public.cadastros_revenda set situacao='em_contato', anotacoes='Ligar sexta' returning atualizado_em > criado_em as mudou`); t('muda situação e anota', up.rows.length === 1);
  const np = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'Teste', 'teste', id from public.categorias where slug='cabos' returning atualizado_por`); t('cria produto (sai como rascunho, com autor)', !np.erro && np.r.rows[0].atualizado_por === ADMIN, np.erro || JSON.stringify(np.r.rows));
  const ed = await db.query(`update public.produtos set status='publicado' where slug='teste' returning atualizado_por`); t('publica e registra quem alterou', ed.rows[0].atualizado_por === ADMIN);
  const sl = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'X', 'Slug Errado', id from public.categorias limit 1`); t('slug fora do padrão é recusado', !!sl.erro);
  const dup = await erro(`insert into public.produtos (nome, slug, categoria_id) select 'X', 'teste', id from public.categorias limit 1`); t('slug repetido é recusado', !!dup.erro);
  const del = await erro(`delete from public.categorias where slug='cabos'`); t('não apaga categoria que ainda tem produtos', !!del.erro);
  const dp = await db.query(`delete from public.produtos where slug='kit-transmissao-titan-150'`); const filhos = await db.query(`select (select count(*) from public.produto_especificacoes)::int e, (select count(*) from public.produto_itens_caixa)::int i`); t('apagar produto leva junto ficha e itens da caixa', filhos.rows[0].e === 0 && filhos.rows[0].i === 0);
  const st = await erro(`insert into storage.objects (bucket_id, name) values ('produtos','kit/1.webp')`); t('envia foto', !st.erro, st.erro);
  const st2 = await erro(`insert into storage.objects (bucket_id, name) values ('outro','x.webp')`); t('não envia foto para outro bucket', !!st2.erro);
});

console.log('\nConcorrência: códigos originais, busca, garantia, conteúdo');
await como('authenticated', ADMIN, async () => {
  const co = await erro(`insert into public.produto_codigos_originais (produto_id, fabricante, codigo) select id, 'Honda', '16100-KVS-J01' from public.produtos where slug='carburador-titan-150' returning codigo_busca`);
  t('admin cadastra código original (normaliza para busca)', !co.erro && co.r.rows[0].codigo_busca === '16100KVSJ01', co.erro || JSON.stringify(co.r?.rows));
  const g = await erro(`update public.produtos set garantia_meses = 6, inmetro_registro = '001234/2026' where slug='carburador-titan-150'`); t('admin define garantia e Inmetro do produto', !g.erro, g.erro);
  const cfg = await db.query(`update public.configuracoes_site set garantia_meses_padrao = 3, garantia_prazo_resposta_dias = 10 returning atualizado_por`); t('admin muda garantia padrão (registra autor)', cfg.rows[0].atualizado_por === ADMIN);
  const dep = await erro(`insert into public.depoimentos (nome, loja, cidade, uf, texto, publicado) values ('João','Loja X','Araçatuba','SP','Peça boa, cliente volta.', true)`); t('depoimento publicado sem autorização é recusado', !!dep.erro);
  const dep2 = await erro(`insert into public.depoimentos (nome, loja, cidade, uf, texto, autorizado_em, publicado) values ('João','Loja X','Araçatuba','SP','Peça boa, cliente volta.', current_date, true)`); t('depoimento com autorização é publicado', !dep2.erro, dep2.erro);
  await db.exec(`insert into public.depoimentos (nome, loja, cidade, uf, texto) values ('Maria','Loja Y','Birigui','SP','Ainda esperando autorização.')`);
  await db.exec(`update public.numeros_marca set valor='120', publicado=true where ordem=1`);
  await db.exec(`insert into public.materiais (titulo, tipo, caminho, publico) values ('Catálogo completo','catalogo','catalogo/motokoi.pdf',true), ('Rascunho','outro','x/rascunho.pdf',false)`);
  const nova = await erro(`insert into public.configuracoes_site (id) values (true)`); t('configurações têm uma linha só', !!nova.erro);
  const pdf = await erro(`insert into storage.objects (bucket_id, name) values ('materiais','catalogo/motokoi.pdf')`); t('admin envia PDF para materiais', !pdf.erro, pdf.erro);
});
await como('anon', null, async () => {
  const q = async (...a) => (await db.query(`select slug from public.buscar_produtos($1, $2, $3, $4) order by slug`, a)).rows.map(r => r.slug);
  t('busca por código original com traço', (await q('16100-kvs', null, null, null)).join() === 'carburador-titan-150');
  t('busca por código original sem traço', (await q('16100KVSJ01', null, null, null)).join() === 'carburador-titan-150');
  t('busca por nome da moto (Biz)', (await q('biz', null, null, null)).join() === 'camara-de-ar-aro-14');
  t('busca por texto no nome', (await q('carburador', null, null, null)).length === 2);
  t('filtro categoria + moto', (await q(null, 'embreagem', 'honda-cg-150-titan', null)).join() === 'disco-de-embreagem-titan-150');
  const ybr = await q(null, null, 'yamaha-ybr-125', 2005), ybr2 = await q(null, null, 'yamaha-ybr-125', 2012);
  t('filtro por ano respeita a faixa (YBR 2000–2008)', ybr.length === 1 && ybr2.length === 0, JSON.stringify([ybr, ybr2]));
  t('busca não mostra rascunho', !(await q('capa', null, null, null)).length);
  const n = await db.query(`select count(*)::int n from public.numeros_marca`); t('vê só números publicados (1 de 4)', n.rows[0].n === 1, n.rows[0].n);
  const d = await db.query(`select count(*)::int n from public.depoimentos`); t('vê só depoimentos publicados', d.rows[0].n === 1);
  const m = await db.query(`select count(*)::int n from public.materiais`); t('vê só materiais públicos', m.rows[0].n === 1);
  const c = await db.query(`select garantia_meses_padrao from public.configuracoes_site`); t('lê a garantia padrão', c.rows[0].garantia_meses_padrao === 3);
  const co = await db.query(`select count(*)::int n from public.produto_codigos_originais`); t('lê códigos originais de produto publicado', co.rows[0].n === 1);
  const up = await erro(`update public.configuracoes_site set garantia_meses_padrao = 99`); t('não muda configurações', !!up.erro || up.r.affectedRows === 0);
  const dp = await erro(`insert into public.depoimentos (nome, loja, cidade, uf, texto) values ('X','Y','Z','SP','texto qualquer aqui')`); t('não cria depoimento', !!dp.erro);
  const pdf = await erro(`insert into storage.objects (bucket_id, name) values ('materiais','x.pdf')`); t('não envia arquivo', !!pdf.erro);
});
await como('authenticated', COMUM, async () => {
  const up = await erro(`update public.numeros_marca set valor='9999'`); t('logado comum não edita números', !!up.erro || up.r.affectedRows === 0);
  const pdf = await erro(`insert into storage.objects (bucket_id, name) values ('materiais','x.pdf')`); t('logado comum não envia arquivo', !!pdf.erro);
});

const fk = await db.query(`select conrelid::regclass::text t, a.attname c from pg_constraint c join pg_attribute a on a.attrelid=c.conrelid and a.attnum=any(c.conkey) where c.contype='f' and connamespace='public'::regnamespace and not exists (select 1 from pg_index i where i.indrelid=c.conrelid and a.attnum = i.indkey[0])`);
t('toda chave estrangeira tem índice', fk.rows.length === 0, JSON.stringify(fk.rows));
console.log(`\n${ok} ok, ${falhas} falhas`);
process.exit(falhas ? 1 : 0);
