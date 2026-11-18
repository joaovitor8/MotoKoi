import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { SeletorQueEnvia } from "@/components/SeletorQueEnvia";
import { linkWhatsApp, obterConteudo } from "@/lib/conteudo";
import { contem } from "@/lib/filtro";
import { listarPontosDeVenda } from "@/lib/produtos";
import { Botao, classesBotao } from "@/components/Botao";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { Campo, classesCampo, classesControle, classesRotulo } from "@/components/Campo";
import { rotulo, tituloH1 } from "@/components/estilos";

export const metadata: Metadata = { title: "Onde comprar" };

const TIPOS = { loja_propria: "Loja própria", revendedor: "Revendedor" };
const ABAS = [
  { tipo: undefined, nome: "Todos" },
  { tipo: "loja_propria", nome: "Lojas próprias" },
  { tipo: "revendedor", nome: "Revendedores" },
] as const;
const ESTADOS: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba",
  PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};
const mapa = (endereco: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;

export default function OndeComprar({ searchParams }: PageProps<"/onde-comprar">) {
  return (
    <>
      <Cabecalho atual="/onde-comprar" />
      <main>
        {/* Os filtros vêm da URL, que só existe na hora do acesso; o Suspense deixa o resto da página pronto antes. */}
        <Suspense>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function Conteudo({ searchParams }: Pick<PageProps<"/onde-comprar">, "searchParams">) {
  const [sp, todos, conteudo] = await Promise.all([searchParams, listarPontosDeVenda(), obterConteudo()]);
  const texto = (v: string | string[] | undefined) => [v].flat()[0]?.trim() || undefined;
  // Filtros da URL: ?uf=SP&local=Araçatuba&tipo=revendedor
  const uf = texto(sp.uf)?.toUpperCase();
  const local = texto(sp.local);
  const tipo = ABAS.find((a) => a.tipo === texto(sp.tipo))?.tipo;
  const cep = local?.replace(/\D/g, "");

  const noEstado = todos.filter(
    (p) =>
      (!uf || p.uf === uf) &&
      // "local" é cidade ou CEP: com 5 dígitos ou mais, compara o começo do CEP; senão, o nome da cidade.
      (!local || (cep && cep.length >= 5 ? p.cep?.replace(/\D/g, "").startsWith(cep.slice(0, 5)) : contem(p.cidade, local))),
  );
  const pontos = tipo ? noEstado.filter((p) => p.tipo === tipo) : noEstado;
  const estados = [...new Set(todos.map((p) => p.uf))].sort();
  const endereco = (novoTipo?: string) => {
    const q = new URLSearchParams();
    if (uf) q.set("uf", uf);
    if (local) q.set("local", local);
    if (novoTipo) q.set("tipo", novoTipo);
    return q.size ? `/onde-comprar?${q}` : "/onde-comprar";
  };

  return (
    <>
      <section className="px-(--margem) pt-16 pb-12 flex flex-wrap items-end justify-between gap-y-8 gap-x-16">
        <div className="flex flex-col gap-4">
          <span className={rotulo}>Onde comprar</span>
          <h1 className={tituloH1}>
            Perto
            <br />
            de você
          </h1>
        </div>
        <div className="flex-[1_1_520px] max-w-170 flex flex-wrap gap-3">
          <div className={`${classesCampo} min-w-0 flex-[1_1_180px]`}>
            <span className={classesRotulo} aria-hidden="true">
              Estado
            </span>
            <SeletorQueEnvia
              acao="/onde-comprar"
              nome="uf"
              rotulo="Estado"
              valor={uf ?? ""}
              opcoes={[{ valor: "", texto: "Todos os estados" }, ...estados.map((e) => ({ valor: e, texto: ESTADOS[e] ?? e }))]}
              ocultos={[...(local ? [["local", local] as [string, string]] : []), ...(tipo ? [["tipo", tipo] as [string, string]] : [])]}
              className={`${classesControle} justify-between`}
            />
          </div>
          <form action="/onde-comprar" role="search" className="flex-[2_1_260px] min-w-0 flex">
            {uf && <input type="hidden" name="uf" value={uf} />}
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <Campo rotulo="Cidade ou CEP" className="min-w-0 flex-1">
              <span className={classesControle}>
                <input name="local" type="text" defaultValue={local} placeholder="Ex.: Araçatuba" className="min-w-0" />
              </span>
            </Campo>
          </form>
        </div>
      </section>

      <section className="px-(--margem) pt-0 pb-24 flex flex-wrap items-stretch gap-y-8 gap-x-12">
        <div className="flex-[1_1_380px] min-w-0 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-[1.5px] border-b-text">
            <span className="font-semibold text-[16px] leading-6">
              {pontos.length} {pontos.length === 1 ? "ponto de venda" : "pontos de venda"}
              {uf ? ` em ${uf}` : ""}
            </span>
            <nav aria-label="Tipo de ponto de venda" className="flex gap-1.5">
              {ABAS.map((aba) => {
                const atual = aba.tipo === tipo;
                return (
                  <Link
                    key={aba.nome}
                    href={endereco(aba.tipo)}
                    aria-current={atual ? "true" : undefined}
                    className={`rounded-[999px] border-[1.5px] px-3 py-1.5 [font:600_14px/20px_var(--font-sans)] no-underline ${atual ? "border-text bg-text text-text-inverse" : "border-border-strong bg-bg text-text"}`}
                  >
                    {aba.nome}
                  </Link>
                );
              })}
            </nav>
          </div>
          {pontos.map((p, i) => (
            <article
              key={p.id}
              className={`box-border flex flex-col gap-3 rounded-lg bg-bg p-6 font-sans ${i === 0 ? "border-[1.5px] border-solid border-text" : "border border-border"}`}
            >
              <span className="text-[12px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">{TIPOS[p.tipo]}</span>
              <h2 className="m-0 font-display text-[24px] leading-7 font-bold text-text uppercase">
                {p.nome}
              </h2>
              <span className="flex gap-2 text-[14px] leading-5 text-text-secondary [&_.mk-ico]:text-[20px] [&_.mk-ico]:text-brand">
                <Icone nome="map-pin" />
                <span>
                  {p.endereco} · {p.cidade}, {p.uf}
                </span>
              </span>
              <span className="text-[12px] leading-4 font-medium text-text-muted">{p.horario ?? "[HORÁRIO DE FUNCIONAMENTO]"}</span>
              <div className="flex gap-2 pt-1 *:flex-1">
                <Botao variante="secundario" href={mapa(`${p.endereco}, ${p.cidade}, ${p.uf}`)}>
                  Como chegar
                </Botao>
                {p.whatsapp && (
                  <Botao variante="fantasma" href={linkWhatsApp(p.whatsapp)}>
                    WhatsApp
                  </Botao>
                )}
              </div>
            </article>
          ))}
          {pontos.length === 0 && (
            <p className="m-0 text-[16px] leading-6 text-text-secondary">
              Nenhum ponto de venda com esses filtros. <Link href="/onde-comprar">Ver todos</Link>
            </p>
          )}
        </div>
        <div className="flex-[2_1_560px] min-w-0 min-h-140 bg-bg-subtle rounded-lg flex flex-col items-center justify-center gap-2 text-text-muted text-center p-6 box-border">
          <span className="text-[64px] text-brand">
            <Icone nome="map-pin" />
          </span>
          <span className="text-[13px] leading-[18px] font-medium">[MAPA com os pontos de venda]</span>
        </div>
      </section>

      {/* A faixa vermelha "Peça pelo site da Mac Atacado" das telas de referência saiu por decisão do João (12/11/2026). */}
      <section className="py-24 px-(--margem) flex flex-wrap items-center justify-between gap-y-6 gap-x-16">
        <div className="flex flex-col gap-3 max-w-160">
          <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">
            Não achou um ponto perto?
          </h2>
          <p className="m-0 text-[17px] leading-7 text-text-secondary">
            Fale com a gente. Indicamos a loja mais próxima ou mostramos como comprar online.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkWhatsApp whatsapp={conteudo.whatsapp} className={classesBotao({ variante: "secundario", grande: true })}>
            <Icone nome="message" /> WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
          </LinkWhatsApp>
          <Botao variante="fantasma" grande href="/seja-revendedor">
            Tem loja? Seja revendedor
          </Botao>
        </div>
      </section>
    </>
  );
}
