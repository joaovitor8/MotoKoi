// Uso: npm test  (ou: node --test lib/)
import assert from "node:assert/strict";
import { test } from "node:test";
import { validarCadastro } from "./revenda.ts";

const certo = {
  loja: "Moto Peças Central",
  documento: "12.345.678/0001-90",
  tipo: "loja_pecas",
  responsavel: "Fulano de Tal",
  whatsapp: "(18) 99999-0000",
  email: "fulano@loja.com.br",
  cidade: "Araçatuba, SP",
  mensagem: "",
  aceite: "on",
};
const erro = (campos) => validarCadastro({ ...certo, ...campos }).erro;

test("cadastro completo vira os dados da tabela", () => {
  assert.deepEqual(validarCadastro(certo).dados, {
    nome_loja: "Moto Peças Central",
    documento: "12.345.678/0001-90",
    tipo_negocio: "loja_pecas",
    responsavel: "Fulano de Tal",
    whatsapp: "(18) 99999-0000",
    email: "fulano@loja.com.br",
    cidade: "Araçatuba",
    uf: "SP",
    mensagem: null,
    aceite_contato: true,
  });
});

test("separa cidade e UF em vários jeitos de escrever", () => {
  for (const [texto, cidade, uf] of [
    ["São José do Rio Preto - sp", "São José do Rio Preto", "SP"],
    ["Campo Grande/MS", "Campo Grande", "MS"],
    ["Birigui SP", "Birigui", "SP"],
  ]) {
    const { dados } = validarCadastro({ ...certo, cidade: texto });
    assert.deepEqual([dados.cidade, dados.uf], [cidade, uf]);
  }
});

test("recusa cidade sem estado ou com sigla que não existe", () => {
  assert.match(erro({ cidade: "Araçatuba" }), /sigla do estado/);
  assert.match(erro({ cidade: "Belo Horizonte" }), /sigla do estado/);
  assert.match(erro({ cidade: "Araçatuba, XX" }), /sigla do estado/);
});

test("documento: aceita CPF e CNPJ, recusa o resto", () => {
  assert.equal(erro({ documento: "123.456.789-01" }), undefined);
  assert.match(erro({ documento: "123456789012" }), /CNPJ/);
  assert.match(erro({ documento: "abc" }), /CNPJ/);
});

test("recusa tipo fora da lista, e-mail torto, WhatsApp curto e falta de aceite", () => {
  assert.match(erro({ tipo: "toString" }), /tipo de negócio/);
  assert.match(erro({ email: "nao-e-email" }), /e-mail/);
  assert.match(erro({ whatsapp: "9999-0000" }), /WhatsApp/);
  assert.match(erro({ aceite: undefined }), /aceite/);
});
