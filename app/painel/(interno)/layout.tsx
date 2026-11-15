import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { equipe } from "@/lib/painel";
import { sair } from "../acoes";
import { MenuLinks } from "./MenuLinks";

// Moldura das telas internas. Menu e página leem a sessão, que só existe na hora do acesso,
// por isso cada um fica dentro de um Suspense (regra do Next com Cache Components).
export default function LayoutInterno({ children }: { children: ReactNode }) {
  return (
    <div className="ad">
      <aside className="ad-side">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 12px" }}>
          <span className="mk-logo mk-logo--inverse">
            Moto<b>Koi</b>
          </span>
          <span style={{ fontSize: 12, lineHeight: "16px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-inverse-muted)" }}>
            Painel
          </span>
        </div>
        <Suspense>
          <Menu />
        </Suspense>
      </aside>
      <main className="ad-main">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  );
}

async function Menu() {
  const { supabase, nome } = await equipe();
  const { count } = await supabase.from("cadastros_revenda").select("id", { count: "exact", head: true }).eq("situacao", "novo");

  return (
    <>
      <MenuLinks novos={count ?? 0} />
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "16px 12px 0", borderTop: "1px solid var(--border-inverse)" }}>
        <Link href="/" style={{ fontSize: 14, lineHeight: "20px", color: "var(--text-inverse-muted)" }}>
          Ver o site
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 14, lineHeight: "20px" }}>{nome}</span>
          <form action={sair}>
            <button type="submit" style={{ all: "unset", cursor: "pointer", fontSize: 13, lineHeight: "20px", color: "var(--text-inverse-muted)", textDecoration: "underline" }}>
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
