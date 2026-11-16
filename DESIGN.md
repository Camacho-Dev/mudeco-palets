---
name: mudeco-palets-design-system
target: css-tailwind
---

# Sistema de Diseño — Mudeco Palets

Este repositorio contiene dos superficies visuales con contratos separados:

## 1. Tienda Pública (`src/app/(store)` + `src/components/store/store.css`)
Identidad **Atelier Noir / Madera Cálida**:
- **Colores principales:**
  - `--store-bg`: `#0f0f0f` (fondos oscuros de portada y cabecera)
  - `--wood-950` (en `.store-shell`): `#14100d`
  - `--wood-50`: `#faf7f2` (crema cálida para fichas de producto, carrito y checkout)
  - `--store-gold`: `#c9a15a` / `--store-gold-hover`: `#d4b06e` / `--brass`: `#b0894f`
- **Tipografía:**
  - Display: `--font-store-display` (`Cormorant Garamond`, Georgia, serif) — usar `text-balance` en títulos.
  - Cuerpo: `--font-store-body` (`Inter`, system-ui, sans-serif) — usar `text-pretty` en párrafos.
  - Precios y montos: siempre usar `tabular-nums`.
- **Componentes:** Botones con `.store-cta` (`rounded-full`); nunca reutilizar clases `.btn` del ERP en la tienda pública.

## 2. Panel ERP Administrativo (`src/app/(dashboard)` + `src/app/globals.css`)
Identidad **Operate / Alta Legibilidad**:
- **Colores principales:**
  - `--brand` / `--wood-950`: `#0f172a` (sidebar y acciones primarias)
  - `--background`: `#f8fafc` / `--surface`: `#ffffff`
  - `--brass` / `--accent`: `#d97706`
- **Reglas de interacción:**
  - Usar `h-dvh` en contenedores de altura completa (`(dashboard)/layout.tsx`, `sidebar.tsx`).
  - Renderizado tabular inmediato sin animaciones escalonadas de entrada en `table.data`.
  - Áreas táctiles mínimas de `44×44px` en controles móviles y anillos `focus-visible` visibles en todos los inputs y botones.
