"use server";

import { revalidatePath } from "next/cache";
import { equipe } from "@/lib/painel";

const SITUACOES = ["novo", "em_contato", "aprovado", "recusado"];

// `id` e `situacao` chegam do navegador, então são conferidos aqui. Quem garante que só a equipe altera é o RLS.
export async function mudarSituacao(id: number, situacao: string) {
  if (!Number.isInteger(id) || !SITUACOES.includes(situacao)) throw new Error("Pedido inválido.");
  const { supabase } = await equipe();
  const { error } = await supabase.from("cadastros_revenda").update({ situacao }).eq("id", id);
  if (error) throw new Error(`Supabase: ${error.message}`);
  revalidatePath("/painel/revenda");
}

export async function salvarAnotacoes(id: number, formulario: FormData) {
  const anotacoes = String(formulario.get("anotacoes") ?? "").trim();
  if (!Number.isInteger(id) || anotacoes.length > 4000) throw new Error("Pedido inválido.");
  const { supabase } = await equipe();
  const { error } = await supabase.from("cadastros_revenda").update({ anotacoes: anotacoes || null }).eq("id", id);
  if (error) throw new Error(`Supabase: ${error.message}`);
  revalidatePath("/painel/revenda");
}
