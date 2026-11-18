import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { obterConteudo } from "@/lib/conteudo";
import { rotulo, tituloH1 } from "@/components/estilos";

export const metadata: Metadata = { title: "Política de privacidade" };

export default async function Privacidade() {
  const conteudo = await obterConteudo();
  const whatsapp = conteudo.whatsapp ? <a href={conteudo.whatsapp.link}>WhatsApp {conteudo.whatsapp.numero}</a> : "WhatsApp [NÚMERO]";

  const secoes = [
    {
      titulo: "Quem cuida dos seus dados",
      corpo: (
        <p className="m-0 text-[17px] leading-7 text-text-secondary">
          MotoKoi Peças para Motos Ltda. (EX), CNPJ 00.000.000/0001-00 (EX), Rua Marechal Deodoro, 1462, Araçatuba, SP (EX), dona da marca MotoKoi. Para qualquer assunto sobre seus dados, fale com o
          encarregado pelo e-mail privacidade@example.com (EX) ou pelo {whatsapp}.
        </p>
      ),
    },
    {
      titulo: "Que dados coletamos",
      corpo: (
        <>
          <p className="m-0 text-[17px] leading-7 text-text-secondary">
            Só os que você digita no formulário <Link href="/seja-revendedor">Seja revendedor</Link>: nome da loja, CNPJ ou CPF, tipo de
            negócio, seu nome, WhatsApp, e-mail, cidade e estado, e a mensagem, se escrever uma.
          </p>
          <p className="m-0 text-[17px] leading-7 text-text-secondary">
            Navegar pelo site não exige cadastro. O site não usa cookies de análise nem de publicidade e não instala rastreadores. O único
            cookie é o de login do painel, usado só pela equipe da MotoKoi.
          </p>
        </>
      ),
    },
    {
      titulo: "Para que usamos",
      corpo: (
        <p className="m-0 text-[17px] leading-7 text-text-secondary">
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
          <p className="m-0 text-[17px] leading-7 text-text-secondary">Com os serviços que mantêm o site no ar, só para isso:</p>
          <ul className="text-[17px] leading-7 text-text-secondary m-0 pl-5.5">
            <li>Supabase: guarda o banco de dados (servidores nos Estados Unidos).</li>
            <li>Vercel: hospeda o site (servidores nos Estados Unidos).</li>
          </ul>
          <p className="m-0 text-[17px] leading-7 text-text-secondary">
            Por isso alguns dados são guardados fora do Brasil. Quando respondemos
            pelo WhatsApp, a conversa passa pelos servidores da Meta.
          </p>
        </>
      ),
    },
    {
      titulo: "Por quanto tempo guardamos",
      corpo: (
        <p className="m-0 text-[17px] leading-7 text-text-secondary">
          Enquanto o cadastro estiver em análise ou a parceria de revenda existir. Cadastros recusados são apagados em 12 meses (EX). Você pode
          pedir a exclusão antes disso a qualquer momento.
        </p>
      ),
    },
    {
      titulo: "Seus direitos",
      corpo: (
        <p className="m-0 text-[17px] leading-7 text-text-secondary">
          Você pode pedir para saber quais dados temos, receber uma cópia, corrigir, apagar ou retirar o aceite de contato (LGPD, art. 18).
          Basta escrever para o encarregado no contato acima. Respondemos em até 15 dias (EX). Se não ficar satisfeito, pode reclamar na
          Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      ),
    },
    {
      titulo: "Mudanças nesta política",
      corpo: <p className="m-0 text-[17px] leading-7 text-text-secondary">Quando esta política mudar, a data no topo da página muda junto.</p>,
    },
  ];

  return (
    <>
      <Cabecalho atual="/privacidade" />
      <main>
        <section className="px-(--margem) pt-18 pb-16 flex flex-col gap-5">
          <span className={rotulo}>Privacidade</span>
          <h1 className={tituloH1}>Política de privacidade</h1>
          <p className="m-0 leading-7 text-text-secondary text-[15px]">Atualizada em 17/11/2026 (EX). [TEXTO A REVISAR COM QUEM ENTENDE DE LGPD]</p>
        </section>
        <section className="px-(--margem) pt-0 pb-28 flex flex-col gap-10 max-w-205">
          {secoes.map((s) => (
            <div key={s.titulo} className="flex flex-col gap-3.5 pt-5 border-t-[1.5px] border-t-text">
              <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">{s.titulo}</h2>
              {s.corpo}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
