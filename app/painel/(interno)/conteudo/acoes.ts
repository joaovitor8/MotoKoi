"use server";

import { revalidatePath, updateTag } from "next/cache";
import { equipe } from "@/lib/painel";

export type EstadoConfiguracoes = { erro?: string; salvo?: boolean; valores?: Record<string, string> };

// Número inteiro dentro da faixa, ou null quando o campo fica vazio. `false` = valor inválido.
const inteiro = (texto: string, min: number, max: number) => {
  if (texto === "") return null;
  const n = Number(texto);
  return Number.isInteger(n) && n >= min && n <= max ? n : false;
};

export async function salvarConfiguracoes(_anterior: EstadoConfiguracoes, formulario: FormData): Promise<EstadoConfiguracoes> {
  const texto = (campo: string) => String(formulario.get(campo) ?? "").trim();
  const valores = { garantia: texto("garantia"), prazo: texto("prazo"), whatsapp: texto("whatsapp") };
  const erro = (mensagem: string): EstadoConfiguracoes => ({ erro: mensagem, valores });

  const garantia = inteiro(valores.garantia, 1, 120);
  const prazo = inteiro(valores.prazo, 1, 90);
  // O banco guarda o WhatsApp só com dígitos (DDD + número, com ou sem o 55 do país).
  const whatsapp = valores.whatsapp.replace(/\D/g, "");
  if (garantia === false) return erro("A garantia padrão precisa ser um número de meses entre 1 e 120.");
  if (prazo === false) return erro("O prazo de resposta precisa ser um número de dias entre 1 e 90.");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 13)) return erro("Informe o WhatsApp com DDD, como (18) 99999-0000.");

  const { supabase } = await equipe();
  // A tabela tem uma linha só (id = true): aqui é sempre update, nunca insert.
  const { error } = await supabase
    .from("configuracoes_site")
    .update({ garantia_meses_padrao: garantia, garantia_prazo_resposta_dias: prazo, whatsapp: whatsapp || null })
    .eq("id", true);
  if (error) {
    console.error("Configurações não salvas:", error.code, error.message);
    return erro("Não foi possível salvar. Tente de novo em alguns instantes.");
  }
  updateTag("catalogo");
  revalidatePath("/painel/conteudo");
  return { salvo: true, valores };
}

// Chamada pelo componente de materiais depois de enviar ou remover um arquivo.
export async function conteudoMudou() {
  await equipe();
  updateTag("catalogo");
  revalidatePath("/painel/conteudo");
}
