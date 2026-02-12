// productApi.ts - UPDATED VERSION
import { inventoryApi } from './inventoryApi';

export interface FrontendProduct {
  id: number;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  image?: string;
  category?: string;
  inStock: boolean;
  is_active: boolean;
}

// Helper function to fetch from public endpoint without auth
async function fetchPublicProducts(params?: {
  category?: number;
  is_active?: boolean;
  search?: string;
}): Promise<any[]> {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';
  const url = new URL(`${API_BASE}/inventory/products/`);
  
  // Add query parameters
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
      // No Authorization header for public access
    },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  
  return res.json();
}

export const productApi = {
  // Get products for customers (public endpoint)
  async getCustomerProducts(params?: {
    category?: number;
    search?: string;
  }): Promise<FrontendProduct[]> {
    try {
      // Use the public fetch function instead of inventoryApi.getProducts()
      const products = await fetchPublicProducts({
        ...params,
        is_active: true, // Only get active products for customers
      });
      
      return products.map((item: any) => ({
        id: item.id,
        name: item.brand_name || item.product_name,
        price: parseFloat(item.selling_price?.toString() || '0'),
        description: item.description,
        quantity: item.stock_qty || 0,
        image: this.getProductImageUrl(item.image),
        category: item.category_name,
        inStock: (item.stock_qty || 0) > 0 && item.is_active,
        is_active: item.is_active,
      }));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return [];
    }
  },

  // Get single product for customers
  async getCustomerProduct(id: number): Promise<FrontendProduct> {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';
      const res = await fetch(`${API_BASE}/inventory/products/${id}/`, {
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error('Product not found');
      }
      
      const product = await res.json();
      
      return {
        id: product.id,
        name: product.brand_name || product.product_name,
        price: parseFloat(product.selling_price?.toString() || '0'),
        description: product.description,
        quantity: product.stock_qty || 0,
        image: this.getProductImageUrl(product.image),
        category: product.category_name,
        inStock: (product.stock_qty || 0) > 0 && product.is_active,
        is_active: product.is_active,
      };
    } catch (error) {
      console.error('Failed to fetch product:', error);
      throw error;
    }
  },

  // Helper to build image URL
  getProductImageUrl(imagePath?: string): string | undefined {
    if (!imagePath) return undefined;
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, construct full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com';
    return `${baseUrl}${imagePath}`;
  },

  // Get categories for customers (public endpoint)
  async getCustomerCategories(): Promise<any[]> {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';
      const res = await fetch(`${API_BASE}/inventory/categories/`, {
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      return res.json();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  // Get products for admin (requires auth - uses inventoryApi)
  async list() {
    return inventoryApi.getProducts();
  },

  // Get single product for admin (requires auth)
  async get(id: number) {
    return inventoryApi.getProduct(id);
  },
};