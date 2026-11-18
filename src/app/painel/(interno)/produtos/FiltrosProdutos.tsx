"use client";

import { Icone } from "@/components/Icone";

const seletor = { all: "unset", flex: 1, minWidth: 0 } as const;

// Formulário GET: os filtros vão para a URL (?busca=&categoria=&status=). Trocar um seletor já envia.
export function FiltrosProdutos({
  categorias,
  busca,
  categoria,
  status,
}: {
  categorias: { slug: string; nome: string }[];
  busca?: string;
  categoria?: string;
  status?: string;
}) {
  return (
    <form action="/painel/produtos" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <label className="ad-in" style={{ flex: "1 1 320px" }}>
        <Icone nome="search" />
        <input name="busca" defaultValue={busca} aria-label="Buscar produto" placeholder="Buscar por nome ou código" />
      </label>
      <label className="ad-in" style={{ flex: "0 1 220px" }}>
        <select name="categoria" defaultValue={categoria ?? ""} aria-label="Categoria" onChange={(e) => e.currentTarget.form?.requestSubmit()} style={seletor}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
        <Icone nome="chevron-down" />
      </label>
      <label className="ad-in" style={{ flex: "0 1 180px" }}>
        <select name="status" defaultValue={status ?? ""} aria-label="Status" onChange={(e) => e.currentTarget.form?.requestSubmit()} style={seletor}>
          <option value="">Todos os status</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
        </select>
        <Icone nome="chevron-down" />
      </label>
    </form>
  );
}
