"use client";

import { excluirCadastroRevenda } from "./acoes";
import { Botao } from "@/components/Botao";

// Componente do navegador só para pedir confirmação antes de apagar (o resto da tela roda no servidor).
export function ExcluirCadastro({ id, loja }: { id: number; loja: string }) {
  return (
    <form
      action={excluirCadastroRevenda.bind(null, id)}
      onSubmit={(ev) => {
        if (!window.confirm(`Excluir o cadastro de “${loja}” e todos os dados dele? Não dá para desfazer.`)) ev.preventDefault();
      }}
      className="self-center"
    >
      <Botao variante="perigoFantasma" type="submit">
        Excluir dados do cadastro
      </Botao>
    </form>
  );
}
