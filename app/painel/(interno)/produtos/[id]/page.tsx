import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataBR, equipe } from "@/lib/painel";
import { FormularioProduto, type ProdutoDoPainel } from "../FormularioProduto";
import { FichaProduto } from "../FichaProduto";
import { FotosProduto, type Foto } from "../FotosProduto";

export const metadata: Metadata = { title: "Produto" };

const porOrdem = (a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem;

// /painel/produtos/novo cria; /painel/produtos/123 edita o produto de id 123.
export default async function EditarProduto({ params }: PageProps<"/painel/produtos/[id]">) {
  const [{ supabase }, { id }] = await Promise.all([equipe(), params]);
  const novo = id === "novo";
  if (!novo && !/^\d+$/.test(id)) notFound();

  const [categorias, motos, linha] = await Promise.all([
    supabase.from("categorias").select("id, nome").order("ordem"),
    supabase.from("motos").select("id, fabricante, modelo").order("ordem"),
    novo
      ? null
      : supabase
          .from("produtos")
          .select(
            `id, nome, slug, codigo, categoria_id, resumo, descricao, status, novidade, atualizado_em, garantia_meses, inmetro_registro, ficha_tecnica_caminho,
             codigos:produto_codigos_originais(fabricante, codigo),
             autor:perfis(nome),
             especificacoes:produto_especificacoes(rotulo, valor, ordem),
             itens:produto_itens_caixa(quantidade, descricao, ordem),
             motos:produto_motos(moto_id, ano_inicio, ano_fim, observacao),
             fotos:produto_fotos(id, caminho, ordem)`,
          )
          .eq("id", Number(id))
          .maybeSingle(),
  ]);
  if (categorias.error || motos.error || linha?.error) throw new Error(`Supabase: ${(categorias.error ?? motos.error ?? linha?.error)?.message}`);
  if (!novo && !linha?.data) notFound();

  /* eslint-disable @typescript-eslint/no-explicit-any -- o cliente sem tipos gerados devolve any; o formato é fixado em ProdutoDoPainel */
  const p: any = linha?.data;
  const produto: ProdutoDoPainel = p
    ? {
        id: p.id,
        slug: p.slug,
        status: p.status,
        nome: p.nome,
        codigo: p.codigo ?? "",
        categoria_id: String(p.categoria_id),
        resumo: p.resumo ?? "",
        descricao: p.descricao ?? "",
        novidade: p.novidade,
        garantia_meses: p.garantia_meses === null ? "" : String(p.garantia_meses),
        inmetro_registro: p.inmetro_registro ?? "",
        codigos: p.codigos.map((c: any) => ({ fabricante: c.fabricante, codigo: c.codigo })),
        especificacoes: [...p.especificacoes].sort(porOrdem).map((e: any) => ({ rotulo: e.rotulo, valor: e.valor })),
        itens: [...p.itens].sort(porOrdem).map((i: any) => ({ quantidade: i.quantidade, descricao: i.descricao })),
        motos: p.motos.map((m: any) => ({ moto_id: m.moto_id, ano_inicio: m.ano_inicio, ano_fim: m.ano_fim, observacao: m.observacao ?? "" })),
        ultimaAlteracao: `Última alteração em ${dataBR(p.atualizado_em)}${p.autor?.nome ? ` por ${p.autor.nome}` : ""}.`,
      }
    : { id: null, slug: null, status: "rascunho", nome: "", codigo: "", categoria_id: "", resumo: "", descricao: "", novidade: false, garantia_meses: "", inmetro_registro: "", especificacoes: [], itens: [], motos: [], codigos: [], ultimaAlteracao: null };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <>
      <nav aria-label="Você está em" style={{ display: "flex", gap: 8, fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
        <Link href="/painel/produtos" style={{ color: "var(--text-muted)" }}>
          Produtos
        </Link>
        <span aria-hidden="true">/</span>
        <span style={{ color: "var(--text)" }}>{novo ? "Novo" : "Editar"}</span>
      </nav>
      {/* key: ao sair de "novo" para o produto recém-criado, o formulário recomeça com os dados salvos */}
      <FormularioProduto
        key={produto.id ?? "novo"}
        produto={produto}
        categorias={categorias.data}
        motos={motos.data.map((m) => ({ id: m.id, nome: `${m.fabricante} ${m.modelo}` }))}
        ficha={produto.id ? <FichaProduto produtoId={produto.id} caminho={p.ficha_tecnica_caminho} /> : null}
        fotos={
          produto.id ? (
            <FotosProduto produtoId={produto.id} nome={produto.nome} fotos={p.fotos as Foto[]} />
          ) : (
            <section className="ad-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              <h2>Fotos</h2>
              <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>Salve o produto primeiro. As fotos entram depois, nesta mesma tela.</span>
            </section>
          )
        }
      />
    </>
  );
}
