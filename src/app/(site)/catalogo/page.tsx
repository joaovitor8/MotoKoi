import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoProduto } from "@/components/CartaoProduto";
import { Icone } from "@/components/Icone";
import { SeletorQueEnvia } from "@/components/SeletorQueEnvia";
import { anoAtual as lerAnoAtual, obterConteudo } from "@/lib/conteudo";
import type { Filtros } from "@/lib/filtro";
import { filtrarProdutos, listarCategorias, listarMotos, listarProdutos } from "@/lib/produtos";

export const metadata: Metadata = { title: "Catálogo" };

const POR_PAGINA = 9; // 3 × 3, como na tela de referência

// Os filtros vivem na URL (`motos` e `categoria` são slugs). Mudar um filtro volta para a página 1.
function endereco({ categoria, motos, ano, busca }: Filtros, pagina = 1) {
  const q = new URLSearchParams();
  if (busca) q.set("busca", busca);
  if (categoria) q.set("categoria", categoria);
  motos.forEach((m) => q.append("moto", m));
  if (ano) q.set("ano", String(ano));
  if (pagina > 1) q.set("pagina", String(pagina));
  return q.size ? `/catalogo?${q}` : "/catalogo";
}

const tituloFiltro = {
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "16px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  paddingBottom: 12,
  borderBottom: "1.5px solid var(--text)",
} as const;

