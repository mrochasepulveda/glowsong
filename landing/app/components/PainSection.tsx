const WITHOUT = [
  "Silencio incómodo cuando termina la playlist",
  "Volumen equivocado a las 3am del viernes",
  "Tu bartender cambiando canciones en vez de atender clientes",
  "Canciones repetidas que los regulares ya saben de memoria",
  "La misma playlist de siempre porque nadie tiene tiempo de actualizar",
];

const WITH = [
  "Algoritmo que detecta si es apertura, tarde o peak automáticamente",
  "Mood y energía perfectos para cada momento sin intervención",
  "Control total con un tap desde donde estés",
  "Ventana de no-repetición de 4 horas activa siempre",
  "Cola preparada con 10 canciones adelantadas en todo momento",
];

export function PainSection() {
  return (
    <section className="section">
      <div className="container">
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
            El problema oculto
          </span>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              color: "var(--text-primary)",
              marginBottom: 16,
            }}
          >
            Tu playlist aleatoria de Spotify te está{" "}
            <span className="text-gold-gradient">costando ventas cada noche</span>
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", maxWidth: 660, margin: "0 auto", lineHeight: 1.6 }}>
            El <strong>66.7% de los clientes</strong> cita la música incongruente o el exceso de volumen como su molestia principal (incluso más que un mal servicio). Si la música no engancha, se van temprano. Y cuando se van temprano, <strong>tu ticket promedio cae</strong>.
          </p>
        </div>

        {/* Split comparison */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
          className="pain-grid"
        >
          {/* Without Glowsong */}
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 16,
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(248,113,113,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="2" x2="2" y2="12" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontWeight: 600, color: "#F87171", fontSize: "0.9375rem" }}>Sin Glowsong</span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14, listStyle: "none", padding: 0 }}>
              {WITHOUT.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "#F87171", flexShrink: 0, marginTop: 2 }}>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* With Glowsong */}
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid rgba(200,169,110,0.25)",
              borderRadius: 16,
              padding: "28px 32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow accent */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: "radial-gradient(ellipse, rgba(200,169,110,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(200,169,110,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontWeight: 600, color: "var(--gold)", fontSize: "0.9375rem" }}>Con Glowsong</span>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 14, listStyle: "none", padding: 0 }}>
              {WITH.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: "0.9375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pain-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
