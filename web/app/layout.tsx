import type { Metadata } from 'next';
import { Orbitron, Share_Tech_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-tech-mono',
  subsets: ['latin'],
  weight: '400',
});

const BASE_APP_ID =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? 'placeholder';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'Tron Light Cycles',
  description:
    'Neon grid combat on Base. Swipe to turn, trap rivals, clear sectors.',
  icons: {
    icon: '/app-icon.jpg',
    apple: '/app-icon.jpg',
  },
  openGraph: {
    title: 'Tron Light Cycles',
    description: 'Neon light-cycle arena on Base',
    images: ['/app-thumbnail.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={BASE_APP_ID} />
      </head>
      <body className="min-h-dvh flex flex-col bg-[var(--void)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
        <div className="crt-overlay" aria-hidden />
      </body>
    </html>
  );
}
