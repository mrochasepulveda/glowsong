import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glowsong — La música de tu local que se paga sola",
  description:
    "Glowsong conecta con Spotify y selecciona automáticamente la canción correcta para cada momento de tu negocio. Sin hardware, sin instalaciones.",
  keywords: ["música para negocios", "música para locales comerciales", "música para bares", "música para restaurantes", "música para tiendas", "Spotify negocios", "musica ambiental chile", "glowsong"],
  authors: [{ name: "Glowsong" }],
  openGraph: {
    title: "Glowsong — La música de tu local que se paga sola",
    description:
      "Algoritmo inteligente que selecciona la música correcta para cada momento de tu local. Conecta con Spotify en 5 minutos.",
    type: "website",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glowsong",
    description: "Música inteligente para negocios de Chile y LATAM.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Cabinet Grotesk — display font via Fontshare CDN */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
