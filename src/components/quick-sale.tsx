"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, roundMoney } from "@/lib/format";
import { Printer, Plus, Trash2, Search } from "lucide-react";
import { IconField } from "@/components/icon-field";
import { CustomerSearchSelect } from "@/components/customer-search-select";

type ProductOption = {
  id: string;
  sku: string | null;
  name: string;
  price: number;
  taxRate: number;
  category: string;
  stock: number;
};

type CustomerOption = {
  id: string;
  name: string;
  taxId: string | null;
};

type CartLine = {
  key: string;
  productId: string;
  sku: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  stock: number;
};

export function QuickSale({
  customers,
  products,
  action,
  todayLabel,
}: {
  customers: CustomerOption[];
  products: ProductOption[];
  action: (fd: FormData) => Promise<string>;
  todayLabel: string;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [delivery, setDelivery] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const l of cart) {
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
  }, [cart, delivery, deliveryFee, applyTax]);

  function addProduct(p: ProductOption) {
    setError("");
    const unlimited = p.sku === "CUS-001";
    if (!unlimited && p.stock <= 0) {
      setError(`No hay stock de “${p.name}”. No se puede agregar.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        const nextQty = existing.quantity + 1;
        if (!unlimited && nextQty > p.stock) {
          setError(
            `Solo hay ${p.stock} de “${p.name}”. No puedes agregar más.`,
          );
          return prev;
        }
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: nextQty } : l,
        );
      }
      return [
        ...prev,
        {
          key: p.id,
          productId: p.id,
          sku: p.sku,
          description: p.name,
          quantity: 1,
          unitPrice: p.price || 0,
          taxRate: p.taxRate,
          stock: p.stock,
        },
      ];
    });
  }

  function updateQty(key: string, quantity: number) {
    setError("");
    setCart((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const unlimited = l.sku === "CUS-001";
        let q = Math.max(0.01, quantity);
        if (!unlimited && l.stock > 0 && q > l.stock) {
          setError(`Solo hay ${l.stock} disponibles de “${l.description}”.`);
          q = l.stock;
        }
        if (!unlimited && l.stock <= 0) {
          setError(`No hay stock de “${l.description}”.`);
          return l;
        }
        return { ...l, quantity: q };
      }),
    );
  }

  function updatePrice(key: string, unitPrice: number) {
    setCart((prev) =>
      prev.map((l) =>
        l.key === key ? { ...l, unitPrice: Math.max(0, unitPrice) } : l,
      ),
    );
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  function submit() {
    setError("");
    if (!customerId) {
      setError("Selecciona un cliente");
      return;
    }
    if (cart.length === 0) {
      setError("Agrega al menos un mueble al carrito");
      return;
    }
    for (const line of cart) {
      if (line.sku === "CUS-001") continue;
      if (line.stock <= 0) {
        setError(
          `No hay stock de “${line.description}”. No se puede guardar la factura.`,
        );
        return;
      }
      if (line.quantity > line.stock) {
        setError(
          `Stock insuficiente de “${line.description}”: pediste ${line.quantity}, hay ${line.stock}.`,
        );
        return;
      }
    }

    const fd = new FormData();
    fd.set("customerId", customerId);
    if (delivery) {
      fd.set("delivery", "true");
      fd.set("deliveryFee", String(Number(deliveryFee) || 0));
    }
    fd.set("applyTax", applyTax ? "true" : "false");
    for (const line of cart) {
      fd.append("productId", line.productId);
      fd.append("description", line.description);
      fd.append("quantity", String(line.quantity));
      fd.append("unitPrice", String(line.unitPrice));
      fd.append("taxRate", String(line.taxRate));
    }

    startTransition(async () => {
      try {
        const id = await action(fd);
        router.push(`/facturas/${id}/imprimir`);
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg.includes("Unique constraint") || msg.includes("Unique constraint failed")
            ? "Ese número de factura ya existía. Intenta de nuevo."
            : msg.includes("Stock insuficiente") ||
                msg.includes("No hay stock")
              ? msg
              : msg.includes("crédito")
                ? msg
                : msg.length > 180
                  ? "No se pudo generar la factura. Revisa stock, cliente o límite de crédito."
                  : msg,
        );
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <div className="card p-4">
          <IconField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mueble por nombre, SKU o categoría…"
            icon={<Search strokeWidth={2.25} />}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setQuery(c)}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs text-[var(--muted)] hover:border-[var(--wood-700)] hover:text-[var(--wood-800)]"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => {
            const outOfStock = p.sku !== "CUS-001" && p.stock <= 0;
            return (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              disabled={outOfStock}
              className={`card group p-4 text-left transition ${
                outOfStock
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-[var(--wood-700)] hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-wider text-[var(--muted)] uppercase">
                    {p.category}
                    {p.sku ? ` · ${p.sku}` : ""}
                  </p>
                  <p className="mt-1 font-medium text-[var(--wood-950)] group-hover:text-[var(--wood-800)]">
                    {p.name}
                  </p>
                </div>
                {!outOfStock ? (
                  <Plus className="h-4 w-4 shrink-0 text-[var(--brass)] opacity-0 transition group-hover:opacity-100" />
                ) : null}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-lg">
                  {p.price > 0 ? formatCurrency(p.price) : "A cotizar"}
                </p>
                <p
                  className={`text-xs ${
                    outOfStock
                      ? "font-semibold text-rose-700"
                      : p.stock <= 2
                        ? "text-amber-700"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {outOfStock ? "Sin stock" : `Stock: ${p.stock}`}
                </p>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="card sticky top-6 overflow-hidden">
          <div className="border-b border-[var(--border)] bg-[var(--wood-950)] px-5 py-4 text-[#faf6f1]">
            <p className="text-xs tracking-wide text-white/50 uppercase">
              Factura automática
            </p>
            <p className="font-display text-xl">Generar e imprimir</p>
            <p className="mt-1 text-sm text-white/60">Fecha: {todayLabel}</p>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="label" htmlFor="customerId">
                Cliente
              </label>
              <CustomerSearchSelect
                id="customerId"
                customers={customers}
                value={customerId}
                onChange={setCustomerId}
                required
              />
            </div>

            <div className="space-y-2">
              <p className="label">Artículos</p>
              {cart.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-sm text-[var(--muted)]">
                  Toca un mueble del catálogo para agregarlo
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
                        className="text-[var(--muted)] hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label">Cant.</label>
                        <input
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
                        <label className="label">Precio</label>
                        <input
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

            {error ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn btn-accent btn-lg w-full disabled:opacity-60"
            >
              <Printer className="h-5 w-5" />
              {pending ? "Generando…" : "Generar factura e imprimir"}
            </button>
            <p className="text-center text-xs text-[var(--muted)]">
              Número, fecha e ITBIS se asignan solos. Se abre el diálogo de
              impresión de tu impresora.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
