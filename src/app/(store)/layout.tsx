import type { Metadata } from "next";
import { StoreHeader } from "@/components/store/store-header";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreProviders } from "@/components/store/store-providers";
import { getStoreCompany } from "@/lib/store";

export const metadata: Metadata = {
  title: {
    default: "Mudeco Palets — Muebles de madera recuperada",
    template: "%s · Mudeco Palets",
  },
  description:
    "Diseño, creatividad y sostenibilidad. Muebles únicos hechos con madera recuperada en República Dominicana.",
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = await getStoreCompany();

  return (
    <StoreProviders>
      <div className="flex min-h-screen flex-col bg-[#f7f2eb]">
        <StoreHeader />
        <main className="flex-1">{children}</main>
        <StoreFooter company={company} />
      </div>
    </StoreProviders>
  );
}
