/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';


export default function AdminAuthPage() {
  const router = useRouter();
  const [redirectParam, setRedirectParam] = useState<string>('/admin/dashboard/sales');
  
  // API base URL - USE THIS
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // --- UI & FLOW STATE ---
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState<boolean>(false); 
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  // Get redirect param from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/admin/dashboard/sales';
      setRedirectParam(redirect);
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const adminEmail = localStorage.getItem('admin_email');
    
    if (token && adminEmail) {
      router.push(redirectParam);
    }
  }, [router, redirectParam]);

  /**
   * Step 1: Request OTP from backend
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use direct Django URL
      const response = await fetch(`${API_BASE}/staff/auth/request_otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success(`OTP sent to ${email}`);
        setStep(2);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to send OTP");
      }
    } catch (err) {
      console.error('OTP request error:', err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP with backend
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use direct Django URL
      const response = await fetch(`${API_BASE}/staff/auth/verify_otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ FIXED: Store ONLY in localStorage (remove cookie setting)
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('admin_email', email);
        
        // ✅ Store admin info
        if (data.admin) {
          localStorage.setItem('admin_info', JSON.stringify(data.admin));
        }

        toast.success("Login successful! Redirecting...");

        // ✅ Use router.push for Next.js navigation
        setTimeout(() => {
          router.push(redirectParam);
        }, 800);

      } else {
        toast.error(data.detail || "Invalid OTP");
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-gray-50 p-4">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* STEP 1: EMAIL INPUT */}
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a login code</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Code...
                </>
              ) : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Verify Identity</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the code sent to 
                <br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                (For testing, check server console for OTP)
              </p>
            </div>
            
            <div>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                required
                maxLength={6}
                className="w-full p-4 text-center text-3xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-all disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify & Login'}
            </button>
            
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm text-gray-500 hover:text-gray-800 transition"
                disabled={loading}
              >
                ← Change Email
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setEmail('');
                  setOtp('');
                  setStep(1);
                }} 
                className="text-sm text-gray-500 hover:text-gray-800 transition"
                disabled={loading}
              >
                Clear & Start Over
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Secure login powered by QUANTEDGE LIMITED
          </p>
        </div>
      </div>
    </div>
  );
}