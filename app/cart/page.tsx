"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    loading: isLoading, 
    removeItem, 
    updateItem, 
    clearCart,
    getCartTotal 
  } = useCart();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totalPrice = getCartTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      router.push('/checkout');
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-600">Add some items to get started</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.product_id} className="py-6 flex">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                          {item.image_path ? (
                            <img 
                              src={item.image_path.startsWith('http') ? item.image_path : `/images/products/${item.image_path}`}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.jpg';
                              }}
                            />
                          ) : (
                            <ShoppingBag className="h-12 w-12 text-gray-400" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="ml-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {item.product_name}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Brand: {item.brand_name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                KES {item.unit_price.toFixed(0)} each
                              </p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              KES {item.line_total.toFixed(0)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="mt-3 flex items-center space-x-3">
                            <button
                              onClick={() => updateItem(item.product_id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem(item.product_id, item.quantity + 1)}
                              disabled={isLoading}
                              className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              disabled={isLoading}
                              className="ml-4 p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clear Cart Button */}
                <div className="mt-6">
                  <button
                    onClick={clearCart}
                    disabled={isLoading}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    KES {totalPrice.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-emerald-700">
                      KES {totalPrice.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || isLoading}
                className="mt-6 w-full bg-emerald-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}