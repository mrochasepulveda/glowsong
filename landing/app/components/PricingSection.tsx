const INCLUDES = [
  "Algoritmo inteligente 24/7",
  "Dashboard de control total",
  "Skip, pausa y bloqueo en 1 tap",
  "5 franjas horarias con mood propio",
  "Ventana de no-repetición de 4 horas",
  "Soporte por WhatsApp",
];

export function PricingSection() {
  return (
    <section className="section" id="pricing">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
            Pricing
          </span>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--text-primary)", marginBottom: 16 }}
          >
            Un precio.{" "}
            <span className="text-gold-gradient">Todo incluido.</span>
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)" }}>
            Sin sorpresas, sin niveles confusos. Empieza gratis, cancela cuando quieras.
          </p>
        </div>

        {/* Pricing card */}
        <div
          style={{
            maxWidth: 460,
            margin: "0 auto",
            background: "var(--surface-1)",
            border: "1px solid rgba(200,169,110,0.3)",
            borderRadius: 20,
            padding: "36px 40px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(200,169,110,0.07)",
          }}
        >
          {/* Glow top */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 200,
              background: "radial-gradient(ellipse, rgba(200,169,110,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Popular badge */}
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#0A0A1A",
                background: "var(--gold)",
                padding: "3px 10px",
                borderRadius: 100,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              MVP
            </span>
          </div>

          {/* Plan name */}
          <h3
            className="font-display"
            style={{ fontSize: "1.375rem", color: "var(--text-primary)", marginBottom: 8 }}
          >
            Glowsong Esencial
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 24 }}>
            Todo lo que necesitas para gestionar la música de tu local.
          </p>

          {/* Price */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", marginBottom: 8 }}>$</span>
              <span
                className="font-display text-gold-gradient"
                style={{ fontSize: "3.5rem", lineHeight: 1 }}
              >
                29.990
              </span>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 8 }}>CLP/mes</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 100,
                fontSize: "0.75rem",
                color: "#22C55E",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22C55E",
                }}
              />
              14 días gratis — sin tarjeta de crédito
            </div>
          </div>

          {/* Includes */}
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0, marginBottom: 28 }}>
            {INCLUDES.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: "0.9375rem",
                  color: "var(--text-secondary)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7.5" stroke="rgba(200,169,110,0.3)"/>
                  <path d="M5 8l2 2 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>

          {/* Requires */}
          <div
            style={{
              padding: "10px 14px",
              background: "var(--surface-2)",
              borderRadius: 8,
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ED760">
              <circle cx="12" cy="12" r="12" fill="#1ED760"/>
              <path d="M17.5 16.8c-.2.3-.6.4-1 .2-2.6-1.6-5.9-2-9.8-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 4.2-1 7.9-.6 10.8 1.3.5.2.6.6.4 1zm1.4-3c-.3.4-.8.5-1.2.2-3-1.8-7.5-2.3-11-1.3-.5.1-.9-.2-1.1-.6-.1-.5.2-.9.6-1.1 4-1.1 9-.6 12.4 1.5.3.3.4.8.3 1.3zm.1-3c-3.4-2-9-2.2-12.2-1.2-.6.1-1.1-.2-1.3-.8-.1-.6.2-1.1.8-1.3 3.7-1.1 9.9-.9 13.8 1.4.5.3.7 1 .4 1.5-.2.5-.9.7-1.5.4z" fill="white"/>
            </svg>
            <span>Requiere Spotify Premium (del local o tuyo)</span>
          </div>

          {/* CTA */}
          <a
            href="/signup"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", fontSize: "1rem", padding: "14px 28px" }}
          >
            Empieza tu prueba gratis
          </a>
          <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: 12 }}>
            Cancela cuando quieras. Sin permanencia.
          </p>
        </div>

        {/* Compare with competition note */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--text-tertiary)",
            marginTop: 32,
          }}
        >
          vs. Soundtrack.io desde $25 USD/mes · Mood Media requiere contrato anual · TouchTunes requiere hardware propietario
        </p>
      </div>
    </section>
  );
}
