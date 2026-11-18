"use client";

import { useRef, useState } from "react";
import { urlDoMaterial } from "@/lib/fotos";
import { clienteDoNavegador } from "@/lib/supabase-navegador";
import { conteudoMudou } from "./acoes";

export type Material = { id: number; titulo: string; tipo: string; caminho: string; tamanho_bytes: number | null; atualizado_em: string };

const TIPOS = { catalogo: "Catálogo", fotos: "Fotos", fichas: "Fichas", logo: "Logo", outro: "Outro" };
// Mesmos limites do bucket "materiais" (migração concorrencia): PDF, ZIP, PNG ou SVG, até 50 MB.
const ACEITOS = ["application/pdf", "application/zip", "application/x-zip-compressed", "image/png", "image/svg+xml"];
const rotulo = { fontWeight: 600, fontSize: 14, lineHeight: "16px" } as const;
const seletor = { all: "unset", flex: 1, minWidth: 0 } as const;

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
    <section className="ad-card" aria-busy={ocupado} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2>Materiais para lojistas</h2>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
          Arquivos para baixar na página Seja revendedor. Um PDF do tipo “Catálogo” vira também o catálogo do site.
        </span>
      </div>
      {materiais.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="ad-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>
                  <span style={{ position: "absolute", left: -9999 }}>Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id}>
                  <td>
                    <a href={urlDoMaterial(m.caminho)} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
                      {m.titulo}
                    </a>
                    {m.caminho === catalogoAtual && <span className="mk-badge mk-badge--success" style={{ marginLeft: 8 }}>Catálogo do site</span>}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{TIPOS[m.tipo as keyof typeof TIPOS] ?? m.tipo}</td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {m.caminho.split(".").pop()?.toUpperCase()}
                    {m.tamanho_bytes ? ` · ${(m.tamanho_bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : ""}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => window.confirm(`Remover “${m.titulo}”? Não dá para desfazer.`) && remover(m)}
                      style={{ all: "unset", cursor: "pointer", fontWeight: 600, color: "var(--text-brand)", textDecoration: "underline" }}
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
      <form ref={formulario} action={enviar} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <label style={{ flex: "2 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={rotulo}>Título</span>
          <span className="ad-in">
            <input name="titulo" required maxLength={80} placeholder="Ex.: Catálogo completo" />
          </span>
        </label>
        <label style={{ flex: "3 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={rotulo}>Descrição (opcional)</span>
          <span className="ad-in">
            <input name="descricao" maxLength={160} placeholder="Ex.: Todas as peças, códigos e aplicações" />
          </span>
        </label>
        <label style={{ flex: "1 1 140px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={rotulo}>Tipo</span>
          <span className="ad-in">
            <select name="tipo" defaultValue="catalogo" style={seletor}>
              {Object.entries(TIPOS).map(([valor, nome]) => (
                <option key={valor} value={valor}>
                  {nome}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label style={{ flex: "2 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={rotulo}>Arquivo (PDF, ZIP, PNG ou SVG, até 50 MB)</span>
          <input name="arquivo" type="file" required accept={ACEITOS.join(",")} style={{ maxWidth: "100%", fontSize: 13 }} />
        </label>
        <button type="submit" disabled={ocupado} className="mk-btn mk-btn--secondary">
          {ocupado ? "Enviando…" : "+ Enviar arquivo"}
        </button>
      </form>
      {erro && (
        <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "var(--text-danger)" }}>
          {erro}
        </p>
      )}
    </section>
  );
}
