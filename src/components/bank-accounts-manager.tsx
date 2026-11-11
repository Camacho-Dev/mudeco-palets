"use client";

import { useState, useTransition } from "react";
import { Building2, Plus, Trash2, Check, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { saveBankAccounts } from "@/app/(dashboard)/configuracion/actions";

export interface BankAccountItem {
  bank: string;
  type: string;
  accountNumber: string;
  holder: string;
  rnc?: string;
  color?: string;
}

const DOMINICAN_BANK_PRESETS = [
  { bank: "Banco Popular Dominicano", color: "#0047ba", defaultType: "Cuenta Corriente en DOP" },
  { bank: "Banreservas (Banco de Reservas)", color: "#0072ce", defaultType: "Cuenta de Ahorros en DOP" },
  { bank: "Banco BHD", color: "#008852", defaultType: "Cuenta de Ahorros en DOP" },
  { bank: "Asociación Popular (APAP)", color: "#d97706", defaultType: "Cuenta de Ahorros en DOP" },
  { bank: "Banesco Banco Múltiple", color: "#006940", defaultType: "Cuenta de Ahorros en DOP" },
  { bank: "Banco Santa Cruz", color: "#e11d48", defaultType: "Cuenta de Ahorros en DOP" },
  { bank: "Otro Banco", color: "#78350f", defaultType: "Cuenta de Ahorros en DOP" },
];

export function BankAccountsManager({
  initialAccountsJson,
  companyName,
  companyTaxId,
}: {
  initialAccountsJson: string | null;
  companyName: string;
  companyTaxId: string | null;
}) {
  const [accounts, setAccounts] = useState<BankAccountItem[]>(() => {
    if (!initialAccountsJson) return [];
    try {
      const parsed = JSON.parse(initialAccountsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isPending, startTransition] = useTransition();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario de nueva cuenta
  const [newBank, setNewBank] = useState(DOMINICAN_BANK_PRESETS[0].bank);
  const [newType, setNewType] = useState(DOMINICAN_BANK_PRESETS[0].defaultType);
  const [newAccountNum, setNewAccountNum] = useState("");
  const [newHolder, setNewHolder] = useState(companyName || "Mudeco Palets SRL");
  const [newRnc, setNewRnc] = useState(companyTaxId || "");
  const [newColor, setNewColor] = useState(DOMINICAN_BANK_PRESETS[0].color);

  function handleBankSelect(bankName: string) {
    setNewBank(bankName);
    const found = DOMINICAN_BANK_PRESETS.find((b) => b.bank === bankName);
    if (found) {
      setNewColor(found.color);
      setNewType(found.defaultType);
    }
  }

  function addAccount() {
    if (!newAccountNum.trim()) {
      setErrorMsg("Por favor escribe el número de cuenta");
      return;
    }
    if (!newHolder.trim()) {
      setErrorMsg("Por favor escribe el nombre del titular");
      return;
    }

    setErrorMsg(null);
    const item: BankAccountItem = {
      bank: newBank.trim(),
      type: newType.trim(),
      accountNumber: newAccountNum.trim(),
      holder: newHolder.trim(),
      rnc: newRnc.trim() || undefined,
      color: newColor,
    };

    setAccounts([...accounts, item]);
    setNewAccountNum("");
  }

  function removeAccount(index: number) {
    setAccounts(accounts.filter((_, i) => i !== index));
  }

  function handleSaveAll() {
    setErrorMsg(null);
    setSavedSuccess(false);

    startTransition(async () => {
      try {
        const json = JSON.stringify(accounts);
        await saveBankAccounts(json);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Error al guardar cuentas");
      }
    });
  }

  return (
    <div className="card space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--wood-950)] flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#b0894f]" />
            Cuentas Bancarias Oficiales (Para Transferencias en la Tienda)
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Estas cuentas son las que verán los clientes en la tienda web al pagar por transferencia o subir comprobantes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isPending}
          className="btn btn-primary text-xs py-2 px-4 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-300" />
              <span>¡Cuentas Guardadas!</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Guardar Cuentas</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Listado de cuentas configuradas actualmente */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
          Cuentas Activas ({accounts.length})
        </p>

        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-6 text-center text-xs text-[var(--muted)]">
            <CreditCard className="mx-auto h-8 w-8 text-stone-400 mb-2" />
            <p className="font-semibold text-stone-700">No hay cuentas bancarias configuradas aún</p>
            <p className="mt-1">Agrega abajo tu cuenta corriente o de ahorros (Popular, Banreservas, BHD, etc.) para que tus clientes puedan transferirte directamente.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((acc, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-xl border border-stone-200 bg-white p-4 shadow-xs"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: acc.color || "#b0894f" }}
                />
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--wood-950)] leading-tight">
                      {acc.bank}
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]">{acc.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccount(idx)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 rounded-lg bg-stone-50 p-2.5 border border-stone-200/80">
                  <p className="text-[10px] uppercase font-bold text-[var(--muted)]">No. de Cuenta</p>
                  <p className="font-mono text-sm font-bold text-[var(--wood-950)] select-all">
                    {acc.accountNumber}
                  </p>
                </div>

                <div className="mt-2.5 text-[11px] text-[var(--muted)] space-y-0.5">
                  <p>
                    <strong className="text-stone-700">Titular:</strong> {acc.holder}
                  </p>
                  {acc.rnc && (
                    <p>
                      <strong className="text-stone-700">RNC/Cédula:</strong> {acc.rnc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario para agregar una nueva cuenta */}
      <div className="rounded-2xl border border-stone-200 bg-[#fbf9f6] p-4.5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--wood-900)] flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-[#b0894f]" />
          Agregar Nueva Cuenta Bancaria
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          <div>
            <label className="label">Banco</label>
            <select
              value={newBank}
              onChange={(e) => handleBankSelect(e.target.value)}
              className="input text-xs"
            >
              {DOMINICAN_BANK_PRESETS.map((b) => (
                <option key={b.bank} value={b.bank}>
                  {b.bank}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Tipo de cuenta</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="input text-xs"
            >
              <option value="Cuenta Corriente en DOP">Cuenta Corriente en DOP</option>
              <option value="Cuenta de Ahorros en DOP">Cuenta de Ahorros en DOP</option>
              <option value="Cuenta de Ahorros en USD">Cuenta de Ahorros en USD</option>
              <option value="Cuenta Corriente en USD">Cuenta Corriente en USD</option>
            </select>
          </div>

          <div>
            <label className="label">Número de cuenta</label>
            <input
              type="text"
              value={newAccountNum}
              onChange={(e) => setNewAccountNum(e.target.value)}
              placeholder="Ej. 812345678"
              className="input text-xs font-mono"
            />
          </div>

          <div>
            <label className="label">Nombre del Titular</label>
            <input
              type="text"
              value={newHolder}
              onChange={(e) => setNewHolder(e.target.value)}
              placeholder="Ej. Mudeco Palets SRL"
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">RNC o Cédula (Opcional)</label>
            <input
              type="text"
              value={newRnc}
              onChange={(e) => setNewRnc(e.target.value)}
              placeholder="Ej. 1-32-45678-9"
              className="input text-xs"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={addAccount}
              className="btn btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir a la lista</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

