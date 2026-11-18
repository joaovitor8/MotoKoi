"use client";

import { useActionState } from "react";
import { salvarConfiguracoes, type EstadoConfiguracoes } from "./acoes";
import { Botao } from "@/components/Botao";
import { cartao, entrada } from "@/app/painel/estilos";

export function FormularioConfiguracoes({ atuais }: { atuais: { garantia: string; prazo: string; whatsapp: string } }) {
  const [estado, enviar, salvando] = useActionState<EstadoConfiguracoes, FormData>(salvarConfiguracoes, {});
  // Depois de salvar (ou de um erro), os campos voltam com o que foi digitado.
  const v = estado.valores ?? atuais;

  return (
    <form action={enviar} className={`${cartao} p-6 flex flex-col gap-4`}>
      <h2>Garantia padrão e contato</h2>
      <div className="flex flex-wrap gap-4">
        <label className="flex-[1_1_220px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Garantia (meses)</span>
          <span className={entrada}>
            <input name="garantia" inputMode="numeric" maxLength={3} defaultValue={v.garantia} />
          </span>
          <span className="text-[12px] leading-4 text-text-muted">Vale para toda peça sem prazo próprio. Aparece na página Garantia.</span>
        </label>
        <label className="flex-[1_1_220px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">Prazo de resposta (dias úteis)</span>
          <span className={entrada}>
            <input name="prazo" inputMode="numeric" maxLength={2} defaultValue={v.prazo} />
          </span>
          <span className="text-[12px] leading-4 text-text-muted">Aparece no passo “Resposta” da página Garantia.</span>
        </label>
        <label className="flex-[1_1_220px] min-w-0 flex flex-col gap-1.5">
          <span className="font-semibold text-[14px] leading-4">WhatsApp da marca</span>
          <span className={entrada}>
            <input name="whatsapp" type="tel" maxLength={20} placeholder="(00) 00000-0000" defaultValue={v.whatsapp} />
          </span>
          <span className="text-[12px] leading-4 text-text-muted">Usado nos botões de WhatsApp do site e no rodapé.</span>
        </label>
      </div>
      {estado.erro && (
        <p role="alert" className="m-0 font-semibold text-[14px] leading-5 text-text-danger">
          {estado.erro}
        </p>
      )}
      {estado.salvo && (
        <p role="status" className="m-0 font-semibold text-[14px] leading-5 text-text-success">
          Alterações salvas.
        </p>
      )}
      <div>
        <Botao variante="primario" type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </Botao>
      </div>
    </form>
  );
}
