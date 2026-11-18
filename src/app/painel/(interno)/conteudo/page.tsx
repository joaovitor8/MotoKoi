import type { Metadata } from "next";
import { equipe } from "@/lib/painel";
import { FormularioConfiguracoes } from "./FormularioConfiguracoes";
import { Materiais, type Material } from "./Materiais";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { cartao, tituloPainel } from "@/app/painel/estilos";

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
    <section className={`${cartao} flex-[1_1_340px] min-w-0 p-6 flex flex-col gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2>{titulo}</h2>
        <Botao variante="secundario" href={href}>
          Editar
        </Botao>
      </div>
      <span className="text-[14px] leading-5 text-text-muted">{texto}</span>
      <ul className="list-none m-0 p-0 border-t border-t-border">
        {itens.map((item, i) => (
          <li key={i} className="flex justify-between gap-3 py-2.5 px-0 border-b border-b-border text-[14px] leading-5">
            <span>{item.nome}</span>
            {item.publicado ? <Selo tom="sucesso">Publicado</Selo> : <Selo tom="aviso">Rascunho</Selo>}
          </li>
        ))}
        {itens.length === 0 && <li className="py-2.5 px-0 text-[14px] leading-5 text-text-secondary">Nada cadastrado ainda.</li>}
      </ul>
    </section>
  );

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className={tituloPainel}>Conteúdo do site</h1>
        <span className="text-[14px] leading-5 text-text-muted">
          Números da marca, catálogo em PDF, materiais para lojistas, depoimentos e garantia padrão.
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
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
