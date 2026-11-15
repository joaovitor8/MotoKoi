import { redirect } from "next/navigation";
import { cache } from "react";
import { clienteDoPainel } from "./supabase-servidor";

// Chamada no começo de toda página e ação do painel. Devolve o cliente com a sessão e o nome de quem entrou.
// Sem login, ou com login fora da equipe (tabela perfis, ativo = true), volta para a tela de entrar.
// cache(): menu e página chamam no mesmo pedido, mas a consulta roda uma vez só.
export const equipe = cache(async () => {
  const supabase = await clienteDoPainel();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/painel/entrar");

  const { data: perfil } = await supabase.from("perfis").select("nome").eq("id", id).eq("ativo", true).maybeSingle();
  if (!perfil) redirect("/painel/entrar");

  return { supabase, nome: perfil.nome as string };
});

const FUSO = "America/Sao_Paulo";
export const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: FUSO });

// "Hoje, 09:12", "Ontem" ou a data, como na tela de pedidos de revenda.
export function quando(iso: string) {
  if (dataBR(iso) === dataBR(new Date().toISOString())) {
    return `Hoje, ${new Date(iso).toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" })}`;
  }
  if (dataBR(iso) === dataBR(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())) return "Ontem";
  return dataBR(iso);
}
