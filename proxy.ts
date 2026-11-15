import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Roda antes de toda rota do painel: renova a sessão do Supabase e manda para o login quem não entrou.
// É só a primeira barreira. Quem protege os dados de verdade é o RLS do banco (docs/banco.md).
export async function proxy(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(novos, cabecalhos) {
        novos.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        novos.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        Object.entries(cabecalhos).forEach(([nome, valor]) => resposta.headers.set(nome, valor));
      },
    },
  });

  // Não colocar código entre criar o cliente e o getClaims(): é esta chamada que renova o token vencido.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && request.nextUrl.pathname !== "/painel/entrar") {
    const login = request.nextUrl.clone();
    login.pathname = "/painel/entrar";
    login.search = "";
    return NextResponse.redirect(login);
  }
  return resposta;
}

export const config = { matcher: ["/painel/:path*"] };
