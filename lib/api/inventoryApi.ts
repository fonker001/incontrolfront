const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';

import { authApi } from './authApi';

// Helper to check authentication before making requests
function checkAuth(): void {
  if (!authApi.isAuthenticated()) {
    throw new Error('Not authenticated. Please login first.');
  }
}

// Helper to get auth token
function getAuthToken(): string {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  return token;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category: number;  // Category ID
  category_name: string;  // Read-only field
  brand_name: string;
  product_name: string;
  description: string;
  selling_price: number;
  image?: string;
  stock_qty: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  category: number;
  brand_name: string;
  product_name: string;
  description: string;
  selling_price: number;
  image?: File | string;
  stock_qty?: number;
  is_active?: boolean;
}

export interface InventoryLog {
  id: number;
  product: number;
  product_details: string;  // Read-only field
  supplier: number;
  supplier_name: string;  // Read-only field
  quantity_bought: number;
  cost_price_per_unit: number;
  total_cost: number;
  delivery_date: string;
}

export interface InventoryLogFormData {
  product: number;
  supplier: number;
  quantity_bought: number;
  cost_price_per_unit: number;
  delivery_date?: string;
}

export interface StockValuation {
  total_items_in_warehouse: number;
  total_potential_revenue: number;
  message: string;
}

export interface QuickSearchProduct {
  id: number;
  brand_name: string;
  product_name: string;
  description: string;
  selling_price: number;
}

