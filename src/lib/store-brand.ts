/** Categorías reales activas del catálogo artesanal de Mudeco Palets */
export const STORE_CATEGORIES = [
  "BASE DE CAMA",
  "MESA DE COMEDOR",
  "MESA DE CENTRO",
  "GAVETEROS",
  "MESA DE NOCHE",
  "REPISA DE TV",
  "BANCO",
  "REPISA DE ENTRADA",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "BASE DE CAMA": "Bases de Cama",
  "MESA DE COMEDOR": "Mesas de Comedor",
  "MESA DE CENTRO": "Mesas de Centro",
  GAVETEROS: "Gaveteros",
  "MESA DE NOCHE": "Mesas de Noche",
  "REPISA DE TV": "Repisas de TV",
  BANCO: "Bancos",
  "REPISA DE ENTRADA": "Repisas de Entrada",
};

export function formatStoreCategory(cat: string): string {
  if (!cat) return "";
  const upper = cat.trim().toUpperCase();
  if (CATEGORY_LABELS[upper]) return CATEGORY_LABELS[upper];
  return cat
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (["de", "a", "y", "en", "con"].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/^./, (str) => str.toUpperCase());
}

export const STORE_SOCIAL = {
  facebook: "https://www.facebook.com/mudecopalets",
  instagram: "https://www.instagram.com/mudeco_palets/?hl=es",
  tiktok: "https://www.tiktok.com/@mudecopalets",
} as const;

export const STORE_BRAND = {
  about:
    "Es una marca revolucionaria en el diseño de muebles sostenibles que transforma madera reciclada en piezas únicas, funcionales y llenas de historia. Fusionando la autenticidad artesanal con la innovación circular, crea soluciones que no solo embellecen espacios, sino que también inspiran un estilo de vida más consciente. Cada mueble cuenta una historia de transformación, convirtiendo el descarte en arte y posicionando a Mudeco como un referente del diseño con propósito en América Latina.",
  mission:
    "Transformamos materiales reciclados en muebles funcionales y estéticamente atractivos, ofreciendo soluciones de diseño sostenible que reducen el impacto ambiental. Cada pieza, única y con carácter, enriquece los espacios de nuestros clientes, aportando historia y conciencia ecológica a su entorno.",
  vision:
    "Ser la empresa líder en la transformación de madera recuperada en América Latina, revolucionando el mobiliario y demostrando que sostenibilidad, diseño innovador y calidad superior pueden coexistir. Buscamos inspirar un cambio cultural hacia el consumo consciente y la valoración de lo artesanal.",
  values:
    "En Mudeco Palets nos guiamos por la sostenibilidad integral, cerrando ciclos y reduciendo la huella ecológica; la autenticidad artesanal, que celebra la imperfección y singularidad de la madera; la innovación circular, que convierte desechos en valor; y la calidad perdurable, que une tradición e innovación.",
  tagline: "Descubre diseño, creatividad y sostenibilidad en cada detalle.",
} as const;
