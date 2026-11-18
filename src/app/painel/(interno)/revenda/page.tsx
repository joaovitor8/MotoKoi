import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/Icone";
import { equipe, quando } from "@/lib/painel";
import { TIPOS_NEGOCIO } from "@/lib/revenda";
import { mudarSituacao, salvarAnotacoes } from "./acoes";
import { ExcluirCadastro } from "./ExcluirCadastro";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { cartao, rotuloPainel, tabela, tituloPainel } from "@/app/painel/estilos";

export const metadata: Metadata = { title: "Pedidos de revenda" };

const SITUACOES = {
  novo: { nome: "Novo", plural: "Novos", tom: "marca" },
  em_contato: { nome: "Em contato", plural: "Em contato", tom: "aviso" },
  aprovado: { nome: "Aprovado", plural: "Aprovados", tom: "sucesso" },
  recusado: { nome: "Recusado", plural: "Recusados", tom: "neutro" },
} as const;
type Situacao = keyof typeof SITUACOES;

type Cadastro = {
  id: number;
  nome_loja: string;
  documento: string;
  tipo_negocio: keyof typeof TIPOS_NEGOCIO;
  responsavel: string;
  whatsapp: string;
  email: string;
  cidade: string;
  uf: string;
  mensagem: string | null;
  situacao: Situacao;
  anotacoes: string | null;
  criado_em: string;
};

// wa.me pede o número só com dígitos e com o código do país.
function linkWhatsApp(numero: string) {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
}

