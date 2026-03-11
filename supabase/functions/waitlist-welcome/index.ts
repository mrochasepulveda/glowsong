import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM = "Glowsong <bienvenido@glowsong.cl>";

function buildEmail(localName: string | null): string {
  const greeting = localName ? `Hola, <strong>${localName}</strong>` : "Hola";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Glowsong</title>
</head>
<body style="margin:0;padding:0;background:#080810;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080810;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <span style="font-size:1.75rem;font-weight:700;color:#C8A96E;letter-spacing:-0.02em;">
                Glowsong
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0F0F1A;border:1px solid #1E1E35;border-radius:16px;padding:40px 36px;">

              <!-- Eyebrow -->
              <p style="margin:0 0 20px;font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#C8A96E;">
                ✦ Lista de espera confirmada
              </p>

              <!-- Headline -->
              <h1 style="margin:0 0 16px;font-size:1.75rem;font-weight:700;line-height:1.2;color:#F5F0E8;">
                ${greeting} —<br/>quedaste dentro.
              </h1>

              <!-- Body -->
              <p style="margin:0 0 12px;font-size:1rem;line-height:1.7;color:#9090A8;">
                Glowsong automatiza la música de tu local para que siempre suene exactamente como debe — sin que tengas que tocar nada.
              </p>
              <p style="margin:0 0 32px;font-size:1rem;line-height:1.7;color:#9090A8;">
                Estamos lanzando con un grupo selecto de bares y restaurantes. Cuando estemos listos para ti, serás el primero en saberlo.
              </p>

              <!-- Divider -->
              <div style="height:1px;background:#1E1E35;margin-bottom:28px;"></div>

              <!-- What to expect -->
              <p style="margin:0 0 16px;font-size:0.875rem;font-weight:600;color:#F5F0E8;">
                Qué esperar:
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#C8A96E;font-size:0.875rem;padding-right:10px;vertical-align:top;">✦</td>
                        <td style="font-size:0.9375rem;color:#9090A8;line-height:1.5;">Acceso gratuito durante el período de lanzamiento</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#C8A96E;font-size:0.875rem;padding-right:10px;vertical-align:top;">✦</td>
                        <td style="font-size:0.9375rem;color:#9090A8;line-height:1.5;">Soporte directo con el equipo fundador</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#C8A96E;font-size:0.875rem;padding-right:10px;vertical-align:top;">✦</td>
                        <td style="font-size:0.9375rem;color:#9090A8;line-height:1.5;">Influyes en las features que construimos primero</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px;background:#1E1E35;margin:28px 0;"></div>

              <!-- CTA -->
              <p style="margin:0 0 20px;font-size:0.9375rem;color:#9090A8;line-height:1.6;">
                Mientras tanto, si tienes un bar o restaurante de tu red que podría beneficiarse de Glowsong, cuéntales.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#C8A96E;border-radius:100px;padding:12px 24px;">
                    <a href="https://glowsong.cl" style="color:#080810;text-decoration:none;font-size:0.9375rem;font-weight:600;">
                      Ver glowsong.cl →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0;font-size:0.8125rem;color:#4A4A6A;line-height:1.6;">
                Hecho con ♪ en Santiago, Chile 🇨🇱<br/>
                Glowsong · <a href="https://glowsong.cl" style="color:#4A4A6A;">glowsong.cl</a>
              </p>
              <p style="margin:8px 0 0;font-size:0.75rem;color:#3A3A5A;">
                Recibiste este email porque te uniste a la lista de espera de Glowsong.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  // Supabase Database Webhooks send a POST with the record payload
  try {
    const payload = await req.json();

    // payload.record contains the inserted waitlist row
    const record = payload?.record;
    if (!record?.email) {
      return new Response(JSON.stringify({ error: "No email in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, local_name } = record;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "Quedaste en lista — Glowsong te avisa cuando estemos listos",
        html: buildEmail(local_name),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    console.log("Email sent:", data.id, "to:", email);

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
