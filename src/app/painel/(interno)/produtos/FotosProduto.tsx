"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { TAMANHO_MAXIMO_DA_FOTO, TIPOS_DE_FOTO, urlDaFoto } from "@/lib/fotos";
import { clienteDoNavegador } from "@/lib/supabase-navegador";
import { fotosMudaram } from "./acoes";

export type Foto = { id: number; caminho: string; ordem: number };

const acao = { all: "unset", cursor: "pointer", fontWeight: 600, fontSize: 12, lineHeight: "16px", color: "var(--text-brand)", textDecoration: "underline" } as const;

// O arquivo vai direto do navegador para o Storage (uma ação de servidor aceita no máximo 1 MB),
// e depois o caminho é gravado em produto_fotos. O RLS só deixa a equipe fazer as duas coisas.
export function FotosProduto({ produtoId, nome, fotos }: { produtoId: number; nome: string; fotos: Foto[] }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string>();
  const campo = useRef<HTMLInputElement>(null);
  const emOrdem = [...fotos].sort((a, b) => a.ordem - b.ordem);

  // Roda uma operação, mostra o erro se houver e pede ao servidor a lista atualizada.
  async function executar(operacao: () => Promise<string | undefined>) {
    setOcupado(true);
    setErro(undefined);
    try {
      setErro(await operacao());
      await fotosMudaram(produtoId);
    } catch {
      setErro("Não foi possível concluir. Confira a conexão e tente de novo.");
    } finally {
      setOcupado(false);
      if (campo.current) campo.current.value = "";
    }
  }

  const enviar = (arquivos: File[]) =>
    executar(async () => {
      const supabase = clienteDoNavegador();
      let ordem = Math.max(0, ...fotos.map((f) => f.ordem));
      for (const arquivo of arquivos) {
        if (!TIPOS_DE_FOTO.includes(arquivo.type)) return `“${arquivo.name}” não é JPG, PNG nem WebP.`;
        if (arquivo.size > TAMANHO_MAXIMO_DA_FOTO) return `“${arquivo.name}” tem mais de 5 MB.`;
        const caminho = `${produtoId}/${crypto.randomUUID()}.${arquivo.type.split("/")[1]}`;
        const envio = await supabase.storage.from("produtos").upload(caminho, arquivo);
        if (envio.error) return `Não foi possível enviar “${arquivo.name}”.`;
        const linha = await supabase.from("produto_fotos").insert({ produto_id: produtoId, caminho, ordem: ++ordem });
        if (linha.error) {
          await supabase.storage.from("produtos").remove([caminho]); // não deixa arquivo solto sem linha no banco
          return `Não foi possível registrar “${arquivo.name}”.`;
        }
      }
    });

  // Troca a foto de lugar com a vizinha e regrava a ordem de todas (0, 1, 2...). A primeira é a capa.
  const mover = (indice: number, passo: -1 | 1) =>
    executar(async () => {
      const nova = [...emOrdem];
      [nova[indice], nova[indice + passo]] = [nova[indice + passo], nova[indice]];
      const supabase = clienteDoNavegador();
      const respostas = await Promise.all(nova.map((f, i) => supabase.from("produto_fotos").update({ ordem: i }).eq("id", f.id)));
      if (respostas.some((r) => r.error)) return "Não foi possível mudar a ordem.";
    });

  const remover = (foto: Foto) =>
    executar(async () => {
      const supabase = clienteDoNavegador();
      const linha = await supabase.from("produto_fotos").delete().eq("id", foto.id);
      if (linha.error) return "Não foi possível remover a foto.";
      await supabase.storage.from("produtos").remove([foto.caminho]);
    });

  return (
    <section className="ad-card" aria-busy={ocupado} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <h2>Fotos</h2>
      {emOrdem.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {emOrdem.map((foto, i) => (
            <li key={foto.id} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: 4,
                  background: "var(--bg-muted)",
                  overflow: "hidden",
                  outline: i === 0 ? "2px solid var(--text)" : undefined,
                  outlineOffset: 2,
                }}
              >
                <Image src={urlDaFoto(foto.caminho)} alt={`Foto ${i + 1} de ${nome}`} fill sizes="120px" style={{ objectFit: "contain" }} />
                {i === 0 && (
                  <span className="mk-badge" style={{ position: "absolute", left: 6, top: 6, background: "var(--text)", color: "var(--text-inverse)" }}>
                    Capa
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                {i > 0 && (
                  <button type="button" disabled={ocupado} onClick={() => mover(i, -1)} aria-label={`Mover a foto ${i + 1} para antes`} style={acao}>
                    Antes
                  </button>
                )}
                {i < emOrdem.length - 1 && (
                  <button type="button" disabled={ocupado} onClick={() => mover(i, 1)} aria-label={`Mover a foto ${i + 1} para depois`} style={acao}>
                    Depois
                  </button>
                )}
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => window.confirm("Remover esta foto? Não dá para desfazer.") && remover(foto)}
                  aria-label={`Remover a foto ${i + 1}`}
                  style={acao}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "24px 16px",
          border: "1.5px dashed var(--border-strong)",
          borderRadius: 4,
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>{ocupado ? "Aguarde…" : "Escolha as fotos no computador"}</span>
        <span style={{ fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>JPG, PNG ou WebP, até 5 MB, fundo claro</span>
        <input
          ref={campo}
          type="file"
          accept={TIPOS_DE_FOTO.join(",")}
          multiple
          disabled={ocupado}
          onChange={(e) => e.target.files?.length && enviar([...e.target.files])}
          style={{ marginTop: 8, maxWidth: "100%", fontSize: 13 }}
        />
      </label>
      {erro && (
        <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "var(--text-danger)" }}>
          {erro}
        </p>
      )}
      <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--text-muted)" }}>
        A primeira foto é a capa. Use “Antes” e “Depois” para mudar a ordem.
      </span>
    </section>
  );
}
