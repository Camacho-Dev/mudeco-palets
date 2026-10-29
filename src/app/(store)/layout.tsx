import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { WhatsappFloating } from "@/components/store/whatsapp-floating";
import { StoreProviders } from "@/components/store/store-providers";
import { CartProvider } from "@/components/store/cart-context";
import { getStoreCompany } from "@/lib/store";
import { siteUrl } from "@/lib/store-info";
import { auth } from "@/lib/auth";
import { LoginPromptBanner } from "@/components/store/login-prompt-banner";
import "@/components/store/store.css";

// Revalidación dinámica instantánea de la tienda
export const dynamic = "force-dynamic";
export const revalidate = 0;

const storeDisplay = Cormorant_Garamond({
  variable: "--font-store-display",
  subsets: ["latin"],
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
    "Diseño, creatividad y sostenibilidad. Muebles únicos hechos con madera recuperada en República Dominicana. Catálogo exclusivo y cotizaciones a medida.",
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "Mudeco Palets",
    title: "Mudeco Palets — Muebles de madera recuperada",
    description:
      "Muebles de madera recuperada. Catálogo exclusivo y proyectos a medida en Santo Domingo.",
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
  const [company, session] = await Promise.all([
    getStoreCompany(),
    auth().catch(() => null),
  ]);
  const isLoggedIn = !!session?.user;

  return (
    <StoreProviders>
      <CartProvider>
        <div
          className={`${storeDisplay.variable} ${storeBody.variable} store-shell flex min-h-screen flex-col`}
        >
          <LoginPromptBanner isLoggedIn={isLoggedIn} />
          <StoreHeader />
          <main className="flex-1">{children}</main>
          <StoreFooter company={company} />
          <WhatsappFloating phone={company.phone} />
        </div>
      </CartProvider>
    </StoreProviders>
  );
}
