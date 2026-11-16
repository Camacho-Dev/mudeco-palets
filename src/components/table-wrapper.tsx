import type { ReactNode } from "react";

/**
 * Horizontal-scroll container for data tables. Reuses the global `.table-wrap`
 * class (overflow-x-auto, rounded border, surface background).
 */
export function TableWrapper({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name for the scroll region (keyboard users can focus and scroll). */
  label?: string;
}) {
  return (
    <div
      className={`table-wrap ${className}`}
      {...(label ? { role: "region", "aria-label": label, tabIndex: 0 } : {})}
    >
      {children}
    </div>
  );
}
