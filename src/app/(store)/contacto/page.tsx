import { FadeIn } from "@/components/motion";
import { getStoreCompany, whatsappLink } from "@/lib/store";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contacto",
};

export default async function ContactoPage() {
  const company = await getStoreCompany();
  const wa = whatsappLink(
    company.phone,
    `Hola ${company.name}, me gustaría más información sobre sus muebles.`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <FadeIn>
        <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
          Hablemos
        </p>
        <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
          Contacto
        </h1>
        <p className="mt-2 max-w-xl text-[var(--muted)]">
          Estamos para ayudarte a elegir la pieza ideal para tu espacio.
        </p>
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <FadeIn delay={0.08}>
          <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-[#fbf7f2]"
            >
              <Phone className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">WhatsApp / Teléfono</p>
                <p className="text-sm text-[var(--muted)]">{company.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-[#fbf7f2]"
            >
              <Mail className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Email</p>
                <p className="text-sm text-[var(--muted)]">{company.email}</p>
              </div>
            </a>
            <div className="flex items-start gap-3 rounded-xl p-3">
              <MapPin className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Ubicación</p>
                <p className="text-sm text-[var(--muted)]">{company.address}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.16}>
          <div
            className="flex min-h-[280px] flex-col justify-end rounded-2xl p-8 text-white"
            style={{
              background:
                "linear-gradient(145deg, #5c4334 0%, #3d2a1f 50%, #b0894f 160%)",
            }}
          >
            <p className="font-display text-3xl">{company.name}</p>
            <p className="mt-2 max-w-sm text-white/75">{company.slogan}</p>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-fit rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#3d2a1f] transition hover:bg-[#faf6f1]"
            >
              Escribir ahora
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
