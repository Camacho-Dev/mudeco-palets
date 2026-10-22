import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";

export const metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl text-[var(--wood-950)]">
          Privacidad
        </h1>
        <div className="mt-8 space-y-4 text-[var(--muted)] leading-relaxed">
          <p>
            En Mudeco Palets usamos tus datos (nombre, email, teléfono y
            dirección) solo para atender pedidos, cotizaciones, reparaciones y
            consultas hechas por la web.
          </p>
          <p>
            No vendemos tu información. El acceso queda limitado al equipo del
            taller y a los sistemas necesarios (pago, correo, base de datos).
          </p>
          <p>
            Puedes pedir corrección o eliminación de tus datos escribiendo a
            nuestro correo de contacto.
          </p>
        </div>
        <Link href="/contacto" className="mt-10 inline-block underline">
          Contacto
        </Link>
      </Reveal>
    </div>
  );
}
