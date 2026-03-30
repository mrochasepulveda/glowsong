import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foqo — Nunca te pierdas la musica que te importa",
  description:
    "Foqo te avisa cuando tocan tus artistas favoritos. Descubre eventos, confirma asistencia y nunca mas te pierdas un show.",
  openGraph: {
    title: "Foqo — Nunca te pierdas la musica que te importa",
    description: "Descubre eventos de musica en vivo personalizados para ti.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
