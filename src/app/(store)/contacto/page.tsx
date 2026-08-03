import { Reveal } from "@/components/store/store-motion";
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
    <div>
      <div className="relative overflow-hidden bg-[#2f2018] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url(/brand/store-hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#2f2018]/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
              Hablemos
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl">Contacto</h1>
            <p className="mt-3 max-w-lg text-white/65">
              Estamos para ayudarte a elegir la pieza ideal para tu espacio.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-2 border border-[var(--border)] bg-white p-2">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <Phone className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">
                  WhatsApp / Teléfono
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{company.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <Mail className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Email</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{company.email}</p>
              </div>
            </a>
            <div className="flex items-start gap-4 p-5">
              <MapPin className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Ubicación</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{company.address}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative flex min-h-[320px] flex-col justify-end overflow-hidden p-8 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/store-craft.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2f2018] via-[#2f2018]/55 to-transparent" />
            <div className="relative">
              <p className="font-display text-3xl">{company.name}</p>
              <p className="mt-2 max-w-sm text-white/70">{company.slogan}</p>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="store-cta store-cta-primary mt-8 w-fit"
              >
                Escribir ahora
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
