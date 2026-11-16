// As fotos ficam no bucket público "produtos" do Supabase Storage; o banco guarda só o caminho.
export const urlDaFoto = (caminho: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/${caminho}`;

// Mesmos limites do bucket (migração storage_fotos): JPG, PNG ou WebP, até 5 MB.
export const TIPOS_DE_FOTO = ["image/jpeg", "image/png", "image/webp"];
export const TAMANHO_MAXIMO_DA_FOTO = 5 * 1024 * 1024;

// PDF e ZIP (catálogo, fichas técnicas, materiais para lojista) ficam no bucket público "materiais".
export const urlDoMaterial = (caminho: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/materiais/${caminho}`;
