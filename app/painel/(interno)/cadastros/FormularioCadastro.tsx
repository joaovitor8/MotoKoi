"use client";

import Link from "next/link";
import { useActionState } from "react";
import { excluirCadastro, salvarCadastro, type EstadoCadastro } from "./acoes";
import { CADASTROS, type Cadastro, type ChaveCadastro } from "./config";

const rotulo = { fontWeight: 600, fontSize: 14, lineHeight: "16px" } as const;

// `registro` é a linha em edição; sem ela, o formulário cria um registro novo.
export function FormularioCadastro({ chave, registro }: { chave: ChaveCadastro; registro?: Record<string, unknown> & { id: number } }) {
  const cfg: Cadastro = CADASTROS[chave];
  const id = registro?.id ?? null;
  const [salvo, salvar, salvando] = useActionState<EstadoCadastro, FormData>(salvarCadastro.bind(null, chave, id), {});
  const [excluido, excluir, excluindo] = useActionState<EstadoCadastro>(excluirCadastro.bind(null, chave, id ?? 0), {});
  const erro = salvo.erro ?? excluido.erro;
  // Depois de um erro, volta o que foi digitado; senão, o que está no banco; senão, o valor inicial do campo.
  const valor = (nome: string, padrao?: string | boolean) => salvo.valores?.[nome] ?? (registro?.[nome] as string | number | boolean | null | undefined) ?? padrao ?? "";
  const artigo = cfg.feminino ? "Nova" : "Novo";

  return (
    <section className="ad-card" style={{ flex: "1 1 340px", minWidth: 0, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h2>{registro ? `Editar ${cfg.um}` : `${artigo} ${cfg.um}`}</h2>
        {registro && (
          <Link href={`/painel/${chave}`} style={{ fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>
            Cancelar
          </Link>
        )}
      </div>
      <form action={salvar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cfg.campos.map((campo) =>
          campo.tipo === "marcacao" ? (
            <label key={campo.nome} className="mk-check">
              <input type="checkbox" name={campo.nome} defaultChecked={valor(campo.nome, campo.padrao) === true} />
              <span className="mk-check__box">
                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              {campo.rotulo}
            </label>
          ) : (
            <label key={campo.nome} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={rotulo}>{campo.rotulo}</span>
              <span className="ad-in">
                {campo.tipo === "selecao" ? (
                  // key: sem ela o React não reaplica o defaultValue do select quando o formulário volta de um erro
                  <select key={String(valor(campo.nome, campo.padrao))} name={campo.nome} defaultValue={String(valor(campo.nome, campo.padrao))} style={{ all: "unset", flex: 1, minWidth: 0 }}>
                    {Object.entries(campo.opcoes ?? {}).map(([v, nome]) => (
                      <option key={v} value={v}>
                        {nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={campo.nome}
                    required={campo.obrigatorio}
                    maxLength={campo.max}
                    inputMode={campo.tipo === "numero" ? "decimal" : undefined}
                    defaultValue={String(valor(campo.nome, campo.padrao))}
                  />
                )}
              </span>
              {campo.dica && <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--text-muted)" }}>{campo.dica}</span>}
            </label>
          ),
        )}
        {erro && (
          <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "var(--text-danger)" }}>
            {erro}
          </p>
        )}
        <div>
          <button type="submit" disabled={salvando} className="mk-btn mk-btn--primary">
            {salvando ? "Salvando…" : registro ? "Salvar alterações" : `Criar ${cfg.um}`}
          </button>
        </div>
      </form>
      {registro && (
        <form
          action={excluir}
          onSubmit={(ev) => {
            if (!window.confirm(`Excluir ${cfg.feminino ? "esta" : "este"} ${cfg.um}? Não dá para desfazer.`)) ev.preventDefault();
          }}
          style={{ paddingTop: 20, borderTop: "1px solid var(--border)" }}
        >
          <button type="submit" disabled={excluindo} className="mk-btn mk-btn--secondary" style={{ color: "var(--text-danger)", borderColor: "var(--border-danger)" }}>
            Excluir {cfg.um}
          </button>
        </form>
      )}
    </section>
  );
}
