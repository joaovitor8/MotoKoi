import type { ComponentProps } from "react";
import type { Conteudo } from "@/lib/conteudo";

// Enquanto o número não é cadastrado no painel, o botão vira texto: um link para "#" não leva a lugar nenhum
// e o leitor de tela anunciaria um link quebrado.
export function LinkWhatsApp({ whatsapp, ...resto }: ComponentProps<"a"> & { whatsapp: Conteudo["whatsapp"] }) {
  return whatsapp ? <a href={whatsapp.link} {...resto} /> : <span {...(resto as ComponentProps<"span">)} />;
}
