/**
 * Glowsong Isotipo — Bombilla con 5 barras de sonido y arcos de glow.
 * Usa `currentColor` para heredar el color del contenedor.
 */
export function GlowsongIsotipo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-label="Glowsong"
    >
      {/* Glow arcs — oval rings floating above the bulb */}
      <path d="M38 18 Q50 9 62 18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M42 10 Q50 3 58 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Circle body — wide gap at top (~10 to 2 o'clock) */}
      <path d="M30 30 A30 30 0 1 0 70 30" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />

      {/* 5 sound bars — symmetric, centered in circle, gradual heights */}
      <rect x="36" y="50" width="4.5" height="16" rx="2.2" fill="currentColor" />
      <rect x="43" y="44" width="4.5" height="28" rx="2.2" fill="currentColor" />
      <rect x="50" y="38" width="4.5" height="34" rx="2.2" fill="currentColor" />
      <rect x="57" y="44" width="4.5" height="28" rx="2.2" fill="currentColor" />
      <rect x="64" y="50" width="4.5" height="16" rx="2.2" fill="currentColor" />
    </svg>
  );
}
