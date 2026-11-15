import Link from "next/link";
import { equipe } from "@/lib/painel";
import { CADASTROS, type Cadastro, type ChaveCadastro } from "./config";
import { FormularioCadastro } from "./FormularioCadastro";

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
    return c.tipo === "selecao" ? (c.opcoes?.[String(valor)] ?? String(valor)) : String(valor);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 className="ad-h1">{cfg.titulo}</h1>
        <span style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-muted)" }}>
          {registros.length} {registros.length === 1 ? "registro" : "registros"}. Clique num nome para editar.
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24 }}>
        <div className="ad-card" style={{ flex: "2 1 520px", minWidth: 0, overflowX: "auto" }}>
          <table className="ad-table">
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
                    <td key={nome} style={i === 0 ? undefined : { color: "var(--text-secondary)" }}>
                      {i === 0 ? (
                        <Link href={`/painel/${chave}?id=${r.id}`} style={{ fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
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
                  <td colSpan={cfg.colunas.length} style={{ color: "var(--text-secondary)" }}>
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
