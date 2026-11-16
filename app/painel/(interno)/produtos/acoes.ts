"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { equipe } from "@/lib/painel";

export type Especificacao = { rotulo: string; valor: string };
export type ItemCaixa = { quantidade: number; descricao: string };
export type MotoDoProduto = { moto_id: number; ano_inicio: number | null; ano_fim: number | null; observacao: string };
export type CodigoOriginal = { fabricante: string; codigo: string };
export type Listas = { especificacoes: Especificacao[]; itens: ItemCaixa[]; motos: MotoDoProduto[]; codigos: CodigoOriginal[] };

export type CamposProduto = {
  nome: string;
  codigo: string;
  categoria_id: string;
  resumo: string;
  descricao: string;
  novidade: boolean;
  garantia_meses: string; // vazio = usa a garantia padrão da marca
  inmetro_registro: string;
};
export type EstadoProduto = { erro?: string; salvo?: string; status?: "publicado" | "rascunho"; valores?: CamposProduto };

// "Kit Transmissão Titan 150" -> "kit-transmissao-titan-150": o pedaço da URL da página do produto.
const slugDe = (nome: string) =>
  nome.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ano = (v: unknown) => (v === null || v === "" || v === undefined ? null : Number(v));

export async function salvarProduto(_anterior: EstadoProduto, formulario: FormData): Promise<EstadoProduto> {
  const { supabase } = await equipe();
  const texto = (campo: string) => String(formulario.get(campo) ?? "").trim();
  const id = texto("id") ? Number(texto("id")) : null;
  const status = texto("status") === "publicado" ? "publicado" : "rascunho";
  const valores: CamposProduto = {
    nome: texto("nome"),
    codigo: texto("codigo"),
    categoria_id: texto("categoria_id"),
    resumo: texto("resumo"),
    descricao: texto("descricao"),
    novidade: formulario.get("novidade") === "on",
    garantia_meses: texto("garantia_meses"),
    inmetro_registro: texto("inmetro_registro"),
  };
  const erro = (mensagem: string): EstadoProduto => ({ erro: mensagem, valores });

  // As listas (ficha, caixa, motos) chegam do navegador como JSON; linhas totalmente vazias são ignoradas.
  let listas: Partial<Listas>;
  try {
    listas = JSON.parse(texto("listas") || "{}");
  } catch {
    return erro("Não foi possível ler as listas do formulário. Recarregue a página e tente de novo.");
  }
  const especificacoes = (listas.especificacoes ?? [])
    .map((e) => ({ rotulo: String(e.rotulo ?? "").trim(), valor: String(e.valor ?? "").trim() }))
    .filter((e) => e.rotulo || e.valor);
  const itens = (listas.itens ?? [])
    .map((i) => ({ quantidade: Number(i.quantidade), descricao: String(i.descricao ?? "").trim() }))
    .filter((i) => i.descricao);
  const motos = (listas.motos ?? []).map((m) => ({
    moto_id: Number(m.moto_id),
    ano_inicio: ano(m.ano_inicio),
    ano_fim: ano(m.ano_fim),
    observacao: String(m.observacao ?? "").trim(),
  }));

  const codigos = (listas.codigos ?? [])
    .map((c) => ({ fabricante: String(c.fabricante ?? "").trim(), codigo: String(c.codigo ?? "").trim() }))
    .filter((c) => c.fabricante || c.codigo);
  const garantia = valores.garantia_meses === "" ? null : Number(valores.garantia_meses);

  if (!valores.nome) return erro("Informe o nome do produto.");
  if (!slugDe(valores.nome)) return erro("O nome precisa ter pelo menos uma letra ou número.");
  if (!/^\d+$/.test(valores.categoria_id)) return erro("Escolha a categoria.");
  if (especificacoes.some((e) => !e.rotulo || !e.valor))
    return erro("Na ficha técnica, preencha a característica e o valor de cada linha, ou remova a linha.");
  if (itens.some((i) => !Number.isInteger(i.quantidade) || i.quantidade < 1))
    return erro("Em “Na caixa”, a quantidade de cada item precisa ser 1 ou mais.");
  const anoValido = (a: number | null) => a === null || (Number.isInteger(a) && a >= 1950 && a <= 2100);
  if (motos.some((m) => !Number.isInteger(m.moto_id) || !anoValido(m.ano_inicio) || !anoValido(m.ano_fim)))
    return erro("Em “Motos compatíveis”, os anos precisam ter quatro números, como 2008.");
  if (motos.some((m) => m.ano_inicio && m.ano_fim && m.ano_fim < m.ano_inicio))
    return erro("Em “Motos compatíveis”, o ano final não pode ser menor que o inicial.");

  if (codigos.some((c) => !c.fabricante || !c.codigo))
    return erro("Em “Códigos originais”, preencha o fabricante e o código de cada linha, ou remova a linha.");
  if (garantia !== null && (!Number.isInteger(garantia) || garantia < 1 || garantia > 120))
    return erro("A garantia precisa ser um número de meses entre 1 e 120, ou ficar vazia para usar o padrão da marca.");

  // A função do banco grava tudo numa transação só (ver a migração salvar_produto).
  const { data: idSalvo, error } = await supabase.rpc("salvar_produto", {
    dados: { id, ...valores, categoria_id: Number(valores.categoria_id), garantia_meses: garantia, slug: slugDe(valores.nome), status, especificacoes, itens, motos, codigos },
  });
  if (error) {
    if (error.code === "23505" && error.message.includes("slug")) return erro("Já existe um produto com esse nome. Mude o nome para criar outro.");
    if (error.code === "23505" && error.message.includes("codigos_originais")) return erro("Há um código original repetido na lista.");
    if (error.code === "23505" && error.message.includes("codigo")) return erro("Já existe um produto com esse código.");
    if (error.code === "23514") return erro("Algum campo passou do tamanho permitido. Encurte o texto e tente de novo.");
    console.error("Produto não salvo:", error.code, error.message);
    return erro("Não foi possível salvar. Tente de novo em alguns instantes.");
  }

  updateTag("catalogo"); // o site passa a mostrar a mudança na hora
  if (!id) redirect(`/painel/produtos/${idSalvo}`);
  revalidatePath(`/painel/produtos/${id}`);
  return { salvo: status === "publicado" ? "Produto salvo e publicado." : "Produto salvo como rascunho.", status, valores };
}

export async function excluirProduto(id: number) {
  if (!Number.isInteger(id)) throw new Error("Pedido inválido.");
  const { supabase } = await equipe();
  const { data: fotos } = await supabase.from("produto_fotos").select("caminho").eq("produto_id", id);
  // Apagar o produto leva junto ficha, itens da caixa, motos e as linhas das fotos (on delete cascade).
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw new Error(`Supabase: ${error.message}`);
  // Os arquivos do Storage não entram no cascade; se esta limpeza falhar, sobram arquivos soltos, sem efeito no site.
  if (fotos?.length) await supabase.storage.from("produtos").remove(fotos.map((f) => f.caminho));
  updateTag("catalogo");
  redirect("/painel/produtos");
}

// Chamada pelo componente de fotos depois de enviar, reordenar ou remover uma foto.
export async function fotosMudaram(produtoId: number) {
  await equipe();
  updateTag("catalogo");
  revalidatePath(`/painel/produtos/${produtoId}`);
}
