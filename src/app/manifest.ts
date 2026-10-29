import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mudeco Palets — Muebles de Madera Recuperada",
    short_name: "Mudeco Palets",
    description:
      "Diseño, creatividad y sostenibilidad. Muebles únicos hechos con madera recuperada en República Dominicana.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/brand/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
