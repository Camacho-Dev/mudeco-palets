/**
 * Portada animada del inicio (sin JavaScript, solo CSS):
 *
 * - <WorkshopHeroBackdrop>: la misma foto, difuminada y oscurecida, cubre todo
 *   el fondo y deriva despacio. Al estar difuminada no se nota que se estira.
 * - <WorkshopHeroShowcase>: la foto nítida, completa y en su tamaño real dentro
 *   de un marco (el bloque de palet con el logo siempre entero), con entrada
 *   tipo "telón", movimiento de cámara, destello de luz y polvo dorado.
 *
 * Solo anima transform, opacity y clip-path. Con "reducir movimiento" todo
 * queda quieto (ver store.css).
 */

// Posiciones fijas (no aleatorias): HTML idéntico en servidor y cliente
const DUST = [
  { l: 6, t: 78, s: 3, d: 9, dl: 0 },
  { l: 12, t: 62, s: 4, d: 11, dl: 2 },
  { l: 19, t: 84, s: 3, d: 10, dl: 4.5 },
  { l: 26, t: 70, s: 5, d: 12, dl: 1 },
  { l: 33, t: 88, s: 3, d: 9.5, dl: 6 },
  { l: 40, t: 66, s: 4, d: 11.5, dl: 3 },
  { l: 47, t: 80, s: 3, d: 10.5, dl: 7.5 },
  { l: 54, t: 58, s: 5, d: 12.5, dl: 0.5 },
  { l: 61, t: 86, s: 3, d: 9, dl: 5 },
  { l: 68, t: 64, s: 4, d: 11, dl: 8 },
  { l: 75, t: 82, s: 3, d: 10, dl: 2.5 },
  { l: 82, t: 60, s: 5, d: 12, dl: 6.5 },
  { l: 89, t: 76, s: 3, d: 9.5, dl: 1.5 },
  { l: 94, t: 68, s: 4, d: 11, dl: 4 },
  { l: 30, t: 50, s: 2, d: 13, dl: 9 },
  { l: 72, t: 48, s: 2, d: 13.5, dl: 3.5 },
] as const;

export function WorkshopHeroBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0d0a07]">
      <div className="hero-backdrop-drift absolute inset-[-8%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full scale-110 object-cover blur-2xl" />
      </div>
      {/* Oscurecer para el texto, con un halo cálido detrás del marco */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 72% 50%, rgba(201,161,90,0.18), transparent 65%), linear-gradient(90deg, rgba(10,8,6,0.94) 0%, rgba(10,8,6,0.82) 45%, rgba(10,8,6,0.6) 100%)",
        }}
      />
      {/* Fundido arriba (ventanas claras) y hacia la franja de abajo */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0d0a07] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  );
}

export function WorkshopHeroShowcase({ src }: { src: string }) {
  return (
    <figure className="hero-reveal relative overflow-hidden rounded-[28px] border border-[#c9a15a]/30 bg-[#120d09] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Cámara: acercamiento lento hacia el logo */}
        <div className="hero-camera absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Bloque de madera de palet con el logo de Mudeco Palets grabado a fuego, en el taller"
            fetchPriority="high"
            className="h-full w-full object-cover object-[70%_60%]"
          />
        </div>

        {/* Destello de luz que cruza la madera */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen">
          <div
            className="hero-sweep absolute -inset-y-1/4 left-0 w-1/4"
            style={{
              background:
                "linear-gradient(100deg, transparent 0%, rgba(255,214,150,0.32) 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Polvo dorado flotando en la luz */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
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
                boxShadow: "0 0 8px 1px rgba(255,210,130,0.9)",
              }}
            />
          ))}
        </div>

        {/* Viñeta sutil para dar profundidad */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 85% at 60% 55%, transparent 55%, rgba(8,6,4,0.55) 100%)",
          }}
        />
      </div>
    </figure>
  );
}
