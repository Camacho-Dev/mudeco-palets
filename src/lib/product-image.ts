const CATEGORY_FALLBACK: Record<string, string> = {
  default: "/brand/store-craft.jpg",
  sala: "/brand/cat-mesa.jpg",
  comedor: "/brand/cat-mesa.jpg",
  "mesa de centro": "/brand/cat-mesa.jpg",
  "mesa de comedor": "/brand/cat-mesa.jpg",
  "repisa de tv": "/brand/cat-tv.jpg",
  "repisa de entrada": "/brand/cat-tv.jpg",
  "repisa de 3 gavetas": "/brand/cat-tv.jpg",
  muebles: "/brand/store-craft.jpg",
  vinera: "/brand/cat-vinera.jpg",
  dormitorio: "/brand/cat-noche.jpg",
  "mesa de noche": "/brand/cat-noche.jpg",
  "base de cama": "/brand/cat-noche.jpg",
  "base montessori": "/brand/cat-noche.jpg",
  banco: "/brand/cat-banco.jpg",
  butacas: "/brand/cat-banco.jpg",
  "silla haragana": "/brand/cat-banco.jpg",
  gaveteros: "/brand/cat-tv.jpg",
  viuro: "/brand/store-craft.jpg",
  oficina: "/brand/store-craft.jpg",
  "a medida": "/brand/store-craft.jpg",
};

export function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function productImage(
  product: { imageUrl?: string | null; category?: string | null; name?: string },
) {
  if (product.imageUrl && isSafeImageUrl(product.imageUrl)) {
    return product.imageUrl.trim();
  }
  const cat = (product.category || "").toLowerCase().trim();
  const name = (product.name || "").toLowerCase();
  if (CATEGORY_FALLBACK[cat]) return CATEGORY_FALLBACK[cat];
  for (const [key, src] of Object.entries(CATEGORY_FALLBACK)) {
    if (key !== "default" && (cat.includes(key) || name.includes(key))) {
      return src;
    }
  }
  return CATEGORY_FALLBACK.default;
}
