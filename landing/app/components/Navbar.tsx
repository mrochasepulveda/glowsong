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
          className="font-display text-gold-gradient"
          style={{ fontSize: "1.4rem", textDecoration: "none", flexShrink: 0 }}
        >
          Glowsong
        </a>

        <span style={{ flex: 1 }} />

        {/* Nav links — desktop only */}
        <nav
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
          className="hidden md:flex"
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
          <a
            href="/login"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              padding: "8px 16px",
              transition: "color 0.2s",
            }}
            className="hidden sm:block"
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            Iniciar sesión
          </a>
          <a href="#waitlist" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.875rem" }}>
            Únete gratis
          </a>
        </div>
      </div>
    </header>
  );
}
