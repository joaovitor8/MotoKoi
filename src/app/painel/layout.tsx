import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "Painel MotoKoi", template: "Painel MotoKoi — %s" },
  robots: { index: false, follow: false }, // o painel não deve aparecer no Google
};

export default function LayoutPainel({ children }: { children: ReactNode }) {
  return children;
}
