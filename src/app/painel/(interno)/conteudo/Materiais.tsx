"use client";

import { useRef, useState } from "react";
import { urlDoMaterial } from "@/lib/fotos";
import { clienteDoNavegador } from "@/lib/supabase-navegador";
import { conteudoMudou } from "./acoes";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { cartao, entrada, tabela } from "@/app/painel/estilos";

export type Material = { id: number; titulo: string; tipo: string; caminho: string; tamanho_bytes: number | null; atualizado_em: string };

const TIPOS = { catalogo: "Catálogo", fotos: "Fotos", fichas: "Fichas", logo: "Logo", outro: "Outro" };
// Mesmos limites do bucket "materiais" (migração concorrencia): PDF, ZIP, PNG ou SVG, até 50 MB.
const ACEITOS = ["application/pdf", "application/zip", "application/x-zip-compressed", "image/png", "image/svg+xml"];
// "!": vence o all: unset, que no CSS do Tailwind vem depois.
const seletor = "[all:unset] flex-1! min-w-0!";

// Arquivos para o lojista baixar (página Seja revendedor). O arquivo vai direto do navegador para o Storage
// e depois ganha uma linha na tabela "materiais". Um PDF do tipo "Catálogo" vira também o catálogo do site
// (botão "Baixar PDF" do Catálogo e link do rodapé), gravado em configuracoes_site.
export function Materiais({ materiais, catalogoAtual }: { materiais: Material[]; catalogoAtual: string | null }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string>();
  const formulario = useRef<HTMLFormElement>(null);

  async function executar(operacao: () => Promise<string | undefined>) {
    setOcupado(true);
    setErro(undefined);
    try {
      const falha = await operacao();
      setErro(falha);
      if (!falha) formulario.current?.reset();
      await conteudoMudou();
    } catch {
      setErro("Não foi possível concluir. Confira a conexão e tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  const enviar = (dados: FormData) =>
    executar(async () => {
      const titulo = String(dados.get("titulo") ?? "").trim();
      const descricao = String(dados.get("descricao") ?? "").trim();
      const tipo = String(dados.get("tipo") ?? "");
      const arquivo = dados.get("arquivo");
      if (!titulo) return "Informe o título do material.";
      if (!Object.hasOwn(TIPOS, tipo)) return "Escolha o tipo do material.";
      if (!(arquivo instanceof File) || !arquivo.size) return "Escolha o arquivo.";
      if (!ACEITOS.includes(arquivo.type)) return "O arquivo precisa ser PDF, ZIP, PNG ou SVG.";
      if (arquivo.size > 50 * 1024 * 1024) return "O arquivo tem mais de 50 MB.";

      const supabase = clienteDoNavegador();
      const caminho = `${tipo}/${crypto.randomUUID()}.${arquivo.name.split(".").pop()?.toLowerCase() ?? "pdf"}`;
      const envio = await supabase.storage.from("materiais").upload(caminho, arquivo);
      if (envio.error) return "Não foi possível enviar o arquivo.";
      const linha = await supabase.from("materiais").insert({ titulo, descricao: descricao || null, tipo, caminho, tamanho_bytes: arquivo.size, ordem: materiais.length + 1 });
      if (linha.error) {
        await supabase.storage.from("materiais").remove([caminho]); // não deixa arquivo solto sem linha no banco
        return "Não foi possível registrar o arquivo.";
      }
      if (tipo === "catalogo" && arquivo.type === "application/pdf") {
        const config = await supabase.from("configuracoes_site").update({ catalogo_pdf_caminho: caminho }).eq("id", true);
        if (config.error) return "O arquivo foi enviado, mas não virou o catálogo do site. Tente enviar de novo.";
      }
    });

  const remover = (material: Material) =>
    executar(async () => {
      const supabase = clienteDoNavegador();
      if (material.caminho === catalogoAtual) {
        const config = await supabase.from("configuracoes_site").update({ catalogo_pdf_caminho: null }).eq("id", true);
        if (config.error) return "Não foi possível remover o catálogo do site.";
      }
      const linha = await supabase.from("materiais").delete().eq("id", material.id);
      if (linha.error) return "Não foi possível remover o material.";
      await supabase.storage.from("materiais").remove([material.caminho]);
    });

  return (
    <section className={`${cartao} p-6 flex flex-col gap-4`} aria-busy={ocupado}>
      <div className="flex flex-col gap-1">
        <h2>Materiais para lojistas</h2>
        <span className="text-[14px] leading-5 text-text-muted">
          Arquivos para baixar na página Seja revendedor. Um PDF do tipo “Catálogo” vira também o catálogo do site.
        </span>
      </div>
      {materiais.length > 0 && (
        <div className="overflow-x-auto">
          <table className={tabela}>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>
                  <span className="absolute -left-[9999px]">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id}>
                  <td>
                    <a href={urlDoMaterial(m.caminho)} target="_blank" rel="noreferrer" className="font-semibold">
                      {m.titulo}
                    </a>
                    {m.caminho === catalogoAtual && <Selo tom="sucesso" className="ml-2">Catálogo do site</Selo>}
                  </td>
                  <td className="text-text-secondary">{TIPOS[m.tipo as keyof typeof TIPOS] ?? m.tipo}</td>
                  <td className="text-text-secondary whitespace-nowrap">
                    {m.caminho.split(".").pop()?.toUpperCase()}
                    {m.tamanho_bytes ? ` · ${(m.tamanho_bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : ""}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => window.confirm(`Remover “${m.titulo}”? Não dá para desfazer.`) && remover(m)}
                      className="[all:unset] cursor-pointer! font-semibold! text-text-brand! underline!"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form ref={formulario} action={enviar} className="flex flex-wrap items-end gap-3 pt-4 border-t border-t-border">
        <label className="flex-[2_1_200px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Título</span>
          <span className={entrada}>
            <input name="titulo" required maxLength={80} placeholder="Ex.: Catálogo completo" />
          </span>
        </label>
        <label className="flex-[3_1_240px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Descrição (opcional)</span>
          <span className={entrada}>
            <input name="descricao" maxLength={160} placeholder="Ex.: Todas as peças, códigos e aplicações" />
          </span>
        </label>
        <label className="flex-[1_1_140px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Tipo</span>
          <span className={entrada}>
            <select name="tipo" defaultValue="catalogo" className={seletor}>
              {Object.entries(TIPOS).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="flex-[2_1_220px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Arquivo (PDF, ZIP, PNG ou SVG, até 50 MB)</span>
          <input name="arquivo" type="file" required accept={ACEITOS.join(",")} className="max-w-full text-[13px]" />
        </label>
        <Botao variante="secundario" type="submit" disabled={ocupado}>
          {ocupado ? "Enviando…" : "+ Enviar arquivo"}
        </Botao>
      </form>
      {erro && (
        <p role="alert" className="m-0 font-semibold text-[14px] leading-5 text-text-danger">
          {erro}
        </p>
      )}
    </section>
  );
}
