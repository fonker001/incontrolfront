// components/admin/pos/InventoryGrid.tsx - REDESIGNED (No gradient, shorter)
"use client";

import { motion } from 'framer-motion';
import { ShoppingBag, Package, Tag, Plus, AlertCircle } from 'lucide-react';
import type { Product } from '@/lib/api/inventoryApi';
import { useState } from 'react';

interface InventoryGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (item: Product, quantity?: number) => void;
  quickAddEnabled?: boolean;
}

export default function InventoryGrid({ 
  products, 
  loading, 
  onAddToCart,
  quickAddEnabled = true
}: InventoryGridProps) {
  const [quickAddQuantities, setQuickAddQuantities] = useState<Record<number, number>>({});

  if (loading) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-emerald-500 border-t-transparent"></div>
        <p className="mt-5 text-gray-600 font-medium">Loading inventory...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
        <div className="h-24 w-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <Package className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md">
          Add products to your inventory or check your filters
        </p>
      </div>
    );
  }

  const handleQuickAdd = (product: Product) => {
    const quantity = quickAddQuantities[product.id] || 1;
    onAddToCart(product, quantity);
    setQuickAddQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const numValue = parseInt(value) || 1;
    setQuickAddQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(numValue, 999))
    }));
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_qty <= 0) {
      return { status: 'out-of-stock', label: 'Out of Stock' };
    }
    const lowStockThreshold = 10;
    if (product.stock_qty <= lowStockThreshold) {
      return { status: 'low-stock', label: 'Low Stock' };
    }
    return { status: 'in-stock', label: 'In Stock' };
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'low-stock':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  return (
    <>
      {products.map((product, index) => {
        const stockStatus = getStockStatus(product);
        const quickAddQty = quickAddQuantities[product.id] || 1;
        const imageUrl = product.image 
          ? product.image.startsWith('http') 
            ? product.image 
            : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${product.image}`
          : null;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            className="group relative"
          >
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              {/* Product Image Container - Reduced height */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={product.product_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/product-placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-14 w-14 text-gray-300" />
                  </div>
                )}
                
                {/* Price Tag - Smaller */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <div className="text-white">
                    <div className="text-xs font-medium opacity-90">Price</div>
                    <div className="text-xl font-bold">
                      KES {Number(product.selling_price).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Stock Status Badge - Smaller */}
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${getStockStatusColor(stockStatus.status)}`}>
                  {stockStatus.label}
                </div>
              </div>

              {/* Product Info - Reduced padding */}
              <div className="p-4">
                {/* Product Name & Brand */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate text-sm">
                          {product.brand_name}
                        </h3>
                        {!product.is_active && (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2 text-xs">
                        {product.product_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Category - Smaller */}
                  {product.category_name && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs mt-1">
                      <Tag className="h-2.5 w-2.5" />
                      {product.category_name}
                    </div>
                  )}
                </div>

                {/* Stock Information - Smaller */}
                <div className="mb-4 p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-gray-600">Available Stock</span>
                    <span className={`font-semibold text-sm ${product.stock_qty <= 0 ? 'text-red-600' : product.stock_qty <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {product.stock_qty.toLocaleString()} units
                    </span>
                  </div>
                  {product.stock_qty <= 10 && product.stock_qty > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs">Running low</span>
                    </div>
                  )}
                </div>

                {/* Add to Cart Section */}
                <div className="space-y-2.5">
                  {quickAddEnabled && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(product.id, String(Math.max(1, quickAddQty - 1)))}
                          className="p-2 hover:bg-gray-50 transition-colors"
                          disabled={product.stock_qty === 0 || !product.is_active}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock_qty}
                          value={quickAddQty}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                          className="w-12 text-center font-semibold border-x border-gray-200 py-1.5 bg-white text-sm"
                          disabled={product.stock_qty === 0 || !product.is_active}
                        />
                        <button
                          onClick={() => handleQuantityChange(product.id, String(Math.min(product.stock_qty, quickAddQty + 1)))}
                          className="p-2 hover:bg-gray-50 transition-colors"
                          disabled={product.stock_qty === 0 || !product.is_active || quickAddQty >= product.stock_qty}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleQuickAdd(product)}
                        disabled={product.stock_qty === 0 || !product.is_active}
                        className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all text-sm ${
                          product.stock_qty === 0 || !product.is_active
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    </div>
                  )}

                  {/* Primary Add to Cart Button - No gradient, solid green */}
                  <button
                    onClick={() => onAddToCart(product, quickAddEnabled ? 1 : undefined)}
                    disabled={product.stock_qty === 0 || !product.is_active}
                    className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm ${
                      product.stock_qty === 0 || !product.is_active
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {product.stock_qty === 0 
                      ? 'Out of Stock' 
                      : !product.is_active 
                        ? 'Product Inactive'
                        : quickAddEnabled 
                          ? 'Add 1 to Cart' 
                          : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}