"use client";

export function PaymentForm({
  action,
  maxAmount,
}: {
  action: (fd: FormData) => Promise<void>;
  maxAmount: number;
}) {
  return (
    <form action={action} className="space-y-3 border-t border-slate-100 pt-4">
      <div>
        <label className="label" htmlFor="amount">
          Monto
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount}
          defaultValue={maxAmount}
          required
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="method">
          Método
        </label>
        <select id="method" name="method" className="input" defaultValue="CASH">
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
          <option value="CHECK">Cheque</option>
          <option value="OTHER">Otro</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="paidAt">
          Fecha
        </label>
        <input
          id="paidAt"
          name="paidAt"
          type="date"
          className="input"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div>
        <label className="label" htmlFor="notes">
          Notas
        </label>
        <input id="notes" name="notes" className="input" />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Registrar pago
      </button>
    </form>
  );
}
