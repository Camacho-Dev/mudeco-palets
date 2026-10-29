import Link from "next/link";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { Lock, UserCheck, Database, MailCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad · Mudeco Palets",
  description:
    "Tratamiento responsable y protección de datos personales de nuestros clientes en República Dominicana.",
};

export default async function PrivacidadPage() {
  const company = await getStoreCompany();

  const items = [
    {
      icon: Database,
      title: "1. Datos que Recopilamos",
      body: "Recopilamos únicamente la información necesaria para procesar tus pedidos, cotizaciones a medida y facturación fiscal: nombre completo, correo electrónico, teléfono de contacto, dirección de entrega y, cuando solicitas comprobante fiscal (NCF B01), tu RNC o Cédula.",
    },
    {
      icon: Lock,
      title: "2. Uso y Seguridad de la Información",
      body: "Tus datos se utilizan exclusivamente para coordinar la fabricación, entrega, facturación y soporte postventa de tus muebles en Mudeco Palets. Las contraseñas se almacenan cifradas con algoritmos irreversibles (bcrypt) y las sesiones están protegidas mediante tokens firmados y cabeceras de seguridad.",
    },
    {
      icon: UserCheck,
      title: "3. Confidencialidad y No Comercialización",
      body: "No vendemos, alquilamos ni compartimos tu información personal con terceros con fines publicitarios. El acceso está estrictamente limitado al personal autorizado del taller y a los servicios técnicos indispensables (procesamiento de pagos y envío de confirmaciones por correo).",
    },
    {
      icon: MailCheck,
      title: "4. Derechos del Titular (Ley No. 172-13 RD)",
      body: `En cumplimiento con la Ley No. 172-13 sobre Protección de Datos de Carácter Personal de la República Dominicana, puedes solicitar en cualquier momento la consulta, actualización, rectificación o eliminación de tus datos personales escribiendo a ${company.email} o a través de nuestros canales oficiales de contacto.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="relative overflow-hidden border-b border-[#c9a15a]/25 bg-[#14100d] text-[#faf6f1]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
          <p className="text-[0.65rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
            Protección de Datos · Ley 172-13 RD
          </p>
          <h1 className="font-display mt-2 text-3xl text-white sm:text-5xl">
            Política de Privacidad
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Cómo protegemos tu información personal cuando cotizas o compras en{" "}
            {company.name}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <Reveal>
          <div className="space-y-5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <section
                  key={item.title}
                  className="rounded-2xl border border-[#e5d8c8] bg-white p-6 shadow-xs sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a15a]/35 bg-[#faf6f1] text-[#b0894f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-[var(--wood-950)]">
                        {item.title}
                      </h2>
                      <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5d8c8] bg-[#14100d] p-6 text-white">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#c9a15a] uppercase">
                Contacto de Privacidad
              </p>
              <p className="mt-1 text-xs text-white/75">
                {company.email} · {company.phone}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/terminos"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition hover:border-white/40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Términos de compra
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a15a] px-5 py-2.5 text-xs font-bold tracking-wider text-[#0f0f0f] uppercase transition hover:bg-[#d4b06e]"
              >
                Contacto
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
