"use client";

import { useState } from "react";
import { Building2, Copy, Check } from "lucide-react";

type BankInfo = {
  bank: string;
  type: string;
  accountNumber: string;
  holder: string;
  rnc: string;
  color: string;
};

export function BankAccountsGrid({ banks }: { banks: BankInfo[] }) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = async (account: string) => {
    try {
      await navigator.clipboard.writeText(account);
      setCopiedAccount(account);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {banks.map((b) => {
        const isCopied = copiedAccount === b.accountNumber;
        return (
          <div
            key={b.bank}
            className="relative overflow-hidden rounded-2xl border border-[#e2d5c5] bg-white p-5 shadow-xs transition hover:border-[#c9a15a] hover:shadow-md"
          >
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: b.color || "#c9a15a" }}
            />
            <div className="flex items-center gap-2.5 pt-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5d8c8] bg-[#faf6f1] text-[#b0894f]">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--wood-950)]">
                  {b.bank}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{b.type}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#ebdfd1] bg-[#faf7f2] px-3.5 py-2.5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                  Número de cuenta
                </p>
                <p className="font-mono text-sm font-bold text-[var(--wood-950)] selection:bg-[#f3e5d0]">
                  {b.accountNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(b.accountNumber)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                  isCopied
                    ? "bg-emerald-600 text-white"
                    : "border border-[#d8c8b4] bg-white text-[var(--wood-900)] hover:border-[#c9a15a] hover:text-[#8a6a3a]"
                }`}
                title="Copiar número de cuenta"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                <strong className="text-[var(--wood-900)]">Titular:</strong>{" "}
                {b.holder}
              </span>
              <span>
                <strong className="text-[var(--wood-900)]">RNC:</strong> {b.rnc}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
