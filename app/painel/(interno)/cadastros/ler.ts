import type { Cadastro } from "./config";

export const slugDe = (texto: string) =>
  texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type Linha = Record<string, string | number | boolean | null>;
type Valores = Record<string, string | boolean>;

// Lê o formulário campo a campo, conforme a configuração, e devolve a linha pronta para o banco.
// `valores` é o que a pessoa digitou, devolvido ao formulário quando há erro.
// Só entram os campos descritos em `cfg`: o que mais vier do navegador é ignorado.
export function lerCampos(cfg: Cadastro, formulario: FormData, criando: boolean): { erro?: string; valores: Valores; linha: Linha } {
  const valores: Valores = {};
  const linha: Linha = {};
  let erro: string | undefined;

  for (const campo of cfg.campos) {
    if (campo.tipo === "marcacao") {
      linha[campo.nome] = valores[campo.nome] = formulario.get(campo.nome) === "on";
      continue;
    }
    let texto = String(formulario.get(campo.nome) ?? "").trim();
    if (campo.maiusculas) texto = texto.toUpperCase();
    valores[campo.nome] = texto;

    if (campo.obrigatorio && !texto) erro ??= `Preencha o campo “${campo.rotulo}”.`;
    else if (campo.max && texto.length > campo.max) erro ??= `“${campo.rotulo}” aceita até ${campo.max} caracteres.`;
    else if (campo.tipo === "selecao" && !Object.hasOwn(campo.opcoes ?? {}, texto)) erro ??= `Escolha uma opção em “${campo.rotulo}”.`;

    if (campo.tipo === "numero") {
      // Aceita vírgula decimal ("-21,2089"), comum em quem copia coordenadas.
      const numero = texto === "" ? null : Number(texto.replace(",", "."));
      if (numero !== null && !Number.isFinite(numero)) erro ??= `“${campo.rotulo}” precisa ser um número.`;
      linha[campo.nome] = numero ?? (campo.padrao !== undefined ? Number(campo.padrao) : null);
    } else {
      linha[campo.nome] = texto || null;
    }
  }
  // O slug nasce na criação e não muda depois: é o que aparece na URL dos filtros do catálogo.
  if (cfg.slugDe && criando) linha.slug = slugDe(cfg.slugDe.map((c) => valores[c]).join(" "));

  return { erro, valores, linha };
}
