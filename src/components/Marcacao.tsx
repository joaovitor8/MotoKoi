import type { ComponentProps, ReactNode } from "react";
import { Icone } from "./Icone";

// Caixa de marcação do design system (antigo .mk-check).
export const classesMarcacao = "relative inline-flex cursor-pointer items-center gap-2 font-sans text-[14px] leading-5 text-text";

// A caixinha. `marcada` serve para quando não há <input> (filtro de moto do catálogo, que é um link).
// Com <input> antes dela, o estado vem do próprio input (peer-checked).
export function CaixaMarcacao({ marcada }: { marcada?: boolean }) {
  const estado = marcada
    ? "border-brand bg-brand [&_.mk-ico]:visible"
    : "border-border-strong bg-bg [&_.mk-ico]:invisible peer-checked:border-brand peer-checked:bg-brand peer-checked:[&_.mk-ico]:visible";
  return (
    <span
      className={`box-border grid size-5 place-items-center rounded-sm border-[1.5px] border-solid text-text-on-brand [&_.mk-ico]:text-[14px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${estado}`}
    >
      <Icone nome="check" />
    </span>
  );
}

// Checkbox de verdade: o <input> fica invisível por cima da caixinha, então clique e teclado funcionam normalmente.
export function Marcacao({ children, ...input }: { children: ReactNode } & ComponentProps<"input">) {
  return (
    <label className={classesMarcacao} data-marcacao="">
      <input {...input} type="checkbox" className="peer absolute m-0 size-5 cursor-pointer opacity-0" />
      <CaixaMarcacao />
      {children}
    </label>
  );
}
