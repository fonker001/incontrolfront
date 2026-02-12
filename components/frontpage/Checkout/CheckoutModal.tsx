// components/frontpage/Checkout/CheckoutModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import { useCart } from '@/context/cart/CartContext';
import { paymentApiService, PaymentRequestData } from '@/services/paymentApi';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'mpesa' | 'card';
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

interface PaymentResponse {
  payment: {
    id: string;
    status: 'pending' | 'success' | 'failed';
  };
}

interface OrderResponse {
  order_id: string;
  total_amount: number;
  message: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, clearCart, getCartTotal } = useCart();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiated' | 'pending' | 'success' | 'failed'>('idle');
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'mpesa',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const safeCartItems = items || [];
  const cartTotal = getCartTotal();

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const startPaymentPolling = (paymentId: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const payment = await paymentApiService.checkPaymentStatus(paymentId);

        if (payment.status === 'success') {
          setPaymentStatus('success');
          setOrderComplete(true);
          clearCart();
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        } else if (payment.status === 'failed') {
          setPaymentStatus('failed');
          setErrorMessage('Payment failed. Please try again.');
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
      } catch (error) {
        console.error('Payment polling error:', error);
      }
    }, 3000);

    // Stop polling after 2 minutes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      setPaymentStatus((prev) => {
        if (prev === 'pending') {
          setErrorMessage('Payment timeout. Please check your phone or try again.');
          return 'idle';
        }
        return prev;
      });
    }, 120000);
  };

  const formatPhoneNumber = (phone: string) => {
    let formatted = phone.trim().replace(/\s+/g, '');
    if (formatted.startsWith('+')) formatted = formatted.slice(1);
    if (formatted.startsWith('0')) formatted = '254' + formatted.slice(1);
    if (!formatted.startsWith('254')) formatted = '254' + formatted;
    return formatted;
  };

  const handleMpesaPayment = async (orderId: string) => {
    try {
      setPaymentStatus('initiated');

      const paymentRequest: PaymentRequestData = {
        order: orderId,
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_phone: formatPhoneNumber(formData.phone),
        delivery_address: formData.address,
      };

      const response = await paymentApiService.initiatePayment(paymentRequest);

      setPaymentData(response);
      setPaymentStatus('pending');

      startPaymentPolling(response.payment.id);
    } catch (error: any) {
      console.error('M-Pesa payment failed:', error);
      setErrorMessage(error.message || 'Failed to initiate M-Pesa payment. Please try again.');
      setPaymentStatus('failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
        setErrorMessage('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setIsProcessing(true);
      setPaymentStatus('idle');

      try {
        const orderResponse: OrderResponse = {
          order_id: `ORD-${Date.now()}`,
          total_amount: cartTotal,
          message: 'Order created successfully',
          customer: {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            email: formData.email,
          },
        };

        setOrderData(orderResponse);

        if (formData.paymentMethod === 'mpesa') {
          await handleMpesaPayment(orderResponse.order_id);
        } else {
          setOrderComplete(true);
          clearCart();
        }
      } catch (error: any) {
        console.error('Checkout failed:', error);
        setErrorMessage(error.message || 'Failed to process order. Please try again.');
        setPaymentStatus('failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setOrderComplete(false);
    setPaymentStatus('idle');
    setPaymentData(null);
    setOrderData(null);
    setErrorMessage('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      paymentMethod: 'mpesa',
      cardNumber: '',
      cardExpiry: '',
      cardCVC: '',
    });
  };

  const handleClose = () => {
    if (!isProcessing && !orderComplete) {
      onClose();
      resetForm();
    }
  };

  if (safeCartItems.length === 0 && !orderComplete && paymentStatus !== 'pending') return null;

  const inputStyle = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-black placeholder:text-gray-500 bg-white";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* ...rest of your modal JSX unchanged... */}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
