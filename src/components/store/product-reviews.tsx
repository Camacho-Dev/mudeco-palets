"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, MessageSquareText, PenLine, Star } from "lucide-react";
import { StarRating } from "@/components/store/star-rating";
import { useSession } from "next-auth/react";
import {
  getMyProductReviewAction,
  submitProductReviewAction,
} from "@/app/(store)/producto/[id]/actions";
import type { ProductReview, RatingSummary } from "@/lib/product-reviews";

const PAGE = 5;
const LABELS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

export function ProductReviews({
  productId,
  productName,
  summary,
  reviews,
}: {
  productId: string;
  productName: string;
  summary: RatingSummary;
  reviews: ProductReview[];
}) {
  const reduce = useReducedMotion();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [open, setOpen] = useState(false);
  const [myReview, setMyReview] = useState<{ rating: number; comment: string } | null>(null);
  const [loadingMine, startMine] = useTransition();

  function toggleForm() {
    if (open) return setOpen(false);
    startMine(async () => {
      setMyReview(await getMyProductReviewAction(productId).catch(() => null));
      setOpen(true);
    });
  }
  const [visible, setVisible] = useState(PAGE);
  const hasReviews = summary.count > 0;

  return (
    <section id="resenas" aria-labelledby="resenas-title" className="mt-20 scroll-mt-28 border-t border-[var(--border)] pt-14">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Resumen */}
        <div className="lg:col-span-4">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
            Opiniones de clientes
          </p>
          <h2 id="resenas-title" className="font-display mt-2 text-3xl text-[var(--wood-950)]">
            ¿Qué opinan de esta pieza?
          </h2>

          {hasReviews ? (
            <div className="mt-6">
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl leading-none text-[var(--wood-950)] tabular-nums">
                  {summary.average.toLocaleString("es-DO", { minimumFractionDigits: 1 })}
                </span>
                <div className="pb-1">
                  <StarRating value={summary.average} size={18} />
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {summary.count} {summary.count === 1 ? "reseña" : "reseñas"}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-1.5" aria-label="Distribución de calificaciones">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const n = summary.distribution[stars - 1];
                  const pct = summary.count ? (n / summary.count) * 100 : 0;
                  return (
                    <li key={stars} className="flex items-center gap-3 text-xs">
                      <span className="flex w-7 shrink-0 items-center gap-0.5 text-[var(--muted)] tabular-nums">
                        {stars}
                        <Star className="h-3 w-3 text-brand-gold" fill="currentColor" strokeWidth={0} aria-hidden />
                      </span>
                      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#ece5da]">
                        <motion.span
                          className="absolute inset-y-0 left-0 rounded-full bg-brand-gold"
                          initial={reduce ? false : { width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          style={reduce ? { width: `${pct}%` } : undefined}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right text-[var(--muted)] tabular-nums">{n}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Aún no hay reseñas. ¿Tienes esta pieza? Sé el primero en contar cómo te fue.
            </p>
          )}

          <div className="mt-6">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={toggleForm}
                disabled={loadingMine}
                aria-expanded={open}
                aria-controls="form-resena"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--wood-950)] px-5 text-sm font-medium text-white transition-colors hover:bg-black active:scale-[0.98] cursor-pointer"
              >
                <PenLine className="h-4 w-4 text-brand-gold" aria-hidden />
                {loadingMine ? "Cargando…" : open ? "Cerrar" : "Escribir una reseña"}
              </button>
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/producto/${productId}#resenas`)}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 text-sm font-medium text-[var(--wood-950)] transition-colors hover:border-brand-gold"
              >
                <PenLine className="h-4 w-4 text-brand-gold-strong" aria-hidden />
                Inicia sesión para opinar
              </Link>
            )}
          </div>
        </div>

        {/* Formulario + lista */}
        <div className="lg:col-span-8">
          <AnimatePresence initial={false}>
            {open && isLoggedIn ? (
              <motion.div
                key="form"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <ReviewForm
                  key={myReview ? "edit" : "new"}
                  productId={productId}
                  productName={productName}
                  initial={myReview}
                  onDone={() => setOpen(false)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {hasReviews ? (
            <>
              <ul className="divide-y divide-[var(--border)]">
                {reviews.slice(0, visible).map((r) => (
                  <ReviewItem key={r.id} review={r} />
                ))}
              </ul>
              {reviews.length > visible ? (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="mt-4 inline-flex h-11 items-center rounded-full border border-[var(--border)] bg-white px-5 text-sm font-medium text-[var(--wood-950)] transition-colors hover:border-brand-gold cursor-pointer"
                >
                  Ver más reseñas ({reviews.length - visible})
                </button>
              ) : null}
            </>
          ) : !open ? (
            <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-white/60 px-6 py-10 text-center">
              <MessageSquareText className="h-6 w-6 text-brand-gold-strong" aria-hidden />
              <p className="mt-3 text-sm text-[var(--muted)]">Las opiniones de los clientes aparecerán aquí.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const date = new Date(review.createdAt).toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Santo_Domingo",
  });
  return (
    <li className="py-6 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating value={review.rating} size={14} />
        <span className="text-sm font-semibold text-[var(--wood-950)]">{review.customerName}</span>
        {review.isVerified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Compra verificada
          </span>
        ) : null}
        <span className="text-xs text-[var(--muted)]">{date}</span>
      </div>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--wood-800)]">{review.comment}</p>
      {review.officialReply ? (
        <div className="mt-3 rounded-xl border-l-2 border-brand-gold bg-[#faf6ef] px-4 py-3">
          <p className="text-xs font-semibold text-[var(--wood-950)]">Respuesta de Mudeco Palets</p>
          <p className="mt-1 text-sm text-[var(--wood-800)]">{review.officialReply}</p>
        </div>
      ) : null}
    </li>
  );
}

