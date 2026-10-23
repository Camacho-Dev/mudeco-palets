import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";
import { formatCurrency } from "@/lib/format";
import { toggleEmployeeActive } from "./actions";
import { ConfirmForm } from "@/components/confirm-form";
import {
  Users,
  HardHat,
  BadgePercent,
  Wallet,
  Phone,
  MessageCircle,
  Plus,
  ShieldCheck,
  UserCheck,
  Building2,
  Truck,
  ArrowRight,
} from "lucide-react";

const DEPARTMENT_LABELS: Record<string, string> = {
  TALLER: "Taller / Producción",
  VENTAS: "Ventas & Mostrador",
  ADMINISTRACION: "Administración",
  LOGISTICA: "Logística & Entregas",
};

const DEPARTMENT_BADGES: Record<string, string> = {
  TALLER: "bg-amber-100 text-amber-900 border-amber-200",
  VENTAS: "bg-blue-100 text-blue-900 border-blue-200",
  ADMINISTRACION: "bg-purple-100 text-purple-900 border-purple-200",
  LOGISTICA: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export default async function EmpleadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string }>;
}) {
  await requireAdmin();
  const { q, dept } = await searchParams;
  const query = (q || "").trim();
  const departmentFilter = (dept || "").trim().toUpperCase();

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { idCard: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { position: { contains: query, mode: "insensitive" } },
      { department: { contains: query, mode: "insensitive" } },
    ];
  }
  if (departmentFilter && ["TALLER", "VENTAS", "ADMINISTRACION", "LOGISTICA"].includes(departmentFilter)) {
    whereClause.department = departmentFilter;
  }

  const [employees, allStats] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: [{ active: "desc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            workOrders: true,
            invoices: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        active: true,
        department: true,
        salary: true,
      },
    }),
  ]);

  const activeEmployees = allStats.filter((e) => e.active);
  const tallerCount = activeEmployees.filter((e) => e.department === "TALLER").length;
  const ventasCount = activeEmployees.filter((e) => e.department === "VENTAS").length;
  const totalPayroll = activeEmployees.reduce((acc, e) => acc + (e.salary || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Empleados"
        description={
          query || departmentFilter
            ? `Filtrando personal (${employees.length} resultados)`
            : "Directorio de recursos humanos, puestos de taller, sueldos y accesos"
        }
        action={
          <Link href="/empleados/nuevo" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Empleado
          </Link>
        }
      />

      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Personal Activo
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--wood-100)] text-[var(--wood-900)]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-3xl font-bold text-[var(--wood-950)]">
            {activeEmployees.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Total colaboradores registrados
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Taller & Carpintería
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
              <HardHat className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-3xl font-bold text-amber-900">
            {tallerCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Maestros ebanistas y ayudantes
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Ventas & Mostrador
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-900">
              <BadgePercent className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-3xl font-bold text-blue-900">
            {ventasCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Asesores comerciales y caja
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
              Nómina Base Mensual
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="font-display mt-2 text-2xl font-bold text-emerald-900">
            {formatCurrency(totalPayroll)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Presupuesto sueldos fijos activos
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <Suspense fallback={<div className="h-11 animate-pulse rounded-lg bg-white/60" />}>
          <ListSearchBar
            placeholder="Buscar empleado por nombre, cédula, cargo, departamento o correo…"
            ariaLabel="Buscar empleados"
          />
        </Suspense>

        {/* Quick Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mr-1">
            Departamento:
          </span>
          <Link
            href="/empleados"
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              !departmentFilter
                ? "bg-[var(--wood-950)] text-white shadow-xs"
                : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border border-stone-200"
            }`}
          >
            Todos ({allStats.length})
          </Link>
          {[
            { key: "TALLER", label: "Taller / Carpintería" },
            { key: "VENTAS", label: "Ventas & Mostrador" },
            { key: "ADMINISTRACION", label: "Administración" },
            { key: "LOGISTICA", label: "Logística" },
          ].map((d) => {
            const active = departmentFilter === d.key;
            const count = allStats.filter((e) => e.department === d.key).length;
            return (
              <Link
                key={d.key}
                href={`/empleados?dept=${d.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition border ${
                  active
                    ? "bg-[var(--wood-950)] text-white border-[var(--wood-950)] shadow-xs"
                    : "bg-white text-[var(--wood-800)] hover:bg-stone-100 border-stone-200"
                }`}
              >
                {d.label} ({count})
              </Link>
            );
          })}
        </div>
      </div>

      {/* Employees Table */}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Cédula / Documento</th>
              <th>Departamento & Cargo</th>
              <th>Contacto</th>
              <th>Sueldo / Comisión</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[var(--muted)]">
                  {query || departmentFilter
                    ? "No se encontraron empleados con los filtros aplicados"
                    : "No hay empleados registrados todavía. Haz clic en 'Nuevo Empleado' para agregar uno."}
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const initials = emp.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const rawDigits = (emp.phone || "").replace(/\D/g, "");
                const waUrl = rawDigits ? `https://wa.me/${rawDigits.length === 10 ? `1${rawDigits}` : rawDigits}` : null;
                const deptBadge = DEPARTMENT_BADGES[emp.department || "TALLER"] || "bg-stone-100 text-stone-800 border-stone-200";
                const deptLabel = DEPARTMENT_LABELS[emp.department || "TALLER"] || emp.department || "Taller";

                return (
                  <tr key={emp.id} className="hover:bg-stone-50/50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--wood-200)] text-xs font-bold text-[var(--wood-950)] border border-[var(--wood-300)]">
                          {initials}
                        </div>
                        <div>
                          <Link
                            href={`/empleados/${emp.id}`}
                            className="font-medium text-[var(--wood-950)] hover:text-[var(--accent)] hover:underline"
                          >
                            {emp.name}
                          </Link>
                          <div className="text-xs text-[var(--muted)] font-mono">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="font-mono text-xs text-stone-700">
                      {emp.idCard || "—"}
                    </td>

                    <td>
                      <div className="space-y-1">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[0.7rem] font-semibold ${deptBadge}`}>
                          {deptLabel}
                        </span>
                        {emp.position && (
                          <p className="text-xs font-medium text-stone-800">{emp.position}</p>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="space-y-1">
                        {emp.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-stone-700">
                            <Phone className="h-3 w-3 text-[var(--wood-700)]" />
                            <span>{emp.phone}</span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-800"
                                title="Abrir chat en WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="space-y-0.5 font-mono text-xs">
                        <div className="font-semibold text-[var(--wood-950)]">
                          {emp.salary ? formatCurrency(emp.salary) : "RD$ 0.00"}
                        </div>
                        {emp.commissionRate > 0 && (
                          <div className="text-[0.7rem] text-blue-700 font-sans font-medium">
                            +{(emp.commissionRate * 100).toFixed(1)}% comisiones
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      {emp.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/empleados/${emp.id}`}
                          className="btn btn-ghost text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <span>Ver Ficha</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                        <ConfirmForm
                          action={toggleEmployeeActive.bind(null, emp.id)}
                          message={`¿Deseas ${emp.active ? "desactivar" : "activar"} al empleado ${emp.name}?`}
                        >
                          <button
                            type="submit"
                            className="btn btn-ghost text-xs py-1 px-2 text-stone-500 hover:text-stone-800"
                            title={emp.active ? "Desactivar empleado" : "Activar empleado"}
                          >
                            {emp.active ? "Desactivar" : "Activar"}
                          </button>
                        </ConfirmForm>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
