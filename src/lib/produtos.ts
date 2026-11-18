import { cacheLife, cacheTag } from "next/cache";
import { urlDaFoto, urlDoMaterial } from "./fotos";
import { supabase } from "./supabase";

export type Categoria = { slug: string; nome: string; resumo: string | null; total: number };
// nome = "Titan 150" (filtros); fabricante e modelo = "Honda" e "CG 150 Titan" (busca da Home)
export type Moto = { slug: string; nome: string; fabricante: string; modelo: string };
export type Produto = {
  slug: string;
  nome: string;
  resumo: string | null;
  codigo: string | null;
  descricao: string | null;
  novidade: boolean;
  categoria: { slug: string; nome: string };
  especificacoes: { rotulo: string; valor: string }[];
  itensCaixa: { quantidade: number; descricao: string }[];
  // nome = "Titan 150" (filtros e cartões); modelo = "Honda CG 150 Titan" (tabela "Serve em")
  motos: { slug: string; nome: string; modelo: string; anos: string | null; anoInicio: number | null; anoFim: number | null; observacao: string | null }[];
  // Código da montadora que a peça substitui. `busca` é o código só com letras e números.
  codigosOriginais: { fabricante: string; codigo: string; busca: string }[];
  garantiaMeses: number | null; // vazio = vale a garantia padrão da marca
  inmetro: string | null;
  fichaTecnica: string | null; // URL do PDF
  // Em ordem; a primeira é a capa. Vazio enquanto o painel não enviar fotos.
  fotos: { url: string; alt: string }[];
};

// Erro do banco vira exceção: melhor a página de erro do que um catálogo vazio sem explicação.
async function consultar<T>(consulta: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await consulta;
  if (error || !data) throw new Error(`Supabase: ${error?.message ?? "consulta sem dados"}`);
  return data;
}

// Todas as leituras ficam em cache com a etiqueta "catalogo". Hoje o cache se renova sozinho em cerca de 1 minuto;
// quando o painel existir, salvar um produto chama updateTag("catalogo") e a mudança aparece na hora.
function cacheDoCatalogo() {
  cacheLife("minutes");
  cacheTag("catalogo");
}

export async function listarCategorias(): Promise<Categoria[]> {
  "use cache";
  cacheDoCatalogo();
  const linhas = await consultar(
    supabase.from("categorias_com_contagem").select("slug, nome, resumo, total_publicados").order("ordem"),
  );
  return linhas.map((c) => ({ slug: c.slug, nome: c.nome, resumo: c.resumo, total: c.total_publicados }));
}

export async function listarMotos(): Promise<Moto[]> {
  "use cache";
  cacheDoCatalogo();
  const linhas = await consultar(supabase.from("motos").select("slug, nome_curto, fabricante, modelo").order("ordem"));
  return linhas.map((m) => ({ slug: m.slug, nome: m.nome_curto, fabricante: m.fabricante, modelo: m.modelo }));
}

export type PontoDeVenda = {
  id: number;
  tipo: "loja_propria" | "revendedor";
  nome: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string | null;
  horario: string | null;
  whatsapp: string | null;
};

// Lojas próprias e revendedores da página "Onde comprar", cadastrados em Lojas no painel.
export async function listarPontosDeVenda(): Promise<PontoDeVenda[]> {
  "use cache";
  cacheDoCatalogo();
  return consultar(
    supabase.from("pontos_venda").select("id, tipo, nome, endereco, cidade, uf, cep, horario, whatsapp").eq("ativo", true).order("ordem").order("id"),
  ) as Promise<PontoDeVenda[]>;
}

const anos = (inicio: number | null, fim: number | null) =>
  inicio && fim ? `${inicio} a ${fim}` : inicio ? `a partir de ${inicio}` : fim ? `até ${fim}` : null;
const porOrdem = (a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem;

// shortcut: traz todos os produtos publicados de uma vez e filtra em memória; serve bem para algumas centenas
// de peças. Se o catálogo passar disso, levar filtro e paginação para a consulta (ver docs/banco.md).
export async function listarProdutos(): Promise<Produto[]> {
  "use cache";
  cacheDoCatalogo();
  /* eslint-disable @typescript-eslint/no-explicit-any -- o cliente sem tipos gerados devolve any; o formato é fixado no retorno */
  const linhas: any[] = await consultar(
    supabase
      .from("produtos")
      .select(
        `slug, nome, resumo, codigo, descricao, novidade, garantia_meses, inmetro_registro, ficha_tecnica_caminho,
         codigos:produto_codigos_originais(fabricante, codigo, codigo_busca),
         categoria:categorias(slug, nome),
         especificacoes:produto_especificacoes(rotulo, valor, ordem),
         itens:produto_itens_caixa(quantidade, descricao, ordem),
         fotos:produto_fotos(caminho, texto_alternativo, ordem),
         compatibilidade:produto_motos(ano_inicio, ano_fim, observacao, moto:motos(slug, nome_curto, fabricante, modelo, ordem))`,
      )
      .eq("status", "publicado")
      .order("atualizado_em", { ascending: false })
      .order("id"),
  );
  return linhas.map((p) => ({
    slug: p.slug,
    nome: p.nome,
    resumo: p.resumo,
    codigo: p.codigo,
    descricao: p.descricao,
    novidade: p.novidade,
    categoria: p.categoria,
    especificacoes: [...p.especificacoes].sort(porOrdem).map((e: any) => ({ rotulo: e.rotulo, valor: e.valor })),
    itensCaixa: [...p.itens].sort(porOrdem).map((i: any) => ({ quantidade: i.quantidade, descricao: i.descricao })),
    motos: [...p.compatibilidade]
      .sort((a: any, b: any) => porOrdem(a.moto, b.moto))
      .map((c: any) => ({
        slug: c.moto.slug,
        nome: c.moto.nome_curto,
        modelo: `${c.moto.fabricante} ${c.moto.modelo}`,
        anos: anos(c.ano_inicio, c.ano_fim),
        anoInicio: c.ano_inicio,
        anoFim: c.ano_fim,
        observacao: c.observacao,
      })),
    codigosOriginais: p.codigos.map((c: any) => ({ fabricante: c.fabricante, codigo: c.codigo, busca: c.codigo_busca })),
    garantiaMeses: p.garantia_meses,
    inmetro: p.inmetro_registro,
    fichaTecnica: p.ficha_tecnica_caminho ? urlDoMaterial(p.ficha_tecnica_caminho) : null,
    fotos: [...p.fotos].sort(porOrdem).map((f: any) => ({ url: urlDaFoto(f.caminho), alt: f.texto_alternativo ?? p.nome })),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

export { contem, filtrarProdutos } from "./filtro";
