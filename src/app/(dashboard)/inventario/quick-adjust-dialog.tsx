"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontal, X, Check, Loader2 } from "lucide-react";
import { quickStockAdjust } from "./actions";

type ProductOption = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  category: string;
};

export function QuickAdjustDialog({
  products,
  preselectedProduct,
  triggerLabel = "Ajuste rápido",
  className = "btn btn-secondary",
}: {
  products: ProductOption[];
  preselectedProduct?: ProductOption;
  triggerLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(preselectedProduct?.id || products[0]?.id || "");
  const [adjustmentType, setAdjustmentType] = useState<"ADD" | "REMOVE" | "SET">("ADD");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("ADJUST");
  const [note, setNote] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const selected = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const fd = new FormData();
    fd.append("productId", productId);
    fd.append("adjustmentType", adjustmentType);
    fd.append("quantity", String(quantity));
    fd.append("reason", reason);
    fd.append("note", note);

    startTransition(async () => {
      try {
        const res = await quickStockAdjust(fd);
        if (res.ok) {
          setFeedback({ ok: true, message: "Ajuste aplicado y registrado en el Kardex correctamente." });
          setTimeout(() => {
            setOpen(false);
            setFeedback(null);
            setQuantity(1);
            setNote("");
          }, 1200);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al aplicar ajuste";
        setFeedback({ ok: false, message: msg });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (preselectedProduct) {
            setProductId(preselectedProduct.id);
          }
          setOpen(true);
        }}
        className={className}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>{triggerLabel}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#b0894f]/15 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wider text-[#8a6a3a] uppercase">
                  Control de Stock
                </div>
                <h3 className="font-display mt-1 text-2xl font-bold text-[var(--wood-950)]">
                  Ajuste Rápido de Inventario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {feedback ? (
                <div
                  className={`rounded-lg p-3 text-sm font-medium ${
                    feedback.ok
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-1">
                  Mueble / Producto
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-white p-2.5 text-sm text-[var(--wood-950)] focus:border-[#b0894f] focus:outline-none"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(SKU: ${p.sku})` : ""} · Stock actual: {p.stock}
                    </option>
                  ))}
                </select>
                {selected ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Categoría: <span className="font-medium text-stone-700">{selected.category}</span> · Stock actual en taller: <span className="font-bold text-[#b0894f]">{selected.stock} unid.</span>
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-1">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("ADD")}
                    className={`rounded-lg border p-2 text-xs font-bold uppercase transition ${
                      adjustmentType === "ADD"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30"
                        : "border-[var(--border)] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("REMOVE")}
                    className={`rounded-lg border p-2 text-xs font-bold uppercase transition ${
                      adjustmentType === "REMOVE"
                        ? "border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30"
                        : "border-[var(--border)] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    - Salida
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType("SET")}
                    className={`rounded-lg border p-2 text-xs font-bold uppercase transition ${
                      adjustmentType === "SET"
                        ? "border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30"
                        : "border-[var(--border)] bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    = Conteo Físico
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-1">
                    {adjustmentType === "SET" ? "Nuevo Stock Total" : "Cantidad a Mover"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full rounded-lg border border-[var(--border)] bg-white p-2.5 text-sm font-bold text-[var(--wood-950)] focus:border-[#b0894f] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-1">
                    Motivo
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border)] bg-white p-2.5 text-sm text-[var(--wood-950)] focus:border-[#b0894f] focus:outline-none"
                    required
                  >
                    <option value="ADJUST">Conteo físico / Ajuste</option>
                    <option value="WASTE">Merma / Pieza rota o defectuosa</option>
                    <option value="PROD_IN">Terminado artesanal en taller</option>
                    <option value="PURCHASE">Entrada directa de insumo</option>
                    <option value="DEV_CUST">Devolución de cliente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-1">
                  Nota Explicativa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Verificación en estantería B del taller..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-white p-2.5 text-sm text-[var(--wood-950)] focus:border-[#b0894f] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost text-xs uppercase"
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary inline-flex items-center gap-2 text-xs uppercase font-bold"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Aplicar Ajuste</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
