import type { CSSProperties } from "react";
import { Icone } from "./Icone";

// Espaço cinza com o texto [FOTO ...], usado enquanto as fotos reais não chegam.
export function EspacoFoto({
  texto,
  proporcao,
  icone,
  style,
}: {
  texto: string;
  proporcao: string;
  icone: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        aspectRatio: proporcao,
        background: "var(--bg-subtle)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        color: "var(--text-muted)",
        textAlign: "center",
        padding: 16,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <span style={{ fontSize: icone }}>
        <Icone nome="package" />
      </span>
      <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 500 }}>{texto}</span>
    </div>
  );
}
