export function Footer() {
  return (
    <footer
      style={{
        padding: "40px 24px",
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div className="container">
        <p
          style={{
            fontSize: "1.25rem",
            fontWeight: 900,
            color: "var(--accent)",
            letterSpacing: "-1px",
            marginBottom: 8,
          }}
        >
          Foqo
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
          Un producto de Foqo Studios &mdash; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
