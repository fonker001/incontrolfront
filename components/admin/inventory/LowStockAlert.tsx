// components/admin/inventory/LowStockAlert.tsx - CORRECTED
"use client";

import { Product } from '@/lib/api/inventoryApi'; // Import from correct location
import { AlertTriangle, Package } from 'lucide-react';

{/*
  
  This component displays low stock alerts for inventory items.
  It takes an array of products and a threshold value (default is 10).
  It filters products where stock_qty is less than or equal to the threshold.
  If no products are below the threshold, it returns null (no alert).
  Otherwise, it renders a styled alert box with a list of low stock items.
  */}

interface LowStockAlertProps {
  products: Product[];
  threshold?: number;
  onViewAll?: () => void;
}

export default function LowStockAlert({ 
  products, 
  threshold = 10, // Changed from 5 to 10 to match common practice
  onViewAll 
}: LowStockAlertProps) {
  // Use stock_qty instead of quantity_in_stock
  const lowStockProducts = products.filter((p) => p.stock_qty <= threshold && p.is_active);
  
  if (lowStockProducts.length === 0) return null;

  // Sort by stock quantity (lowest first)
  const sortedProducts = [...lowStockProducts].sort((a, b) => a.stock_qty - b.stock_qty);

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-amber-900">Low Stock Alerts</h3>
            <p className="text-sm text-amber-700">
              {sortedProducts.length} product(s) at or below {threshold} units
            </p>
          </div>
        </div>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
          >
            View All
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sortedProducts.slice(0, 5).map((product) => (
          <div 
            key={product.id} 
            className="flex items-center justify-between bg-white/70 backdrop-blur-sm px-4 py-3 rounded-lg border border-amber-100 hover:bg-white transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-500 flex-shrink-0" />
                <div className="truncate">
                  <div className="font-medium text-amber-900 truncate">
                    {product.brand_name} - {product.product_name}
                  </div>
                  {product.category_name && (
                    <div className="text-xs text-amber-700 truncate">
                      Category: {product.category_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-amber-900">
                  {product.stock_qty} units
                </div>
                <div className="text-xs text-amber-700">
                  KES {Number(product.selling_price).toLocaleString()}
                </div>
              </div>
              
              <div className={`h-3 w-3 rounded-full ${
                product.stock_qty === 0 
                  ? 'bg-red-500' 
                  : product.stock_qty <= 3 
                    ? 'bg-amber-500' 
                    : 'bg-amber-300'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {sortedProducts.length > 5 && (
        <div className="mt-4 pt-3 border-t border-amber-200">
          <p className="text-xs text-center text-amber-700">
            + {sortedProducts.length - 5} more product(s) with low stock
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <span>Out of stock</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span>Critical (&lt;= 3)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-amber-300"></div>
            <span>Low (4-10)</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-medium">
            Total value at risk: KES {
              sortedProducts.reduce((total, p) => 
                total + (Number(p.selling_price) * p.stock_qty), 0
              ).toLocaleString()
            }
          </div>
        </div>
      </div>
    </div>
  );
}