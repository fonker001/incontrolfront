{/*
  
  This file defines TypeScript interfaces for inventory-related data structures.
  Updated to match the actual Django backend data structure.
  
  Backend Models:
  - Category: id, name, slug
  - Product: id, category (FK), brand_name, product_name, description, 
             selling_price, image, stock_qty, is_active, created_at, updated_at
  - InventoryLog: product (FK), supplier (FK), quantity_bought, cost_price_per_unit,
                  total_cost, delivery_date
  */}

// Category type (matches Django Category model)
export interface Category {
  id: number;  // Changed from string to number
  name: string;
  slug: string;
}

// Product type (matches Django Product model and serializer)
export interface Product {
  id: number;  // Changed from string to number
  category: number;  // Category ID (foreign key)
  category_name?: string;  // Read-only field from serializer
  brand_name: string;
  product_name: string;  // Added this field
  description: string;
  selling_price: number;
  image?: string;  // Image path/URL
  stock_qty: number;  // Changed from quantity_in_stock
  is_active: boolean;
  created_at?: string;  // Added (optional)
  updated_at?: string;  // Added (optional)
}

// InventoryLog type (matches Django InventoryLog model)
export interface InventoryLog {
  id: number;
  product: number;  // Product ID
  product_details?: string;  // Read-only field (product_name)
  supplier: number;  // Supplier ID
  supplier_name?: string;  // Read-only field
  quantity_bought: number;
  cost_price_per_unit: number;
  total_cost?: number;  // Calculated field
  delivery_date: string;
}

// Form data for creating/updating products
export interface ProductFormData {
  category: number;  // Category ID
  brand_name: string;
  product_name: string;
  description: string;
  selling_price: number;
  image?: File | string;  // Can be File for upload or string URL for existing
  stock_qty?: number;  // Optional for creation (auto-updated by InventoryLog)
  is_active?: boolean;
}

// Form data for creating inventory logs (stock-in)
export interface InventoryLogFormData {
  product: number;  // Product ID
  supplier: number;  // Supplier ID
  quantity_bought: number;
  cost_price_per_unit: number;
  delivery_date?: string;  // Optional, defaults to now
}

// For public/customer view (simplified)
export interface CustomerProduct {
  id: number;
  name: string;  // Combined: brand_name + product_name
  brand_name: string;
  product_name: string;
  description?: string;
  price: number;  // selling_price
  image?: string;
  category?: string;  // category_name
  inStock: boolean;  // stock_qty > 0 && is_active
  is_active: boolean;
}

// Inventory statistics
export interface InventoryStats {
  total_items_in_warehouse: number;
  total_potential_revenue: number;
  low_stock_items?: number;  // Client-side calculated
  active_categories?: number;  // Client-side calculated
}

// Removed: InventoryItem, InventoryFormData, InventoryCategory 
// Use Product, ProductFormData, and Category instead

export const STORAGE_KEY = 'incontrol_inventory_products_v1';