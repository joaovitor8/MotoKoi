import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icone } from "@/components/Icone";
import { urlDaFoto } from "@/lib/fotos";
import { dataBR, equipe } from "@/lib/painel";
import { contem } from "@/lib/produtos";
import { FiltrosProdutos } from "./FiltrosProdutos";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { cartao, miniatura, tabela, tituloPainel } from "@/app/painel/estilos";

export const metadata: Metadata = { title: "Produtos" };

const POR_PAGINA = 8;

type Linha = {
  id: number;
  nome: string;
  codigo: string | null;
  status: "publicado" | "rascunho";
  atualizado_em: string;
  categoria: { nome: string; slug: string };
  motos: { moto: { nome_curto: string; ordem: number } }[];
  fotos: { caminho: string; ordem: number }[];
};

export default async function ProdutosDoPainel({ searchParams }: PageProps<"/painel/produtos">) {
  const [{ supabase }, sp] = await Promise.all([equipe(), searchParams]);
  const [produtos, categorias] = await Promise.all([
    // A equipe enxerga publicados e rascunhos; quem decide isso é o RLS, não esta consulta.
    supabase
      .from("produtos")
      .select("id, nome, codigo, status, atualizado_em, categoria:categorias(nome, slug), motos:produto_motos(moto:motos(nome_curto, ordem)), fotos:produto_fotos(caminho, ordem)")
      .order("atualizado_em", { ascending: false })
      .order("id"),
    supabase.from("categorias").select("slug, nome").order("ordem"),
  ]);
  if (produtos.error || categorias.error) throw new Error(`Supabase: ${(produtos.error ?? categorias.error)?.message}`);
  const todos = produtos.data as unknown as Linha[];

  const texto = (v: string | string[] | undefined) => [v].flat()[0]?.trim() || undefined;
  const filtros = { busca: texto(sp.busca), categoria: texto(sp.categoria), status: texto(sp.status) };
  // shortcut: filtra e pagina em memória, como o catálogo do site; levar para a consulta se passar de algumas centenas de peças.
  const filtrados = todos.filter(
    (p) =>
      (!filtros.categoria || p.categoria.slug === filtros.categoria) &&
      (!filtros.status || p.status === filtros.status) &&
      (!filtros.busca || contem(`${p.nome} ${p.codigo ?? ""}`, filtros.busca)),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, Number(texto(sp.pagina)) || 1));
  const inicio = (pagina - 1) * POR_PAGINA;
  const naPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  const endereco = (n: number) => {
    const q = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => valor && q.set(chave, valor));
    if (n > 1) q.set("pagina", String(n));
    return q.size ? `/painel/produtos?${q}` : "/painel/produtos";
  };
  const publicados = todos.filter((p) => p.status === "publicado").length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
        <div className="flex flex-col gap-1">
          <h1 className={tituloPainel}>Produtos</h1>
          <span className="text-[14px] leading-5 text-text-muted">
            {todos.length} produtos · {publicados} publicados · {todos.length - publicados} rascunhos
          </span>
        </div>
        <Botao variante="primario" href="/painel/produtos/novo">
          + Novo produto
        </Botao>
      </div>

      <FiltrosProdutos categorias={categorias.data} {...filtros} />

      <div className={`${cartao} overflow-x-auto`}>
        <table className={tabela}>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th>Código</th>
              <th>Categoria</th>
              <th>Motos</th>
              <th>Status</th>
              <th>Atualizado</th>
              <th>
                <span className="absolute -left-[9999px]">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {naPagina.map((p) => {
              const capa = [...p.fotos].sort((a, b) => a.ordem - b.ordem)[0];
              const motos = [...p.motos].sort((a, b) => a.moto.ordem - b.moto.ordem).map((m) => m.moto.nome_curto);
              return (
                <tr key={p.id}>
                  <td>
                    <span className={`${miniatura} relative overflow-hidden`}>
                      {capa ? <Image src={urlDaFoto(capa.caminho)} alt="" fill sizes="48px" className="object-contain" /> : <Icone nome="package" />}
                    </span>
                  </td>
                  <td>
                    <Link href={`/painel/produtos/${p.id}`} className="font-semibold text-text no-underline">
                      {p.nome}
                    </Link>
                  </td>
                  <td className="text-text-secondary whitespace-nowrap">{p.codigo ?? "—"}</td>
                  <td>{p.categoria.nome}</td>
                  <td className="text-text-secondary">
                    {motos.length ? `${motos[0]}${motos.length > 1 ? ` +${motos.length - 1}` : ""}` : "Uso geral"}
                  </td>
                  <td>
                    {p.status === "publicado" ? (
                      <Selo tom="sucesso">Publicado</Selo>
                    ) : (
                      <Selo tom="aviso">Rascunho</Selo>
                    )}
                  </td>
                  <td className="text-text-secondary whitespace-nowrap">{dataBR(p.atualizado_em)}</td>
                  <td className="text-right">
                    <Link href={`/painel/produtos/${p.id}`} className="font-semibold">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {naPagina.length === 0 && (
              <tr>
                <td colSpan={8} className="text-text-secondary">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14px] leading-5 text-text-muted">
          {filtrados.length ? `Mostrando ${inicio + 1} a ${inicio + naPagina.length} de ${filtrados.length}` : "Nada para mostrar"}
        </span>
        <div className="flex gap-2">
          {pagina > 1 ? (
            <Botao variante="secundario" href={endereco(pagina - 1)}>
              Anterior
            </Botao>
          ) : (
            <Botao variante="secundario" apagado>
              Anterior
            </Botao>
          )}
          {pagina < paginas ? (
            <Botao variante="secundario" href={endereco(pagina + 1)}>
              Próxima
            </Botao>
          ) : (
            <Botao variante="secundario" apagado>
              Próxima
            </Botao>
          )}
        </div>
      </div>
    </>
  );
}
