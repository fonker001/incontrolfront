// app/admin/dashboard/pos/layout.tsx
"use client";

import { PosProvider } from '@/context/pos/PosContext';



export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PosProvider>{children}</PosProvider>;
}