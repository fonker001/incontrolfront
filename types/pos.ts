// types/pos.ts - UPDATED to match Django backend exactly
import { Product } from '@/lib/api/inventoryApi';

export interface POSCartItem {
  id: string; // Unique cart item ID (frontend only)
  product_id: number; // Product ID (matches Django Product model)
  name: string; // Display name: "Brand - Product Name"
  price: number; // Unit price (selling_price)
  quantity: number; // Quantity in cart
  stock_qty: number; // Current stock quantity
  image?: string; // Product image URL
  brand_name?: string; // Brand name from Product
  product_name?: string; // Product name from Product
  category_name?: string; // Category name from Product
  // For compatibility with existing components
  inventory_id?: number; // Alias for product_id
  image_url?: string; // Alias for image
}

// For creating POS sales in Django backend
export interface CreatePOSSaleItem {
  product: number; // Product ID (required for Django)
  quantity: number; // Quantity (required)
  unit_price: number; // Price per unit (required)
}

export interface CreatePOSSaleData {
  client?: number; // Optional Client ID
  payment_method: 'cash' | 'card' | 'mobile_money'; // From Django choices
  served_by: string; // Cashier/staff name (required)
  items: CreatePOSSaleItem[]; // Array of items
}

// Response from Django when creating POS sale
export interface POSSaleResponse {
  id: number;
  client?: number;
  client_name?: string;
  timestamp: string;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile_money';
  served_by: string;
  items: POSItemResponse[];
}

export interface POSItemResponse {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

// Customer data for checkout modal
export interface CustomerData {
  name: string; // Customer name (required)
  phone?: string; // Phone number
  email?: string; // Email address
  address?: string; // Shipping/billing address
  payment_method: 'cash' | 'card' | 'mobile_money'; // Must match Django choices
  client_id?: number; // Optional: if selecting existing client
}

// For sales dashboard - combined online and POS sales
export interface CombinedSale {
  id: number | string;
  sale_date?: string; // For online sales
  timestamp?: string; // For POS sales
  type: 'online' | 'pos';
  client_name?: string;
  total_amount: number;
  status?: 'pending' | 'completed' | 'cancelled'; // For online sales
  payment_method?: 'cash' | 'card' | 'mobile_money'; // For POS sales
  items_count?: number;
  transaction_id?: string; // For online sales
}

// For inventory grid props
export interface InventoryGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product, quantity?: number) => void;
  quickAddEnabled?: boolean;
}

// For cart sidebar props
export interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: POSCartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout?: () => void; // Trigger checkout from sidebar
}

// For checkout modal props
export interface CheckoutModalProps {
  onClose: () => void;
  onCheckout: (customerData: CustomerData) => Promise<void>;
  loading: boolean;
  cart: POSCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  servedBy: string; // Required for POS sale
  onClientSelect?: (clientId: number) => void; // Optional: for client lookup
}

// For POS layout props
export interface POSLayoutProps {
  children: React.ReactNode;
  cartItemCount: number;
  onCartClick: () => void;
  onCheckout: () => void;
  checkoutDisabled: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | number;
  onCategoryChange: (category: string | number) => void;
  categories: Array<{ id: string | number; name: string }>;
  onRefresh: () => void;
  filteredProducts: any[];
}

// Re-export Product type for convenience
export type { Product };

// Helper function type for transforming cart to sale data
export type TransformCartToSale = (
  cart: POSCartItem[],
  servedBy: string,
  paymentMethod: 'cash' | 'card' | 'mobile_money',
  clientId?: number
) => CreatePOSSaleData;