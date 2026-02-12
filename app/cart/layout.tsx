// app/cart/layout.tsx
"use client";

import { CartProvider } from '@/context/cart/CartContext';

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}