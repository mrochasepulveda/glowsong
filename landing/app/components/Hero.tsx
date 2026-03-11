export function Hero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 120,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      {/* Background glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 600,
          background:
            "radial-gradient(ellipse at center, rgba(200,169,110,0.08) 0%, rgba(123,97,255,0.05) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          right: "-10%",
          width: 400,
          height: 400,
          background: "radial-gradient(ellipse, rgba(123,97,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left: copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Badge */}
            <div className="animate-fade-up">
              <span className="badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
                Lista de espera abierta
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display animate-fade-up delay-1"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
                lineHeight: 1.15,
                color: "var(--text-primary)",
              }}
            >
              No busques solo "música para tu restaurante".{" "}
              <span className="text-gold-gradient">Busca que tus clientes se queden y gasten más.</span>
            </h1>

            {/* Sub */}
            <p
              className="animate-fade-up delay-2"
              style={{
                fontSize: "1.125rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: 460,
              }}
            >
              La mala música ahuyenta mesas. Glowsong es la app inteligente que automatiza el ambiente perfecto, retiene a tus clientes y{" "}
              <strong style={{ color: "var(--gold)", fontWeight: 500 }}>
                te genera ingresos adicionales
              </strong>{" "}
              sin inversión inicial ni hardware.
            </p>

            {/* CTAs */}
            <div
              className="animate-fade-up delay-3"
              style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              <a href="#waitlist" className="btn-primary">
                Reservar mi lugar gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#como-funciona" className="btn-ghost">
                Ver cómo funciona
              </a>
            </div>

            {/* Micro-copy */}
            <p
              className="animate-fade-up delay-4"
              style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}
            >
              Acceso anticipado gratuito · Sin tarjeta de crédito · Cupos limitados
            </p>
          </div>

          {/* Right: dashboard mockup */}
          <div
            className="animate-fade-up delay-2 hero-visual"
            style={{ position: "relative" }}
          >
            {/* Glow behind mockup */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-20px",
                background: "radial-gradient(ellipse at 50% 40%, rgba(200,169,110,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Dashboard mockup (CSS-drawn since no image yet) */}
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                position: "relative",
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  background: "rgba(8,8,16,0.7)",
                  borderBottom: "1px solid var(--border)",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28CA41" }} />
                </div>
                <span style={{ flex: 1, textAlign: "center", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                  Buenas noches, El Flow Vegan
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                  🌙 Noche temprana · energía y diversión
                </span>
              </div>

              {/* Dashboard body */}
              <div style={{ display: "flex", height: 380 }}>
                {/* Sidebar */}
                <div
                  style={{
                    width: 56,
                    background: "var(--surface-1)",
                    borderRight: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "16px 0",
                    gap: 16,
                  }}
                >
                  <span className="font-display" style={{ fontSize: "0.7rem", color: "var(--gold)", lineHeight: 1.2, textAlign: "center" }}>
                    G<br />S
                  </span>
                  <span style={{ flex: 1 }} />
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 8px rgba(200,169,110,0.5)" }} />
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: "var(--text-tertiary)", opacity: 0.3 }} />
                </div>

                {/* Main hero area */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    gap: 12,
                  }}
                >
                  {/* Album art placeholder */}
                  <div
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #1E1E35 0%, #252540 50%, #16162A 100%)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 32px rgba(200,169,110,0.08)",
                    }}
                  >
                    {/* Music note icon */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18V5l12-2v13" stroke="rgba(200,169,110,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="6" cy="18" r="3" stroke="rgba(200,169,110,0.4)" strokeWidth="1.5"/>
                      <circle cx="18" cy="16" r="3" stroke="rgba(200,169,110,0.4)" strokeWidth="1.5"/>
                    </svg>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                      Blinding Lights
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>The Weeknd</div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 240,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ height: 3, background: "var(--surface-3)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: "38%", height: "100%", background: "linear-gradient(90deg, var(--gold-dim) 0%, var(--gold) 100%)", borderRadius: 999 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>1:32</span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>3:58</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                        <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                      </svg>
                    </div>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "var(--gold)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 20px rgba(200,169,110,0.35)",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A1A">
                        <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                        <polygon points="13 19 22 12 13 5 13 19"/><line x1="2" y1="12" x2="13" y2="12"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right panel: queue */}
                <div
                  style={{
                    width: 200,
                    background: "var(--surface-1)",
                    borderLeft: "1px solid var(--border)",
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Siguiente
                  </span>
                  {[
                    { title: "Save Your Tears", artist: "The Weeknd" },
                    { title: "Levitating", artist: "Dua Lipa" },
                    { title: "As It Was", artist: "Harry Styles" },
                    { title: "Stay", artist: "The Kid LAROI" },
                  ].map((track, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: i === 0 ? "var(--surface-2)" : "transparent",
                      }}
                    >
                      <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", minWidth: 12 }}>{i + 1}</span>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: "var(--surface-3)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {track.title}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {track.artist}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* "Live" badge floating */}
            <div
              style={{
                position: "absolute",
                bottom: -12,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 100,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--success, #22C55E)",
                  boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Sonando en tu Noche temprana
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-visual {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
