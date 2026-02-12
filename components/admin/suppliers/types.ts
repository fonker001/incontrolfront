export interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  additional_info?: any;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  supplier_id: number;
  supplier_name: string;
  product_name: string;
  quantity: number;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}
