"use client";

import Link from "next/link";
import { useActionState } from "react";
import { excluirCadastro, salvarCadastro, type EstadoCadastro } from "./acoes";
import { CADASTROS, type Cadastro, type ChaveCadastro } from "./config";
import { Botao } from "@/components/Botao";
import { Marcacao } from "@/components/Marcacao";
import { cartao, entrada } from "@/app/painel/estilos";

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
    <section className={`${cartao} flex-[1_1_340px] min-w-0 p-6 flex flex-col gap-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2>{registro ? `Editar ${cfg.um}` : `${artigo} ${cfg.um}`}</h2>
        {registro && (
          <Link href={`/painel/${chave}`} className="font-semibold text-[14px] leading-5">
            Cancelar
          </Link>
        )}
      </div>
      <form action={salvar} className="flex flex-col gap-4">
        {cfg.campos.map((campo) =>
          campo.tipo === "marcacao" ? (
            <Marcacao key={campo.nome} name={campo.nome} defaultChecked={valor(campo.nome, campo.padrao) === true}>
              {campo.rotulo}
            </Marcacao>
          ) : (
            <label key={campo.nome} className="flex flex-col gap-1.5">
              <span className="font-semibold text-[14px] leading-4">{campo.rotulo}</span>
              <span className={entrada}>
                {campo.tipo === "selecao" ? (
                  // key: sem ela o React não reaplica o defaultValue do select quando o formulário volta de um erro
                  <select key={String(valor(campo.nome, campo.padrao))} name={campo.nome} defaultValue={String(valor(campo.nome, campo.padrao))} className="[all:unset] flex-1! min-w-0!">
                    {Object.entries(campo.opcoes ?? {}).map(([v, nome]) => (
                      <option key={v} value={v}>
                        {nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={campo.nome}
                    type={campo.tipo === "data" ? "date" : "text"}
                    required={campo.obrigatorio}
                    maxLength={campo.max}
                    inputMode={campo.tipo === "numero" ? "decimal" : undefined}
                    defaultValue={String(valor(campo.nome, campo.padrao))}
                  />
                )}
              </span>
              {campo.dica && <span className="text-[12px] leading-4 text-text-muted">{campo.dica}</span>}
            </label>
          ),
        )}
        {erro && (
          <p role="alert" className="m-0 font-semibold text-[14px] leading-5 text-text-danger">
            {erro}
          </p>
        )}
        <div>
          <Botao variante="primario" type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : registro ? "Salvar alterações" : `Criar ${cfg.um}`}
          </Botao>
        </div>
      </form>
      {registro && (
        <form
          action={excluir}
          onSubmit={(ev) => {
            if (!window.confirm(`Excluir ${cfg.feminino ? "esta" : "este"} ${cfg.um}? Não dá para desfazer.`)) ev.preventDefault();
          }}
          className="pt-5 border-t border-t-border"
        >
          <Botao variante="perigo" type="submit" disabled={excluindo}>
            Excluir {cfg.um}
          </Botao>
        </form>
      )}
    </section>
  );
}
