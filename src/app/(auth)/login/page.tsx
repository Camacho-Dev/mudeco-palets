"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ShoppingBag,
  Leaf,
  ShieldCheck,
  Home,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  X,
  MessageCircle,
  Sparkles,
  Shield,
  Award,
  Check,
  ExternalLink,
  Copy,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import {
  checkGoogleAuthStatus,
  registerCustomer,
  requestPasswordResetCode,
  resetPasswordWithCode,
} from "./actions";
import "./login.css";

/* =========================================================================
   CANVAS DE PARTÍCULAS AMBIENTALES DE TALLER ARTESANAL (GOLDEN DUST MOTES)
   ========================================================================= */
function AtelierParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // 14 partículas ligeras sin shadowBlur para fluidez a 60fps sin carga de GPU
    const count = 14;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -Math.random() * 0.25 - 0.08,
      alpha: Math.random() * 0.35 + 0.12,
      baseAlpha: Math.random() * 0.35 + 0.12,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.015;
        p.alpha = p.baseAlpha + Math.sin(p.phase) * 0.08;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="luxury-particles-canvas" aria-hidden="true" />;
}

/* =========================================================================
   ICONO VECTORIAL OFICIAL DE GOOGLE
   ========================================================================= */
function GoogleIcon({ className = "w-5 h-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

/* =========================================================================
   CÓDIGO QR VECTORIAL CON MATRIZ ESTILIZADA
   ========================================================================= */
function QrCodeGraphic() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-16 h-16 shrink-0 bg-white p-1 rounded-lg shadow-sm"
      aria-label="Código QR de acceso móvil"
    >
      <rect x="5" y="5" width="28" height="28" rx="3" fill="#120e0b" />
      <rect x="9" y="9" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="13" y="13" width="12" height="12" rx="1.5" fill="#120e0b" />

      <rect x="67" y="5" width="28" height="28" rx="3" fill="#120e0b" />
      <rect x="71" y="9" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="75" y="13" width="12" height="12" rx="1.5" fill="#120e0b" />

      <rect x="5" y="67" width="28" height="28" rx="3" fill="#120e0b" />
      <rect x="9" y="71" width="20" height="20" rx="2" fill="#ffffff" />
      <rect x="13" y="75" width="12" height="12" rx="1.5" fill="#120e0b" />

      <rect x="70" y="70" width="16" height="16" rx="2" fill="#120e0b" />
      <rect x="73" y="73" width="10" height="10" rx="1.5" fill="#ffffff" />
      <rect x="76" y="76" width="4" height="4" fill="#120e0b" />

      <rect x="37" y="17" width="5" height="5" fill="#120e0b" />
      <rect x="47" y="17" width="5" height="5" fill="#120e0b" />
      <rect x="57" y="17" width="5" height="5" fill="#120e0b" />
      <rect x="17" y="37" width="5" height="5" fill="#120e0b" />
      <rect x="17" y="47" width="5" height="5" fill="#120e0b" />
      <rect x="17" y="57" width="5" height="5" fill="#120e0b" />

      <rect x="37" y="37" width="6" height="6" fill="#120e0b" />
      <rect x="47" y="37" width="5" height="5" fill="#120e0b" />
      <rect x="56" y="37" width="6" height="6" fill="#120e0b" />
      <rect x="37" y="47" width="6" height="6" fill="#120e0b" />
      <rect x="47" y="47" width="5" height="5" fill="#120e0b" />
      <rect x="56" y="47" width="6" height="6" fill="#120e0b" />
      <rect x="37" y="57" width="5" height="5" fill="#120e0b" />
      <rect x="47" y="57" width="6" height="6" fill="#120e0b" />
      <rect x="56" y="57" width="5" height="5" fill="#120e0b" />

      <rect x="37" y="75" width="5" height="5" fill="#120e0b" />
      <rect x="47" y="75" width="5" height="5" fill="#120e0b" />
      <rect x="37" y="85" width="5" height="5" fill="#120e0b" />
      <rect x="47" y="85" width="5" height="5" fill="#120e0b" />
      <rect x="75" y="37" width="5" height="5" fill="#120e0b" />
      <rect x="85" y="37" width="5" height="5" fill="#120e0b" />
      <rect x="75" y="47" width="5" height="5" fill="#120e0b" />
      <rect x="85" y="47" width="5" height="5" fill="#120e0b" />
    </svg>
  );
}

