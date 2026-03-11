import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Glowsong — Gestión Musical para tu Local',
  description: 'Plataforma inteligente de gestión musical para bares y locales de entretenimiento. Música que se adapta a cada momento del día.',
  keywords: ['música', 'bar', 'gestión musical', 'spotify', 'Chile'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080810',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
