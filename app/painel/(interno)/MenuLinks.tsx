"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "@/components/Icone";

const itens = [
  { href: "/painel/produtos", rotulo: "Produtos", icone: "package" },
  { href: "/painel/categorias", rotulo: "Categorias", icone: "disc" },
  { href: "/painel/motos", rotulo: "Motos", icone: "wrench" },
  { href: "/painel/revenda", rotulo: "Pedidos de revenda", icone: "message" },
  { href: "/painel/lojas", rotulo: "Lojas", icone: "map-pin" },
] as const;

// `novos` é quantos cadastros de revenda ainda estão na situação "novo".
export function MenuLinks({ novos }: { novos: number }) {
  const caminho = usePathname();
  return (
    <nav className="ad-nav" aria-label="Painel">
      {itens.map(({ href, rotulo, icone }) => (
        <Link key={href} href={href} aria-current={caminho.startsWith(href) ? "page" : undefined}>
          <Icone nome={icone} />
          <span style={{ flex: 1 }}>{rotulo}</span>
          {href === "/painel/revenda" && novos > 0 && (
            <span className="mk-badge" style={{ background: "var(--brand)", color: "var(--text-on-brand)" }}>
              {novos}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
