"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, roundMoney } from "@/lib/format";
import {
  Printer,
  Plus,
  Trash2,
  Search,
  X,
  Layers,
  Edit2,
  Check,
} from "lucide-react";
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

export type InvoiceDraft = {
  id: string;
  name: string;
  customerId: string;
  cart: CartLine[];
  delivery: boolean;
  deliveryFee: string;
  applyTax: boolean;
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

  const makeDefaultDraft = (id: string, name: string): InvoiceDraft => ({
    id,
    name,
    customerId: customers[0]?.id || "",
    cart: [],
    delivery: false,
    deliveryFee: "",
    applyTax: true,
  });

  const [drafts, setDrafts] = useState<InvoiceDraft[]>([
    makeDefaultDraft("draft-1", "Factura 1"),
  ]);
  const [activeDraftId, setActiveDraftId] = useState<string>("draft-1");
  const [query, setQuery] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  // Carga de borradores previos desde localStorage (persistencia ante recargas)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mudeco_pos_drafts_v2");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDrafts(parsed);
          setActiveDraftId(parsed[0].id);
        }
      }
    } catch {
      // Ignorar error si localStorage no está disponible
    }
  }, []);

  // Guardar borradores automáticamente
  useEffect(() => {
    try {
      localStorage.setItem("mudeco_pos_drafts_v2", JSON.stringify(drafts));
    } catch {
      // Ignorar error
    }
  }, [drafts]);

  // Borrador activo actual
  const activeDraft = useMemo(() => {
    return (
      drafts.find((d) => d.id === activeDraftId) ||
      drafts[0] ||
      makeDefaultDraft("draft-1", "Factura 1")
    );
  }, [drafts, activeDraftId]);

  const customerId = activeDraft.customerId;
  const cart = activeDraft.cart;
  const delivery = activeDraft.delivery;
  const deliveryFee = activeDraft.deliveryFee;
  const applyTax = activeDraft.applyTax;

  // Actualizador del borrador activo
  function updateActive(updater: (draft: InvoiceDraft) => InvoiceDraft) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === activeDraft.id ? updater(d) : d)),
    );
  }

  function setCustomerId(id: string) {
    updateActive((d) => ({ ...d, customerId: id }));
  }

  function setDelivery(val: boolean) {
    updateActive((d) => ({
      ...d,
      delivery: val,
      deliveryFee: val ? d.deliveryFee : "",
    }));
  }

  function setDeliveryFee(fee: string) {
    updateActive((d) => ({ ...d, deliveryFee: fee }));
  }

  function setApplyTax(tax: boolean) {
    updateActive((d) => ({ ...d, applyTax: tax }));
  }

  function addNewDraft() {
    setError("");
    const nextNum = drafts.length + 1;
    const newId = `draft-${Date.now()}`;
    const newDraft = makeDefaultDraft(newId, `Factura ${nextNum}`);
    setDrafts((prev) => [...prev, newDraft]);
    setActiveDraftId(newId);
  }

  function closeDraft(idToClose: string, e: React.MouseEvent) {
    e.stopPropagation();
    setError("");

    if (drafts.length <= 1) {
      updateActive((d) => ({
        ...d,
        cart: [],
        delivery: false,
        deliveryFee: "",
      }));
      return;
    }

    const target = drafts.find((d) => d.id === idToClose);
    if (target && target.cart.length > 0) {
      const ok = window.confirm(
        `¿Deseas descartar "${target.name}" con ${target.cart.length} producto(s)?`,
      );
      if (!ok) return;
    }

    const filtered = drafts.filter((d) => d.id !== idToClose);
    setDrafts(filtered);
    if (activeDraftId === idToClose) {
      setActiveDraftId(filtered[0]?.id || "draft-1");
    }
  }

  function saveCustomName() {
    if (nameInput.trim()) {
      updateActive((d) => ({ ...d, name: nameInput.trim() }));
    }
    setIsEditingName(false);
  }

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

    updateActive((d) => {
      const existing = d.cart.find((l) => l.productId === p.id);
      if (existing) {
        const nextQty = existing.quantity + 1;
        if (!unlimited && nextQty > p.stock) {
          setError(
            `Solo hay ${p.stock} de “${p.name}”. No puedes agregar más a esta factura.`,
          );
          return d;
        }
        return {
          ...d,
          cart: d.cart.map((l) =>
            l.productId === p.id ? { ...l, quantity: nextQty } : l,
          ),
        };
      }
      return {
        ...d,
        cart: [
          ...d.cart,
          {
            key: `${p.id}-${Date.now()}`,
            productId: p.id,
            sku: p.sku,
            description: p.name,
            quantity: 1,
            unitPrice: p.price || 0,
            taxRate: p.taxRate,
            stock: p.stock,
          },
        ],
      };
    });
  }

  function updateQty(key: string, quantity: number) {
    setError("");
    updateActive((d) => ({
      ...d,
      cart: d.cart.map((l) => {
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
    }));
  }

  function updatePrice(key: string, unitPrice: number) {
    updateActive((d) => ({
      ...d,
      cart: d.cart.map((l) =>
        l.key === key ? { ...l, unitPrice: Math.max(0, unitPrice) } : l,
      ),
    }));
  }

  function removeLine(key: string) {
    updateActive((d) => ({
      ...d,
      cart: d.cart.filter((l) => l.key !== key),
    }));
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

        // Remover el borrador completado o reiniciar si era el único
        const remaining = drafts.filter((d) => d.id !== activeDraft.id);
        if (remaining.length === 0) {
          const reset = [makeDefaultDraft("draft-1", "Factura 1")];
          setDrafts(reset);
          setActiveDraftId(reset[0].id);
          try {
            localStorage.setItem(
              "mudeco_pos_drafts_v2",
              JSON.stringify(reset),
            );
          } catch {}
        } else {
          setDrafts(remaining);
          setActiveDraftId(remaining[0].id);
          try {
            localStorage.setItem(
              "mudeco_pos_drafts_v2",
              JSON.stringify(remaining),
            );
          } catch {}
        }

        router.push(`/facturas/${id}/imprimir`);
        router.refresh();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          msg.includes("Unique constraint") ||
            msg.includes("Unique constraint failed")
            ? "Ese número de factura ya existía. Intenta de nuevo."
            : msg.includes("Stock insuficiente") || msg.includes("No hay stock")
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

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Columna Izquierda: Catálogo de Productos */}
      <div className="space-y-4 lg:col-span-3">
        {/* Banner informativo de factura activa */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[#fbf7f2] px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--brass)]" />
            <span className="text-[var(--muted)]">Agregando productos a:</span>
            <span className="font-semibold text-[var(--wood-950)]">
              {activeDraft.name}
            </span>
            {selectedCustomer ? (
              <span className="rounded bg-white px-2 py-0.5 text-[var(--wood-800)] border border-[var(--border)]">
                {selectedCustomer.name.split(" ")[0]}
              </span>
            ) : null}
            <span className="rounded-full bg-[var(--wood-950)]/10 px-2 py-0.5 font-bold text-[var(--wood-950)]">
              {cart.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>

          <button
            type="button"
            onClick={addNewDraft}
            className="flex items-center gap-1 font-semibold text-[var(--wood-950)] hover:text-[var(--brass)] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Abrir otra factura</span>
          </button>
        </div>

        <div className="card p-4">
          <IconField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mueble por nombre, SKU o categoría…"
            icon={<Search strokeWidth={2.25} />}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setQuery("")}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                !query
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white font-medium"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setQuery("comedor")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                query === "comedor"
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                  : "border-[var(--brass)] bg-[#fbf7f2] text-[var(--wood-950)] hover:bg-[var(--brass)] hover:text-white"
              }`}
            >
              ⭐ Más pedidos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setQuery(c)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  query === c
                    ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                    : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)] hover:text-[var(--wood-800)]"
                }`}
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

      {/* Columna Derecha: Pestañas de Facturas y Carrito Activo */}
      <div className="lg:col-span-2">
        {/* Barra de Pestañas de Facturas */}
        <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {drafts.map((d, index) => {
            const isActive = d.id === activeDraft.id;
            const count = d.cart.reduce((s, i) => s + i.quantity, 0);
            const customerObj = customers.find((c) => c.id === d.customerId);
            const hasCustomCustomer =
              customerObj && customerObj.id !== customers[0]?.id;

            return (
              <div
                key={d.id}
                onClick={() => {
                  setError("");
                  setActiveDraftId(d.id);
                  setIsEditingName(false);
                }}
                className={`group relative flex cursor-pointer items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "border-[var(--brass)] bg-[var(--wood-950)] text-[#faf6f1] shadow-sm"
                    : "border-transparent bg-white/80 text-[var(--wood-950)] hover:bg-white"
                }`}
              >
                <span className="max-w-[120px] truncate">
                  {d.name || `Factura ${index + 1}`}
                  {hasCustomCustomer
                    ? ` · ${customerObj.name.split(" ")[0]}`
                    : ""}
                </span>

                {count > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-[var(--brass)] text-[var(--wood-950)]"
                        : "bg-[var(--wood-950)]/10 text-[var(--wood-950)]"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}

                {drafts.length > 1 ? (
                  <button
                    type="button"
                    onClick={(e) => closeDraft(d.id, e)}
                    className={`rounded p-0.5 transition ${
                      isActive
                        ? "text-white/60 hover:bg-white/20 hover:text-white"
                        : "text-[var(--muted)] hover:bg-rose-100 hover:text-rose-700"
                    }`}
                    title="Cerrar esta factura"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addNewDraft}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-[var(--border)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--wood-950)] transition hover:border-[var(--wood-700)] hover:bg-[#fbf7f2]"
            title="Abrir otra factura en simultáneo"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--brass)]" />
            <span>+ Nueva factura</span>
          </button>
        </div>

        {/* Tarjeta de Facturación */}
        <div className="card sticky top-6 overflow-visible">
          <div className="border-b border-[var(--border)] bg-[var(--wood-950)] px-5 py-4 text-[#faf6f1]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs tracking-wide text-white/50 uppercase">
                Factura simultánea
              </p>

              {/* Botón para renombrar pestaña */}
              {!isEditingName ? (
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(activeDraft.name);
                    setIsEditingName(true);
                  }}
                  className="flex items-center gap-1 text-[11px] text-white/60 hover:text-[var(--brass)]"
                  title="Cambiar nombre de esta cuenta (ej: Mesa 3, Juan...)"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Renombrar</span>
                </button>
              ) : null}
            </div>

            {isEditingName ? (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveCustomName()}
                  className="rounded bg-white/10 px-2 py-1 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-[var(--brass)]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveCustomName}
                  className="rounded bg-[var(--brass)] p-1 text-[var(--wood-950)] hover:brightness-110"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="font-display text-xl">{activeDraft.name}</p>
            )}

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
              <div className="flex items-center justify-between">
                <p className="label">Artículos</p>
                {cart.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => updateActive((d) => ({ ...d, cart: [] }))}
                    className="text-xs text-[var(--muted)] hover:text-rose-700"
                  >
                    Vaciar carrito
                  </button>
                ) : null}
              </div>

              {cart.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-sm text-[var(--muted)]">
                  Toca un mueble del catálogo para agregarlo a {activeDraft.name}
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
