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
  title: 'laolimind:Lantanlaoli store - notion link for collection',
  description: 'Laolimind is a notion link platform to assist users in collecting purchases',
  keywords: [
    'Notion',
    'Web3',
    'AI',
    'rednote',
    'xiaohongshu',
    'notion links',
  ],
  icons: [{ rel: "icon", url: "/favicon.png" }],
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