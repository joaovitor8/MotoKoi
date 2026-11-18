import Image from "next/image";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoProduto } from "@/components/CartaoProduto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { anoAtual, obterConteudo } from "@/lib/conteudo";
import { listarCategorias, listarMotos, listarProdutos } from "@/lib/produtos";
import { BuscaPorMoto } from "./BuscaPorMoto";

const numerosRevenda = [
  { numero: "3", texto: "lojas próprias" },
  { numero: "48h", texto: "tempo médio de resposta ao cadastro" },
  { numero: "R$ 0", texto: "de taxa de adesão ou mensalidade" },
];

const cabecalhoSecao = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 } as const;
const tituloSecao = { display: "flex", flexDirection: "column", gap: 16 } as const;
const linkTexto = { fontWeight: 600, fontSize: 16, lineHeight: "20px", padding: "12px 0" };

export default async function Home() {
  const [categorias, motos, produtos, conteudo, ano] = await Promise.all([listarCategorias(), listarMotos(), listarProdutos(), obterConteudo(), anoAtual()]);
  // Selo do Inmetro: só existe se algum produto publicado tiver registro cadastrado no painel.
  const certificado = produtos.find((p) => p.inmetro);
  return (
    <>
      <Cabecalho />
      <main>
        <section style={{ position: "relative", overflow: "hidden", padding: "0 var(--margem) 56px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, paddingTop: 12 }}>
            <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
              <span className="st-rotulo" style={{ color: "var(--text-muted)" }}>
                Peças para motocicletas
              </span>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(60px, 7.2vw, 104px)",
                  lineHeight: 0.86,
                  letterSpacing: "-.015em",
                  textTransform: "uppercase",
                }}
              >
                Peças que
                <br />
                aguentam
                <br />o <span style={{ color: "var(--brand)" }}>giro</span>
              </h1>
              <p style={{ margin: 0, fontSize: 18, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 520 }}>
                O koi sobe o rio sem parar, contra a correnteza. As peças MotoKoi foram feitas para o mesmo: aguentar,
                todo dia.
              </p>
              <BuscaPorMoto motos={motos} anoAtual={ano} />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 24px" }}>
                <Link href="/catalogo" style={{ ...linkTexto, padding: "8px 0" }}>
                  Ver o catálogo
                </Link>
                <Link href="/seja-revendedor" style={{ ...linkTexto, padding: "8px 0" }}>
                  Seja revendedor
                </Link>
              </div>
            </div>
            <div
              className="st-coroa"
              style={{
                flex: "1 1 420px",
                maxWidth: 740,
                minWidth: 0,
                position: "relative",
                marginRight: -96,
                paddingLeft: 40,
                boxSizing: "border-box",
              }}
            >
              <Image
                src="/coroa.svg"
                alt=""
                width={760}
                height={760}
                loading="eager"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "12%",
                  writingMode: "vertical-rl",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(16px, 1.5vw, 22px)",
                  lineHeight: 1,
                  letterSpacing: ".22em",
                  textTransform: "uppercase",
                  color: "var(--text)",
                }}
              >
                Contra a correnteza
              </span>
            </div>
          </div>
        </section>

        <section style={{ padding: "112px var(--margem)", display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={cabecalhoSecao}>
            <div style={tituloSecao}>
              <span className="st-rotulo">A linha</span>
              <h2 className="st-h2">
                Tudo o que
                <br />
                leva a marca
              </h2>
            </div>
            <Link className="mk-btn mk-btn--secondary" href="/catalogo">
              Ver catálogo completo <Icone nome="arrow-right" />
            </Link>
          </div>
          <nav
            aria-label="Linhas de produto"
            style={{ display: "flex", flexDirection: "column", borderTop: "1.5px solid var(--text)" }}
          >
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/catalogo?categoria=${c.slug}`}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "baseline",
                  gap: "4px 32px",
                  padding: "22px 0",
                  borderBottom: "1px solid var(--border)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    flex: "1 1 320px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(34px, 4.2vw, 60px)",
                    lineHeight: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {c.nome}
                </span>
                <span style={{ flex: "1 1 280px", fontSize: 16, lineHeight: "24px", color: "var(--text-secondary)" }}>
                  {c.resumo}
                </span>
                <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>
                  {c.total} {c.total === 1 ? "peça" : "peças"}
                </span>
                <span style={{ fontSize: 28, color: "var(--brand)", alignSelf: "center" }}>
                  <Icone nome="arrow-right" />
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={cabecalhoSecao}>
            <div style={tituloSecao}>
              <span className="st-rotulo">Novidades</span>
              <h2 className="st-h2">Acabou de chegar</h2>
            </div>
            <Link href="/catalogo" style={linkTexto}>
              Ver todas as novidades
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 32 }}>
            {produtos
              .filter((p) => p.novidade)
              .slice(0, 4)
              .map((p) => (
                <CartaoProduto key={p.slug} produto={p} />
              ))}
          </div>
        </section>

        <section style={{ padding: "112px var(--margem)", display: "flex", flexDirection: "column", gap: 56 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px 64px" }}>
            <div style={tituloSecao}>
              <span className="st-rotulo">A marca</span>
              <h2 className="st-h2">
                Feita para
                <br />
                aguentar
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 18, lineHeight: "30px", color: "var(--text-secondary)", maxWidth: 520 }}>
              O koi é conhecido por nadar rio acima, contra a correnteza. É a ideia por trás de cada peça MotoKoi:
              resistir ao uso de todo dia.
            </p>
          </div>
          {conteudo.numeros.length > 0 && (
            <dl style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: 40 }}>
              {conteudo.numeros.map((n) => (
                // column-reverse: no HTML vem o rótulo (dt) e depois o número (dd); na tela, o número fica em cima.
                <div key={n.rotulo} style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column-reverse", justifyContent: "flex-end", gap: 10, paddingTop: 24, borderTop: "1.5px solid var(--text)" }}>
                  <dt style={{ fontSize: 16, lineHeight: "24px", color: "var(--text-secondary)", maxWidth: 260 }}>{n.rotulo}</dt>
                  <dd style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(56px, 6vw, 88px)", lineHeight: 0.9, color: "var(--brand)" }}>{n.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px", padding: "20px 24px", background: "var(--bg-subtle)", borderRadius: 8 }}>
            <span className="mk-badge" style={{ background: "var(--text)", color: "var(--text-inverse)" }}>
              Inmetro
            </span>
            <span style={{ fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>
              {certificado
                ? `${certificado.nome} certificado pelo Inmetro, registro nº ${certificado.inmetro}`
                : '[SE O KIT TIVER CERTIFICAÇÃO: "Kit transmissão certificado pelo Inmetro, registro nº ..."]'}
            </span>
            <Link href="/garantia" style={{ fontWeight: 600, fontSize: 15, lineHeight: "24px", marginLeft: "auto" }}>
              Como funciona a garantia
            </Link>
          </div>
        </section>

        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--brand)",
            color: "var(--text-on-brand)",
            padding: "112px var(--margem)",
          }}
        >
          <Ondas />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 56 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
                <span className="st-rotulo" style={{ color: "inherit" }}>
                  Para lojas e oficinas
                </span>
                <h2 className="st-h2">
                  Suba o rio
                  <br />
                  com a gente
                </h2>
                <p style={{ margin: 0, fontSize: 18, lineHeight: "28px", maxWidth: 560 }}>
                  Revenda uma linha com marca própria: preço de atacado, pedido mínimo acessível e suporte para reposição.
                </p>
              </div>
              <Link className="mk-btn mk-btn--dark mk-btn--lg" href="/seja-revendedor">
                Quero ser revendedor <Icone nome="arrow-right" />
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
              {numerosRevenda.map((n) => (
                <div
                  key={n.numero}
                  style={{
                    flex: "1 1 200px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 20,
                    borderTop: "1.5px solid var(--text-on-brand)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "clamp(56px, 6vw, 88px)",
                      lineHeight: 0.9,
                    }}
                  >
                    {n.numero}
                  </span>
                  <span style={{ fontSize: 16, lineHeight: "24px" }}>{n.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
