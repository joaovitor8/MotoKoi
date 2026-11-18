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
      className="box-border flex flex-col items-center justify-center gap-1.5 rounded-lg bg-bg-subtle p-4 text-center text-text-muted"
      style={{ aspectRatio: proporcao, ...style }}
    >
      <span style={{ fontSize: icone }}>
        <Icone nome="package" />
      </span>
      <span className="text-[12px] leading-4 font-medium">{texto}</span>
    </div>
  );
}
