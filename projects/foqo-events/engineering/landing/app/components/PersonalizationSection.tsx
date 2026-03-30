"use client";

import { IconTarget, IconPin, IconBrain } from "./icons";
import { ReactNode } from "react";

const features: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <IconTarget size={24} />,
    title: "Algoritmo de afinidad",
    desc: "Foqo combina tus generos, artistas y comportamiento para mostrarte solo lo que vale tu tiempo.",
  },
  {
    icon: <IconPin size={24} />,
    title: "Tu ciudad primero",
    desc: "Eventos reales en venues reales cerca de ti. No ruido de otras ciudades.",
  },
  {
    icon: <IconBrain size={24} />,
    title: "Aprende contigo",
    desc: "Cada interaccion hace que las recomendaciones sean mejores. Foqo se adapta a ti, no al reves.",
  },
];

export function PersonalizationSection() {
  return (
    <section className="section-padding" style={{ background: "var(--bg-secondary)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          <div>
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
              Hecho para ti
            </p>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              Tu feed no se parece al de nadie
            </h2>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--text-secondary)",
                maxWidth: 520,
                lineHeight: 1.6,
                marginBottom: 48,
              }}
            >
              No es una lista generica de eventos. Es un feed personalizado que
              entiende tu gusto musical y lo cruza con lo que esta pasando en tu ciudad.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {features.map((f) => (
                <div key={f.title} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--accent-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 4 }}>
                      {f.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual: match score mockup */}
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 360,
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { name: "Amelie Lens", match: 92, genre: "Techno" },
                { name: "Mon Laferte", match: 85, genre: "Latin alternative" },
                { name: "Nathy Peluso", match: 78, genre: "R&B / Rap" },
              ].map((e) => (
                <div
                  key={e.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "var(--surface-2)",
                    borderRadius: 12,
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{e.name}</p>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>{e.genre}</p>
                  </div>
                  <div
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--accent-light)",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      padding: "6px 12px",
                      borderRadius: 100,
                    }}
                  >
                    {e.match}% tu vibe
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
