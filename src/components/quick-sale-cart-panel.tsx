"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CartLine } from "./quick-sale-types";

export function QuickSaleCartPanel({
  cart,
  activeDraftName,
  onClearCart,
  removeLine,
  updateQty,
  updatePrice,
  applyTax,
  setApplyTax,
  delivery,
  setDelivery,
  deliveryFee,
  setDeliveryFee,
  totals,
}: {
  cart: CartLine[];
  activeDraftName: string;
  onClearCart: () => void;
  removeLine: (key: string) => void;
  updateQty: (key: string, quantity: number) => void;
  updatePrice: (key: string, unitPrice: number) => void;
  applyTax: boolean;
  setApplyTax: (v: boolean) => void;
  delivery: boolean;
  setDelivery: (v: boolean) => void;
  deliveryFee: string;
  setDeliveryFee: (v: string) => void;
  totals: { subtotal: number; tax: number; deliveryFee: number; total: number };
}) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="label">Artículos</p>
          {cart.length > 0 ? (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-[var(--muted)] hover:text-rose-700"
            >
              Vaciar carrito
            </button>
          ) : null}
        </div>
      
        {cart.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-sm text-[var(--muted)]">
            Toca un mueble del catálogo para agregarlo a {activeDraftName}
          </p>
        ) : (
          cart.map((line) => (
            <div
              key={line.key}
              className="rounded-lg border border-[var(--border)] bg-[#fbf7f2] p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{line.description}</p>
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  aria-label={`Quitar ${line.description}`}
                  className="text-[var(--muted)] hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`qty-${line.key}`} className="label">Cant.</label>
                  <input
                    id={`qty-${line.key}`}
                    type="number"
                    min={0.01}
                    step={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateQty(line.key, Number(e.target.value) || 1)
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor={`price-${line.key}`} className="label">Precio</label>
                  <input
                    id={`price-${line.key}`}
                    type="number"
                    min={0}
                    step={0.01}
                    value={line.unitPrice}
                    onChange={(e) =>
                      updatePrice(line.key, Number(e.target.value) || 0)
                    }
                    className="input"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[#fbf7f2] p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--wood-950)]">
          <input
            type="checkbox"
            checked={applyTax}
            onChange={(e) => setApplyTax(e.target.checked)}
          />
          Lleva ITBIS (18%)
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--wood-950)]">
          <input
            type="checkbox"
            checked={delivery}
            onChange={(e) => {
              setDelivery(e.target.checked);
              if (!e.target.checked) setDeliveryFee("");
            }}
          />
          Esta factura es con delivery
        </label>
        {delivery ? (
          <div>
            <label className="label" htmlFor="deliveryFee">
              Costo de delivery (lo pones tú)
            </label>
            <input
              id="deliveryFee"
              type="number"
              min={0}
              step={0.01}
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="input"
              placeholder="Ej. 300"
            />
          </div>
        ) : null}
      </div>
      
      <dl className="space-y-1 border-t border-[var(--border)] pt-3 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <dt>Subtotal</dt>
          <dd>{formatCurrency(totals.subtotal)}</dd>
        </div>
        {applyTax ? (
          <div className="flex justify-between text-[var(--muted)]">
            <dt>ITBIS</dt>
            <dd>{formatCurrency(totals.tax)}</dd>
          </div>
        ) : (
          <div className="flex justify-between text-[var(--muted)]">
            <dt>ITBIS</dt>
            <dd>Sin ITBIS</dd>
          </div>
        )}
        {delivery ? (
          <div className="flex justify-between text-[var(--muted)]">
            <dt>Delivery</dt>
            <dd>{formatCurrency(totals.deliveryFee)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between font-display text-xl text-[var(--wood-950)]">
          <dt>Total</dt>
          <dd>{formatCurrency(totals.total)}</dd>
        </div>
      </dl>
    </>
  );
}
