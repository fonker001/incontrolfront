// app/page.tsx - FIXED
"use client";

import { useState } from 'react';
import { Hero } from '@/components/frontpage/Hero/Hero';
import { ProductsList } from '@/components/frontpage/Product/ProductsList';
import { CartSidebar } from '@/components/frontpage/Cart/CartSidebar';
import { Header } from '@/components/frontpage/Header/Header';
import { Footer } from '@/components/frontpage/Footer/Footer';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleShopClick = () => {
    router.push('/shop');
  };

  const handleCartClick = () => {
    setIsCartOpen(true); // Open cart when cart icon is clicked
  };

  const handleAddToCart = (product: any) => {
    console.log('Product added to cart:', product);
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Add new product
    const updatedCart = [...existingCart, {
      ...product,
      cartQuantity: 1, // Add quantity for cart
      addedAt: new Date().toISOString()
    }];
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Open cart sidebar and show feedback
    setIsCartOpen(true);
    alert(`${product.name} added to cart!`);
  };

  const handleCheckout = () => {
    router.push('/checkout'); // Redirect to checkout page
  };

  return (
    <>
      <main className="min-h-screen">
        <Header onCartClick={handleCartClick} /> {/* Add onCartClick here */}
        <Hero onShopClick={handleShopClick} />
        <ProductsList onAddToCart={handleAddToCart} />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout} // Add this prop
        />
      </main>
      <Footer />
    </>
  );
}