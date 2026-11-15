"use server";

import { validarCadastro } from "@/lib/revenda";
import { supabase } from "@/lib/supabase";

export type EstadoEnvio = { enviado?: true; erro?: string; valores?: Record<string, string> };

export async function enviarCadastro(_anterior: EstadoEnvio, formulario: FormData): Promise<EstadoEnvio> {
  const valores: Record<string, string> = {};
  for (const [campo, valor] of formulario) {
    // Campos que começam com "$" são do próprio React, não do formulário.
    if (typeof valor === "string" && !campo.startsWith("$")) valores[campo] = valor.trim();
  }

  // Campo-isca contra spam: fica escondido, gente não preenche, robô preenche. Finge que deu certo e não grava.
  if (valores.site) return { enviado: true };

  const resultado = validarCadastro(valores);
  if ("erro" in resultado) return { erro: resultado.erro, valores };

  // Sem .select() depois do insert: o visitante pode enviar, mas não pode ler o cadastro de volta (docs/banco.md).
  const { error } = await supabase.from("cadastros_revenda").insert(resultado.dados);
  if (error) {
    console.error("Cadastro de revenda não gravado:", error.message);
    return { erro: "Não foi possível enviar agora. Tente de novo em alguns instantes.", valores };
  }
  return { enviado: true };
}
