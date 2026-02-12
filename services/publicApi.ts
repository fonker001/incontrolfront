// services/publicApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CartItem {
  id: string;
  inventory_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface CartResponse {
  items: CartItem[];
  total_price: number;
  session_id: string;
}

export interface CheckoutData {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  lastName?: string; // Add this field if needed
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface OrderResponse {
  order_id: string;
  total_amount: number;
  message: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface PaymentRequestData {
  order_id: string;
  phone: string;
  amount: number;
  customer_name: string;
}

export interface PaymentResponse {
  payment_id: string;
  status: string;
  message: string;
  phone: string;
  amount: number;
  timestamp: string;
}

export const publicApiService = {
  // Cart operations
  async getCart(): Promise<CartResponse> {
    const response = await fetch(`${API_BASE}/sales/public/cart/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    return response.json();
  },

  async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    const response = await fetch(`${API_BASE}/sales/public/cart/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        inventory_id: productId,
        quantity,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }

    return response.json();
  },

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    // Since Django cart items might use different IDs, you might need to handle differently
    // For simplicity, we'll remove and re-add
    return this.addToCart(parseInt(itemId), quantity);
  },

  async removeCartItem(itemId: string): Promise<void> {
    // You'd need to implement this endpoint in Django
    // For now, we'll handle via context
    console.log('Remove item:', itemId);
  },

  // Checkout
  async checkout(data: CheckoutData): Promise<OrderResponse> {
    // Fix: Only include lastName if it exists
    const buyer_name = data.lastName 
      ? `${data.buyer_name} ${data.lastName}`.trim()
      : data.buyer_name;

    const response = await fetch(`${API_BASE}/sales/public/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        buyer_name: buyer_name,
        buyer_email: data.buyer_email,
        buyer_phone: data.buyer_phone,
        buyer_address: data.buyer_address,
        items: data.items,
        sale_type: 'online',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Checkout failed' }));
      throw new Error(error.error || error.detail || 'Checkout failed');
    }

    return response.json();
  },

  // Payment
  async initiatePayment(data: PaymentRequestData): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE}/sales/public/payment/initiate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: data.order_id,
        phone: data.phone,
        amount: data.amount,
        customer_name: data.customer_name,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Payment initiation failed' }));
      throw new Error(error.error || error.detail || 'Payment initiation failed');
    }

    return response.json();
  },

  async checkPaymentStatus(paymentId: string): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE}/sales/public/payment/status/${paymentId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    return response.json();
  },
};