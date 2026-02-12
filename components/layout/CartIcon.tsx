"use client";

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';

{/*
  
  CartIcon component renders a shopping cart icon with a badge showing 
  the number of items in the cart.
  It links to the cart page and shows loading state when cart is being fetched.
  
  */}

export default function CartIcon() {
  const { cartCount, isLoading } = useCart();

  return (
    <Link 
      href="/cart" 
      className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
    >
      <ShoppingCart size={24} />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
      {isLoading && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          ...
        </span>
      )}
    </Link>
  );
}