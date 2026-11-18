import type { Metadata } from "next";
import { Cabecalho } from "@/components/Cabecalho";
import { EspacoFoto } from "@/components/EspacoFoto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { obterConteudo } from "@/lib/conteudo";
import { listarProdutos } from "@/lib/produtos";
import { Botao } from "@/components/Botao";
import { rotulo, tituloH1, tituloH2 } from "@/components/estilos";

export const metadata: Metadata = { title: "A marca" };

const valores = [
  { titulo: "Confiança", texto: "Cada peça com código, aplicação e a marca na caixa." },
  { titulo: "Qualidade", texto: "Kit transmissão fabricado em aço 1045." },
  { titulo: "Durabilidade", texto: "Feita para a moto que roda todo dia." },
];

export default async function AMarca() {
  const [conteudo, produtos] = await Promise.all([obterConteudo(), listarProdutos()]);
  // Selo do Inmetro: só com registro cadastrado em algum produto publicado.
  const certificado = produtos.find((p) => p.inmetro);
  return (
    <>
      <Cabecalho atual="/a-marca" />
      <main>
        <section className="px-(--margem) pt-18 pb-24 flex flex-wrap items-end gap-y-10 gap-x-18">
          <div className="flex-[1_1_560px] min-w-0 flex flex-col gap-5">
            <span className={rotulo}>A marca</span>
            <h1 className={tituloH1}>
              Contra a
              <br />
              <span className="text-brand">correnteza</span>
            </h1>
          </div>
          <p className="m-0 text-[20px] leading-8 text-text-secondary flex-[1_1_380px] max-w-130">
            O koi é conhecido por nadar rio acima, sem parar. É a ideia por trás de cada peça MotoKoi: resistir ao uso de
            todo dia.
          </p>
        </section>

        <section className="px-(--margem) pt-0 pb-28">
          <EspacoFoto texto="[FOTO: as peças e as caixas MotoKoi, em fundo claro]" proporcao="21 / 9" icone={64} />
        </section>

        <section className="px-(--margem) pt-0 pb-28 flex flex-wrap gap-y-10 gap-x-18">
          <div className="flex flex-col gap-4 flex-[1_1_360px] min-w-0">
            <span className={rotulo}>Nossa história</span>
            <h2 className={tituloH2}>
              De onde
              <br />
              viemos
            </h2>
          </div>
          <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5 pt-6 border-t-[1.5px] border-t-text">
            <p className="m-0 text-[20px] leading-8 text-text-secondary">
              A MotoKoi nasceu em 2018, em Araçatuba, SP, dentro da Mac Atacado. Os lojistas pediam peças de reposição com
              preço justo e que durassem, e a resposta foi criar uma marca própria, começando pelo kit transmissão. (EX)
            </p>
            <p className="m-0 text-[17px] leading-7 text-text-secondary">Depois vieram os cabos, os carburadores, os discos de embreagem, as câmaras de ar e as capas de chuva. Hoje a linha chega a lojas e oficinas de cinco estados. (EX)</p>
          </div>
        </section>

        <section className="bg-bg-subtle py-28 px-(--margem) flex flex-col gap-14">
          <div className="flex flex-col gap-4">
            <span className={rotulo}>O que está na caixa</span>
            <h2 className={tituloH2}>
              Feita para
              <br />
              aguentar
            </h2>
          </div>
          <div className="flex flex-wrap gap-10">
            {valores.map((v) => (
              <div
                key={v.titulo}
                className="flex-[1_1_280px] min-w-0 flex flex-col gap-4 pt-6 border-t-[1.5px] border-t-text"
              >
                <h3 className="m-0 font-display font-extrabold [font-size:clamp(40px,_4.4vw,_64px)] leading-[0.95] uppercase">
                  {v.titulo}
                </h3>
                <p className="m-0 text-[17px] leading-7 text-text-secondary max-w-90">{v.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-28 px-(--margem) flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-y-4 gap-x-12">
            <div className="flex flex-col gap-4">
              <span className={rotulo}>Qualidade que dá para conferir</span>
              <h2 className={tituloH2}>
                O que garante
                <br />
                cada peça
              </h2>
            </div>
            <Botao variante="secundario" href="/garantia">
              Ver a garantia <Icone nome="arrow-right" />
            </Botao>
          </div>
          <div className="flex flex-wrap gap-8">
            {[
              { titulo: `Garantia de ${conteudo.garantiaMeses ?? "[N]"} meses`, texto: "Contra defeito de fabricação, acionada pela loja onde a peça foi comprada." },
              {
                titulo: "Inmetro",
                texto: certificado
                  ? `${certificado.nome} certificado, registro nº ${certificado.inmetro}`
                  : "[SE TIVER: kit transmissão certificado, registro nº ...]",
              },
              { titulo: "Código original", texto: "Cada peça indica o código da montadora equivalente." },
              { titulo: "Aço 1045", texto: "Coroa e pinhão do kit transmissão em aço de médio carbono." },
            ].map((g) => (
              <div key={g.titulo} className="flex-[1_1_240px] min-w-0 flex flex-col gap-2 pt-5 border-t-[1.5px] border-t-text">
                <b className="font-display font-bold text-[26px] leading-7 uppercase">{g.titulo}</b>
                <span className="text-[15px] leading-6 text-text-secondary">{g.texto}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand text-text-on-brand py-24 px-(--margem)">
          <Ondas />
          <div className="relative flex flex-wrap items-end justify-between gap-y-8 gap-x-16">
            <h2 className={tituloH2}>
              Conheça
              <br />a linha
            </h2>
            <div className="flex flex-wrap gap-3">
              <Botao variante="escuro" grande href="/catalogo">
                Ver o catálogo <Icone nome="arrow-right" />
              </Botao>
              <Botao variante="inverso" grande href="/seja-revendedor">
                Seja revendedor
              </Botao>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
