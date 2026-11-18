import { Botao } from "@/components/Botao";
import { rotulo, tituloH1 } from "@/components/estilos";

export default function NaoEncontrada() {
  return (
    <main className="py-24 px-(--margem) flex flex-col items-start gap-5">
      <span className={rotulo}>Erro 404</span>
      <h1 className={tituloH1}>Página não encontrada</h1>
      <p className="m-0 text-[18px] leading-7 text-text-secondary max-w-130">
        O endereço pode ter mudado ou a peça pode ter saído do catálogo.
      </p>
      <Botao variante="escuro" grande href="/catalogo">
        Ver o catálogo
      </Botao>
    </main>
  );
}
