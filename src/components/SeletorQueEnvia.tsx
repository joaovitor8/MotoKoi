"use client";

import type { CSSProperties } from "react";
import { Icone } from "./Icone";

// Seletor que já envia ao trocar de opção, para filtros que vivem na URL (ano no catálogo, estado em Onde comprar).
// `ocultos` leva junto os outros filtros que já estão na URL, para um não apagar o outro.
export function SeletorQueEnvia({
  acao,
  nome,
  rotulo,
  valor,
  opcoes,
  ocultos,
  className,
  style,
}: {
  acao: string;
  nome: string;
  rotulo: string;
  valor: string;
  opcoes: { valor: string; texto: string }[];
  ocultos: [string, string][];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <form action={acao} style={{ display: "contents" }}>
      {ocultos.map(([campo, v], i) => (
        <input key={i} type="hidden" name={campo} value={v} />
      ))}
      <span className={className} style={style}>
        <select
          name={nome}
          aria-label={rotulo}
          defaultValue={valor}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          style={{ all: "unset", flex: 1, minWidth: 0 }}
        >
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <Icone nome="chevron-down" />
      </span>
    </form>
  );
}
