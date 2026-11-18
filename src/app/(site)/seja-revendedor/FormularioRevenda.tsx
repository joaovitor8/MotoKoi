"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { Icone } from "@/components/Icone";
import { TIPOS_NEGOCIO } from "@/lib/revenda";
import { enviarCadastro, type EstadoEnvio } from "./acoes";
import { Botao } from "@/components/Botao";
import { Campo as CampoBase, classesControle } from "@/components/Campo";
import { Marcacao } from "@/components/Marcacao";

// `largo`: o campo ocupa a linha inteira do formulário.
function Campo({ rotulo, ajuda, largo, children }: { rotulo: string; ajuda?: string; largo?: boolean; children: ReactNode }) {
  return (
    <CampoBase rotulo={rotulo} ajuda={ajuda} className={`min-w-0 ${largo ? "flex-[1_1_100%]" : "flex-[1_1_280px]"}`}>
      {children}
    </CampoBase>
  );
}

export function FormularioRevenda() {
  const [estado, enviar, enviando] = useActionState<EstadoEnvio, FormData>(enviarCadastro, {});
  // Depois de um erro, o formulário volta com o que a pessoa já tinha digitado.
  const v = estado.valores ?? {};

  if (estado.enviado) {
    return (
      <div role="status" className="flex-[1_1_560px] min-w-0 p-10 border-[1.5px] border-text rounded-lg box-border flex flex-col gap-4">
        <span className="text-[40px] text-brand">
          <Icone nome="check" />
        </span>
        <h3 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">
          Cadastro enviado
        </h3>
        <p className="m-0 text-[17px] leading-7 text-text-secondary">
          Recebemos os dados da sua loja. Nossa equipe responde em cerca de 48 horas.
        </p>
      </div>
    );
  }

  return (
    <form action={enviar} className="flex-[1_1_560px] min-w-0 p-10 border-[1.5px] border-text rounded-lg box-border flex flex-wrap gap-y-5 gap-x-6">
      <Campo rotulo="Nome da loja ou oficina" largo>
        <span className={classesControle}>
          <input name="loja" type="text" required maxLength={120} defaultValue={v.loja} placeholder="Ex.: Moto Peças Central" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="CNPJ" ajuda="Se ainda não tiver CNPJ, informe o CPF.">
        <span className={classesControle}>
          <input name="documento" type="text" required maxLength={18} defaultValue={v.documento} placeholder="00.000.000/0000-00" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="Tipo de negócio">
        <span className={`${classesControle} justify-between`}>
          {/* key: sem ela o React não reaplica o defaultValue do select quando o formulário volta de um erro */}
          <select key={v.tipo} name="tipo" defaultValue={v.tipo} className="[all:unset] flex-1! min-w-0! text-[16px]! leading-6!">
            {Object.entries(TIPOS_NEGOCIO).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
          <Icone nome="chevron-down" />
        </span>
      </Campo>
      <Campo rotulo="Seu nome">
        <span className={classesControle}>
          <input name="responsavel" type="text" required maxLength={120} defaultValue={v.responsavel} placeholder="Nome e sobrenome" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="WhatsApp">
        <span className={classesControle}>
          <input name="whatsapp" type="tel" required maxLength={20} defaultValue={v.whatsapp} placeholder="(00) 00000-0000" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="E-mail">
        <span className={classesControle}>
          <input name="email" type="email" required maxLength={160} defaultValue={v.email} placeholder="voce@loja.com.br" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="Cidade e estado">
        <span className={classesControle}>
          <input name="cidade" type="text" required maxLength={90} defaultValue={v.cidade} placeholder="Ex.: Araçatuba, SP" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="Mensagem (opcional)" largo>
        <textarea
          name="mensagem"
          rows={3}
          maxLength={2000}
          defaultValue={v.mensagem}
          placeholder="Conte quais peças mais saem na sua loja."
          className="box-border w-full py-3 px-4 border-[1.5px] border-border-strong rounded-md bg-bg [font:400_16px/24px_var(--font-sans)] text-text [resize:vertical]"
        />
      </Campo>
      {/* Campo-isca contra spam (ver acoes.ts). Fica fora da tela e fora da navegação por teclado. */}
      <input name="site" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
      <div className="flex-[1_1_100%]">
        <Marcacao name="aceite" required defaultChecked={v.aceite === "on"}>
          Aceito receber o contato da MotoKoi por WhatsApp e e-mail.
        </Marcacao>
        <p className="mx-0 mt-2 mb-0 text-[14px] leading-5 text-text-muted">
          Usamos estes dados só para analisar o cadastro e falar com você. Veja a <Link href="/privacidade">Política de privacidade</Link>.
        </p>
      </div>
      {estado.erro && (
        <p role="alert" className="flex-[1_1_100%] m-0 font-semibold text-[15px] leading-6 text-text-danger">
          {estado.erro}
        </p>
      )}
      <div className="flex-[1_1_100%] flex flex-wrap items-center gap-y-3 gap-x-6">
        <Botao variante="primario" grande type="submit" disabled={enviando} className={enviando ? "opacity-60" : undefined}>
          {enviando ? "Enviando…" : "Enviar cadastro"} <Icone nome="arrow-right" />
        </Botao>
        <span className="text-[14px] leading-5 text-text-muted">Resposta em cerca de 48 horas.</span>
      </div>
    </form>
  );
}
