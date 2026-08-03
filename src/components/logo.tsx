/** Logo oficial. onDark=blanco (sidebar/login), onLight=marrón (fondos claros) */
export function BrandLogo({
  className = "",
  width = 160,
  height = 200,
  priority = false,
  tone = "onDark",
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  tone?: "onDark" | "onLight";
}) {
  const src =
    tone === "onLight" ? "/brand/logo-on-light.png" : "/brand/logo-clear.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Mudeco Palets"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

/** Marca Mudeco Palets — ícono de palet (SVG) */
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
      <rect x="6" y="6" width="52" height="8" rx="1.5" />
      <rect x="6" y="18" width="14" height="12" rx="1.5" />
      <rect x="27" y="18" width="10" height="12" rx="1.5" />
      <rect x="44" y="18" width="14" height="12" rx="1.5" />
      <rect x="6" y="34" width="52" height="8" rx="1.5" />
      <rect x="6" y="46" width="14" height="12" rx="1.5" />
      <rect x="27" y="46" width="10" height="12" rx="1.5" />
      <rect x="44" y="46" width="14" height="12" rx="1.5" />
    </svg>
  );
}

export function LogoStacked({
  className = "",
  width = 140,
}: {
  className?: string;
  color?: string;
  width?: number;
}) {
  return (
    <BrandLogo
      className={`rounded-xl ${className}`}
      width={width}
      height={Math.round(width * 1.25)}
    />
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

/** Contenedor de marca (sin caja negra) */
export function LogoPlate({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`overflow-hidden ${className}`}>{children}</div>;
}
