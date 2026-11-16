import type { Metadata } from "next";
import { PaginaCadastro } from "../cadastros/PaginaCadastro";

export const metadata: Metadata = { title: "Depoimentos" };

export default function DepoimentosDoPainel({ searchParams }: PageProps<"/painel/depoimentos">) {
  return <PaginaCadastro chave="depoimentos" searchParams={searchParams} />;
}
