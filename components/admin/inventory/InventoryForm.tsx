// components/admin/inventory/InventoryForm.tsx - UPDATED
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  DollarSign,
  Package,
  Building2,
  Truck,
  Upload,
  Camera,
  Plus,
} from "lucide-react";
import { inventoryApi, ProductFormData, Category } from "@/lib/api/inventoryApi";

{/*
  
  This component renders a form for adding or editing products. It includes fields for product name, brand, category, 
  pricing, stock, status, description, and image upload. It also allows adding new categories.
  Updated to match Django backend data structure.

*/}

interface InventoryFormProps {
  product?: any; // Changed from item to product
  onSave: () => void;
  onCancel: () => void;
}

export default function InventoryForm({
  product,
  onSave,
  onCancel,
}: InventoryFormProps) {
  const [categories, setCategories] = useState<Category[]>([]); // Changed type
  const [loading, setLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form data matches Django Product model fields
  const [formData, setFormData] = useState<ProductFormData>({
    category: product?.category || "", // Default to 0 instead of empty string
    brand_name: product?.brand_name || "",
    product_name: product?.product_name || "",
    description: product?.description || "",
    selling_price: product?.selling_price ? Number(product.selling_price) : 0,
    image: product?.image || "",
    stock_qty: product?.stock_qty || 0,
    is_active: product?.is_active !== undefined ? product?.is_active : true,
  });

  // Separate state for UI-only fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    product?.image 
      ? product.image.startsWith('http') 
        ? product.image 
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${product.image}`
      : ""
  );
  const [isNewImage, setIsNewImage] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await inventoryApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setImageFile(file);
    setIsNewImage(true);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setIsNewImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return setError("Category name is required");
    
    try {
      const slug = newCategorySlug || generateSlug(newCategoryName);
      const newCategory = await inventoryApi.createCategory({
        name: newCategoryName,
        slug: slug,
      });
      setCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({ ...prev, category: newCategory.id }));
      setNewCategoryName("");
      setNewCategorySlug("");
      setShowAddCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare data for API
      const apiData: ProductFormData = {
        category: Number(formData.category),
        brand_name: formData.brand_name.trim(),
        product_name: formData.product_name.trim(),
        description: formData.description.trim(),
        selling_price: Number(formData.selling_price),
        is_active: formData.is_active,
        stock_qty: formData.stock_qty || 0,
      };

      // Handle image
      let imageToSend: File | string | null | undefined;
      if (isNewImage) {
        if (imageFile) {
          imageToSend = imageFile;
        } else if (!imagePreview) {
          imageToSend = '';
        }
      }

      if (product?.id) {
        await inventoryApi.updateProduct(product.id, apiData, imageToSend as File | null);
      } else {
        await inventoryApi.createProduct(apiData, imageFile || undefined);
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug when category name changes
  useEffect(() => {
    if (newCategoryName && !newCategorySlug) {
      setNewCategorySlug(generateSlug(newCategoryName));
    }
  }, [newCategoryName, newCategorySlug]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-emerald-900">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-48 w-48 rounded-lg object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="h-48 w-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="product-image"
          />
          <label
            htmlFor="product-image"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {imagePreview ? "Change Image" : "Upload Product Image"}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload one image (max 5MB). JPG, PNG, or WebP.
          </p>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.product_name}
              onChange={(e) =>
                setFormData({ ...formData, product_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.brand_name}
              onChange={(e) =>
                setFormData({ ...formData, brand_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter brand name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="flex gap-2">
              <select
                value={formData.category || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: Number(e.target.value) }) // Convert to number
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price (KES) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step={0.01}
                min={0.01}
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selling_price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                min={0}
                value={formData.stock_qty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_qty: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.is_active ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_active: e.target.value === "true",
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Add detailed product description"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add New Category</h3>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Electronics, Clothing"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., electronics, clothing"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from name
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  disabled={!newCategoryName.trim()}
                >
                  Add Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}