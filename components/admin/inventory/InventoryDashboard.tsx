// components/admin/inventory/inventoryDashboard.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Truck,
  Building2,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import InventoryForm from './InventoryForm';
import { inventoryApi, Product } from '@/lib/api/inventoryApi'; // Use Product type from API
// Remove: import type { InventoryItem } from './types';

{/*
  
  This code defines the main Inventory Dashboard component. It serves as the primary administrative interface for managing your product inventory. It includes features such as:

  - Displaying key inventory statistics (total items, total value, low stock items, etc.)
  - Filtering and searching inventory items by brand, stock status, and search terms.
  - Adding, editing, and deleting inventory items via a form component.
  - Viewing detailed information about each inventory item in a modal.
  
  */}

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<Product[]>([]); // Changed to Product[]
  const [filteredInventory, setFilteredInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low'>('all');

  // Load inventory
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Please login to access inventory');
      }
      
      const data = await inventoryApi.getProducts();
      setInventory(data);
      setFilteredInventory(data);
      
    } catch (error) {
      console.error('Failed to load inventory:', error);
      
      // Show appropriate error message
      if (error instanceof Error) {
        if (error.message.includes('login') || error.message.includes('authenticated')) {
          toast.error('Please login to access inventory');
          // Optional: Redirect to login page
          // window.location.href = '/login';
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Cannot connect to server. Please check your connection.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to load inventory');
      }
      
      setInventory([]);
      setFilteredInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category_name?.toLowerCase().includes(searchTerm.toLowerCase())) // Changed from category_details?.name
      );
    }

    // Brand filter
    if (filterBrand) {
      filtered = filtered.filter(item => item.brand_name === filterBrand);
    }

    // Stock filter - use stock_qty instead of quantity_in_stock
    if (filterStock === 'low') {
      filtered = filtered.filter(item => item.stock_qty < 10); // Changed from quantity_in_stock
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filterBrand, filterStock]);

  // Calculate stats
  const stats = {
    totalItems: inventory.reduce((sum, item) => sum + item.stock_qty, 0), // Changed from quantity_in_stock
    totalValue: inventory.reduce((sum, item) => sum + (Number(item.selling_price) * item.stock_qty), 0), // Changed to stock_qty
    lowStockItems: inventory.filter(item => item.stock_qty < 10).length, // Changed from quantity_in_stock
    categoriesCount: Array.from(new Set(inventory.map(item => item.category_name).filter(Boolean))).length,
    activeItems: inventory.filter(item => item.is_active).length,
  };

  const handleSaveItem = async () => {
    await fetchInventory();
    setShowForm(false);
    setEditingItem(null);
    toast.success(editingItem ? 'Product updated' : 'Product added');
  };

  const handleDelete = async (id: string | number) => { // Changed to accept number
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await inventoryApi.deleteProduct(id as number); // Use correct method
      await fetchInventory();
      toast.success('Product deleted');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (item: Product) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleView = (item: Product) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Get unique brands for filters
  const brands = Array.from(new Set(
    inventory.map(item => item.brand_name).filter(Boolean)
  ));

  // Get unique categories for display
  const categories = Array.from(new Set(
    inventory.map(item => item.category_name).filter(Boolean)
  ));

  // Ref & auto-scroll when form opens
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showForm) return;
    const t = setTimeout(() => {
      const block: ScrollLogicalPosition = (typeof window !== 'undefined' && window.innerWidth < 768) ? 'center' : 'start';
      formRef.current?.scrollIntoView({ behavior: 'smooth', block });
      const first = formRef.current?.querySelector('input, textarea, select, button') as HTMLElement | null;
      first?.focus?.();
    }, 120);
    return () => clearTimeout(t);
  }, [showForm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-emerald-900 mb-2">
                Inventory Management
              </h1>
              <p className="text-gray-600">
                Track stock, manage products, and monitor inventory value
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm md:text-base font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>
        </motion.div>

        {/* Inventory Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              ref={formRef}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <InventoryForm
                product={editingItem} // Changed from item to product
                onSave={handleSaveItem}
                onCancel={handleCancel}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  {stats.totalItems.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-emerald-700 mt-2">
                  KES {stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {stats.lowStockItems}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.categoriesCount}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Items</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.activeItems}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock (&lt;10)</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBrand('');
                  setFilterStock('all');
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Inventory Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">
                  Products ({filteredInventory.length})
                </h2>
                <p className="text-sm text-gray-600 mt-1">Showing {filteredInventory.length} of {inventory.length} products</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand/Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const isLowStock = item.stock_qty < 10; // Changed from quantity_in_stock
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.brand_name} - {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {item.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {item.brand_name && (
                            <div className="flex items-center text-sm">
                              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{item.brand_name}</span>
                            </div>
                          )}
                          {item.category_name && ( // Changed from category_details?.name
                            <div className="flex items-center text-sm">
                              <Truck className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{item.category_name}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isLowStock 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.stock_qty} units {/* Changed from quantity_in_stock */}
                          </div>
                          {isLowStock && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: {item.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600">
                            Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-gray-600">
                            Updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-emerald-900">
                            KES {Number(item.selling_price).toLocaleString()}/unit
                          </div>
                          <div className="text-gray-500">
                            Total: KES {(Number(item.selling_price) * item.stock_qty).toLocaleString()} {/* Changed from quantity_in_stock */}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(item)}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterBrand || filterStock !== 'all' 
                    ? 'No products match your filters' 
                    : 'No products yet'}
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">
                  {searchTerm || filterBrand || filterStock !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'Add your first product to get started'}
                </p>
                {!showForm && !searchTerm && !filterBrand && filterStock === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 text-white text-sm md:text-base font-medium rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add First Product
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.product_name}</h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-1">{selectedItem.brand_name}</p>
              </div>

              <div className="px-8 py-6 space-y-6">
                {/* Product Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-900">{selectedItem.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity in Stock</p>
                      <p className="text-gray-900 font-semibold">{selectedItem.stock_qty} units</p>
                    </div>
                  </div>
                </div>

                {/* Brand & Category */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Brand Name</p>
                      <p className="text-gray-900">{selectedItem.brand_name}</p>
                    </div>
                    {selectedItem.category_name && (
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-gray-900">{selectedItem.category_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created On</p>
                      <p className="text-gray-900">
                        {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-gray-900">
                        {selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Value Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Selling Price per Unit</p>
                      <p className="text-gray-900 font-semibold">
                        KES {Number(selectedItem.selling_price).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category ID</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedItem.category || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Stock Value</p>
                      <p className="text-gray-900 font-semibold text-emerald-700">
                        KES {(Number(selectedItem.selling_price) * selectedItem.stock_qty).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`font-semibold ${selectedItem.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedItem.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      handleEdit(selectedItem);
                      handleCloseModal();
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}