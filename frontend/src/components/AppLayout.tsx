"use client";

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar'; // Import Navbar

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <Navbar /> {/* Add Navbar here */}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
