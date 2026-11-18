"use client";

import { Botao } from "@/components/Botao";
import { rotulo, tituloH1 } from "@/components/estilos";

// Página de erro genérica. Os detalhes (mensagem, consulta, pilha) ficam só no log do servidor;
// quem visita vê um código de referência para informar ao suporte.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="py-24 px-(--margem) flex flex-col items-start gap-5">
      <span className={rotulo}>Erro</span>
      <h1 className={tituloH1}>Algo deu errado</h1>
      <p className="m-0 text-[18px] leading-7 text-text-secondary max-w-130">
        Não foi possível carregar esta página. Tente de novo em alguns instantes.
        {error.digest && <> Ref. {error.digest}</>}
      </p>
      <Botao variante="escuro" grande type="button" onClick={reset}>
        Tentar de novo
      </Botao>
    </main>
  );
}
