"use client";

import {Contact} from '@/components/frontpage/Contact/Contact';
import { Header } from '@/components/frontpage/Header/Header';
import {Footer} from '@/components/frontpage/Footer/Footer';

export default function Page() {
  const handleCartClick = () => {
    // Handle cart click logic here
    console.log('Cart clicked');
  };

  return (
    <>
      <Header onCartClick={handleCartClick} />
      <Contact />
      <Footer />
    </>
  );
}