function ReviewForm({
  productId,
  productName,
  initial,
  onDone,
}: {
  productId: string;
  productName: string;
  initial: { rating: number; comment: string } | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const shown = hover || rating;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Elige de 1 a 5 estrellas.");
    if (comment.trim().length < 8) return setError("Cuéntanos un poco más (mínimo 8 caracteres).");
    start(async () => {
      const res = await submitProductReviewAction({ productId, rating, comment });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <form id="form-resena" onSubmit={submit} className="mb-8 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-6">
      <p className="text-sm font-semibold text-[var(--wood-950)]">Tu opinión sobre {productName}</p>

      <fieldset className="mt-4">
        <legend className="text-xs text-[var(--muted)]">Calificación</legend>
        <div
          role="radiogroup"
          aria-label="Calificación de 1 a 5 estrellas"
          className="mt-1.5 flex items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"} · ${LABELS[n]}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowUp") setRating(Math.min(5, (rating || 0) + 1));
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") setRating(Math.max(1, (rating || 2) - 1));
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Star
                className={`h-7 w-7 transition-colors ${n <= shown ? "text-brand-gold" : "text-[#e2d9cb]"}`}
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-[var(--muted)]" aria-live="polite">
            {LABELS[shown]}
          </span>
        </div>
      </fieldset>

      <label htmlFor="review-comment" className="mt-4 block text-xs text-[var(--muted)]">
        Comentario
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={600}
        rows={4}
        placeholder="¿Cómo quedó en tu espacio? ¿Qué te gustó del acabado y la madera?"
        className="input mt-1.5 resize-y"
      />
      <div className="mt-1 flex justify-between text-xs text-[var(--muted)]">
        <span role="alert" className="text-rose-700">{error}</span>
        <span className="tabular-nums">{comment.length}/600</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-[var(--wood-950)] px-6 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-60 cursor-pointer"
        >
          {pending ? "Publicando…" : initial ? "Guardar cambios" : "Publicar reseña"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-11 items-center rounded-full px-4 text-sm text-[var(--muted)] hover:text-[var(--wood-950)] cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
