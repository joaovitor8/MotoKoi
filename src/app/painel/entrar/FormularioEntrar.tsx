"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icone } from "@/components/Icone";
import { entrar, type EstadoLogin } from "../acoes";
import { Botao } from "@/components/Botao";
import { Campo, classesControle } from "@/components/Campo";
import { tituloPainel } from "@/app/painel/estilos";

export function FormularioEntrar() {
  const [estado, enviar, entrando] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={enviar} className="w-full max-w-100 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className={tituloPainel}>Entrar</h1>
        <p className="m-0 text-[16px] leading-6 text-text-secondary">Acesso só para a equipe MotoKoi.</p>
      </div>
      <Campo rotulo="E-mail" className="min-w-0 flex-[0_0_auto]">
        <span className={classesControle}>
          <input name="email" type="email" required autoComplete="username" defaultValue={estado.email} placeholder="voce@motokoi.com.br" className="min-w-0" />
        </span>
      </Campo>
      <Campo rotulo="Senha" className="min-w-0 flex-[0_0_auto]">
        <span className={classesControle}>
          <input name="senha" type="password" required autoComplete="current-password" placeholder="Sua senha" className="min-w-0" />
        </span>
      </Campo>
      {estado.erro && (
        <p role="alert" className="m-0 font-semibold text-[15px] leading-6 text-text-danger">
          {estado.erro}
        </p>
      )}
      <Botao variante="escuro" grande bloco type="submit" disabled={entrando} className={entrando ? "opacity-60" : undefined}>
        {entrando ? "Entrando…" : "Entrar"} <Icone nome="arrow-right" />
      </Botao>
      <Link href="/" className="text-[14px] leading-5 text-text-muted text-center">
        Voltar para o site
      </Link>
    </form>
  );
}
