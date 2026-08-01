import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
};

/** Input con ícono a la izquierda (evita que .input pise el padding) */
export function IconField({ icon, className = "", ...props }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-[#7a6a5c] [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <input
        {...props}
        className={`w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pr-3 pl-10 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--wood-700)] focus:ring-[3px] focus:ring-[rgba(92,67,52,0.12)] ${className}`}
      />
    </div>
  );
}
