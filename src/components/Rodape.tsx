import Link from "next/link";
import type { ReactNode } from "react";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { obterConteudo } from "@/lib/conteudo";
import { listarCategorias } from "@/lib/produtos";

const titulo = {
  margin: 0,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "16px",
  letterSpacing: ".2em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  paddingBottom: 8,
} as const;
// inline-block: dentro do <li> o link é inline e ignoraria o padding vertical (antes era item de flex).
const link = { display: "inline-block", fontSize: 15, lineHeight: "24px", color: "var(--text)", textDecoration: "none", padding: "4px 0" };
const coluna = { display: "flex", flexDirection: "column", gap: 4 } as const;

// Título da coluna + lista de links: o leitor de tela anuncia "Catálogo, lista, 4 itens".
function Coluna({ titulo: nome, children }: { titulo: string; children: ReactNode }) {
  return (
    <div style={coluna}>
      <h2 style={titulo}>{nome}</h2>
      <ul style={{ ...coluna, listStyle: "none", margin: 0, padding: 0 }}>{children}</ul>
    </div>
  );
}

export async function Rodape() {
  const [categorias, conteudo] = await Promise.all([listarCategorias(), obterConteudo()]);
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
        <nav aria-label="Rodapé" style={{ display: "flex", flexWrap: "wrap", gap: "32px 72px" }}>
          <Coluna titulo="Catálogo">
            {categorias.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo?categoria=${c.slug}`} style={link}>
                  {c.nome}
                </Link>
              </li>
            ))}
          </Coluna>
          <Coluna titulo="MotoKoi">
            <li>
              <Link href="/a-marca" style={link}>
                A marca
              </Link>
            </li>
            <li>
              <Link href="/onde-comprar" style={link}>
                Onde comprar
              </Link>
            </li>
            <li>
              <Link href="/seja-revendedor" style={link}>
                Seja revendedor
              </Link>
            </li>
            <li>
              <Link href="/garantia" style={link}>
                Garantia
              </Link>
            </li>
            {conteudo.catalogoPdf && (
              <li>
                <a href={conteudo.catalogoPdf} style={link}>
                  Catálogo em PDF
                </a>
              </li>
            )}
          </Coluna>
          <Coluna titulo="Contato">
            <li>
              <LinkWhatsApp whatsapp={conteudo.whatsapp} style={link}>
                WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
              </LinkWhatsApp>
            </li>
            <li>
              <a href="https://www.instagram.com/moto.koi/" style={link}>
                Instagram @moto.koi
              </a>
            </li>
          </Coluna>
        </nav>
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
        <Link href="/privacidade" style={{ color: "var(--text-muted)" }}>
          Política de privacidade
        </Link>
        <a href="https://www.macatacado.com.br/" style={{ color: "var(--text-muted)" }}>
          Também à venda na Mac Atacado
        </a>
      </div>
    </footer>
  );
}
