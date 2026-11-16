// Uso: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { CADASTROS } from "./config.ts";
import { lerCampos } from "./ler.ts";

const formulario = (campos) => {
  const f = new FormData();
  Object.entries(campos).forEach(([nome, valor]) => f.set(nome, valor));
  return f;
};

test("moto nova: gera o slug e usa a ordem padrão", () => {
  const { erro, linha } = lerCampos(CADASTROS.motos, formulario({ fabricante: "Honda", modelo: " CG 150 Titan ", nome_curto: "Titan 150", ordem: "" }), true);
  assert.equal(erro, undefined);
  assert.deepEqual(linha, { fabricante: "Honda", modelo: "CG 150 Titan", nome_curto: "Titan 150", ordem: 0, slug: "honda-cg-150-titan" });
});

test("edição não mexe no slug", () => {
  const { linha } = lerCampos(CADASTROS.categorias, formulario({ nome: "Câmaras de ar", resumo: "", ordem: "5" }), false);
  assert.deepEqual(linha, { nome: "Câmaras de ar", resumo: null, ordem: 5 });
});

test("loja: UF em maiúsculas, coordenada com vírgula, marcação e campo extra ignorado", () => {
  const { erro, linha } = lerCampos(
    CADASTROS.lojas,
    formulario({ tipo: "revendedor", nome: "Moto Peças", endereco: "Rua A, 10", cidade: "Birigui", uf: "sp", latitude: "-21,2089", ativo: "on", id: "999", situacao: "x" }),
    true,
  );
  assert.equal(erro, undefined);
  assert.equal(linha.uf, "SP");
  assert.equal(linha.latitude, -21.2089);
  assert.equal(linha.longitude, null);
  assert.equal(linha.ativo, true);
  assert.equal(linha.cep, null);
  assert.equal("id" in linha || "situacao" in linha || "slug" in linha, false);
});

test("erros: obrigatório vazio, tamanho, opção fora da lista e número torto", () => {
  const base = { tipo: "loja_propria", nome: "Loja", endereco: "Rua A", cidade: "Birigui", uf: "SP" };
  const erro = (campos) => lerCampos(CADASTROS.lojas, formulario({ ...base, ...campos }), true).erro;
  assert.match(erro({ nome: "" }), /Nome/);
  assert.match(erro({ uf: "SPX" }), /até 2/);
  assert.match(erro({ tipo: "toString" }), /Tipo/);
  assert.match(erro({ latitude: "abc" }), /Latitude/);
  assert.equal(lerCampos(CADASTROS.lojas, formulario({ ...base, nome: "", cep: "16010-000" }), true).valores.cep, "16010-000");
});

test("depoimento: data vazia vira nulo e a marcação desligada vira falso", () => {
  const base = { nome: "João", loja: "Loja X", cidade: "Birigui", uf: "sp", texto: "Peça boa, cliente volta." };
  const { erro, linha } = lerCampos(CADASTROS.depoimentos, formulario(base), true);
  assert.equal(erro, undefined);
  assert.deepEqual([linha.autorizado_em, linha.publicado, linha.uf, "slug" in linha], [null, false, "SP", false]);
  assert.equal(lerCampos(CADASTROS.depoimentos, formulario({ ...base, autorizado_em: "2026-11-15", publicado: "on" }), true).linha.autorizado_em, "2026-11-15");
});
