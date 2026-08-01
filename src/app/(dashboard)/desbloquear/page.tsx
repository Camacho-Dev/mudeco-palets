import Link from "next/link";
import { requireSession } from "@/lib/session";
import { UnlockForm } from "./unlock-form";

export default async function DesbloquearPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await requireSession();
  const { next } = await searchParams;
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="card w-full p-6">
        <UnlockForm nextPath={nextPath} />
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Puedes seguir usando{" "}
          <Link href="/vender" className="underline">
            facturas
          </Link>
          ,{" "}
          <Link href="/clientes" className="underline">
            clientes
          </Link>{" "}
          y{" "}
          <Link href="/productos" className="underline">
            catálogo
          </Link>{" "}
          sin desbloquear.
        </p>
      </div>
    </div>
  );
}
