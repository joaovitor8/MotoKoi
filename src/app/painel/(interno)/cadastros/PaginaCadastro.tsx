import Link from "next/link";
import { dataBR, equipe } from "@/lib/painel";
import { CADASTROS, type Cadastro, type ChaveCadastro } from "./config";
import { FormularioCadastro } from "./FormularioCadastro";
import { cartao, tabela, tituloPainel } from "@/app/painel/estilos";

type Registro = Record<string, unknown> & { id: number };

// Tela de Categorias, Motos e Lojas: lista à esquerda e, à direita, o formulário de criar
// (ou de editar, quando a URL tem ?id=).
export async function PaginaCadastro({ chave, searchParams }: { chave: ChaveCadastro; searchParams: Promise<{ [campo: string]: string | string[] | undefined }> }) {
  const cfg: Cadastro = CADASTROS[chave];
  const [{ supabase }, sp] = await Promise.all([equipe(), searchParams]);
  const { data, error } = await supabase.from(cfg.tabela).select("*").order("ordem").order("id");
  if (error) throw new Error(`Supabase: ${error.message}`);
  const registros = data as Registro[];
  const aberto = registros.find((r) => r.id === Number([sp.id].flat()[0]));

  const campo = (nome: string) => cfg.campos.find((c) => c.nome === nome)!;
  const celula = (r: Registro, nome: string) => {
    const c = campo(nome);
    const valor = r[nome];
    if (c.tipo === "marcacao") return valor ? "Sim" : "Não";
    if (valor === null || valor === "") return "—";
    if (c.tipo === "data") return dataBR(`${valor}T12:00:00`);
    return c.tipo === "selecao" ? (c.opcoes?.[String(valor)] ?? String(valor)) : String(valor);
  };

  return (
    <>
      {cfg.voltarPara && (
        <nav aria-label="Você está em" className="flex gap-2 text-[14px] leading-5 text-text-muted">
          <Link href={cfg.voltarPara} className="text-text-muted">
            Conteúdo do site
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-text">{cfg.titulo}</span>
        </nav>
      )}
      <div className="flex flex-col gap-1">
        <h1 className={tituloPainel}>{cfg.titulo}</h1>
        <span className="text-[14px] leading-5 text-text-muted">
          {registros.length} {registros.length === 1 ? "registro" : "registros"}. Clique num nome para editar.
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className={`${cartao} flex-[2_1_520px] min-w-0 overflow-x-auto`}>
          <table className={tabela}>
            <thead>
              <tr>
                {cfg.colunas.map((nome) => (
                  <th key={nome}>{campo(nome).rotulo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} aria-selected={r.id === aberto?.id}>
                  {cfg.colunas.map((nome, i) => (
                    <td key={nome} className={i === 0 ? undefined : "text-text-secondary"}>
                      {i === 0 ? (
                        <Link href={`/painel/${chave}?id=${r.id}`} className="font-semibold text-text no-underline">
                          {celula(r, nome)}
                        </Link>
                      ) : (
                        celula(r, nome)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {registros.length === 0 && (
                <tr>
                  <td colSpan={cfg.colunas.length} className="text-text-secondary">
                    Nada cadastrado ainda. Use o formulário ao lado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* key: trocar de registro (ou voltar para "novo") recomeça o formulário com os dados certos */}
        <FormularioCadastro key={aberto?.id ?? "novo"} chave={chave} registro={aberto} />
      </div>
    </>
  );
}
