import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/Icone";
import { equipe, quando } from "@/lib/painel";
import { TIPOS_NEGOCIO } from "@/lib/revenda";
import { mudarSituacao, salvarAnotacoes } from "./acoes";

export const metadata: Metadata = { title: "Pedidos de revenda" };

const SITUACOES = {
  novo: { nome: "Novo", plural: "Novos", selo: "mk-badge mk-badge--brand" },
  em_contato: { nome: "Em contato", plural: "Em contato", selo: "mk-badge mk-badge--warning" },
  aprovado: { nome: "Aprovado", plural: "Aprovados", selo: "mk-badge mk-badge--success" },
  recusado: { nome: "Recusado", plural: "Recusados", selo: "mk-badge" },
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
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 className="ad-h1">Pedidos de revenda</h1>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
          Cadastros enviados pelo formulário “Seja revendedor”. Responda em até 48 horas.
        </span>
      </div>

      <nav className="ad-tabs" aria-label="Situação">
        <Link href={endereco()} aria-current={filtro ? undefined : "page"}>
          Todos
        </Link>
        {(Object.keys(SITUACOES) as Situacao[]).map((s) => (
          <Link key={s} href={endereco(s)} aria-current={filtro === s ? "page" : undefined}>
            {SITUACOES[s].plural} ({todos.filter((c) => c.situacao === s).length})
          </Link>
        ))}
      </nav>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
        <div className="ad-card" style={{ flex: "2 1 520px", minWidth: 0, overflowX: "auto" }}>
          <table className="ad-table">
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
                    <Link href={endereco(filtro, c.id)} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
                      {c.nome_loja}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{TIPOS_NEGOCIO[c.tipo_negocio]}</td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {c.cidade}, {c.uf}
                  </td>
                  <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{quando(c.criado_em)}</td>
                  <td>
                    <span className={SITUACOES[c.situacao].selo}>{SITUACOES[c.situacao].nome}</span>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--text-secondary)" }}>
                    Nenhum cadastro nesta situação.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {aberto && (
          <section
            className="ad-card"
            aria-label="Detalhes do cadastro"
            style={{ flex: "1 1 340px", minWidth: 0, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <h2>{aberto.nome_loja}</h2>
              <span className={SITUACOES[aberto.situacao].selo}>{SITUACOES[aberto.situacao].nome}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Responsável", aberto.responsavel],
                ["CNPJ ou CPF", aberto.documento],
                ["WhatsApp", aberto.whatsapp],
                ["E-mail", aberto.email],
                ["Cidade", `${aberto.cidade}, ${aberto.uf}`],
                ["Mensagem", aberto.mensagem ?? "Sem mensagem."],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span className="ad-lab">{rotulo}</span>
                  <span style={{ fontSize: 15, lineHeight: "24px", overflowWrap: "anywhere" }}>{valor}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <a className="mk-btn mk-btn--primary mk-btn--block" href={linkWhatsApp(aberto.whatsapp)} target="_blank" rel="noreferrer">
                <Icone nome="message" /> Responder no WhatsApp
              </a>
              <div style={{ display: "flex", gap: 8 }}>
                <form action={mudarSituacao.bind(null, aberto.id, "em_contato")} style={{ flex: 1, display: "flex" }}>
                  <button type="submit" className="mk-btn mk-btn--secondary" style={{ flex: 1 }} disabled={aberto.situacao === "em_contato"}>
                    Marcar em contato
                  </button>
                </form>
                <form action={mudarSituacao.bind(null, aberto.id, "aprovado")} style={{ flex: 1, display: "flex" }}>
                  <button type="submit" className="mk-btn mk-btn--secondary" style={{ flex: 1 }} disabled={aberto.situacao === "aprovado"}>
                    Aprovar
                  </button>
                </form>
              </div>
              <form action={mudarSituacao.bind(null, aberto.id, "recusado")} style={{ alignSelf: "center" }}>
                <button type="submit" className="mk-btn mk-btn--ghost" disabled={aberto.situacao === "recusado"}>
                  Recusar cadastro
                </button>
              </form>
            </div>
            {/* key: ao trocar de cadastro, o campo recomeça com as anotações do novo. */}
            <form key={aberto.id} action={salvarAnotacoes.bind(null, aberto.id)} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14, lineHeight: "16px" }}>Anotações internas</span>
                <textarea
                  name="anotacoes"
                  rows={3}
                  maxLength={4000}
                  defaultValue={aberto.anotacoes ?? ""}
                  placeholder="Ex.: pediu a tabela de transmissão. Ligar na sexta."
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: 4,
                    background: "var(--bg)",
                    font: "400 14px/22px var(--font-sans)",
                    color: "var(--text)",
                    resize: "vertical",
                  }}
                />
              </label>
              <button type="submit" className="mk-btn mk-btn--secondary" style={{ alignSelf: "flex-start" }}>
                Salvar anotações
              </button>
            </form>
          </section>
        )}
      </div>
    </>
  );
}
