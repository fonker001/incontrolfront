// services/orderApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CartItem {
  inventory_id: number;
  quantity: number;
}

interface CheckoutData {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_address: string;
  notes?: string;
}

class OrderApiService {
  private getAuthHeaders(): HeadersInit {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {
        'Content-Type': 'application/json',
      };
    }
    
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const headers = {
        ...this.getAuthHeaders(),
        ...options.headers,
      };

      console.log('API Request:', `${API_BASE_URL}${endpoint}`); // Debug log
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        credentials: 'include',
        ...options,
      });

      console.log('API Response:', response.status, response.statusText); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText); // Debug log
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.detail || errorJson.message || `API Error: ${response.statusText}`);
        } catch {
          throw new Error(`API Error ${response.status}: ${response.statusText}`);
        }
      }

      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  // ... rest of the methods remain the same
}

export const orderApiService = new OrderApiService();