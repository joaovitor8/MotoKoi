"use client";

import { useRef, useState } from "react";
import { urlDoMaterial } from "@/lib/fotos";
import { clienteDoNavegador } from "@/lib/supabase-navegador";
import { fotosMudaram } from "./acoes";

// Ficha técnica em PDF do produto. Como as fotos, o arquivo vai direto do navegador para o Storage
// (bucket "materiais") e o caminho é gravado no produto; não passa pelo botão "Salvar".
export function FichaProduto({ produtoId, caminho }: { produtoId: number; caminho: string | null }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string>();
  const campo = useRef<HTMLInputElement>(null);

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

  const enviar = (arquivo: File) =>
    executar(async () => {
      if (arquivo.type !== "application/pdf") return "A ficha técnica precisa ser um arquivo PDF.";
      const supabase = clienteDoNavegador();
      const novo = `fichas/${produtoId}-${crypto.randomUUID()}.pdf`;
      const envio = await supabase.storage.from("materiais").upload(novo, arquivo);
      if (envio.error) return "Não foi possível enviar o PDF.";
      const linha = await supabase.from("produtos").update({ ficha_tecnica_caminho: novo }).eq("id", produtoId);
      if (linha.error) {
        await supabase.storage.from("materiais").remove([novo]); // não deixa arquivo solto
        return "Não foi possível registrar o PDF no produto.";
      }
      if (caminho) await supabase.storage.from("materiais").remove([caminho]); // o PDF antigo sai
    });

  const remover = () =>
    executar(async () => {
      const supabase = clienteDoNavegador();
      const linha = await supabase.from("produtos").update({ ficha_tecnica_caminho: null }).eq("id", produtoId);
      if (linha.error) return "Não foi possível remover o PDF.";
      if (caminho) await supabase.storage.from("materiais").remove([caminho]);
    });

  return (
    <div aria-busy={ocupado} className="flex flex-col gap-1.5">
      <span className="font-semibold text-[14px] leading-4">Ficha técnica (PDF)</span>
      {caminho ? (
        <span className="flex flex-wrap gap-y-1 gap-x-4 text-[14px] leading-5">
          <a href={urlDoMaterial(caminho)} target="_blank" rel="noreferrer" className="font-semibold">
            Ver o PDF atual
          </a>
          <button
            type="button"
            disabled={ocupado}
            onClick={() => window.confirm("Remover a ficha técnica? Não dá para desfazer.") && remover()}
            className="[all:unset] cursor-pointer! font-semibold! text-text-brand! underline!"
          >
            Remover
          </button>
        </span>
      ) : (
        <span className="text-[14px] leading-5 text-text-muted">Nenhum arquivo.</span>
      )}
      <input
        ref={campo}
        type="file"
        accept="application/pdf"
        aria-label={caminho ? "Trocar a ficha técnica em PDF" : "Enviar a ficha técnica em PDF"}
        disabled={ocupado}
        onChange={(e) => e.target.files?.[0] && enviar(e.target.files[0])}
        className="max-w-full text-[13px]"
      />
      {erro && (
        <p role="alert" className="m-0 font-semibold text-[14px] leading-5 text-text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}
