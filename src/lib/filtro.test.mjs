// Uso: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { filtrarProdutos } from "./filtro.ts";

const moto = (slug, nome, anoInicio = null, anoFim = null) => ({ slug, nome, modelo: `Honda ${nome}`, anoInicio, anoFim });
const produto = (slug, categoria, motos, codigos = []) => ({
  slug,
  nome: slug.replaceAll("-", " "),
  codigo: null,
  categoria: { slug: categoria, nome: categoria },
  motos,
  codigosOriginais: codigos.map((c) => ({ busca: c })),
});
const produtos = [
  produto("carburador-titan", "carburadores", [moto("titan-150", "Titan 150")], ["16100KVSJ01"]),
  produto("carburador-ybr", "carburadores", [moto("ybr-125", "YBR 125", 2000, 2008)]),
  produto("disco-titan", "embreagem", [moto("titan-150", "Titan 150"), moto("fan-160", "Fan 160", 2016)]),
  produto("capa-de-chuva", "capas", []),
];
const achar = (filtros) => filtrarProdutos(produtos, { motos: [], ...filtros }).map((p) => p.slug);

test("sem filtro devolve tudo", () => assert.equal(achar({}).length, 4));

test("categoria e moto se combinam", () => {
  assert.deepEqual(achar({ categoria: "carburadores", motos: ["titan-150"] }), ["carburador-titan"]);
  assert.deepEqual(achar({ motos: ["titan-150", "ybr-125"] }), ["carburador-titan", "carburador-ybr", "disco-titan"]);
});

test("ano respeita a faixa da moto, e peça sem ano serve em qualquer ano", () => {
  assert.deepEqual(achar({ motos: ["ybr-125"], ano: 2005 }), ["carburador-ybr"]);
  assert.deepEqual(achar({ motos: ["ybr-125"], ano: 2012 }), []);
  assert.deepEqual(achar({ ano: 2012 }), ["carburador-titan", "disco-titan"]);
  // a faixa vale para a moto escolhida: Fan 160 começa em 2016
  assert.deepEqual(achar({ motos: ["fan-160"], ano: 2010 }), []);
});

test("busca por código original, com e sem traço, e por texto sem acento", () => {
  assert.deepEqual(achar({ busca: "16100-kvs" }), ["carburador-titan"]);
  assert.deepEqual(achar({ busca: "16100KVSJ01" }), ["carburador-titan"]);
  assert.deepEqual(achar({ busca: "ybr" }), ["carburador-ybr"]);
  assert.deepEqual(achar({ busca: "zzz" }), []);
});
