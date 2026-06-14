import type { Metadata, Viewport } from 'next';
import './globals.css';
import { validateEnv } from '@/lib/env-check';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

validateEnv();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://aikidsacademy.app';

export const metadata: Metadata = {
  title: {
    default: 'AI Kids Academy 🚀',
    template: '%s · AI Kids Academy',
  },
  description:
    'Safe, ad-free AI learning for children aged 9-15. ' +
    'Science experiments, engineering challenges, AI tutor, stories and more. COPPA compliant.',
  keywords: ['AI learning for kids','children education app','STEM for kids','AI tutor for children','safe learning app'],
  authors:  [{ name: 'AI Kids Academy' }],
  robots:   { index:true, follow:true },
  openGraph: {
    type: 'website', locale: 'en_US', url: APP_URL,
    siteName: 'AI Kids Academy',
    title: 'AI Kids Academy — Safe AI Learning for Ages 9-15',
    description: 'Safe, ad-free AI learning for children. Science, engineering, AI tutor and more.',
    images: [{ url: '/icons/icon.svg', width: 512, height: 512, alt: 'AI Kids Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Kids Academy — Safe AI Learning for Ages 9-15',
    description: 'Safe, ad-free AI learning for children.',
    images: ['/icons/icon.svg'],
  },
  icons: {
    icon:    [{ url:'/favicon.svg', type:'image/svg+xml' }],
    apple:   [{ url:'/icons/icon.svg', sizes:'180x180' }],
    other:   [{ rel:'mask-icon', url:'/icons/icon.svg', color:'#4F8EF7' }],
  },
  manifest:    '/manifest.json',
  metadataBase: new URL(APP_URL),
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'AI Kids Academy',
    startupImage:   '/icons/icon.svg',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width:              'device-width',
  initialScale:       1,
  minimumScale:       1,
  maximumScale:       5,
  userScalable:       true,
  viewportFit:        'cover',          // handles iPhone notch
  themeColor: [
    { media:'(prefers-color-scheme:light)', color:'#F5F7FF' },
    { media:'(prefers-color-scheme:dark)',  color:'#1A1D3A' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA iOS meta (not yet in Next.js metadata API) */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Kids" />
        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#1A1D3A" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
