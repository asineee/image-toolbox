import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b0f19',
};

export const metadata: Metadata = {
  title: 'Image Toolbox — Powerful In-Browser Privacy-First Image Tools',
  description:
    'Resize, compress, convert, rotate, and inspect your images directly inside your browser. 100% private. Your images never leave your device.',
  keywords: [
    'image toolbox',
    'image processing',
    'image resizer',
    'image compressor',
    'convert image format',
    'webp converter',
    'png converter',
    'jpg compressor',
    'privacy first image tool',
    'client side image editor',
  ],
  authors: [{ name: 'Image Toolbox Team' }],
  openGraph: {
    title: 'Image Toolbox — Powerful In-Browser Image Tools',
    description:
      'Resize, compress, convert, rotate, and inspect images without sending them to any server. 100% private by design.',
    url: 'https://imagetoolbox.app',
    siteName: 'Image Toolbox',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Toolbox — Private In-Browser Image Tools',
    description:
      'Resize, compress, convert, rotate, and inspect images without sending them to a server.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Image Toolbox',
              applicationCategory: 'MultimediaApplication',
              operatingSystem: 'Any',
              description:
                'Powerful client-side image editor to resize, compress, convert, and rotate images locally in your browser.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="bg-dark-950 text-gray-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
};
