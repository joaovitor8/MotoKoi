"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { equipe } from "@/lib/painel";
import { CADASTROS, type Cadastro, type ChaveCadastro } from "./config";
import { lerCampos } from "./ler";

export type EstadoCadastro = { erro?: string; valores?: Record<string, string | boolean> };

// `chave` e `id` chegam do navegador: a chave só vale se existir em CADASTROS, e só os campos
// descritos lá são gravados. Quem garante que só a equipe grava é o RLS.
function configuracao(chave: string): Cadastro {
  if (!Object.hasOwn(CADASTROS, chave)) throw new Error("Pedido inválido.");
  return CADASTROS[chave as ChaveCadastro];
}

export async function salvarCadastro(chave: string, id: number | null, _anterior: EstadoCadastro, formulario: FormData): Promise<EstadoCadastro> {
  const cfg = configuracao(chave);
  if (id !== null && !Number.isInteger(id)) throw new Error("Pedido inválido.");

  const { erro, valores, linha } = lerCampos(cfg, formulario, id === null);
  if (erro) return { erro, valores };

  const { supabase } = await equipe();
  const { error } = id === null ? await supabase.from(cfg.tabela).insert(linha) : await supabase.from(cfg.tabela).update(linha).eq("id", id);
  if (error) {
    if (error.code === "23505") return { erro: `Já existe ${cfg.feminino ? "uma" : "um"} ${cfg.um} com esses dados.`, valores };
    if (error.code === "23514") return { erro: "Algum campo está em formato inválido. Confira sigla do estado, CEP e coordenadas.", valores };
    console.error(`${cfg.titulo} não salvo:`, error.code, error.message);
    return { erro: "Não foi possível salvar. Tente de novo em alguns instantes.", valores };
  }
  updateTag("catalogo");
  revalidatePath(`/painel/${chave}`);
  redirect(`/painel/${chave}`);
}

export async function excluirCadastro(chave: string, id: number): Promise<EstadoCadastro> {
  const cfg = configuracao(chave);
  if (!Number.isInteger(id)) throw new Error("Pedido inválido.");
  const { supabase } = await equipe();
  const { error } = await supabase.from(cfg.tabela).delete().eq("id", id);
  if (error) {
    // 23503: o banco não deixa apagar categoria ou moto que ainda tem produto ligado (on delete restrict).
    if (error.code === "23503") return { erro: `Não dá para excluir: ainda há produtos ligados a ${cfg.feminino ? "esta" : "este"} ${cfg.um}.` };
    console.error(`${cfg.titulo} não excluído:`, error.code, error.message);
    return { erro: "Não foi possível excluir. Tente de novo em alguns instantes." };
  }
  updateTag("catalogo");
  revalidatePath(`/painel/${chave}`);
  redirect(`/painel/${chave}`);
}
