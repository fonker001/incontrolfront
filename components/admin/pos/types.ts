// components/admin/pos/types.ts
// Updated types to match Django backend

export interface POSCartItem {
  id: string; // Unique cart item ID (frontend only)
  product_id: number; // Backend product ID
  name: string; // Display name
  price: number; // Unit price
  quantity: number; // Quantity in cart
  image?: string; // Product image URL
  stock_qty: number; // Current stock quantity
}

export interface CustomerData {
  client_id?: number; // Client ID (for existing customers)
  name: string; // Customer name
  phone?: string; // Phone number
  email?: string; // Email
  address?: string; // Shipping/billing address
  payment_method: 'cash' | 'card' | 'mobile_money';
}

// Re-export Product type from inventoryApi
export type { Product } from '@/lib/api/inventoryApi';

// New types for POS Sale
export interface POSItem {
  product: number; // Product ID
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface POSSale {
  id: number;
  client?: number;
  client_name?: string;
  timestamp: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  served_by: string;
  items: POSItem[];
}

// For creating new POS sales
export interface CreatePOSSaleData {
  client?: number; // Optional client ID
  payment_method: 'cash' | 'card' | 'mobile_money';
  served_by: string;
  items: Array<{
    product: number; // Product ID
    quantity: number;
    unit_price: number;
  }>;
}