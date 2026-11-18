// Estilos de texto que se repetem nas páginas do site (antigos .st-rotulo, .st-h1 e .st-h2 do site.css).
// Para mudar uma propriedade num lugar só, use "!" na classe extra: `${rotulo} text-inherit!`.

// Rótulo acima do título: 12 px, caixa alta, espaçado, vermelho escuro.
export const rotulo = "text-[12px] leading-4 font-semibold tracking-[.2em] text-text-brand uppercase";

export const tituloH1 = "m-0 font-display [font-size:clamp(60px,7.6vw,112px)] leading-[.88] font-extrabold tracking-[-.015em] uppercase";

export const tituloH2 = "m-0 font-display [font-size:clamp(44px,5.4vw,80px)] leading-[.92] font-extrabold tracking-[-.01em] uppercase";

// Contorno de foco em caixas que envolvem um <select> (o select usa all: unset e perde o contorno próprio).
export const focoNaCaixa = "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus";
