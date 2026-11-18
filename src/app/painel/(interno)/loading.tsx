// Aparece na hora em que se clica no menu do painel, enquanto a tela nova busca os dados no banco.
// O <Suspense> do layout não serve para isso: ao trocar de tela, o layout fica parado e só a página é refeita,
// então a espera precisa de uma barreira abaixo dele. E tem que ser na pasta de cada tela (produtos/loading.tsx,
// revenda/loading.tsx...): o Next também valida a troca dentro da mesma tela (ex.: ?id=3), e aí só a barreira
// logo acima da página conta. As telas reaproveitam este arquivo com `export { default } from "../loading"`.
export default function Carregando() {
  return (
    <p role="status" className="m-0 text-[14px] leading-5 text-text-muted">
      Carregando…
    </p>
  );
}
