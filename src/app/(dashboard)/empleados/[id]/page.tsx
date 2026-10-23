import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { updateEmployee, toggleEmployeeActive, setEmployeePassword } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";
import { PrintActionButton } from "@/components/print-action-button";
import {
  ArrowLeft,
  User,
  Briefcase,
  Wallet,
  Shield,
  Phone,
  MessageCircle,
  Calendar,
  Lock,
  Building2,
  HardHat,
  FileText,
  AlertCircle,
  Factory,
} from "lucide-react";

const DEPARTMENT_BADGES: Record<string, string> = {
  TALLER: "bg-amber-100 text-amber-900 border-amber-200",
  VENTAS: "bg-blue-100 text-blue-900 border-blue-200",
  ADMINISTRACION: "bg-purple-100 text-purple-900 border-purple-200",
  LOGISTICA: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export default async function EmpleadoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const emp = await prisma.user.findUnique({
    where: { id },
    include: {
      workOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { product: true },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        take: 10,
        include: { customer: true },
      },
    },
  });

  if (!emp) notFound();

  const initials = emp.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const rawDigits = (emp.phone || "").replace(/\D/g, "");
  const waUrl = rawDigits
    ? `https://wa.me/${rawDigits.length === 10 ? `1${rawDigits}` : rawDigits}`
    : null;

  const updateAction = updateEmployee.bind(null, id);
  const passwordAction = setEmployeePassword.bind(null, id);
  const toggleActiveAction = toggleEmployeeActive.bind(null, id);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/empleados"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[var(--muted)] uppercase transition hover:text-[var(--wood-900)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Directorio de Empleados
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-xs inline-flex items-center gap-1.5 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              WhatsApp
            </a>
          )}
          <PrintActionButton
            label="Imprimir Ficha Laboral"
            className="btn btn-secondary text-xs"
          />
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="card p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--wood-200)] text-xl font-bold text-[var(--wood-950)] border-2 border-[var(--wood-300)] shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-[var(--wood-950)]">
                  {emp.name}
                </h2>
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                    DEPARTMENT_BADGES[emp.department || "TALLER"] ||
                    "bg-stone-100 text-stone-800 border-stone-200"
                  }`}
                >
                  {emp.department || "TALLER"}
                </span>
                {emp.active ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Inactivo
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-stone-700">
                {emp.position || "Colaborador de Mudeco Palets"} ·{" "}
                <span className="font-mono text-xs text-[var(--muted)]">
                  {emp.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
            {emp.hireDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[var(--wood-700)]" />
                <span>Ingreso: {formatDate(emp.hireDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[var(--wood-700)]" />
              <span>Rol ERP: {emp.role === "ADMIN" ? "Administrador" : "Vendedor / Operador"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Sueldo Base Mensual
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-[var(--wood-950)]">
            {formatCurrency(emp.salary || 0)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {emp.bankName || "Pago directo"}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Comisión por Ventas
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-blue-900">
            {((emp.commissionRate || 0) * 100).toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Sobre facturas cobradas
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Órdenes en Taller
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-amber-900">
            {emp.workOrders.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Asignadas o completadas
          </p>
        </div>

        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Facturas Emitidas
          </p>
          <p className="font-display mt-1 text-2xl font-bold text-emerald-900">
            {emp.invoices.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Ventas registradas
          </p>
        </div>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Full Employee Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 shadow-xs">
            <h3 className="font-display text-base font-bold text-[var(--wood-950)] mb-4 pb-2 border-b border-stone-200">
              Editar Datos del Empleado
            </h3>

            <form action={updateAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Nombre Completo</label>
                  <input
                    name="name"
                    defaultValue={emp.name}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Cédula / Documento</label>
                  <input
                    name="idCard"
                    defaultValue={emp.idCard || ""}
                    placeholder="001-1234567-8"
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Teléfono / WhatsApp</label>
                  <input
                    name="phone"
                    defaultValue={emp.phone || ""}
                    placeholder="809-555-0123"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Correo Electrónico (Login)</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={emp.email}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Departamento</label>
                  <select
                    name="department"
                    defaultValue={emp.department || "TALLER"}
                    className="input"
                  >
                    <option value="TALLER">Taller / Carpintería</option>
                    <option value="VENTAS">Ventas & Mostrador</option>
                    <option value="ADMINISTRACION">Administración</option>
                    <option value="LOGISTICA">Logística & Entregas</option>
                  </select>
                </div>

                <div>
                  <label className="label">Cargo / Especialidad</label>
                  <input
                    name="position"
                    defaultValue={emp.position || ""}
                    placeholder="Ej. Maestro Ebanista"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Sueldo Base Mensual (DOP)</label>
                  <input
                    name="salary"
                    type="number"
                    step="0.01"
                    defaultValue={emp.salary || 0}
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Comisión por Ventas (%)</label>
                  <input
                    name="commissionRate"
                    type="number"
                    step="0.1"
                    defaultValue={(emp.commissionRate || 0) * 100}
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Banco para Nómina</label>
                  <input
                    name="bankName"
                    defaultValue={emp.bankName || ""}
                    placeholder="Popular, Banreservas, BHD..."
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Número de Cuenta Bancaria</label>
                  <input
                    name="bankAccount"
                    defaultValue={emp.bankAccount || ""}
                    placeholder="No. de cuenta"
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="label">Fecha de Ingreso</label>
                  <input
                    name="hireDate"
                    type="date"
                    defaultValue={
                      emp.hireDate
                        ? new Date(emp.hireDate).toISOString().split("T")[0]
                        : ""
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Rol en el Software ERP</label>
                  <select name="role" defaultValue={emp.role} className="input">
                    <option value="VENDEDOR">Vendedor / Operador (POS y órdenes)</option>
                    <option value="ADMIN">Administrador (Acceso total)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Dirección Residencial</label>
                  <input
                    name="address"
                    defaultValue={emp.address || ""}
                    placeholder="Dirección física del colaborador"
                    className="input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Contacto de Emergencia</label>
                  <input
                    name="emergencyContact"
                    defaultValue={emp.emergencyContact || ""}
                    placeholder="Familiar cercano y teléfono"
                    className="input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Notas y Observaciones de RRHH</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={emp.notes || ""}
                    placeholder="Comentarios internos sobre desempeño, capacitaciones o acuerdos"
                    className="input"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios del Empleado
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security, Password & Activity */}
        <div className="space-y-6">
          {/* Password Reset Card */}
          <div className="card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Lock className="h-4 w-4 text-[var(--wood-800)]" />
              <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
                Seguridad y Contraseña
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Restablece la clave de acceso de {emp.name} para ingresar al sistema.
            </p>

            <form action={passwordAction} className="space-y-3">
              <div>
                <label className="label">Nueva Contraseña</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="input text-xs"
                />
              </div>
              <button type="submit" className="btn btn-secondary w-full text-xs">
                Actualizar Contraseña
              </button>
            </form>

            <div className="pt-3 border-t border-stone-200">
              <ConfirmForm
                action={toggleActiveAction}
                title={emp.active ? "Desactivar empleado" : "Activar empleado"}
                message={`¿Deseas ${emp.active ? "desactivar" : "activar"} al colaborador ${emp.name}?`}
                isDestructive={emp.active}
              >
                <button
                  type="submit"
                  className={`btn w-full text-xs ${
                    emp.active
                      ? "btn-ghost text-rose-600 hover:bg-rose-50"
                      : "btn-secondary text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {emp.active ? "Desactivar Cuenta del Empleado" : "Reactivar Cuenta"}
                </button>
              </ConfirmForm>
            </div>
          </div>

          {/* Activity: Workshop Work Orders */}
          {emp.workOrders.length > 0 && (
            <div className="card p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="font-display text-sm font-bold text-[var(--wood-950)] flex items-center gap-1.5">
                  <Factory className="h-4 w-4 text-[var(--wood-800)]" />
                  Producción en Taller
                </h4>
                <Link
                  href="/fabricacion"
                  className="text-xs text-[var(--wood-800)] hover:underline"
                >
                  Ver todas
                </Link>
              </div>

              <div className="space-y-2">
                {emp.workOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between rounded-lg border border-stone-200 p-2.5 text-xs"
                  >
                    <div>
                      <Link
                        href={`/fabricacion/${wo.id}`}
                        className="font-mono font-semibold text-[var(--wood-950)] hover:underline"
                      >
                        {wo.number}
                      </Link>
                      <p className="text-stone-600 truncate max-w-[160px]">
                        {wo.quantity} {wo.product.unit} {wo.product.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                        wo.status === "DONE"
                          ? "bg-emerald-100 text-emerald-800"
                          : wo.status === "CANCELLED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {wo.status === "DONE"
                        ? "Completada"
                        : wo.status === "CANCELLED"
                          ? "Cancelada"
                          : "En Taller"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity: Invoices / Sales */}
          {emp.invoices.length > 0 && (
            <div className="card p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="font-display text-sm font-bold text-[var(--wood-950)] flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[var(--wood-800)]" />
                  Facturas Generadas
                </h4>
                <Link
                  href="/facturas"
                  className="text-xs text-[var(--wood-800)] hover:underline"
                >
                  Ver todas
                </Link>
              </div>

              <div className="space-y-2">
                {emp.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-lg border border-stone-200 p-2.5 text-xs"
                  >
                    <div>
                      <Link
                        href={`/facturas/${inv.id}`}
                        className="font-mono font-semibold text-[var(--wood-950)] hover:underline"
                      >
                        {inv.number}
                      </Link>
                      <p className="text-stone-600 truncate max-w-[160px]">
                        {inv.customer.name}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-[var(--wood-950)]">
                      {formatCurrency(inv.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
