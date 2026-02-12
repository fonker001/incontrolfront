'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SupplierForm from './SupplierForm';
import { Supplier } from './types';
import { supplierApi } from '@/lib/api/supplierApi';
import { authApi } from '@/lib/api/authApi';
import { AnimatePresence } from 'framer-motion';
import { Phone, Mail, MapPin, Plus } from 'lucide-react';


export default function SupplierDashboard() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth-safe fetch
  const fetchSuppliers = async () => {
    try {

      if (!authApi.isAuthenticated()) {
        authApi.logout();
        router.push('/login');
        return;
      }

      const data = await supplierApi.list();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err: any) {
      console.error(err);
      authApi.logout();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter suppliers by search
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredSuppliers(suppliers);
      return;
    }
    setFilteredSuppliers(
      suppliers.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone_number && s.phone_number.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, suppliers]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supplierApi.delete(id);
      fetchSuppliers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete supplier.');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchSuppliers();
    setShowForm(false);
    setEditingSupplier(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-emerald-900">Supplier Management</h1>

          <button
            onClick={() => {
              setEditingSupplier(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition inline-flex items-center justify-center gap-2 text-sm md:text-base font-medium"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden sm:inline">Add Supplier</span>
            <span className="sm:hidden">Add Supplier</span>
          </button>
        </div>

        {/* Supplier Form */}
        <AnimatePresence>
          {showForm && (
            <SupplierForm
              editSupplier={editingSupplier}
              onSave={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Supplier List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {filteredSuppliers.map(s => (
            <div key={s.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{s.name}</h3>
              {s.phone_number && (
                <p className="text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-1" /> {s.phone_number}
                </p>
              )}
              {s.email && (
                <p className="text-sm flex items-center">
                  <Mail className="h-4 w-4 mr-1" /> {s.email}
                </p>
              )}
              {s.address && (
                <p className="text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {s.address}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleEdit(s)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="mt-6 px-3 py-2 border rounded w-full sm:w-80"
        />
      </div>
    </div>
  );
}
