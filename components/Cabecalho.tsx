import Link from "next/link";

const itens = [
  { href: "/catalogo", rotulo: "Catálogo" },
  { href: "/a-marca", rotulo: "A marca" },
  { href: "/onde-comprar", rotulo: "Onde comprar" },
  { href: "/seja-revendedor", rotulo: "Revenda" },
] as const;

// `atual` é o href da página aberta. Na Home não se passa nada: sem traço e sem linha embaixo, como na tela.
// A Garantia não está no menu: passa o próprio endereço só para ganhar a linha, sem item marcado.
export function Cabecalho({ atual }: { atual?: (typeof itens)[number]["href"] | "/garantia" }) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "16px 56px",
        padding: "22px var(--margem)",
        borderBottom: atual && "1px solid var(--border)",
      }}
    >
      <Link href="/" className="mk-logo" style={{ textDecoration: "none" }}>
        Moto<b>Koi</b>
      </Link>
      <nav aria-label="Principal" style={{ display: "flex", flexWrap: "wrap", gap: "8px 40px" }}>
        {itens.map(({ href, rotulo }) => (
          <Link
            key={href}
            href={href}
            aria-current={href === atual ? "page" : undefined}
            style={{
              fontWeight: 600,
              fontSize: 15,
              lineHeight: "20px",
              color: "var(--text)",
              textDecoration: "none",
              padding: "12px 0",
              borderBottom: atual && `2px solid ${href === atual ? "var(--brand)" : "transparent"}`,
            }}
          >
            {rotulo}
          </Link>
        ))}
      </nav>
    </header>
  );
}
