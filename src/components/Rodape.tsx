import Link from "next/link";
import type { ReactNode } from "react";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { Logo } from "@/components/Logo";
import { obterConteudo } from "@/lib/conteudo";
import { listarCategorias } from "@/lib/produtos";

// inline-block: dentro do <li> o link é inline e ignoraria o padding vertical.
const link = "inline-block py-1 text-[15px] leading-6 text-text no-underline";

// Título da coluna + lista de links: o leitor de tela anuncia "Catálogo, lista, 4 itens".
function Coluna({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="m-0 pb-2 text-[12px] leading-4 font-semibold tracking-[.2em] text-text-muted uppercase">{titulo}</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">{children}</ul>
    </div>
  );
}

export async function Rodape() {
  const [categorias, conteudo] = await Promise.all([listarCategorias(), obterConteudo()]);
  return (
    <footer className="flex flex-col gap-12 border-t-[1.5px] border-text px-(--margem) pt-16 pb-10">
      <div className="flex flex-wrap justify-between gap-10">
        <div className="flex max-w-80 flex-col gap-3">
          <Logo />
          <p className="m-0 text-[15px] leading-6 text-text-secondary">
            Peças importadas para motocicletas. Qualidade, durabilidade e segurança.
          </p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-18 gap-y-8">
          <Coluna titulo="Catálogo">
            {categorias.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalogo?categoria=${c.slug}`} className={link}>
                  {c.nome}
                </Link>
              </li>
            ))}
          </Coluna>
          <Coluna titulo="MotoKoi">
            <li>
              <Link href="/a-marca" className={link}>
                A marca
              </Link>
            </li>
            <li>
              <Link href="/onde-comprar" className={link}>
                Onde comprar
              </Link>
            </li>
            <li>
              <Link href="/seja-revendedor" className={link}>
                Seja revendedor
              </Link>
            </li>
            <li>
              <Link href="/garantia" className={link}>
                Garantia
              </Link>
            </li>
            {conteudo.catalogoPdf && (
              <li>
                <a href={conteudo.catalogoPdf} className={link}>
                  Catálogo em PDF
                </a>
              </li>
            )}
          </Coluna>
          <Coluna titulo="Contato">
            <li>
              <LinkWhatsApp whatsapp={conteudo.whatsapp} className={link}>
                WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
              </LinkWhatsApp>
            </li>
            <li>
              <a href="https://www.instagram.com/moto.koi/" className={link}>
                Instagram @moto.koi
              </a>
            </li>
          </Coluna>
        </nav>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-border pt-6 text-[13px] leading-5 text-text-muted">
        <span>© 2026 MotoKoi. Todos os direitos reservados.</span>
        <Link href="/privacidade" className="text-text-muted">
          Política de privacidade
        </Link>
        <a href="https://www.macatacado.com.br/" className="text-text-muted">
          Também à venda na Mac Atacado
        </a>
      </div>
    </footer>
  );
}
