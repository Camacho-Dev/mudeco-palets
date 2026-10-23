"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/logo";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";

export function WelcomeModal({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    // Si la URL pide explícitamente ocultar con ?welcome=0
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("welcome") === "0") return;
        sessionStorage.removeItem("mudeco_welcome_seen");
      }
    } catch {}

    // En desarrollo local o para usuarios no autenticados, se abre de inmediato
    const isDev = process.env.NODE_ENV !== "production";
    if (isAuthenticated && !isDev) {
      return;
    }

    // Apertura inmediata y rápida
    setOpen(true);
  }, [isAuthenticated]);

  // Permitir reabrir con evento global si se requiere
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mudeco:welcome", onOpen);
    return () => window.removeEventListener("mudeco:welcome", onOpen);
  }, []);

  // Soporte para cerrar con la tecla Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleDismiss]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoading(false);
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      // Cierre del modal y redirección rápida
      setOpen(false);

      if (role === "ADMIN") {
        router.push("/panel");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setLoading(false);
      setError("Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.");
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto"
        >
          {/* Tarjeta Modal: Entrada de posición rápida y limpia. Se posiciona y queda estática */}
          <motion.div
            key="welcome-card"
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full max-w-md sm:max-w-lg rounded-2xl border border-[#c9a15a]/45 bg-[#12100d] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white"
          >
            {/* Botón de cierre directo */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 z-20 rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/60 hover:border-[#c9a15a]/50 hover:bg-[#c9a15a]/15 hover:text-white transition cursor-pointer"
              title="Cerrar y continuar como invitado (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Contenedor de elementos: Cada uno se coloca en su lugar con animación de posición rápida */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.035,
                    delayChildren: 0.02,
                  },
                },
              }}
              className="text-center"
            >
              {/* Logo: Se desliza a su lugar desde arriba */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  },
                }}
                className="flex justify-center mb-2.5"
              >
                <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-[#c9a15a]/30 shadow-md">
                  <BrandLogo width={120} height={92} className="h-11 w-auto sm:h-12" priority />
                </div>
              </motion.div>

              {/* Badge: Se posiciona rápidamente */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  },
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-3 py-0.5 text-[0.62rem] font-bold tracking-[0.18em] text-[#d4b06e] uppercase mb-1.5"
              >
                <Sparkles className="h-3 w-3 text-[#c9a15a]" />
                <span>Acceso · Mudeco Palets</span>
              </motion.div>

              {/* Título: Se posiciona desde abajo */}
              <motion.h2
                id="login-modal-title"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  },
                }}
                className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight"
              >
                Iniciar sesión
              </motion.h2>

              {/* Subtítulo: Se posiciona desde abajo */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.18, ease: "easeOut" },
                  },
                }}
                className="mt-1 text-xs text-white/70 max-w-sm mx-auto leading-relaxed"
              >
                Ingresa con tu cuenta o continúa navegando la tienda libremente como invitado.
              </motion.p>

              {/* Formulario de Login */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-left">
                {/* Estilos para neutralizar el fondo blanco de contraseñas guardadas del navegador */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .modal-dark-input:-webkit-autofill,
                    .modal-dark-input:-webkit-autofill:hover,
                    .modal-dark-input:-webkit-autofill:focus,
                    .modal-dark-input:-webkit-autofill:active {
                      -webkit-text-fill-color: #faf6f1 !important;
                      caret-color: #c9a15a !important;
                      -webkit-box-shadow: 0 0 0 1000px #14120e inset !important;
                      box-shadow: 0 0 0 1000px #14120e inset !important;
                      background-color: #14120e !important;
                      transition: background-color 99999s ease-in-out 0s !important;
                    }
                  `
                }} />

                {/* Campo Correo: Se desliza a su lugar */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.18, ease: "easeOut" },
                    },
                  }}
                >
                  <label className="block text-[0.66rem] font-bold tracking-wider text-white/75 uppercase mb-1">
                    Correo electrónico
                  </label>
                  <div className="group relative flex items-center rounded-xl border border-white/15 bg-[#14120e] px-3.5 py-2.5 transition-colors duration-150 focus-within:border-[#c9a15a] focus-within:ring-1 focus-within:ring-[#c9a15a]/40">
                    <Mail className="h-4 w-4 text-[#c9a15a] mr-2.5 shrink-0" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      autoComplete="username"
                      className="modal-dark-input dark-autofill w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none"
                    />
                  </div>
                </motion.div>

                {/* Campo Contraseña: Se desliza a su lugar */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.18, ease: "easeOut" },
                    },
                  }}
                >
                  <label className="block text-[0.66rem] font-bold tracking-wider text-white/75 uppercase mb-1">
                    Contraseña
                  </label>
                  <div className="group relative flex items-center rounded-xl border border-white/15 bg-[#14120e] px-3.5 py-2.5 transition-colors duration-150 focus-within:border-[#c9a15a] focus-within:ring-1 focus-within:ring-[#c9a15a]/40">
                    <Lock className="h-4 w-4 text-[#c9a15a] mr-2.5 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="modal-dark-input dark-autofill w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                      title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Error */}
                {error ? (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span className="leading-tight">{error}</span>
                  </div>
                ) : null}

                {/* Botón Principal: Se coloca en su lugar */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.18, ease: "easeOut" },
                    },
                  }}
                  className="pt-1"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a15a] bg-gradient-to-r from-[#c9a15a] via-[#dfbe78] to-[#c9a15a] py-2.5 text-xs font-bold tracking-[0.12em] text-[#0a0a0a] uppercase shadow-md hover:brightness-105 active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesión</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Opción destacada: Iniciar sesión más tarde */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.18, ease: "easeOut" },
                    },
                  }}
                >
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] py-2.5 text-xs font-semibold tracking-wider text-white/85 hover:border-[#c9a15a]/70 hover:bg-[#c9a15a]/10 hover:text-white active:scale-[0.99] transition cursor-pointer"
                  >
                    <Clock className="h-3.5 w-3.5 text-[#c9a15a]" />
                    <span>Iniciar sesión más tarde</span>
                  </button>
                </motion.div>
              </form>

              {/* Nota inferior estática */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { duration: 0.18 },
                  },
                }}
                className="mt-3 pt-2.5 border-t border-white/10 text-center text-[0.68rem] text-white/45"
              >
                <span>Puedes explorar el catálogo y cotizar como invitado sin registrarte.</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
