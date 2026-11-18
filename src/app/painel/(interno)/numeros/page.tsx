import type { Metadata } from "next";
import { PaginaCadastro } from "../cadastros/PaginaCadastro";

export const metadata: Metadata = { title: "Números da marca" };

export default function NumerosDoPainel({ searchParams }: PageProps<"/painel/numeros">) {
  return <PaginaCadastro chave="numeros" searchParams={searchParams} />;
}
