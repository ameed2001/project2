"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('adminSidebarState');
      setIsSidebarOpen(savedState ? savedState === 'open' : true);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('adminSidebarState', newState ? 'open' : 'closed');
      return newState;
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1" dir="rtl">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <main
          className={cn(
            "flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto transition-all duration-300 ease-in-out"
          )}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
