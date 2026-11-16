import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { obterConteudo } from "@/lib/conteudo";
import { FormularioRevenda } from "./FormularioRevenda";

export const metadata: Metadata = { title: "Seja revendedor" };

const numeros = [
  { numero: "3", texto: "lojas próprias" },
  { numero: "48h", texto: "tempo médio de resposta ao cadastro" },
  { numero: "R$ 0", texto: "de taxa de adesão ou mensalidade" },
];

const passos = [
  { titulo: "Cadastro", texto: "Preencha os dados da loja ou oficina no formulário abaixo." },
  { titulo: "Contato", texto: "Nossa equipe responde em cerca de 48 horas com a tabela de revenda." },
  { titulo: "Primeiro pedido", texto: "Você escolhe as peças e combina a entrega." },
];

const vantagens = [
  { titulo: "Preço de atacado", texto: "Tabela exclusiva para quem revende." },
  { titulo: "Pedido mínimo acessível", texto: "Dá para começar com poucas peças." },
  { titulo: "Suporte para reposição", texto: "Atendimento direto para repor o estoque." },
  { titulo: "Sem taxa", texto: "Não há adesão nem mensalidade." },
];

const duvidas = [
  { pergunta: "Preciso ter CNPJ?", resposta: "[RESPOSTA DO DONO: aceita CPF? MEI?]" },
  { pergunta: "Qual é o pedido mínimo?", resposta: "[RESPOSTA DO DONO: valor ou quantidade mínima]" },
  { pergunta: "Para quais regiões vocês entregam?", resposta: "[RESPOSTA DO DONO: regiões e prazo]" },
  { pergunta: "Como funciona a garantia das peças?", resposta: "[RESPOSTA DO DONO: prazo e como acionar].", garantia: true },
  {
    pergunta: "Vocês têm o código original de cada peça?",
    resposta: "Sim. Cada peça do catálogo mostra o código MotoKoi e o código original da montadora equivalente.",
  },
];

