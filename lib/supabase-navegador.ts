import { createBrowserClient } from "@supabase/ssr";

// Cliente para componentes do painel que rodam no navegador (envio de fotos). Usa a mesma sessão
// do login, lida dos cookies, então o RLS continua decidindo o que a pessoa pode fazer.
export const clienteDoNavegador = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
