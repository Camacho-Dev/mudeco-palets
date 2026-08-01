import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createUser } from "../actions";

export default async function NuevoUsuarioPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader title="Nuevo usuario" description="Alta de empleado o admin" />
      <form action={createUser} className="card max-w-lg space-y-4 p-6">
        <div>
          <label className="label">Nombre</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input name="password" type="password" className="input" minLength={6} required />
        </div>
        <div>
          <label className="label">Rol</label>
          <select name="role" className="input" defaultValue="VENDEDOR">
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div>
          <label className="label">Comisión %</label>
          <input name="commissionRate" type="number" step="0.1" defaultValue={0} className="input" />
        </div>
        <button type="submit" className="btn btn-primary">
          Crear
        </button>
      </form>
    </div>
  );
}
