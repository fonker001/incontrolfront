// components/admin/pos/CheckoutModal.tsx
"use client";

import { motion } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, User, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { POSCartItem, CustomerData } from '@/types/pos';

interface CheckoutModalProps {
  onClose: () => void;
  onCheckout: (customerData: CustomerData) => Promise<void>;
  loading: boolean;
  cart: POSCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  servedBy: string;
  onClientSelect?: (clientId: number) => void;
}

export default function CheckoutModal({
  onClose,
  onCheckout,
  loading,
  cart,
  subtotal,
  tax,
  total,
  servedBy,
  onClientSelect,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
  const [existingClientId, setExistingClientId] = useState<number | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: CustomerData = {
      client_id: existingClientId,
      name: customerName,
      phone: customerPhone,
      email: customerEmail || undefined,
      address: customerAddress || undefined,
      payment_method: paymentMethod,
    };
    
    await onCheckout(customerData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const paymentMethods = [
    { id: 'cash' as const, name: 'Cash', icon: Wallet },
    { id: 'card' as const, name: 'Card', icon: CreditCard },
    { id: 'mobile_money' as const, name: 'M-Pesa', icon: Smartphone },
  ];

  const calculateItemTotal = (item: POSCartItem) => {
    return item.price * item.quantity;
  };

  const handleQuickCustomer = (type: 'walkin' | 'regular' | 'corporate') => {
    switch (type) {
      case 'walkin':
        setCustomerName('Walk-in Customer');
        setCustomerAddress('In-store pickup');
        setExistingClientId(undefined);
        break;
      case 'regular':
        setCustomerName('Regular Customer');
        setCustomerPhone('07********');
        setCustomerAddress('123 Main Street, Nairobi');
        break;
      case 'corporate':
        setCustomerName('Corporate Client');
        setCustomerEmail('corporate@example.com');
        setCustomerAddress('Corporate Office, Westlands');
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-lg max-w-4xl w-full my-auto"
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Side - Order Summary */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">POS Checkout</h2>
                <p className="text-sm text-gray-600">Served by: {servedBy}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-sm ml-2">
                      {formatCurrency(calculateItemTotal(item))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Tax (16% VAT)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Quick Customer Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => handleQuickCustomer('walkin')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs sm:text-sm"
                disabled={loading}
              >
                Walk-in
              </button>
              <button
                type="button"
                onClick={() => handleQuickCustomer('regular')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs sm:text-sm"
                disabled={loading}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => handleQuickCustomer('corporate')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs sm:text-sm"
                disabled={loading}
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Right Side - Customer & Payment */}
          <div className="flex-1 p-4 sm:p-6 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Customer Info</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Address (Optional)"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center justify-center p-2 border rounded transition-all ${
                          paymentMethod === method.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                        disabled={loading}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{method.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Receipt Options */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="printReceipt"
                    defaultChecked
                    className="h-4 w-4 text-emerald-600"
                    disabled={loading}
                  />
                  <label htmlFor="printReceipt" className="text-sm text-gray-700">
                    Print receipt
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendReceipt"
                    className="h-4 w-4 text-emerald-600"
                    disabled={loading}
                  />
                  <label htmlFor="sendReceipt" className="text-sm text-gray-700">
                    Send digital receipt
                  </label>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  `Complete ${paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'card' ? 'Card' : 'M-Pesa'} Sale`
                )}
              </button>

              {/* Additional Info */}
              <div className="text-center text-xs text-gray-500 pt-2">
                <p>This sale will update inventory immediately.</p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}