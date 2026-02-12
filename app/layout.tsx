// app/layout.tsx - UPDATED
"use client";

import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; 

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  const handleCartClick = () => {
    router.push('/cart');
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ToastContainer position="top-right" autoClose={3000} />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}

{/*
  This updated RootLayout is the "master wrapper" for your entire Next.js application. While your previous version used local state to open a cart sidebar, this version changes the strategy: 
  it now treats the cart as a full-page destination and wraps the app in essential global services.
  */}