import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ParamValue = string | string[] | undefined;

/** Parse `?page=` into a 1-based positive integer. */
export function parsePage(value: ParamValue): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw || "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Clamp page to the available range and return prisma skip/take. */
export function pageWindow(page: number, total: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { current, totalPages, skip: (current - 1) * pageSize, take: pageSize };
}

function pageList(current: number, totalPages: number): (number | "…")[] {
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

const base =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brass)]";
const idle =
  "border-[var(--border)] bg-white text-[var(--wood-800)] hover:bg-[#fbf7f2]";
const active = "border-brand-brown bg-brand-brown text-white";
const disabled =
  "border-[var(--border)] bg-white text-[var(--muted)] opacity-50 cursor-not-allowed";

export function Pagination({
  basePath,
  searchParams,
  page,
  pageSize,
  total,
  className = "",
}: {
  basePath: string;
  /** Current search params; preserved in every link (except `page`). */
  searchParams: Record<string, ParamValue>;
  page: number;
  pageSize: number;
  total: number;
  className?: string;
}) {
  const { current, totalPages } = pageWindow(page, total, pageSize);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  function href(p: number) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v == null || v === "") continue;
      if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
      else q.set(k, v);
    }
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  return (
    <nav
      aria-label="Paginación"
      className={`mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row ${className}`}
    >
      <p className="text-sm text-[var(--muted)]" aria-live="polite">
        Mostrando <span className="font-semibold text-[var(--wood-900)]">{from}–{to}</span> de{" "}
        <span className="font-semibold text-[var(--wood-900)]">{total}</span>
      </p>
      {totalPages > 1 && (
        <ul className="flex flex-wrap items-center gap-1.5">
          <li>
            {current > 1 ? (
              <Link href={href(current - 1)} className={`${base} ${idle}`} aria-label="Página anterior" rel="prev">
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span className={`${base} ${disabled}`} aria-disabled="true" aria-label="Página anterior">
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </span>
            )}
          </li>
          {pageList(current, totalPages).map((p, i) =>
            p === "…" ? (
              <li key={`gap-${i}`} aria-hidden className="px-1 text-[var(--muted)]">
                …
              </li>
            ) : (
              <li key={p}>
                <Link
                  href={href(p)}
                  className={`${base} ${p === current ? active : idle}`}
                  aria-current={p === current ? "page" : undefined}
                  aria-label={`Página ${p}`}
                >
                  {p}
                </Link>
              </li>
            ),
          )}
          <li>
            {current < totalPages ? (
              <Link href={href(current + 1)} className={`${base} ${idle}`} aria-label="Página siguiente" rel="next">
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span className={`${base} ${disabled}`} aria-disabled="true" aria-label="Página siguiente">
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
