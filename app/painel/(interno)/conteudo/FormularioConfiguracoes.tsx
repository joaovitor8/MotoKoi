"use client";

import { useActionState } from "react";
import { salvarConfiguracoes, type EstadoConfiguracoes } from "./acoes";

const rotulo = { fontWeight: 600, fontSize: 14, lineHeight: "16px" } as const;
const dica = { fontSize: 12, lineHeight: "16px", color: "var(--text-muted)" } as const;
const campo = { flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 } as const;

export function FormularioConfiguracoes({ atuais }: { atuais: { garantia: string; prazo: string; whatsapp: string } }) {
  const [estado, enviar, salvando] = useActionState<EstadoConfiguracoes, FormData>(salvarConfiguracoes, {});
  // Depois de salvar (ou de um erro), os campos voltam com o que foi digitado.
  const v = estado.valores ?? atuais;

  return (
    <form action={enviar} className="ad-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <h2>Garantia padrão e contato</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <label style={campo}>
          <span style={rotulo}>Garantia (meses)</span>
          <span className="ad-in">
            <input name="garantia" inputMode="numeric" maxLength={3} defaultValue={v.garantia} />
          </span>
          <span style={dica}>Vale para toda peça sem prazo próprio. Aparece na página Garantia.</span>
        </label>
        <label style={campo}>
          <span style={rotulo}>Prazo de resposta (dias úteis)</span>
          <span className="ad-in">
            <input name="prazo" inputMode="numeric" maxLength={2} defaultValue={v.prazo} />
          </span>
          <span style={dica}>Aparece no passo “Resposta” da página Garantia.</span>
        </label>
        <label style={campo}>
          <span style={rotulo}>WhatsApp da marca</span>
          <span className="ad-in">
            <input name="whatsapp" type="tel" maxLength={20} placeholder="(00) 00000-0000" defaultValue={v.whatsapp} />
          </span>
          <span style={dica}>Usado nos botões de WhatsApp do site e no rodapé.</span>
        </label>
      </div>
      {estado.erro && (
        <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "var(--text-danger)" }}>
          {estado.erro}
        </p>
      )}
      {estado.salvo && (
        <p role="status" style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "var(--text-success)" }}>
          Alterações salvas.
        </p>
      )}
      <div>
        <button type="submit" disabled={salvando} className="mk-btn mk-btn--primary">
          {salvando ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
