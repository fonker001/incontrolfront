"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Get redirect param from window.location instead of useSearchParams
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '';
      
      // Redirect to admin login with the same redirect parameter
      router.replace(`/admin/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}