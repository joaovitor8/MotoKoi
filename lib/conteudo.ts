import { cacheLife, cacheTag } from "next/cache";
import { urlDoMaterial } from "./fotos";
import { supabase } from "./supabase";

// Conteúdo que o dono edita em "Conteúdo do site" no painel. O visitante só recebe o que está publicado (RLS).
export type Conteudo = {
  garantiaMeses: number | null; // garantia padrão da marca
  garantiaPrazoResposta: number | null; // dias úteis
  whatsapp: { numero: string; link: string } | null;
  catalogoPdf: string | null;
  numeros: { valor: string; rotulo: string }[];
  materiais: { titulo: string; descricao: string | null; formato: string; url: string }[];
  depoimentos: { nome: string; loja: string; cidade: string; uf: string; texto: string }[];
};

// "5518999990000" ou "18999990000" -> "(18) 99999-0000"
const formatarTelefone = (digitos: string) => {
  const d = digitos.length > 11 ? digitos.slice(-11) : digitos;
  return `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}`;
};
// wa.me pede só dígitos, com o código do país.
export const linkWhatsApp = (numero: string) => {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
};

const megas = (bytes: number | null) => (bytes ? ` · ${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : "");

export async function obterConteudo(): Promise<Conteudo> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalogo");
  const [config, numeros, materiais, depoimentos] = await Promise.all([
    supabase.from("configuracoes_site").select("garantia_meses_padrao, garantia_prazo_resposta_dias, whatsapp, catalogo_pdf_caminho").maybeSingle(),
    supabase.from("numeros_marca").select("valor, rotulo").eq("publicado", true).order("ordem").order("id"),
    supabase.from("materiais").select("titulo, descricao, caminho, tamanho_bytes").eq("publico", true).order("ordem").order("id"),
    supabase.from("depoimentos").select("nome, loja, cidade, uf, texto").eq("publicado", true).order("ordem").order("id"),
  ]);
  const erro = config.error ?? numeros.error ?? materiais.error ?? depoimentos.error;
  if (erro) throw new Error(`Supabase: ${erro.message}`);

  const c = config.data;
  return {
    garantiaMeses: c?.garantia_meses_padrao ?? null,
    garantiaPrazoResposta: c?.garantia_prazo_resposta_dias ?? null,
    whatsapp: c?.whatsapp ? { numero: formatarTelefone(c.whatsapp), link: linkWhatsApp(c.whatsapp) } : null,
    catalogoPdf: c?.catalogo_pdf_caminho ? urlDoMaterial(c.catalogo_pdf_caminho) : null,
    numeros: numeros.data ?? [],
    materiais: (materiais.data ?? []).map((m) => ({
      titulo: m.titulo,
      descricao: m.descricao,
      // "catalogo/motokoi.pdf" -> "PDF · 2,4 MB"
      formato: `${m.caminho.split(".").pop()?.toUpperCase() ?? ""}${megas(m.tamanho_bytes)}`,
      url: urlDoMaterial(m.caminho),
    })),
    depoimentos: depoimentos.data ?? [],
  };
}

// Ano atual para os seletores de ano. Em página pré-renderizada o Next não deixa ler o relógio direto
// (o valor ficaria congelado no build); dentro de "use cache" ele é renovado uma vez por dia.
export async function anoAtual() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
