import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icone } from "@/components/Icone";
import { urlDaFoto } from "@/lib/fotos";
import { dataBR, equipe } from "@/lib/painel";
import { contem } from "@/lib/produtos";
import { FiltrosProdutos } from "./FiltrosProdutos";

export const metadata: Metadata = { title: "Produtos" };

const POR_PAGINA = 8;

type Linha = {
  id: number;
  nome: string;
  codigo: string | null;
  status: "publicado" | "rascunho";
  atualizado_em: string;
  categoria: { nome: string; slug: string };
  motos: { moto: { nome_curto: string; ordem: number } }[];
  fotos: { caminho: string; ordem: number }[];
};

export default async function ProdutosDoPainel({ searchParams }: PageProps<"/painel/produtos">) {
  const [{ supabase }, sp] = await Promise.all([equipe(), searchParams]);
  const [produtos, categorias] = await Promise.all([
    // A equipe enxerga publicados e rascunhos; quem decide isso é o RLS, não esta consulta.
    supabase
      .from("produtos")
      .select("id, nome, codigo, status, atualizado_em, categoria:categorias(nome, slug), motos:produto_motos(moto:motos(nome_curto, ordem)), fotos:produto_fotos(caminho, ordem)")
      .order("atualizado_em", { ascending: false })
      .order("id"),
    supabase.from("categorias").select("slug, nome").order("ordem"),
  ]);
  if (produtos.error || categorias.error) throw new Error(`Supabase: ${(produtos.error ?? categorias.error)?.message}`);
  const todos = produtos.data as unknown as Linha[];

  const texto = (v: string | string[] | undefined) => [v].flat()[0]?.trim() || undefined;
  const filtros = { busca: texto(sp.busca), categoria: texto(sp.categoria), status: texto(sp.status) };
  // shortcut: filtra e pagina em memória, como o catálogo do site; levar para a consulta se passar de algumas centenas de peças.
  const filtrados = todos.filter(
    (p) =>
      (!filtros.categoria || p.categoria.slug === filtros.categoria) &&
      (!filtros.status || p.status === filtros.status) &&
      (!filtros.busca || contem(`${p.nome} ${p.codigo ?? ""}`, filtros.busca)),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, Number(texto(sp.pagina)) || 1));
  const inicio = (pagina - 1) * POR_PAGINA;
  const naPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  const endereco = (n: number) => {
    const q = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => valor && q.set(chave, valor));
    if (n > 1) q.set("pagina", String(n));
    return q.size ? `/painel/produtos?${q}` : "/painel/produtos";
  };
  const publicados = todos.filter((p) => p.status === "publicado").length;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h1 className="ad-h1">Produtos</h1>
          <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
            {todos.length} produtos · {publicados} publicados · {todos.length - publicados} rascunhos
          </span>
        </div>
        <Link className="mk-btn mk-btn--primary" href="/painel/produtos/novo">
          + Novo produto
        </Link>
      </div>

      <FiltrosProdutos categorias={categorias.data} {...filtros} />

      <div className="ad-card" style={{ overflowX: "auto" }}>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Código</th>
              <th>Categoria</th>
              <th>Motos</th>
              <th>Status</th>
              <th>Atualizado</th>
              <th>
                <span style={{ position: "absolute", left: -9999 }}>Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {naPagina.map((p) => {
              const capa = [...p.fotos].sort((a, b) => a.ordem - b.ordem)[0];
              const motos = [...p.motos].sort((a, b) => a.moto.ordem - b.moto.ordem).map((m) => m.moto.nome_curto);
              return (
                <tr key={p.id}>
                  <td>
                    <span className="ad-thumb" style={{ position: "relative", overflow: "hidden" }}>
                      {capa ? <Image src={urlDaFoto(capa.caminho)} alt="" fill sizes="48px" style={{ objectFit: "contain" }} /> : <Icone nome="package" />}
                    </span>
                  </td>
                  <td>
                    <Link href={`/painel/produtos/${p.id}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                      {p.nome}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.codigo ?? "—"}</td>
                  <td>{p.categoria.nome}</td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {motos.length ? `${motos[0]}${motos.length > 1 ? ` +${motos.length - 1}` : ""}` : "Uso geral"}
                  </td>
                  <td>
                    {p.status === "publicado" ? (
                      <span className="mk-badge mk-badge--success">Publicado</span>
                    ) : (
                      <span className="mk-badge mk-badge--warning">Rascunho</span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{dataBR(p.atualizado_em)}</td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/painel/produtos/${p.id}`} style={{ fontWeight: 600 }}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {naPagina.length === 0 && (
              <tr>
                <td colSpan={8} style={{ color: "var(--text-secondary)" }}>
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
          {filtrados.length ? `Mostrando ${inicio + 1} a ${inicio + naPagina.length} de ${filtrados.length}` : "Nada para mostrar"}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {pagina > 1 ? (
            <Link className="mk-btn mk-btn--secondary" href={endereco(pagina - 1)}>
              Anterior
            </Link>
          ) : (
            <a className="mk-btn mk-btn--secondary" aria-disabled="true" style={{ opacity: 0.45 }}>
              Anterior
            </a>
          )}
          {pagina < paginas ? (
            <Link className="mk-btn mk-btn--secondary" href={endereco(pagina + 1)}>
              Próxima
            </Link>
          ) : (
            <a className="mk-btn mk-btn--secondary" aria-disabled="true" style={{ opacity: 0.45 }}>
              Próxima
            </a>
          )}
        </div>
      </div>
    </>
  );
}
