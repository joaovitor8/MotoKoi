import type { Metadata } from "next";
import Link from "next/link";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { obterConteudo } from "@/lib/conteudo";
import { FormularioRevenda } from "./FormularioRevenda";
import { Botao } from "@/components/Botao";
import { rotulo, tituloH1, tituloH2 } from "@/components/estilos";

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
  { pergunta: "Preciso ter CNPJ?", resposta: "Não é obrigatório. Oficinas e MEIs podem começar com CPF ou com o CNPJ do MEI. (EX)" },
  { pergunta: "Qual é o pedido mínimo?", resposta: "R$ 500,00 no primeiro pedido, misturando as peças que quiser. Nos seguintes não há mínimo. (EX)" },
  { pergunta: "Para quais regiões vocês entregam?", resposta: "Para SP, MS, PR, MG e GO, com entrega em 3 a 7 dias úteis a partir de Araçatuba. (EX)" },
  { pergunta: "Como funciona a garantia das peças?", resposta: "Toda peça tem 3 meses de garantia contra defeito de fabricação. O lojista aciona pelo WhatsApp com a foto da peça e da nota. (EX)", garantia: true },
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
        <section className="relative overflow-hidden bg-brand text-text-on-brand px-(--margem) pt-22 pb-24">
          <Ondas />
          <div className="relative flex flex-col gap-14">
            <div className="flex flex-wrap items-end justify-between gap-y-8 gap-x-16">
              <div className="flex flex-col gap-5 max-w-205">
                <span className={`${rotulo} text-inherit!`}>
                  Para lojas e oficinas
                </span>
                <h1 className={tituloH1}>
                  Suba o rio
                  <br />
                  com a gente
                </h1>
                <p className="m-0 text-[20px] leading-8 max-w-150">
                  Revenda uma linha com marca própria: preço de atacado, pedido mínimo acessível e suporte para reposição.
                </p>
              </div>
              <Botao variante="escuro" grande href="#cadastro">
                Fazer o cadastro <Icone nome="arrow-right" />
              </Botao>
            </div>
            <dl className="m-0 flex flex-wrap gap-10">
              {numeros.map((n) => (
                <div
                  key={n.numero}
                  className="flex-[1_1_200px] flex flex-col-reverse justify-end gap-2 pt-5 border-t-[1.5px] border-t-text-on-brand"
                >
                  <dt className="text-[16px] leading-6">{n.texto}</dt>
                  <dd className="m-0 font-display font-extrabold [font-size:clamp(56px,_6vw,_88px)] leading-[0.9]">
                    {n.numero}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-(--margem) pt-28 pb-0 flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className={rotulo}>Como funciona</span>
            <h2 className={tituloH2}>Três passos</h2>
          </div>
          <ol className="list-none m-0 p-0 flex flex-wrap gap-10">
            {passos.map((p, i) => (
              <li
                key={p.titulo}
                className="flex-[1_1_260px] min-w-0 flex flex-col gap-3 pt-6 border-t-[1.5px] border-t-text"
              >
                <span className="font-display font-extrabold text-[64px] leading-[0.9] text-brand">
                  {i + 1}
                </span>
                <h3 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">
                  {p.titulo}
                </h3>
                <p className="m-0 text-[17px] leading-7 text-text-secondary">{p.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="cadastro"
          className="py-28 px-(--margem) flex flex-wrap items-start gap-y-14 gap-x-18"
        >
          <div className="flex-[1_1_360px] min-w-0 flex flex-col gap-6">
            <span className={rotulo}>Cadastro</span>
            <h2 className={tituloH2}>
              Quero
              <br />
              revender
            </h2>
            <ul className="list-none m-0 p-0 border-t-[1.5px] border-t-text">
              {vantagens.map((v) => (
                <li key={v.titulo} className="flex gap-4 py-4.5 px-0 border-b border-b-border">
                  <span className="text-[24px] text-brand pt-0.5">
                    <Icone nome="check" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <b className="font-semibold text-[17px] leading-[26px]">{v.titulo}</b>
                    <span className="text-[15px] leading-6 text-text-secondary">{v.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="m-0 text-[15px] leading-6 text-text-secondary">
              Prefere conversar?{" "}
              <LinkWhatsApp whatsapp={conteudo.whatsapp} className="font-semibold">
                Chame no WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
              </LinkWhatsApp>
            </p>
          </div>

          <FormularioRevenda />
        </section>

        {/* Depoimentos e materiais só aparecem quando há algo publicado no painel (Conteúdo do site). */}
        {conteudo.depoimentos.length > 0 && (
          <section className="px-(--margem) pt-0 pb-28 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span className={rotulo}>Quem já revende</span>
              <h2 className={tituloH2}>
                O que dizem
                <br />
                os lojistas
              </h2>
            </div>
            <div className="flex flex-wrap gap-6">
              {conteudo.depoimentos.map((d) => (
                <figure key={d.nome + d.loja} className="flex-[1_1_300px] min-w-0 m-0 flex flex-col gap-5 p-7 border-[1.5px] border-text rounded-lg">
                  <span aria-hidden="true" className="font-display font-extrabold text-[64px] leading-[0.6] text-brand">
                    “
                  </span>
                  <blockquote className="m-0 text-[18px] leading-7">{d.texto}</blockquote>
                  <figcaption className="flex flex-col gap-0.5">
                    <b className="font-semibold text-[15px] leading-[22px]">{d.nome}</b>
                    <span className="text-[14px] leading-5 text-text-muted">
                      {d.loja} · {d.cidade}, {d.uf}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {conteudo.materiais.length > 0 && (
          <section id="materiais" className="bg-bg-subtle py-28 px-(--margem) flex flex-wrap gap-y-10 gap-x-18">
            <div className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
              <span className={rotulo}>Materiais para o lojista</span>
              <h2 className={tituloH2}>
                Pronto para
                <br />
                vender
              </h2>
              <p className="m-0 text-[17px] leading-7 text-text-secondary max-w-105">
                Fotos, fichas e catálogo para usar no balcão, no WhatsApp e na sua loja online.
              </p>
            </div>
            <ul className="flex-[2_1_560px] min-w-0 list-none m-0 p-0 border-t-[1.5px] border-t-text">
              {conteudo.materiais.map((m) => (
                <li key={m.url} className="flex flex-wrap items-center gap-y-2 gap-x-6 py-5 px-0 border-b border-b-border">
                  <span className="text-[26px] text-brand">
                    <Icone nome="download" />
                  </span>
                  <span className="flex-[1_1_260px] flex flex-col gap-0.5">
                    <b className="font-semibold text-[17px] leading-[26px]">{m.titulo}</b>
                    {m.descricao && <span className="text-[14px] leading-5 text-text-secondary">{m.descricao}</span>}
                  </span>
                  <span className="font-medium text-[13px] leading-5 text-text-muted">{m.formato}</span>
                  <Botao variante="secundario" href={m.url} aria-label={`Baixar ${m.titulo}`}>
                    Baixar
                  </Botao>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Depois da faixa cinza dos materiais, a seção precisa de respiro em cima; sem ela, o respiro já vem da seção anterior. */}
        <section className={`flex flex-col gap-8 px-(--margem) ${conteudo.materiais.length > 0 ? "py-28" : "pt-0 pb-28"}`}>
          <h2 className={tituloH2}>Dúvidas</h2>
          <div className="border-t-[1.5px] border-t-text">
            {duvidas.map((d) => (
              <details key={d.pergunta} className="border-b border-b-border py-5 px-0">
                <summary className="cursor-pointer font-semibold text-[18px] leading-7">{d.pergunta}</summary>
                <p className="m-0 text-[17px] leading-7 text-text-secondary pt-2 max-w-190">
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
