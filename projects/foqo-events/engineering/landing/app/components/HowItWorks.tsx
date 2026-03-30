"use client";

const steps = [
  {
    number: "01",
    action: "Me interesa",
    icon: "♡",
    color: "var(--accent)",
    title: "Guarda lo que te gusta",
    desc: "Marca los eventos y artistas que te interesan. Foqo aprende tu gusto con cada interaccion.",
  },
  {
    number: "02",
    action: "Paso",
    icon: "→",
    color: "var(--text-tertiary)",
    title: "Descarta sin culpa",
    desc: "No todo es para ti, y esta bien. Desliza y Foqo entiende lo que no va contigo.",
  },
  {
    number: "03",
    action: "Voy",
    icon: "✓",
    color: "var(--voy)",
    title: "Confirma tu asistencia",
    desc: "Decidiste ir? Marcalo. Foqo te recuerda la fecha y te avisa si quedan pocas entradas.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="container">
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          Como funciona
        </p>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 56,
          }}
        >
          Tres acciones. Cero esfuerzo.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
          }}
        >
          {steps.map((s) => (
            <div key={s.number} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.number}
                </span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--surface-2)",
                    border: `1.5px solid ${s.color}`,
                    borderRadius: 100,
                    padding: "8px 20px",
                  }}
                >
                  <span style={{ color: s.color, fontWeight: 700, fontSize: "1rem" }}>
                    {s.icon}
                  </span>
                  <span style={{ color: s.color, fontWeight: 600, fontSize: "0.9375rem" }}>
                    {s.action}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{s.title}</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
