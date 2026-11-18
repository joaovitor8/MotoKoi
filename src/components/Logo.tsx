import Link from "next/link";

// Logo provisório, só tipografia (antigo .mk-logo).
// tom: "normal" (fundo branco), "inverso" (fundo preto do painel), "branco" (fundo vermelho: tudo branco).
const tons = {
  normal: "text-text [&_b]:text-brand",
  inverso: "text-text-inverse [&_b]:text-text-brand-on-dark",
  branco: "text-text-inverse [&_b]:text-text-on-brand",
};

export function Logo({ tom = "normal", href, className }: { tom?: keyof typeof tons; href?: string; className?: string }) {
  const classes = `font-display text-[32px] leading-none font-extrabold tracking-[0] whitespace-nowrap no-underline uppercase [&_b]:font-extrabold ${tons[tom]} ${className ?? ""}`;
  const conteudo = (
    <>
      Moto<b>Koi</b>
    </>
  );
  return href ? (
    <Link href={href} className={classes}>
      {conteudo}
    </Link>
  ) : (
    <span className={classes}>
      {conteudo}
    </span>
  );
}
