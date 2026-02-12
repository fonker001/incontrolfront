"use client";

import { Sale } from "@/lib/api/salesApi";

interface SalesTableProps {
  sales: (Sale | any)[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sales records found
      </div>
    );
  }

  // Helper function to get sale type
  const getSaleType = (sale: any) => {
    return sale.timestamp ? 'POS' : 'Online';
  };

  // Helper function to get date
  const getDate = (sale: any) => {
    return sale.sale_date || sale.timestamp || sale.created_at;
  };

  // Helper function to get customer name
  const getCustomerName = (sale: any) => {
    return sale.client_name || sale.client?.full_name || 'Guest';
  };

  // Helper function to get customer phone
  const getCustomerPhone = (sale: any) => {
    return sale.client?.phone || 'N/A';
  };

  // Helper function to get status
  const getStatus = (sale: any) => {
    return sale.status || 'completed';
  };

  // Helper function to get total amount
  const getTotal = (sale: any) => {
    return sale.total_amount || sale.subtotal || 0;
  };

  // Helper function to get items count
  const getItemsCount = (sale: any) => {
    return sale.items?.length || 0;
  };

  // Helper function to get payment method
  const getPaymentMethod = (sale: any) => {
    return sale.payment_method || 'N/A';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => {
            const saleDate = new Date(getDate(sale));
            const saleType = getSaleType(sale);
            const customerName = getCustomerName(sale);
            const customerPhone = getCustomerPhone(sale);
            const status = getStatus(sale);
            const itemsCount = getItemsCount(sale);
            const paymentMethod = getPaymentMethod(sale);
            const total = getTotal(sale);

            return (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {saleDate.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {saleDate.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    saleType === 'POS' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {saleType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {customerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customerPhone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-600">
                    {paymentMethod}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-emerald-700">
                    KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}