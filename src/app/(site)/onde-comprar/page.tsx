import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { SeletorQueEnvia } from "@/components/SeletorQueEnvia";
import { linkWhatsApp, obterConteudo } from "@/lib/conteudo";
import { contem } from "@/lib/filtro";
import { listarPontosDeVenda } from "@/lib/produtos";

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
      <section
        style={{
          padding: "64px var(--margem) 48px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "32px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span className="st-rotulo">Onde comprar</span>
          <h1 className="st-h1">
            Perto
            <br />
            de você
          </h1>
        </div>
        <div style={{ flex: "1 1 520px", maxWidth: 680, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div className="mk-field" style={{ width: "auto", flex: "1 1 180px", minWidth: 0 }}>
            <span className="mk-field__label" aria-hidden="true">
              Estado
            </span>
            <SeletorQueEnvia
              acao="/onde-comprar"
              nome="uf"
              rotulo="Estado"
              valor={uf ?? ""}
              opcoes={[{ valor: "", texto: "Todos os estados" }, ...estados.map((e) => ({ valor: e, texto: ESTADOS[e] ?? e }))]}
              ocultos={[...(local ? [["local", local] as [string, string]] : []), ...(tipo ? [["tipo", tipo] as [string, string]] : [])]}
              className="mk-field__control"
              style={{ justifyContent: "space-between" }}
            />
          </div>
          <form action="/onde-comprar" role="search" style={{ flex: "2 1 260px", minWidth: 0, display: "flex" }}>
            {uf && <input type="hidden" name="uf" value={uf} />}
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <label className="mk-field" style={{ width: "auto", flex: 1, minWidth: 0 }}>
              <span className="mk-field__label">Cidade ou CEP</span>
              <span className="mk-field__control">
                <input name="local" type="text" defaultValue={local} placeholder="Ex.: Araçatuba" style={{ minWidth: 0 }} />
              </span>
            </label>
          </form>
        </div>
      </section>

      <section style={{ padding: "0 var(--margem) 96px", display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "32px 48px" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1.5px solid var(--text)",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 16, lineHeight: "24px" }}>
              {pontos.length} {pontos.length === 1 ? "ponto de venda" : "pontos de venda"}
              {uf ? ` em ${uf}` : ""}
            </span>
            <nav aria-label="Tipo de ponto de venda" style={{ display: "flex", gap: 6 }}>
              {ABAS.map((aba) => {
                const atual = aba.tipo === tipo;
                return (
                  <Link
                    key={aba.nome}
                    href={endereco(aba.tipo)}
                    aria-current={atual ? "true" : undefined}
                    style={{
                      font: "600 14px/20px var(--font-sans)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      textDecoration: "none",
                      border: `1.5px solid ${atual ? "var(--text)" : "var(--border-strong)"}`,
                      background: atual ? "var(--text)" : "var(--bg)",
                      color: atual ? "var(--text-inverse)" : "var(--text)",
                    }}
                  >
                    {aba.nome}
                  </Link>
                );
              })}
            </nav>
          </div>
          {pontos.map((p, i) => (
            <article key={p.id} className="mk-store" style={{ width: "auto", border: i === 0 ? "1.5px solid var(--text)" : undefined }}>
              <span className="mk-store__type">{TIPOS[p.tipo]}</span>
              <h2 className="mk-store__name" style={{ textTransform: "uppercase", fontWeight: 700 }}>
                {p.nome}
              </h2>
              <span className="mk-store__addr">
                <Icone nome="map-pin" />
                <span>
                  {p.endereco} · {p.cidade}, {p.uf}
                </span>
              </span>
              <span className="mk-store__hours">{p.horario ?? "[HORÁRIO DE FUNCIONAMENTO]"}</span>
              <div className="mk-store__actions">
                <a className="mk-btn mk-btn--secondary" href={mapa(`${p.endereco}, ${p.cidade}, ${p.uf}`)}>
                  Como chegar
                </a>
                {p.whatsapp && (
                  <a className="mk-btn mk-btn--ghost" href={linkWhatsApp(p.whatsapp)}>
                    WhatsApp
                  </a>
                )}
              </div>
            </article>
          ))}
          {pontos.length === 0 && (
            <p style={{ margin: 0, fontSize: 16, lineHeight: "24px", color: "var(--text-secondary)" }}>
              Nenhum ponto de venda com esses filtros. <Link href="/onde-comprar">Ver todos</Link>
            </p>
          )}
        </div>
        <div
          style={{
            flex: "2 1 560px",
            minWidth: 0,
            minHeight: 560,
            background: "var(--bg-subtle)",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "var(--text-muted)",
            textAlign: "center",
            padding: 24,
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: 64, color: "var(--brand)" }}>
            <Icone nome="map-pin" />
          </span>
          <span style={{ fontSize: 13, lineHeight: "18px", fontWeight: 500 }}>[MAPA com os pontos de venda]</span>
        </div>
      </section>

      {/* A faixa vermelha "Peça pelo site da Mac Atacado" das telas de referência saiu por decisão do João (12/11/2026). */}
      <section
        style={{
          padding: "96px var(--margem)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" }}>
            Não achou um ponto perto?
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" }}>
            Fale com a gente. Indicamos a loja mais próxima ou mostramos como comprar online.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a className="mk-btn mk-btn--secondary mk-btn--lg" href={conteudo.whatsapp?.link ?? "#"}>
            <Icone nome="message" /> WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
          </a>
          <Link className="mk-btn mk-btn--ghost mk-btn--lg" href="/seja-revendedor">
            Tem loja? Seja revendedor
          </Link>
        </div>
      </section>
    </>
  );
}
