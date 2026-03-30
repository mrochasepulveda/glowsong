"use client";

export function AnticipationSection() {
  return (
    <section className="section-padding">
      <div className="container" style={{ textAlign: "center" }}>
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
          Anticipacion
        </p>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 16,
            maxWidth: 700,
            margin: "0 auto 16px",
          }}
        >
          Foqo te avisa antes de que sea tarde
        </h2>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: 540,
            margin: "0 auto 56px",
            lineHeight: 1.6,
          }}
        >
          Mientras otros se enteran por stories, tu ya tienes tu entrada.
          Foqo monitorea las ticketeras por ti.
        </p>

        {/* Timeline mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            maxWidth: 480,
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          {[
            {
              time: "Hace 2 semanas",
              text: "Foqo detecto un evento nuevo de Amelie Lens en tu ciudad",
              accent: false,
            },
            {
              time: "Hace 1 semana",
              text: "Te notificamos: \"92% tu vibe — Amelie Lens en Club Chocolate\"",
              accent: true,
            },
            {
              time: "Hace 3 dias",
              text: "Marcaste \"Voy\" y compraste tu entrada",
              accent: false,
            },
            {
              time: "Hoy",
              text: "Tus amigos se enteraron. Sold out. Pero tu ya vas.",
              accent: true,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 20,
                paddingBottom: 32,
                position: "relative",
              }}
            >
              {/* Timeline line */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 20,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: item.accent ? "var(--accent)" : "var(--surface-3)",
                    border: item.accent ? "2px solid var(--accent-light)" : "2px solid var(--text-tertiary)",
                    flexShrink: 0,
                  }}
                />
                {i < 3 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      background: "var(--border)",
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: item.accent ? "var(--accent)" : "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  {item.time}
                </p>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: item.accent ? "var(--text-primary)" : "var(--text-secondary)",
                    lineHeight: 1.5,
                    fontWeight: item.accent ? 600 : 400,
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
