// Aparece na hora em que se clica no menu do painel, enquanto a tela nova busca os dados no banco.
// O <Suspense> do layout não serve para isso: ao trocar de tela, o layout fica parado e só a página é refeita,
// então a espera precisa de uma barreira abaixo dele. O loading.tsx é essa barreira, para todas as telas internas.
export default function Carregando() {
  return (
    <p role="status" style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
      Carregando…
    </p>
  );
}
