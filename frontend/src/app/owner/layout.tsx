// src/app/owner/layout.tsx
import type { ReactNode } from 'react';
import OwnerAppLayout from '@/components/owner/OwnerAppLayout';

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <OwnerAppLayout>{children}</OwnerAppLayout>;
}
