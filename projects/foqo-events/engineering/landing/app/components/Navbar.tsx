"use client";

export function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontSize: "1.5rem",
          fontWeight: 900,
          color: "var(--accent)",
          letterSpacing: "-1px",
        }}
      >
        Foqo
      </span>
      <a href="#waitlist" className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.875rem" }}>
        Unirme a la waitlist
      </a>
    </nav>
  );
}
