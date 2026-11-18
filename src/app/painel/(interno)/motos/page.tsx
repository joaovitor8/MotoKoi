import type { Metadata } from "next";
import { PaginaCadastro } from "../cadastros/PaginaCadastro";

export const metadata: Metadata = { title: "Motos" };

export default function MotosDoPainel({ searchParams }: PageProps<"/painel/motos">) {
  return <PaginaCadastro chave="motos" searchParams={searchParams} />;
}
