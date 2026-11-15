"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { excluirProduto, salvarProduto, type CamposProduto, type EstadoProduto, type Listas } from "./acoes";

export type ProdutoDoPainel = CamposProduto &
  Listas & { id: number | null; slug: string | null; status: "publicado" | "rascunho"; ultimaAlteracao: string | null };

const rotulo = { fontWeight: 600, fontSize: 14, lineHeight: "16px" } as const;
const ajuda = { fontSize: 12, lineHeight: "16px", color: "var(--text-muted)" } as const;
const subtitulo = { fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" } as const;
const cartao = { padding: 24, display: "flex", flexDirection: "column", gap: 16 } as const;
const linha = { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } as const;
const seletor = { all: "unset", flex: 1, minWidth: 0 } as const;
const areaDeTexto = {
  boxSizing: "border-box",
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 4,
  background: "var(--bg)",
  font: "400 14px/22px var(--font-sans)",
  color: "var(--text)",
  resize: "vertical",
} as const;

function Campo({ nome, largura, dica, children }: { nome: string; largura: string; dica?: string; children: ReactNode }) {
  return (
    <label style={{ flex: largura, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={rotulo}>{nome}</span>
      {children}
      {dica && <span style={ajuda}>{dica}</span>}
    </label>
  );
}

function Remover({ oQue, onClick }: { oQue: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={`Remover ${oQue}`} onClick={onClick} style={{ all: "unset", cursor: "pointer", fontSize: 20, lineHeight: "20px", padding: 10, color: "var(--text-muted)" }}>
      ×
    </button>
  );
}

// `fotos` é o cartão de fotos, montado pela página. Fica fora do <form> de propósito: foto não vai junto no "Salvar".
export function FormularioProduto({
  produto,
  categorias,
  motos: todasAsMotos,
  fotos,
}: {
  produto: ProdutoDoPainel;
  categorias: { id: number; nome: string }[];
  motos: { id: number; nome: string }[];
  fotos: ReactNode;
}) {
  const [estado, enviar, salvando] = useActionState<EstadoProduto, FormData>(salvarProduto, {});
  // Depois de salvar (ou de um erro), os campos voltam com o que foi enviado, não com o que veio do banco.
  const v = estado.valores ?? produto;
  const status = estado.status ?? produto.status;

  // Listas com linhas que entram e saem ficam em estado e viajam como JSON num campo escondido.
  const [especificacoes, setEspecificacoes] = useState(produto.especificacoes);
  const [itens, setItens] = useState(produto.itens);
  const [motos, setMotos] = useState(produto.motos);
  const nomeDaMoto = (id: number) => todasAsMotos.find((m) => m.id === id)?.nome ?? "Moto";
  const trocar = <T,>(lista: T[], indice: number, mudanca: Partial<T>) => lista.map((item, i) => (i === indice ? { ...item, ...mudanca } : item));
  const semItem = <T,>(lista: T[], indice: number) => lista.filter((_, i) => i !== indice);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 16px" }}>
          <h1 className="ad-h1">{produto.id ? v.nome || "Produto" : "Novo produto"}</h1>
          {produto.id &&
            (status === "publicado" ? (
              <span className="mk-badge mk-badge--success">Publicado</span>
            ) : (
              <span className="mk-badge mk-badge--warning">Rascunho</span>
            ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {produto.slug && status === "publicado" && (
            <Link className="mk-btn mk-btn--ghost" href={`/catalogo/${produto.slug}`} target="_blank">
              Ver no site
            </Link>
          )}
          <button type="submit" form="produto" name="status" value="rascunho" disabled={salvando} className="mk-btn mk-btn--secondary">
            Salvar rascunho
          </button>
          <button type="submit" form="produto" name="status" value="publicado" disabled={salvando} className="mk-btn mk-btn--primary">
            {salvando ? "Salvando…" : "Salvar e publicar"}
          </button>
        </div>
      </div>

      {estado.erro && (
        <p role="alert" style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: "24px", color: "var(--text-danger)" }}>
          {estado.erro}
        </p>
      )}
      {estado.salvo && (
        <p role="status" style={{ margin: 0, fontWeight: 600, fontSize: 15, lineHeight: "24px", color: "var(--text-success)" }}>
          {estado.salvo}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
        <form id="produto" action={enviar} style={{ flex: "2 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          {produto.id && <input type="hidden" name="id" value={produto.id} />}
          <input type="hidden" name="listas" value={JSON.stringify({ especificacoes, itens, motos })} />

          <section className="ad-card" style={{ ...cartao, gap: 20 }}>
            <h2>Informações</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <Campo nome="Nome do produto" largura="1 1 100%">
                <span className="ad-in">
                  <input name="nome" required maxLength={160} defaultValue={v.nome} />
                </span>
              </Campo>
              <Campo nome="Código" largura="1 1 240px" dica="O código que vai na caixa.">
                <span className="ad-in">
                  <input name="codigo" maxLength={40} defaultValue={v.codigo} />
                </span>
              </Campo>
              <Campo nome="Categoria" largura="1 1 240px">
                <span className="ad-in">
                  {/* key: sem ela o React não reaplica o defaultValue do select quando o formulário volta depois de salvar */}
                  <select key={v.categoria_id} name="categoria_id" required defaultValue={v.categoria_id} style={seletor}>
                    <option value="">Escolha…</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </span>
              </Campo>
              <Campo nome="Resumo" largura="1 1 100%" dica="Linha curta que aparece no cartão do catálogo, abaixo do nome. Ex.: 43 × 16 · 428H · 118 elos.">
                <span className="ad-in">
                  <input name="resumo" maxLength={120} defaultValue={v.resumo} />
                </span>
              </Campo>
            </div>
            <Campo nome="Descrição" largura="0 0 auto" dica="Aparece na página do produto, ao lado das fotos.">
              <textarea name="descricao" rows={4} maxLength={2000} defaultValue={v.descricao} style={areaDeTexto} />
            </Campo>
          </section>

          <section className="ad-card" style={cartao}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2>Especificações</h2>
              <span style={subtitulo}>Cada linha vira um item da ficha técnica.</span>
            </div>
            {especificacoes.map((e, i) => (
              <div key={i} style={linha}>
                <span className="ad-in" style={{ flex: "1 1 160px" }}>
                  <input aria-label="Característica" placeholder="Ex.: Coroa" maxLength={60} value={e.rotulo} onChange={(ev) => setEspecificacoes(trocar(especificacoes, i, { rotulo: ev.target.value }))} />
                </span>
                <span className="ad-in" style={{ flex: "2 1 220px" }}>
                  <input aria-label="Valor" placeholder="Ex.: 43 dentes" maxLength={120} value={e.valor} onChange={(ev) => setEspecificacoes(trocar(especificacoes, i, { valor: ev.target.value }))} />
                </span>
                <Remover oQue={e.rotulo || `linha ${i + 1}`} onClick={() => setEspecificacoes(semItem(especificacoes, i))} />
              </div>
            ))}
            <div>
              <button type="button" className="mk-btn mk-btn--secondary" onClick={() => setEspecificacoes([...especificacoes, { rotulo: "", valor: "" }])}>
                + Adicionar linha
              </button>
            </div>
          </section>

          <section className="ad-card" style={cartao}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2>Na caixa</h2>
              <span style={subtitulo}>O que vem na embalagem, com a quantidade de cada item.</span>
            </div>
            {itens.map((item, i) => (
              <div key={i} style={linha}>
                <span className="ad-in" style={{ flex: "0 0 88px" }}>
                  <input aria-label="Quantidade" type="number" min={1} value={item.quantidade} onChange={(ev) => setItens(trocar(itens, i, { quantidade: Number(ev.target.value) }))} />
                </span>
                <span className="ad-in" style={{ flex: "1 1 240px" }}>
                  <input aria-label="Item" placeholder="Ex.: Coroa de 43 dentes" maxLength={120} value={item.descricao} onChange={(ev) => setItens(trocar(itens, i, { descricao: ev.target.value }))} />
                </span>
                <Remover oQue={item.descricao || `item ${i + 1}`} onClick={() => setItens(semItem(itens, i))} />
              </div>
            ))}
            <div>
              <button type="button" className="mk-btn mk-btn--secondary" onClick={() => setItens([...itens, { quantidade: 1, descricao: "" }])}>
                + Adicionar item
              </button>
            </div>
          </section>

          <section className="ad-card" style={cartao}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <h2>Motos compatíveis</h2>
              <span style={subtitulo}>É por aqui que o cliente acha a peça na busca por moto. Anos e observação são opcionais.</span>
            </div>
            {motos.map((m, i) => (
              <div key={m.moto_id} style={linha}>
                <span style={{ flex: "1 1 180px", fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>{nomeDaMoto(m.moto_id)}</span>
                <span className="ad-in" style={{ flex: "0 0 96px" }}>
                  <input aria-label={`Ano inicial de ${nomeDaMoto(m.moto_id)}`} type="number" placeholder="De" min={1950} max={2100} value={m.ano_inicio ?? ""} onChange={(ev) => setMotos(trocar(motos, i, { ano_inicio: ev.target.value ? Number(ev.target.value) : null }))} />
                </span>
                <span className="ad-in" style={{ flex: "0 0 96px" }}>
                  <input aria-label={`Ano final de ${nomeDaMoto(m.moto_id)}`} type="number" placeholder="Até" min={1950} max={2100} value={m.ano_fim ?? ""} onChange={(ev) => setMotos(trocar(motos, i, { ano_fim: ev.target.value ? Number(ev.target.value) : null }))} />
                </span>
                <span className="ad-in" style={{ flex: "2 1 200px" }}>
                  <input aria-label={`Observação de ${nomeDaMoto(m.moto_id)}`} placeholder="Observação" maxLength={200} value={m.observacao} onChange={(ev) => setMotos(trocar(motos, i, { observacao: ev.target.value }))} />
                </span>
                <Remover oQue={nomeDaMoto(m.moto_id)} onClick={() => setMotos(semItem(motos, i))} />
              </div>
            ))}
            <span className="ad-in" style={{ maxWidth: 420 }}>
              {/* value fixo em "": depois de escolher, o seletor volta para "Adicionar moto…" */}
              <select
                aria-label="Adicionar moto"
                value=""
                onChange={(ev) => setMotos([...motos, { moto_id: Number(ev.target.value), ano_inicio: null, ano_fim: null, observacao: "" }])}
                style={seletor}
              >
                <option value="">Adicionar moto…</option>
                {todasAsMotos
                  .filter((moto) => !motos.some((m) => m.moto_id === moto.id))
                  .map((moto) => (
                    <option key={moto.id} value={moto.id}>
                      {moto.nome}
                    </option>
                  ))}
              </select>
            </span>
          </section>
        </form>

        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          {fotos}

          <section className="ad-card" style={cartao}>
            <h2>Publicação</h2>
            <span style={{ fontSize: 14, lineHeight: "20px" }}>
              {!produto.id
                ? "Ainda não salvo."
                : status === "publicado"
                  ? "Publicado: aparece no site."
                  : "Rascunho: não aparece no site."}{" "}
              Use os botões do topo para salvar como rascunho ou publicar.
            </span>
            <label className="mk-check">
              <input type="checkbox" name="novidade" form="produto" defaultChecked={v.novidade} />
              <span className="mk-check__box">
                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              Mostrar em Novidades na Home
            </label>
            {produto.ultimaAlteracao && <span style={{ fontSize: 13, lineHeight: "20px", color: "var(--text-muted)" }}>{produto.ultimaAlteracao}</span>}
          </section>

          {produto.id && (
            <section className="ad-card" style={{ ...cartao, gap: 12 }}>
              <h2>Excluir produto</h2>
              <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>O produto sai do site e do painel. Não dá para desfazer.</span>
              <form
                action={excluirProduto.bind(null, produto.id)}
                onSubmit={(ev) => {
                  if (!window.confirm(`Excluir “${produto.nome}”? Não dá para desfazer.`)) ev.preventDefault();
                }}
              >
                <button type="submit" className="mk-btn mk-btn--secondary" style={{ color: "var(--text-danger)", borderColor: "var(--border-danger)" }}>
                  Excluir produto
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