export default function Catalogo({ searchParams }: PageProps<"/catalogo">) {
  return (
    <>
      <Cabecalho atual="/catalogo" />
      <main>
        {/* Os filtros vêm da URL, que só existe na hora do acesso; o Suspense deixa o resto da página pronto antes. */}
        <Suspense>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/catalogo">, "searchParams">) {
  const [sp, categorias, motos, produtos, conteudo, anoAtual] = await Promise.all([
    searchParams,
    listarCategorias(),
    listarMotos(),
    listarProdutos(),
    obterConteudo(),
    lerAnoAtual(),
  ]);
  const texto = (v: string | string[] | undefined) => [v].flat()[0]?.trim() || undefined;
  const filtros: Filtros = {
    categoria: texto(sp.categoria),
    motos: [sp.moto].flat().filter((m): m is string => !!m?.trim()),
    ano: Number(texto(sp.ano)) || undefined,
    busca: texto(sp.busca),
  };
  // No seletor de ano aparecem do ano atual até 1980.
  const outrosFiltros: [string, string][] = [
    ...(filtros.busca ? [["busca", filtros.busca] as [string, string]] : []),
    ...(filtros.categoria ? [["categoria", filtros.categoria] as [string, string]] : []),
    ...filtros.motos.map((m) => ["moto", m] as [string, string]),
  ];
  const encontrados = filtrarProdutos(produtos, filtros);
  const paginas = Math.max(1, Math.ceil(encontrados.length / POR_PAGINA));
  // Página fora do intervalo (ou texto que não é número) cai na mais próxima que existe.
  const pagina = Math.min(paginas, Math.max(1, Number(texto(sp.pagina)) || 1));
  const naPagina = encontrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
      <section
        style={{
          padding: "64px var(--margem) 48px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "32px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span className="st-rotulo">Catálogo</span>
          <h1 className="st-h1">
            Todas
            <br />
            as peças
          </h1>
        </div>
        <form action="/catalogo" role="search" style={{ flex: "1 1 420px", maxWidth: 600 }}>
          {filtros.categoria && <input type="hidden" name="categoria" value={filtros.categoria} />}
          {filtros.motos.map((m) => (
            <input key={m} type="hidden" name="moto" value={m} />
          ))}
          {filtros.ano && <input type="hidden" name="ano" value={filtros.ano} />}
          <label
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "2px solid var(--text)" }}
          >
            <span style={{ fontSize: 26, color: "var(--text-muted)" }}>
              <Icone nome="search" />
            </span>
            <input
              name="busca"
              defaultValue={filtros.busca}
              aria-label="Buscar no catálogo"
              placeholder="Peça, código MotoKoi, código original ou moto"
              style={{ all: "unset", flexGrow: 1, minWidth: 0, fontSize: 22, lineHeight: "36px" }}
            />
          </label>
        </form>
      </section>

      <section
        style={{
          padding: "0 var(--margem) 112px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "48px 64px",
        }}
      >
        <aside aria-label="Filtros" style={{ flex: "0 0 240px", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={tituloFiltro}>Categoria</span>
            {[{ slug: undefined, nome: "Todas", total: produtos.length }, ...categorias].map((c) => {
              const atual = c.slug === filtros.categoria;
              return (
                <Link
                  key={c.nome}
                  href={endereco({ ...filtros, categoria: c.slug })}
                  aria-current={atual ? "true" : undefined}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                    textDecoration: "none",
                    fontSize: 16,
                    lineHeight: "24px",
                    color: "var(--text)",
                    fontWeight: atual ? 600 : 400,
                  }}
                >
                  <span>{c.nome}</span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{c.total}</span>
                </Link>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={tituloFiltro}>Moto</span>
            {motos.map((moto) => {
              const marcada = filtros.motos.includes(moto.slug);
              const outras = filtros.motos.filter((m) => m !== moto.slug);
              return (
                <Link
                  key={moto.slug}
                  href={endereco({ ...filtros, motos: marcada ? outras : [...outras, moto.slug] })}
                  aria-current={marcada ? "true" : undefined}
                  className={marcada ? "mk-check is-checked" : "mk-check"}
                  style={{ color: "var(--text)", textDecoration: "none" }}
                >
                  <span className="mk-check__box">
                    <Icone nome="check" />
                  </span>
                  {moto.nome}
                </Link>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={tituloFiltro}>Ano da moto</span>
            <SeletorQueEnvia
              acao="/catalogo"
              nome="ano"
              rotulo="Ano da moto"
              valor={filtros.ano ? String(filtros.ano) : ""}
              opcoes={[{ valor: "", texto: "Todos os anos" }, ...Array.from({ length: anoAtual - 1979 }, (_, i) => ({ valor: String(anoAtual - i), texto: String(anoAtual - i) }))]}
              ocultos={outrosFiltros}
              className="st-seletor"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, padding: "0 14px", border: "1.5px solid var(--border-strong)", borderRadius: 4, fontSize: 16, lineHeight: "24px" }}
            />
            <span style={{ fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>Mostra só as peças que servem no ano escolhido.</span>
          </div>
          {conteudo.catalogoPdf && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, background: "var(--bg-subtle)", borderRadius: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 15, lineHeight: "22px" }}>Catálogo completo</span>
              <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>Todas as peças, códigos e aplicações num arquivo só.</span>
              <a className="mk-btn mk-btn--secondary" href={conteudo.catalogoPdf} style={{ alignSelf: "flex-start" }}>
                <Icone nome="download" /> Baixar PDF
              </a>
            </div>
          )}
        </aside>

        <div style={{ flex: "1 1 640px", minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px 24px",
              paddingBottom: 16,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 16, lineHeight: "24px" }}>
                {encontrados.length} {encontrados.length === 1 ? "peça" : "peças"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>
              Ordenar:{" "}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, color: "var(--text)" }}>
                Mais recentes <Icone nome="chevron-down" />
              </span>
            </div>
          </div>

          {naPagina.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "48px 32px" }}>
              {naPagina.map((p) => (
                <CartaoProduto key={p.slug} produto={p} serveEm titulo="h2" />
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>
              Nenhuma peça encontrada com esses filtros. <Link href="/catalogo">Ver todas as peças</Link>
            </p>
          )}

          <nav
            aria-label="Páginas"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              paddingTop: 24,
              borderTop: "1.5px solid var(--text)",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
              Página {pagina} de {paginas}
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {pagina > 1 ? (
                <Link className="mk-btn mk-btn--secondary" href={endereco(filtros, pagina - 1)}>
                  Anterior
                </Link>
              ) : (
                <a className="mk-btn mk-btn--secondary" aria-disabled="true" style={{ opacity: 0.45 }}>
                  Anterior
                </a>
              )}
              {pagina < paginas ? (
                <Link className="mk-btn mk-btn--dark" href={endereco(filtros, pagina + 1)}>
                  Próxima <Icone nome="arrow-right" />
                </Link>
              ) : (
                <a className="mk-btn mk-btn--dark" aria-disabled="true" style={{ opacity: 0.45 }}>
                  Próxima <Icone nome="arrow-right" />
                </a>
              )}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
