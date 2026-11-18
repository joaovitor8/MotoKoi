"use client";

import Link from "next/link";
import { useState } from "react";
import { Icone } from "@/components/Icone";
import type { Moto } from "@/lib/produtos";
import { Botao } from "@/components/Botao";
import { focoNaCaixa } from "@/components/estilos";

const rotulo = "font-semibold text-[12px] leading-4 tracking-[.08em] uppercase text-text-muted";
const caixa = "flex items-center justify-between gap-2 h-12 py-0 px-3.5 box-border border-[1.5px] border-border-strong rounded-md text-[16px] leading-6 text-text";
// "!": vence o all: unset, que no CSS do Tailwind vem depois.
const seletor = "[all:unset] flex-1! min-w-0!";
const maisBuscada = "font-semibold text-text underline [text-underline-offset:3px]";

// Busca do topo da Home. Envia para o catálogo como ?moto=<slug>&ano=<ano>.
// É componente de navegador só porque a lista de modelos depende da marca escolhida.
export function BuscaPorMoto({ motos, anoAtual }: { motos: Moto[]; anoAtual: number }) {
  const marcas = [...new Set(motos.map((m) => m.fabricante))];
  const [marca, setMarca] = useState(marcas[0] ?? "");

  return (
    <form
      action="/catalogo"
      role="search"
      aria-label="Buscar peças pela moto"
      className="flex flex-col gap-3.5 max-w-155 p-5 border-[1.5px] border-text rounded-lg bg-bg"
    >
      <span className="font-display font-bold text-[26px] leading-7 uppercase">Qual é a sua moto?</span>
      <div className="flex flex-wrap gap-2.5">
        <label className="flex-[1_1_130px] min-w-0 flex flex-col gap-1">
          <span className={rotulo}>Marca</span>
          <span className={`${focoNaCaixa} ${caixa}`}>
            <select value={marca} onChange={(e) => setMarca(e.target.value)} className={seletor}>
              {marcas.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <Icone nome="chevron-down" />
          </span>
        </label>
        <label className="flex-[2_1_190px] min-w-0 flex flex-col gap-1">
          <span className={rotulo}>Modelo</span>
          <span className={`${focoNaCaixa} ${caixa}`}>
            {/* key: ao trocar a marca, o seletor recomeça no primeiro modelo dela */}
            <select key={marca} name="moto" className={seletor}>
              {motos
                .filter((m) => m.fabricante === marca)
                .map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.modelo}
                  </option>
                ))}
            </select>
            <Icone nome="chevron-down" />
          </span>
        </label>
        <label className="flex-[1_1_110px] min-w-0 flex flex-col gap-1">
          <span className={rotulo}>Ano</span>
          <span className={`${focoNaCaixa} ${caixa}`}>
            <select name="ano" defaultValue="" className={seletor}>
              <option value="">Todos</option>
              {Array.from({ length: anoAtual - 1979 }, (_, i) => anoAtual - i).map((ano) => (
                <option key={ano}>{ano}</option>
              ))}
            </select>
            <Icone nome="chevron-down" />
          </span>
        </label>
        <Botao variante="escuro" type="submit" className="h-12 flex-[1_1_150px]">
          Ver peças <Icone nome="arrow-right" />
        </Botao>
      </div>
      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[14px] leading-5 text-text-secondary">
        <span>Mais buscadas:</span>
        {motos.slice(0, 5).map((m) => (
          <Link key={m.slug} href={{ pathname: "/catalogo", query: { moto: m.slug } }} className={maisBuscada}>
            {m.nome}
          </Link>
        ))}
        <Link href="/catalogo" className="font-semibold ml-auto whitespace-nowrap inline-flex items-center gap-1">
          Buscar por código <Icone nome="arrow-right" />
        </Link>
      </div>
    </form>
  );
}
