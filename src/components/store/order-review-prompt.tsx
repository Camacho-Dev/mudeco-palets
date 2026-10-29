"use client";

import { useState, useTransition } from "react";
import { Star, Send, CheckCircle2, MessageSquareHeart, Sparkles, Loader2 } from "lucide-react";
import { submitCustomerReviewAction } from "@/app/(store)/testimonios/actions";

interface OrderReviewPromptProps {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName?: string;
  city?: string;
}

export function OrderReviewPrompt({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  productName,
  city = "República Dominicana",
}: OrderReviewPromptProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("customerName", customerName);
    formData.set("customerEmail", customerEmail);
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    formData.set("orderNumber", orderNumber);
    formData.set("webOrderId", orderId);
    if (productName) formData.set("productName", productName);
    if (city) formData.set("city", city);

    startTransition(async () => {
      const res = await submitCustomerReviewAction(formData);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || "No se pudo registrar tu opinión. Inténtalo de nuevo.");
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 p-6 text-center shadow-xs">
        <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-emerald-950">¡Gracias por tu testimonio!</h4>
        <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto leading-relaxed">
          Tu reseña con compra verificada ya está activa en tiempo real en nuestra tienda de Mudeco Palets.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#d6c4a8]/70 bg-gradient-to-b from-white to-[#faf6ef] p-6 shadow-xs sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b0894f]/15 text-[#8c6734]">
            <MessageSquareHeart className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[var(--wood-950)]">
              Califica tu experiencia con el taller
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Tu testimonio aparecerá en tiempo real con sello de compra verificada
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-900 border border-emerald-200">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          Compra Verificada
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            ¿Cómo calificarías la atención y el proceso?
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-[#c9a15a] transition hover:scale-120"
                title={`${star} estrellas`}
              >
                <Star
                  className={`h-6 w-6 ${
                    (hoverRating || rating) >= star
                      ? "fill-[#c9a15a] text-[#c9a15a]"
                      : "fill-stone-200 text-stone-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-mono text-sm font-bold text-[#8a6a3a]">
              {rating} de 5 estrellas
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-700 mb-1">
            Déjanos tu comentario o expectativa sobre tus piezas de madera de pino:
          </label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej. La atención por WhatsApp fue excelente y el proceso de pago fue muy claro. Espero con ansias ver el mueble en mi sala..."
            className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-[var(--wood-950)] placeholder-stone-400 focus:border-[#b0894f] focus:outline-hidden transition"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--muted)]">
            Se publicará como <strong className="text-[var(--wood-900)]">{customerName}</strong>
          </span>

          <button
            type="submit"
            disabled={isPending || !comment.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--wood-900)] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--wood-800)] disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publicar mi testimonio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
