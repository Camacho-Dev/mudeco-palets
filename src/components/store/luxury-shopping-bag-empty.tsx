"use client";

import { motion } from "framer-motion";

export function LuxuryShoppingBagEmpty() {
  return (
    <div className="relative mx-auto flex items-center justify-center py-4 select-none">
      <div className="relative w-44 h-40 sm:w-52 sm:h-44 flex items-center justify-center">
        {/* Halo de luz ambiental dorada */}
        <div className="absolute inset-0 bg-radial from-[#d4af37]/25 via-[#c9a15a]/10 to-transparent blur-2xl pointer-events-none rounded-full" />

        <svg
          viewBox="0 0 240 200"
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradientes del Pedestal */}
            <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f7ecd7" />
              <stop offset="50%" stopColor="#fffaee" />
              <stop offset="100%" stopColor="#edd8b4" />
            </linearGradient>
            <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#edd8b4" />
              <stop offset="100%" stopColor="#caa466" />
            </linearGradient>

            {/* Gradientes de la Bolsa */}
            <linearGradient id="bagFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#221e1a" />
              <stop offset="60%" stopColor="#15120f" />
              <stop offset="100%" stopColor="#0d0b09" />
            </linearGradient>
            <linearGradient id="bagSide" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2c2621" />
              <stop offset="100%" stopColor="#1a1613" />
            </linearGradient>

            {/* Dorado de las Asas y Logo */}
            <linearGradient id="goldCord" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbe3a8" />
              <stop offset="45%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#9a7322" />
            </linearGradient>

            {/* Sombra de la Bolsa sobre el pedestal */}
            <radialGradient id="bagContactShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.35)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          {/* Sombra proyectada del pedestal en el suelo */}
          <ellipse
            cx="120"
            cy="176"
            rx="74"
            ry="11"
            fill="rgba(201, 161, 90, 0.22)"
            filter="blur(4px)"
          />

          {/* Pedestal cilíndrico luminoso */}
          <g>
            {/* Altura del pedestal */}
            <path
              d="M 52 165 C 52 173 82 179 120 179 C 158 179 188 173 188 165 L 188 169 C 188 177 158 183 120 183 C 82 183 52 177 52 169 Z"
              fill="url(#pedestalBase)"
            />
            {/* Superficie superior del pedestal */}
            <ellipse
              cx="120"
              cy="165"
              rx="68"
              ry="10"
              fill="url(#pedestalTop)"
              stroke="rgba(212, 175, 55, 0.5)"
              strokeWidth="1"
            />
            {/* Sombra de contacto debajo de la bolsa */}
            <ellipse
              cx="120"
              cy="164"
              rx="42"
              ry="6"
              fill="url(#bagContactShadow)"
            />
          </g>

          {/* Bolsa de compras de lujo en 3D */}
          <g transform="translate(0, -4)">
            {/* Asas doradas de cuerda trasera */}
            <path
              d="M 103 105 C 103 72 137 72 137 105"
              stroke="#9a7322"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Cara lateral izquierda (profundidad 3D con pliegue) */}
            <path
              d="M 86 108 L 98 102 L 98 163 L 86 160 Z"
              fill="url(#bagSide)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.5"
            />
            {/* Pliegue interno de la cara lateral */}
            <path
              d="M 92 105 L 92 161.5"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="0.8"
            />

            {/* Cara frontal de la bolsa */}
            <path
              d="M 98 102 L 152 102 L 154 162 L 98 163 Z"
              fill="url(#bagFront)"
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="0.8"
            />

            {/* Borde superior doblado de la bolsa */}
            <path
              d="M 98 102 L 152 102 L 152 106 L 98 106 Z"
              fill="#2a241e"
              opacity="0.85"
            />

            {/* Asa dorada frontal */}
            <path
              d="M 112 106 C 112 70 142 70 142 106"
              stroke="url(#goldCord)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
            />

            {/* Ojales metálicos dorados en la bolsa */}
            <circle cx="112" cy="106" r="2.2" fill="#d4af37" />
            <circle cx="142" cy="106" r="2.2" fill="#d4af37" />

            {/* Logo Mudeco Palets en estampado de oro en el centro de la bolsa */}
            <g transform="translate(121, 126)">
              {/* Sello de palet estilizado (icono característico de Mudeco) */}
              <rect
                x="-11"
                y="-11"
                width="22"
                height="22"
                rx="3.5"
                fill="none"
                stroke="url(#goldCord)"
                strokeWidth="1.2"
                opacity="0.85"
              />
              {/* Tablillas internas del sello */}
              <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#fbe3a8" strokeWidth="1.2" />
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#fbe3a8" strokeWidth="1.2" />
              <line x1="-8" y1="5" x2="8" y2="5" stroke="#fbe3a8" strokeWidth="1.2" />
              <line x1="-5" y1="-8" x2="-5" y2="8" stroke="#d4af37" strokeWidth="1" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#d4af37" strokeWidth="1" />
              <line x1="5" y1="-8" x2="5" y2="8" stroke="#d4af37" strokeWidth="1" />
            </g>

            {/* Brillo especular sutil en el borde vertical de la bolsa */}
            <line
              x1="98"
              y1="102"
              x2="98"
              y2="163"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
          </g>

          {/* Destellos / Estrellas doradas decorativas de lujo */}
          {/* Estrella derecha */}
          <path
            d="M 178 116 Q 182 116 182 112 Q 182 116 186 116 Q 182 116 182 120 Q 182 116 178 116 Z"
            fill="#d4af37"
            filter="drop-shadow(0 0 4px rgba(212,175,55,0.7))"
          />
          {/* Estrella izquierda */}
          <path
            d="M 64 128 Q 67 128 67 125 Q 67 128 70 128 Q 67 128 67 131 Q 67 128 64 128 Z"
            fill="#c9a15a"
            opacity="0.8"
            filter="drop-shadow(0 0 3px rgba(201,161,90,0.6))"
          />
        </svg>
      </div>
    </div>
  );
}

