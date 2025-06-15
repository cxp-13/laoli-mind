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
  title: 'LaoliMind',
  description: 'LaoliMind is a premium content platform delivering Notion-based insights on AI and Web3 for high-level thinkers. Empower your transformation with curated knowledge.',
  keywords: [
    'LaoliMind',
    'Notion',
    'Web3',
    'AI',
    'knowledge platform',
    'digital transformation',
    'curated insights',
    'premium content',
    'cognitive upgrade',
    'notion templates',
  ],
  icons: {
    icon: '/favicon.png',
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