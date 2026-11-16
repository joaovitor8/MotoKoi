import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { obterConteudo } from "@/lib/conteudo";

export const metadata: Metadata = { title: "Política de privacidade" };

// Rascunho em linguagem simples (LGPD, art. 9). O texto final precisa ser revisado por quem entende de LGPD,
// e os dados da empresa entre colchetes vêm do dono da MotoKoi.
const h2 = { margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 32, lineHeight: "34px", textTransform: "uppercase" } as const;
const texto = { margin: 0, fontSize: 17, lineHeight: "28px", color: "var(--text-secondary)" } as const;
const lista = { ...texto, margin: 0, paddingLeft: 22 } as const;

export default async function Privacidade() {
  const conteudo = await obterConteudo();
  const whatsapp = conteudo.whatsapp ? <a href={conteudo.whatsapp.link}>WhatsApp {conteudo.whatsapp.numero}</a> : "WhatsApp [NÚMERO]";

  const secoes = [
    {
      titulo: "Quem cuida dos seus dados",
      corpo: (
        <p style={texto}>
          [RAZÃO SOCIAL], CNPJ [NÚMERO], [ENDEREÇO COMPLETO], dona da marca MotoKoi. Para qualquer assunto sobre seus dados, fale com o
          encarregado pelo e-mail [E-MAIL DO ENCARREGADO] ou pelo {whatsapp}.
        </p>
      ),
    },
    {
      titulo: "Que dados coletamos",
      corpo: (
        <>
          <p style={texto}>
            Só os que você digita no formulário <Link href="/seja-revendedor">Seja revendedor</Link>: nome da loja, CNPJ ou CPF, tipo de
            negócio, seu nome, WhatsApp, e-mail, cidade e estado, e a mensagem, se escrever uma.
          </p>
          <p style={texto}>
            Navegar pelo site não exige cadastro. O site não usa cookies de análise nem de publicidade e não instala rastreadores. O único
            cookie é o de login do painel, usado só pela equipe da MotoKoi.
          </p>
        </>
      ),
    },
    {
      titulo: "Para que usamos",
      corpo: (
        <p style={texto}>
          Para analisar o pedido de revenda e entrar em contato por WhatsApp ou e-mail sobre ele, como você autoriza ao marcar o aceite no
          formulário. A base legal é a preparação do contrato de revenda que você pediu (LGPD, art. 7º, V). Não vendemos seus dados e não
          mandamos propaganda sem você pedir.
        </p>
      ),
    },
    {
      titulo: "Com quem compartilhamos",
      corpo: (
        <>
          <p style={texto}>Com os serviços que mantêm o site no ar, só para isso:</p>
          <ul style={lista}>
            <li>Supabase: guarda o banco de dados (servidores nos Estados Unidos).</li>
            <li>Vercel: hospeda o site (servidores nos Estados Unidos).</li>
          </ul>
          <p style={texto}>
            Por isso alguns dados são guardados fora do Brasil. Quando respondemos
            pelo WhatsApp, a conversa passa pelos servidores da Meta.
          </p>
        </>
      ),
    },
    {
      titulo: "Por quanto tempo guardamos",
      corpo: (
        <p style={texto}>
          Enquanto o cadastro estiver em análise ou a parceria de revenda existir. Cadastros recusados são apagados em [PRAZO]. Você pode
          pedir a exclusão antes disso a qualquer momento.
        </p>
      ),
    },
    {
      titulo: "Seus direitos",
      corpo: (
        <p style={texto}>
          Você pode pedir para saber quais dados temos, receber uma cópia, corrigir, apagar ou retirar o aceite de contato (LGPD, art. 18).
          Basta escrever para o encarregado no contato acima. Respondemos em até [N] dias. Se não ficar satisfeito, pode reclamar na
          Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      ),
    },
    {
      titulo: "Mudanças nesta política",
      corpo: <p style={texto}>Quando esta política mudar, a data no topo da página muda junto.</p>,
    },
  ];

  return (
    <>
      <Cabecalho atual="/privacidade" />
      <main>
        <section style={{ padding: "72px var(--margem) 64px", display: "flex", flexDirection: "column", gap: 20 }}>
          <span className="st-rotulo">Privacidade</span>
          <h1 className="st-h1">Política de privacidade</h1>
          <p style={{ ...texto, fontSize: 15 }}>Atualizada em [DATA DE PUBLICAÇÃO]. [TEXTO A REVISAR COM QUEM ENTENDE DE LGPD]</p>
        </section>
        <section style={{ padding: "0 var(--margem) 112px", display: "flex", flexDirection: "column", gap: 40, maxWidth: 820 }}>
          {secoes.map((s) => (
            <div key={s.titulo} style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 20, borderTop: "1.5px solid var(--text)" }}>
              <h2 style={h2}>{s.titulo}</h2>
              {s.corpo}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
