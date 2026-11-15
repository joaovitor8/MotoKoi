import Image from "next/image";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoProduto } from "@/components/CartaoProduto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { listarCategorias, listarMotos, listarProdutos } from "@/lib/produtos";

const valores = [
  { titulo: "Confiança", texto: "Cada peça com código, aplicação e a marca na caixa." },
  { titulo: "Qualidade", texto: "Kit transmissão fabricado em aço 1045." },
  { titulo: "Durabilidade", texto: "Feita para a moto que roda todo dia." },
];

const numeros = [
  { numero: "3", texto: "lojas próprias" },
  { numero: "48h", texto: "tempo médio de resposta ao cadastro" },
  { numero: "R$ 0", texto: "de taxa de adesão ou mensalidade" },
];

const cabecalhoSecao = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 } as const;
const tituloSecao = { display: "flex", flexDirection: "column", gap: 16 } as const;
const linkTexto = { fontWeight: 600, fontSize: 16, lineHeight: "20px", padding: "12px 0" };

export default async function Home() {
  const [categorias, motos, produtos] = await Promise.all([listarCategorias(), listarMotos(), listarProdutos()]);
  return (
    <>
      <Cabecalho />
      <main>
        <section style={{ position: "relative", overflow: "hidden", padding: "0 var(--margem) 56px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, paddingTop: 40 }}>
            <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
              <span className="st-rotulo" style={{ color: "var(--text-muted)" }}>
                Peças para motocicletas
              </span>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(72px, 10.2vw, 148px)",
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
              <p style={{ margin: 0, fontSize: 20, lineHeight: "32px", color: "var(--text-secondary)", maxWidth: 520 }}>
                O koi sobe o rio sem parar, contra a correnteza. As peças MotoKoi foram feitas para o mesmo: aguentar,
                todo dia.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px 24px" }}>
                <Link className="mk-btn mk-btn--dark mk-btn--lg" href="/catalogo">
                  Ver o catálogo <Icone nome="arrow-right" />
                </Link>
                <Link href="/seja-revendedor" style={linkTexto}>
                  Seja revendedor
                </Link>
              </div>
            </div>
            <div
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

        <section
          style={{
            background: "var(--bg-subtle)",
            padding: "112px var(--margem)",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <span className="st-rotulo">Busca por aplicação</span>
          <h2 className="st-h2">Qual é a sua moto?</h2>
          <form action="/catalogo" style={{ maxWidth: 880 }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "2px solid var(--text)" }}
            >
              <span style={{ fontSize: 28, color: "var(--text-muted)" }}>
                <Icone nome="search" />
              </span>
              <input
                name="busca"
                aria-label="Buscar modelo de moto"
                placeholder="Digite o modelo: Titan 150, Biz 125, YBR…"
                style={{ all: "unset", flexGrow: 1, minWidth: 0, fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: "40px" }}
              />
            </label>
          </form>
          <div role="group" aria-label="Modelos mais buscados" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {motos.map((moto) => (
              <Link
                key={moto.slug}
                href={{ pathname: "/catalogo", query: { moto: moto.slug } }}
                style={{
                  font: "600 16px/20px var(--font-sans)",
                  padding: "14px 20px",
                  borderRadius: 999,
                  border: "1.5px solid var(--border-strong)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                {moto.nome}
              </Link>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
            {valores.map((v) => (
              <div
                key={v.titulo}
                style={{
                  flex: "1 1 280px",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingTop: 24,
                  borderTop: "1.5px solid var(--text)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "clamp(40px, 4.4vw, 64px)",
                    lineHeight: 0.95,
                    textTransform: "uppercase",
                  }}
                >
                  {v.titulo}
                </h3>
                <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 360 }}>
                  {v.texto}
                </p>
              </div>
            ))}
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
              {numeros.map((n) => (
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
