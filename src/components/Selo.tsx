import type { ComponentProps } from "react";

// Selo do design system (antigo .mk-badge): "Novidade", "Publicado", "Inmetro"...
const tons = {
  neutro: "bg-bg-muted text-text-secondary",
  marca: "bg-brand-subtle text-text-brand",
  sucesso: "bg-success-subtle text-text-success",
  aviso: "bg-warning-subtle text-text-warning",
  solido: "bg-brand text-text-on-brand",
  escuro: "bg-text text-text-inverse",
};
export type Tom = keyof typeof tons;

export function Selo({ tom = "neutro", className, ...resto }: { tom?: Tom } & ComponentProps<"span">) {
  return (
    <span
      {...resto}
      className={`inline-flex items-center rounded-sm px-2 py-1 font-sans text-[12px] leading-4 font-semibold tracking-[0.08em] whitespace-nowrap uppercase ${tons[tom]} ${className ?? ""}`}
    />
  );
}
