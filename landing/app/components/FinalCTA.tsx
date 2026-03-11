export function FinalCTA() {
  return (
    <section
      style={{
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Glow background */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse, rgba(200,169,110,0.12) 0%, rgba(123,97,255,0.06) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Eyebrow */}
        <div style={{ marginBottom: 24 }}>
          <span className="badge">Lista de espera abierta</span>
        </div>

        {/* Headline */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            color: "var(--text-primary)",
            marginBottom: 20,
            maxWidth: 700,
            margin: "0 auto 20px",
          }}
        >
          La noche perfecta empieza con{" "}
          <span className="text-gold-gradient">la canción correcta.</span>
        </h2>

        {/* Sub */}
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: 520,
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Únete a la lista de espera hoy y accede gratis cuando lancemos.
          Cupos limitados para el primer grupo de locales.
        </p>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="#waitlist"
            className="btn-primary"
            style={{ fontSize: "1.0625rem", padding: "16px 32px" }}
          >
            Reservar mi lugar gratis
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.75 9h10.5M9.75 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: 20 }}>
          Sin tarjeta de crédito · Acceso gratuito durante el lanzamiento
        </p>
      </div>
    </section>
  );
}
