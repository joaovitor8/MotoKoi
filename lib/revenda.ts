// Validação do formulário "Seja revendedor". As regras espelham as da tabela cadastros_revenda
// (docs/banco.md): o banco recusaria do mesmo jeito, mas aqui a pessoa recebe a mensagem em português.

export const TIPOS_NEGOCIO = {
  loja_pecas: "Loja de peças",
  oficina: "Oficina",
  distribuidor: "Distribuidor",
  outro: "Outro",
} as const;

const UFS = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));

export type Cadastro = {
  nome_loja: string;
  documento: string;
  tipo_negocio: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  cidade: string;
  uf: string;
  mensagem: string | null;
  aceite_contato: true;
};

const digitos = (s: string) => s.replace(/\D/g, "");

// `v` são os campos do formulário, já sem espaços nas pontas.
export function validarCadastro(v: Record<string, string | undefined>): { erro: string } | { dados: Cadastro } {
  const { loja = "", documento = "", tipo = "", responsavel = "", whatsapp = "", email = "", cidade = "", mensagem = "" } = v;

  if (!loja || loja.length > 120) return { erro: "Informe o nome da loja ou oficina." };
  if (!/^[0-9./-]{11,18}$/.test(documento) || ![11, 14].includes(digitos(documento).length))
    return { erro: "Informe um CNPJ (14 números) ou um CPF (11 números)." };
  if (!Object.hasOwn(TIPOS_NEGOCIO, tipo)) return { erro: "Escolha o tipo de negócio." };
  if (!responsavel || responsavel.length > 120) return { erro: "Informe o seu nome." };
  if (whatsapp.length > 20 || digitos(whatsapp).length < 10) return { erro: "Informe o WhatsApp com DDD." };
  if (email.length > 160 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Informe um e-mail válido." };

  // O campo é um só na tela ("Araçatuba, SP"); o banco guarda cidade e UF separados.
  const local = /^(.+?)[\s,/-]+([A-Za-z]{2})$/.exec(cidade);
  const uf = local?.[2].toUpperCase();
  if (!local || !uf || !UFS.has(uf) || local[1].length > 80)
    return { erro: "Informe a cidade e a sigla do estado, como em Araçatuba, SP." };

  if (mensagem.length > 2000) return { erro: "A mensagem pode ter até 2000 caracteres." };
  if (v.aceite !== "on") return { erro: "Marque o aceite para a MotoKoi poder entrar em contato." };

  return {
    dados: {
      nome_loja: loja,
      documento,
      tipo_negocio: tipo,
      responsavel,
      whatsapp,
      email,
      cidade: local[1],
      uf,
      mensagem: mensagem || null,
      aceite_contato: true,
    },
  };
}
