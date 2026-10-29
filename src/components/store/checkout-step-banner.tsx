import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Carrito" },
  { num: 2, label: "Modalidad" },
  { num: 3, label: "Confirmación" },
] as const;

export function CheckoutStepBanner({
  step,
  badge,
  title,
  subtitle,
}: {
  step: 1 | 2 | 3;
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-[#c9a15a]/25 bg-[#14100d] text-[#faf6f1]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
              {badge}
            </p>
            <h1 className="font-display mt-2 text-3xl text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/70">{subtitle}</p>
          </div>

          <ol className="flex items-center gap-2 sm:gap-3">
            {STEPS.map((s, idx) => {
              const done = s.num < step;
              const current = s.num === step;
              return (
                <li key={s.num} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                        done
                          ? "bg-emerald-500 text-black"
                          : current
                            ? "bg-[#c9a15a] text-[#0f0f0f] ring-4 ring-[#c9a15a]/20"
                            : "border border-white/20 bg-white/[0.04] text-white/45"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : s.num}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wider uppercase ${
                        current
                          ? "text-[#c9a15a]"
                          : done
                            ? "text-white/85"
                            : "text-white/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 ? (
                    <span
                      className={`h-[1px] w-4 sm:w-7 ${
                        done ? "bg-emerald-500/60" : "bg-white/15"
                      }`}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
