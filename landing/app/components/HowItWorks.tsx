const STEPS = [
  {
    number: "01",
    title: "Conecta tu música",
    description:
      "Vincula tu fuente de música en minutos. Hoy compatible con Spotify Premium — solo presionas un botón y autorizas.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 12h8M12 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Configura tu perfil",
    description:
      "Dinos el tipo de local y los géneros que van con tu estilo. Puedes bloquear artistas o canciones específicas en cualquier momento.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "Glowsong hace el resto",
    description:
      "El algoritmo gestiona la música por ti las 24 horas. Puedes hacer skip, pausar o bloquear canciones desde tu teléfono en cualquier momento.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
            Cómo funciona
          </span>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--text-primary)", marginBottom: 16 }}
          >
            En menos de 15 minutos,{" "}
            <span className="text-gold-gradient">tu local ya está sonando</span>
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
            No necesitas saber de tecnología. Si puedes usar un teléfono, puedes usar Glowsong.
          </p>
        </div>

        {/* Steps */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            position: "relative",
          }}
          className="steps-grid"
        >
          {/* Connecting line — desktop only */}
          <div
            aria-hidden="true"
            className="steps-line"
            style={{
              position: "absolute",
              top: 48,
              left: "calc(33.33% + 24px)",
              right: "calc(33.33% + 24px)",
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)",
            }}
          />

          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "28px 24px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                position: "relative",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              {/* Step number badge */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(200,169,110,0.1)",
                  border: "1px solid rgba(200,169,110,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--gold)",
                }}
              >
                {step.icon}
              </div>

              <span
                className="font-display text-gold-gradient"
                style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}
              >
                PASO {step.number}
              </span>

              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>

              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA below */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#waitlist" className="btn-primary">
            Reservar mi lugar gratis
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
          .steps-line {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
