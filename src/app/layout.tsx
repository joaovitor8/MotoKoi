import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import type { CSSProperties } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MotoKoi", template: "MotoKoi — %s" },
  description: "Peças para motocicletas.",
};

// next/font baixa as fontes no build e serve do próprio site: o navegador não espera o Google (mais rápido)
// e o visitante não manda o IP para o Google (política de privacidade). Só os pesos que as telas usam.
const barlow = Barlow({ weight: ["400", "500", "600"], subsets: ["latin"], display: "swap" });
const barlowCondensed = Barlow_Condensed({ weight: ["600", "700", "800"], subsets: ["latin"], display: "swap" });

// As variáveis --font-sans e --font-display (globals.css) apontam para "Barlow" pelo nome; aqui passam a apontar para as fontes do next/font.
const fontes = {
  "--font-sans": `${barlow.style.fontFamily}, system-ui, sans-serif`,
  "--font-display": `${barlowCondensed.style.fontFamily}, "Arial Narrow", sans-serif`,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" style={fontes}>
      {/* Extensões do navegador (ex.: ColorZilla põe cz-shortcut-listen) mexem nos atributos do <body> antes do React.
          suppressHydrationWarning ignora só os atributos deste elemento; erros nos filhos continuam aparecendo. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
