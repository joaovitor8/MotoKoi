import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <main style={{ padding: "96px var(--margem)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
      <span className="st-rotulo">Erro 404</span>
      <h1 className="st-h1">Página não encontrada</h1>
      <p style={{ margin: 0, fontSize: 18, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 520 }}>
        O endereço pode ter mudado ou a peça pode ter saído do catálogo.
      </p>
      <Link className="mk-btn mk-btn--dark mk-btn--lg" href="/catalogo">
        Ver o catálogo
      </Link>
    </main>
  );
}
