import Link from "next/link";
import { BrandLogo } from "@/components/logo";
import { STORE_HOURS, storeWhatsApp } from "@/lib/store-info";
import { STORE_CATEGORIES, STORE_SOCIAL } from "@/lib/store-brand";
import { ShieldCheck, Truck, CreditCard, Ruler } from "lucide-react";

function formatCategory(cat: string) {
  if (!cat) return "";
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

export function StoreFooter({
  company,
}: {
  company: {
    name: string;
    slogan: string;
    phone: string;
    email: string;
    address: string;
    taxId?: string | null;
  };
}) {
  const wa = storeWhatsApp(company.phone);

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#0f0f0f] text-white">
      <div className="mx-auto grid max-w-[1760px] gap-12 px-4 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12 xl:px-16">
        <div>
          <BrandLogo
            width={160}
            height={135}
            className="mb-6 h-[5.5rem] w-auto"
          />
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
            {company.slogan}. Diseño, creatividad y sostenibilidad en cada
            detalle.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href={STORE_SOCIAL.facebook}
              target="_blank"
              rel="noreferrer"
              className="text-white/60 transition hover:text-white"
            >
              Facebook
            </a>
            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-white/60 transition hover:text-white"
            >
              Instagram
            </a>
            <a
              href={STORE_SOCIAL.tiktok}
              target="_blank"
              rel="noreferrer"
              className="text-white/60 transition hover:text-white"
            >
              TikTok
            </a>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[0.65rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Navegación
          </p>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <Link href="/" className="transition hover:text-white">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="transition hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/nosotros" className="transition hover:text-white">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="transition hover:text-white">
                Contáctanos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[0.65rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Categorías
          </p>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm text-white/70">
            {STORE_CATEGORIES.slice(0, 10).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/catalogo?cat=${encodeURIComponent(cat)}`}
                  className="transition hover:text-white"
                >
                  {formatCategory(cat)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/catalogo"
                className="text-[#c9a15a] transition hover:text-white"
              >
                Ver todas →
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-[0.65rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Contacto
          </p>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                {company.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${company.email}`}
                className="transition hover:text-white"
              >
                {company.email}
              </a>
            </li>
            <li className="leading-relaxed text-white/50">{company.address}</li>
          </ul>
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center border border-[#c9a15a]/55 px-4 py-3.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[#c9a15a] uppercase transition duration-300 hover:bg-[#c9a15a] hover:text-[#0a0a0a]"
          >
            Escríbenos por WhatsApp
          </a>
          <p className="mt-6 text-[0.65rem] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Horario
          </p>
          <ul className="mt-2 space-y-1 text-sm text-white/60">
            {STORE_HOURS.map((h) => (
              <li key={h.day}>
                {h.day}: {h.hours}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Franja de Confianza y Métodos de Pago */}
      <div className="border-t border-white/[0.08] bg-[#0c0c0c] py-8">
        <div className="mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9a15a]/10 text-[#c9a15a] border border-[#c9a15a]/25">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[0.68rem]">
                  Garantía de Taller
                </p>
                <p className="mt-1 text-white/50 text-[0.72rem] leading-relaxed">
                  Madera de pino 100% curada contra humedad y plagas. Ensamble reforzado para décadas de uso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9a15a]/10 text-[#c9a15a] border border-[#c9a15a]/25">
                <Truck className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[0.68rem]">
                  Envíos & Retiro en Taller
                </p>
                <p className="mt-1 text-white/50 text-[0.72rem] leading-relaxed">
                  Retiro directo en Santo Domingo Oeste o entrega coordinada en Gran Santo Domingo y todo el país.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9a15a]/10 text-[#c9a15a] border border-[#c9a15a]/25">
                <CreditCard className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[0.68rem]">
                  Transferencias & Pagos
                </p>
                <p className="mt-1 text-white/50 text-[0.72rem] leading-relaxed">
                  Banco Popular, Banreservas, Banco BHD y pago contra entrega / en taller coordinado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9a15a]/10 text-[#c9a15a] border border-[#c9a15a]/25">
                <Ruler className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[0.68rem]">
                  Diseño a la Medida
                </p>
                <p className="mt-1 text-white/50 text-[0.72rem] leading-relaxed">
                  ¿Viste un modelo en fotos o Pinterest? Envíanos tus medidas para cotizarte sin compromiso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08] px-4 py-5 text-center text-[0.7rem] tracking-wide text-white/35">
        © {new Date().getFullYear()} {company.name} ·{" "}
        {company.taxId ? `RNC ${company.taxId}` : "República Dominicana"} · Todos los derechos
        reservados ·{" "}
        <Link href="/privacidad" className="hover:text-white transition">
          Privacidad
        </Link>{" "}
        ·{" "}
        <Link href="/terminos" className="hover:text-white transition">
          Términos
        </Link>
      </div>
    </footer>
  );
}
