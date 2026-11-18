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
import { Botao } from "@/components/Botao";
import { CaixaMarcacao, classesMarcacao } from "@/components/Marcacao";
import { focoNaCaixa, rotulo, tituloH1 } from "@/components/estilos";

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

const tituloFiltro = "font-semibold text-[12px] leading-4 tracking-[.2em] uppercase text-text-muted pb-3 border-b-[1.5px] border-b-text";

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
      <section className="px-(--margem) pt-16 pb-12 flex flex-wrap items-end justify-between gap-y-8 gap-x-16">
        <div className="flex flex-col gap-4">
          <span className={rotulo}>Catálogo</span>
          <h1 className={tituloH1}>
            Todas
            <br />
            as peças
          </h1>
        </div>
        <form action="/catalogo" role="search" className="flex-[1_1_420px] max-w-150">
          {filtros.categoria && <input type="hidden" name="categoria" value={filtros.categoria} />}
          {filtros.motos.map((m) => (
            <input key={m} type="hidden" name="moto" value={m} />
          ))}
          {filtros.ano && <input type="hidden" name="ano" value={filtros.ano} />}
          <label className="flex items-center gap-4 py-3 px-0 border-b-[2px] border-b-text">
            <span className="text-[26px] text-text-muted">
              <Icone nome="search" />
            </span>
            <input
              name="busca"
              defaultValue={filtros.busca}
              aria-label="Buscar no catálogo"
              placeholder="Peça, código MotoKoi, código original ou moto"
              className="[all:unset] grow! min-w-0! text-[22px]! leading-9!"
            />
          </label>
        </form>
      </section>

      <section className="px-(--margem) pt-0 pb-28 flex flex-wrap items-start gap-y-12 gap-x-16">
        <aside aria-label="Filtros" className="flex-[0_0_240px] flex flex-col gap-10">
          <div className="flex flex-col">
            <span className={tituloFiltro}>Categoria</span>
            {[{ slug: undefined, nome: "Todas", total: produtos.length }, ...categorias].map((c) => {
              const atual = c.slug === filtros.categoria;
              return (
                <Link
                  key={c.nome}
                  href={endereco({ ...filtros, categoria: c.slug })}
                  aria-current={atual ? "true" : undefined}
                  className={`flex justify-between gap-4 border-b border-b-border px-0 py-2.5 text-[16px] leading-6 text-text no-underline ${atual ? "font-semibold" : "font-normal"}`}
                >
                  <span>{c.nome}</span>
                  <span className="text-[13px] text-text-muted font-medium">{c.total}</span>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <span className={tituloFiltro}>Moto</span>
            {motos.map((moto) => {
              const marcada = filtros.motos.includes(moto.slug);
              const outras = filtros.motos.filter((m) => m !== moto.slug);
              return (
                <Link
                  key={moto.slug}
                  href={endereco({ ...filtros, motos: marcada ? outras : [...outras, moto.slug] })}
                  aria-current={marcada ? "true" : undefined}
                  className={`${classesMarcacao} no-underline`}
                >
                  <CaixaMarcacao marcada={marcada} />
                  {moto.nome}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            <span className={tituloFiltro}>Ano da moto</span>
            <SeletorQueEnvia
              acao="/catalogo"
              nome="ano"
              rotulo="Ano da moto"
              valor={filtros.ano ? String(filtros.ano) : ""}
              opcoes={[{ valor: "", texto: "Todos os anos" }, ...Array.from({ length: anoAtual - 1979 }, (_, i) => ({ valor: String(anoAtual - i), texto: String(anoAtual - i) }))]}
              ocultos={outrosFiltros}
              className={`${focoNaCaixa} flex h-11 items-center justify-between rounded-md border-[1.5px] border-border-strong px-3.5 py-0 text-[16px] leading-6`}
            />
            <span className="text-[13px] leading-5 text-text-muted">Mostra só as peças que servem no ano escolhido.</span>
          </div>
          {conteudo.catalogoPdf && (
            <div className="flex flex-col gap-3 p-5 bg-bg-subtle rounded-lg">
              <span className="font-semibold text-[15px] leading-[22px]">Catálogo completo</span>
              <span className="text-[14px] leading-5 text-text-secondary">Todas as peças, códigos e aplicações num arquivo só.</span>
              <Botao variante="secundario" href={conteudo.catalogoPdf} className="self-start">
                <Icone nome="download" /> Baixar PDF
              </Botao>
            </div>
          )}
        </aside>

        <div className="flex-[1_1_640px] min-w-0 flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 pb-4 border-b border-b-border">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-[16px] leading-6">
                {encontrados.length} {encontrados.length === 1 ? "peça" : "peças"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-5 text-text-secondary">
              Ordenar:{" "}
              <span className="inline-flex items-center gap-1.5 font-semibold text-text">
                Mais recentes <Icone nome="chevron-down" />
              </span>
            </div>
          </div>

          {naPagina.length ? (
            <div className="grid [grid-template-columns:repeat(auto-fill,_minmax(260px,_1fr))] gap-y-12 gap-x-8">
              {naPagina.map((p) => (
                <CartaoProduto key={p.slug} produto={p} serveEm titulo="h2" />
              ))}
            </div>
          ) : (
            <p className="m-0 text-[17px] leading-7 text-text-secondary">
              Nenhuma peça encontrada com esses filtros. <Link href="/catalogo">Ver todas as peças</Link>
            </p>
          )}

          <nav
            aria-label="Páginas"
            className="flex items-center justify-between gap-4 pt-6 border-t-[1.5px] border-t-text"
          >
            <span className="text-[14px] leading-5 text-text-muted">
              Página {pagina} de {paginas}
            </span>
            <div className="flex gap-3">
              {pagina > 1 ? (
                <Botao variante="secundario" href={endereco(filtros, pagina - 1)}>
                  Anterior
                </Botao>
              ) : (
                <Botao variante="secundario" apagado>
                  Anterior
                </Botao>
              )}
              {pagina < paginas ? (
                <Botao variante="escuro" href={endereco(filtros, pagina + 1)}>
                  Próxima <Icone nome="arrow-right" />
                </Botao>
              ) : (
                <Botao variante="escuro" apagado>
                  Próxima <Icone nome="arrow-right" />
                </Botao>
              )}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
