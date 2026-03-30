"use client";

import { IconClock, IconSearch, IconTicketX } from "./icons";
import { ReactNode } from "react";

const problems: { icon: ReactNode; title: string; desc: string }[] = [
  {
    icon: <IconClock size={28} />,
    title: "Te enteraste tarde",
    desc: "Tu artista favorito toco el fin de semana y lo viste en las stories de otros.",
  },
  {
    icon: <IconSearch size={28} />,
    title: "Buscar es agotador",
    desc: "Revisar 5 ticketeras, Instagram y grupos de WhatsApp solo para saber que hay este mes.",
  },
  {
    icon: <IconTicketX size={28} />,
    title: "Sold out otra vez",
    desc: "Cuando por fin te enteras, las entradas ya se agotaron. Siempre llegas tarde.",
  },
];

export function ProblemSection() {
  return (
    <section className="section-padding" style={{ background: "var(--bg-secondary)" }}>
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
          El problema
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
          ¿Cuantos shows te has perdido?
        </h2>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: 520,
            lineHeight: 1.6,
            marginBottom: 56,
          }}
        >
          La musica en vivo esta fragmentada. La informacion esta en 20 lugares
          distintos y nadie te avisa a tiempo.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {problems.map((p) => (
            <div key={p.title} className="glow-card">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--accent-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {p.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {p.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
