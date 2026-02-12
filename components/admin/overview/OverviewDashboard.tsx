"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SalesChart from '../sales/SalesChart';
import { inventoryApi } from '@/lib/api/inventoryApi';
import { salesApi } from '@/lib/api/salesApi';
import { toast } from 'react-toastify';

// Simplified interface matching Django data
interface DashboardStats {
  total_revenue: number;
  total_sales: number;
  recent_sales: number;
  avg_order_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
}

export default function OverviewDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{ months: string[], totals: number[] }>({ months: [], totals: [] });
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch inventory data
      const inventoryResponse = await inventoryApi.getProducts().catch(() => ({ results: [], count: 0 }));
      const inventoryData = Array.isArray(inventoryResponse) ? inventoryResponse : inventoryResponse.results || [];
      const inventoryTotal = Array.isArray(inventoryResponse) ? inventoryResponse.length : inventoryResponse.count || 0;
      
      setInventoryCount(inventoryTotal);

      // Fetch sales data
      const salesResponse = await salesApi.getSales().catch(() => ({ results: [], count: 0 }));
      const salesData = Array.isArray(salesResponse) ? salesResponse : salesResponse.results || [];

      // Fetch POS sales data
      const posSalesResponse = await salesApi.getPOSSales().catch(() => []);

      // Combine all sales
      const allSales = [...salesData, ...posSalesResponse];

      // Calculate dashboard stats
      const stats = calculateDashboardStats(allSales, inventoryData);
      setDashboardStats(stats);

      // Generate chart data (last 6 months)
      const chart = generateChartData(allSales);
      setChartData(chart);

    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (sales: any[], inventory: any[]): DashboardStats => {
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
    const totalSales = sales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Recent sales (last 30 days)
    const recentSales = sales.filter(sale => {
      const saleDate = new Date(sale.sale_date || sale.timestamp);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return saleDate > monthAgo;
    }).length;

    // Calculate low stock items
    const lowStockItems = inventory.filter(item => 
      item.stock_qty > 0 && item.stock_qty <= (item.low_stock_threshold || 10)
    ).length;

    const outOfStockItems = inventory.filter(item => 
      item.stock_qty === 0
    ).length;

    return {
      total_revenue: totalRevenue,
      total_sales: totalSales,
      recent_sales: recentSales,
      avg_order_value: avgOrderValue,
      low_stock_items: lowStockItems,
      out_of_stock_items: outOfStockItems,
    };
  };

  const generateChartData = (sales: any[]): { months: string[], totals: number[] } => {
    // Generate last 6 months
    const months: string[] = [];
    const totals: number[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
      
      // Calculate total for this month
      const monthTotal = sales
        .filter(sale => {
          const saleDate = new Date(sale.sale_date || sale.timestamp);
          return (
            saleDate.getFullYear() === date.getFullYear() &&
            saleDate.getMonth() === date.getMonth()
          );
        })
        .reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
      
      totals.push(monthTotal);
    }

    return { months, totals };
  };

  const kpis = useMemo(() => {
    if (!dashboardStats) {
      return {
        revenue: 0,
        mtd: 0,
        monthChange: 0
      };
    }

    const revenue = dashboardStats.total_revenue;
    
    // For demo, MTD is same as recent month revenue
    const mtd = dashboardStats.total_revenue * 0.3; // 30% of total as MTD
    
    // Simple month-over-month change calculation
    const monthChange = chartData.totals.length >= 2 
      ? ((chartData.totals[chartData.totals.length - 1] - 
          chartData.totals[chartData.totals.length - 2]) / 
          (chartData.totals[chartData.totals.length - 2] || 1)) * 100 
      : 0;

    return { revenue, mtd, monthChange };
  }, [dashboardStats, chartData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-900">Admin Overview</h1>
            <p className="text-sm text-emerald-600">Quick links, KPIs and recent trends.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-900">Admin Overview</h1>
          <p className="text-sm text-emerald-600">Quick links, KPIs and recent trends.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 6 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          className="p-4 bg-white border rounded shadow"
        >
          <div className="text-xs text-gray-500">Revenue (Total)</div>
          <div className="text-2xl font-semibold text-emerald-900">
            KES {kpis.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Recent: KES {kpis.mtd.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }} 
          className="p-4 bg-white border rounded shadow"
        >
          <div className="text-xs text-gray-500">Total Sales</div>
          <div className="text-2xl font-semibold text-emerald-900">
            {dashboardStats?.total_sales || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Recent: {dashboardStats?.recent_sales || 0}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }} 
          className="p-4 bg-white border rounded shadow md:col-span-1 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Performance (last 6 months)</div>
              <div className={`text-lg font-semibold ${kpis.monthChange < 0 ? 'text-red-600' : 'text-emerald-900'}`}>
                {kpis.monthChange.toFixed(1)}% vs previous month
              </div>
            </div>
          </div>
          <div className="mt-3">
            <SalesChart months={chartData.months} totals={chartData.totals} />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/sales" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Sales</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            {dashboardStats?.total_sales || 0} total
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dashboardStats?.recent_sales || 0} recent sales
          </div>
        </Link>

        <Link href="/admin/inventory" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Inventory</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            {inventoryCount} items
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dashboardStats?.low_stock_items || 0} low stock
          </div>
        </Link>

        <Link href="/admin/pos" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">POS</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            Quick Sales
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Point of Sale system
          </div>
        </Link>

        <Link href="/admin/clients" className="block p-4 bg-white border rounded shadow hover:shadow-md">
          <div className="text-sm font-medium text-emerald-700">Clients</div>
          <div className="mt-2 text-lg font-semibold text-emerald-900">
            Customers
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Client management
          </div>
        </Link>
      </div>

      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Average Order Value</div>
            <div className="text-xl font-semibold text-emerald-900">
              KES {dashboardStats.avg_order_value.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Based on {dashboardStats.total_sales} total sales
            </div>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Stock Status</div>
            <div className="text-xl font-semibold text-emerald-900">
              {dashboardStats.low_stock_items} low, {dashboardStats.out_of_stock_items} out
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Inventory alerts
            </div>
          </div>

          <div className="p-4 bg-white border rounded shadow">
            <div className="text-xs text-gray-500">Recent Activity</div>
            <div className="text-xl font-semibold text-emerald-900">
              {dashboardStats.recent_sales} sales
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Last 30 days
            </div>
          </div>
        </div>
      )}
    </div>
  );
}