"use client";

import Link from "next/link";
import { useState } from "react";
import { Icone } from "@/components/Icone";
import type { Moto } from "@/lib/produtos";

const rotulo = { fontWeight: 600, fontSize: 12, lineHeight: "16px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)" } as const;
const caixa = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  height: 48,
  padding: "0 14px",
  boxSizing: "border-box",
  border: "1.5px solid var(--border-strong)",
  borderRadius: 4,
  fontSize: 16,
  lineHeight: "24px",
  color: "var(--text)",
} as const;
const seletor = { all: "unset", flex: 1, minWidth: 0 } as const;
const maisBuscada = { fontWeight: 600, color: "var(--text)", textDecoration: "underline", textUnderlineOffset: 3 } as const;

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
      style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 620, padding: 20, border: "1.5px solid var(--text)", borderRadius: 8, background: "var(--bg)" }}
    >
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, lineHeight: "28px", textTransform: "uppercase" }}>Qual é a sua moto?</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <label style={{ flex: "1 1 130px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={rotulo}>Marca</span>
          <span className="st-seletor" style={caixa}>
            <select value={marca} onChange={(e) => setMarca(e.target.value)} style={seletor}>
              {marcas.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <Icone nome="chevron-down" />
          </span>
        </label>
        <label style={{ flex: "2 1 190px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={rotulo}>Modelo</span>
          <span className="st-seletor" style={caixa}>
            {/* key: ao trocar a marca, o seletor recomeça no primeiro modelo dela */}
            <select key={marca} name="moto" style={seletor}>
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
        <label style={{ flex: "1 1 110px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={rotulo}>Ano</span>
          <span className="st-seletor" style={caixa}>
            <select name="ano" defaultValue="" style={seletor}>
              <option value="">Todos</option>
              {Array.from({ length: anoAtual - 1979 }, (_, i) => anoAtual - i).map((ano) => (
                <option key={ano}>{ano}</option>
              ))}
            </select>
            <Icone nome="chevron-down" />
          </span>
        </label>
        <button type="submit" className="mk-btn mk-btn--dark" style={{ flex: "1 1 150px", height: 48 }}>
          Ver peças <Icone nome="arrow-right" />
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", fontSize: 14, lineHeight: "20px", color: "var(--text-secondary)" }}>
        <span>Mais buscadas:</span>
        {motos.slice(0, 5).map((m) => (
          <Link key={m.slug} href={{ pathname: "/catalogo", query: { moto: m.slug } }} style={maisBuscada}>
            {m.nome}
          </Link>
        ))}
        <Link href="/catalogo" style={{ fontWeight: 600, marginLeft: "auto", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Buscar por código <Icone nome="arrow-right" />
        </Link>
      </div>
    </form>
  );
}
