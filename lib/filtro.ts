import type { Produto } from "./produtos";

// Compara sem diferenciar maiúsculas nem acentos: "transmissao" acha "Transmissão".
const limpo = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export const contem = (texto: string, trecho: string) => limpo(texto).includes(limpo(trecho));

export type Filtros = { categoria?: string; motos: string[]; ano?: number; busca?: string };

// `categoria` e `motos` são slugs. `ano` mostra só o que serve naquele ano (ano vazio na peça = serve em qualquer ano).
// `busca` é texto livre: nome, código MotoKoi, código original (com ou sem traço), categoria ou moto.
// Mesma regra da função buscar_produtos do banco (docs/banco.md).
export function filtrarProdutos(produtos: Produto[], { categoria, motos, ano, busca }: Filtros) {
  const codigo = busca?.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return produtos.filter(
    (p) =>
      (!categoria || p.categoria.slug === categoria) &&
      ((!motos.length && !ano) ||
        p.motos.some(
          (m) =>
            (!motos.length || motos.includes(m.slug)) &&
            (!ano || ((m.anoInicio ?? ano) <= ano && (m.anoFim ?? ano) >= ano)),
        )) &&
      (!busca ||
        contem(`${p.nome} ${p.codigo ?? ""} ${p.categoria.nome} ${p.motos.map((m) => `${m.nome} ${m.modelo}`).join(" ")}`, busca) ||
        (!!codigo && p.codigosOriginais.some((c) => c.busca.startsWith(codigo)))),
  );
}
