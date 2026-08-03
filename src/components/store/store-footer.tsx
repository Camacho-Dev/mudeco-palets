import Link from "next/link";
import { BrandLogo } from "@/components/logo";
import { whatsappLink } from "@/lib/store";

export function StoreFooter({
  company,
}: {
  company: {
    name: string;
    slogan: string;
    phone: string;
    email: string;
    address: string;
  };
}) {
  return (
    <footer className="mt-auto bg-[#2f2018] text-[#faf6f1]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo width={100} height={125} className="mb-5 h-14 w-auto" />
          <p className="font-display text-2xl">{company.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
            {company.slogan}. Diseño sostenible con madera recuperada.
          </p>
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
              <Link href="/contacto" className="transition hover:text-white">
                Contacto
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
                href={whatsappLink(company.phone)}
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
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-[0.7rem] tracking-wide text-white/35">
        © {new Date().getFullYear()} {company.name} · República Dominicana
      </div>
    </footer>
  );
}
