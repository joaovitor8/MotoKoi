# Gera texturas limpas a partir das fotos:  python limpa_texturas.py
# Retifica a perspectiva e repinta a arte com tintas chapadas (branco, vermelho, preto),
# o que elimina sombra, reflexo de flash, sujeira e amassados.
import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(AQUI, "texturas")
PX = 6000  # pixels por metro
W, H, D = 0.30, 0.20, 0.22
LW, LH, LD = round(W * PX), round(H * PX), round(D * PX)

VERMELHO = np.array([205, 30, 38], float)
BRANCO = np.array([246, 246, 244], float)
PRETO = np.array([38, 34, 34], float)

# Cantos de cada face na foto, em pixels: inf-esq, inf-dir, sup-dir, sup-esq
CANTOS = {
    "frente": [(327, 718), (1212, 700), (1267, 58), (286, 56)],
    "lateral": [(441, 657), (1082, 693), (1144, 88), (457, 40)],
    "topo": [(0, 260), (0, 1182), (660, 1134), (640, 260)],
}


def retifica(nome, larg, alt):
    """Recorta a face da foto e desfaz a perspectiva."""
    dst = [(0, alt), (larg, alt), (larg, 0), (0, 0)]
    A, b = [], []
    for (x, y), (u, v) in zip(dst, CANTOS[nome]):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        b += [u, v]
    coef = np.linalg.solve(np.array(A, float), np.array(b, float))
    foto = Image.open(os.path.join(TEX, nome + ".jpg")).convert("RGB")
    return foto.transform((larg, alt), Image.PERSPECTIVE, tuple(coef), Image.BICUBIC)


def passo(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def tintas(im):
    """Quanto de vermelho e de preto há em cada pixel (0..1), independente da iluminação."""
    a = np.asarray(im, float) / 255
    v = a.max(2)
    s = (v - a.min(2)) / (v + 1e-6)
    # luz local: o mais claro da vizinhança, bem borrado (branco e vermelho têm o mesmo brilho máximo)
    mini = Image.fromarray((v * 255).astype(np.uint8)).resize((im.width // 8, im.height // 8))
    mini = mini.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(6)).resize(im.size)
    luz = np.asarray(mini, float) / 255
    preto = 1 - passo(0.50, 0.78, v / (luz + 1e-6))
    vermelho = passo(0.22, 0.42, s)
    return vermelho, preto


def pinta(vermelho, preto):
    r, k = vermelho[..., None], preto[..., None]
    return ((BRANCO * (1 - r) + VERMELHO * r) * (1 - k) + PRETO * k).astype(np.uint8)


def cura_bordas(a, n=12):
    """Repete na borda o que está logo dentro: some com fita, rasgo e fundo da foto."""
    a[:n], a[-n:] = a[n:n + 1], a[-n - 1:-n]
    a[:, :n], a[:, -n:] = a[:, n:n + 1], a[:, -n - 1:-n]
    return a


def frente():
    foto = retifica("frente", LW, LH)
    r, k = tintas(foto)
    r = np.maximum(r, k)  # lado esquerdo só tem branco e vermelho: traço fino escuro (contorno do KIT) é vermelho
    r[:int(0.09 * LH)] = 0  # faixa branca do alto, onde ficou resto de fita
    pintado = cura_bordas(pinta(r, np.zeros_like(r)), 4)

    # Painel direito (foto impressa em vermelho escuro): continua sendo a foto, que tem meio-tom,
    # só com cor reforçada e bordas espelhadas por cima dos rasgos
    p = np.asarray(ImageEnhance.Contrast(ImageEnhance.Color(foto).enhance(1.35)).enhance(1.1)).copy()
    p[:60] = p[119:59:-1]
    p[-20:] = p[-21:-41:-1]
    # divisa medida na foto retificada; na faixa de ±5 px decide pixel a pixel pelo escuro
    xs = np.arange(LW)[None, :]
    reta = (0.6872 + 0.0033 * np.arange(LH)[:, None] / LH) * LW
    escuro = np.asarray(foto, float).max(2) / 255 < 0.55
    eh_painel = (xs > reta + 5) | ((xs > reta - 5) & escuro)
    return np.where(eh_painel[..., None], p, pintado), r


def lateral():
    foto = retifica("lateral", LD, LH)
    r, k = tintas(foto)
    xs = np.broadcast_to(np.arange(LD)[None, :] / LD, r.shape)
    esq, dir_ = 0.667, 0.939  # bordas da faixa vermelha
    # miolo da faixa: só o logo; a mediana tira os pontinhos de reflexo
    med = np.asarray(Image.fromarray((r * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(11)), float) / 255
    r = np.where(xs > esq, med, r)
    # bordas da faixa e tudo à direita do logo (grampos, canto escuro): redesenhados retos
    r = np.where(np.abs(xs - esq) < 0.016, xs > esq, r)
    r = np.where(xs > 0.879, xs < dir_, r)
    # preto só existe no selo redondo; fora dele é arranhão ou sujeira
    ys = np.arange(LH)[:, None] / LH
    k = np.where(np.hypot((xs - 0.314) * LD, (ys - 0.483) * LH) < 0.2 * LD, k, 0)
    return cura_bordas(pinta(r, k))


def topo(r_frente):
    """Topo refeito do zero (a foto está rasgada): vermelho chapado e o logo MOTOKOI copiado da frente."""
    reg = Image.fromarray((r_frente * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(7))  # tira ciscos
    reg = np.asarray(reg).copy()
    reg[:int(0.2225 * LH), int(0.125 * LW):] = 0  # o círculo do logo sobe mais que as letras; ao lado dele há outros textos
    reg = reg[int(0.19 * LH):int(0.37 * LH), int(0.02 * LW):int(0.675 * LW)] > 127
    ys, xs = np.where(reg.any(1))[0], np.where(reg.any(0))[0]
    logo = Image.fromarray((reg[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1] * 255).astype(np.uint8))
    larg = int(0.72 * LW)
    logo = logo.resize((larg, round(logo.height * larg / logo.width)), Image.LANCZOS)

    vermelho, sombra = tuple(VERMELHO.astype(int)), (120, 14, 20)
    aba = Image.new("RGB", (LW, LD // 2), vermelho)
    x, y = (LW - larg) // 2, (LD // 2 - logo.height) // 2
    aba.paste(sombra, (x + 7, y + 7), logo)
    aba.paste(tuple(BRANCO.astype(int)), (x, y), logo)
    t = Image.new("RGB", (LW, LD), vermelho)
    t.paste(aba.rotate(180), (0, 0))  # aba de trás: lida pelo outro lado
    t.paste(aba, (0, LD // 2))
    t.paste(sombra, (0, LD // 2 - 2, LW, LD // 2 + 2))  # encontro das abas
    return t


if __name__ == "__main__":
    f, r_frente = frente()
    Image.fromarray(f).save(os.path.join(TEX, "frente_limpa.png"))
    Image.fromarray(lateral()).save(os.path.join(TEX, "lateral_limpa.png"))
    topo(r_frente).save(os.path.join(TEX, "topo_limpa.png"))
    print("TEXTURAS_OK")
