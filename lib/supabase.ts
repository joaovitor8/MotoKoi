import { createClient } from "@supabase/supabase-js";

// Cliente com a chave publishable: age como visitante e só faz o que o RLS libera
// (ler o catálogo publicado e enviar cadastro de revenda). Regras: docs/banco.md.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
