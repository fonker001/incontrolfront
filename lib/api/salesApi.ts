// lib/api/salesApi.ts - Updated to match Django backend structure
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Interfaces matching Django models
export interface SaleItem {
  id?: number;
  product: number; // Product ID
  product_name: string;
  brand_name: string;
  quantity: number;
  price_at_sale: number;
  line_total: number;
}

export interface Sale {
  id: number;
  client: number; // Client ID
  client_name: string;
  sale_date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_id?: string;
  shipping_address: string;
  items: SaleItem[];
}

export interface CreateSaleDto {
  client: number; // Client ID
  shipping_address: string;
  items: Array<{
    product: number; // Product ID
    quantity: number;
    price_at_sale: number;
  }>;
}

export interface POSItem {
  product: number; // Product ID
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface POSSale {
  id: number;
  client?: number; // Client ID (optional for POS)
  timestamp: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  served_by: string;
  items: POSItem[];
}

export interface CreatePOSSaleDto {
  client?: number; // Optional client ID
  payment_method: 'cash' | 'card' | 'mobile_money';
  served_by: string;
  items: Array<{
    product: number; // Product ID
    quantity: number;
    unit_price: number;
  }>;
}

// For frontend cart
export interface CartItem {
  product_id: number;
  product_name: string;
  brand_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Update the SalesStats interface in salesApi.ts:
export interface SalesStats {
  total_revenue: number;
  total_sales: number;
  recent_sales: number;
  avg_sale_value: number; // Change this to avg_order_value if you prefer
  top_products: Array<{
    name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  low_stock_items?: number;  // Optional: for dashboard
  out_of_stock_items?: number; // Optional: for dashboard
}

// -------------------
// HELPER FUNCTION
// -------------------
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
    throw new Error(error.detail || error.message || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// -------------------
// ONLINE SALES API
// -------------------
export const salesApi = {
  // Create a new sale (online)
  createSale: (saleData: CreateSaleDto): Promise<Sale> =>
    apiRequest<Sale>('/payments/create-payment/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    }),

  // Get all sales
  getSales: (params?: {
    status?: string;
    client?: number;
    search?: string;
    ordering?: string;
  }): Promise<{ results: Sale[]; count: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.client) queryParams.append('client', params.client.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ordering) queryParams.append('ordering', params.ordering);
    
    const queryString = queryParams.toString();
    const url = `/sales/${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ results: Sale[]; count: number }>(url);
  },

  // -------------------
  // POS SALES API
  // -------------------
  
  // Create POS sale
  createPOSSale: (saleData: CreatePOSSaleDto): Promise<POSSale> =>
    apiRequest<POSSale>('/pos/pos-transactions/', {
      method: 'POST',
      body: JSON.stringify(saleData),
    }),

  // Get all POS sales
  getPOSSales: (): Promise<POSSale[]> =>
    apiRequest<POSSale[]>('/pos/pos-transactions/'),

  // Get single POS sale
  getPOSSale: (id: number): Promise<POSSale> =>
    apiRequest<POSSale>(`/pos/pos-transactions/${id}/`),

  // -------------------
  // CART MANAGEMENT (Frontend-only)
  // -------------------
  
  getCartFromStorage: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const cartJson = localStorage.getItem('cart');
    return cartJson ? JSON.parse(cartJson) : [];
  },

  saveCartToStorage: (cart: CartItem[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  addToCart: (item: CartItem): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const existingItemIndex = cart.findIndex(
      (ci) => ci.product_id === item.product_id
    );

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += item.quantity;
      cart[existingItemIndex].line_total = 
        cart[existingItemIndex].quantity * cart[existingItemIndex].unit_price;
    } else {
      cart.push(item);
    }

    salesApi.saveCartToStorage(cart);
    return cart;
  },

  updateCartItem: (productId: number, quantity: number): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const itemIndex = cart.findIndex((ci) => ci.product_id === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
        cart[itemIndex].line_total = quantity * cart[itemIndex].unit_price;
      }
    }

    salesApi.saveCartToStorage(cart);
    return cart;
  },

  removeCartItem: (productId: number): CartItem[] => {
    const cart = salesApi.getCartFromStorage();
    const filteredCart = cart.filter((ci) => ci.product_id !== productId);
    salesApi.saveCartToStorage(filteredCart);
    return filteredCart;
  },

  clearCart: (): void => {
    salesApi.saveCartToStorage([]);
  },

  calculateCartTotal: (cart: CartItem[]): number => {
    return cart.reduce((total, item) => total + item.line_total, 0);
  },
};

// Helper to transform frontend cart to sale data (online)
export function transformCartToSaleData(
  cart: CartItem[],
  clientId: number,
  shippingAddress: string
): CreateSaleDto {
  return {
    client: clientId,
    shipping_address: shippingAddress,
    items: cart.map(item => ({
      product: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.unit_price,
    })),
  };
}

// Helper to transform frontend cart to POS sale data
export function transformCartToPOSSaleData(
  cart: CartItem[],
  servedBy: string,
  paymentMethod: 'cash' | 'card' | 'mobile_money',
  clientId?: number
): CreatePOSSaleDto {
  return {
    client: clientId,
    payment_method: paymentMethod,
    served_by: servedBy,
    items: cart.map(item => ({
      product: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })),
  };
}