import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/format";

const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Inicio de sesión",
  UNLOCK_SENSITIVE: "Desbloqueo privado",
  UNLOCK_DENIED: "Desbloqueo denegado",
  LOCK_SENSITIVE: "Bloqueo privado",
  CREATE: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
  DEACTIVATE: "Desactivación",
  VOID: "Anulación",
  PAYMENT: "Pago",
  STOCK: "Inventario",
  ISSUE: "Emisión",
  CONVERT: "Conversión",
  RECEIVE: "Recepción compra",
  CREDIT_NOTE: "Nota de crédito",
  COMPLETE: "Fabricación",
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; action?: string; q?: string }>;
}) {
  await requireSession();
  const sp = await searchParams;

  const logs = await prisma.auditLog.findMany({
    where: {
      AND: [
        sp.user ? { userEmail: { contains: sp.user, mode: "insensitive" } } : {},
        sp.action ? { action: sp.action } : {},
        sp.q
          ? {
              OR: [
                { summary: { contains: sp.q, mode: "insensitive" } },
                { entity: { contains: sp.q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const actions = Object.keys(ACTION_LABELS);

  return (
    <div>
      <PageHeader
        title="Historial de actividad"
        description="Registro de lo que hace cada usuario en el sistema"
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          name="user"
          defaultValue={sp.user || ""}
          placeholder="Email usuario"
          className="input h-9 w-44 text-sm"
        />
        <select
          name="action"
          defaultValue={sp.action || ""}
          className="input h-9 w-44 text-sm"
        >
          <option value="">Todas las acciones</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Buscar en detalle…"
          className="input h-9 flex-1 text-sm"
        />
        <button type="submit" className="btn btn-secondary h-9">
          Filtrar
        </button>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[var(--muted)]">
                  Aún no hay actividad registrada
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap text-xs">
                    {formatDate(log.createdAt)}
                    <div className="text-[0.65rem] text-[var(--muted)]">
                      {log.createdAt.toLocaleTimeString("es-DO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">
                      {log.userName || "Sistema"}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {log.userEmail || "—"}
                    </div>
                  </td>
                  <td>
                    <span className="rounded-md bg-[#f3ebe3] px-2 py-0.5 text-xs font-medium text-[var(--wood-800)]">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <div className="mt-1 text-[0.65rem] text-[var(--muted)]">
                      {log.entity}
                      {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                    </div>
                  </td>
                  <td className="max-w-md text-sm">{log.summary}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
