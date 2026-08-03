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
    <footer className="mt-auto border-t border-[var(--border)] bg-[#3d2a1f] text-[#faf6f1]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLogo width={120} height={150} className="mb-4 h-16 w-auto" />
          <p className="font-display text-lg">{company.name}</p>
          <p className="mt-1 text-sm text-white/60">{company.slogan}</p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-white/40 uppercase">
            Explorar
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <Link href="/" className="hover:text-white">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-white">
                Contacto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-white/40 uppercase">
            Contacto
          </p>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <a
                href={whatsappLink(company.phone)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                {company.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${company.email}`}
                className="hover:text-white"
              >
                {company.email}
              </a>
            </li>
            <li className="text-white/55">{company.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {company.name}. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
