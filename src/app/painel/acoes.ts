"use server";

import { redirect } from "next/navigation";
import { clienteDoPainel } from "@/lib/supabase-servidor";

export type EstadoLogin = { erro?: string; email?: string };

export async function entrar(_anterior: EstadoLogin, formulario: FormData): Promise<EstadoLogin> {
  const email = String(formulario.get("email") ?? "").trim();
  const senha = String(formulario.get("senha") ?? "");
  if (!email || !senha) return { erro: "Informe o e-mail e a senha.", email };

  const supabase = await clienteDoPainel();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  // Mesma mensagem para e-mail errado e senha errada: não revela quais e-mails têm conta.
  if (error || !data.user) return { erro: "E-mail ou senha incorretos.", email };

  // Ter conta não basta: só entra quem está na tabela perfis com ativo = true (docs/banco.md).
  const { data: perfil } = await supabase.from("perfis").select("id").eq("id", data.user.id).eq("ativo", true).maybeSingle();
  if (!perfil) {
    await supabase.auth.signOut();
    return { erro: "Esta conta não tem acesso ao painel.", email };
  }
  redirect("/painel/produtos");
}

export async function sair() {
  const supabase = await clienteDoPainel();
  await supabase.auth.signOut();
  redirect("/painel/entrar");
}