export default async function SejaRevendedor() {
  const conteudo = await obterConteudo();
  return (
    <>
      <Cabecalho atual="/seja-revendedor" />
      <main>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: "var(--brand)",
            color: "var(--text-on-brand)",
            padding: "88px var(--margem) 96px",
          }}
        >
          <Ondas />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 56 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "32px 64px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>
                <span className="st-rotulo" style={{ color: "inherit" }}>
                  Para lojas e oficinas
                </span>
                <h1 className="st-h1">
                  Suba o rio
                  <br />
                  com a gente
                </h1>
                <p style={{ margin: 0, fontSize: 20, lineHeight: "32px", maxWidth: 600 }}>
                  Revenda uma linha com marca própria: preço de atacado, pedido mínimo acessível e suporte para reposição.
                </p>
              </div>
              <a className="mk-btn mk-btn--dark mk-btn--lg" href="#cadastro">
                Fazer o cadastro <Icone nome="arrow-right" />
              </a>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
              {numeros.map((n) => (
                <div
                  key={n.numero}
                  style={{
                    flex: "1 1 200px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 20,
                    borderTop: "1.5px solid var(--text-on-brand)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(56px, 6vw, 88px)", lineHeight: 0.9 }}>
                    {n.numero}
                  </span>
                  <span style={{ fontSize: 16, lineHeight: "24px" }}>{n.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "112px var(--margem) 0", display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="st-rotulo">Como funciona</span>
            <h2 className="st-h2">Três passos</h2>
          </div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 40 }}>
            {passos.map((p, i) => (
              <li
                key={p.titulo}
                style={{
                  flex: "1 1 260px",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  paddingTop: 24,
                  borderTop: "1.5px solid var(--text)",
                }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 64, lineHeight: 0.9, color: "var(--brand)" }}>
                  {i + 1}
                </span>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" }}>
                  {p.titulo}
                </h3>
                <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="cadastro"
          style={{ padding: "112px var(--margem)", display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: "56px 72px" }}
        >
          <div style={{ flex: "1 1 360px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            <span className="st-rotulo">Cadastro</span>
            <h2 className="st-h2">
              Quero
              <br />
              revender
            </h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1.5px solid var(--text)" }}>
              {vantagens.map((v) => (
                <li key={v.titulo} style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 24, color: "var(--brand)", paddingTop: 2 }}>
                    <Icone nome="check" />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <b style={{ fontWeight: 600, fontSize: 17, lineHeight: "26px" }}>{v.titulo}</b>
                    <span style={{ fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>{v.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p style={{ margin: 0, fontSize: 15, lineHeight: "24px", color: "var(--text-secondary)" }}>
              Prefere conversar?{" "}
              <a href={conteudo.whatsapp?.link ?? "#"} style={{ fontWeight: 600 }}>
                Chame no WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
              </a>
            </p>
          </div>

          <FormularioRevenda />
        </section>

        {/* Depoimentos e materiais só aparecem quando há algo publicado no painel (Conteúdo do site). */}
        {conteudo.depoimentos.length > 0 && (
          <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexDirection: "column", gap: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span className="st-rotulo">Quem já revende</span>
              <h2 className="st-h2">
                O que dizem
                <br />
                os lojistas
              </h2>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {conteudo.depoimentos.map((d) => (
                <figure key={d.nome + d.loja} style={{ flex: "1 1 300px", minWidth: 0, margin: 0, display: "flex", flexDirection: "column", gap: 20, padding: 28, border: "1.5px solid var(--text)", borderRadius: 8 }}>
                  <span aria-hidden="true" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 64, lineHeight: 0.6, color: "var(--brand)" }}>
                    “
                  </span>
                  <blockquote style={{ margin: 0, fontSize: 18, lineHeight: "28px" }}>{d.texto}</blockquote>
                  <figcaption style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <b style={{ fontWeight: 600, fontSize: 15, lineHeight: "22px" }}>{d.nome}</b>
                    <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
                      {d.loja} · {d.cidade}, {d.uf}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {conteudo.materiais.length > 0 && (
          <section id="materiais" style={{ background: "var(--bg-subtle)", padding: "112px var(--margem)", display: "flex", flexWrap: "wrap", gap: "40px 72px" }}>
            <div style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <span className="st-rotulo">Materiais para o lojista</span>
              <h2 className="st-h2">
                Pronto para
                <br />
                vender
              </h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)", maxWidth: 420 }}>
                Fotos, fichas e catálogo para usar no balcão, no WhatsApp e na sua loja online.
              </p>
            </div>
            <ul style={{ flex: "2 1 560px", minWidth: 0, listStyle: "none", margin: 0, padding: 0, borderTop: "1.5px solid var(--text)" }}>
              {conteudo.materiais.map((m) => (
                <li key={m.url} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 24px", padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 26, color: "var(--brand)" }}>
                    <Icone nome="download" />
                  </span>
                  <span style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <b style={{ fontWeight: 600, fontSize: 17, lineHeight: "26px" }}>{m.titulo}</b>
                    {m.descricao && <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>{m.descricao}</span>}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>{m.formato}</span>
                  <a className="mk-btn mk-btn--secondary" href={m.url} aria-label={`Baixar ${m.titulo}`}>
                    Baixar
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Depois da faixa cinza dos materiais, a seção precisa de respiro em cima; sem ela, o respiro já vem da seção anterior. */}
        <section style={{ padding: conteudo.materiais.length > 0 ? "112px var(--margem)" : "0 var(--margem) 112px", display: "flex", flexDirection: "column", gap: 32 }}>
          <h2 className="st-h2">Dúvidas</h2>
          <div style={{ borderTop: "1.5px solid var(--text)" }}>
            {duvidas.map((d) => (
              <details key={d.pergunta} style={{ borderBottom: "1px solid var(--border)", padding: "20px 0" }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 18, lineHeight: "28px" }}>{d.pergunta}</summary>
                <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)", paddingTop: 8, maxWidth: 760 }}>
                  {d.resposta}
                  {"garantia" in d && (
                    <>
                      {" "}
                      Veja também a página <Link href="/garantia">Garantia</Link>.
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
