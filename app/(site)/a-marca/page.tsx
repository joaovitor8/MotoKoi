import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { EspacoFoto } from "@/components/EspacoFoto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";

export const metadata: Metadata = { title: "A marca" };

const valores = [
  { titulo: "Confiança", texto: "Cada peça com código, aplicação e a marca na caixa." },
  { titulo: "Qualidade", texto: "Kit transmissão fabricado em aço 1045." },
  { titulo: "Durabilidade", texto: "Feita para a moto que roda todo dia." },
];

const tituloBloco = { display: "flex", flexDirection: "column", gap: 16 } as const;
const paragrafo = { margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" };

export default function AMarca() {
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
              [HISTÓRIA DA MARCA: em que ano começou, em qual cidade e por quê. Dois ou três parágrafos curtos, contados
              pelo dono.]
            </p>
            <p style={paragrafo}>[O QUE MUDOU DESDE ENTÃO: novas linhas de peças, lojas, revendedores.]</p>
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

        <section style={{ padding: "112px var(--margem)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "48px 72px" }}>
          <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(140px, 19vw, 280px)",
                lineHeight: 0.8,
                letterSpacing: "-.02em",
                color: "var(--brand)",
              }}
            >
              1045
            </span>
            <span className="st-rotulo" style={{ color: "var(--text-muted)", paddingTop: 20 }}>
              O aço do kit transmissão
            </span>
          </div>
          <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" }}>
              Por que o aço importa
            </h2>
            <p style={paragrafo}>
              Coroa e pinhão trabalham sob atrito o tempo todo. O aço 1045 é um aço de médio carbono, usado em peças que
              precisam resistir a desgaste e a esforço.
            </p>
            <p style={paragrafo}>[DETALHE DO PROCESSO: tratamento térmico, controle de qualidade, origem das peças.]</p>
            <div>
              <Link className="mk-btn mk-btn--secondary" href="/catalogo/kit-transmissao-titan-150">
                Ver o kit transmissão <Icone nome="arrow-right" />
              </Link>
            </div>
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
