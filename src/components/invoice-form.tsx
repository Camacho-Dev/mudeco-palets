"use client";

import { useMemo, useState } from "react";
import { formatCurrency, roundMoney } from "@/lib/format";
import { CustomerSearchSelect } from "@/components/customer-search-select";

type ProductOption = {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  taxRate: number;
  unit: string;
  stock?: number;
};

type CustomerOption = {
  id: string;
  name: string;
  taxId: string | null;
};

type Line = {
  key: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type Initial = {
  customerId?: string;
  ncf?: string;
  notes?: string;
  dueDate?: string;
  delivery?: boolean;
  deliveryFee?: number;
  applyTax?: boolean;
  lines?: Omit<Line, "key">[];
};

export function InvoiceForm({
  customers,
  products,
  action,
  initial,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
  action: (fd: FormData) => Promise<void>;
  initial?: Initial;
}) {
  const [delivery, setDelivery] = useState(!!initial?.delivery);
  const [deliveryFee, setDeliveryFee] = useState(
    initial?.deliveryFee && initial.deliveryFee > 0
      ? String(initial.deliveryFee)
      : "",
  );
  const [applyTax, setApplyTax] = useState(initial?.applyTax !== false);
  const [lines, setLines] = useState<Line[]>(() => {
    if (initial?.lines?.length) {
      return initial.lines.map((l, i) => ({
        ...l,
        key: `init-${i}`,
      }));
    }
    return [
      {
        key: "1",
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.18,
      },
    ];
  });

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const l of lines) {
      const s = roundMoney(l.quantity * l.unitPrice);
      subtotal += s;
      if (applyTax) tax += roundMoney(s * l.taxRate);
    }
    const fee =
      delivery && Number(deliveryFee) > 0
        ? roundMoney(Number(deliveryFee))
        : 0;
    return {
      subtotal: roundMoney(subtotal),
      tax: roundMoney(tax),
      deliveryFee: fee,
      total: roundMoney(subtotal + tax + fee),
    };
  }, [lines, delivery, deliveryFee, applyTax]);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    );
  }

  function applyProduct(key: string, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) {
      updateLine(key, { productId: "" });
      return;
    }
    const unlimited = p.sku === "CUS-001";
    if (!unlimited && (p.stock ?? 0) <= 0) {
      alert(`No hay stock de “${p.name}”. No se puede agregar a la factura.`);
      updateLine(key, { productId: "" });
      return;
    }
    updateLine(key, {
      productId: p.id,
      description: p.name,
      unitPrice: p.price,
      taxRate: p.taxRate,
    });
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        key: String(Date.now()),
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 0.18,
      },
    ]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="customerId">
            Cliente
          </label>
          <CustomerSearchSelect
            id="customerId"
            name="customerId"
            customers={customers}
            defaultValue={initial?.customerId || ""}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="ncfType">
            Serie NCF auto
          </label>
          <select id="ncfType" name="ncfType" className="input" defaultValue="">
            <option value="">Sin NCF automático</option>
            <option value="B01">B01 Crédito fiscal</option>
            <option value="B02">B02 Consumidor final</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ncf">
            NCF manual (opcional)
          </label>
          <input
            id="ncf"
            name="ncf"
            defaultValue={initial?.ncf || ""}
            className="input"
            placeholder="Deja vacío para usar serie"
          />
        </div>
        <div>
          <label className="label" htmlFor="dueDate">
            Vencimiento
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={initial?.dueDate || ""}
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">
            Notas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={initial?.notes || ""}
            className="input"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="font-medium text-slate-800">Líneas</h2>
          <button
            type="button"
            onClick={addLine}
            className="btn btn-secondary text-xs"
          >
            + Línea
          </button>
        </div>
        <div className="space-y-4 p-4 md:p-6">
          {lines.map((line) => (
            <div
              key={line.key}
              className="grid gap-3 rounded-xl border border-[var(--border)] bg-[#f9fcfb] p-4 md:grid-cols-12"
            >
              <div className="md:col-span-3">
                <label className="label">Producto</label>
                <select
                  name="productId"
                  value={line.productId}
                  onChange={(e) => applyProduct(line.key, e.target.value)}
                  className="input"
                >
                  <option value="">Manual…</option>
                  {products.map((p) => {
                    const out =
                      p.sku !== "CUS-001" && (p.stock ?? 0) <= 0;
                    return (
                      <option key={p.id} value={p.id} disabled={out}>
                        {p.name}
                        {out
                          ? " (sin stock)"
                          : p.stock != null
                            ? ` · stock ${p.stock}`
                            : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="label">Descripción</label>
                <input
                  name="description"
                  required
                  value={line.description}
                  onChange={(e) =>
                    updateLine(line.key, { description: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">Cant.</label>
                <input
                  name="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={line.quantity}
                  onChange={(e) =>
                    updateLine(line.key, {
                      quantity: Number(e.target.value) || 0,
                    })
                  }
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Precio</label>
                <input
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(line.key, {
                      unitPrice: Number(e.target.value) || 0,
                    })
                  }
                  className="input"
                />
              </div>
              <div className="md:col-span-1">
                <label className="label">ITBIS</label>
                <input
                  name="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                  value={line.taxRate}
                  onChange={(e) =>
                    updateLine(line.key, {
                      taxRate: Number(e.target.value) || 0,
                    })
                  }
                  className="input"
                />
              </div>
              <div className="flex items-end md:col-span-1">
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  className="btn btn-secondary w-full text-xs"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border)] bg-white px-6 py-4">
          <div className="min-w-[220px] space-y-3 rounded-lg border border-[var(--border)] bg-[#fbf7f2] p-3">
            <input
              type="hidden"
              name="applyTax"
              value={applyTax ? "true" : "false"}
            />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
              />
              Lleva ITBIS
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="delivery"
                value="true"
                checked={delivery}
                onChange={(e) => {
                  setDelivery(e.target.checked);
                  if (!e.target.checked) setDeliveryFee("");
                }}
              />
              Factura con delivery
            </label>
            {delivery ? (
              <div>
                <label className="label">Costo de delivery</label>
                <input
                  name="deliveryFee"
                  type="number"
                  min={0}
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="input"
                  placeholder="Ej. 300"
                />
              </div>
            ) : (
              <input type="hidden" name="deliveryFee" value="0" />
            )}
          </div>
          <dl className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-slate-500">
              <dt>ITBIS</dt>
              <dd>
                {applyTax ? formatCurrency(totals.tax) : "Sin ITBIS"}
              </dd>
            </div>
            {delivery ? (
              <div className="flex justify-between text-slate-500">
                <dt>Delivery</dt>
                <dd>{formatCurrency(totals.deliveryFee)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <dt>Total</dt>
              <dd>{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          name="action"
          value="draft"
          className="btn btn-secondary"
        >
          Guardar borrador
        </button>
        <button
          type="submit"
          name="action"
          value="issue"
          className="btn btn-primary"
        >
          Guardar y emitir
        </button>
      </div>
    </form>
  );
}
