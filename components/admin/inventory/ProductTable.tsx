// components/admin/inventory/ProductTable.tsx - CORRECTED
"use client";

import { Product } from '@/lib/api/inventoryApi'; // Import from correct location
import { useState } from 'react';
import { Edit2, Trash2, Package, DollarSign, Calendar, Tag } from 'lucide-react';

{/*
  
  This component renders a table of inventory products.
  It accepts an array of products, and functions to delete and update products.
  It allows editing of product quantities in-place.
  Updated to match Django backend data structure.
  */}

interface ProductTableProps {
  products: Product[];
  onDelete: (id: number) => void; // Changed from string to number
  onUpdate: (product: Product) => void;
  onEdit?: (product: Product) => void; // Optional for opening edit modal
}

export default function ProductTable({
  products,
  onDelete,
  onUpdate,
  onEdit,
}: ProductTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditStock(product.stock_qty); // Changed from quantity_in_stock to stock_qty
  }

  function saveEdit(id: number) {
    const productToUpdate = products.find((p) => p.id === id);
    if (!productToUpdate) return;
    
    onUpdate({ 
      ...productToUpdate, 
      stock_qty: editStock // Changed from quantity_in_stock to stock_qty
    });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Price & Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                {/* Product Details */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.image ? (
                      <img 
                        src={product.image.startsWith('http') 
                          ? product.image 
                          : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${product.image}`}
                        alt={product.product_name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.brand_name} - {product.product_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description || 'No description'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  {product.category_name ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <Tag className="h-3 w-3" />
                      {product.category_name}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>

                {/* Price & Stock */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(Number(product.selling_price))}
                      </span>
                    </div>
                    
                    {editingId === product.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editStock}
                          min={0}
                          onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveEdit(product.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                        product.stock_qty === 0 
                          ? 'bg-red-100 text-red-800' 
                          : product.stock_qty <= 5 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <Package className="h-3 w-3" />
                        {product.stock_qty} units
                        <button 
                          onClick={() => startEdit(product)}
                          className="ml-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
                    product.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    {product.is_active ? 'Active' : 'Inactive'}
                  </div>
                </td>

                {/* Last Updated */}
                <td className="px-6 py-4">
                  {product.updated_at ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(product)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(product.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Add your first product to get started</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}