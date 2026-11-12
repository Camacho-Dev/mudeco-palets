"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/logo";
import {
  checkGoogleAuthStatus,
  registerCustomer,
  requestPasswordResetCode,
  resetPasswordWithCode,
} from "./actions";
import "./login.css";

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

function LoginForm() {
  const router = useRouter();
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
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotPreviewUrl, setForgotPreviewUrl] = useState<string | null>(null);
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

    if (result?.error) {
      setLoading(false);
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    if (safeCallback) {
      router.push(safeCallback);
    } else if (role === "ADMIN") {
      router.push("/panel");
    } else if (role === "VENDEDOR") {
      router.push("/vender");
    } else {
      router.push("/");
    }
    router.refresh();
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

      if (loginRes?.error) {
        setLoading(false);
        setTab("login");
        setLoginEmail(regEmail.trim());
        setSuccessMsg("Cuenta creada. Ingresa tu contraseña para acceder.");
        return;
      }

      router.push(safeCallback || "/");
      router.refresh();
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
    <div className="min-h-dvh w-full bg-[#faf7f2] text-[#14100d] lg:grid lg:grid-cols-12">
      {/* Columna izquierda editorial (solo desktop) */}
      <aside className="relative hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[#0e0b09] p-10 xl:p-14 text-[#faf6f1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/brand/store-hero.jpg"
          alt="Taller Mudeco Palets"
          initial={reduceMotion ? false : { scale: 1.08, opacity: 0.2 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.4, ease: easeOutExpo }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b09] via-[#0e0b09]/70 to-[#0e0b09]/80" />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="relative z-10 flex items-center justify-between"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-xs transition hover:border-[#c9a15a]/60 hover:text-[#f3d48c]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la tienda</span>
          </Link>
        </motion.div>

        <div className="relative z-10 max-w-md space-y-5">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: easeOutExpo }}
            className="flex items-center gap-3.5"
          >
            <LogoMark className="h-11 w-11 shrink-0 text-[#d4af37]" />
            <div className="leading-none">
              <span className="font-display block text-2xl tracking-[0.14em] text-white">
                MUDECO PALETS
              </span>
              <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-[#c9a15a]">
                Taller Artesanal
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.16, ease: easeOutExpo }}
            style={{ originX: 0 }}
            className="h-px w-12 bg-[#c9a15a]/70"
          />
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: easeOutExpo }}
            className="font-display text-4xl xl:text-[2.65rem] leading-[1.12] tracking-tight text-white"
          >
            Madera recuperada,{" "}
            <span className="text-[#d4af37]">hecha a tu medida.</span>
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
            className="text-sm leading-relaxed text-white/65"
          >
            Accede a tu cuenta para consultar tus pedidos, descargar facturas y
            dar seguimiento a tus piezas en fabricación.
          </motion.p>
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 text-xs text-white/40"
        >
          © {new Date().getFullYear()} Mudeco Palets · Taller artesanal
        </motion.p>
      </aside>

      {/* Columna derecha: formulario limpio y respirado */}
      <main className="flex min-h-dvh flex-col justify-between px-5 py-6 sm:px-8 lg:col-span-7 lg:px-12 lg:py-10">
        {/* Top bar móvil */}
        <div className="flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6f5d4b] hover:text-[#14100d]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tienda</span>
          </Link>
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6 text-[#9b7435]" />
            <span className="font-display text-sm tracking-[0.12em] text-[#14100d]">
              MUDECO PALETS
            </span>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
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
                  ? "Ingresa con tu correo o continúa con Google."
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
                    className={`relative z-10 rounded-lg py-2 transition-colors cursor-pointer ${
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
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
                >
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
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
                  transition={{ duration: 0.18 }}
                  className="mt-6 space-y-5"
                >
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#dfd3c2] bg-white px-4 py-2.5 text-sm font-medium text-[#14100d] transition hover:border-[#b0894f] hover:bg-[#faf7f2] disabled:opacity-60 cursor-pointer"
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
                          type="text"
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
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
                          onClick={() => {
                            setForgotEmail(loginEmail);
                            setForgotError("");
                            setForgotStep("request");
                            setShowForgotModal(true);
                          }}
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
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-10 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8a77] hover:text-[#14100d] cursor-pointer"
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
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.985 }}
                      disabled={loading || googleLoading}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#14100d] px-4 py-3 text-sm font-semibold text-[#faf6f1] transition hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
                    >
                      <span>{loading ? "Entrando…" : "Iniciar sesión"}</span>
                      {!loading && (
                        <ArrowRight className="h-4 w-4 text-[#d4af37] transition-transform duration-200 group-hover:translate-x-1" />
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
                  transition={{ duration: 0.18 }}
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
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
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
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
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
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="809-555-0123"
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-3.5 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
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
                          className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] py-2.5 pl-10 pr-10 text-sm text-[#14100d] placeholder:text-[#a69787] focus:border-[#b0894f] focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((s) => !s)}
                          aria-label={
                            showRegPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b8a77] hover:text-[#14100d] cursor-pointer"
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
                                    : "bg-[#c9a15a]"
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
                      className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14100d] px-4 py-3 text-sm font-semibold text-[#faf6f1] transition hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
                    >
                      <span>{loading ? "Creando cuenta…" : "Crear cuenta"}</span>
                      {!loading && (
                        <ArrowRight className="h-4 w-4 text-[#d4af37] transition-transform duration-200 group-hover:translate-x-1" />
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <p className="text-center text-[11px] text-[#8c7b68] lg:text-right">
          Conexión segura · Mudeco Palets
        </p>
      </main>

      {/* Modal: Recuperar contraseña */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#e5dacb] bg-white p-6 shadow-2xl space-y-4"
            >
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
                  onClick={() => setShowForgotModal(false)}
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
                    const res = await requestPasswordResetCode(
                      forgotEmail || loginEmail,
                    );
                    setForgotLoading(false);
                    if (!res.success) {
                      setForgotError(
                        res.error || "No se pudo enviar el código.",
                      );
                      return;
                    }
                    if (!forgotEmail && loginEmail) setForgotEmail(loginEmail);
                    setForgotPreviewUrl(res.previewUrl || null);
                    setForgotStep("verify");
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    required
                    value={forgotEmail || loginEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 text-sm text-[#14100d] focus:border-[#b0894f] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#faf6f1] hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
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
                      email: forgotEmail || loginEmail,
                      code: forgotCode,
                      newPassword: forgotNewPassword,
                    });
                    setForgotLoading(false);
                    if (!res.success) {
                      setForgotError(res.error || "Código inválido.");
                      return;
                    }
                    setShowForgotModal(false);
                    setForgotStep("request");
                    setLoginEmail(forgotEmail || loginEmail);
                    setLoginPassword("");
                    setTab("login");
                    setSuccessMsg(
                      "Contraseña actualizada. Ya puedes iniciar sesión.",
                    );
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
                    className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 font-mono text-sm tracking-widest text-[#14100d] focus:border-[#b0894f] focus:bg-white focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    className="w-full rounded-xl border border-[#dfd3c2] bg-[#fcfaf7] px-3.5 py-2.5 text-sm text-[#14100d] focus:border-[#b0894f] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#faf6f1] hover:bg-[#2a211a] disabled:opacity-60 cursor-pointer"
                  >
                    {forgotLoading ? "Actualizando…" : "Guardar contraseña"}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Google Auth no configurado */}
      <AnimatePresence>
        {showGoogleSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
            onClick={() => setShowGoogleSetupModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#e5dacb] bg-white p-6 shadow-2xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-xl text-[#14100d]">
                  Acceso con Google no disponible
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGoogleSetupModal(false)}
                  className="rounded-lg p-1 text-[#8c7b68] hover:bg-[#f4eee5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-[#6f5d4b]">
                El inicio de sesión con Google requiere configurar{" "}
                <code>AUTH_GOOGLE_ID</code> y <code>AUTH_GOOGLE_SECRET</code> en
                el entorno. Mientras tanto, puedes ingresar o crear tu cuenta con
                tu correo electrónico.
              </p>
              <button
                type="button"
                onClick={() => setShowGoogleSetupModal(false)}
                className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold text-[#faf6f1] cursor-pointer"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Cuenta bloqueada */}
      <AnimatePresence>
        {showBlockedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
            onClick={() => setShowBlockedModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
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
                onClick={() => setShowBlockedModal(false)}
                className="w-full rounded-xl bg-[#14100d] py-2.5 text-xs font-semibold text-[#faf6f1] cursor-pointer"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh w-full bg-[#faf7f2] flex items-center justify-center text-xs text-[#8c7b68]">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
