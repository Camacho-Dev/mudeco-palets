/** Marca Mudeco Palets — SVG limpio sin fondo blanco */
export function LogoMark({
  className = "h-10 w-10",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Nivel superior — palet */}
      <rect x="6" y="6" width="52" height="8" rx="1.5" />
      <rect x="6" y="18" width="14" height="12" rx="1.5" />
      <rect x="27" y="18" width="10" height="12" rx="1.5" />
      <rect x="44" y="18" width="14" height="12" rx="1.5" />
      {/* Nivel inferior — palet */}
      <rect x="6" y="34" width="52" height="8" rx="1.5" />
      <rect x="6" y="46" width="14" height="12" rx="1.5" />
      <rect x="27" y="46" width="10" height="12" rx="1.5" />
      <rect x="44" y="46" width="14" height="12" rx="1.5" />
    </svg>
  );
}

export function LogoStacked({
  className = "",
  color = "#3d2a1f",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoMark className="h-14 w-14" color={color} />
      <p
        className="mt-3 font-display text-3xl font-bold tracking-wide uppercase"
        style={{ color }}
      >
        Mudeco
      </p>
      <p
        className="mt-0.5 text-[0.7rem] font-light tracking-[0.45em] uppercase"
        style={{ color }}
      >
        Palets
      </p>
    </div>
  );
}

export function LogoHorizontal({
  className = "",
  color = "#3d2a1f",
  markClassName = "h-9 w-9",
}: {
  className?: string;
  color?: string;
  markClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className={markClassName} color={color} />
      <div className="leading-none">
        <p
          className="text-lg font-bold tracking-wide uppercase"
          style={{ color, fontFamily: "var(--font-body), system-ui, sans-serif" }}
        >
          Mudeco
          <span
            className="ml-1.5 font-light tracking-[0.28em]"
            style={{ fontWeight: 300 }}
          >
            Palets
          </span>
        </p>
      </div>
    </div>
  );
}

/** Contenedor blanco para logos sobre fondos oscuros */
export function LogoPlate({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
