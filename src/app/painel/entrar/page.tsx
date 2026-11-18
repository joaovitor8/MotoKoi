import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { Ondas } from "@/components/Ondas";
import { FormularioEntrar } from "./FormularioEntrar";
import { rotulo } from "@/components/estilos";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <div className="min-h-full flex flex-wrap bg-bg text-text font-sans">
      <div className="flex-[1_1_480px] min-h-90 relative overflow-hidden bg-brand text-text-on-brand flex flex-col justify-between gap-12 p-12 box-border">
        <Ondas opacity={0.32} />
        <Logo tom="branco" className="relative" />
        <div className="relative flex flex-col gap-4">
          <span className={`${rotulo} text-inherit!`}>
            Painel administrativo
          </span>
          <p className="m-0 font-display font-extrabold [font-size:clamp(56px,_6.4vw,_96px)] leading-[0.9] uppercase">
            O catálogo
            <br />
            na sua mão
          </p>
          <p className="m-0 text-[18px] leading-7 max-w-110">
            Cadastre peças, troque fotos e responda quem quer revender.
          </p>
        </div>
      </div>
      <main className="flex-[1_1_480px] flex items-center justify-center py-12 px-6 box-border">
        <FormularioEntrar />
      </main>
    </div>
  );
}
