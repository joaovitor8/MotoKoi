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
        <div className="flex flex-wrap gap-4">
          {fotos.map((foto, i) => (
            <button
              key={foto.url}
              type="button"
              aria-label={`Foto ${i + 1}`}
              aria-pressed={i === atual}
              onClick={() => setAtual(i)}
              className={`min-w-0 flex-[0_0_calc((100%_-_48px)_/_4)] cursor-pointer overflow-hidden rounded-lg p-0 [background:none] ${i === atual ? "border-2 border-text" : "border border-border"}`}
            >
              <FotoProduto foto={{ url: foto.url, alt: "" }} proporcao="1 / 1" tamanhos="160px" style={{ borderRadius: 0 }} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
