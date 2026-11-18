"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { TAMANHO_MAXIMO_DA_FOTO, TIPOS_DE_FOTO, urlDaFoto } from "@/lib/fotos";
import { clienteDoNavegador } from "@/lib/supabase-navegador";
import { fotosMudaram } from "./acoes";
import { Selo } from "@/components/Selo";
import { cartao } from "@/app/painel/estilos";

export type Foto = { id: number; caminho: string; ordem: number };

// Botões com cara de link. "!": vence o all: unset, que no CSS do Tailwind vem depois.
const acao = "[all:unset] cursor-pointer! text-[12px]! leading-4! font-semibold! text-text-brand! underline!";

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
    <section className={`${cartao} p-6 flex flex-col gap-4`} aria-busy={ocupado}>
      <h2>Fotos</h2>
      {emOrdem.length > 0 && (
        <ul className="list-none m-0 p-0 grid [grid-template-columns:repeat(3,_1fr)] gap-3">
          {emOrdem.map((foto, i) => (
            <li key={foto.id} className="flex flex-col gap-1.5 min-w-0">
              <div className={`relative aspect-[1/1] overflow-hidden rounded-md bg-bg-muted [outline-offset:2px] ${i === 0 ? "outline-2 outline-text" : ""}`}>
                <Image src={urlDaFoto(foto.caminho)} alt={`Foto ${i + 1} de ${nome}`} fill sizes="120px" className="object-contain" />
                {i === 0 && (
                  <Selo tom="escuro" className="absolute top-1.5 left-1.5">
                    Capa
                  </Selo>
                )}
              </div>
              <div className="flex flex-wrap gap-y-0.5 gap-x-2.5">
                {i > 0 && (
                  <button type="button" disabled={ocupado} onClick={() => mover(i, -1)} aria-label={`Mover a foto ${i + 1} para antes`} className={acao}>
                    Antes
                  </button>
                )}
                {i < emOrdem.length - 1 && (
                  <button type="button" disabled={ocupado} onClick={() => mover(i, 1)} aria-label={`Mover a foto ${i + 1} para depois`} className={acao}>
                    Depois
                  </button>
                )}
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => window.confirm("Remover esta foto? Não dá para desfazer.") && remover(foto)}
                  aria-label={`Remover a foto ${i + 1}`}
                  className={acao}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-md border-[1.5px] border-dashed border-border-strong px-4 py-6 text-center">
        <span className="font-semibold text-[14px] leading-5">{ocupado ? "Aguarde…" : "Escolha as fotos no computador"}</span>
        <span className="text-[13px] leading-5 text-text-muted">JPG, PNG ou WebP, até 5 MB, fundo claro</span>
        <input
          ref={campo}
          type="file"
          accept={TIPOS_DE_FOTO.join(",")}
          multiple
          disabled={ocupado}
          onChange={(e) => e.target.files?.length && enviar([...e.target.files])}
          className="mt-2 max-w-full text-[13px]"
        />
      </label>
      {erro && (
        <p role="alert" className="m-0 font-semibold text-[14px] leading-5 text-text-danger">
          {erro}
        </p>
      )}
      <span className="text-[12px] leading-4 text-text-muted">
        A primeira foto é a capa. Use “Antes” e “Depois” para mudar a ordem.
      </span>
    </section>
  );
}
