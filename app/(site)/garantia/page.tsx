import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { obterConteudo } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Garantia" };

// Itens sugeridos no design. Os termos finais da garantia devem vir do dono da MotoKoi.
const cobre = [
  "Defeito de fabricação no material ou no acabamento",
  "Peça que não corresponde à aplicação indicada no catálogo",
  "[OUTRO ITEM, A CONFIRMAR COM O DONO]",
];
const naoCobre = ["Desgaste natural pelo uso", "Instalação incorreta ou falta de manutenção", "[OUTRO ITEM, A CONFIRMAR COM O DONO]"];

const h2 = { margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" } as const;
const item = { display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border)", fontSize: 16, lineHeight: "24px" } as const;
const lista = { listStyle: "none", margin: 0, padding: 0, borderTop: "1.5px solid var(--text)" } as const;

export default async function Garantia() {
  const conteudo = await obterConteudo();
  const passos = [
    { titulo: "Guarde a nota", texto: "A nota fiscal da compra é o comprovante da garantia." },
    { titulo: "Volte à loja", texto: "Leve a peça e a nota à loja onde comprou." },
    { titulo: "Análise", texto: "A loja envia a peça para a MotoKoi avaliar." },
    { titulo: "Resposta", texto: `Retorno em até ${conteudo.garantiaPrazoResposta ?? "[N]"} dias úteis, com troca se o defeito for confirmado.` },
  ];

  return (
    <>
      <Cabecalho atual="/garantia" />
      <main>
        <section style={{ padding: "72px var(--margem) 96px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "40px 72px" }}>
          <div style={{ flex: "1 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <span className="st-rotulo">Garantia</span>
            <h1 className="st-h1">
              {conteudo.garantiaMeses ?? "[N]"} meses
              <br />
              de garantia
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 20, lineHeight: "32px", color: "var(--text-secondary)", flex: "1 1 380px", maxWidth: 520 }}>
            Toda peça MotoKoi tem garantia contra defeito de fabricação. Veja o que está coberto e como acionar.
          </p>
        </section>

        <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexWrap: "wrap", gap: "48px 72px" }}>
          <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={h2}>O que a garantia cobre</h2>
            <ul style={lista}>
              {cobre.map((texto) => (
                <li key={texto} style={item}>
                  <span style={{ fontSize: 22, color: "var(--brand)" }}>
                    <Icone nome="check" />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ flex: "1 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={h2}>O que não cobre</h2>
            <ul style={lista}>
              {naoCobre.map((texto) => (
                <li key={texto} style={item}>
                  <span style={{ fontSize: 22, color: "var(--text-muted)" }}>
                    <Icone nome="x" />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
          <p style={{ flex: "1 1 100%", margin: 0, fontSize: 14, lineHeight: "22px", color: "var(--text-muted)" }}>
            Itens sugeridos. Os termos finais da garantia devem vir do dono da MotoKoi.
          </p>
        </section>

        <section style={{ background: "var(--bg-subtle)", padding: "112px var(--margem)", display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="st-rotulo">Como acionar</span>
            <h2 className="st-h2">Quatro passos</h2>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 32 }}>
            {passos.map((p, i) => (
              <li key={p.titulo} style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10, paddingTop: 20, borderTop: "1.5px solid var(--text)" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 56, lineHeight: 0.9, color: "var(--brand)" }}>{i + 1}</span>
                <b style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, lineHeight: "26px", textTransform: "uppercase" }}>{p.titulo}</b>
                <span style={{ fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>{p.texto}</span>
              </li>
            ))}
          </ol>
        </section>

        <section style={{ padding: "96px var(--margem)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px 64px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
            <h2 style={h2}>É lojista e precisa acionar?</h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>
              Fale direto com a MotoKoi pelo WhatsApp e envie fotos da peça e da nota.
            </p>
          </div>
          <a className="mk-btn mk-btn--dark mk-btn--lg" href={conteudo.whatsapp?.link ?? "#"}>
            <Icone nome="message" /> WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
          </a>
        </section>
      </main>
    </>
  );
}
