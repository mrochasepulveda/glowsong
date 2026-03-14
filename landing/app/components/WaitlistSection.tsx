"use client";

import { useState } from "react";
import { getSupabase } from "../../lib/supabase";

const BENEFITS = [
  { icon: "✦", text: "Acceso gratuito durante el período de lanzamiento" },
  { icon: "✦", text: "Soporte directo con el equipo fundador" },
  { icon: "✦", text: "Influye en las features que construimos primero" },
];

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [localName, setLocalName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const { error } = await getSupabase()
        .from("waitlist")
        .insert({ email: email.trim().toLowerCase(), local_name: localName.trim() || null });

      if (error) {
        if (error.code === "23505") {
          // duplicate
          setStatus("success");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Algo salió mal. Intenta de nuevo.");
    }
  }

  return (
    <section
      id="waitlist"
      style={{
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 500,
          background:
            "radial-gradient(ellipse, rgba(200,169,110,0.10) 0%, rgba(123,97,255,0.05) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{ position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 80,
            alignItems: "center",
          }}
          className="waitlist-grid"
        >
          {/* Left: copy */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <span className="badge">Acceso anticipado</span>
            </div>
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                lineHeight: 1.1,
                color: "var(--text-primary)",
                marginBottom: 20,
              }}
            >
              Sé de los primeros{" "}
              <span className="text-gold-gradient">en acceder.</span>
            </h2>
            <p
              style={{
                fontSize: "1.0625rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: 36,
                maxWidth: 440,
              }}
            >
              Estamos lanzando Glowsong con un grupo selecto de locales. Los primeros en unirse acceden gratis y ayudan a
              definir el producto.
            </p>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {BENEFITS.map((b) => (
                <div key={b.text} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--gold)", fontSize: "0.875rem", marginTop: 2, flexShrink: 0 }}>
                    {b.icon}
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {b.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 40,
            }}
          >
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(200,169,110,0.12)",
                    border: "1px solid rgba(200,169,110,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: "1.5rem",
                  }}
                >
                  ✓
                </div>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: 12 }}
                >
                  ¡Estás dentro!
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  Te avisaremos en cuanto estemos listos para tu local. Mientras
                  tanto, cuéntale a otros dueños de negocios — cafés, gyms, tiendas, salones, lo que sea.
                </p>
              </div>
            ) : (
              <>
                <h3
                  className="font-display"
                  style={{ fontSize: "1.375rem", color: "var(--text-primary)", marginBottom: 8 }}
                >
                  Reserva tu lugar
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.5 }}>
                  Sin tarjeta de crédito. Te contactamos cuando estemos listos.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label
                      htmlFor="wl-email"
                      style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}
                    >
                      Email *
                    </label>
                    <input
                      id="wl-email"
                      type="email"
                      required
                      placeholder="tu@negocio.cl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="wl-local"
                      style={{ display: "block", fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}
                    >
                      Nombre de tu local{" "}
                      <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input
                      id="wl-local"
                      type="text"
                      placeholder="Ej: Studio Alma, Café Raíz..."
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      style={{
                        width: "100%",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        fontSize: "0.9375rem",
                        color: "var(--text-primary)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                  </div>

                  {errorMsg && (
                    <p style={{ fontSize: "0.875rem", color: "#FF6B6B", margin: 0 }}>{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-primary"
                    style={{
                      justifyContent: "center",
                      marginTop: 4,
                      opacity: status === "loading" ? 0.7 : 1,
                      cursor: status === "loading" ? "default" : "pointer",
                    }}
                  >
                    {status === "loading" ? "Guardando..." : "Reservar mi lugar gratis →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .waitlist-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
