import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import type { CSSProperties } from "react";
import "./motokoi.css";
import "./site.css";

export const metadata: Metadata = {
  title: { default: "MotoKoi", template: "MotoKoi — %s" },
  description: "Peças para motocicletas.",
};

// next/font baixa as fontes no build e serve do próprio site: o navegador não espera o Google (mais rápido)
// e o visitante não manda o IP para o Google (política de privacidade). Só os pesos que as telas usam.
const barlow = Barlow({ weight: ["400", "500", "600"], subsets: ["latin"], display: "swap" });
const barlowCondensed = Barlow_Condensed({ weight: ["600", "700", "800"], subsets: ["latin"], display: "swap" });

// As variáveis de motokoi.css apontam para "Barlow" pelo nome; aqui passam a apontar para as fontes do next/font.
const fontes = {
  "--font-sans": `${barlow.style.fontFamily}, system-ui, sans-serif`,
  "--font-display": `${barlowCondensed.style.fontFamily}, "Arial Narrow", sans-serif`,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" style={fontes}>
      <body>{children}</body>
    </html>
  );
}
