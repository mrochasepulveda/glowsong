function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "rgba(200,169,110,0.1)",
        border: "1px solid rgba(200,169,110,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: "var(--gold)",
      }}
    >
      {children}
    </div>
  );
}

function AlgorithmVisual() {
  const slots = [
    { label: "Mañana", active: false, color: "rgba(200,169,110,0.3)" },
    { label: "Mediodía", active: false, color: "rgba(200,169,110,0.4)" },
    { label: "Tarde", active: true, color: "var(--gold)" },
    { label: "Peak", active: false, color: "rgba(200,169,110,0.3)" },
    { label: "Cierre", active: false, color: "rgba(200,169,110,0.2)" },
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Slots timeline */}
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
        {slots.map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: "100%",
                height: s.active ? 40 : 24,
                borderRadius: 4,
                background: s.color,
                border: s.active ? "1px solid rgba(200,169,110,0.6)" : "1px solid transparent",
                boxShadow: s.active ? "0 0 12px rgba(200,169,110,0.3)" : "none",
                transition: "height 0.3s",
              }}
            />
            <span style={{ fontSize: "0.6rem", color: s.active ? "var(--gold)" : "var(--text-tertiary)", fontWeight: s.active ? 600 : 400 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "var(--surface-2)",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--gold)",
              boxShadow: "0 0 8px rgba(200,169,110,0.6)",
            }}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 500 }}>
            Todo fluye bien
          </span>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>8 en cola</span>
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center" }}>
        Tarde activa · energía y flow
      </p>
    </div>
  );
}

function ControlVisual() {
  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center",
      }}
    >
      {/* Track info */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            background: "linear-gradient(135deg, #1E1E35 0%, #252540 100%)",
            border: "1px solid var(--border)",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 18V5l12-2v13" stroke="rgba(200,169,110,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="6" cy="18" r="3" stroke="rgba(200,169,110,0.5)" strokeWidth="1.5"/>
            <circle cx="18" cy="16" r="3" stroke="rgba(200,169,110,0.5)" strokeWidth="1.5"/>
          </svg>
        </div>
        <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>Flowers</div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Miley Cyrus</div>
      </div>

      {/* Progress */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>1:12</span>
        <div style={{ flex: 1, height: 3, background: "var(--surface-3)", borderRadius: 999 }}>
          <div style={{ width: "45%", height: "100%", background: "var(--gold)", borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>3:20</span>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          aria-label="Saltar"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <polygon points="13 19 22 12 13 5 13 19"/><line x1="2" y1="12" x2="13" y2="12"/>
          </svg>
        </button>
        <button
          aria-label="Pausar"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--gold)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(200,169,110,0.35)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A0A1A">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        </button>
        <button
          aria-label="Bloquear"
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function MusicSourceVisual() {
  const devices = [
    { icon: "🔊", name: "Sonos Play:5" },
    { icon: "💻", name: "MacBook del local" },
    { icon: "📱", name: "iPad del local" },
  ];

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Status badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          background: "rgba(200,169,110,0.07)",
          border: "1px solid rgba(200,169,110,0.2)",
          borderRadius: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="18" r="3" stroke="var(--gold)" strokeWidth="1.5"/>
          <circle cx="18" cy="16" r="3" stroke="var(--gold)" strokeWidth="1.5"/>
        </svg>
        <div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
            Fuente de música activa
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Streaming de alta calidad</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
        </div>
      </div>

      {/* Device list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          Dispositivos disponibles
        </span>
        {devices.map((d, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              background: i === 0 ? "var(--surface-2)" : "transparent",
              borderRadius: 6,
              border: i === 0 ? "1px solid rgba(200,169,110,0.2)" : "1px solid transparent",
            }}
          >
            <span>{d.icon}</span>
            <span style={{ fontSize: "0.8125rem", color: i === 0 ? "var(--text-primary)" : "var(--text-secondary)" }}>
              {d.name}
            </span>
            {i === 0 && (
              <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--gold)" }}>● Activo</span>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center" }}>
        Sin cables. Sin instalaciones. Sin técnicos.
      </p>
    </div>
  );
}

const FEATURES = [
  {
    badge: "01",
    title: "Algoritmo que lee tu espacio",
    items: [
      "Detecta el momento del día y adapta la energía automáticamente",
      "Selecciona el ambiente correcto según el horario y tu tipo de negocio",
      "Nunca repite canciones en 4 horas",
      "Se adapta a tu tipo de local: café, gym, tienda, salón y más",
    ],
    visual: <AlgorithmVisual />,
  },
  {
    badge: "02",
    title: "Control total desde tu teléfono",
    items: [
      "Skip, pausa y bloqueo de canciones en 1 tap",
      "Dashboard siempre disponible, sin app adicional",
      "Bloquea artistas o canciones que no van con tu estilo",
      "Funciona desde cualquier lugar — dentro y fuera del local",
    ],
    visual: <ControlVisual />,
  },
  {
    badge: "03",
    title: "Sin hardware, sin instalaciones",
    items: [
      "Solo necesitas un dispositivo con internet — nada más",
      "Funciona en cualquier tablet, computador o teléfono del local",
      "Sin cajas, sin cables, sin técnicos",
      "Listo en menos de 15 minutos desde tu primera visita",
    ],
    visual: <MusicSourceVisual />,
  },
];

export function FeaturesSection() {
  return (
    <section className="section" style={{ background: "var(--bg-secondary)" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span className="badge" style={{ marginBottom: 16, display: "inline-flex" }}>
            Características
          </span>
          <h2
            className="font-display"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", color: "var(--text-primary)" }}
          >
            Todo lo que necesitas.{" "}
            <span className="text-gold-gradient">Nada que no necesitas.</span>
          </h2>
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 64,
                alignItems: "center",
                direction: i % 2 === 1 ? "rtl" : "ltr",
              }}
              className="feature-grid"
            >
              {/* Copy */}
              <div style={{ direction: "ltr" }}>
                <span
                  className="font-display text-gold-gradient"
                  style={{ fontSize: "3rem", lineHeight: 1, display: "block", marginBottom: 16, opacity: 0.5 }}
                >
                  {f.badge}
                </span>
                <h3
                  className="font-display"
                  style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "var(--text-primary)", marginBottom: 20, lineHeight: 1.2 }}
                >
                  {f.title}
                </h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0 }}>
                  {f.items.map((item, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: "0.9375rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path d="M3 8l3 3 7-7" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div style={{ direction: "ltr" }}>{f.visual}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .feature-grid {
            gap: 32px !important;
          }
        }
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
