"use client";

import { getSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { checkGoogleAuthStatus, registerCustomer } from "./actions";
import {
  BlockedAccountModal,
  ForgotPasswordModal,
  GoogleSetupModal,
} from "./login-modals";


function GoogleIcon({ className = "h-4 w-4 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

function getPasswordStrength(p: string) {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

export function LoginForm({ googleEnabled = true }: { googleEnabled?: boolean }) {

  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
  const easeOutExpo = [0.16, 1, 0.3, 1] as const;
  const callback = params.get("callbackUrl");
  const isFromCheckout =
    callback === "/checkout" || Boolean(callback?.startsWith("/checkout"));

  const [tab, setTab] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login",
  );
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modales esenciales
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    const urlError = params.get("error");
    if (urlError === "AccessDenied") {
      setShowBlockedModal(true);
      setError(
        "Acceso restringido: esta cuenta se encuentra suspendida temporalmente.",
      );
    }
  }, [params]);

  const safeCallback =
    callback &&
    callback.startsWith("/") &&
    !callback.startsWith("//") &&
    callback !== "/login"
      ? callback
      : null;

  const passwordStrength = getPasswordStrength(regPassword);

  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginEmail.trim() || !loginPassword) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email: loginEmail.trim(),
      password: loginPassword,
      redirect: false,
    });

    if (!result || result.error || result.ok === false) {
      setLoading(false);
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      return;
    }

    const session = await getSession();
    if (!session?.user) {
      setLoading(false);
      setError(
        "No se pudo establecer la sesión. Verifica que las cookies estén habilitadas e intenta nuevamente.",
      );
      return;
    }
    const role = session.user.role;
    const loggedEmail = session.user.email?.trim().toLowerCase();
    if (loggedEmail) {
      try {
        sessionStorage.removeItem(`mudeco_returning_greeted:${loggedEmail}`);
      } catch {
        /* ignore */
      }
    }

    const target =
      safeCallback ||
      (role === "ADMIN" ? "/panel" : role === "VENDEDOR" ? "/vender" : "/");
    window.location.assign(target);
  }

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    try {
      const status = await checkGoogleAuthStatus();
      if (!status.configured) {
        setGoogleLoading(false);
        setShowGoogleSetupModal(true);
        return;
      }
      await signIn("google", { callbackUrl: safeCallback || "/" });
    } catch {
      setGoogleLoading(false);
      setError(
        "No se pudo iniciar sesión con Google. Intenta con tu correo o contraseña.",
      );
    }
  }

  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@") || !regEmail.includes(".")) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }
    const phoneDigits = regPhone.replace(/\D/g, "");
    if (!regPhone.trim() || phoneDigits.length < 10) {
      setError(
        "El número de WhatsApp es obligatorio y debe tener al menos 10 dígitos.",
      );
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const regRes = await registerCustomer({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });

      if (regRes?.error) {
        setError(regRes.error);
        setLoading(false);
        return;
      }

      setSuccessMsg("Cuenta creada. Iniciando sesión…");
      const loginRes = await signIn("credentials", {
        email: regEmail.trim(),
        password: regPassword,
        redirect: false,
      });

      if (!loginRes || loginRes.error || loginRes.ok === false) {
        setLoading(false);
        setTab("login");
        setLoginEmail(regEmail.trim());
        setSuccessMsg("Cuenta creada. Ingresa tu contraseña para acceder.");
        return;
      }

      const session = await getSession();
      if (!session?.user) {
        setLoading(false);
        setTab("login");
        setLoginEmail(regEmail.trim());
        setSuccessMsg(
          "Cuenta creada. Ingresa tu contraseña para iniciar sesión.",
        );
        return;
      }

      const dest =
        !safeCallback || safeCallback === "/"
          ? "/?bienvenido=1"
          : safeCallback;
      window.location.assign(dest);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError("Error al registrarse: " + msg);
      setLoading(false);
    }
  }

  function switchTab(next: "login" | "register") {
    setTab(next);
    setError("");
    setSuccessMsg("");
  }

  return (
    <>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easeOutExpo }}
          className="rounded-2xl border border-[#e5dacb] bg-white p-6 shadow-[0_12px_40px_-16px_rgba(20,16,13,0.12)] sm:p-8"
        >
          {/* Encabezado */}
          <div className="space-y-1.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#9b7435]">
              Mudeco Palets ·{" "}
              {isFromCheckout ? "Continuar compra" : "Espacio de cliente"}
            </p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={tab}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: easeOutExpo }}
                className="font-display text-3xl text-[#14100d]"
              >
                {tab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
              </motion.h2>
            </AnimatePresence>
            <p className="text-xs text-[#6f5d4b]">
              {tab === "login"
                ? googleEnabled
                  ? "Ingresa con tu correo o continúa con Google."
                  : "Ingresa con tu correo y contraseña."
                : "Regístrate en segundos para gestionar tus pedidos."}
            </p>
          </div>

          {/* Selector de pestaña con indicador deslizante */}
          <div className="relative mt-6 grid grid-cols-2 rounded-xl bg-[#f4eee5] p-1 text-xs font-semibold">
            {(["login", "register"] as const).map((item) => {
              const active = tab === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchTab(item)}
                  className={`relative z-10 min-h-[44px] rounded-lg py-2 transition-colors cursor-pointer ${
                    active
                      ? "text-[#14100d]"
                      : "text-[#6f5d4b] hover:text-[#14100d]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="login-tab-pill"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 -z-10 rounded-lg bg-white shadow-2xs"
                    />
                  )}
                  {item === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </button>
              );
            })}
          </div>

          {/* Mensajes de estado */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="login-error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                key="login-success"
                role="status"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.13 }}
                className="mt-6 space-y-5"
              >
                {googleEnabled && (
                  <>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#dfd3c2] bg-white px-4 py-2.5 text-sm font-medium text-[#14100d] transition sm:hover:-translate-y-0.5 hover:border-brand-gold-strong hover:bg-brand-cream disabled:opacity-60 cursor-pointer"
                >
                  <GoogleIcon />
                  <span>
                    {googleLoading
                      ? "Conectando con Google…"
                      : "Continuar con Google"}
                  </span>
                </motion.button>

                <div className="relative flex items-center">
                  <div className="grow border-t border-[#ece3d6]" />
                  <span className="mx-3 text-[0.7rem] font-medium text-[#8c7b68]">
                    o con tu correo
                  </span>
                  <div className="grow border-t border-[#ece3d6]" />
                </div>

                  </>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-1.5 block text-xs font-semibold text-[#3d3126]"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="login-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="block text-xs font-semibold text-[#3d3126]"
                      >
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-medium text-[#9b7435] hover:underline cursor-pointer"
                      >
                        ¿La olvidaste?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-12 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#9b8a77] hover:text-[#14100d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || googleLoading}
                    className="group flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#14100d] px-4 py-3 text-sm font-semibold text-brand-cream-warm transition sm:hover:-translate-y-0.5 hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
                  >
                    <span>{loading ? "Entrando…" : "Iniciar sesión"}</span>
                    {!loading && (
                      <ArrowRight className="h-4 w-4 text-brand-gold transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.13 }}
                className="mt-6"
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="mb-1 block text-xs font-semibold text-[#3d3126]"
                    >
                      Nombre completo
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-email"
                      className="mb-1 block text-xs font-semibold text-[#3d3126]"
                    >
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-phone"
                      className="mb-1 block text-xs font-semibold text-[#3d3126]"
                    >
                      WhatsApp / Teléfono
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="reg-phone"
                        type="tel"
                        inputMode="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="809-555-0123"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="mb-1 block text-xs font-semibold text-[#3d3126]"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b8a77]" />
                      <input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-12 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-brand-gold-strong focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((s) => !s)}
                        aria-label={
                          showRegPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#9b8a77] hover:text-[#14100d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold cursor-pointer"
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {regPassword && (
                      <div className="mt-2 grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((lvl) => (
                          <span
                            key={lvl}
                            className={`h-1 rounded-full transition-colors ${
                              passwordStrength >= lvl
                                ? passwordStrength >= 3
                                  ? "bg-emerald-500"
                                  : "bg-brand-gold"
                                : "bg-[#ebe2d6]"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14100d] px-4 py-3 text-sm font-semibold text-brand-cream-warm transition hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
                  >
                    <span>{loading ? "Creando cuenta…" : "Crear cuenta"}</span>
                    {!loading && (
                      <ArrowRight className="h-4 w-4 text-brand-gold transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      <ForgotPasswordModal
        open={showForgotModal}
        initialEmail={loginEmail}
        onClose={() => setShowForgotModal(false)}
        onReset={(email) => {
          setShowForgotModal(false);
          setLoginEmail(email);
          setLoginPassword("");
          setTab("login");
          setSuccessMsg("Contraseña actualizada. Ya puedes iniciar sesión.");
        }}
      />
      <GoogleSetupModal
        open={showGoogleSetupModal}
        onClose={() => setShowGoogleSetupModal(false)}
      />
      <BlockedAccountModal
        open={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
    </>
  );
}
