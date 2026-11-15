import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { listarPontosDeVenda } from "@/lib/produtos";

export const metadata: Metadata = { title: "Onde comprar" };

const TIPOS = { loja_propria: "Loja própria", revendedor: "Revendedor" };
const mapa = (endereco: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
// wa.me pede o número só com dígitos e com o código do país.
const whatsapp = (numero: string) => {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
};

export default async function OndeComprar() {
  const pontos = await listarPontosDeVenda();
  return (
    <>
      <Cabecalho atual="/onde-comprar" />
      <main>
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
            <span className="st-rotulo">Onde comprar</span>
            <h1 className="st-h1">
              Perto
              <br />
              de você
            </h1>
          </div>
          <label
            style={{
              flex: "1 1 420px",
              maxWidth: 600,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 0",
              borderBottom: "2px solid var(--text)",
            }}
          >
            <span style={{ fontSize: 26, color: "var(--text-muted)" }}>
              <Icone nome="map-pin" />
            </span>
            <input
              aria-label="Buscar por cidade ou CEP"
              placeholder="Digite sua cidade ou CEP"
              style={{ all: "unset", flexGrow: 1, minWidth: 0, fontSize: 22, lineHeight: "36px" }}
            />
          </label>
        </section>

        <section style={{ padding: "0 var(--margem) 96px", display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "32px 48px" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ fontWeight: 600, fontSize: 16, lineHeight: "24px", paddingBottom: 16, borderBottom: "1.5px solid var(--text)" }}>
              {pontos.length} {pontos.length === 1 ? "ponto de venda" : "pontos de venda"}
            </span>
            {pontos.map((p, i) => (
              <article key={p.id} className="mk-store" style={{ width: "auto", border: i === 0 ? "1.5px solid var(--text)" : undefined }}>
                <span className="mk-store__type">{TIPOS[p.tipo]}</span>
                <h2 className="mk-store__name" style={{ textTransform: "uppercase", fontWeight: 700 }}>
                  {p.nome}
                </h2>
                <span className="mk-store__addr">
                  <Icone nome="map-pin" />
                  <span>
                    {p.endereco} · {p.cidade}, {p.uf}
                  </span>
                </span>
                <span className="mk-store__hours">{p.horario ?? "[HORÁRIO DE FUNCIONAMENTO]"}</span>
                <div className="mk-store__actions">
                  <a className="mk-btn mk-btn--secondary" href={mapa(`${p.endereco}, ${p.cidade}, ${p.uf}`)}>
                    Como chegar
                  </a>
                  {p.whatsapp && (
                    <a className="mk-btn mk-btn--ghost" href={whatsapp(p.whatsapp)}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div
            style={{
              flex: "2 1 560px",
              minWidth: 0,
              minHeight: 560,
              background: "var(--bg-subtle)",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "var(--text-muted)",
              textAlign: "center",
              padding: 24,
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 64, color: "var(--brand)" }}>
              <Icone nome="map-pin" />
            </span>
            <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500 }}>[MAPA com os pontos de venda]</span>
          </div>
        </section>

        {/* A faixa vermelha "Peça pelo site da Mac Atacado" da tela de referência saiu por decisão do João (12/11/2026). */}
        <section
          style={{
            padding: "96px var(--margem)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" }}>
              Não achou um ponto perto?
            </h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>
              Fale com a gente. Indicamos a loja mais próxima ou mostramos como comprar online.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a className="mk-btn mk-btn--secondary mk-btn--lg" href="#">
              <Icone nome="message" /> WhatsApp [NÚMERO]
            </a>
            <Link className="mk-btn mk-btn--ghost mk-btn--lg" href="/seja-revendedor">
              Tem loja? Seja revendedor
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
