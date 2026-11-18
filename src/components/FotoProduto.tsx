import Image from "next/image";
import type { CSSProperties } from "react";

// Foto real da peça, no mesmo espaço que o EspacoFoto ocupa quando ainda não há foto.
// `tamanhos` vai para o atributo sizes: diz ao navegador a largura que a foto ocupa na tela.
export function FotoProduto({
  foto,
  proporcao,
  tamanhos,
  style,
}: {
  foto: { url: string; alt: string };
  proporcao: string;
  tamanhos: string;
  style?: CSSProperties;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-bg-subtle" style={{ aspectRatio: proporcao, ...style }}>
      <Image src={foto.url} alt={foto.alt} fill sizes={tamanhos} className="object-contain" />
    </div>
  );
}
