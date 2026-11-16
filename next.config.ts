import type { NextConfig } from "next";

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dev = process.env.NODE_ENV === "development";

// Content-Security-Policy: lista de onde o navegador pode carregar cada tipo de coisa. Tudo que não está aqui é
// bloqueado, o que limita o estrago de um XSS. Além do próprio site, só entra o Supabase (dados, login, fotos);
// as fontes são servidas pelo próprio site, via next/font.
// shortcut: 'unsafe-inline' em script-src porque o Next injeta scripts em linha; a alternativa sem isso (nonce)
// obriga todas as páginas a serem geradas a cada acesso. Trocar se o site passar a exibir HTML vindo de usuários.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: ${supabase}`,
  `connect-src 'self' ${supabase} ${supabase.replace("https://", "wss://")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'", // ninguém pode abrir o site dentro de um iframe (clickjacking)
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false, // não anuncia "X-Powered-By: Next.js"
  images: {
    // As fotos dos produtos ficam no bucket público "produtos" do Supabase Storage.
    remotePatterns: [new URL(`${supabase}/storage/v1/object/public/produtos/**`)],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS: o navegador só fala com o site por HTTPS. Fora do desenvolvimento, que roda em http://localhost.
          ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
