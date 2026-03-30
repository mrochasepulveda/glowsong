"use client";

import { IconFlame } from "./icons";

export function Hero() {
  return (
    <section
      className="section-padding"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 120,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--accent-dim)",
            border: "1px solid rgba(255,107,53,0.2)",
            borderRadius: 100,
            padding: "8px 20px",
            marginBottom: 32,
            fontSize: "0.875rem",
            color: "var(--accent-light)",
            fontWeight: 500,
          }}
        >
          <IconFlame size={16} />
          Pronto en Chile
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 800,
            margin: "0 auto 24px",
          }}
        >
          Nunca mas te pierdas{" "}
          <span className="text-accent-gradient">la musica que te importa</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Foqo aprende tus gustos y te avisa cuando tocan tus artistas favoritos
          en tu ciudad. Sin buscar, sin perderte nada.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#waitlist" className="btn-primary" style={{ fontSize: "1.0625rem", padding: "16px 36px" }}>
            Quiero acceso anticipado
          </a>
        </div>

        {/* Social proof micro */}
        <p
          style={{
            marginTop: 32,
            fontSize: "0.875rem",
            color: "var(--text-tertiary)",
          }}
        >
          Gratis. Sin spam. Solo musica que te importa.
        </p>
      </div>
    </section>
  );
}
