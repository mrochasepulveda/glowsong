"use client";

import { useState, FormEvent } from "react";
import { IconCheck } from "./icons";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();

      const { error } = await supabase
        .from("waitlist_subscribers")
        .insert({ email: email.toLowerCase().trim(), source: "foqo_events_landing" });

      if (error) {
        if (error.code === "23505") {
          setStatus("success");
          return;
        }
        throw error;
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Algo salio mal. Intenta de nuevo.");
    }
  }

  return (
    <section
      id="waitlist"
      className="section-padding"
      style={{
        background: "var(--bg-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Se parte de los primeros
        </h2>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-secondary)",
            maxWidth: 480,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Foqo esta en desarrollo. Unete a la waitlist y se de los primeros en
          tener acceso cuando lancemos en Chile.
        </p>

        {status === "success" ? (
          <div
            style={{
              background: "var(--voy-dim)",
              border: "1px solid var(--voy)",
              borderRadius: 16,
              padding: "24px 32px",
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <IconCheck size={20} />
              <p style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--voy)" }}>
                Estas dentro
              </p>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Te avisaremos cuando Foqo este listo. Gracias por creer en esto.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: 12,
              maxWidth: 460,
              margin: "0 auto",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: 240,
                padding: "14px 20px",
                borderRadius: 100,
                border: "1px solid var(--border)",
                background: "var(--surface-1)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={status === "loading"}
              style={{ opacity: status === "loading" ? 0.7 : 1 }}
            >
              {status === "loading" ? "Enviando..." : "Unirme"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p style={{ color: "#ef4444", marginTop: 12, fontSize: "0.875rem" }}>{errorMsg}</p>
        )}

        <p style={{ marginTop: 24, fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
          Sin spam. Solo te contactaremos para darte acceso.
        </p>
      </div>
    </section>
  );
}
