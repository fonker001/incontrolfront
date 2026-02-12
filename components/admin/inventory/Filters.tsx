"use client";

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

{/*
  This code defines a Filtering Component for your product inventory. 
  It allows users to narrow down a large list of products using multiple criteria.
  Updated to match your backend data structure (no supplier filter on products).
  */}

interface FiltersProps {
  query: string;
  onQuery: (s: string) => void;
  brands: string[];  // Array of brand names
  categories: Array<{ id: number | string; name: string }>;  // Array of category objects
  selectedBrand: string | null;
  selectedCategory: string | number | null;
  selectedStockFilter: 'all' | 'low' | 'out';
  onBrand: (b: string | null) => void;
  onCategory: (c: string | number | null) => void;
  onStockFilter: (f: 'all' | 'low' | 'out') => void;
  onClearFilters: () => void;
}

export default function Filters({
  query,
  onQuery,
  brands,
  categories,
  selectedBrand,
  selectedCategory,
  selectedStockFilter,
  onBrand,
  onCategory,
  onStockFilter,
  onClearFilters,
}: FiltersProps) {
  
  // Check if any filters are active
  const hasActiveFilters = 
    query || 
    selectedBrand || 
    selectedCategory || 
    selectedStockFilter !== 'all';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Brand Filter */}
          <div className="relative min-w-[150px]">
            <select 
              value={selectedBrand || ''} 
              onChange={(e) => onBrand(e.target.value || null)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none bg-white"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[150px]">
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => onCategory(e.target.value || null)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Stock Status Filter */}
          <div className="relative min-w-[120px]">
            <select 
              value={selectedStockFilter} 
              onChange={(e) => onStockFilter(e.target.value as 'all' | 'low' | 'out')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none bg-white"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock (&lt;10)</option>
              <option value="out">Out of Stock</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}

          {/* Filter Icon (visible on mobile) */}
          <button
            className="lg:hidden px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            onClick={() => {
              // You could add mobile filter drawer logic here
              const mobileFilters = document.getElementById('mobile-filters');
              if (mobileFilters) {
                mobileFilters.classList.toggle('hidden');
              }
            }}
          >
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Search: "{query}"
              <button onClick={() => onQuery('')} className="ml-1 hover:text-emerald-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Brand: {selectedBrand}
              <button onClick={() => onBrand(null)} className="ml-1 hover:text-blue-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
              <button onClick={() => onCategory(null)} className="ml-1 hover:text-purple-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedStockFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Stock: {selectedStockFilter === 'low' ? 'Low' : 'Out of Stock'}
              <button onClick={() => onStockFilter('all')} className="ml-1 hover:text-amber-900">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}