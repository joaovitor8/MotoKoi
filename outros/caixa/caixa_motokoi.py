# Caixa Motokoi: rodar com  blender --background --python caixa_motokoi.py
import os
import bpy, bmesh
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
W, H, D = 0.30, 0.20, 0.22  # metros; proporção medida nas fotos (1.5 : 1 : 1.09), tamanho real estimado
# mesmas medidas em limpa_texturas.py, que gera estas texturas já retificadas e limpas
TEXTURAS = ["frente", "lateral", "topo"]

x, y = W / 2, D / 2
# face -> (textura, cantos 3D vistos de fora: inf-esq, inf-dir, sup-dir, sup-esq)
FACES = [
    ("frente",  [(-x, -y, 0), (x, -y, 0), (x, -y, H), (-x, -y, H)]),
    ("frente",  [(x, y, 0), (-x, y, 0), (-x, y, H), (x, y, H)]),      # trás: sem foto, repete a frente
    ("lateral", [(x, -y, 0), (x, y, 0), (x, y, H), (x, -y, H)]),
    ("lateral", [(-x, y, 0), (-x, -y, 0), (-x, -y, H), (-x, y, H)]),  # outra lateral: repete
    ("topo",    [(-x, -y, H), (x, -y, H), (x, y, H), (-x, y, H)]),
    (None,      [(-x, y, 0), (x, y, 0), (x, -y, 0), (-x, -y, 0)]),    # fundo: papelão liso
]


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def material(nome, imagem=None, cor=(0.45, 0.32, 0.2, 1)):
    mat = bpy.data.materials.new(nome)
    if mat.node_tree is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.6 if imagem else 0.9
    bsdf.inputs["Specular IOR Level"].default_value = 0.25  # menos brilho, senão o vermelho lava
    bsdf.inputs["Base Color"].default_value = cor
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    if imagem:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = imagem
        tex.extension = "EXTEND"
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


mesh = bpy.data.meshes.new("CaixaMotokoi")
caixa = bpy.data.objects.new("CaixaMotokoi", mesh)
scene.collection.objects.link(caixa)

mats = {}
for nome in TEXTURAS:
    img = bpy.data.images.load(os.path.join(AQUI, "texturas", nome + "_limpa.png"))
    img.pack()  # textura embutida no .blend
    mats[nome] = len(mesh.materials)
    mesh.materials.append(material("Motokoi_" + nome, img))
mats[None] = len(mesh.materials)
mesh.materials.append(material("Papelao"))

bm = bmesh.new()
uv = bm.loops.layers.uv.new("UVMap")
for textura, cantos in FACES:
    f = bm.faces.new([bm.verts.new(p) for p in cantos])
    f.material_index = mats[textura]
    for loop, st in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        loop[uv].uv = st
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
bm.to_mesh(mesh)
bm.free()

# Cena de prévia: câmera, luz e fundo
world = bpy.data.worlds.new("Mundo")
scene.world = world
if world.node_tree is None:
    world.use_nodes = True
wn = world.node_tree
wn.nodes.clear()
bg = wn.nodes.new("ShaderNodeBackground")
bg.inputs["Color"].default_value = (0.8, 0.8, 0.8, 1)
wn.links.new(bg.outputs["Background"], wn.nodes.new("ShaderNodeOutputWorld").inputs["Surface"])

sol = bpy.data.objects.new("Sol", bpy.data.lights.new("Sol", "SUN"))
sol.data.energy = 2.0
sol.rotation_euler = (0.9, 0.0, 0.6)
scene.collection.objects.link(sol)

cam = bpy.data.objects.new("Camera", bpy.data.cameras.new("Camera"))
cam.data.lens = 50
scene.collection.objects.link(cam)
scene.camera = cam
alvo = Vector((0, 0, H / 2))


def mira(posicao):
    cam.location = posicao
    cam.rotation_euler = (alvo - cam.location).to_track_quat("-Z", "Y").to_euler()


try:
    scene.render.engine = "BLENDER_EEVEE"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.view_settings.view_transform = "Standard"  # mantém as cores das fotos
scene.render.resolution_x, scene.render.resolution_y = 1400, 1000

for nome, posicao in [("previa_frente", (0.42, -0.62, 0.42)), ("previa_tras", (-0.42, 0.62, 0.42))]:
    mira(Vector(posicao))
    scene.render.filepath = os.path.join(AQUI, nome + ".png")
    bpy.ops.render.render(write_still=True)
mira(Vector((0.42, -0.62, 0.42)))

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(AQUI, "caixa_motokoi.blend"))
bpy.ops.object.select_all(action="DESELECT")
caixa.select_set(True)
bpy.context.view_layer.objects.active = caixa
bpy.ops.export_scene.gltf(filepath=os.path.join(AQUI, "caixa_motokoi.glb"), export_format="GLB", use_selection=True)
print("CAIXA_OK")
