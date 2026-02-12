// services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}, auth: boolean = true) {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(auth && token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Public endpoint
  async getCustomerProducts() {
    return this.request('/inventory/customer/products/', {}, false); // no auth
  }

  // Other inventory methods
  async getInventory() {
    return this.request('/inventory/');
  }

  async getInventoryItem(id: string) {
    return this.request(`/inventory/${id}/`);
  }

  async createInventoryItem(data: any) {
    return this.request('/inventory/', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInventoryItem(id: string, data: any) {
    return this.request(`/inventory/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/${id}/`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
