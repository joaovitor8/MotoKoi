"use client";

// Página de erro genérica. Os detalhes (mensagem, consulta, pilha) ficam só no log do servidor;
// quem visita vê um código de referência para informar ao suporte.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ padding: "96px var(--margem)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
      <span className="st-rotulo">Erro</span>
      <h1 className="st-h1">Algo deu errado</h1>
      <p style={{ margin: 0, fontSize: 18, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 520 }}>
        Não foi possível carregar esta página. Tente de novo em alguns instantes.
        {error.digest && <> Ref. {error.digest}</>}
      </p>
      <button type="button" className="mk-btn mk-btn--dark mk-btn--lg" onClick={reset}>
        Tentar de novo
      </button>
    </main>
  );
}
