"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { items, removeItem, updateItem, clearCart, getCartTotal } = useCart();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;
  
  const cartItems = items || [];

  // Calculate subtotal, transport fee, and total
  const subtotal = getCartTotal();
  const transportFee = 200; // Fixed transport fee in KES
  const total = subtotal + transportFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} className="text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm font-medium">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div 
              className="flex-1 overflow-y-auto p-6"
              style={{ backgroundColor: '#f0fbfd' }}
            >
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart size={48} color="#d1d5db" className="mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId || `${item.product_id}-${Date.now()}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                          {item.image_path ? (
                            <img 
                              src={item.image_path.startsWith('http') ? item.image_path : `/images/products/${item.image_path}`}
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.jpg';
                              }}
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-600">
                              {item.product_name?.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{item.product_name}</h3>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold" style={{ color: '#0091AD' }}>
                              KES {Number(item.unit_price).toFixed(0)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItem(item.product_id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.product_id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6">
                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="w-full mb-4 px-4 py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Clear All Items
                </button>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">KES {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Transport</span>
                    <span className="font-medium">KES {transportFee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                    <span>Total</span>
                    <span>KES {total.toFixed(0)}</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button
                  onClick={() => {
                    onCheckout();
                    onClose();
                  }}
                  className="w-full py-4 text-white font-bold rounded-lg transition-all hover:opacity-90 mb-3"
                  style={{ backgroundColor: '#0091AD' }}
                >
                  Proceed to Checkout
                </button>
                
                {/* Continue Shopping Button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
