import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreProviders } from "@/components/store/store-providers";
import { CartProvider } from "@/components/store/cart-context";
import { getStoreCompany } from "@/lib/store";
import { siteUrl } from "@/lib/store-info";
import "@/components/store/store.css";

export const dynamic = "force-dynamic";

const storeDisplay = Cormorant_Garamond({
  variable: "--font-store-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const storeBody = Inter({
  variable: "--font-store-body",
  subsets: ["latin"],
});

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "Mudeco Palets — Muebles de madera recuperada",
    template: "%s · Mudeco Palets",
  },
  description:
    "Diseño, creatividad y sostenibilidad. Muebles únicos hechos con madera recuperada en República Dominicana. Catálogo, reparaciones y cotizaciones a medida.",
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "Mudeco Palets",
    title: "Mudeco Palets — Muebles de madera recuperada",
    description:
      "Muebles de madera recuperada. Catálogo, reparaciones y proyectos a medida en Santo Domingo.",
    url: base,
    images: [
      {
        url: "/brand/store-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Mudeco Palets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mudeco Palets",
    description:
      "Muebles de madera recuperada en República Dominicana.",
    images: ["/brand/store-hero.jpg"],
  },
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = await getStoreCompany();

  return (
    <StoreProviders>
      <CartProvider>
        <div
          className={`${storeDisplay.variable} ${storeBody.variable} store-shell flex min-h-screen flex-col`}
        >
          <StoreHeader />
          <main className="flex-1">{children}</main>
          <StoreFooter company={company} />
        </div>
      </CartProvider>
    </StoreProviders>
  );
}
