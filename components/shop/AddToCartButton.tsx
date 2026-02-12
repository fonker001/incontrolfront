"use client";

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { salesApi, CartItem } from '@/lib/api/salesApi';
import { toast } from 'react-hot-toast';

interface AddToCartButtonProps {
  productId: number; // Changed from number to string to match inventory_id
  productName: string;
  price: number;
  imagePath?: string | null;
  className?: string;
  showLabel?: boolean;
  stock?: number;
  inventoryId?: string; // Alternative prop name for clarity
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  imagePath = null,
  className = '',
  showLabel = true,
  stock = 1,
  inventoryId, // Optional alternative
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    // Check stock
    if (stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    // Use inventoryId if provided, otherwise use productId
    const inventory_id = inventoryId || productId;

    try {
      setLoading(true);
      
      // Create cart item
      const cartItem: CartItem = {
        product_id: productId, // Convert to number for Django
        product_name: productName,
        brand_name: '', // Add empty brand name or get from props
        quantity: 1,
        unit_price: price,
        line_total: price,
      };

      // Add to cart using localStorage
      const updatedCart = salesApi.addToCart(cartItem);
      
      toast.success(`${productName} added to cart!`);
      setAdded(true);
      
      // Reset added state after 2 seconds
      setTimeout(() => setAdded(false), 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const buttonClasses = `
    flex items-center justify-center gap-2
    ${added 
      ? 'bg-emerald-600 hover:bg-emerald-700' 
      : 'bg-blue-600 hover:bg-blue-700'
    }
    text-white font-medium py-2 px-4 rounded-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || stock <= 0}
      className={buttonClasses}
      title={stock <= 0 ? 'Out of stock' : `Add ${productName} to cart`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          {showLabel && <span>Adding...</span>}
        </>
      ) : added ? (
        <>
          <Check size={18} />
          {showLabel && <span>Added!</span>}
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          {showLabel && <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
}