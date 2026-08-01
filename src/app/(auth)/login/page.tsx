"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { LogoMark } from "@/components/logo";
import "./login.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Datos incorrectos");
      return;
    }

    router.push(params.get("callbackUrl") || "/vender");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="login-form">
      <div className="login-field">
        <User className="login-field-icon" size={18} strokeWidth={1.75} />
        <input
          name="email"
          type="email"
          required
          placeholder="Usuario"
          className="login-field-input"
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="login-field">
        <Lock className="login-field-icon" size={18} strokeWidth={1.75} />
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          className="login-field-input"
          autoComplete="current-password"
        />
        <button
          type="button"
          className="login-field-action"
          onClick={() => setShowPassword((v) => !v)}
          aria-label="Mostrar"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? <p className="login-error">{error}</p> : null}

      <button type="submit" disabled={loading} className="login-submit">
        {loading ? "…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/login-bg.png" alt="" className="login-bg" />
      <div className="login-veil" />

      <div className="login-card">
        <div className="login-brand">
          <LogoMark className="login-mark" color="#c4a574" />
          <p className="login-name">Mudeco</p>
          <p className="login-sub">Palets</p>
        </div>

        <Suspense fallback={<p className="login-loading">…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
