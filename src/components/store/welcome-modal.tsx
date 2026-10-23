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

// Partículas doradas ambientales flotantes
const FLOATING_PARTICLES = [
  { id: 1, top: "12%", left: "14%", size: 6, delay: 0.2, duration: 4.5 },
  { id: 2, top: "24%", right: "12%", size: 5, delay: 0.5, duration: 5.2 },
  { id: 3, bottom: "18%", left: "18%", size: 7, delay: 0.8, duration: 4.8 },
  { id: 4, bottom: "28%", right: "16%", size: 4, delay: 0.1, duration: 6.0 },
  { id: 5, top: "45%", left: "8%", size: 5, delay: 1.1, duration: 5.5 },
  { id: 6, top: "60%", right: "8%", size: 6, delay: 0.7, duration: 4.9 },
];

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

        // Limpiar cualquier residuo de sessionStorage de pruebas anteriores
        sessionStorage.removeItem("mudeco_welcome_seen");
      }
    } catch {}

    // En desarrollo local o para usuarios no autenticados, se abre automáticamente:
    const isDev = process.env.NODE_ENV !== "production";
    if (isAuthenticated && !isDev) {
      return;
    }

    // Micro-retraso para que el montaje active la animación de Framer Motion
    const timer = setTimeout(() => {
      setOpen(true);
    }, 120);

    return () => clearTimeout(timer);
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

      // Cierre del modal y redirección según rol
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
          transition={{ duration: 0.38, ease: "easeOut" }}
          onClick={(e) => {
            // Cerrar si se hace clic fuera de la tarjeta
            if (e.target === e.currentTarget) handleDismiss();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          style={{ perspective: 1200 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto"
        >
          {/* Partículas doradas sutiles que flotan en el fondo borroso */}
          {FLOATING_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.2, 0.75, 0.2],
                scale: [0.8, 1.25, 0.8],
                y: [-12, 12, -12],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: p.top,
                bottom: p.bottom,
                left: p.left,
                right: p.right,
                width: p.size,
                height: p.size,
              }}
              className="pointer-events-none rounded-full bg-[#c9a15a] shadow-[0_0_12px_#c9a15a]"
            />
          ))}

          {/* Tarjeta Modal animada con física elástica de alta gama y borde dorado */}
          <motion.div
            key="welcome-card"
            initial={{
              opacity: 0,
              scale: 0.76,
              y: 70,
              rotateX: 14,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 30,
              filter: "blur(6px)",
              transition: { duration: 0.25, ease: "easeIn" },
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 220,
              mass: 0.85,
            }}
            className="group/card relative w-full max-w-md sm:max-w-lg overflow-hidden rounded-[28px] border border-[#c9a15a]/45 bg-[#110f0c]/96 p-6 sm:p-9 shadow-[0_40px_120px_rgba(0,0,0,0.98),0_0_60px_rgba(201,161,90,0.18)] text-white backdrop-blur-3xl"
          >
            {/* Haz de luz perimetral dorado animado que recorre el borde */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-[28px] overflow-hidden opacity-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(201,161,90,0.9)_360deg)]"
              />
            </div>

            {/* Haz de luz dorada radial en el fondo interior */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-gradient-to-b from-[#c9a15a]/30 to-transparent blur-3xl"
            />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#c9a15a]/15 blur-3xl" />

            {/* Borde sutil interior decorativo */}
            <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-[#c9a15a]/12" />

            {/* Botón de cierre en esquina superior */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="absolute top-5 right-5 z-20 rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/60 hover:border-[#c9a15a]/50 hover:bg-[#c9a15a]/15 hover:text-white transition cursor-pointer shadow-sm"
              title="Cerrar y continuar como invitado (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Contenido con revelación escalonada */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.07,
                    delayChildren: 0.1,
                  },
                },
              }}
              className="relative z-10 text-center"
            >
              {/* Logo con halo sutil pulsante */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -20, scale: 0.8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", damping: 16, stiffness: 280 },
                  },
                }}
                className="flex justify-center mb-3"
              >
                <div className="relative inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-[#c9a15a]/35 shadow-[0_0_30px_rgba(201,161,90,0.2)]">
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-[#c9a15a]/50"
                  />
                  <BrandLogo width={130} height={100} className="h-12 w-auto sm:h-14" priority />
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.7 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    transition: { type: "spring", stiffness: 320, damping: 20 },
                  },
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a15a]/50 bg-gradient-to-r from-[#c9a15a]/20 via-[#c9a15a]/10 to-[#c9a15a]/20 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#d4b06e] uppercase backdrop-blur-md mb-2 shadow-[0_0_15px_rgba(201,161,90,0.15)]"
              >
                <Sparkles className="h-3 w-3 text-[#c9a15a]" />
                <span>Acceso · Mudeco Palets</span>
              </motion.div>

              {/* Título */}
              <motion.h2
                id="login-modal-title"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="font-display text-2xl sm:text-3xl text-white font-medium tracking-tight"
              >
                Iniciar sesión
              </motion.h2>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="mt-1 text-xs text-white/70 max-w-sm mx-auto leading-relaxed"
              >
                Ingresa con tu cuenta o continúa navegando la tienda libremente como invitado.
              </motion.p>

              {/* Formulario de Login */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 text-left">
                {/* Estilos dedicados para neutralizar el fondo blanco del autofill de contraseñas guardadas del navegador */}
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

                {/* Campo Correo / Usuario */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <label className="block text-[0.68rem] font-bold tracking-wider text-white/75 uppercase mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="group relative flex items-center rounded-xl border border-white/15 bg-[#14120e] px-3.5 py-2.5 transition-all duration-200 focus-within:border-[#c9a15a] focus-within:ring-2 focus-within:ring-[#c9a15a]/25">
                    <Mail className="h-4 w-4 text-[#c9a15a] mr-2.5 shrink-0 transition-transform group-focus-within:scale-110" />
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

                {/* Campo Contraseña */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <label className="block text-[0.68rem] font-bold tracking-wider text-white/75 uppercase mb-1.5">
                    Contraseña
                  </label>
                  <div className="group relative flex items-center rounded-xl border border-white/15 bg-[#14120e] px-3.5 py-2.5 transition-all duration-200 focus-within:border-[#c9a15a] focus-within:ring-2 focus-within:ring-[#c9a15a]/25">
                    <Lock className="h-4 w-4 text-[#c9a15a] mr-2.5 shrink-0 transition-transform group-focus-within:scale-110" />
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

                {/* Mensaje de error si falla */}
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span className="leading-tight">{error}</span>
                  </motion.div>
                ) : null}

                {/* Botón Principal: Iniciar sesión */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="pt-1.5"
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 0 30px rgba(201,161,90,0.5), 0 8px 20px rgba(0,0,0,0.6)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group gold-shimmer-btn relative overflow-hidden w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a15a] bg-gradient-to-r from-[#c9a15a] via-[#dfbe78] to-[#c9a15a] bg-[length:200%_auto] py-3 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verificando...</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar sesión</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Opción destacada: Iniciar sesión más tarde */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDismiss}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] py-3 text-xs font-semibold tracking-wider text-white/85 hover:border-[#c9a15a]/70 hover:bg-[#c9a15a]/10 hover:text-white transition cursor-pointer backdrop-blur-sm"
                  >
                    <Clock className="h-4 w-4 text-[#c9a15a]" />
                    <span>Iniciar sesión más tarde</span>
                  </motion.button>
                </motion.div>
              </form>

              {/* Micro-nota inferior */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="mt-4 pt-3 border-t border-white/10 text-center text-[0.7rem] text-white/45 flex items-center justify-center gap-1.5"
              >
                <span>Puedes explorar todo el catálogo y cotizar como invitado sin registrarte.</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