export const inventoryApi = {
  // ========== CATEGORIES ==========
  
  // List all categories (GET /api/inventory/categories/)
  // Update getCategories function
  async getCategories(): Promise<Category[]> {
    // Check auth first
    checkAuth(); // This will throw if not authenticated
    
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/inventory/categories/`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add auth header
      },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Please login to access categories');
      }
      throw new Error('Failed to fetch categories');
    }
    
    return res.json();
  },

  // Get single category (GET /api/inventory/categories/{id}/)
  async getCategory(id: number): Promise<Category> {
    checkAuth();
    
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/inventory/categories/${id}/`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add auth header
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Category not found');
      }
      if (res.status === 401) {
        throw new Error('Please login to access category');
      }
      throw new Error('Failed to fetch category');
    }
    
    return res.json();
  },


  // Create category (POST /api/inventory/categories/)
  async createCategory(categoryData: { name: string; slug?: string }): Promise<Category> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/categories/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || Object.values(error).flat().join(', ') || 'Failed to create category');
    }
    
    return res.json();
  },

  // Update category (PUT /api/inventory/categories/{id}/)
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/categories/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || Object.values(error).flat().join(', ') || 'Failed to update category');
    }
    
    return res.json();
  },

  // Delete category (DELETE /api/inventory/categories/{id}/)
  async deleteCategory(id: number): Promise<void> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/categories/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Category not found');
      }
      throw new Error('Failed to delete category');
    }
  },

  // ========== PRODUCTS ==========
  
  // List all products (GET /api/inventory/products/)
  async getProducts(params?: {
    category?: number;
    is_active?: boolean;
    brand_name?: string;
    search?: string;
    ordering?: string;
  }): Promise<Product[]> {
    const url = new URL(`${API_BASE}/inventory/products/`);
    
    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const res = await fetch(url.toString(), {
      headers: { 
        'Content-Type': 'application/json',
        // No Authorization header anymore
      },
    });
    
    if (!res.ok) {
      // Remove the 401 check since we're not using auth
      throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
    }
    
    return res.json();
  },

  // Get single product (GET /api/inventory/products/{id}/)
  async getProduct(id: number): Promise<Product> {
    checkAuth();
    
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/inventory/products/${id}/`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add auth header
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      if (res.status === 401) {
        throw new Error('Please login to access product');
      }
      throw new Error('Failed to fetch product');
    }
    
    return res.json();
  },

  // Create product (POST /api/inventory/products/)
  async createProduct(productData: ProductFormData, imageFile?: File): Promise<Product> {
    checkAuth();
    
    const formData = new FormData();
    
    // Add all fields except image
    Object.entries(productData).forEach(([key, value]) => {
      if (key !== 'image' && value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add image if exists
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (productData.image && typeof productData.image === 'string') {
      // If image is a URL string (for existing image), include it
      formData.append('image', productData.image);
    }
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/products/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Content-Type header for FormData
      },
      body: formData,
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.detail || 
        Object.values(error).flat().join(', ') || 
        'Failed to create product'
      );
    }
    
    return res.json();
  },

  // Update product (PUT /api/inventory/products/{id}/)
  async updateProduct(id: number, productData: Partial<ProductFormData>, imageFile?: File | null): Promise<Product> {
    checkAuth();
    
    // For partial updates (PATCH), check if we need to use FormData
    const hasImage = imageFile !== undefined;
    const hasNonImageFields = Object.keys(productData).some(key => key !== 'image');
    
    if (hasImage || hasNonImageFields) {
      // Use FormData when image is involved or when using PATCH
      const formData = new FormData();
      
      // Add all non-image fields
      Object.entries(productData).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Handle image
      if (imageFile !== undefined) {
        if (imageFile === null) {
          // To clear image, send empty string
          formData.append('image', '');
        } else if (imageFile instanceof File) {
          formData.append('image', imageFile);
        }
      }
      
      const token = getAuthToken();
      
      const res = await fetch(`${API_BASE}/inventory/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.detail || 
          Object.values(error).flat().join(', ') || 
          'Failed to update product'
        );
      }
      
      return res.json();
    } else {
      // Use JSON for simple updates
      const token = getAuthToken();
      
      const res = await fetch(`${API_BASE}/inventory/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.detail || 
          Object.values(error).flat().join(', ') || 
          'Failed to update product'
        );
      }
      
      return res.json();
    }
  },

  // Delete product (DELETE /api/inventory/products/{id}/)
  async deleteProduct(id: number): Promise<void> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/products/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error('Failed to delete product');
    }
  },

  // Get stock valuation (GET /api/inventory/products/stock-valuation/)
  async getStockValuation(): Promise<StockValuation> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/products/stock-valuation/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Please login to access stock valuation');
      }
      throw new Error('Failed to fetch stock valuation');
    }
    
    return res.json();
  },

  // Quick search products (GET /api/inventory/products/quick-search/)
  async quickSearch(brand?: string): Promise<QuickSearchProduct[]> {
    checkAuth();
    
    const token = getAuthToken();
    const url = new URL(`${API_BASE}/inventory/products/quick-search/`);
    
    if (brand) {
      url.searchParams.append('brand', brand);
    }
    
    const res = await fetch(url.toString(), {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add auth header
      },
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Please login to search products');
      }
      throw new Error('Failed to search products');
    }
    
    return res.json();
  },

  // ========== INVENTORY LOGS (STOCK-IN) ==========
  
  // List all inventory logs (GET /api/inventory/stock-in/)
  async getInventoryLogs(): Promise<InventoryLog[]> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/stock-in/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch inventory logs');
    }
    
    return res.json();
  },

  // Get single inventory log (GET /api/inventory/stock-in/{id}/)
  async getInventoryLog(id: number): Promise<InventoryLog> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/stock-in/${id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Inventory log not found');
      }
      throw new Error('Failed to fetch inventory log');
    }
    
    return res.json();
  },

  // Create inventory log (POST /api/inventory/stock-in/)
  async createInventoryLog(logData: InventoryLogFormData): Promise<InventoryLog> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/stock-in/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(
        error.detail || 
        Object.values(error).flat().join(', ') || 
        'Failed to create inventory log'
      );
    }
    
    return res.json();
  },

  // Delete inventory log (DELETE /api/inventory/stock-in/{id}/)
  async deleteInventoryLog(id: number): Promise<void> {
    checkAuth();
    
    const token = getAuthToken();
    
    const res = await fetch(`${API_BASE}/inventory/stock-in/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Inventory log not found');
      }
      throw new Error('Failed to delete inventory log');
    }
  },
};

// Helper to get full image URL
export function getImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, construct full URL
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com';
  return `${baseUrl}${imagePath}`;
}