import type { Metadata } from "next";
import Link from "next/link";
import { equipe } from "@/lib/painel";
import { FormularioConfiguracoes } from "./FormularioConfiguracoes";
import { Materiais, type Material } from "./Materiais";

export const metadata: Metadata = { title: "Conteúdo do site" };

const telefone = (digitos: string | null) => {
  if (!digitos) return "";
  const d = digitos.length > 11 ? digitos.slice(-11) : digitos;
  return `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`;
};

export default async function ConteudoDoSite() {
  const { supabase } = await equipe();
  const [config, materiais, numeros, depoimentos] = await Promise.all([
    supabase.from("configuracoes_site").select("garantia_meses_padrao, garantia_prazo_resposta_dias, whatsapp, catalogo_pdf_caminho").maybeSingle(),
    supabase.from("materiais").select("id, titulo, tipo, caminho, tamanho_bytes, atualizado_em").order("ordem").order("id"),
    supabase.from("numeros_marca").select("valor, rotulo, publicado").order("ordem").order("id"),
    supabase.from("depoimentos").select("nome, loja, publicado").order("ordem").order("id"),
  ]);
  const erro = config.error ?? materiais.error ?? numeros.error ?? depoimentos.error;
  if (erro) throw new Error(`Supabase: ${erro.message}`);
  const c = config.data;

  const resumo = (titulo: string, texto: string, href: string, itens: { nome: string; publicado: boolean }[]) => (
    <section className="ad-card" style={{ flex: "1 1 340px", minWidth: 0, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h2>{titulo}</h2>
        <Link className="mk-btn mk-btn--secondary" href={href}>
          Editar
        </Link>
      </div>
      <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>{texto}</span>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border)" }}>
        {itens.map((item, i) => (
          <li key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14, lineHeight: "20px" }}>
            <span>{item.nome}</span>
            {item.publicado ? <span className="mk-badge mk-badge--success">Publicado</span> : <span className="mk-badge mk-badge--warning">Rascunho</span>}
          </li>
        ))}
        {itens.length === 0 && <li style={{ padding: "10px 0", fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>Nada cadastrado ainda.</li>}
      </ul>
    </section>
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 className="ad-h1">Conteúdo do site</h1>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
          Números da marca, catálogo em PDF, materiais para lojistas, depoimentos e garantia padrão.
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
        {resumo(
          "Números da marca",
          "Aparecem na Home. Use só números que dá para comprovar.",
          "/painel/numeros",
          (numeros.data ?? []).map((n) => ({ nome: `${n.valor} ${n.rotulo}`, publicado: n.publicado })),
        )}
        {resumo(
          "Depoimentos",
          "Publique só depoimentos reais, com autorização por escrito do revendedor.",
          "/painel/depoimentos",
          (depoimentos.data ?? []).map((d) => ({ nome: `${d.nome} · ${d.loja}`, publicado: d.publicado })),
        )}
      </div>
      <Materiais materiais={(materiais.data ?? []) as Material[]} catalogoAtual={c?.catalogo_pdf_caminho ?? null} />
      <FormularioConfiguracoes
        atuais={{
          garantia: c?.garantia_meses_padrao ? String(c.garantia_meses_padrao) : "",
          prazo: c?.garantia_prazo_resposta_dias ? String(c.garantia_prazo_resposta_dias) : "",
          whatsapp: telefone(c?.whatsapp ?? null),
        }}
      />
    </>
  );
}
