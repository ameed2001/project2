import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/AppProviders';
import InitialLoader from '@/components/loading/InitialLoader';

export const metadata: Metadata = {
  title: 'المحترف لحساب الكميات',
  description: 'تطبيق لحساب كميات مواد البناء وتتبع تقدم المشاريع الإنشائية',
  icons: {
    icon: 'https://i.imgur.com/79bO3U2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body font-mono antialiased" style={{ fontFamily: 'Tajawal, Roboto Mono, monospace, sans-serif' }}>
        <AppProviders>
          <InitialLoader>{children}</InitialLoader>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
