// Estilos que se repetem nas telas do painel (antigas classes .ad-* do painel.css).
// "[:where(&)_x]" estiliza os filhos x com prioridade baixa: uma classe colocada direto no filho sempre vence,
// como acontecia com o CSS antigo.

export const tituloPainel = "m-0 font-display text-[44px] leading-11 font-extrabold uppercase";

// Cartão branco com borda; o <h2> de dentro vira o título do cartão.
export const cartao = [
  "rounded-lg border border-border bg-bg",
  "[:where(&)_h2]:m-0 [:where(&)_h2]:font-display [:where(&)_h2]:text-[24px] [:where(&)_h2]:leading-7 [:where(&)_h2]:font-bold [:where(&)_h2]:uppercase",
].join(" ");

export const tabela = [
  "w-full border-collapse text-[14px] leading-5",
  "[:where(&)_th]:border-b [:where(&)_th]:border-border [:where(&)_th]:px-4 [:where(&)_th]:py-3 [:where(&)_th]:text-left [:where(&)_th]:text-[12px] [:where(&)_th]:leading-4 [:where(&)_th]:font-semibold [:where(&)_th]:tracking-[.08em] [:where(&)_th]:whitespace-nowrap [:where(&)_th]:text-text-muted [:where(&)_th]:uppercase",
  "[:where(&)_td]:border-b [:where(&)_td]:border-border [:where(&)_td]:px-4 [:where(&)_td]:py-3 [:where(&)_td]:align-middle",
  "[:where(&)_tbody_tr:last-child_td]:border-b-0 [:where(&)_tr[aria-selected=true]_td]:bg-brand-subtle",
].join(" ");

// Campo do painel (filtros e formulários): a caixa com borda, com o <input> ou <select> dentro.
export const entrada = [
  "box-border flex h-10 items-center gap-2 rounded-md border-[1.5px] border-border-strong bg-bg px-3 text-[14px] leading-5 text-text",
  // "!": vence o all: unset, que no CSS do Tailwind vem depois.
  "[:where(&)_input]:[all:unset] [:where(&)_input]:flex-1! [:where(&)_input]:min-w-0!",
  "[:where(&)_.mk-ico]:text-[18px] [:where(&)_.mk-ico]:text-text-muted",
  "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus [:where(&)_select:focus-visible]:outline-none",
].join(" ");

// Rótulo pequeno em caixa alta (ex.: "Responsável" no detalhe do pedido).
export const rotuloPainel = "text-[12px] leading-4 font-semibold tracking-[.08em] text-text-muted uppercase";

// Quadrado da foto na lista de produtos.
export const miniatura = "grid size-12 place-items-center rounded-md bg-bg-muted text-[20px] text-text-muted";
