"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icone } from "@/components/Icone";
import { entrar, type EstadoLogin } from "../acoes";

export function FormularioEntrar() {
  const [estado, enviar, entrando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={enviar} style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 className="ad-h1">Entrar</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--text-secondary)" }}>Acesso só para a equipe MotoKoi.</p>
      </div>
      <label className="mk-field" style={{ width: "auto", flex: "0 0 auto", minWidth: 0 }}>
        <span className="mk-field__label">E-mail</span>
        <span className="mk-field__control">
          <input name="email" type="email" required autoComplete="username" defaultValue={estado.email} placeholder="voce@motokoi.com.br" style={{ minWidth: 0 }} />
        </span>
      </label>
      <label className="mk-field" style={{ width: "auto", flex: "0 0 auto", minWidth: 0 }}>
        <span className="mk-field__label">Senha</span>
        <span className="mk-field__control">
          <input name="senha" type="password" required autoComplete="current-password" placeholder="Sua senha" style={{ minWidth: 0 }} />
        </span>
      </label>
      {estado.erro && (
        <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: "24px", color: "var(--text-danger)" }}>
          {estado.erro}
        </p>
      )}
      <button type="submit" disabled={entrando} className="mk-btn mk-btn--dark mk-btn--lg mk-btn--block" style={entrando ? { opacity: 0.6 } : undefined}>
        {entrando ? "Entrando…" : "Entrar"} <Icone nome="arrow-right" />
      </button>
      <Link href="/" style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)", textAlign: "center" }}>
        Voltar para o site
      </Link>
    </form>
  );
}
