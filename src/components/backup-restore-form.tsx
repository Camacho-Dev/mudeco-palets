"use client";

import { useState, useTransition } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { restoreBackup } from "@/app/(dashboard)/backup/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function BackupRestoreForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);

    const fd = new FormData(e.currentTarget);
    const file = fd.get("backupFile") as File | null;
    if (!file || file.size === 0) {
      setError("Por favor selecciona un archivo JSON para restaurar.");
      return;
    }

    setPendingFormData(fd);
    setConfirmOpen(true);
  }

  function doRestore() {
    if (!pendingFormData) return;
    setConfirmOpen(false);

    startTransition(async () => {
      try {
        const res = await restoreBackup(pendingFormData);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al restaurar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="backupFile">
          Seleccionar archivo JSON (.json)
        </label>
        <input
          id="backupFile"
          name="backupFile"
          type="file"
          accept=".json,application/json"
          className="input file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--wood-100)] file:text-[var(--wood-900)] hover:file:bg-[var(--wood-200)]"
          required
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {result ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{result.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-secondary flex items-center gap-2"
      >
        {pending ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Restaurando datos…</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4" />
            <span>Restaurar datos desde JSON</span>
          </>
        )}
      </button>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doRestore}
        title="Restaurar copia de seguridad"
        description="¿Confirmas la restauración del respaldo? Esta acción sincronizará los clientes, productos y proveedores a partir del archivo seleccionado."
        confirmLabel="Sí, restaurar datos"
        cancelLabel="Cancelar"
        isDestructive={false}
        isPending={pending}
      />
    </form>
  );
}
