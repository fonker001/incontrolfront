// types/inventory.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category: number;
  category_name?: string;
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

export interface InventoryLog {
  id: number;
  product: number;
  product_details?: string;
  supplier: number;
  supplier_name?: string;
  quantity_bought: number;
  cost_price_per_unit: number;
  total_cost?: number;
  delivery_date: string;
}