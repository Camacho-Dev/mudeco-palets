export type PeriodKind =
  | "all"
  | "month"
  | "q1" // días 1–15
  | "q2" // día 16–fin de mes
  | "last15"
  | "custom";

export type DateRange = {
  kind: PeriodKind;
  /** YYYY-MM cuando aplica */
  month?: string;
  from: Date | null;
  to: Date | null;
  label: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return null;
  return { year: y, month: m - 1 };
}

function monthTitle(ym: string) {
  const p = parseMonth(ym);
  if (!p) return ym;
  return new Intl.DateTimeFormat("es-DO", {
    month: "long",
    year: "numeric",
  }).format(new Date(p.year, p.month, 1));
}

export function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function buildDateRange(params: {
  kind?: string | null;
  month?: string | null;
  from?: string | null;
  to?: string | null;
}): DateRange {
  const now = new Date();
  const kind = (params.kind || "month") as PeriodKind;
  const month = params.month || currentMonthKey(now);

  if (kind === "all") {
    return {
      kind: "all",
      from: null,
      to: null,
      label: "Todo el historial",
    };
  }

  if (kind === "last15") {
    const to = endOfDay(now);
    const from = startOfDay(new Date(now));
    from.setDate(from.getDate() - 14);
    return {
      kind: "last15",
      from,
      to,
      label: "Últimos 15 días",
    };
  }

  if (kind === "custom" && params.from && params.to) {
    const from = startOfDay(new Date(params.from + "T00:00:00"));
    const to = endOfDay(new Date(params.to + "T00:00:00"));
    return {
      kind: "custom",
      from,
      to,
      label: `${params.from} → ${params.to}`,
    };
  }

  const parsed = parseMonth(month);
  if (!parsed) {
    return buildDateRange({ kind: "month", month: currentMonthKey() });
  }

  const { year, month: m } = parsed;
  const title = monthTitle(month);

  if (kind === "q1") {
    return {
      kind: "q1",
      month,
      from: startOfDay(new Date(year, m, 1)),
      to: endOfDay(new Date(year, m, 15)),
      label: `1–15 ${title}`,
    };
  }

  if (kind === "q2") {
    const last = new Date(year, m + 1, 0).getDate();
    return {
      kind: "q2",
      month,
      from: startOfDay(new Date(year, m, 16)),
      to: endOfDay(new Date(year, m, last)),
      label: `16–${last} ${title}`,
    };
  }

  // month completo
  return {
    kind: "month",
    month,
    from: startOfDay(new Date(year, m, 1)),
    to: endOfDay(new Date(year, m + 1, 0)),
    label: title.charAt(0).toUpperCase() + title.slice(1),
  };
}

export function inRange(date: Date, range: DateRange) {
  if (!range.from || !range.to) return true;
  const t = date.getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

export function toInputDate(d: Date | null) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const DATE_FILTER_STORAGE_KEY = "mudeco-date-filter";

export type StoredDateFilter = {
  kind: PeriodKind;
  month?: string;
  from?: string;
  to?: string;
};

export function monthOptions(count = 18) {
  const now = new Date();
  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = currentMonthKey(d);
    opts.push({
      value,
      label: monthTitle(value).replace(/^\w/, (c) => c.toUpperCase()),
    });
  }
  return opts;
}
