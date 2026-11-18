import type { Metadata } from "next";
import { PaginaCadastro } from "../cadastros/PaginaCadastro";

export const metadata: Metadata = { title: "Categorias" };

export default function CategoriasDoPainel({ searchParams }: PageProps<"/painel/categorias">) {
  return <PaginaCadastro chave="categorias" searchParams={searchParams} />;
}
