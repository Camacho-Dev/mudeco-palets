import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-display",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL ||
      "https://mudeco-palets.vercel.app",
  ),
  title: "Mudeco Palets — Muebles de madera recuperada",
  description:
    "Diseño, creatividad y sostenibilidad. Muebles únicos hechos con madera recuperada en República Dominicana.",
  authors: [{ name: "Brayan Camacho" }],
  creator: "Brayan Camacho",
  publisher: "Mudeco Palets",
  openGraph: {
    type: "website",
    locale: "es_DO",
    siteName: "Mudeco Palets",
    images: [{ url: "/brand/store-hero.jpg", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sourceSans.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
