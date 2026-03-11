const STATS = [
  { value: "+23%", label: "tiempo de permanencia promedio con música curada" },
  { value: "0", label: "instalaciones de hardware requeridas" },
  { value: "100M+", label: "canciones disponibles en catálogo" },
];

export function StatsBar() {
  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        padding: "40px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
          className="stats-grid"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "16px 32px",
                borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
                textAlign: "center",
              }}
              className="stat-item"
            >
              <div
                className="font-display text-gold-gradient"
                style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1, marginBottom: 8 }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .stat-item {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .stat-item:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </section>
  );
}
