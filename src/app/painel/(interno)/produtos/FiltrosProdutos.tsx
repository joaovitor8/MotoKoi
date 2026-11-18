"use client";

import { Icone } from "@/components/Icone";
import { entrada } from "@/app/painel/estilos";

// "!": vence o all: unset, que no CSS do Tailwind vem depois.
const seletor = "[all:unset] flex-1! min-w-0!";

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
    <form action="/painel/produtos" className="flex flex-wrap gap-3">
      <label className={`${entrada} flex-[1_1_320px]`}>
        <Icone nome="search" />
        <input name="busca" defaultValue={busca} aria-label="Buscar produto" placeholder="Buscar por nome ou código" />
      </label>
      <label className={`${entrada} flex-[0_1_220px]`}>
        <select name="categoria" defaultValue={categoria ?? ""} aria-label="Categoria" onChange={(e) => e.currentTarget.form?.requestSubmit()} className={seletor}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
        <Icone nome="chevron-down" />
      </label>
      <label className={`${entrada} flex-[0_1_180px]`}>
        <select name="status" defaultValue={status ?? ""} aria-label="Status" onChange={(e) => e.currentTarget.form?.requestSubmit()} className={seletor}>
          <option value="">Todos os status</option>
          <option value="publicado">Publicado</option>
          <option value="rascunho">Rascunho</option>
        </select>
        <Icone nome="chevron-down" />
      </label>
    </form>
  );
}
