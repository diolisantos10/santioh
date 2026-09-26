import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { CartProvider } from '@/components/cart';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import './globals.css';

// Fontes hospedadas no próprio site (Geist e Michroma, ambas OFL).
const sans = localFont({
  src: [
    { path: './fonts/Geist-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Geist-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});
const wide = localFont({ src: './fonts/michroma-latin-400-normal.woff2', weight: '400', variable: '--font-wide', display: 'swap' });

const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'Santioh — Óculos de sol', template: '%s · Santioh' },
  description: 'Óculos de sol para a pista, a música e a arte. Frete grátis para todo o Brasil.',
  openGraph: { siteName: 'Santioh', locale: 'pt_BR', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${wide.variable}`}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
