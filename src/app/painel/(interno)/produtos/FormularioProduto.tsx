"use client";

import { useActionState, useState, type ReactNode } from "react";
import { excluirProduto, salvarProduto, type CamposProduto, type EstadoProduto, type Listas } from "./acoes";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { Marcacao } from "@/components/Marcacao";
import { cartao, entrada, tituloPainel } from "@/app/painel/estilos";

export type ProdutoDoPainel = CamposProduto &
  Listas & { id: number | null; slug: string | null; status: "publicado" | "rascunho"; ultimaAlteracao: string | null };
// "!": vence o all: unset, que no CSS do Tailwind vem depois.
const seletor = "[all:unset] flex-1! min-w-0!";

function Campo({ nome, largura, dica, children }: { nome: string; largura: string; dica?: string; children: ReactNode }) {
  return (
    <label className="min-w-0 flex flex-col gap-1.5" style={{ flex: largura }}>
      <span className="font-semibold text-[14px] leading-4">{nome}</span>
      {children}
      {dica && <span className="text-[12px] leading-4 text-text-muted">{dica}</span>}
    </label>
  );
}

function Remover({ oQue, onClick }: { oQue: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={`Remover ${oQue}`} onClick={onClick} className="[all:unset] cursor-pointer! p-2.5! text-[20px]! leading-5! text-text-muted!">
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
  ficha,
}: {
  produto: ProdutoDoPainel;
  categorias: { id: number; nome: string }[];
  motos: { id: number; nome: string }[];
  fotos: ReactNode;
  ficha: ReactNode; // envio da ficha técnica em PDF; também fica fora do "Salvar"
}) {
  const [estado, enviar, salvando] = useActionState<EstadoProduto, FormData>(salvarProduto, {});
  // Depois de salvar (ou de um erro), os campos voltam com o que foi enviado, não com o que veio do banco.
  const v = estado.valores ?? produto;
  const status = estado.status ?? produto.status;

  // Listas com linhas que entram e saem ficam em estado e viajam como JSON num campo escondido.
  const [especificacoes, setEspecificacoes] = useState(produto.especificacoes);
  const [itens, setItens] = useState(produto.itens);
  const [motos, setMotos] = useState(produto.motos);
  const [codigos, setCodigos] = useState(produto.codigos);
  const nomeDaMoto = (id: number) => todasAsMotos.find((m) => m.id === id)?.nome ?? "Moto";
  const trocar = <T,>(lista: T[], indice: number, mudanca: Partial<T>) => lista.map((item, i) => (i === indice ? { ...item, ...mudanca } : item));
  const semItem = <T,>(lista: T[], indice: number) => lista.filter((_, i) => i !== indice);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
        <div className="flex flex-wrap items-center gap-y-3 gap-x-4">
          <h1 className={tituloPainel}>{produto.id ? v.nome || "Produto" : "Novo produto"}</h1>
          {produto.id &&
            (status === "publicado" ? (
              <Selo tom="sucesso">Publicado</Selo>
            ) : (
              <Selo tom="aviso">Rascunho</Selo>
            ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {produto.slug && status === "publicado" && (
            <Botao variante="fantasma" href={`/catalogo/${produto.slug}`} target="_blank">
              Ver no site
            </Botao>
          )}
          <Botao variante="secundario" type="submit" form="produto" name="status" value="rascunho" disabled={salvando}>
            Salvar rascunho
          </Botao>
          <Botao variante="primario" type="submit" form="produto" name="status" value="publicado" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar e publicar"}
          </Botao>
        </div>
      </div>

      {estado.erro && (
        <p role="alert" className="m-0 font-semibold text-[15px] leading-6 text-text-danger">
          {estado.erro}
        </p>
      )}
      {estado.salvo && (
        <p role="status" className="m-0 font-semibold text-[15px] leading-6 text-text-success">
          {estado.salvo}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <form id="produto" action={enviar} className="flex-[2_1_560px] min-w-0 flex flex-col gap-6">
          {produto.id && <input type="hidden" name="id" value={produto.id} />}
          <input type="hidden" name="listas" value={JSON.stringify({ especificacoes, itens, motos, codigos })} />

          <section className={`${cartao} p-6 flex flex-col gap-5`}>
            <h2>Informações</h2>
            <div className="flex flex-wrap gap-4">
              <Campo nome="Nome do produto" largura="1 1 100%">
                <span className={entrada}>
                  <input name="nome" required maxLength={160} defaultValue={v.nome} />
                </span>
              </Campo>
              <Campo nome="Código" largura="1 1 240px" dica="O código que vai na caixa.">
                <span className={entrada}>
                  <input name="codigo" maxLength={40} defaultValue={v.codigo} />
                </span>
              </Campo>
              <Campo nome="Categoria" largura="1 1 240px">
                <span className={entrada}>
                  {/* key: sem ela o React não reaplica o defaultValue do select quando o formulário volta depois de salvar */}
                  <select key={v.categoria_id} name="categoria_id" required defaultValue={v.categoria_id} className={seletor}>
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
                <span className={entrada}>
                  <input name="resumo" maxLength={120} defaultValue={v.resumo} />
                </span>
              </Campo>
            </div>
            <Campo nome="Descrição" largura="0 0 auto" dica="Aparece na página do produto, ao lado das fotos.">
              <textarea name="descricao" rows={4} maxLength={2000} defaultValue={v.descricao} className="box-border w-full py-2.5 px-3 border-[1.5px] border-border-strong rounded-md bg-bg [font:400_14px/22px_var(--font-sans)] text-text [resize:vertical]" />
            </Campo>
          </section>

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <div className="flex flex-col gap-1">
              <h2>Especificações</h2>
              <span className="text-[14px] leading-5 text-text-muted">Cada linha vira um item da ficha técnica.</span>
            </div>
            {especificacoes.map((e, i) => (
              <div key={i} className="flex flex-wrap gap-3 items-center">
                <span className={`${entrada} flex-[1_1_160px]`}>
                  <input aria-label="Característica" placeholder="Ex.: Coroa" maxLength={60} value={e.rotulo} onChange={(ev) => setEspecificacoes(trocar(especificacoes, i, { rotulo: ev.target.value }))} />
                </span>
                <span className={`${entrada} flex-[2_1_220px]`}>
                  <input aria-label="Valor" placeholder="Ex.: 43 dentes" maxLength={120} value={e.valor} onChange={(ev) => setEspecificacoes(trocar(especificacoes, i, { valor: ev.target.value }))} />
                </span>
                <Remover oQue={e.rotulo || `linha ${i + 1}`} onClick={() => setEspecificacoes(semItem(especificacoes, i))} />
              </div>
            ))}
            <div>
              <Botao variante="secundario" type="button" onClick={() => setEspecificacoes([...especificacoes, { rotulo: "", valor: "" }])}>
                + Adicionar linha
              </Botao>
            </div>
          </section>

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <div className="flex flex-col gap-1">
              <h2>Códigos originais</h2>
              <span className="text-[14px] leading-5 text-text-muted">O código da peça da montadora que esta peça substitui. O lojista busca por ele.</span>
            </div>
            {codigos.map((c, i) => (
              <div key={i} className="flex flex-wrap gap-3 items-center">
                <span className={`${entrada} flex-[1_1_140px]`}>
                  <input aria-label="Fabricante" placeholder="Ex.: Honda" maxLength={40} value={c.fabricante} onChange={(ev) => setCodigos(trocar(codigos, i, { fabricante: ev.target.value }))} />
                </span>
                <span className={`${entrada} flex-[2_1_220px]`}>
                  <input aria-label="Código original" placeholder="Ex.: 40530-KVS-305" maxLength={40} value={c.codigo} onChange={(ev) => setCodigos(trocar(codigos, i, { codigo: ev.target.value }))} />
                </span>
                <Remover oQue={c.codigo || `código ${i + 1}`} onClick={() => setCodigos(semItem(codigos, i))} />
              </div>
            ))}
            <div>
              <Botao variante="secundario" type="button" onClick={() => setCodigos([...codigos, { fabricante: "", codigo: "" }])}>
                + Adicionar código
              </Botao>
            </div>
          </section>

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <div className="flex flex-col gap-1">
              <h2>Na caixa</h2>
              <span className="text-[14px] leading-5 text-text-muted">O que vem na embalagem, com a quantidade de cada item.</span>
            </div>
            {itens.map((item, i) => (
              <div key={i} className="flex flex-wrap gap-3 items-center">
                <span className={`${entrada} flex-[0_0_88px]`}>
                  <input aria-label="Quantidade" type="number" min={1} value={item.quantidade} onChange={(ev) => setItens(trocar(itens, i, { quantidade: Number(ev.target.value) }))} />
                </span>
                <span className={`${entrada} flex-[1_1_240px]`}>
                  <input aria-label="Item" placeholder="Ex.: Coroa de 43 dentes" maxLength={120} value={item.descricao} onChange={(ev) => setItens(trocar(itens, i, { descricao: ev.target.value }))} />
                </span>
                <Remover oQue={item.descricao || `item ${i + 1}`} onClick={() => setItens(semItem(itens, i))} />
              </div>
            ))}
            <div>
              <Botao variante="secundario" type="button" onClick={() => setItens([...itens, { quantidade: 1, descricao: "" }])}>
                + Adicionar item
              </Botao>
            </div>
          </section>

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <div className="flex flex-col gap-1">
              <h2>Motos compatíveis</h2>
              <span className="text-[14px] leading-5 text-text-muted">É por aqui que o cliente acha a peça na busca por moto. Anos e observação são opcionais.</span>
            </div>
            {motos.map((m, i) => (
              <div key={m.moto_id} className="flex flex-wrap gap-3 items-center">
                <span className="flex-[1_1_180px] font-semibold text-[14px] leading-5">{nomeDaMoto(m.moto_id)}</span>
                <span className={`${entrada} flex-[0_0_96px]`}>
                  <input aria-label={`Ano inicial de ${nomeDaMoto(m.moto_id)}`} type="number" placeholder="De" min={1950} max={2100} value={m.ano_inicio ?? ""} onChange={(ev) => setMotos(trocar(motos, i, { ano_inicio: ev.target.value ? Number(ev.target.value) : null }))} />
                </span>
                <span className={`${entrada} flex-[0_0_96px]`}>
                  <input aria-label={`Ano final de ${nomeDaMoto(m.moto_id)}`} type="number" placeholder="Até" min={1950} max={2100} value={m.ano_fim ?? ""} onChange={(ev) => setMotos(trocar(motos, i, { ano_fim: ev.target.value ? Number(ev.target.value) : null }))} />
                </span>
                <span className={`${entrada} flex-[2_1_200px]`}>
                  <input aria-label={`Observação de ${nomeDaMoto(m.moto_id)}`} placeholder="Observação" maxLength={200} value={m.observacao} onChange={(ev) => setMotos(trocar(motos, i, { observacao: ev.target.value }))} />
                </span>
                <Remover oQue={nomeDaMoto(m.moto_id)} onClick={() => setMotos(semItem(motos, i))} />
              </div>
            ))}
            <span className={`${entrada} max-w-105`}>
              {/* value fixo em "": depois de escolher, o seletor volta para "Adicionar moto…" */}
              <select
                aria-label="Adicionar moto"
                value=""
                onChange={(ev) => setMotos([...motos, { moto_id: Number(ev.target.value), ano_inicio: null, ano_fim: null, observacao: "" }])}
                className={seletor}
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

        <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-6">
          {fotos}

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <h2>Garantia e certificação</h2>
            <Campo nome="Garantia (meses)" largura="0 0 auto" dica="Deixe vazio para usar o prazo padrão da marca.">
              <span className={entrada}>
                <input name="garantia_meses" form="produto" inputMode="numeric" maxLength={3} defaultValue={v.garantia_meses} />
              </span>
            </Campo>
            <Campo nome="Registro Inmetro" largura="0 0 auto" dica="Só para peças certificadas. Aparece como selo na página do produto.">
              <span className={entrada}>
                <input name="inmetro_registro" form="produto" maxLength={60} placeholder="Ex.: 001234/2026" defaultValue={v.inmetro_registro} />
              </span>
            </Campo>
            {ficha}
          </section>

          <section className={`${cartao} p-6 flex flex-col gap-4`}>
            <h2>Publicação</h2>
            <span className="text-[14px] leading-5">
              {!produto.id
                ? "Ainda não salvo."
                : status === "publicado"
                  ? "Publicado: aparece no site."
                  : "Rascunho: não aparece no site."}{" "}
              Use os botões do topo para salvar como rascunho ou publicar.
            </span>
            <Marcacao name="novidade" form="produto" defaultChecked={v.novidade}>
              Mostrar em Novidades na Home
            </Marcacao>
            {produto.ultimaAlteracao && <span className="text-[13px] leading-5 text-text-muted">{produto.ultimaAlteracao}</span>}
          </section>

          {produto.id && (
            <section className={`${cartao} p-6 flex flex-col gap-3`}>
              <h2>Excluir produto</h2>
              <span className="text-[14px] leading-5 text-text-secondary">O produto sai do site e do painel. Não dá para desfazer.</span>
              <form
                action={excluirProduto.bind(null, produto.id)}
                onSubmit={(ev) => {
                  if (!window.confirm(`Excluir “${produto.nome}”? Não dá para desfazer.`)) ev.preventDefault();
                }}
              >
                <Botao variante="perigo" type="submit">
                  Excluir produto
                </Botao>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
