interface WelcomeEmailProps {
  localName: string | null;
  position: number;
}

export function buildWelcomeEmail({ localName, position }: WelcomeEmailProps): string {
  const greeting = localName ? `Hola, ${localName} 👋` : "Hola 👋";
  const whatsappMsg = encodeURIComponent("Encontré esto para la música del local, se ve bueno → glowsong.cl");
  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Glowsong</title>
</head>
<body style="margin:0;padding:0;background:#0A0A1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A1A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:40px;text-align:center;">
              <span style="color:#C8A96E;font-size:22px;font-weight:600;letter-spacing:0.5px;">✦ glowsong</span>
            </td>
          </tr>

          <!-- Greeting + position -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0 0 16px;color:#F5F0E8;font-size:20px;font-weight:600;">
                ${greeting}
              </p>
              <p style="margin:0 0 8px;color:#F5F0E8;font-size:16px;line-height:1.6;">
                Tu lugar está reservado.
              </p>
              <p style="margin:0;color:#C8A96E;font-size:28px;font-weight:700;">
                #${position} en la lista
              </p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;color:#9B9BA4;font-size:15px;line-height:1.7;">
                Estamos construyendo algo que va a cambiar cómo suena tu local. Música que se adapta a tu negocio, tus clientes y tu momento del día — sin que tengas que tocar nada.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px;background:rgba(200,169,110,0.15);"></div>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0 0 18px;color:#F5F0E8;font-size:16px;font-weight:600;">
                ¿Qué viene ahora?
              </p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:8px 0;color:#9B9BA4;font-size:14px;line-height:1.6;">
                    <span style="color:#C8A96E;margin-right:8px;">→</span>
                    Te contactamos personalmente cuando estemos listos para tu local
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9B9BA4;font-size:14px;line-height:1.6;">
                    <span style="color:#C8A96E;margin-right:8px;">→</span>
                    Los primeros en la lista acceden gratis al lanzamiento
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#9B9BA4;font-size:14px;line-height:1.6;">
                    <span style="color:#C8A96E;margin-right:8px;">→</span>
                    Mientras antes llegues, antes suena tu local
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="height:1px;background:rgba(200,169,110,0.15);"></div>
            </td>
          </tr>

          <!-- Referral CTA -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0 0 16px;color:#F5F0E8;font-size:15px;">
                ¿Conoces otro local que necesite mejor música?
              </p>
              <a href="${whatsappUrl}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
                📲 Compartir por WhatsApp
              </a>
              <p style="margin:14px 0 0;color:#6B6B75;font-size:13px;">
                Cada referido te sube en la lista.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:28px;">
              <div style="height:1px;background:rgba(200,169,110,0.15);"></div>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0 0 4px;color:#9B9BA4;font-size:14px;line-height:1.6;">
                — Mauro, fundador de Glowsong
              </p>
              <p style="margin:0;color:#6B6B75;font-size:13px;font-style:italic;">
                (Responde este mail, lo leo yo)
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;">
              <p style="margin:0;color:#4A4A54;font-size:11px;">
                glowsong.cl · Santiago, Chile
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
