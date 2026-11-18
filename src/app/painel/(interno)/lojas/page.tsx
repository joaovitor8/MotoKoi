import type { Metadata } from "next";
import { PaginaCadastro } from "../cadastros/PaginaCadastro";

export const metadata: Metadata = { title: "Lojas" };

export default function LojasDoPainel({ searchParams }: PageProps<"/painel/lojas">) {
  return <PaginaCadastro chave="lojas" searchParams={searchParams} />;
}
