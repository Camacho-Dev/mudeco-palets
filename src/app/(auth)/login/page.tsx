import { Suspense } from "react";
import { BrandPanel, MobileTopBar } from "./brand-panel";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-dvh w-full bg-brand-cream text-[#14100d] lg:grid lg:grid-cols-12">
      <BrandPanel />

      {/* Columna derecha: formulario */}
      <main className="flex min-h-dvh flex-col justify-between px-5 py-6 sm:px-8 lg:col-span-7 lg:px-12 lg:py-10">
        <MobileTopBar />

        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          <Suspense
            fallback={
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-[#e5dacb] bg-white text-xs text-[#8c7b68]">
                Cargando…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-[11px] text-[#8c7b68] lg:text-right">
          Conexión segura · Mudeco Palets
        </p>
      </main>
    </div>
  );
}
