"use client";

import { useState } from "react";
import { MessageCircle, Send, X, Phone } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";

type WhatsAppShareProps = {
  customerName: string;
  phone?: string | null;
  type: "invoice" | "quote" | "creditNote";
  number: string;
  total: number;
  ncf?: string | null;
  validUntil?: Date | string | null;
  invoiceNumber?: string | null;
  companyName?: string;
};

/** Normaliza un teléfono dominicano al formato internacional E.164 (ej. +1809xxxxxxx) */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  // Si ya tiene código de país República Dominicana / USA (11 dígitos comenzando en 1)
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits;
  }
  // Si tiene 10 dígitos (ej. 809..., 829..., 849...)
  if (digits.length === 10) {
    return `1${digits}`;
  }
  return digits;
}

export function WhatsAppShareButton({
  customerName,
  phone,
  type,
  number,
  total,
  ncf,
  validUntil,
  invoiceNumber,
  companyName = "Mudeco Palets",
}: WhatsAppShareProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customPhone, setCustomPhone] = useState(phone || "");

  function buildMessage(): string {
    const formattedTotal = formatCurrency(total);
    if (type === "invoice") {
      const ncfText =
        ncf && !ncf.startsWith("PENDING:") ? `\n*NCF:* ${ncf}` : "";
      return (
        `*${companyName} · Factura de Compra*\n\n` +
        `Hola *${customerName}*,\n` +
        `Te compartimos el comprobante de tu compra en nuestro taller artesanal:\n\n` +
        `*Factura:* ${number}${ncfText}\n` +
        `*Monto Total:* ${formattedTotal}\n\n` +
        `Agradecemos tu preferencia por nuestros muebles en madera recuperada con alma de taller.\n` +
        `Si tienes alguna consulta sobre tu entrega o acabado, estamos a tu orden.`
      );
    }

    if (type === "creditNote") {
      const invRef = invoiceNumber ? `\n*Factura origen:* ${invoiceNumber}` : "";
      return (
        `*${companyName} · Nota de Crédito*\n\n` +
        `Hola *${customerName}*,\n` +
        `Te compartimos el comprobante de Nota de Crédito por ajuste o devolución:\n\n` +
        `*Nota de Crédito:* ${number}${invRef}\n` +
        `*Monto Acreditado:* ${formattedTotal}\n\n` +
        `El valor ha sido acreditado conforme a las políticas de nuestro taller artesanal.\n` +
        `Si tienes alguna duda, estamos a tu disposición.`
      );
    }

    const validityText = validUntil
      ? `\n*Válida hasta:* ${formatDate(validUntil)}`
      : "";
    return (
      `*${companyName} · Cotización de Proyecto*\n\n` +
      `Hola *${customerName}*,\n` +
      `Te presentamos la cotización personalizada para tu proyecto de mobiliario artesanal a la medida:\n\n` +
      `*Cotización:* ${number}\n` +
      `*Presupuesto Estimado:* ${formattedTotal}${validityText}\n\n` +
      `Cada pieza es fabricada a mano con materiales nobles y acabados profesionales. Quedamos atentos para afinar cualquier detalle e iniciar tu fabricación en el taller.`
    );
  }

  function handleSend(targetPhone?: string) {
    const p = targetPhone !== undefined ? targetPhone : phone;
    const cleanNumber = normalizePhone(p || "");
    const message = buildMessage();
    const encoded = encodeURIComponent(message);

    if (cleanNumber) {
      window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`, "_blank");
      setModalOpen(false);
    } else {
      setModalOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (phone && phone.trim()) {
            handleSend(phone);
          } else {
            setModalOpen(true);
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-100 hover:border-emerald-600/50 hover:shadow"
        title="Enviar comprobante o cotización por WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600 fill-emerald-600/20" />
        <span>WhatsApp</span>
      </button>

      {/* Modal para ingresar o editar teléfono si el cliente no lo tenía */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <MessageCircle className="h-5 w-5 fill-emerald-600/20" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--wood-950)] text-sm">
                    Compartir por WhatsApp
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-[var(--muted)]">
              Introduce el número de WhatsApp (ej. 809-555-1234) para enviar el mensaje con los datos del documento:
            </p>

            <div className="mb-4">
              <label className="label text-xs" htmlFor="wa-phone">
                Número de WhatsApp
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  id="wa-phone"
                  type="tel"
                  autoFocus
                  placeholder="809-000-0000"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend(customPhone);
                    }
                  }}
                  className="input pl-9 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSend(customPhone)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Abrir WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
