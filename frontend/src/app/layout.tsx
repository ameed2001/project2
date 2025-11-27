import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/700.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/AppProviders';
import InitialLoader from '@/components/loading/InitialLoader';

export const metadata: Metadata = {
  title: 'المحترف لحساب الكميات',
  description: 'تطبيق لحساب كميات مواد البناء وتتبع تقدم المشاريع الإنشائية',
  icons: {
    icon: '/favicon-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-body antialiased" style={{ fontFamily: "'Tajawal', 'Roboto Mono', system-ui, sans-serif" }}>
        <AppProviders>
          <InitialLoader>{children}</InitialLoader>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
