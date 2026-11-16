import { Star } from "lucide-react";

/** Estrellas de solo lectura; admite fracciones (4.5 ⇒ cuatro y media). */
export function StarRating({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${v.toLocaleString("es-DO", { maximumFractionDigits: 1 })} de 5 estrellas`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
            <Star className="absolute inset-0 text-[#e2d9cb]" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            {fill > 0 ? (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="text-brand-gold" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
