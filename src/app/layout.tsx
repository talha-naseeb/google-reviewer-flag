import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Google Flag Reviews - AI Moderation & Flagging Assistant',
  description: 'Automated monitoring, AI policy analysis, and 1-click flagging assistant for Google Business Profile reviews.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-rose-500 selection:text-white min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
