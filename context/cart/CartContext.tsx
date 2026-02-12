"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

// Use the CartItem interface from salesApi.ts
export interface CartItem {
  product_id: number;
  product_name: string;
  brand_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  image_path?: string; // Optional for UI
  cartItemId?: string; // Add this for unique IDs in cart
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  isLoading?: boolean;
  error: string | null;
  items: CartItem[];
  cartCount: number;
  
  addItem: (item: Omit<CartItem, 'line_total' | 'cartItemId'>) => void;
  updateItem: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error('Failed to load cart from storage:', err);
      }
    };
    
    loadCart();
  }, []);

  // Calculate cart count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = useCallback((item: Omit<CartItem, 'line_total' | 'cartItemId'>) => {
    setLoading(true);
    setError(null);
    try {
      const existingItemIndex = cart.findIndex(
        (ci) => ci.product_id === item.product_id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        updatedCart[existingItemIndex].line_total = 
          updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].unit_price;
        setCart(updatedCart);
      } else {
        // Add new item with unique ID
        const newItem: CartItem = {
          ...item,
          cartItemId: `${item.product_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Add unique ID
          line_total: item.quantity * item.unit_price
        };
        setCart([...cart, newItem]);
      }
      
      toast.success('Item added to cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to add item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const updateItem = useCallback((productId: number, quantity: number) => {
    setLoading(true);
    setError(null);
    try {
      const itemIndex = cart.findIndex((ci) => ci.product_id === productId);

      if (itemIndex >= 0) {
        const updatedCart = [...cart];
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedCart.splice(itemIndex, 1);
        } else {
          // Update quantity
          updatedCart[itemIndex].quantity = quantity;
          updatedCart[itemIndex].line_total = quantity * updatedCart[itemIndex].unit_price;
        }
        
        setCart(updatedCart);
        toast.success('Cart updated');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to update item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const removeItem = useCallback((productId: number) => {
    setLoading(true);
    setError(null);
    try {
      const filteredCart = cart.filter((ci) => ci.product_id !== productId);
      setCart(filteredCart);
      toast.success('Item removed from cart');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to remove item: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const clearCart = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      setCart([]);
      toast.success('Cart cleared');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to clear cart: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.line_total, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      items: cart,
      loading,
      isLoading: loading,
      error,
      cartCount,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      getCartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}