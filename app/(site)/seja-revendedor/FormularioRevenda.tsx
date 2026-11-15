"use client";

import { useActionState, type ReactNode } from "react";
import { Icone } from "@/components/Icone";
import { TIPOS_NEGOCIO } from "@/lib/revenda";
import { enviarCadastro, type EstadoEnvio } from "./acoes";

const caixa = {
  flex: "1 1 560px",
  minWidth: 0,
  padding: 40,
  border: "1.5px solid var(--text)",
  borderRadius: 8,
  boxSizing: "border-box",
} as const;

function Campo({ rotulo, ajuda, largo, children }: { rotulo: string; ajuda?: string; largo?: boolean; children: ReactNode }) {
  return (
    <label className="mk-field" style={{ width: "auto", flex: largo ? "1 1 100%" : "1 1 280px", minWidth: 0 }}>
      <span className="mk-field__label">{rotulo}</span>
      {children}
      {ajuda && <span className="mk-field__help">{ajuda}</span>}
    </label>
  );
}

export function FormularioRevenda() {
  const [estado, enviar, enviando] = useActionState<EstadoEnvio, FormData>(enviarCadastro, {});
  // Depois de um erro, o formulário volta com o que a pessoa já tinha digitado.
  const v = estado.valores ?? {};

  if (estado.enviado) {
    return (
      <div role="status" style={{ ...caixa, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 40, color: "var(--brand)" }}>
          <Icone nome="check" />
        </span>
        <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" }}>
          Cadastro enviado
        </h3>
        <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>
          Recebemos os dados da sua loja. Nossa equipe responde em cerca de 48 horas.
        </p>
      </div>
    );
  }

  return (
    <form action={enviar} style={{ ...caixa, display: "flex", flexWrap: "wrap", gap: "20px 24px" }}>
      <Campo rotulo="Nome da loja ou oficina" largo>
        <span className="mk-field__control">
          <input name="loja" type="text" required maxLength={120} defaultValue={v.loja} placeholder="Ex.: Moto Peças Central" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="CNPJ" ajuda="Se ainda não tiver CNPJ, informe o CPF.">
        <span className="mk-field__control">
          <input name="documento" type="text" required maxLength={18} defaultValue={v.documento} placeholder="00.000.000/0000-00" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="Tipo de negócio">
        <span className="mk-field__control" style={{ justifyContent: "space-between" }}>
          {/* key: sem ela o React não reaplica o defaultValue do select quando o formulário volta de um erro */}
          <select key={v.tipo} name="tipo" defaultValue={v.tipo} style={{ all: "unset", flex: 1, minWidth: 0, fontSize: 16, lineHeight: "24px" }}>
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
        <span className="mk-field__control">
          <input name="responsavel" type="text" required maxLength={120} defaultValue={v.responsavel} placeholder="Nome e sobrenome" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="WhatsApp">
        <span className="mk-field__control">
          <input name="whatsapp" type="tel" required maxLength={20} defaultValue={v.whatsapp} placeholder="(00) 00000-0000" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="E-mail">
        <span className="mk-field__control">
          <input name="email" type="email" required maxLength={160} defaultValue={v.email} placeholder="voce@loja.com.br" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="Cidade e estado">
        <span className="mk-field__control">
          <input name="cidade" type="text" required maxLength={90} defaultValue={v.cidade} placeholder="Ex.: Araçatuba, SP" style={{ minWidth: 0 }} />
        </span>
      </Campo>
      <Campo rotulo="Mensagem (opcional)" largo>
        <textarea
          name="mensagem"
          rows={3}
          maxLength={2000}
          defaultValue={v.mensagem}
          placeholder="Conte quais peças mais saem na sua loja."
          style={{
            boxSizing: "border-box",
            width: "100%",
            padding: "12px 16px",
            border: "1.5px solid var(--border-strong)",
            borderRadius: 4,
            background: "var(--bg)",
            font: "400 16px/24px var(--font-sans)",
            color: "var(--text)",
            resize: "vertical",
          }}
        />
      </Campo>
      {/* Campo-isca contra spam (ver acoes.ts). Fica fora da tela e fora da navegação por teclado. */}
      <input name="site" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
      <div style={{ flex: "1 1 100%" }}>
        <label className="mk-check">
          <input name="aceite" type="checkbox" required defaultChecked={v.aceite === "on"} />
          <span className="mk-check__box">
            <Icone nome="check" />
          </span>
          Aceito receber o contato da MotoKoi por WhatsApp e e-mail.
        </label>
      </div>
      {estado.erro && (
        <p role="alert" style={{ flex: "1 1 100%", margin: 0, fontWeight: 600, fontSize: 15, lineHeight: "24px", color: "var(--text-danger)" }}>
          {estado.erro}
        </p>
      )}
      <div style={{ flex: "1 1 100%", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 24px" }}>
        <button type="submit" disabled={enviando} className="mk-btn mk-btn--primary mk-btn--lg" style={enviando ? { opacity: 0.6 } : undefined}>
          {enviando ? "Enviando…" : "Enviar cadastro"} <Icone nome="arrow-right" />
        </button>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>Resposta em cerca de 48 horas.</span>
      </div>
    </form>
  );
}
