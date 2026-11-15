import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente do painel: carrega a sessão de quem fez login (guardada em cookies), então o banco sabe
// quem está pedindo e o RLS libera ou não. O site público usa lib/supabase.ts, sem sessão.
export async function clienteDoPainel() {
  const guardados = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => guardados.getAll(),
      setAll(novos) {
        try {
          novos.forEach(({ name, value, options }) => guardados.set(name, value, options));
        } catch {
          // Página (Server Component) não pode gravar cookie. Tudo bem: quem renova a sessão é o proxy.ts.
        }
      },
    },
  });
}
