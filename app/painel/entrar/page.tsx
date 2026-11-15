import type { Metadata } from "next";
import { Ondas } from "@/components/Ondas";
import { FormularioEntrar } from "./FormularioEntrar";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexWrap: "wrap", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>
      <div
        style={{
          flex: "1 1 480px",
          minHeight: 360,
          position: "relative",
          overflow: "hidden",
          background: "var(--brand)",
          color: "var(--text-on-brand)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 48,
          padding: 48,
          boxSizing: "border-box",
        }}
      >
        <Ondas opacity={0.32} />
        <span className="mk-logo mk-logo--inverse" style={{ position: "relative" }}>
          Moto<b style={{ color: "var(--text-on-brand)" }}>Koi</b>
        </span>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
          <span className="st-rotulo" style={{ color: "inherit" }}>
            Painel administrativo
          </span>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(56px, 6.4vw, 96px)", lineHeight: 0.9, textTransform: "uppercase" }}>
            O catálogo
            <br />
            na sua mão
          </p>
          <p style={{ margin: 0, fontSize: 18, lineHeight: "28px", maxWidth: 440 }}>
            Cadastre peças, troque fotos e responda quem quer revender.
          </p>
        </div>
      </div>
      <main style={{ flex: "1 1 480px", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", boxSizing: "border-box" }}>
        <FormularioEntrar />
      </main>
    </div>
  );
}
