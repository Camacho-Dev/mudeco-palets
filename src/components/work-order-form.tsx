"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";

type FinishedOption = {
  id: string;
  name: string;
  stock: number;
};

type MaterialOption = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
};

type MaterialRow = {
  key: string;
  materialId: string;
  materialQty: number | "";
};

export function WorkOrderForm({
  finished,
  materials,
  action,
}: {
  finished: FinishedOption[];
  materials: MaterialOption[];
  action: (fd: FormData) => void;
}) {
  const [quantity, setQuantity] = useState<number>(1);
  const [rows, setRows] = useState<MaterialRow[]>([
    { key: "mat-1", materialId: "", materialQty: 1 },
  ]);

  const matMap = new Map(materials.map((m) => [m.id, m]));

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        key: `mat-${Date.now()}-${Math.random()}`,
        materialId: "",
        materialQty: 1,
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateRow(index: number, patch: Partial<MaterialRow>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  return (
    <form action={action} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="productId">
          Mueble terminado a fabricar
        </label>
        <select id="productId" name="productId" className="input" required>
          <option value="">Seleccionar mueble…</option>
          {finished.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock actual: {p.stock})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="quantity">
          Cantidad de muebles a fabricar
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          step="0.01"
          min="0.01"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          className="input"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notas de fabricación
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input"
          rows={2}
          placeholder="Instrucciones especiales para el carpintero o taller…"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="label mb-0">
              Materiales e insumos requeridos (por cada mueble)
            </p>
            <p className="text-xs text-[var(--muted)]">
              Se multiplicará por las {quantity} unidades a producir
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--wood-800)] hover:underline"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar material</span>
          </button>
        </div>

        {materials.length === 0 ? (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            No hay materiales registrados. Créalos primero en Almacén de materiales.
          </p>
        ) : null}

        <div className="space-y-2">
          {rows.map((row, index) => {
            const m = matMap.get(row.materialId);
            const unitQty = typeof row.materialQty === "number" ? row.materialQty : 0;
            const totalNeeded = unitQty * (quantity || 1);
            const hasStockWarning = m ? m.stock < totalNeeded : false;

            return (
              <div
                key={row.key}
                className="grid gap-2 sm:grid-cols-12 items-center rounded-lg border border-slate-200 bg-white p-2.5"
              >
                <div className="sm:col-span-7">
                  <select
                    name="materialId"
                    className="input w-full text-xs"
                    value={row.materialId}
                    onChange={(e) =>
                      updateRow(index, { materialId: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccionar insumo del almacén…</option>
                    {materials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        [{mat.category}] {mat.name} — Disponible: {mat.stock}{" "}
                        {mat.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <input
                    name="materialQty"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Cant. por unidad"
                    className="input w-full text-xs"
                    value={row.materialQty}
                    onChange={(e) =>
                      updateRow(index, {
                        materialQty:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-1 text-right text-xs">
                  {m ? (
                    <span
                      className={`text-[0.7rem] font-semibold ${
                        hasStockWarning ? "text-rose-600" : "text-slate-600"
                      }`}
                    >
                      Total: {totalNeeded} {m.unit}
                    </span>
                  ) : (
                    <span className="text-[0.7rem] text-slate-400">Total: -</span>
                  )}
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Eliminar insumo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button type="submit" className="btn btn-primary">
          Crear orden de fabricación
        </button>
      </div>
    </form>
  );
}
