import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import {
  updateCompany,
  createNcfSeries,
  toggleNcfSeriesActive,
  updateNcfSeriesSeq,
  deleteNcfSeries,
} from "./actions";
import { formatDate } from "@/lib/format";
import { ConfirmForm } from "@/components/confirm-form";

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
          description="Datos oficiales que aparecen en facturas, cotizaciones y en el pie de página y WhatsApp de la tienda web"
          action={
            <Link href="/contenido-web" className="btn btn-secondary text-xs">
              Fotos y contenido web
            </Link>
          }
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
          description="Comprobantes fiscales RD (B01, B02, B14, B15…)"
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
                <th>Nombre / Prefijo</th>
                <th>Secuencia (Siguiente / Máx)</th>
                <th>Vence</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
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
                    <td className="font-mono font-bold">{s.type}</td>
                    <td>
                      <div className="font-medium text-[var(--wood-950)]">{s.name}</div>
                      <div className="text-xs font-mono text-[var(--muted)]">
                        Prefijo: {s.prefix}
                      </div>
                    </td>
                    <td>
                      <form action={updateNcfSeriesSeq} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={s.id} />
                        <input
                          name="nextSeq"
                          type="number"
                          min={1}
                          defaultValue={s.nextSeq}
                          className="input h-8 w-24 font-mono text-xs"
                          title="Siguiente correlativo"
                        />
                        <span className="text-xs text-[var(--muted)]">/</span>
                        <input
                          name="maxSeq"
                          type="number"
                          min={1}
                          defaultValue={s.maxSeq}
                          className="input h-8 w-28 font-mono text-xs"
                          title="Máximo autorizado"
                        />
                        <button type="submit" className="btn btn-ghost text-xs py-1 px-2">
                          Guardar
                        </button>
                      </form>
                    </td>
                    <td>{s.expiresAt ? formatDate(s.expiresAt) : "—"}</td>
                    <td>
                      {s.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700">
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleNcfSeriesActive.bind(null, s.id)}>
                          <button type="submit" className="btn btn-ghost text-xs py-1 px-2">
                            {s.active ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                        <ConfirmForm
                          action={deleteNcfSeries.bind(null, s.id)}
                          title="Eliminar serie NCF"
                          message={`¿Eliminar la serie NCF ${s.type} (${s.prefix})?`}
                          isDestructive
                        >
                          <button
                            type="submit"
                            className="btn btn-ghost text-xs py-1 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            Eliminar
                          </button>
                        </ConfirmForm>
                      </div>
                    </td>
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
