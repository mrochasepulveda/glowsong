"use client";

import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.3s, border-color 0.3s, backdrop-filter 0.3s",
        background: scrolled ? "rgba(8,8,16,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: 32,
        }}
      >
        {/* Logo */}
        <a
          href="#"
          style={{ textDecoration: "none", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, color: "var(--gold)" }}
        >
          <svg width={28} height={28} viewBox="0 0 100 100" fill="none" style={{ display: "block", color: "var(--gold)" }}>
            <path d="M38 18 Q50 9 62 18" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M42 10 Q50 3 58 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M30 30 A30 30 0 1 0 70 30" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round"/>
            <rect x="36" y="50" width="4.5" height="16" rx="2.2" fill="currentColor"/>
            <rect x="43" y="44" width="4.5" height="28" rx="2.2" fill="currentColor"/>
            <rect x="50" y="38" width="4.5" height="34" rx="2.2" fill="currentColor"/>
            <rect x="57" y="44" width="4.5" height="28" rx="2.2" fill="currentColor"/>
            <rect x="64" y="50" width="4.5" height="16" rx="2.2" fill="currentColor"/>
          </svg>
          <span className="font-display" style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
            glowsong
          </span>
        </a>

        <span style={{ flex: 1 }} />

        {/* Nav links — desktop only */}
        <nav
          className="nav-links"
        >
          <a
            href="#como-funciona"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Cómo funciona
          </a>
          <a
            href="#waitlist"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Lista de espera
          </a>
        </nav>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <a href="#waitlist" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.875rem" }}>
            Únete gratis
          </a>
        </div>
      </div>
      <style>{`
        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
