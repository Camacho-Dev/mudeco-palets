import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createEmployee } from "../actions";
import { ArrowLeft, User, Briefcase, Wallet, Shield } from "lucide-react";

export default async function NuevoEmpleadoPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/empleados"
        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[var(--muted)] uppercase transition hover:text-[var(--wood-900)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Empleados
      </Link>

      <PageHeader
        title="Nuevo Empleado"
        description="Ficha de alta laboral, información de contacto, nómina y credenciales de acceso"
      />

      <form action={createEmployee} className="space-y-8">
        {/* 1. Datos Personales */}
        <div className="card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <User className="h-4 w-4 text-[var(--wood-800)]" />
            <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
              1. Datos Personales y de Contacto
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Nombre Completo <span className="text-rose-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Ej. Juan Pérez Martínez"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="idCard">
                Cédula de Identidad / Documento
              </label>
              <input
                id="idCard"
                name="idCard"
                placeholder="Ej. 001-1234567-8"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="label" htmlFor="phone">
                Teléfono / WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Ej. 809-555-0199"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="email">
                Correo Electrónico <span className="text-rose-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="juan@mudeco.com"
                className="input"
              />
              <p className="mt-1 text-[0.7rem] text-[var(--muted)]">
                Utilizado para inicio de sesión en el sistema
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">
                Dirección Residencial
              </label>
              <input
                id="address"
                name="address"
                placeholder="Calle, sector, municipio (ej: Herrera, Santo Domingo Oeste)"
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="emergencyContact">
                Contacto de Emergencia
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                placeholder="Nombre, parentesco y teléfono (ej. María Pérez - Esposa 829-555-0144)"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* 2. Información del Puesto */}
        <div className="card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <Briefcase className="h-4 w-4 text-[var(--wood-800)]" />
            <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
              2. Puesto de Trabajo y Departamento en Mudeco
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="department">
                Departamento <span className="text-rose-600">*</span>
              </label>
              <select id="department" name="department" defaultValue="TALLER" className="input">
                <option value="TALLER">Taller / Carpintería</option>
                <option value="VENTAS">Ventas & Mostrador</option>
                <option value="ADMINISTRACION">Administración & Finanzas</option>
                <option value="LOGISTICA">Logística & Entregas</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="position">
                Cargo / Especialidad
              </label>
              <input
                id="position"
                name="position"
                placeholder="Ej. Maestro Ebanista, Lijador, Asesor"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="hireDate">
                Fecha de Ingreso
              </label>
              <input
                id="hireDate"
                name="hireDate"
                type="date"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* 3. Compensación y Nómina */}
        <div className="card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <Wallet className="h-4 w-4 text-[var(--wood-800)]" />
            <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
              3. Compensación, Sueldo y Cuenta Bancaria
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label" htmlFor="salary">
                Sueldo Base Mensual (DOP)
              </label>
              <input
                id="salary"
                name="salary"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej. 25000"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="label" htmlFor="commissionRate">
                Comisión por Ventas (%)
              </label>
              <input
                id="commissionRate"
                name="commissionRate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="Ej. 3.0"
                className="input font-mono"
              />
              <p className="mt-1 text-[0.7rem] text-[var(--muted)]">
                Aplica a facturas emitidas por este usuario
              </p>
            </div>

            <div>
              <label className="label" htmlFor="bankName">
                Banco para Depósito
              </label>
              <select id="bankName" name="bankName" className="input">
                <option value="">Selecciona banco...</option>
                <option value="Banco Popular Dominicano">Banco Popular</option>
                <option value="Banreservas">Banreservas</option>
                <option value="Banco BHD">Banco BHD</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="Banco Santa Cruz">Banco Santa Cruz</option>
                <option value="Pago en Efectivo / Sobre">Pago en Efectivo</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="bankAccount">
                Número de Cuenta
              </label>
              <input
                id="bankAccount"
                name="bankAccount"
                placeholder="Cuenta corriente o ahorros"
                className="input font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Acceso al Sistema y Seguridad */}
        <div className="card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
            <Shield className="h-4 w-4 text-[var(--wood-800)]" />
            <h3 className="font-display text-base font-bold text-[var(--wood-950)]">
              4. Nivel de Acceso al Software ERP
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="role">
                Rol del Sistema <span className="text-rose-600">*</span>
              </label>
              <select id="role" name="role" defaultValue="VENDEDOR" className="input">
                <option value="VENDEDOR">Vendedor / Operador (POS, Facturación básica y órdenes)</option>
                <option value="ADMIN">Administrador (Acceso total al panel, finanzas y reportes)</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Contraseña Inicial <span className="text-rose-600">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="input"
              />
              <p className="mt-1 text-[0.7rem] text-[var(--muted)]">
                El empleado podrá cambiar su clave posteriormente
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="notes">
                Notas y Observaciones de RRHH
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Comentarios sobre experiencia en carpintería, referencias o acuerdos especiales..."
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Guardar y Registrar Empleado
          </button>
          <Link href="/empleados" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
