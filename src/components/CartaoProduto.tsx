import Link from "next/link";
import type { Produto } from "@/lib/produtos";
import { EspacoFoto } from "./EspacoFoto";
import { FotoProduto } from "./FotoProduto";

// `serveEm` mostra a linha "Serve em" (catálogo). `fundoFoto` troca o fundo da foto quando o cartão fica sobre cinza.
// `Titulo` é a tag do nome: h3 quando o cartão fica abaixo de um h2, h2 quando fica direto abaixo do h1 (catálogo).
export function CartaoProduto({
  produto,
  serveEm,
  fundoFoto,
  titulo: Titulo = "h3",
}: {
  produto: Produto;
  serveEm?: boolean;
  fundoFoto?: string;
  titulo?: "h2" | "h3";
}) {
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Link href={`/catalogo/${produto.slug}`} aria-label={`Ver ${produto.nome}`} style={{ textDecoration: "none" }}>
        {produto.fotos[0] ? (
          <FotoProduto foto={produto.fotos[0]} proporcao="4 / 3" tamanhos="(max-width: 640px) 100vw, 320px" style={fundoFoto ? { background: fundoFoto } : undefined} />
        ) : (
          <EspacoFoto texto="[FOTO DA PEÇA]" proporcao="4 / 3" icone={44} style={fundoFoto ? { background: fundoFoto } : undefined} />
        )}
      </Link>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="st-rotulo" style={{ letterSpacing: ".14em" }}>
          {produto.categoria.nome}
        </span>
        <Titulo
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 26,
            lineHeight: "28px",
            textTransform: "uppercase",
          }}
        >
          {produto.nome}
        </Titulo>
        {produto.resumo && (
          <span style={{ fontSize: 15, lineHeight: "22px", color: "var(--text-secondary)" }}>{produto.resumo}</span>
        )}
        {serveEm && (
          <span style={{ fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>
            Serve em: {produto.motos.map((m) => m.nome).join(" · ") || "Uso geral"}
          </span>
        )}
        <span style={{ fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "var(--text-muted)" }}>
          Cód. {produto.codigo ?? "[CÓDIGO]"} · Original {produto.codigosOriginais[0]?.codigo ?? "[CÓDIGO ORIGINAL]"}
        </span>
      </div>
    </article>
  );
}
