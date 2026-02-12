"use client";

import { Search, ShoppingCart, RefreshCw, Grid, List, Filter } from 'lucide-react';
import { useState } from 'react';

interface CategoryOption {
  id: string | number;
  name: string;
}

interface POSLayoutProps {
  children: React.ReactNode;
  cartItemCount: number;
  onCartClick: () => void;
  onCheckout: () => void;
  checkoutDisabled: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | number;
  onCategoryChange: (category: string | number) => void;
  categories: CategoryOption[];
  onRefresh: () => void;
  filteredProducts: any[];
}

export default function POSLayout({
  children,
  cartItemCount,
  onCartClick,
  onCheckout,
  checkoutDisabled,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onRefresh,
  filteredProducts,
}: POSLayoutProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategories, setShowCategories] = useState(false);

  const selectedCategoryName = selectedCategory === 'all' 
    ? 'Categories' 
    : categories.find(cat => cat.id === selectedCategory)?.name || 'Categories';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh inventory"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCartClick}
              className="relative p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={onCheckout}
              disabled={checkoutDisabled}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span className="font-medium">{selectedCategoryName}</span>
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="p-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        onCategoryChange('all');
                        setShowCategories(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                        selectedCategory === 'all' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                      }`}
                    >
                      All Products
                    </button>
                    
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          onCategoryChange(category.id);
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 ${
                          selectedCategory === category.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold text-emerald-700">{filteredProducts.length}</span> products found
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' 
          : 'space-y-4'
        }>
          {children}
        </div>
      </div>
    </div>
  );
}