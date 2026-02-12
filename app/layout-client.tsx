'use client';

import { useState } from 'react';
import { Header } from "@/components/frontpage/Header/Header";
import { Footer } from "@/components/frontpage/Footer/Footer";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <Header onCartClick={() => setIsCartOpen(true)} />
      {children}
      <Footer />
    </>
  );
}

{/*
  This code defines a Client-Side Wrapper Component in Next.js. Its primary job is to provide a consistent structure (Header and Footer) 
  for your website's pages and to manage the interactive state of the shopping cart.
  */}