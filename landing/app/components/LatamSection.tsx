const CITIES = [
  { name: "Santiago", flag: "🇨🇱", active: true },
  { name: "Buenos Aires", flag: "🇦🇷", active: false },
  { name: "Ciudad de México", flag: "🇲🇽", active: false },
  { name: "Bogotá", flag: "🇨🇴", active: false },
];

export function LatamSection() {
  return (
    <section
      className="section"
      style={{
        background: "var(--surface-1)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="latam-grid"
        >
          {/* Copy */}
          <div>
            <span className="badge" style={{ marginBottom: 20, display: "inline-flex" }}>
              Hecho para LATAM
            </span>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                color: "var(--text-primary)",
                marginBottom: 20,
                lineHeight: 1.2,
              }}
            >
              Construido para locales de{" "}
              <span className="text-gold-gradient">Chile y Latinoamérica</span>
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              Sabemos cómo suena la hora peak de una cafetería, la clase de las
              7pm en un gym y la música de fondo que hace que un cliente se
              quede más tiempo en tu tienda. Glowsong fue construido desde cero
              para Latinoamérica — no traducido del inglés.
            </p>

            {/* Cities */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {CITIES.map((city) => (
                <div
                  key={city.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 100,
                    background: city.active ? "rgba(200,169,110,0.1)" : "var(--surface-2)",
                    border: `1px solid ${city.active ? "rgba(200,169,110,0.3)" : "var(--border)"}`,
                  }}
                >
                  <span>{city.flag}</span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: city.active ? 600 : 400,
                      color: city.active ? "var(--gold)" : "var(--text-secondary)",
                    }}
                  >
                    {city.name}
                  </span>
                  {!city.active && (
                    <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>próximamente</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual: quote block */}
          <div
            className="latam-quote"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "36px 32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative quote mark */}
            <div
              aria-hidden="true"
              className="font-display"
              style={{
                position: "absolute",
                top: -10,
                left: 24,
                fontSize: "8rem",
                color: "rgba(200,169,110,0.07)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              "
            </div>

            <blockquote
              style={{
                position: "relative",
                fontSize: "1.125rem",
                color: "var(--text-primary)",
                lineHeight: 1.7,
                fontStyle: "italic",
                marginBottom: 24,
              }}
            >
              El 92% de los locales reportan que la música correcta se
              traduce en mayor tiempo de permanencia y mayor consumo por
              cliente.
            </blockquote>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 2,
                  height: 32,
                  background: "var(--gold)",
                  borderRadius: 999,
                }}
              />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Sound Strategies Research
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  TrendCandy, 2024
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .latam-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .latam-quote {
            padding: 24px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
