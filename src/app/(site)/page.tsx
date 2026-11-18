import Image from "next/image";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { CartaoProduto } from "@/components/CartaoProduto";
import { Icone } from "@/components/Icone";
import { Ondas } from "@/components/Ondas";
import { anoAtual, obterConteudo } from "@/lib/conteudo";
import { listarCategorias, listarMotos, listarProdutos } from "@/lib/produtos";
import { BuscaPorMoto } from "./BuscaPorMoto";
import { Botao } from "@/components/Botao";
import { Selo } from "@/components/Selo";
import { rotulo, tituloH2 } from "@/components/estilos";

const numerosRevenda = [
  { numero: "3", texto: "lojas próprias" },
  { numero: "48h", texto: "tempo médio de resposta ao cadastro" },
  { numero: "R$ 0", texto: "de taxa de adesão ou mensalidade" },
];

const cabecalhoSecao = "flex flex-wrap justify-between items-end gap-6";
const tituloSecao = "flex flex-col gap-4";

export default async function Home() {
  const [categorias, motos, produtos, conteudo, ano] = await Promise.all([listarCategorias(), listarMotos(), listarProdutos(), obterConteudo(), anoAtual()]);
  // Selo do Inmetro: só existe se algum produto publicado tiver registro cadastrado no painel.
  const certificado = produtos.find((p) => p.inmetro);
  return (
    <>
      <Cabecalho />
      <main>
        <section className="relative overflow-hidden px-(--margem) pt-0 pb-14">
          <div className="flex flex-wrap items-center gap-10 pt-3">
            <div className="flex-[1_1_520px] min-w-0 flex flex-col gap-5.5">
              <span className={`${rotulo} text-text-muted!`}>
                Peças para motocicletas
              </span>
              <h1 className="m-0 font-display font-extrabold [font-size:clamp(60px,_7.2vw,_104px)] leading-[0.86] tracking-[-.015em] uppercase">
                Peças que
                <br />
                aguentam
                <br />o <span className="text-brand">giro</span>
              </h1>
              <p className="m-0 text-[18px] leading-7 text-text-secondary max-w-130">
                O koi sobe o rio sem parar, contra a correnteza. As peças MotoKoi foram feitas para o mesmo: aguentar,
                todo dia.
              </p>
              <BuscaPorMoto motos={motos} anoAtual={ano} />
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                <Link href="/catalogo" className="font-semibold text-[16px] leading-5 py-2 px-0">
                  Ver o catálogo
                </Link>
                <Link href="/seja-revendedor" className="font-semibold text-[16px] leading-5 py-2 px-0">
                  Seja revendedor
                </Link>
              </div>
            </div>
            <div
              className="flex-[1_1_420px] max-w-185 min-w-0 relative -mr-24 pl-10 box-border [@media(max-width:933px)]:hidden"
            >
              <Image
                src="/coroa.svg"
                alt=""
                width={760}
                height={760}
                loading="eager"
                className="block h-auto w-full"
              />
              <span className="absolute left-0 top-[12%] [writing-mode:vertical-rl] font-display font-bold [font-size:clamp(16px,_1.5vw,_22px)] leading-none tracking-[.22em] uppercase text-text">
                Contra a correnteza
              </span>
            </div>
          </div>
        </section>

        <section className="py-28 px-(--margem) flex flex-col gap-12">
          <div className={cabecalhoSecao}>
            <div className={tituloSecao}>
              <span className={rotulo}>A linha</span>
              <h2 className={tituloH2}>
                Tudo o que
                <br />
                leva a marca
              </h2>
            </div>
            <Botao variante="secundario" href="/catalogo">
              Ver catálogo completo <Icone nome="arrow-right" />
            </Botao>
          </div>
          <nav
            aria-label="Linhas de produto"
            className="flex flex-col border-t-[1.5px] border-t-text"
          >
            {categorias.map((c) => (
              <Link
                key={c.slug}
                href={`/catalogo?categoria=${c.slug}`}
                className="flex flex-wrap items-baseline gap-y-1 gap-x-8 py-5.5 px-0 border-b border-b-border text-text no-underline"
              >
                <span className="flex-[1_1_320px] font-display font-bold [font-size:clamp(34px,_4.2vw,_60px)] leading-none uppercase">
                  {c.nome}
                </span>
                <span className="flex-[1_1_280px] text-[16px] leading-6 text-text-secondary">
                  {c.resumo}
                </span>
                <span className="font-medium text-[13px] leading-5 text-text-muted">
                  {c.total} {c.total === 1 ? "peça" : "peças"}
                </span>
                <span className="text-[28px] text-brand self-center">
                  <Icone nome="arrow-right" />
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="px-(--margem) pt-0 pb-28 flex flex-col gap-12">
          <div className={cabecalhoSecao}>
            <div className={tituloSecao}>
              <span className={rotulo}>Novidades</span>
              <h2 className={tituloH2}>Acabou de chegar</h2>
            </div>
            <Link href="/catalogo" className="font-semibold text-[16px] leading-5 py-3 px-0">
              Ver todas as novidades
            </Link>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fill,_minmax(260px,_1fr))] gap-8">
            {produtos
              .filter((p) => p.novidade)
              .slice(0, 4)
              .map((p) => (
                <CartaoProduto key={p.slug} produto={p} />
              ))}
          </div>
        </section>

        <section className="py-28 px-(--margem) flex flex-col gap-14">
          <div className="flex flex-wrap items-end justify-between gap-y-6 gap-x-16">
            <div className={tituloSecao}>
              <span className={rotulo}>A marca</span>
              <h2 className={tituloH2}>
                Feita para
                <br />
                aguentar
              </h2>
            </div>
            <p className="m-0 text-[18px] leading-[30px] text-text-secondary max-w-130">
              O koi é conhecido por nadar rio acima, contra a correnteza. É a ideia por trás de cada peça MotoKoi:
              resistir ao uso de todo dia.
            </p>
          </div>
          {conteudo.numeros.length > 0 && (
            <dl className="m-0 flex flex-wrap gap-10">
              {conteudo.numeros.map((n) => (
                // column-reverse: no HTML vem o rótulo (dt) e depois o número (dd); na tela, o número fica em cima.
                <div key={n.rotulo} className="flex-[1_1_220px] min-w-0 flex flex-col-reverse justify-end gap-2.5 pt-6 border-t-[1.5px] border-t-text">
                  <dt className="text-[16px] leading-6 text-text-secondary max-w-65">{n.rotulo}</dt>
                  <dd className="m-0 font-display font-extrabold [font-size:clamp(56px,_6vw,_88px)] leading-[0.9] text-brand">{n.valor}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 py-5 px-6 bg-bg-subtle rounded-lg">
            <Selo tom="escuro">
              Inmetro
            </Selo>
            <span className="text-[15px] leading-6 text-text-secondary">
              {certificado
                ? `${certificado.nome} certificado pelo Inmetro, registro nº ${certificado.inmetro}`
                : '[SE O KIT TIVER CERTIFICAÇÃO: "Kit transmissão certificado pelo Inmetro, registro nº ..."]'}
            </span>
            <Link href="/garantia" className="font-semibold text-[15px] leading-6 ml-auto">
              Como funciona a garantia
            </Link>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand text-text-on-brand py-28 px-(--margem)">
          <Ondas />
          <div className="relative flex flex-col gap-14">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div className="flex flex-col gap-4 max-w-190">
                <span className={`${rotulo} text-inherit!`}>
                  Para lojas e oficinas
                </span>
                <h2 className={tituloH2}>
                  Suba o rio
                  <br />
                  com a gente
                </h2>
                <p className="m-0 text-[18px] leading-7 max-w-140">
                  Revenda uma linha com marca própria: preço de atacado, pedido mínimo acessível e suporte para reposição.
                </p>
              </div>
              <Botao variante="escuro" grande href="/seja-revendedor">
                Quero ser revendedor <Icone nome="arrow-right" />
              </Botao>
            </div>
            <div className="flex flex-wrap gap-10">
              {numerosRevenda.map((n) => (
                <div
                  key={n.numero}
                  className="flex-[1_1_200px] flex flex-col gap-2 pt-5 border-t-[1.5px] border-t-text-on-brand"
                >
                  <span className="font-display font-extrabold [font-size:clamp(56px,_6vw,_88px)] leading-[0.9]">
                    {n.numero}
                  </span>
                  <span className="text-[16px] leading-6">{n.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
