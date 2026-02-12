
"use client";

import { useState } from 'react';
import { ClientFormData, Client } from './types';
import { clientApi } from '@/lib/api/clientApi';
{/*
  This code defines a Client-Side Form Component for managing client information. 
  In the context of your project, this is the 
  interface used to either add a new customer or update an existing one in your database.
  */}


interface ClientFormProps {
  onSave: () => void; // Callback to refresh list
  editClient?: Client | null;
  onCancel?: () => void;
}

export default function ClientForm({ onSave, editClient, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    first_name: editClient?.first_name || '',
    last_name: editClient?.last_name || '',
    email: editClient?.email || '',
    phone_number: editClient?.phone_number || '',
    address: editClient?.address || '',
    additional_info: editClient?.additional_info || '',
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
      if (editClient) {
        await clientApi.update(editClient.id, formData);
      } else {
        await clientApi.create(formData);
      }
      onSave(); // Refresh the client list
      
      // Reset form if not editing
      if (!editClient) {
        setFormData({
          first_name: '',
          last_name: '',
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
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold text-emerald-800 mb-4">
        {editClient ? 'Edit Client' : 'Add New Client'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            First Name *
          </label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            Last Name *
          </label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            Phone Number
          </label>
          <input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            Address
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-emerald-700 mb-1">
            Additional Info
          </label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : editClient ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}