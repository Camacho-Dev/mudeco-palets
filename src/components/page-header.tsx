import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string } | ReactNode;
}) {
  const actionNode =
    action && typeof action === "object" && action !== null && "href" in action ? (
      <Link href={action.href} className="btn btn-primary">
        {action.label}
      </Link>
    ) : (
      action
    );

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actionNode ? <div className="flex flex-wrap gap-2.5 items-center">{actionNode}</div> : null}
    </div>
  );
}
