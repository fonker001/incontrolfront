// components/admin/suppliers/SupplierForm.tsx - FIXED
"use client";

import { useState } from 'react';
import { Supplier } from './types';
import { supplierApi, SupplierFormData as ApiSupplierFormData } from '@/lib/api/supplierApi';

{/*
  SupplierFormProps defines the props for the SupplierForm component.
  This component is used for both creating a new supplier and editing an existing one.
  
  */}

interface SupplierFormProps {
  onSave: () => void;
  editSupplier?: Supplier | null;
  onCancel?: () => void;
}

export default function SupplierForm({ onSave, editSupplier, onCancel }: SupplierFormProps) {
  // Extract supplies from additional_info if it exists
  const initialAdditionalInfo = editSupplier?.additional_info;
  const initialSupplies = initialAdditionalInfo?.supplies || 
                        (typeof initialAdditionalInfo === 'string' ? initialAdditionalInfo : '');

  const [formData, setFormData] = useState({
    name: editSupplier?.name || '',
    email: editSupplier?.email || '',
    phone_number: editSupplier?.phone_number || '',
    address: editSupplier?.address || '',
    additional_info: initialSupplies || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for API - convert empty strings to undefined
      const apiData: Partial<ApiSupplierFormData> = {
        name: formData.name.trim(),
      };

      // Only include non-empty fields
      if (formData.email?.trim()) {
        apiData.email = formData.email.trim();
      }
      if (formData.phone_number?.trim()) {
        apiData.phone_number = formData.phone_number.trim();
      }
      if (formData.address?.trim()) {
        apiData.address = formData.address.trim();
      }
      if (formData.additional_info?.trim()) {
        apiData.additional_info = formData.additional_info.trim();
      }

      if (editSupplier) {
        await supplierApi.update(editSupplier.id, apiData);
      } else {
        // For create, we need the full type
        const createData: ApiSupplierFormData = {
          name: apiData.name!,
          email: apiData.email,
          phone_number: apiData.phone_number,
          address: apiData.address,
          additional_info: apiData.additional_info,
        };
        await supplierApi.create(createData);
      }
      
      onSave(); // Refresh the supplier list
      
      // Reset form if not editing
      if (!editSupplier) {
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          address: '',
          additional_info: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-800 mb-6">
        {editSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter supplier name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="supplier@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+254 700 000000"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Physical address"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Supplies / Additional Info
          </label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="List supplies provided or any additional information"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : editSupplier ? 'Update Supplier' : 'Add Supplier'}
          </button>
        </div>
      </form>
    </div>
  );
}