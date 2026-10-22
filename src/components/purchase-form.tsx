"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, roundMoney } from "@/lib/format";

type ProductOption = {
  id: string;
  name: string;
  kind: string;
  cost: number;
  unit: string;
};

type SupplierOption = {
  id: string;
  name: string;
};

type PurchaseLine = {
  key: string;
  productId: string;
  quantity: number | "";
  unitCost: number | "";
};

export function PurchaseForm({
  suppliers,
  products,
  action,
}: {
  suppliers: SupplierOption[];
  products: ProductOption[];
  action: (fd: FormData) => void;
}) {
  const [lines, setLines] = useState<PurchaseLine[]>([
    { key: "row-1", productId: "", quantity: 1, unitCost: "" },
  ]);

  const byId = new Map(products.map((p) => [p.id, p]));

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        key: `row-${Date.now()}-${Math.random()}`,
        productId: "",
        quantity: 1,
        unitCost: "",
      },
    ]);
  }

  function removeLine(index: number) {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateLine(index: number, patch: Partial<PurchaseLine>) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l;
        const updated = { ...l, ...patch };
        if (patch.productId && patch.productId !== l.productId) {
          const p = byId.get(patch.productId);
          if (p && (!updated.unitCost || updated.unitCost === 0)) {
            updated.unitCost = p.cost > 0 ? p.cost : "";
          }
        }
        return updated;
      }),
    );
  }

  const total = roundMoney(
    lines.reduce((s, l) => {
      const q = typeof l.quantity === "number" ? l.quantity : 0;
      const c = typeof l.unitCost === "number" ? l.unitCost : 0;
      return s + q * c;
    }, 0),
  );

  return (
    <form action={action} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="supplierId">
          Proveedor
        </label>
        <select id="supplierId" name="supplierId" className="input" required>
          <option value="">Seleccionar proveedor…</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          className="input"
          rows={2}
          placeholder="Términos, entrega o referencia del pedido…"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="label mb-0">Ítems de compra ({lines.length})</p>
          <button
            type="button"
            onClick={addLine}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--wood-800)] hover:underline"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar ítem</span>
          </button>
        </div>

        <div className="space-y-2">
          {lines.map((line, index) => {
            const p = byId.get(line.productId);
            const lineTotal =
              (typeof line.quantity === "number" ? line.quantity : 0) *
              (typeof line.unitCost === "number" ? line.unitCost : 0);

            return (
              <div
                key={line.key}
                className="grid gap-2 sm:grid-cols-12 items-center rounded-lg border border-slate-200 bg-white p-2.5"
              >
                <div className="sm:col-span-6">
                  <select
                    name="productId"
                    className="input w-full text-xs"
                    value={line.productId}
                    onChange={(e) =>
                      updateLine(index, { productId: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccionar insumo o mueble…</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.kind === "MATERIAL" ? "[Mat] " : "[Mueble] "}
                        {prod.name} ({prod.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Cant."
                    className="input w-full text-xs"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(index, {
                        quantity: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <input
                    name="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Costo unit."
                    className="input w-full text-xs"
                    value={line.unitCost}
                    onChange={(e) =>
                      updateLine(index, {
                        unitCost: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-1 text-right text-xs">
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(roundMoney(lineTotal))}
                  </span>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Eliminar fila"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 text-right">
          <div>
            <span className="text-xs text-[var(--muted)]">Total de la orden:</span>
            <p className="text-xl font-bold text-[var(--wood-950)]">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button type="submit" className="btn btn-primary">
          Crear orden de compra
        </button>
      </div>
    </form>
  );
}
