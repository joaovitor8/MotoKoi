// Testa as proteções do site contra um servidor no ar.
// Uso: npm run dev (em outro terminal) e depois: node testes/seguranca.mjs [http://localhost:3000]
// As regras do banco (quem lê e grava o quê) têm teste próprio: supabase/testes/regras-de-acesso.mjs
import fs from "node:fs";

const SITE = process.argv[2] ?? "http://localhost:3000";
const env = Object.fromEntries(
  fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const API = env.NEXT_PUBLIC_SUPABASE_URL, CHAVE = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let ok = 0, falhas = 0;
const t = (nome, cond, extra = "") => { if (cond) { ok++; console.log("  ok  ", nome); } else { falhas++; console.log("  FALHOU", nome, extra); } };
const pedir = (caminho, opcoes) => fetch(SITE + caminho, { redirect: "manual", ...opcoes });
const banco = (caminho, opcoes = {}) => fetch(API + caminho, { ...opcoes, headers: { apikey: CHAVE, "Content-Type": "application/json", ...opcoes.headers } });

console.log("\nPainel exige login (regras 1 e 9)");
for (const rota of ["/painel", "/painel/produtos", "/painel/produtos/1", "/painel/revenda", "/painel/categorias", "/painel/lojas", "/painel/conteudo", "/painel/depoimentos"]) {
  const r = await pedir(rota);
  t(`${rota} manda para o login`, r.status === 307 && r.headers.get("location")?.endsWith("/painel/entrar"), r.status);
}

console.log("\nCabeçalhos de segurança (regra 14)");
const inicio = await pedir("/");
const h = (nome) => inicio.headers.get(nome) ?? "";
t("Content-Security-Policy restringe as origens", h("content-security-policy").includes("default-src 'self'") && h("content-security-policy").includes("frame-ancestors 'none'"));
t("X-Frame-Options: DENY", h("x-frame-options") === "DENY");
t("X-Content-Type-Options: nosniff", h("x-content-type-options") === "nosniff");
t("Referrer-Policy definido", h("referrer-policy") !== "");
t("não anuncia X-Powered-By", !inicio.headers.has("x-powered-by"));
if (SITE.startsWith("https")) t("HSTS ligado", h("strict-transport-security").includes("max-age"));

console.log("\nArquivos que não podem estar expostos (regra 23)");
for (const arquivo of ["/.env", "/.env.local", "/.git/config", "/package.json", "/supabase/seed.sql", "/backup.sql"]) {
  t(`${arquivo} dá 404`, (await pedir(arquivo)).status === 404);
}

console.log("\nEntradas maliciosas viram texto comum (regras 7 e 10)");
const sql = await (await pedir("/catalogo?busca=" + encodeURIComponent("' OR 1=1 --"))).text();
t("SQL injection na busca não devolve produtos", !sql.includes("<article"));
const xss = await (await pedir("/catalogo?busca=" + encodeURIComponent('"><img src=x onerror=alert(1)>'))).text();
t("XSS na busca sai escapado", !xss.includes("<img src=x onerror") && xss.includes("&lt;img") || xss.includes("&quot;&gt;"));

console.log("\nBanco pela API pública, como visitante (regras 3 e 9)");
t("lê produtos publicados", (await banco("/rest/v1/produtos?select=slug&limit=1")).status === 200);
t("não vê rascunhos", (await (await banco("/rest/v1/produtos?select=slug&status=eq.rascunho")).json()).length === 0);
t("não lê cadastros de revenda", [401, 403].includes((await banco("/rest/v1/cadastros_revenda?select=id")).status));
t("não lê perfis", [401, 403].includes((await banco("/rest/v1/perfis?select=id")).status));
t("não altera produto", [401, 403].includes((await banco("/rest/v1/produtos?slug=eq.carburador-titan-150", { method: "PATCH", body: JSON.stringify({ nome: "hack" }) })).status));
t("não chama salvar_produto", [401, 403, 404].includes((await banco("/rest/v1/rpc/salvar_produto", { method: "POST", body: JSON.stringify({ dados: { nome: "hack", slug: "hack", categoria_id: 1, status: "publicado" } }) })).status));
t("não muda as configurações do site", [401, 403].includes((await banco("/rest/v1/configuracoes_site?id=eq.true", { method: "PATCH", body: JSON.stringify({ whatsapp: "11999999999" }) })).status));
t("não se aprova como revendedor", [400, 401, 403].includes((await banco("/rest/v1/cadastros_revenda", { method: "POST", body: JSON.stringify({ nome_loja: "x", documento: "12345678901", tipo_negocio: "oficina", responsavel: "x", whatsapp: "18999990000", email: "a@b.com", cidade: "x", uf: "SP", aceite_contato: true, situacao: "aprovado" }) })).status));
t("não envia arquivo ao bucket de fotos", [400, 401, 403].includes((await fetch(`${API}/storage/v1/object/produtos/hack.png`, { method: "POST", headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, "Content-Type": "image/png" }, body: "x" })).status));

console.log(`\n${ok} ok, ${falhas} falhas`);
process.exit(falhas ? 1 : 0);
