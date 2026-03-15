const LINKS = {
  Producto: [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Lista de espera", href: "#waitlist" },
    { label: "Características", href: "#features" },
    { label: "Dashboard", href: "/login" },
  ],
  Recursos: [
    { label: "Blog", href: "#" },
    { label: "Documentación", href: "#" },
    { label: "Soporte", href: "#" },
  ],
  Empresa: [
    { label: "Sobre Glowsong", href: "#" },
    { label: "Contacto", href: "#" },
    { label: "Trabaja con nosotros", href: "#" },
  ],
  Legal: [
    { label: "Términos de uso", href: "#" },
    { label: "Privacidad", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
        padding: "60px 0 32px",
      }}
    >
      <div className="container">
        {/* Top */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 48,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <a
              href="#"
              className="font-display text-gold-gradient"
              style={{ fontSize: "1.5rem", textDecoration: "none", width: "fit-content" }}
            >
              Glowsong
            </a>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260 }}>
              La inteligencia musical para tu local. Glowsong decide qué suena
              — tú decides el ambiente.
            </p>
            {/* Spotify badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background: "rgba(30,215,96,0.06)",
                border: "1px solid rgba(30,215,96,0.15)",
                borderRadius: 8,
                width: "fit-content",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ED760">
                <circle cx="12" cy="12" r="12" fill="#1ED760"/>
                <path d="M17.5 16.8c-.2.3-.6.4-1 .2-2.6-1.6-5.9-2-9.8-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 4.2-1 7.9-.6 10.8 1.3.5.2.6.6.4 1zm1.4-3c-.3.4-.8.5-1.2.2-3-1.8-7.5-2.3-11-1.3-.5.1-.9-.2-1.1-.6-.1-.5.2-.9.6-1.1 4-1.1 9-.6 12.4 1.5.3.3.4.8.3 1.3zm.1-3c-3.4-2-9-2.2-12.2-1.2-.6.1-1.1-.2-1.3-.8-.1-.6.2-1.1.8-1.3 3.7-1.1 9.9-.9 13.8 1.4.5.3.7 1 .4 1.5-.2.5-.9.7-1.5.4z" fill="white"/>
              </svg>
              <span style={{ fontSize: "0.75rem", color: "rgba(30,215,96,0.9)" }}>Powered by Spotify</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-tertiary)",
                  marginBottom: 16,
                }}
              >
                {category}
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          className="footer-bottom"
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
            © {new Date().getFullYear()} Glowsong. Todos los derechos reservados.
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
            Hecho con ♪ en Santiago, Chile 🇨🇱
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </footer>
  );
}
