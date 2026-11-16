// Categorias, Motos e Lojas têm a mesma tela (tabela + formulário). O que muda entre elas está descrito aqui:
// a tabela do banco, os campos do formulário e as colunas da lista. Sem funções, para o navegador poder ler.

export type Campo = {
  nome: string; // nome da coluna no banco
  rotulo: string;
  tipo: "texto" | "numero" | "selecao" | "marcacao" | "data";
  obrigatorio?: boolean;
  max?: number;
  dica?: string;
  opcoes?: Record<string, string>; // só para "selecao": valor no banco -> texto na tela
  maiusculas?: boolean; // grava em maiúsculas (UF)
  padrao?: string | boolean; // valor inicial ao criar
};

export type Cadastro = {
  tabela: string;
  titulo: string;
  um: string; // "categoria", "moto", "loja": usado em "Nova categoria", "Excluir moto"...
  feminino: boolean;
  campos: Campo[];
  colunas: string[]; // campos que aparecem na lista
  slugDe?: string[]; // campos que formam o slug (pedaço da URL), gerado só ao criar
  erroDeRegra?: string; // mensagem quando o banco recusa por uma regra (check) da tabela
  voltarPara?: string; // de onde a tela é aberta, quando não está no menu
};

const ordem: Campo = { nome: "ordem", rotulo: "Ordem", tipo: "numero", padrao: "0", dica: "Número menor aparece primeiro." };

export const CADASTROS = {
  categorias: {
    tabela: "categorias",
    titulo: "Categorias",
    um: "categoria",
    feminino: true,
    campos: [
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true, max: 80 },
      { nome: "resumo", rotulo: "Resumo", tipo: "texto", max: 120, dica: "Linha curta que aparece na lista “A linha” da Home." },
      ordem,
    ],
    colunas: ["nome", "resumo", "ordem"],
    slugDe: ["nome"],
  },
  motos: {
    tabela: "motos",
    titulo: "Motos",
    um: "moto",
    feminino: true,
    campos: [
      { nome: "fabricante", rotulo: "Fabricante", tipo: "texto", obrigatorio: true, max: 60, dica: "Ex.: Honda" },
      { nome: "modelo", rotulo: "Modelo", tipo: "texto", obrigatorio: true, max: 80, dica: "Nome completo. Ex.: CG 150 Titan" },
      { nome: "nome_curto", rotulo: "Nome curto", tipo: "texto", obrigatorio: true, max: 40, dica: "Aparece nos filtros do catálogo. Ex.: Titan 150" },
      ordem,
    ],
    colunas: ["fabricante", "modelo", "nome_curto", "ordem"],
    slugDe: ["fabricante", "modelo"],
  },
  lojas: {
    tabela: "pontos_venda",
    titulo: "Lojas",
    um: "loja",
    feminino: true,
    campos: [
      { nome: "tipo", rotulo: "Tipo", tipo: "selecao", obrigatorio: true, opcoes: { loja_propria: "Loja própria", revendedor: "Revendedor" }, padrao: "loja_propria" },
      { nome: "nome", rotulo: "Nome", tipo: "texto", obrigatorio: true, max: 120 },
      { nome: "endereco", rotulo: "Endereço", tipo: "texto", obrigatorio: true, max: 200, dica: "Rua e número." },
      { nome: "cidade", rotulo: "Cidade", tipo: "texto", obrigatorio: true, max: 80 },
      { nome: "uf", rotulo: "Estado (sigla)", tipo: "texto", obrigatorio: true, max: 2, maiusculas: true, dica: "Duas letras. Ex.: SP" },
      { nome: "cep", rotulo: "CEP", tipo: "texto", max: 9, dica: "Ex.: 16010-000" },
      { nome: "horario", rotulo: "Horário de funcionamento", tipo: "texto", max: 200 },
      { nome: "whatsapp", rotulo: "WhatsApp", tipo: "texto", max: 20, dica: "Com DDD." },
      { nome: "latitude", rotulo: "Latitude", tipo: "numero", dica: "Posição no mapa. Ex.: -21.2089" },
      { nome: "longitude", rotulo: "Longitude", tipo: "numero", dica: "Ex.: -50.4328" },
      ordem,
      { nome: "ativo", rotulo: "Mostrar no site", tipo: "marcacao", padrao: true },
    ],
    colunas: ["nome", "tipo", "cidade", "uf", "ativo"],
  },
  numeros: {
    tabela: "numeros_marca",
    titulo: "Números da marca",
    um: "número",
    feminino: false,
    campos: [
      { nome: "valor", rotulo: "Número", tipo: "texto", obrigatorio: true, max: 12, dica: "Como aparece no site. Ex.: 5.500, +300, 12" },
      { nome: "rotulo", rotulo: "Legenda", tipo: "texto", obrigatorio: true, max: 80, dica: "Ex.: peças no catálogo" },
      ordem,
      { nome: "publicado", rotulo: "Mostrar no site", tipo: "marcacao", padrao: false },
    ],
    colunas: ["valor", "rotulo", "publicado"],
    erroDeRegra: "Algum campo passou do tamanho permitido.",
    voltarPara: "/painel/conteudo",
  },
  depoimentos: {
    tabela: "depoimentos",
    titulo: "Depoimentos",
    um: "depoimento",
    feminino: false,
    campos: [
      { nome: "nome", rotulo: "Nome do responsável", tipo: "texto", obrigatorio: true, max: 80 },
      { nome: "loja", rotulo: "Loja", tipo: "texto", obrigatorio: true, max: 120 },
      { nome: "cidade", rotulo: "Cidade", tipo: "texto", obrigatorio: true, max: 80 },
      { nome: "uf", rotulo: "Estado (sigla)", tipo: "texto", obrigatorio: true, max: 2, maiusculas: true, dica: "Duas letras. Ex.: SP" },
      { nome: "texto", rotulo: "Depoimento", tipo: "texto", obrigatorio: true, max: 400, dica: "De 10 a 400 caracteres, nas palavras do revendedor." },
      { nome: "autorizado_em", rotulo: "Data da autorização por escrito", tipo: "data", dica: "Sem esta data o depoimento não pode ser publicado." },
      ordem,
      { nome: "publicado", rotulo: "Mostrar no site", tipo: "marcacao", padrao: false },
    ],
    colunas: ["nome", "loja", "cidade", "publicado"],
    erroDeRegra: "Para publicar, informe a data da autorização por escrito. Confira também a sigla do estado e o tamanho do depoimento (10 a 400 caracteres).",
    voltarPara: "/painel/conteudo",
  },
} satisfies Record<string, Cadastro>;

export type ChaveCadastro = keyof typeof CADASTROS;
