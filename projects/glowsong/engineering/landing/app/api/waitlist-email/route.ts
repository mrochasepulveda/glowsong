import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildWelcomeEmail } from "./template";

export async function POST(req: Request) {
  try {
    const { email, localName, position } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = localName
      ? `Estás dentro, ${localName} 🎵`
      : "Estás dentro 🎵";

    const { error } = await resend.emails.send({
      from: "Glowsong <hola@glowsong.cl>",
      to: email,
      subject,
      html: buildWelcomeEmail({ localName, position }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
