import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { EspacoFoto } from "@/components/EspacoFoto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { obterConteudo } from "@/lib/conteudo";
import { listarProdutos } from "@/lib/produtos";

export const metadata: Metadata = { title: "A marca" };

const valores = [
  { titulo: "Confiança", texto: "Cada peça com código, aplicação e a marca na caixa." },
  { titulo: "Qualidade", texto: "Kit transmissão fabricado em aço 1045." },
  { titulo: "Durabilidade", texto: "Feita para a moto que roda todo dia." },
];

const tituloBloco = { display: "flex", flexDirection: "column", gap: 16 } as const;
const paragrafo = { margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" };

export default async function AMarca() {
  const [conteudo, produtos] = await Promise.all([obterConteudo(), listarProdutos()]);
  // Selo do Inmetro: só com registro cadastrado em algum produto publicado.
  const certificado = produtos.find((p) => p.inmetro);
  return (
    <>
      <Cabecalho atual="/a-marca" />
      <main>
        <section style={{ padding: "72px var(--margem) 96px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "40px 72px" }}>
          <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <span className="st-rotulo">A marca</span>
            <h1 className="st-h1">
              Contra a
              <br />
              <span style={{ color: "var(--brand)" }}>correnteza</span>
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 20, lineHeight: "32px", color: "var(--text-secondary)", flex: "1 1 380px", maxWidth: 520 }}>
            O koi é conhecido por nadar rio acima, sem parar. É a ideia por trás de cada peça MotoKoi: resistir ao uso de
            todo dia.
          </p>
        </section>

        <section style={{ padding: "0 var(--margem) 112px" }}>
          <EspacoFoto texto="[FOTO: as peças e as caixas MotoKoi, em fundo claro]" proporcao="21 / 9" icone={64} />
        </section>

        <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexWrap: "wrap", gap: "40px 72px" }}>
          <div style={{ ...tituloBloco, flex: "1 1 360px", minWidth: 0 }}>
            <span className="st-rotulo">Nossa história</span>
            <h2 className="st-h2">
              De onde
              <br />
              viemos
            </h2>
          </div>
          <div
            style={{
              flex: "1 1 520px",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              paddingTop: 24,
              borderTop: "1.5px solid var(--text)",
            }}
          >
            <p style={{ margin: 0, fontSize: 20, lineHeight: "32px", color: "var(--text-secondary)" }}>
              A MotoKoi nasceu em 2018, em Araçatuba, SP, dentro da Mac Atacado. Os lojistas pediam peças de reposição com
              preço justo e que durassem, e a resposta foi criar uma marca própria, começando pelo kit transmissão. (EX)
            </p>
            <p style={paragrafo}>Depois vieram os cabos, os carburadores, os discos de embreagem, as câmaras de ar e as capas de chuva. Hoje a linha chega a lojas e oficinas de cinco estados. (EX)</p>
          </div>
        </section>

        <section
          style={{
            background: "var(--bg-subtle)",
            padding: "112px var(--margem)",
            display: "flex",
            flexDirection: "column",
            gap: 56,
          }}
        >
          <div style={tituloBloco}>
            <span className="st-rotulo">O que está na caixa</span>
            <h2 className="st-h2">
              Feita para
              <br />
              aguentar
            </h2>
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
                <p style={{ ...paragrafo, maxWidth: 360 }}>{v.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "112px var(--margem)", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px 48px" }}>
            <div style={tituloBloco}>
              <span className="st-rotulo">Qualidade que dá para conferir</span>
              <h2 className="st-h2">
                O que garante
                <br />
                cada peça
              </h2>
            </div>
            <Link className="mk-btn mk-btn--secondary" href="/garantia">
              Ver a garantia <Icone nome="arrow-right" />
            </Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
            {[
              { titulo: `Garantia de ${conteudo.garantiaMeses ?? "[N]"} meses`, texto: "Contra defeito de fabricação, acionada pela loja onde a peça foi comprada." },
              {
                titulo: "Inmetro",
                texto: certificado
                  ? `${certificado.nome} certificado, registro nº ${certificado.inmetro}`
                  : "[SE TIVER: kit transmissão certificado, registro nº ...]",
              },
              { titulo: "Código original", texto: "Cada peça indica o código da montadora equivalente." },
              { titulo: "Aço 1045", texto: "Coroa e pinhão do kit transmissão em aço de médio carbono." },
            ].map((g) => (
              <div key={g.titulo} style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8, paddingTop: 20, borderTop: "1.5px solid var(--text)" }}>
                <b style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, lineHeight: "28px", textTransform: "uppercase" }}>{g.titulo}</b>
                <span style={{ fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>{g.texto}</span>
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
            padding: "96px var(--margem)",
          }}
        >
          <Ondas />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "32px 64px" }}>
            <h2 className="st-h2">
              Conheça
              <br />a linha
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="mk-btn mk-btn--dark mk-btn--lg" href="/catalogo">
                Ver o catálogo <Icone nome="arrow-right" />
              </Link>
              <Link className="mk-btn mk-btn--inverse mk-btn--lg" href="/seja-revendedor">
                Seja revendedor
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
