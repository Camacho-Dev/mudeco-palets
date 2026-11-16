"use client";

import { useMemo, useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, roundMoney } from "@/lib/format";
import { Printer, Plus, Layers } from "lucide-react";
import { CustomerSearchSelect } from "@/components/customer-search-select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  CartLine,
  CustomerOption,
  InvoiceDraft,
  ProductOption,
} from "./quick-sale-types";
import { QuickSaleCatalog } from "./quick-sale-catalog";
import { QuickSaleCartPanel } from "./quick-sale-cart-panel";
import { QuickSaleDraftHeader, QuickSaleDraftTabs } from "./quick-sale-drafts";

export type { InvoiceDraft } from "./quick-sale-types";

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

  const makeDefaultDraft = useCallback(
    (id: string, name: string): InvoiceDraft => ({
      id,
      name,
      customerId: customers[0]?.id || "",
      cart: [],
      delivery: false,
      deliveryFee: "",
      applyTax: true,
    }),
    [customers]
  );

  const [drafts, setDrafts] = useState<InvoiceDraft[]>([
    makeDefaultDraft("draft-1", "Factura 1"),
  ]);
  const [activeDraftId, setActiveDraftId] = useState<string>("draft-1");
  const [query, setQuery] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [draftToDiscard, setDraftToDiscard] = useState<InvoiceDraft | null>(null);
  const [clearCartConfirm, setClearCartConfirm] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = searchWrapperRef.current?.querySelector("input");
        input?.focus();
        input?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Carga de borradores previos desde localStorage (persistencia ante recargas)
  // Validando cliente existente y refrescando stock real de productos
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mudeco_pos_drafts_v2");
      if (raw) {
        const parsed = JSON.parse(raw) as InvoiceDraft[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validCustomerIds = new Set(customers.map((c) => c.id));
          const productMap = new Map(products.map((p) => [p.id, p]));
          const fallbackCustomerId = customers[0]?.id || "";
          const sanitized = parsed.map((d) => ({
            ...d,
            customerId: validCustomerIds.has(d.customerId)
              ? d.customerId
              : fallbackCustomerId,
            cart: Array.isArray(d.cart)
              ? d.cart.flatMap((line): CartLine[] => {
                  const live = productMap.get(line.productId);
                  if (!live) return [];
                  return [
                    {
                      ...line,
                      description: live.name,
                      stock: live.stock,
                      taxRate: live.taxRate,
                    },
                  ];
                })
              : [],
          }));
          setDrafts(sanitized);
          setActiveDraftId(sanitized[0].id);
        }
      }
    } catch {
      // Ignorar error si localStorage no está disponible
    }
  }, [customers, products]);

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
  }, [drafts, activeDraftId, makeDefaultDraft]);

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

    const target = drafts.find((d) => d.id === idToClose);
    if (!target) return;

    // Si la factura tiene artículos agregados, solicitar confirmación profesional
    if (target.cart.length > 0) {
      setDraftToDiscard(target);
      return;
    }

    // Si está vacía, descartarla directamente
    executeDiscardDraft(idToClose);
  }

  function executeDiscardDraft(idToClose: string) {
    if (drafts.length <= 1) {
      updateActive((d) => ({
        ...d,
        cart: [],
        delivery: false,
        deliveryFee: "",
      }));
      setDraftToDiscard(null);
      return;
    }

    const filtered = drafts.filter((d) => d.id !== idToClose);
    setDrafts(filtered);
    if (activeDraftId === idToClose) {
      setActiveDraftId(filtered[0]?.id || "draft-1");
    }
    setDraftToDiscard(null);
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
            <span>Abrir otra factura</span>
          </button>
        </div>

        <QuickSaleCatalog
          query={query}
          setQuery={setQuery}
          categories={categories}
          filtered={filtered}
          addProduct={addProduct}
          searchWrapperRef={searchWrapperRef}
        />
      </div>

      {/* Columna Derecha: Pestañas de Facturas y Carrito Activo */}
      <div className="lg:col-span-2">
        <QuickSaleDraftTabs
          drafts={drafts}
          activeDraft={activeDraft}
          customers={customers}
          setError={setError}
          setActiveDraftId={setActiveDraftId}
          setIsEditingName={setIsEditingName}
          closeDraft={closeDraft}
          addNewDraft={addNewDraft}
        />

        {/* Tarjeta de Facturación */}
        <div className="card sticky top-6 overflow-visible">
          <QuickSaleDraftHeader
            activeDraft={activeDraft}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            nameInput={nameInput}
            setNameInput={setNameInput}
            saveCustomName={saveCustomName}
            todayLabel={todayLabel}
          />

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
              {selectedCustomer?.creditLimit && selectedCustomer.creditLimit > 0 ? (
                <div className="mt-1.5 flex items-center justify-between rounded-md border border-amber-200/90 bg-amber-50/80 px-2.5 py-1 text-xs text-amber-900">
                  <span className="font-medium">Límite de crédito fijado:</span>
                  <span className="font-bold">{formatCurrency(selectedCustomer.creditLimit)}</span>
                </div>
              ) : null}
            </div>

            <QuickSaleCartPanel
              cart={cart}
              activeDraftName={activeDraft.name}
              onClearCart={() => setClearCartConfirm(true)}
              removeLine={removeLine}
              updateQty={updateQty}
              updatePrice={updatePrice}
              applyTax={applyTax}
              setApplyTax={setApplyTax}
              delivery={delivery}
              setDelivery={setDelivery}
              deliveryFee={deliveryFee}
              setDeliveryFee={setDeliveryFee}
              totals={totals}
            />

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

      {/* Modal Profesional de Confirmación para Descartar Factura Borrador */}
      <ConfirmDialog
        isOpen={!!draftToDiscard}
        onClose={() => setDraftToDiscard(null)}
        onConfirm={() => {
          if (draftToDiscard) executeDiscardDraft(draftToDiscard.id);
        }}
        title="Descartar factura simultánea"
        description={`¿Estás seguro de que deseas descartar "${draftToDiscard?.name}"? Esta acción liberará la pestaña de trabajo.`}
        confirmLabel="Sí, descartar factura"
        cancelLabel="Conservar factura"
        isDestructive={true}
        itemDetails={
          draftToDiscard
            ? {
                name: draftToDiscard.name,
                count: draftToDiscard.cart.reduce((s, i) => s + i.quantity, 0),
                total: formatCurrency(
                  draftToDiscard.cart.reduce(
                    (s, i) => s + i.quantity * i.unitPrice,
                    0,
                  ) * (draftToDiscard.applyTax ? 1.18 : 1),
                ),
                subtitle:
                  "Los productos agregados a esta pestaña se removerán de tu sesión.",
              }
            : undefined
        }
      />

      {/* Modal Profesional de Confirmación para Vaciar Carrito */}
      <ConfirmDialog
        isOpen={clearCartConfirm}
        onClose={() => setClearCartConfirm(false)}
        onConfirm={() => {
          updateActive((d) => ({ ...d, cart: [] }));
          setClearCartConfirm(false);
        }}
        title="Vaciar carrito"
        description={`¿Deseas remover todos los artículos de "${activeDraft.name}"?`}
        confirmLabel="Vaciar artículos"
        cancelLabel="Conservar artículos"
        isDestructive={true}
        itemDetails={{
          name: activeDraft.name,
          count: cart.reduce((s, i) => s + i.quantity, 0),
          total: formatCurrency(totals.total),
          subtitle: "La factura permanecerá abierta pero sin artículos.",
        }}
      />
    </div>
  );
}
