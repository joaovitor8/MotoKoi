"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone } from "@/components/Icone";
import { Selo } from "@/components/Selo";

const itens = [
  { href: "/painel/produtos", rotulo: "Produtos", icone: "package" },
  { href: "/painel/categorias", rotulo: "Categorias", icone: "disc" },
  { href: "/painel/motos", rotulo: "Motos", icone: "wrench" },
  { href: "/painel/revenda", rotulo: "Pedidos de revenda", icone: "message" },
  { href: "/painel/lojas", rotulo: "Lojas", icone: "map-pin" },
  { href: "/painel/conteudo", rotulo: "Conteúdo do site", icone: "chart" },
] as const;

// `novos` é quantos cadastros de revenda ainda estão na situação "novo".
export function MenuLinks({ novos }: { novos: number }) {
  const caminho = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Painel">
      {itens.map(({ href, rotulo, icone }) => (
        <Link
          key={href}
          href={href}
          aria-current={caminho.startsWith(href) ? "page" : undefined}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] leading-5 font-medium text-text-inverse-muted no-underline hover:text-text-inverse aria-[current]:bg-border-inverse aria-[current]:text-text-inverse [&_.mk-ico]:text-[20px]"
        >
          <Icone nome={icone} />
          <span className="flex-1">{rotulo}</span>
          {href === "/painel/revenda" && novos > 0 && (
            <Selo tom="solido">
              {novos}
            </Selo>
          )}
        </Link>
      ))}
    </nav>
  );
}
