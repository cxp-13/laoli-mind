import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'LaoliMind | AI & Web3 Transformation Resources',
  description: 'LaoliMind offers Notion-based AI and Web3 transformation resources purchased on Rednote, available for free self-service access.',
  keywords: [
    'LaoliMind',
    'Notion',
    'Web3',
    'AI',
    'Transformation Resources',
    'Digital Transformation',
    'Knowledge Platform',
    'Self-Service Access',
  ],
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'LaoliMind | AI & Web3 Transformation Resources',
    description: 'Curated by influencer Laoli on Rednote, access Notion AI & Web3 transformation packs instantly with email verification.',
    url: 'https://laolimind.vercel.app/',
    siteName: 'LaoliMind',
    images: [
      {
        url: 'https://laolimind.vercel.app/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'LaoliMind Transformation Resources',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaoliMind | AI & Web3 Transformation Resources',
    description: 'Curated by influencer Laoli on Rednote, access Notion AI & Web3 transformation packs instantly with email verification.',
    images: ['https://laolimind.vercel.app/og-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-site-verification': 'TzNZIjYP45gXInPSyykjt9fY85Qgun7nS23oY4l9Sqg',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-inter antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}