export default async function PedidosDeRevenda({ searchParams }: PageProps<"/painel/revenda">) {
  const [{ supabase }, sp] = await Promise.all([equipe(), searchParams]);
  const { data, error } = await supabase.from("cadastros_revenda").select("*").order("criado_em", { ascending: false });
  if (error) throw new Error(`Supabase: ${error.message}`);
  const todos = data as Cadastro[];

  const texto = (v: string | string[] | undefined) => [v].flat()[0];
  const filtro = Object.hasOwn(SITUACOES, texto(sp.situacao) ?? "") ? (texto(sp.situacao) as Situacao) : undefined;
  const lista = filtro ? todos.filter((c) => c.situacao === filtro) : todos;
  // Sem ?id= na URL, o painel de detalhe mostra o primeiro da lista.
  const aberto = lista.find((c) => c.id === Number(texto(sp.id))) ?? lista[0];
  const endereco = (situacao?: Situacao, id?: number) => {
    const q = new URLSearchParams();
    if (situacao) q.set("situacao", situacao);
    if (id) q.set("id", String(id));
    return q.size ? `/painel/revenda?${q}` : "/painel/revenda";
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className={tituloPainel}>Pedidos de revenda</h1>
        <span className="text-[14px] leading-5 text-text-muted">
          Cadastros enviados pelo formulário “Seja revendedor”. Responda em até 48 horas.
        </span>
      </div>

      <nav className="flex flex-wrap gap-x-7 gap-y-1 border-b border-border" aria-label="Situação">
        <Link href={endereco()} aria-current={filtro ? undefined : "page"} className="-mb-px border-b-2 border-transparent py-3 text-[15px] leading-5 font-semibold text-text-muted no-underline aria-[current]:border-brand aria-[current]:text-text">
          Todos
        </Link>
        {(Object.keys(SITUACOES) as Situacao[]).map((s) => (
          <Link key={s} href={endereco(s)} aria-current={filtro === s ? "page" : undefined} className="-mb-px border-b-2 border-transparent py-3 text-[15px] leading-5 font-semibold text-text-muted no-underline aria-[current]:border-brand aria-[current]:text-text">
            {SITUACOES[s].plural} ({todos.filter((c) => c.situacao === s).length})
          </Link>
        ))}
      </nav>

      <div className="flex flex-wrap items-start gap-6">
        <div className={`${cartao} flex-[2_1_520px] min-w-0 overflow-x-auto`}>
          <table className={tabela}>
            <thead>
              <tr>
                <th>Loja</th>
                <th>Tipo</th>
                <th>Cidade</th>
                <th>Recebido</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} aria-selected={c.id === aberto?.id}>
                  <td>
                    <Link href={endereco(filtro, c.id)} className="font-semibold text-text no-underline">
                      {c.nome_loja}
                    </Link>
                  </td>
                  <td className="text-text-secondary whitespace-nowrap">{TIPOS_NEGOCIO[c.tipo_negocio]}</td>
                  <td className="text-text-secondary whitespace-nowrap">
                    {c.cidade}, {c.uf}
                  </td>
                  <td className="text-text-secondary whitespace-nowrap">{quando(c.criado_em)}</td>
                  <td>
                    <Selo tom={SITUACOES[c.situacao].tom}>{SITUACOES[c.situacao].nome}</Selo>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-text-secondary">
                    Nenhum cadastro nesta situação.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {aberto && (
          <section
            className={`${cartao} flex-[1_1_340px] min-w-0 p-6 flex flex-col gap-5`}
            aria-label="Detalhes do cadastro"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2>{aberto.nome_loja}</h2>
              <Selo tom={SITUACOES[aberto.situacao].tom}>{SITUACOES[aberto.situacao].nome}</Selo>
            </div>
            <div className="flex flex-col gap-3.5">
              {[
                ["Responsável", aberto.responsavel],
                ["CNPJ ou CPF", aberto.documento],
                ["WhatsApp", aberto.whatsapp],
                ["E-mail", aberto.email],
                ["Cidade", `${aberto.cidade}, ${aberto.uf}`],
                ["Mensagem", aberto.mensagem ?? "Sem mensagem."],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex flex-col gap-0.5">
                  <span className={rotuloPainel}>{rotulo}</span>
                  <span className="text-[15px] leading-6 wrap-anywhere">{valor}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-5 border-t border-t-border">
              <Botao variante="primario" bloco href={linkWhatsApp(aberto.whatsapp)} target="_blank" rel="noreferrer">
                <Icone nome="message" /> Responder no WhatsApp
              </Botao>
              <div className="flex gap-2">
                <form action={mudarSituacao.bind(null, aberto.id, "em_contato")} className="flex-1 flex">
                  <Botao variante="secundario" type="submit" className="flex-1" disabled={aberto.situacao === "em_contato"}>
                    Marcar em contato
                  </Botao>
                </form>
                <form action={mudarSituacao.bind(null, aberto.id, "aprovado")} className="flex-1 flex">
                  <Botao variante="secundario" type="submit" className="flex-1" disabled={aberto.situacao === "aprovado"}>
                    Aprovar
                  </Botao>
                </form>
              </div>
              <form action={mudarSituacao.bind(null, aberto.id, "recusado")} className="self-center">
                <Botao variante="fantasma" type="submit" disabled={aberto.situacao === "recusado"}>
                  Recusar cadastro
                </Botao>
              </form>
              <ExcluirCadastro id={aberto.id} loja={aberto.nome_loja} />
            </div>
            {/* key: ao trocar de cadastro, o campo recomeça com as anotações do novo. */}
            <form key={aberto.id} action={salvarAnotacoes.bind(null, aberto.id)} className="flex flex-col gap-2">
              <label className="flex flex-col gap-1.5">
                <span className="font-semibold text-[14px] leading-4">Anotações internas</span>
                <textarea
                  name="anotacoes"
                  rows={3}
                  maxLength={4000}
                  defaultValue={aberto.anotacoes ?? ""}
                  placeholder="Ex.: pediu a tabela de transmissão. Ligar na sexta."
                  className="box-border w-full py-2.5 px-3 border-[1.5px] border-border-strong rounded-md bg-bg [font:400_14px/22px_var(--font-sans)] text-text [resize:vertical]"
                />
              </label>
              <Botao variante="secundario" type="submit" className="self-start">
                Salvar anotações
              </Botao>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
