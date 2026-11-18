import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { equipe } from "@/lib/painel";
import { sair } from "../acoes";
import { MenuLinks } from "./MenuLinks";

// Moldura das telas internas. Menu e página leem a sessão, que só existe na hora do acesso,
// por isso cada um fica dentro de um Suspense (regra do Next com Cache Components).
export default function LayoutInterno({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full bg-bg-subtle font-sans text-text">
      <aside className="box-border flex flex-[0_0_272px] flex-col gap-8 bg-bg-inverse px-4 py-6 text-text-inverse">
        <div className="flex flex-col gap-1 py-0 px-3">
          <Logo tom="inverso" />
          <span className="text-[12px] leading-4 tracking-[.14em] uppercase text-text-inverse-muted">
            Painel
          </span>
        </div>
        <Suspense>
          <Menu />
        </Suspense>
      </aside>
      <main className="box-border flex min-w-0 flex-[1_1_0] flex-col gap-6 px-10 pt-8 pb-14">
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
      <div className="mt-auto flex flex-col gap-3 px-3 pt-4 pb-0 border-t border-t-border-inverse">
        <Link href="/" className="text-[14px] leading-5 text-text-inverse-muted">
          Ver o site
        </Link>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[14px] leading-5">{nome}</span>
          <form action={sair}>
            <button type="submit" className="[all:unset] cursor-pointer! text-[13px]! leading-5! text-text-inverse-muted! underline!">
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
