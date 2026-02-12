// lib/api/paymentsApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Payment {
  id: number;
  //sale: number;
  transaction_id?: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

// ✅ CORRECT - Matches what Checkout sends
export interface CreateMpesaPaymentRequest {
  shipping_address: string;
  phone_number: string;
  items: Array<{
    product: number;
    quantity: number;
    price_at_sale: number;
  }>;
  // Optional - if you want to use existing sale
  sale_id?: number;
}

// ✅ CORRECT - Matches what backend returns
export interface CreateMpesaPaymentResponse {
  message: string;
  sale_id: number;
  transaction_id: string;
  status: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let error: any;
    try {
      error = await response.json();
    } catch {
      error = { detail: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(error.detail || error.message || 'Payment request failed');
  }

  return response.json();
}

export const paymentsApi = {
  // ✅ CORRECT - Creates sale AND initiates payment
  initiatePayment: (paymentData: CreateMpesaPaymentRequest): Promise<CreateMpesaPaymentResponse> =>
    apiRequest<CreateMpesaPaymentResponse>('/payments/create-payment/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // You need to implement these endpoints on the backend first!
  // Comment them out until they exist:
  
  // checkPaymentStatus: (checkoutRequestId: string): Promise<Payment> =>
  //   apiRequest<Payment>(`/payments/status/${checkoutRequestId}/`, {
  //     method: 'GET',
  //   }),

  // getPaymentBySale: (saleId: number): Promise<Payment> =>
  //   apiRequest<Payment>(`/payments/sale/${saleId}/`, {
  //     method: 'GET',
  //   }),

  // getPayments: (): Promise<Payment[]> =>
  //   apiRequest<Payment[]>('/payments/', { method: 'GET' }),
};

// Comment this out until checkPaymentStatus exists
/*
export async function pollPaymentStatus(
  checkoutRequestId: string,
  interval = 3000,
  maxAttempts = 20
): Promise<Payment> {
  // ... existing code
}
*/