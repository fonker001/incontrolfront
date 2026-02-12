// services/paymentApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PaymentRequestData {
  order: string; // Order UUID
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
}

export interface PaymentResponse {
  id: string;
  order: string;
  order_id: string;
  order_total: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  amount: string;
  status: 'pending' | 'success' | 'failed';
  mpesa_checkout_request_id?: string;
  mpesa_response_code?: string;
  mpesa_response_desc?: string;
  processed_by?: number;
  processed_by_name?: string;
  created_at: string;
  updated_at: string;
}

class PaymentApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Initiate M-Pesa payment
  async initiatePayment(data: PaymentRequestData) {
    return this.request('/payments/initiate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all payments
  async getPayments() {
    return this.request('/payments/');
  }

  // Get single payment
  async getPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}/`);
  }

  // Check payment status (polling)
  async checkPaymentStatus(paymentId: string) {
    return this.request(`/payments/${paymentId}/`);
  }

  // Simulate M-Pesa callback (for testing only)
  async simulateCallback(checkoutRequestId: string, success: boolean = true) {
    return this.request('/payments/callback/', {
      method: 'POST',
      body: JSON.stringify({
        checkout_request_id: checkoutRequestId,
        result_code: success ? '0' : '1',
        result_desc: success ? 'Success' : 'Failed',
      }),
    });
  }
}

export const paymentApiService = new PaymentApiService();