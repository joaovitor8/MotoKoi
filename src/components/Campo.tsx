import type { ReactNode } from "react";

// Campo de formulário do design system (antigo .mk-field). O controle (a caixa com borda) é um <span> com
// `classesControle`, e o <input> ou <select> vai dentro dele.
export const classesCampo = "flex flex-col gap-1 font-sans";
export const classesRotulo = "text-[14px] leading-4 font-semibold text-text";
export const classesAjuda = "text-[12px] leading-4 font-medium text-text-muted";
export const classesControle = [
  "box-border flex h-12 items-center gap-2 rounded-md border-[1.5px] border-solid border-border-strong bg-bg px-4 text-[16px] text-text",
  "[&_.mk-ico]:text-[20px] [&_.mk-ico]:text-text-muted",
  // O <input> perde o visual do navegador e herda o do controle. O "!" garante que vença o "all: unset".
  "[&_input]:[all:unset] [&_input]:flex-1! [&_input]:text-[16px]! [&_input]:leading-6!",
  // Foco pelo teclado: o contorno vai na caixa inteira, não só no campo.
  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus [&_select:focus-visible]:outline-none",
].join(" ");

export function Campo({
  rotulo,
  ajuda,
  children,
  className,
}: {
  rotulo: string;
  ajuda?: string;
  children: ReactNode; // o <span className={classesControle}> com o campo dentro
  className?: string; // largura no layout de cada tela (ex.: "flex-1 min-w-0")
}) {
  return (
    <label className={`${classesCampo} ${className ?? ""}`}>
      <span className={classesRotulo}>{rotulo}</span>
      {children}
      {ajuda && <span className={classesAjuda}>{ajuda}</span>}
    </label>
  );
}
