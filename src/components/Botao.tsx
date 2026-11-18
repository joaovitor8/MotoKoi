import Link from "next/link";
import type { ComponentProps } from "react";

// Botão do design system (antigo .mk-btn). Com `href` vira link; com `apagado` vira texto sem ação
// (ex.: "Anterior" na primeira página); sem nenhum dos dois é um <button>.
export type Variante = "primario" | "secundario" | "escuro" | "fantasma" | "inverso" | "perigo" | "perigoFantasma";
type Estilo = { variante: Variante; grande?: boolean; bloco?: boolean };

const cores: Record<Variante, string> = {
  primario: "border-transparent bg-brand text-text-on-brand hover:bg-brand-hover",
  secundario: "border-border-strong bg-bg text-text hover:border-text",
  escuro: "border-transparent bg-text text-text-inverse",
  fantasma: "border-transparent bg-transparent text-text-brand hover:underline",
  inverso: "border-text-inverse bg-transparent text-text-inverse",
  // Ações que apagam dados (painel).
  perigo: "border-border-danger bg-bg text-text-danger",
  perigoFantasma: "border-transparent bg-transparent text-text-danger hover:underline",
};

// Também usada direto em quem já renderiza o próprio elemento (ex.: LinkWhatsApp).
export function classesBotao({ variante, grande, bloco }: Estilo) {
  return [
    bloco ? "box-border flex w-full" : "inline-flex",
    "cursor-pointer items-center justify-center gap-2 rounded-md border-[1.5px] border-solid font-sans font-semibold whitespace-nowrap no-underline",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    grande ? "py-4 text-[16px] leading-5 [&_.mk-ico]:text-[20px]" : "py-3 text-[14px] leading-4 [&_.mk-ico]:text-[16px]",
    variante === "fantasma" || variante === "perigoFantasma" ? "px-0" : grande ? "px-6" : "px-4",
    cores[variante],
  ].join(" ");
}

type Props = Estilo &
  (
    | ({ href: ComponentProps<typeof Link>["href"]; apagado?: undefined } & Omit<ComponentProps<typeof Link>, "href">)
    | ({ href?: undefined; apagado: true } & ComponentProps<"span">)
    | ({ href?: undefined; apagado?: undefined } & ComponentProps<"button">)
  );

export function Botao({ variante, grande, bloco, className, ...resto }: Props) {
  const classes = `${classesBotao({ variante, grande, bloco })} ${className ?? ""}`;
  if (resto.href !== undefined) return <Link {...(resto as ComponentProps<typeof Link>)} className={classes} />;
  if (resto.apagado) {
    const span = { ...(resto as ComponentProps<"span"> & { apagado?: true }) };
    delete span.apagado; // não vai para o HTML
    return <span {...span} className={`${classes} opacity-45`} />;
  }
  return <button {...(resto as ComponentProps<"button">)} className={classes} />;
}
