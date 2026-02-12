// components/admin/pos/CartSidebar.tsx
"use client";

import { X, Trash2, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import { POSCartItem } from '@/types/pos';
import { toast } from "react-toastify";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: POSCartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout?: () => void; // Optional: Trigger checkout from parent
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  subtotal,
  tax,
  total,
  onCheckout,
}: CartSidebarProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckout = () => {
    onClose();
    if (onCheckout) {
      onCheckout();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateStockStatus = (item: POSCartItem) => {
    const availableStock = item.stock_qty;
    const orderedQuantity = item.quantity;
    
    if (availableStock === 0) {
      return { status: 'out-of-stock', message: 'Out of stock' };
    }
    
    if (orderedQuantity > availableStock) {
      return { status: 'insufficient', message: `Only ${availableStock} available` };
    }
    
    if (orderedQuantity === availableStock) {
      return { status: 'last-items', message: 'Last items' };
    }
    
    return { status: 'available', message: `${availableStock} in stock` };
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
      case 'insufficient':
        return 'text-orange-600 bg-orange-50';
      case 'last-items':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Sidebar */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md flex">
        <div className="w-full">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    POS Cart ({cart.length} items)
                  </h2>
                  <p className="text-xs text-gray-500">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} total units
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearCart}
                  disabled={cart.length === 0}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                  title="Clear cart"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                  <ShoppingCart className="h-20 w-20 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Cart is empty</p>
                  <p className="text-sm mt-1 text-center">
                    Scan or add products to start a sale
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const stockStatus = calculateStockStatus(item);
                    
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-emerald-600 opacity-70" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          {/* Header with name and price */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {item.name}
                              </h3>
                              {item.brand_name && (
                                <p className="text-xs text-gray-500">
                                  {item.brand_name}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 whitespace-nowrap">
                                {formatCurrency(item.price * item.quantity)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(item.price)} each
                              </p>
                            </div>
                          </div>

                          {/* Stock Status */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(stockStatus.status)}`}>
                            <div className="w-2 h-2 rounded-full mr-1.5" style={{
                              backgroundColor: stockStatus.status === 'available' ? '#10b981' :
                                              stockStatus.status === 'last-items' ? '#f59e0b' :
                                              stockStatus.status === 'insufficient' ? '#f97316' : '#ef4444'
                            }} />
                            {stockStatus.message}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-30"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock_qty}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    onUpdateQuantity(item.id, Math.min(Math.max(value, 1), item.stock_qty));
                                  }}
                                  className="w-12 text-center text-sm font-semibold border-x border-gray-300 py-2"
                                />
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-30"
                                  disabled={item.quantity >= item.stock_qty}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <span className="text-xs text-gray-500">
                                of {item.stock_qty}
                              </span>
                            </div>
                            
                            {/* Remove button */}
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with totals and actions */}
            {cart.length > 0 && (
              <div className="border-t bg-white p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">VAT (16%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-emerald-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (cart.length > 0) {
                          onClearCart();
                          toast.success('Cart cleared');
                        }
                      }}
                      disabled={cart.length === 0}
                      className="flex-1 py-2.5 text-sm text-red-500 font-medium hover:text-red-700 transition-colors disabled:opacity-30"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-2.5 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <ShoppingCart className="h-3 w-3 mr-1.5" />
                    <span>All prices include VAT. Stock is updated in real-time.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}