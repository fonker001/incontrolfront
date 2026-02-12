"use client";

import { Client, getClientFullName, formatDate } from './types';

interface ClientsTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
  onSearch: (query: string) => void;
}

export default function ClientsTable({ 
  clients, 
  onView, 
  onEdit, 
  onDelete, 
  onSearch 
}: ClientsTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Section */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-emerald-800">Clients</h2>
          <div className="relative w-full sm:w-64">
            <input 
              placeholder="Search clients..." 
              onChange={(e) => onSearch(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Hidden on md+ screens */}
      <div className="block md:hidden">
        <ul className="divide-y divide-gray-200">
          {clients.map((client) => (
            <li key={client.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{getClientFullName(client)}</p>
                  <p className="text-sm text-gray-500">{client.email || 'No Email'}</p>
                </div>
                <span className="text-[10px] text-gray-400 uppercase">
                  {formatDate(client.created_at)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">{client.phone_number || '-'}</p>
                <div className="flex gap-4">
                  <button onClick={() => onView(client)} className="text-emerald-600 text-sm font-semibold">View</button>
                  <button onClick={() => onEdit(client)} className="text-blue-600 text-sm font-semibold">Edit</button>
                  <button onClick={() => onDelete(client.id)} className="text-red-600 text-sm font-semibold">Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* DESKTOP VIEW: Hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-emerald-50">
            <tr>
              {['Name', 'Email', 'Phone', 'Date Added', 'Actions'].map((head) => (
                <th key={head} className="px-6 py-3 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {getClientFullName(client)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {client.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {client.phone_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(client.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-3">
                    <button onClick={() => onView(client)} className="text-emerald-600 hover:text-emerald-900">View</button>
                    <button onClick={() => onEdit(client)} className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onClick={() => onDelete(client.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {clients.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">
          No clients found. Add your first client to get started.
        </div>
      )}
    </div>
  );
}