export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-primary)",
        borderTop: "1px solid var(--border)",
        padding: "40px 0 32px",
      }}
    >
      <div className="container">
        {/* Brand + info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <a
            href="#"
            className="font-display text-gold-gradient"
            style={{ fontSize: "1.5rem", textDecoration: "none" }}
          >
            Glowsong
          </a>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "center", maxWidth: 360 }}>
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
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1ED760">
              <circle cx="12" cy="12" r="12" fill="#1ED760"/>
              <path d="M17.5 16.8c-.2.3-.6.4-1 .2-2.6-1.6-5.9-2-9.8-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 4.2-1 7.9-.6 10.8 1.3.5.2.6.6.4 1zm1.4-3c-.3.4-.8.5-1.2.2-3-1.8-7.5-2.3-11-1.3-.5.1-.9-.2-1.1-.6-.1-.5.2-.9.6-1.1 4-1.1 9-.6 12.4 1.5.3.3.4.8.3 1.3zm.1-3c-3.4-2-9-2.2-12.2-1.2-.6.1-1.1-.2-1.3-.8-.1-.6.2-1.1.8-1.3 3.7-1.1 9.9-.9 13.8 1.4.5.3.7 1 .4 1.5-.2.5-.9.7-1.5.4z" fill="white"/>
            </svg>
            <span style={{ fontSize: "0.75rem", color: "rgba(30,215,96,0.9)" }}>Powered by Spotify</span>
          </div>
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
        @media (max-width: 480px) {
          .footer-bottom {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
