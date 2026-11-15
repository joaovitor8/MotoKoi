import type { Metadata } from "next";
import "./motokoi.css";
import "./site.css";

export const metadata: Metadata = {
  title: { default: "MotoKoi", template: "MotoKoi — %s" },
  description: "Peças para motocicletas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <head>
        {/* shortcut: fontes pelo <link> do Google, igual às telas de referência; trocar por next/font se quiser fontes servidas pelo próprio site */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- a regra é do Pages Router; no layout raiz a fonte vale para todas as páginas */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
