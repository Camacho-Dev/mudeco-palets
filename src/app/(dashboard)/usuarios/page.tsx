import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { toggleUserActive, setUserPassword } from "./actions";
import { ConfirmForm } from "@/components/confirm-form";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description={
          query
            ? `Resultados para “${query}”`
            : "Empleados y administradores del sistema"
        }
        action={
          <Link href="/usuarios/nuevo" className="btn btn-primary">
            Nuevo usuario
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por nombre, email o rol…"
          ariaLabel="Buscar usuarios"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Comisión %</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron usuarios para “${query}”`
                    : "No hay usuarios"}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.commissionRate}</td>
                  <td>{u.active ? "Activo" : "Inactivo"}</td>
                  <td className="space-y-2">
                    <ConfirmForm
                      action={toggleUserActive.bind(null, u.id)}
                      message={`¿${u.active ? "Desactivar" : "Activar"} a ${u.name}?`}
                    >
                      <button type="submit" className="btn btn-ghost text-xs">
                        {u.active ? "Desactivar" : "Activar"}
                      </button>
                    </ConfirmForm>
                    <form action={setUserPassword} className="flex gap-1">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="password"
                        type="password"
                        placeholder="Nueva clave"
                        className="input h-8 text-xs"
                        minLength={6}
                        required
                      />
                      <button type="submit" className="btn btn-ghost text-xs">
                        Guardar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
