import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/AppProviders';
import InitialLoader from '@/components/loading/InitialLoader';

const tajawal = Tajawal({
  weight: ['400', '500', '700'],
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-tajawal',
});

const robotoMono = Roboto_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

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
      <body className={`${tajawal.variable} ${robotoMono.variable} font-body antialiased`} style={{ fontFamily: 'var(--font-tajawal), var(--font-roboto-mono), monospace, sans-serif' }}>
        <AppProviders>
          <InitialLoader>{children}</InitialLoader>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
