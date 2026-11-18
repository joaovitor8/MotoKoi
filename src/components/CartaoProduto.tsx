import Link from "next/link";
import type { Produto } from "@/lib/produtos";
import { EspacoFoto } from "./EspacoFoto";
import { FotoProduto } from "./FotoProduto";
import { rotulo } from "@/components/estilos";

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
    <article className="flex flex-col gap-4">
      <Link href={`/catalogo/${produto.slug}`} aria-label={`Ver ${produto.nome}`} className="no-underline">
        {produto.fotos[0] ? (
          <FotoProduto foto={produto.fotos[0]} proporcao="4 / 3" tamanhos="(max-width: 640px) 100vw, 320px" style={fundoFoto ? { background: fundoFoto } : undefined} />
        ) : (
          <EspacoFoto texto="[FOTO DA PEÇA]" proporcao="4 / 3" icone={44} style={fundoFoto ? { background: fundoFoto } : undefined} />
        )}
      </Link>
      <div className="flex flex-col gap-1.5">
        <span className={`${rotulo} tracking-[.14em]!`}>
          {produto.categoria.nome}
        </span>
        <Titulo className="m-0 font-display text-[26px] leading-7 font-bold uppercase">
          {produto.nome}
        </Titulo>
        {produto.resumo && (
          <span className="text-[15px] leading-[22px] text-text-secondary">{produto.resumo}</span>
        )}
        {serveEm && (
          <span className="text-[13px] leading-5 text-text-muted">
            Serve em: {produto.motos.map((m) => m.nome).join(" · ") || "Uso geral"}
          </span>
        )}
        <span className="font-medium text-[12px] leading-4 text-text-muted">
          Cód. {produto.codigo ?? "[CÓDIGO]"} · Original {produto.codigosOriginais[0]?.codigo ?? "[CÓDIGO ORIGINAL]"}
        </span>
      </div>
    </article>
  );
}