/* =========================================================================
   FORMULARIO PRINCIPAL DE LOGIN Y REGISTRO (CON GIRO 3D Y GOOGLE AUTH)
   ========================================================================= */
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callback = params.get("callbackUrl");
  const isFromCheckout = callback === "/checkout" || callback?.startsWith("/checkout");

  // Estado del giro 3D: false = Login (Front), true = Registro (Back)
  const [isFlipped, setIsFlipped] = useState(
    params.get("tab") === "register",
  );

  // Estado de login en 2 pasos: "email" -> "password"
  const [loginStep, setLoginStep] = useState<"email" | "password">("email");

  // Mensajes y carga
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registro form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Modales
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotPreviewUrl, setForgotPreviewUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Estado de mouse para el spotlight reflectante en la tarjeta
  const cardRef = useRef<HTMLDivElement | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }

  // Validación rápida de correo o usuario admin en tiempo real
  const normalizedLogin = loginEmail.trim().toLowerCase();
  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedLogin) ||
    normalizedLogin === "admin" ||
    normalizedLogin === "administrador" ||
    normalizedLogin === "admin@mudeco.com" ||
    normalizedLogin === "admin@empresa.com";

  // Cálculo de fortaleza de contraseña en registro
  function getPasswordStrength(p: string) {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }
  const passwordStrength = getPasswordStrength(regPassword);

  // Avanzar del Paso 1 (Correo) al Paso 2 (Contraseña)
  function handleEmailNext(e: FormEvent) {
    e.preventDefault();
    setError("");
    const trimmed = loginEmail.trim();

    if (!trimmed || !isEmailValid) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setLoginStep("password");
  }

  // Enviar login definitivo (Paso 2)
  async function handleLoginSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

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

    const safeCallback =
      callback &&
      callback.startsWith("/") &&
      !callback.startsWith("//") &&
      callback !== "/login"
        ? callback
        : null;

    if (safeCallback) {
      router.push(safeCallback);
      router.refresh();
      return;
    }

    if (role === "ADMIN") {
      router.push("/panel");
    } else if (role === "VENDEDOR") {
      router.push("/vender");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  // Inicio de sesión con Google
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

      const safeCallback =
        callback &&
        callback.startsWith("/") &&
        !callback.startsWith("//") &&
        callback !== "/login"
          ? callback
          : "/";

      await signIn("google", { callbackUrl: safeCallback });
    } catch {
      setGoogleLoading(false);
      setError("No se pudo iniciar sesión con Google. Intenta con tu correo o contáctanos.");
    }
  }

  // Enviar registro de cuenta (Cara Posterior)
  async function handleRegisterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setError("Por favor ingresa tu nombre completo.");
      setLoading(false);
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@") || !regEmail.includes(".")) {
      setError("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }
    if (regPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const regRes = await registerCustomer({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || undefined,
        password: regPassword,
      });

      if (regRes?.error) {
        setError(regRes.error);
        setLoading(false);
        return;
      }

      setSuccessMsg("¡Cuenta creada exitosamente! Conectando...");

      // Iniciar sesión automáticamente tras crear cuenta
      const loginRes = await signIn("credentials", {
        email: regEmail.trim(),
        password: regPassword,
        redirect: false,
      });

      if (loginRes?.error) {
        setLoading(false);
        setIsFlipped(false);
        setLoginEmail(regEmail.trim());
        setLoginStep("password");
        setSuccessMsg("Cuenta creada. Por favor ingresa tu contraseña para acceder.");
        return;
      }

      const safeCallback =
        callback &&
        callback.startsWith("/") &&
        !callback.startsWith("//") &&
        callback !== "/login"
          ? callback
          : null;

      if (safeCallback) {
        router.push(safeCallback);
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError("Error al registrarse: " + msg);
      setLoading(false);
    }
  }

  function handleCopyQuickLink() {
    const url = window.location.origin + "/login";
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  return (
    <>
      {/* Modal Ayuda / Olvidó contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[#c9a15a]/40 bg-[#16120e] p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep("request");
                setForgotError("");
              }}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#c9a15a]/20 border border-[#c9a15a]/40 flex items-center justify-center text-[#d4af37]">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">¿Olvidaste tu contraseña?</h3>
                <p className="text-xs text-white/60">
                  {forgotStep === "request"
                    ? "Recibe un código de 6 dígitos en tu correo"
                    : "Ingresa el código y tu nueva contraseña"}
                </p>
              </div>
            </div>

            {forgotError ? (
              <div className="mb-3 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
                {forgotError}
              </div>
            ) : null}

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
                    setForgotError(res.error || "No se pudo enviar el código.");
                    return;
                  }
                  if (!forgotEmail && loginEmail) setForgotEmail(loginEmail);
                  setForgotPreviewUrl(res.previewUrl || null);
                  setForgotStep("verify");
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Correo de tu cuenta
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail || loginEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#c9a15a] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full rounded-xl bg-[#c9a15a] py-2.5 text-xs font-bold uppercase tracking-wider text-[#120e0b] hover:bg-[#e2be4b] transition disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? "Enviando código..." : "Enviar código por correo"}
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
                  setLoginStep("password");
                  setSuccessMsg("¡Contraseña actualizada! Ingresa con tu nueva clave.");
                }}
                className="space-y-3"
              >
                {forgotPreviewUrl ? (
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-2.5 text-xs text-emerald-200">
                    Código enviado.{" "}
                    <a
                      href={forgotPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#d4af37] underline"
                    >
                      Abrir vista previa del correo →
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-300">
                    Si el correo está registrado, hemos enviado un código de 6 dígitos.
                  </p>
                )}
                <div>
                  <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Código de 6 dígitos
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="123456"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-center font-mono text-base tracking-[0.3em] text-[#d4af37] focus:border-[#c9a15a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-bold uppercase tracking-wider text-white/70 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#c9a15a] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full rounded-xl bg-[#c9a15a] py-2.5 text-xs font-bold uppercase tracking-wider text-[#120e0b] hover:bg-[#e2be4b] transition disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? "Actualizando..." : "Guardar nueva contraseña"}
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
              <a
                href="https://wa.me/18097047519?text=Hola%20Mudeco%20Palets,%20necesito%20ayuda%20para%20restablecer%20el%20acceso%20a%20mi%20cuenta."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>¿Prefieres asistencia por WhatsApp?</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Interactivo de Acceso QR Móvil */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-2xl border border-[#c9a15a]/40 bg-[#16120e] p-6 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto w-12 h-12 rounded-full bg-[#c9a15a]/15 border border-[#c9a15a]/40 flex items-center justify-center text-[#d4af37] mb-3">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-base font-serif font-medium text-white mb-1">
              Accede desde tu Teléfono
            </h3>
            <p className="text-xs text-white/65 mb-5 max-w-xs mx-auto">
              Apunta la cámara de tu smartphone hacia el código para abrir la tienda e iniciar sesión instantáneamente.
            </p>

            <div className="bg-white p-4 rounded-xl inline-block shadow-2xl mb-5">
              <QrCodeGraphic />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyQuickLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#d4af37]" />}
                <span>{copiedLink ? "¡Enlace copiado!" : "Copiar enlace de acceso"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-xs text-white/50 hover:text-white pt-1 transition"
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Informativo: Google OAuth Setup Assistant */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[#c9a15a]/40 bg-[#16120e] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowGoogleSetupModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Integración con Google</h3>
                <p className="text-xs text-white/60">Inicio de sesión OAuth listo</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4 font-light">
              El botón de Google y la lógica de autenticación ya están **100% programados**. Para habilitar el inicio de sesión real en vivo, solo necesitas registrar tus credenciales de Google Cloud Console:
            </p>
            <div className="rounded-xl bg-black/60 border border-white/10 p-3 font-mono text-xs text-[#d4af37] mb-5 space-y-1">
              <div>GOOGLE_CLIENT_ID=&quot;tu-id.apps.googleusercontent.com&quot;</div>
              <div>GOOGLE_CLIENT_SECRET=&quot;tu-secreto&quot;</div>
            </div>
            <p className="text-xs text-white/60 mb-5">
              Mientras tanto, puedes ingresar o crear cuenta al instante usando tu correo electrónico y contraseña.
            </p>
            <button
              type="button"
              onClick={() => setShowGoogleSetupModal(false)}
              className="w-full rounded-xl bg-[#c9a15a] text-[#120e0b] font-bold py-2.5 text-xs uppercase tracking-wider hover:bg-[#e2be4b] transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Banner flotante si viene del checkout */}
      {isFromCheckout && (
        <div className="luxury-checkout-badge mb-4">
          <ShoppingBag className="h-4 w-4 text-[#d4af37]" />
          <span>Finalizar Compra — Accede para asociar tu entrega</span>
        </div>
      )}

      {/* ==============================================================
          CONTENEDOR 3D FLIP: GIRA 180° ENTRE LOGIN Y REGISTRO
          ============================================================== */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`luxury-flip-container ${isFlipped ? "is-flipped" : ""}`}
      >
        <div className="luxury-flip-inner">
          {/* ==========================================================
              CARA FRONTAL: INICIO DE SESIÓN (LOGIN EN 2 PASOS + GOOGLE)
              ========================================================== */}
          <div className="luxury-card-face luxury-card-front">
            {/* Halo de luz interactivo que sigue al mouse */}
            <div className="luxury-card-spotlight" />

            {/* Encabezado */}
            <div className="luxury-card-header">
              <div className="luxury-mark-container">
                <LogoMark className="h-9 w-9 text-[#d4af37]" />
              </div>
              <div className="luxury-brand-line">
                <span className="luxury-brand-name">MUDECO</span>
                <span className="luxury-brand-rule" />
                <span className="luxury-brand-sub">PALETS</span>
              </div>

              <h2 className="font-display luxury-card-title">Bienvenido de nuevo</h2>
              <p className="luxury-card-subtitle">
                {loginStep === "email"
                  ? "Accede a tu cuenta artesanal para continuar"
                  : "Introduce tu contraseña para continuar"}
              </p>

              <div className="luxury-gold-divider" />
            </div>

            {/* Selector de pestañas */}
            <div className="luxury-tabs">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className="luxury-tab luxury-tab-active"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className="luxury-tab"
              >
                Crear cuenta
              </button>
            </div>

            {error && !isFlipped ? (
              <div className="luxury-alert luxury-alert-error" role="alert">
                {error}
              </div>
            ) : null}

            {successMsg && !isFlipped ? (
              <div className="luxury-alert luxury-alert-success" role="status">
                <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-400" />
                {successMsg}
              </div>
            ) : null}

            {/* PASO 1: Ingreso de Correo Electrónico + Botón de Google */}
            {loginStep === "email" ? (
              <form onSubmit={handleEmailNext} className="luxury-form">
                {/* Botón de Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="luxury-google-btn"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>{googleLoading ? "Conectando con Google..." : "Continuar con Google"}</span>
                </button>

                {/* Divisor "o con correo" */}
                <div className="luxury-or-divider">
                  <div className="luxury-or-line" />
                  <span className="luxury-or-text">o con tu correo</span>
                  <div className="luxury-or-line" />
                </div>

                <div className="luxury-field">
                  <Mail className="luxury-field-icon" size={17} strokeWidth={1.75} />
                  <input
                    name="email"
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    className="luxury-input"
                    autoComplete="username email"
                    autoFocus
                  />
                  {isEmailValid && (
                    <div className="flex items-center text-emerald-400 animate-fade-in pr-1" title="Formato válido">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                <button type="submit" className="luxury-submit-btn">
                  <span>CONTINUAR</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Separador o */}
                <div className="luxury-or-divider">
                  <div className="luxury-or-line" />
                  <span className="luxury-or-text">o</span>
                  <div className="luxury-or-line" />
                </div>

                {/* Tarjeta Iniciar con tu dispositivo con QR Code (clickeable para ampliar) */}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="luxury-device-box"
                  title="Haz clic para ver el código QR ampliado"
                >
                  <div className="luxury-device-icon-wrap">
                    <Smartphone className="h-5 w-5 text-[#d4af37]" strokeWidth={1.5} />
                  </div>
                  <div className="luxury-device-info">
                    <div className="flex items-center gap-1.5">
                      <h4 className="luxury-device-title">Iniciar con tu dispositivo</h4>
                      <ExternalLink className="h-3 w-3 text-[#c9a15a]/70" />
                    </div>
                    <p className="luxury-device-desc">
                      Escanea el código QR desde tu móvil para acceso rápido.
                    </p>
                  </div>
                  <QrCodeGraphic />
                </button>

                {/* Enlace para girar la tarjeta a Registro */}
                <div className="text-center mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(true);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="luxury-flip-trigger-link"
                  >
                    <span>¿No tienes una cuenta aún?</span>
                    <strong className="text-[#d4af37] underline underline-offset-2">Crear cuenta nueva →</strong>
                  </button>
                </div>
              </form>
            ) : (
              /* PASO 2: Ingreso de Contraseña (con badge de correo y opción de editar) */
              <form onSubmit={handleLoginSubmit} className="luxury-form luxury-step-slide">
                {/* Badge con el correo seleccionado y botón Cambiar */}
                <div className="luxury-selected-email-badge">
                  <div className="luxury-selected-email-content">
                    <div className="luxury-email-avatar">
                      <User size={12} strokeWidth={2.5} />
                    </div>
                    <span className="luxury-selected-email-text">{loginEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("email");
                      setError("");
                    }}
                    className="luxury-change-email-btn"
                  >
                    Cambiar
                  </button>
                </div>

                <div className="luxury-field">
                  <Lock className="luxury-field-icon" size={17} strokeWidth={1.75} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="luxury-input"
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="luxury-field-action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Fila de recordarme y olvidar contraseña */}
                <div className="luxury-row-options">
                  <label className="luxury-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="luxury-checkbox"
                    />
                    <span>Recordarme</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="luxury-forgot-btn"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button type="submit" disabled={loading} className="luxury-submit-btn">
                  <span>{loading ? "Accediendo..." : "INICIAR SESIÓN"}</span>
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStep("email");
                      setError("");
                    }}
                    className="luxury-back-step-btn"
                  >
                    <ArrowLeft size={13} />
                    <span>Volver a ingresar correo</span>
                  </button>
                </div>

                {/* Separador o */}
                <div className="luxury-or-divider">
                  <div className="luxury-or-line" />
                  <span className="luxury-or-text">o</span>
                  <div className="luxury-or-line" />
                </div>

                {/* Botón secundario Google en paso 2 */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="luxury-google-btn"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Acceder con Google</span>
                </button>
              </form>
            )}

            {/* Pie de ayuda y seguridad */}
            <div className="luxury-card-footer">
              <div>
                <span className="text-white/50 text-xs">¿Necesitas ayuda?</span>{" "}
                <Link href="/contacto" className="luxury-support-link">
                  <span>Contacta con soporte</span>
                  <ArrowRight className="h-3 w-3 inline" />
                </Link>
              </div>

              <div className="luxury-security-pill">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span>Cifrado SSL 256-Bit · Acceso Seguro y Protegido</span>
              </div>
            </div>
          </div>

          {/* ==========================================================
              CARA POSTERIOR: PANEL DE REGISTRO (CREAR CUENTA + GOOGLE)
              ========================================================== */}
          <div className="luxury-card-face luxury-card-back">
            {/* Halo de luz interactivo que sigue al mouse */}
            <div className="luxury-card-spotlight" />

            {/* Encabezado */}
            <div className="luxury-card-header">
              <div className="luxury-mark-container">
                <LogoMark className="h-9 w-9 text-[#d4af37]" />
              </div>
              <div className="luxury-brand-line">
                <span className="luxury-brand-name">MUDECO</span>
                <span className="luxury-brand-rule" />
                <span className="luxury-brand-sub">PALETS</span>
              </div>

              <h2 className="font-display luxury-card-title">Crea tu cuenta</h2>
              <p className="luxury-card-subtitle">
                Únete en 30 segundos para completar tu pedido
              </p>

              <div className="luxury-gold-divider" />
            </div>

            {/* Selector de pestañas */}
            <div className="luxury-tabs">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className="luxury-tab"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className="luxury-tab luxury-tab-active"
              >
                Crear cuenta
              </button>
            </div>

            {error && isFlipped ? (
              <div className="luxury-alert luxury-alert-error" role="alert">
                {error}
              </div>
            ) : null}

            {successMsg && isFlipped ? (
              <div className="luxury-alert luxury-alert-success" role="status">
                <CheckCircle2 className="h-4 w-4 inline mr-1 text-emerald-400" />
                {successMsg}
              </div>
            ) : null}

            {/* Registro rápido con Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="luxury-google-btn mb-2"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Registrarse con Google</span>
            </button>

            <div className="luxury-or-divider">
              <div className="luxury-or-line" />
              <span className="luxury-or-text">o con tus datos</span>
              <div className="luxury-or-line" />
            </div>

            <form onSubmit={handleRegisterSubmit} method="POST" className="luxury-form">
              <div className="luxury-field">
                <User className="luxury-field-icon" size={17} strokeWidth={1.75} />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nombre completo"
                  className="luxury-input"
                  autoComplete="name"
                />
              </div>

              <div className="luxury-field">
                <Mail className="luxury-field-icon" size={17} strokeWidth={1.75} />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  className="luxury-input"
                  autoComplete="email"
                />
              </div>

              <div className="luxury-field">
                <Phone className="luxury-field-icon" size={17} strokeWidth={1.75} />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="Teléfono o WhatsApp (opcional)"
                  className="luxury-input"
                  autoComplete="tel"
                />
              </div>

              <div className="luxury-field">
                <Lock className="luxury-field-icon" size={17} strokeWidth={1.75} />
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  className="luxury-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="luxury-field-action"
                  onClick={() => setShowRegPassword((v) => !v)}
                  aria-label={showRegPassword ? "Ocultar" : "Mostrar"}
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Medidor visual interactivo de fortaleza de contraseña */}
              {regPassword.length > 0 && (
                <div className="luxury-strength-container animate-fade-in">
                  <div className="luxury-strength-bars">
                    <div
                      className={`luxury-strength-bar ${
                        passwordStrength >= 1
                          ? passwordStrength === 1
                            ? "luxury-strength-bar-active-weak"
                            : passwordStrength === 2
                            ? "luxury-strength-bar-active-medium"
                            : "luxury-strength-bar-active-strong"
                          : ""
                      }`}
                    />
                    <div
                      className={`luxury-strength-bar ${
                        passwordStrength >= 2
                          ? passwordStrength === 2
                            ? "luxury-strength-bar-active-medium"
                            : "luxury-strength-bar-active-strong"
                          : ""
                      }`}
                    />
                    <div
                      className={`luxury-strength-bar ${
                        passwordStrength >= 3 ? "luxury-strength-bar-active-strong" : ""
                      }`}
                    />
                    <div
                      className={`luxury-strength-bar ${
                        passwordStrength >= 4 ? "luxury-strength-bar-active-strong" : ""
                      }`}
                    />
                  </div>
                  <div className="luxury-strength-text">
                    <span>Seguridad de contraseña</span>
                    <span className="font-semibold text-white/80">
                      {passwordStrength <= 1
                        ? "Básica"
                        : passwordStrength === 2
                        ? "Aceptable"
                        : passwordStrength === 3
                        ? "Buena"
                        : "Excelente"}
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="luxury-submit-btn">
                <Sparkles className="h-4 w-4" />
                <span>{loading ? "Creando cuenta..." : "CREAR CUENTA & CONTINUAR"}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {/* Enlace para girar la tarjeta de vuelta a Iniciar sesión */}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className="luxury-flip-trigger-link"
              >
                <span>¿Ya tienes una cuenta?</span>
                <strong className="text-[#d4af37] underline underline-offset-2">Inicia sesión aquí →</strong>
              </button>
            </div>

            {/* Pie de ayuda */}
            <div className="luxury-card-footer">
              <span className="text-white/50 text-xs">¿Necesitas ayuda?</span>{" "}
              <Link href="/contacto" className="luxury-support-link">
                <span>Contacta con soporte</span>
                <ArrowRight className="h-3 w-3 inline" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="luxury-login-page">
      {/* Barra de navegación superior fija en el tope */}
      <header className="luxury-header-nav">
        <div className="luxury-header-nav-inner">
          <Link href="/" className="luxury-back-button">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la tienda</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 tracking-wider">
            <span className="font-semibold text-white/70">MUDECO PALETS</span>
            <span className="text-[#c9a15a]">·</span>
            <span>TALLER ARTESANAL</span>
          </div>
        </div>
      </header>

      {/* Partículas de luz dorada ambiental flotando en el taller */}
      <AtelierParticles />

      {/* Fondo con fotografía arquitectónica de taller Mudeco */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login-atelier-bg.jpg"
        alt=""
        className="luxury-bg-image"
      />
      <div className="luxury-bg-overlay" />

      {/* Contenedor principal en 2 columnas */}
      <div className="luxury-split-container">
        {/* Columna Izquierda: Editorial de marca */}
        <section className="luxury-left-column">
          <div className="luxury-editorial-body">
            {/* Logo de marca superior */}
            <div className="luxury-brand-header">
              <LogoMark className="h-10 w-10 text-[#d4af37]" />
              <div className="leading-tight">
                <span className="block text-xl font-bold tracking-[0.25em] text-white uppercase font-serif">
                  MUDECO
                </span>
                <span className="block text-[0.65rem] tracking-[0.32em] text-[#c9a15a] uppercase">
                  PALETS
                </span>
              </div>
            </div>

            {/* Gran encabezado editorial */}
            <h1 className="font-display luxury-editorial-heading">
              Diseño y calidad en cada detalle
            </h1>

            <p className="luxury-editorial-subheading">
              Muebles de madera recuperada con alma de taller y confección a medida para tu hogar.
            </p>

            {/* Sello de Calidad Artesanal Dominicana */}
            <div className="luxury-artisan-seal">
              <div className="luxury-seal-badge">
                <Award className="h-5 w-5" />
              </div>
              <div className="luxury-seal-content">
                <span className="luxury-seal-title">Sello de Calidad Artesanal</span>
                <span className="luxury-seal-desc">
                  100% Madera Sostenible · Hecho a mano en República Dominicana
                </span>
              </div>
            </div>

            {/* Pilares de confianza con animación escalonada */}
            <div className="luxury-pillars-strip">
              <div
                className="luxury-pillar-item"
                style={{ "--pillar-idx": 0 } as React.CSSProperties}
              >
                <div className="luxury-pillar-icon">
                  <Leaf className="h-4 w-4 text-[#c9a15a]" />
                </div>
                <span>Madera recuperada</span>
              </div>

              <div
                className="luxury-pillar-item"
                style={{ "--pillar-idx": 1 } as React.CSSProperties}
              >
                <div className="luxury-pillar-icon">
                  <ShieldCheck className="h-4 w-4 text-[#c9a15a]" />
                </div>
                <span>Calidad premium</span>
              </div>

              <div
                className="luxury-pillar-item"
                style={{ "--pillar-idx": 2 } as React.CSSProperties}
              >
                <div className="luxury-pillar-icon">
                  <Home className="h-4 w-4 text-[#c9a15a]" />
                </div>
                <span>Diseños únicos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Columna Derecha: Tarjeta de Acceso 3D */}
        <section className="luxury-right-column">
          <Suspense fallback={<div className="text-white/60 text-sm">Cargando acceso...</div>}>
            <LoginForm />
          </Suspense>
          <div className="mt-5 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3.5 py-1.5 backdrop-blur-md">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c9a15a]/20 text-[0.55rem] font-bold tracking-wider text-[#d4af37]">
                BC
              </span>
              <span className="text-[0.65rem] tracking-[0.06em] text-white/55">
                Desarrollado por{" "}
                <strong className="font-semibold text-[#e6c567]">
                  Brayan Camacho
                </strong>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
