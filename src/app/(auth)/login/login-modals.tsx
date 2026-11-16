"use client";

import { useState, type ReactNode } from "react";
import { ShieldAlert, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { requestPasswordResetCode, resetPasswordWithCode } from "./actions";

function ModalShell({
  open,
  onClose,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            className={className}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ForgotPasswordModal({
  open,
  initialEmail,
  onClose,
  onReset,
}: {
  open: boolean;
  initialEmail: string;
  onClose: () => void;
  onReset: (email: string) => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="w-full max-w-sm rounded-2xl border border-[#e5dacb] bg-white p-6 shadow-2xl space-y-4"
    >
      <ForgotPasswordContent
        initialEmail={initialEmail}
        onClose={onClose}
        onReset={onReset}
      />
    </ModalShell>
  );
}

/** Se monta en cada apertura: el estado arranca limpio (paso "request", sin error). */
function ForgotPasswordContent({
  initialEmail,
  onClose,
  onReset,
}: {
  initialEmail: string;
  onClose: () => void;
  onReset: (email: string) => void;
}) {
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState(initialEmail);
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotPreviewUrl, setForgotPreviewUrl] = useState<string | null>(null);

  const email = forgotEmail || initialEmail;

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-2xl text-[#14100d]">
            Recuperar acceso
          </h3>
          <p className="mt-0.5 text-xs text-[#6f5d4b]">
            {forgotStep === "request"
              ? "Te enviaremos un código de 6 dígitos a tu correo."
              : "Ingresa el código recibido y tu nueva contraseña."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-[#8c7b68] hover:bg-[#f4eee5] hover:text-[#14100d]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {forgotError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {forgotError}
        </div>
      )}

      {forgotStep === "request" ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setForgotError("");
            setForgotLoading(true);
            const res = await requestPasswordResetCode(email);
            setForgotLoading(false);
            if (!res.success) {
              setForgotError(res.error || "No se pudo enviar el código.");
              return;
            }
            if (!forgotEmail && initialEmail) setForgotEmail(initialEmail);
            setForgotPreviewUrl(res.previewUrl || null);
            setForgotStep("verify");
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 text-sm text-[#14100d] focus:border-brand-gold-strong focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-cream-warm hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
          >
            {forgotLoading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setForgotError("");
            setForgotLoading(true);
            const res = await resetPasswordWithCode({
              email,
              code: forgotCode,
              newPassword: forgotNewPassword,
            });
            setForgotLoading(false);
            if (!res.success) {
              setForgotError(res.error || "Código inválido.");
              return;
            }
            onReset(email);
          }}
          className="space-y-3"
        >
          {forgotPreviewUrl && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
              Código generado.{" "}
              <a
                href={forgotPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                Ver correo de prueba
              </a>
            </div>
          )}
          <input
            type="text"
            required
            maxLength={6}
            value={forgotCode}
            onChange={(e) => setForgotCode(e.target.value)}
            placeholder="Código de 6 dígitos"
            className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 font-mono text-sm tracking-widest text-[#14100d] focus:border-brand-gold-strong focus:bg-white focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            value={forgotNewPassword}
            onChange={(e) => setForgotNewPassword(e.target.value)}
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 text-sm text-[#14100d] focus:border-brand-gold-strong focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={forgotLoading}
            className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-cream-warm hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
          >
            {forgotLoading ? "Actualizando…" : "Guardar contraseña"}
          </button>
        </form>
      )}
    </>
  );
}

export function GoogleSetupModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="w-full max-w-sm rounded-2xl border border-[#e5dacb] bg-white p-6 shadow-2xl space-y-3"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-display text-xl text-[#14100d]">
          Acceso con Google no disponible
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-[#8c7b68] hover:bg-[#f4eee5]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs leading-relaxed text-[#6f5d4b]">
        El inicio de sesión con Google requiere configurar{" "}
        <code>AUTH_GOOGLE_ID</code> y <code>AUTH_GOOGLE_SECRET</code> en el
        entorno. Mientras tanto, puedes ingresar o crear tu cuenta con tu correo
        electrónico.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold text-brand-cream-warm cursor-pointer"
      >
        Entendido
      </button>
    </ModalShell>
  );
}

export function BlockedAccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl space-y-3"
    >
      <div className="flex items-center gap-2.5 text-rose-700">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <h3 className="font-display text-xl">Cuenta suspendida</h3>
      </div>
      <p className="text-xs leading-relaxed text-[#6f5d4b]">
        Tu cuenta se encuentra temporalmente suspendida. Comunícate con
        administración para revisar el estado de tu acceso.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold text-brand-cream-warm cursor-pointer"
      >
        Cerrar
      </button>
    </ModalShell>
  );
}
