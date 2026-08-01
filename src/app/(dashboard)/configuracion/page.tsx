import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { updateCompany, createNcfSeries } from "./actions";
import { formatDate } from "@/lib/format";

export default async function ConfiguracionPage() {
  await requireAdmin();
  const [company, series] = await Promise.all([
    prisma.companySettings.findUnique({ where: { id: "default" } }),
    prisma.ncfSeries.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <PageHeader
          title="Empresa"
          description="Datos que aparecen en facturas e impresión"
        />
        <form action={updateCompany} className="card max-w-xl space-y-4 p-6">
          <div>
            <label className="label" htmlFor="name">
              Nombre comercial
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={company?.name || "Mudeco Palets"}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="slogan">
              Eslogan
            </label>
            <input
              id="slogan"
              name="slogan"
              defaultValue={company?.slogan || "Muebles a la medida"}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="taxId">
              RNC
            </label>
            <input
              id="taxId"
              name="taxId"
              defaultValue={company?.taxId || ""}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="address">
              Dirección
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={company?.address || ""}
              className="input"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={company?.phone || ""}
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={company?.email || ""}
                className="input"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </form>
      </div>

      <div>
        <PageHeader
          title="Series NCF"
          description="Comprobantes fiscales RD (B01, B02…)"
        />
        <form action={createNcfSeries} className="card mb-4 max-w-xl space-y-3 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tipo</label>
              <input name="type" className="input" placeholder="B01" required />
            </div>
            <div>
              <label className="label">Nombre</label>
              <input name="name" className="input" placeholder="Crédito fiscal" />
            </div>
            <div>
              <label className="label">Prefijo</label>
              <input name="prefix" className="input" placeholder="B01" required />
            </div>
            <div>
              <label className="label">Siguiente número</label>
              <input name="nextSeq" type="number" defaultValue={1} className="input" />
            </div>
            <div>
              <label className="label">Máximo</label>
              <input name="maxSeq" type="number" defaultValue={99999999} className="input" />
            </div>
            <div>
              <label className="label">Vence</label>
              <input name="expiresAt" type="date" className="input" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Agregar serie
          </button>
        </form>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Prefijo</th>
                <th>Siguiente</th>
                <th>Máx</th>
                <th>Vence</th>
                <th>Activa</th>
              </tr>
            </thead>
            <tbody>
              {series.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--muted)]">
                    Sin series — créalas para autoasignar NCF al facturar
                  </td>
                </tr>
              ) : (
                series.map((s) => (
                  <tr key={s.id}>
                    <td>{s.type}</td>
                    <td>{s.prefix}</td>
                    <td>{s.nextSeq}</td>
                    <td>{s.maxSeq}</td>
                    <td>{s.expiresAt ? formatDate(s.expiresAt) : "—"}</td>
                    <td>{s.active ? "Sí" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
