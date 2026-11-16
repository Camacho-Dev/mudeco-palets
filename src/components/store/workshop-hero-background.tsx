/**
 * Fondo animado del inicio: foto del taller con el bloque de palet y el logo
 * grabado, con efecto "video":
 *  1. Movimiento de cámara lento (Ken Burns)
 *  2. Destello de luz que cruza la madera cada pocos segundos
 *  3. Brillo cálido de las ventanas que "respira"
 *  4. Polvo de aserrín flotando en la luz
 *
 * Solo anima transform y opacity (GPU), y todo se detiene con
 * "reducir movimiento" (ver store.css). Componente de servidor: sin JS.
 */

// Posiciones fijas (no aleatorias) para que el HTML sea idéntico en servidor y cliente
const DUST = [
  { l: 8, t: 72, s: 3, d: 14, dl: 0 },
  { l: 14, t: 58, s: 2, d: 18, dl: 3 },
  { l: 22, t: 80, s: 4, d: 16, dl: 6 },
  { l: 29, t: 64, s: 2, d: 20, dl: 1.5 },
  { l: 35, t: 76, s: 3, d: 15, dl: 8 },
  { l: 41, t: 52, s: 2, d: 19, dl: 4.5 },
  { l: 47, t: 70, s: 3, d: 17, dl: 10 },
  { l: 52, t: 60, s: 2, d: 21, dl: 2 },
  { l: 57, t: 84, s: 4, d: 14, dl: 7 },
  { l: 61, t: 48, s: 2, d: 22, dl: 11 },
  { l: 66, t: 74, s: 3, d: 16, dl: 5 },
  { l: 71, t: 56, s: 2, d: 19, dl: 9 },
  { l: 76, t: 68, s: 3, d: 18, dl: 0.5 },
  { l: 81, t: 50, s: 2, d: 20, dl: 6.5 },
  { l: 86, t: 78, s: 4, d: 15, dl: 3.5 },
  { l: 91, t: 62, s: 2, d: 21, dl: 12 },
  { l: 18, t: 45, s: 2, d: 23, dl: 13 },
  { l: 44, t: 40, s: 2, d: 24, dl: 2.5 },
  { l: 68, t: 42, s: 3, d: 22, dl: 14 },
  { l: 95, t: 46, s: 2, d: 25, dl: 5.5 },
] as const;

export function WorkshopHeroBackground({ src }: { src: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#120d09]">
      {/* 1. Cámara lenta */}
      <div className="hero-kenburns absolute inset-[-4%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-[80%_center] sm:object-[70%_center] lg:object-[center_60%]"
        />
      </div>

      {/* 3. Brillo cálido de las ventanas */}
      <div
        className="hero-glow absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 38% 18%, rgba(255,196,120,0.28), transparent 70%)",
        }}
      />

      {/* 2. Destello que cruza la madera */}
      <div className="absolute inset-0 overflow-hidden mix-blend-soft-light">
        <div
          className="hero-sweep absolute -inset-y-1/4 left-0 w-1/3"
          style={{
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,226,170,0.55) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* 4. Aserrín flotando */}
      <div className="absolute inset-0">
        {DUST.map((p, i) => (
          <span
            key={i}
            className="hero-dust absolute rounded-full bg-[#ffe2a8]"
            style={{
              left: `${p.l}%`,
              top: `${p.t}%`,
              width: p.s,
              height: p.s,
              animationDuration: `${p.d}s`,
              animationDelay: `-${p.dl}s`,
              boxShadow: "0 0 6px rgba(255,214,140,0.8)",
            }}
          />
        ))}
      </div>

      {/* Legibilidad: oscuro a la izquierda (texto), claro a la derecha (logo) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.78) 34%, rgba(10,8,6,0.28) 64%, rgba(10,8,6,0.08) 100%), linear-gradient(0deg, rgba(10,8,6,0.75) 0%, transparent 30%), linear-gradient(180deg, rgba(10,8,6,0.45) 0%, transparent 22%)",
        }}
      />
    </div>
  );
}
