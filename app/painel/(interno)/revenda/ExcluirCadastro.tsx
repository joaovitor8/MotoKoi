"use client";

import { excluirCadastroRevenda } from "./acoes";

// Componente do navegador só para pedir confirmação antes de apagar (o resto da tela roda no servidor).
export function ExcluirCadastro({ id, loja }: { id: number; loja: string }) {
  return (
    <form
      action={excluirCadastroRevenda.bind(null, id)}
      onSubmit={(ev) => {
        if (!window.confirm(`Excluir o cadastro de “${loja}” e todos os dados dele? Não dá para desfazer.`)) ev.preventDefault();
      }}
      style={{ alignSelf: "center" }}
    >
      <button type="submit" className="mk-btn mk-btn--ghost" style={{ color: "var(--text-danger)" }}>
        Excluir dados do cadastro
      </button>
    </form>
  );
}
