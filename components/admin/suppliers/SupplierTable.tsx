"use client";

import { Supplier } from './types';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

{/*
  
  SuppliersTableProps defines the props for the SuppliersTable component.
  This component displays a table of suppliers with their details and action buttons.
  
  */}

interface SuppliersTableProps {
  suppliers: Supplier[];
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void; 
  onSearch: (query: string) => void;
}

export default function SuppliersTable({
  suppliers,
  onView,
  onEdit,
  onDelete,
  onSearch,
}: SuppliersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-900">Suppliers</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your suppliers
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers..."
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-80 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-emerald-50/50">
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-emerald-700 mr-3" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {supplier.name}
                      </div>
                      {supplier.email && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {supplier.email}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Phone */}
                <td className="px-6 py-4">
                  {supplier.phone_number ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {supplier.phone_number}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No phone</span>
                  )}
                </td>

                {/* Address */}
                <td className="px-6 py-4">
                  {supplier.address ? (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700 truncate max-w-xs">
                        {supplier.address}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No address</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(supplier)}
                      className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(supplier)}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(supplier.id)} // ✅ UUID string
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {suppliers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No suppliers found
            </h3>
            <p className="text-gray-500">
              Add your first supplier to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
