import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoProduto } from "@/components/CartaoProduto";
import { EspacoFoto } from "@/components/EspacoFoto";
import { Icone } from "@/components/Icone";
import { obterConteudo } from "@/lib/conteudo";
import { listarProdutos } from "@/lib/produtos";
import { Galeria } from "./Galeria";
import { Botao, classesBotao } from "@/components/Botao";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { Selo } from "@/components/Selo";
import { rotulo, tituloH2 } from "@/components/estilos";

type Props = PageProps<"/catalogo/[slug]">;

export async function generateStaticParams() {
  return (await listarProdutos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: (await listarProdutos()).find((p) => p.slug === slug)?.nome };
}
const garantia = "flex flex-wrap items-center gap-y-1 gap-x-4 py-3.5 px-0 border-b border-b-border";

export default function PaginaProduto({ params }: Props) {
  return (
    <>
      <Cabecalho atual="/catalogo" />
      <main>
        {/* O slug vem da URL; o Suspense deixa cabeçalho e rodapé prontos enquanto o produto carrega. */}
        <Suspense>
          <Conteudo params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function Conteudo({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const [produtos, conteudo] = await Promise.all([listarProdutos(), obterConteudo()]);
  const produto = produtos.find((p) => p.slug === slug);
  if (!produto) notFound();

  const moto = produto.motos[0];
  const mesmaAplicacao = moto
    ? produtos.filter((p) => p.slug !== produto.slug && p.motos.some((m) => m.slug === moto.slug)).slice(0, 4)
    : [];

  return (
    <>
        <nav
          aria-label="Você está em"
          className="px-(--margem) pt-6 pb-0 flex flex-wrap gap-2 text-[14px] leading-5 text-text-muted"
        >
          <Link href="/catalogo" className="text-text-muted">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/catalogo?categoria=${produto.categoria.slug}`} className="text-text-muted">
            {produto.categoria.nome}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text">{produto.nome}</span>
        </nav>

        <section className="px-(--margem) pt-8 pb-24 flex flex-wrap items-start gap-y-12 gap-x-18">
          <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-4">
            {produto.fotos.length > 0 ? (
              <Galeria fotos={produto.fotos} />
            ) : (
              <>
                <EspacoFoto
                  texto="[FOTO PRINCIPAL]"
                  proporcao="1 / 1"
                  icone={64}
                />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`min-w-0 flex-[1_1_0] overflow-hidden rounded-lg ${n === 1 ? "border-2 border-text" : "border border-border"}`}
                    >
                      <EspacoFoto texto={`[FOTO ${n}]`} proporcao="1 / 1" icone={24} style={{ borderRadius: 0 }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex-[1_1_440px] min-w-0 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={rotulo}>{produto.categoria.nome}</span>
              {produto.novidade && <Selo tom="marca">Novidade</Selo>}
            </div>
            <h1 className="m-0 font-display font-extrabold [font-size:clamp(52px,_5.6vw,_84px)] leading-[0.9] tracking-[-.01em] uppercase">
              {produto.nome}
            </h1>
            <div className="flex flex-wrap gap-y-1 gap-x-5 font-medium text-[14px] leading-5 text-text-muted">
              <span>Cód. MotoKoi {produto.codigo ?? "[CÓDIGO]"}</span>
              {produto.codigosOriginais.length > 0 ? (
                produto.codigosOriginais.map((c) => (
                  <span key={c.fabricante + c.codigo}>
                    Cód. original {c.fabricante} {c.codigo}
                  </span>
                ))
              ) : (
                <span>Cód. original [CÓDIGO ORIGINAL]</span>
              )}
            </div>
            <p className="m-0 text-[17px] leading-7 text-text-secondary max-w-130">
              {produto.descricao ?? "[DESCRIÇÃO DA PEÇA]"}
            </p>
            {produto.especificacoes.length > 0 && (
              <dl className="m-0 border-t-[1.5px] border-t-text">
                {produto.especificacoes.map(({ rotulo, valor }) => (
                  <div
                    key={rotulo}
                    className="flex justify-between gap-6 py-3.5 px-0 border-b border-b-border"
                  >
                    <dt className="text-[15px] leading-6 text-text-secondary">{rotulo}</dt>
                    <dd className="m-0 font-display font-bold text-[24px] leading-6 uppercase">
                      {valor}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Botao variante="escuro" grande href="/onde-comprar">
                <Icone nome="map-pin" /> Onde comprar
              </Botao>
              <LinkWhatsApp whatsapp={conteudo.whatsapp} className={classesBotao({ variante: "secundario", grande: true })}>
                <Icone nome="message" /> Falar no WhatsApp
              </LinkWhatsApp>
            </div>
            <ul className="list-none m-0 p-0 flex flex-col border-t border-t-border">
              <li className={garantia}>
                <span className="text-[22px] text-brand">
                  <Icone nome="shield" />
                </span>
                <span className="flex-[1_1_200px] text-[15px] leading-6">
                  <b className="font-semibold">Garantia de {produto.garantiaMeses ?? conteudo.garantiaMeses ?? "[N]"} meses</b> contra defeito de fabricação
                </span>
                <Link href="/garantia" className="font-semibold text-[14px] leading-5">
                  Como acionar
                </Link>
              </li>
              {produto.inmetro && (
                <li className={garantia}>
                  <Selo tom="escuro">
                    Inmetro
                  </Selo>
                  <span className="flex-[1_1_200px] text-[15px] leading-6">Registro nº {produto.inmetro}</span>
                </li>
              )}
              {produto.fichaTecnica && (
                <li className={garantia}>
                  <span className="text-[22px] text-text-muted">
                    <Icone nome="file" />
                  </span>
                  <span className="flex-[1_1_200px] text-[15px] leading-6">Ficha técnica e instruções de instalação</span>
                  <a href={produto.fichaTecnica} className="font-semibold text-[14px] leading-5">
                    Baixar PDF
                  </a>
                </li>
              )}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-6 py-4 px-5 bg-bg-subtle rounded-lg">
              <span className="text-[15px] leading-6">É lojista ou tem oficina?</span>
              <Link href="/seja-revendedor" className="font-semibold text-[15px] leading-6">
                Peça a tabela de revenda
              </Link>
            </div>
          </div>
        </section>

        {(produto.motos.length > 0 || produto.itensCaixa.length > 0) && (
          <section className="px-(--margem) pt-0 pb-28 flex flex-wrap gap-y-16 gap-x-18">
            {produto.motos.length > 0 && (
              <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-6">
                <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">Serve em</h2>
                <table className="w-full [border-collapse:collapse] text-[16px] leading-6 border-t-[1.5px] border-t-text">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-0 border-b border-b-border font-semibold text-[12px] leading-4 tracking-[.2em] uppercase text-text-muted">Modelo</th>
                      <th className="text-left py-3 px-0 border-b border-b-border font-semibold text-[12px] leading-4 tracking-[.2em] uppercase text-text-muted">Anos</th>
                      <th className="text-left py-3 px-0 border-b border-b-border font-semibold text-[12px] leading-4 tracking-[.2em] uppercase text-text-muted">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produto.motos.map((c) => (
                      <tr key={c.slug}>
                        <td className="py-3.5 px-0 border-b border-b-border font-semibold">{c.modelo}</td>
                        <td className="py-3.5 px-0 border-b border-b-border text-text-secondary">{c.anos ?? "[ANOS]"}</td>
                        <td className="py-3.5 px-0 border-b border-b-border text-text-secondary">{c.observacao ?? "[OBSERVAÇÃO]"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {produto.itensCaixa.length > 0 && (
              <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-6">
                <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">Na caixa</h2>
                <ul className="list-none m-0 p-0 border-t-[1.5px] border-t-text">
                  {produto.itensCaixa.map((item) => (
                    <li
                      key={item.descricao}
                      className="flex gap-4 items-baseline py-3.5 px-0 border-b border-b-border"
                    >
                      <span className="font-display font-extrabold text-[28px] leading-7 text-brand">
                        {item.quantidade}
                      </span>
                      <span className="text-[17px] leading-7">{item.descricao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {mesmaAplicacao.length > 0 && (
          <section className="bg-bg-subtle py-24 px-(--margem) flex flex-col gap-12">
            <div className="flex flex-wrap justify-between items-end gap-6">
              <div className="flex flex-col gap-4">
                <span className={rotulo}>Para a mesma moto</span>
                <h2 className={tituloH2}>
                  Mais peças
                  <br />
                  para {moto.nome}
                </h2>
              </div>
              <Link
                href={{ pathname: "/catalogo", query: { moto: moto.slug } }}
                className="font-semibold text-[16px] leading-5 py-3 px-0"
              >
                Ver todas
              </Link>
            </div>
            <div className="grid [grid-template-columns:repeat(auto-fill,_minmax(260px,_1fr))] gap-8">
              {mesmaAplicacao.map((p) => (
                <CartaoProduto key={p.slug} produto={p} fundoFoto="var(--bg)" />
              ))}
            </div>
          </section>
        )}
    </>
  );
}
