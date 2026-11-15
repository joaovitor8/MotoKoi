"use client";

import { useState } from "react";
import { FotoProduto } from "@/components/FotoProduto";

// Foto principal e miniaturas. Clicar numa miniatura troca a principal.
export function Galeria({ fotos }: { fotos: { url: string; alt: string }[] }) {
  const [atual, setAtual] = useState(0);
  return (
    <>
      <FotoProduto foto={fotos[atual]} proporcao="1 / 1" tamanhos="(max-width: 900px) 100vw, 660px" />
      {fotos.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {fotos.map((foto, i) => (
            <button
              key={foto.url}
              type="button"
              aria-label={`Foto ${i + 1}`}
              aria-pressed={i === atual}
              onClick={() => setAtual(i)}
              style={{
                flex: "0 0 calc((100% - 48px) / 4)",
                minWidth: 0,
                padding: 0,
                border: i === atual ? "2px solid var(--text)" : "1px solid var(--border)",
                borderRadius: 8,
                background: "none",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <FotoProduto foto={{ url: foto.url, alt: "" }} proporcao="1 / 1" tamanhos="160px" style={{ borderRadius: 0 }} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
