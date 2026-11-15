import Link from "next/link";
import { listarCategorias } from "@/lib/produtos";

const titulo = {
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "16px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  paddingBottom: 8,
} as const;
const link = { fontSize: 15, lineHeight: "24px", color: "var(--text)", textDecoration: "none", padding: "4px 0" };
const coluna = { display: "flex", flexDirection: "column", gap: 4 } as const;

export async function Rodape() {
  const categorias = await listarCategorias();
  return (
    <footer
      style={{
        padding: "64px var(--margem) 40px",
        display: "flex",
        flexDirection: "column",
        gap: 48,
        borderTop: "1.5px solid var(--text)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
          <span className="mk-logo">
            Moto<b>Koi</b>
          </span>
          <p style={{ margin: 0, fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>
            Peças importadas para motocicletas. Qualidade, durabilidade e segurança.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 72px" }}>
          <div style={coluna}>
            <span style={titulo}>Catálogo</span>
            {categorias.slice(0, 4).map((c) => (
              <Link key={c.slug} href={`/catalogo?categoria=${c.slug}`} style={link}>
                {c.nome}
              </Link>
            ))}
          </div>
          <div style={coluna}>
            <span style={titulo}>MotoKoi</span>
            <Link href="/a-marca" style={link}>
              A marca
            </Link>
            <Link href="/onde-comprar" style={link}>
              Onde comprar
            </Link>
            <Link href="/seja-revendedor" style={link}>
              Seja revendedor
            </Link>
          </div>
          <div style={coluna}>
            <span style={titulo}>Contato</span>
            <a href="#" style={link}>
              WhatsApp [NÚMERO]
            </a>
            <a href="https://www.instagram.com/moto.koi/" style={link}>
              Instagram @moto.koi
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "8px 24px",
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          lineHeight: "20px",
          color: "var(--text-muted)",
        }}
      >
        <span>© 2026 MotoKoi. Todos os direitos reservados.</span>
        <a href="https://www.macatacado.com.br/" style={{ color: "var(--text-muted)" }}>
          Também à venda na Mac Atacado
        </a>
      </div>
    </footer>
  );
}
