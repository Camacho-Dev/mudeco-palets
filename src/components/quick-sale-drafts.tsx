"use client";

import { Check, Edit2, Plus, X } from "lucide-react";
import type { CustomerOption, InvoiceDraft } from "./quick-sale-types";

export function QuickSaleDraftTabs({
  drafts,
  activeDraft,
  customers,
  setError,
  setActiveDraftId,
  setIsEditingName,
  closeDraft,
  addNewDraft,
}: {
  drafts: InvoiceDraft[];
  activeDraft: InvoiceDraft;
  customers: CustomerOption[];
  setError: (msg: string) => void;
  setActiveDraftId: (id: string) => void;
  setIsEditingName: (v: boolean) => void;
  closeDraft: (id: string, e: React.MouseEvent) => void;
  addNewDraft: () => void;
}) {
  return (
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
                ? "border-[var(--brass)] bg-[var(--wood-950)] text-brand-cream-warm shadow-sm"
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
                aria-label="Cerrar esta factura"
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
        <span>Nueva factura</span>
      </button>
    </div>
  );
}

export function QuickSaleDraftHeader({
  activeDraft,
  isEditingName,
  setIsEditingName,
  nameInput,
  setNameInput,
  saveCustomName,
  todayLabel,
}: {
  activeDraft: InvoiceDraft;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  nameInput: string;
  setNameInput: (v: string) => void;
  saveCustomName: () => void;
  todayLabel: string;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--wood-950)] px-5 py-4 text-brand-cream-warm">
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
  );
}
