import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { Icone } from "@/components/Icone";
import { obterConteudo } from "@/lib/conteudo";
import { classesBotao } from "@/components/Botao";
import { LinkWhatsApp } from "@/components/LinkWhatsApp";
import { rotulo, tituloH1, tituloH2 } from "@/components/estilos";

export const metadata: Metadata = { title: "Garantia" };

// Itens sugeridos no design. Os termos finais da garantia devem vir do dono da MotoKoi.
const cobre = [
  "Defeito de fabricação no material ou no acabamento",
  "Peça que não corresponde à aplicação indicada no catálogo",
  "Peça que chega com defeito dentro da caixa lacrada (EX)",
];
const naoCobre = ["Desgaste natural pelo uso", "Instalação incorreta ou falta de manutenção", "Uso em competição ou em moto modificada (EX)"];
const item = "flex gap-3.5 py-3.5 px-0 border-b border-b-border text-[16px] leading-6";
const lista = "list-none m-0 p-0 border-t-[1.5px] border-t-text";

export default async function Garantia() {
  const conteudo = await obterConteudo();
  const passos = [
    { titulo: "Guarde a nota", texto: "A nota fiscal da compra é o comprovante da garantia." },
    { titulo: "Volte à loja", texto: "Leve a peça e a nota à loja onde comprou." },
    { titulo: "Análise", texto: "A loja envia a peça para a MotoKoi avaliar." },
    { titulo: "Resposta", texto: `Retorno em até ${conteudo.garantiaPrazoResposta ?? "[N]"} dias úteis, com troca se o defeito for confirmado.` },
  ];

  return (
    <>
      <Cabecalho atual="/garantia" />
      <main>
        <section className="px-(--margem) pt-18 pb-24 flex flex-wrap items-end gap-y-10 gap-x-18">
          <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5">
            <span className={rotulo}>Garantia</span>
            <h1 className={tituloH1}>
              {conteudo.garantiaMeses ?? "[N]"} meses
              <br />
              de garantia
            </h1>
          </div>
          <p className="m-0 text-[20px] leading-8 text-text-secondary flex-[1_1_380px] max-w-130">
            Toda peça MotoKoi tem garantia contra defeito de fabricação. Veja o que está coberto e como acionar.
          </p>
        </section>

        <section className="px-(--margem) pt-0 pb-28 flex flex-wrap gap-y-12 gap-x-18">
          <div className="flex-[1_1_420px] min-w-0 flex flex-col gap-5">
            <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">O que a garantia cobre</h2>
            <ul className={lista}>
              {cobre.map((texto) => (
                <li key={texto} className={item}>
                  <span className="text-[22px] text-brand">
                    <Icone nome="check" />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-[1_1_420px] min-w-0 flex flex-col gap-5">
            <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">O que não cobre</h2>
            <ul className={lista}>
              {naoCobre.map((texto) => (
                <li key={texto} className={item}>
                  <span className="text-[22px] text-text-muted">
                    <Icone nome="x" />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex-[1_1_100%] m-0 text-[14px] leading-[22px] text-text-muted">
            Itens sugeridos. Os termos finais da garantia devem vir do dono da MotoKoi.
          </p>
        </section>

        <section className="bg-bg-subtle py-28 px-(--margem) flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <span className={rotulo}>Como acionar</span>
            <h2 className={tituloH2}>Quatro passos</h2>
          </div>
          <ol className="list-none m-0 p-0 flex flex-wrap gap-8">
            {passos.map((p, i) => (
              <li key={p.titulo} className="flex-[1_1_220px] min-w-0 flex flex-col gap-2.5 pt-5 border-t-[1.5px] border-t-text">
                <span className="font-display font-extrabold text-[56px] leading-[0.9] text-brand">{i + 1}</span>
                <b className="font-display font-bold text-[24px] leading-[26px] uppercase">{p.titulo}</b>
                <span className="text-[15px] leading-6 text-text-secondary">{p.texto}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-24 px-(--margem) flex flex-wrap items-center justify-between gap-y-6 gap-x-16">
          <div className="flex flex-col gap-3 max-w-160">
            <h2 className="m-0 font-display font-bold text-[32px] leading-[34px] uppercase">É lojista e precisa acionar?</h2>
            <p className="m-0 text-[17px] leading-7 text-text-secondary">
              Fale direto com a MotoKoi pelo WhatsApp e envie fotos da peça e da nota.
            </p>
          </div>
          <LinkWhatsApp whatsapp={conteudo.whatsapp} className={classesBotao({ variante: "escuro", grande: true })}>
            <Icone nome="message" /> WhatsApp {conteudo.whatsapp?.numero ?? "[NÚMERO]"}
          </LinkWhatsApp>
        </section>
      </main>
    </>
  );
}
