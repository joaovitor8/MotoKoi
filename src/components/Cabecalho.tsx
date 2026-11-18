import Link from "next/link";
import { Logo } from "./Logo";

const itens = [
  { href: "/catalogo", rotulo: "Catálogo" },
  { href: "/a-marca", rotulo: "A marca" },
  { href: "/onde-comprar", rotulo: "Onde comprar" },
  { href: "/seja-revendedor", rotulo: "Revenda" },
] as const;

// `atual` é o href da página aberta. Na Home não se passa nada: sem traço e sem linha embaixo, como na tela.
// A Garantia não está no menu: passa o próprio endereço só para ganhar a linha, sem item marcado.
export function Cabecalho({ atual }: { atual?: (typeof itens)[number]["href"] | "/garantia" | "/privacidade" }) {
  return (
    <header className={`flex flex-wrap items-center gap-x-14 gap-y-4 px-(--margem) py-[22px] ${atual ? "border-b border-border" : ""}`}>
      <Logo href="/" />
      <nav aria-label="Principal" className="flex flex-wrap gap-x-10 gap-y-2">
        {itens.map(({ href, rotulo }) => (
          <Link
            key={href}
            href={href}
            aria-current={href === atual ? "page" : undefined}
            className={`py-3 text-[15px] leading-5 font-semibold text-text no-underline ${atual ? `border-b-2 ${href === atual ? "border-brand" : "border-transparent"}` : ""}`}
          >
            {rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
