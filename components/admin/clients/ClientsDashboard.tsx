"use client";

import { useState, useEffect } from 'react';
import ClientForm from './ClientForm';
import { Client } from './types';
import { clientApi } from '@/lib/api/clientApi';

export default function ClientsDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      const data = await clientApi.list();
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await clientApi.delete(id);
        fetchClients(); // Refresh list
      } catch (error) {
        console.error('Failed to delete client:', error);
        alert('Failed to delete client');
      }
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchClients();
    setShowForm(false);
    setEditingClient(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  if (loading) {
    return <div className="text-center py-10">Loading clients...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-800">Clients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800"
        >
          + Add Client
        </button>
      </div>

      {showForm && (
        <ClientForm
          onSave={handleFormSuccess}
          editClient={editingClient}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client.phone_number || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      {client.address || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-emerald-600 hover:text-emerald-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {clients.length === 0 && !showForm && (
          <div className="text-center py-10 text-gray-500">
            No clients found. Click "Add Client" to get started.
          </div>
        )}
      </div>
    </div>
  );
}