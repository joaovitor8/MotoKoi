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

type Props = PageProps<"/catalogo/[slug]">;

export async function generateStaticParams() {
  return (await listarProdutos()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: (await listarProdutos()).find((p) => p.slug === slug)?.nome };
}

const h2 = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 32,
  lineHeight: "34px",
  textTransform: "uppercase",
} as const;
const th = {
  textAlign: "left",
  padding: "12px 0",
  borderBottom: "1px solid var(--border)",
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "16px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
} as const;
const garantia = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 16px", padding: "14px 0", borderBottom: "1px solid var(--border)" } as const;
const td = { padding: "14px 0", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" };

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
          style={{
            padding: "24px var(--margem) 0",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 14,
            lineHeight: "20px",
            color: "var(--text-muted)",
          }}
        >
          <Link href="/catalogo" style={{ color: "var(--text-muted)" }}>
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/catalogo?categoria=${produto.categoria.slug}`} style={{ color: "var(--text-muted)" }}>
            {produto.categoria.nome}
          </Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: "var(--text)" }}>{produto.nome}</span>
        </nav>

        <section
          style={{
            padding: "32px var(--margem) 96px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: "48px 72px",
          }}
        >
          <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {produto.fotos.length > 0 ? (
              <Galeria fotos={produto.fotos} />
            ) : (
              <>
                <EspacoFoto
                  texto="[FOTO PRINCIPAL]"
                  proporcao="1 / 1"
                  icone={64}
                />
                <div style={{ display: "flex", gap: 16 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: "1 1 0",
                        minWidth: 0,
                        border: n === 1 ? "2px solid var(--text)" : "1px solid var(--border)",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <EspacoFoto texto={`[FOTO ${n}]`} proporcao="1 / 1" icone={24} style={{ borderRadius: 0 }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ flex: "1 1 440px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <span className="st-rotulo">{produto.categoria.nome}</span>
              {produto.novidade && <span className="mk-badge mk-badge--brand">Novidade</span>}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(52px, 5.6vw, 84px)",
                lineHeight: 0.9,
                letterSpacing: "-.01em",
                textTransform: "uppercase",
              }}
            >
              {produto.nome}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 20px", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
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
            <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 520 }}>
              {produto.descricao ?? "[DESCRIÇÃO DA PEÇA]"}
            </p>
            {produto.especificacoes.length > 0 && (
              <dl style={{ margin: 0, borderTop: "1.5px solid var(--text)" }}>
                {produto.especificacoes.map(({ rotulo, valor }) => (
                  <div
                    key={rotulo}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 24,
                      padding: "14px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <dt style={{ fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>{rotulo}</dt>
                    <dd
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 24,
                        lineHeight: "24px",
                        textTransform: "uppercase",
                      }}
                    >
                      {valor}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingTop: 8 }}>
              <Link className="mk-btn mk-btn--dark mk-btn--lg" href="/onde-comprar">
                <Icone nome="map-pin" /> Onde comprar
              </Link>
              <a className="mk-btn mk-btn--secondary mk-btn--lg" href={conteudo.whatsapp?.link ?? "#"}>
                <Icone nome="message" /> Falar no WhatsApp
              </a>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", borderTop: "1px solid var(--border)" }}>
              <li style={garantia}>
                <span style={{ fontSize: 22, color: "var(--brand)" }}>
                  <Icone nome="shield" />
                </span>
                <span style={{ flex: "1 1 200px", fontSize: 15, lineHeight: "24px" }}>
                  <b style={{ fontWeight: 600 }}>Garantia de {produto.garantiaMeses ?? conteudo.garantiaMeses ?? "[N]"} meses</b> contra defeito de fabricação
                </span>
                <Link href="/garantia" style={{ fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>
                  Como acionar
                </Link>
              </li>
              {produto.inmetro && (
                <li style={garantia}>
                  <span className="mk-badge" style={{ background: "var(--text)", color: "var(--text-inverse)" }}>
                    Inmetro
                  </span>
                  <span style={{ flex: "1 1 200px", fontSize: 15, lineHeight: "24px" }}>Registro nº {produto.inmetro}</span>
                </li>
              )}
              {produto.fichaTecnica && (
                <li style={garantia}>
                  <span style={{ fontSize: 22, color: "var(--text-muted)" }}>
                    <Icone nome="file" />
                  </span>
                  <span style={{ flex: "1 1 200px", fontSize: 15, lineHeight: "24px" }}>Ficha técnica e instruções de instalação</span>
                  <a href={produto.fichaTecnica} style={{ fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>
                    Baixar PDF
                  </a>
                </li>
              )}
            </ul>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px 24px",
                padding: "16px 20px",
                background: "var(--bg-subtle)",
                borderRadius: 8,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: "24px" }}>É lojista ou tem oficina?</span>
              <Link href="/seja-revendedor" style={{ fontWeight: 600, fontSize: 15, lineHeight: "24px" }}>
                Peça a tabela de revenda
              </Link>
            </div>
          </div>
        </section>

        {(produto.motos.length > 0 || produto.itensCaixa.length > 0) && (
          <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexWrap: "wrap", gap: "64px 72px" }}>
            {produto.motos.length > 0 && (
              <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={h2}>Serve em</h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 16,
                    lineHeight: "24px",
                    borderTop: "1.5px solid var(--text)",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={th}>Modelo</th>
                      <th style={th}>Anos</th>
                      <th style={th}>Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produto.motos.map((c) => (
                      <tr key={c.slug}>
                        <td style={{ ...td, color: undefined, fontWeight: 600 }}>{c.modelo}</td>
                        <td style={td}>{c.anos ?? "[ANOS]"}</td>
                        <td style={td}>{c.observacao ?? "[OBSERVAÇÃO]"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {produto.itensCaixa.length > 0 && (
              <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
                <h2 style={h2}>Na caixa</h2>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1.5px solid var(--text)" }}>
                  {produto.itensCaixa.map((item) => (
                    <li
                      key={item.descricao}
                      style={{
                        display: "flex",
                        gap: 16,
                        alignItems: "baseline",
                        padding: "14px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 28,
                          lineHeight: "28px",
                          color: "var(--brand)",
                        }}
                      >
                        {item.quantidade}
                      </span>
                      <span style={{ fontSize: 17, lineHeight: "28px" }}>{item.descricao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {mesmaAplicacao.length > 0 && (
          <section
            style={{
              background: "var(--bg-subtle)",
              padding: "96px var(--margem)",
              display: "flex",
              flexDirection: "column",
              gap: 48,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span className="st-rotulo">Para a mesma moto</span>
                <h2 className="st-h2">
                  Mais peças
                  <br />
                  para {moto.nome}
                </h2>
              </div>
              <Link
                href={{ pathname: "/catalogo", query: { moto: moto.slug } }}
                style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", padding: "12px 0" }}
              >
                Ver todas
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 32 }}>
              {mesmaAplicacao.map((p) => (
                <CartaoProduto key={p.slug} produto={p} fundoFoto="var(--bg)" />
              ))}
            </div>
          </section>
        )}
    </>
  );
}
