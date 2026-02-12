// components/store/ProductGrid.tsx
"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

{/*
  
  ProductGrid component displays a grid of products fetched from an API. 
  It uses infinite scrolling to load more products as the user scrolls down.

*/}

// Create a fetch function that handles pagination
async function fetchProducts({ pageParam = 1 }: { pageParam: number }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://incontrol-lite-pb.onrender.com/api';
  const pageSize = 20;
  
  const response = await fetch(
    `${API_BASE}/inventory/?page=${pageParam}&page_size=${pageSize}`, 
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  
  // Handle different API response formats
  const items = data.results || data.products || data.items || data;
  const nextPage = data.next ? pageParam + 1 : null;
  const totalCount = data.count || items.length;
  
  return {
    items,
    nextPage,
    hasMore: nextPage !== null,
    page: pageParam,
    totalCount,
  };
}

export default function ProductGrid() {
  const { ref, inView } = useInView();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all items from all pages
  const allProducts = data?.pages.flatMap(page => page.items) || [];

  if (isLoading && allProducts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading products: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allProducts.map((product: any) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-4">
              {product.images?.[0] && (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description || 'No description available'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-emerald-600">
                  KSh {product.price?.toLocaleString() || '0'}
                </span>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More trigger */}
      <div ref={ref} className="h-20 flex justify-center items-center">
        {isFetchingNextPage ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        ) : hasNextPage ? (
          <p className="text-gray-500">Scroll to load more...</p>
        ) : allProducts.length > 0 ? (
          <p className="text-gray-500">No more products to load</p>
        ) : (
          <p className="text-gray-500">No products found</p>
        )}
      </div>
    </div>
  );
}