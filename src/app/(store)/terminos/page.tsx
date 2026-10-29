import { Reveal } from "@/components/store/store-motion";
import Link from "next/link";
import { STORE_LOGISTICS } from "@/lib/store-info";

export const metadata = { title: "Términos" };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Reveal>
        <h1 className="font-display text-4xl text-[var(--wood-950)]">
          Términos de compra
        </h1>
        <div className="mt-8 space-y-4 text-[var(--muted)] leading-relaxed">
          <p>
            Los precios publicados incluyen o detallan ITBIS según la ficha.
            Las piezas a medida requieren cotización previa.
          </p>
          <p>{STORE_LOGISTICS.pickup}</p>
          <p>{STORE_LOGISTICS.delivery}</p>
          <p>{STORE_LOGISTICS.leadTime}</p>
          <p>{STORE_LOGISTICS.payments}</p>
          <p>
            La madera recuperada puede variar en tono y veta; eso forma parte
            del carácter de cada pieza.
          </p>
        </div>
        <Link href="/contacto" className="mt-10 inline-block underline">
          Dudas · Contacto
        </Link>
      </Reveal>
    </div>
  );
}
