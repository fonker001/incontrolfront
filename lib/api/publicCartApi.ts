// lib/api/publicCartApi.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

export interface PublicCartItem {
  id: string;  // This should match what Django returns
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
}

export interface PublicCart {
  id: string;
  session_id: string;
  items: PublicCartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

async function publicApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Create headers as a plain object
  const headersObj: Record<string, string> = { 
    'Content-Type': 'application/json',
  };

  // Add cache control headers
  headersObj['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  headersObj['Pragma'] = 'no-cache';
  headersObj['Expires'] = '0';

  // Add any custom headers from options
  if (options.headers) {
    if (Array.isArray(options.headers)) {
      // Handle array of [key, value] pairs
      options.headers.forEach(([key, value]) => {
        headersObj[key] = value;
      });
    } else if (options.headers instanceof Headers) {
      // Handle Headers object
      options.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
    } else {
      // Handle plain object
      Object.assign(headersObj, options.headers);
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: headersObj,
      credentials: 'include',  // Important for sessions
    });

    if (!response.ok) {
      const text = await response.text();
      let error: any;
      try {
        error = JSON.parse(text);
      } catch {
        error = { detail: text || 'Network error' };
      }
      throw new Error(error.detail || error.error || `HTTP ${response.status}: ${text}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('API Request failed:', error);
    throw new Error(error.message || 'Network request failed');
  }
}

export const publicCartApi = {
  getCart: () => publicApiRequest<PublicCart>('/sales/cart/'),
  
  addToCart: (inventoryId: number, quantity: number = 1) =>
    publicApiRequest<PublicCart>('/sales/cart/', {  // Note: Returns full cart
      method: 'POST', 
      body: JSON.stringify({ inventory_id: inventoryId, quantity }) 
    }),

  updateCartItem: (itemId: string, quantity: number) =>
    publicApiRequest<PublicCart>('/sales/cart/items/' + itemId + '/', {  // Note: Returns full cart
      method: 'PUT', 
      body: JSON.stringify({ quantity }) 
    }),

  removeCartItem: (itemId: string) =>
    publicApiRequest<PublicCart>('/sales/cart/items/' + itemId + '/', { 
      method: 'DELETE' 
    }),

  clearCart: () =>
    publicApiRequest<{message: string}>('/sales/cart/', { method: 'DELETE' }),
};