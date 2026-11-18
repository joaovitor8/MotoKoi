import { createClient } from "@supabase/supabase-js";

// Cliente com a chave publishable: age como visitante e só faz o que o RLS libera
// (ler o catálogo publicado e enviar cadastro de revenda). Regras: docs/banco.md.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    // Se o Supabase travar, a página cai no erro em 8 s em vez de ficar carregando sem fim.
    global: { fetch: (url, opcoes) => fetch(url, { ...opcoes, signal: AbortSignal.any([AbortSignal.timeout(8000), ...(opcoes?.signal ? [opcoes.signal] : [])]) }) },
  },
);
