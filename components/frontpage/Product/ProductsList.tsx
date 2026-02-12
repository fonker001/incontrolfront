// components/frontpage/Product/ProductsList.tsx - UPDATED
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { productApi, FrontendProduct } from '@/lib/api/productApi';

// Define the product type for this component
interface CartProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
  image?: string;
  brand: string;
}

interface ProductsListProps {
  onAddToCart?: (product: CartProduct) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryProducts, setShowCategoryProducts] = useState(false);

  // Fetch public products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // FIX: Call getCustomerProducts without any parameters
        // Your current API doesn't accept parameters for public endpoint
        const data = await productApi.getCustomerProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array - fetch once on mount

  // Get unique categories
  const categories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  ).sort() as string[];

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : [];

  const getProductCount = (category: string) =>
    products.filter(p => p.category === category).length;

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryProducts(true);
  };

  const handleBackToCategories = () => {
    setShowCategoryProducts(false);
    setSelectedCategory(null);
  };

  const handleProductAddToCart = (productData: any) => {
    if (onAddToCart) {
      const cartProduct: CartProduct = {
        id: productData.id.toString(), // Convert to string
        name: productData.name,
        price: productData.price,
        description: productData.description,
        quantity: 1, // Default quantity
        image: productData.image,
        brand: productData.category || productData.name, // Use category as brand
      };
      onAddToCart(cartProduct);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0091AD]"></div>
        <h2 className="text-2xl font-bold mt-4">Loading products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-600 mb-4">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0091AD] text-white rounded-md font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section id='product-list' className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Our <span className="text-[#0091AD]">Products</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our quality products by category. Click on a category to view products.
        </p>
      </div>

      {/* CATEGORY VIEW (Default View - Shows when no category is selected) */}
      {!showCategoryProducts && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-center mb-6">
            Browse by Category
          </h3>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700"
            >
              All Categories ({products.length} products)
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="px-4 py-2 rounded-lg font-medium bg-[#0091AD] text-white hover:bg-[#007a91] transition-colors"
              >
                {category} ({getProductCount(category)})
              </button>
            ))}
          </div>

          {/* Category Cards Grid */}
          {categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category)}
                  className="border-2 rounded-xl p-6 text-center font-semibold transition-all hover:shadow-lg cursor-pointer"
                  style={{
                    borderColor: '#0091AD',
                    color: '#0091AD',
                    backgroundColor: '#e6f7fb',
                  }}
                >
                  <div className="text-lg mb-2">{category}</div>
                  <div className="text-sm opacity-75">
                    {getProductCount(category)} {getProductCount(category) === 1 ? 'product' : 'products'}
                  </div>
                  <div className="mt-4 text-sm font-medium text-white bg-[#0091AD] py-1 px-3 rounded-md inline-block">
                    View Products
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No categories available at the moment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS VIEW (Shows when a category is selected) */}
      {showCategoryProducts && (
        <div>
          {/* Back to Categories Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 px-4 py-2 text-[#0091AD] hover:text-[#007a91] font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Categories
            </button>
            <span className="text-gray-600">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} in "{selectedCategory}"
            </span>
          </div>

          {/* Category Header */}
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-[#0091AD] mb-2">
              {selectedCategory}
            </h3>
            <p className="text-gray-600">
              Browse all products in this category
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No products available in "{selectedCategory}".
              </p>
              <button
                onClick={handleBackToCategories}
                className="mt-4 px-6 py-2 bg-[#0091AD] text-white rounded-lg font-medium hover:bg-[#007a91]"
              >
                Browse Other Categories
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                    quantity={product.quantity}
                    inStock={product.inStock}
                    image={product.image}
                    category={product.category}
                    is_active={product.is_active}
                  />
                ))}
              </div>
              
              {/* Back to Categories Footer */}
              <div className="text-center mt-12 pt-8 border-t border-gray-200">
                <button
                  onClick={handleBackToCategories}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  ← Back to All Categories
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};