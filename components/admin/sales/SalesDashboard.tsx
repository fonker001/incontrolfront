// components/admin/sales/SalesDashboard.tsx - FIXED FOR DJANGO BACKEND
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Package,
  Download,
  Plus,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import SalesChart from "./SalesChart";
import SalesFilters from "./SalesFilters";
import SalesTable from "./SalesTable";
import { salesApi } from "@/lib/api/salesApi";
import { inventoryApi } from "@/lib/api/inventoryApi";
import { toast } from "react-toastify";
import type { Sale, SalesStats } from "@/lib/api/salesApi";

// Local interface for month data
interface MonthData {
  label: string;
  year: number;
  monthIndex: number;
  value: string;
}

function monthLabel(d: Date): string {
  return d.toLocaleString(undefined, { month: "short" });
}

export default function SalesDashboard() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [showWalkInTable, setShowWalkInTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [posSales, setPosSales] = useState<any[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    // Fix the fetchData function
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch sales, POS sales, and inventory in parallel
        const [salesData, posSalesData, inventoryData] = await Promise.all([
          salesApi.getSales().catch(() => ({ results: [], count: 0 })),
          salesApi.getPOSSales().catch(() => []),
          inventoryApi.getProducts().catch(() => []),
        ]);

        // Extract sales from the response
        const onlineSales = Array.isArray(salesData) ? salesData : (salesData as any).results || [];
        setSales(onlineSales);
        
        // FIX: Ensure posSalesData is always an array with proper type handling
        let posSalesArray: any[] = [];
        
        if (Array.isArray(posSalesData)) {
          posSalesArray = posSalesData;
        } else if (posSalesData && typeof posSalesData === 'object') {
          // Cast to any to avoid TypeScript errors
          const posData = posSalesData as any;
          // If it's an object with a results property, use that
          if (posData.results && Array.isArray(posData.results)) {
            posSalesArray = posData.results;
          } else if (posData.items && Array.isArray(posData.items)) {
            posSalesArray = posData.items;
          }
        }
        setPosSales(posSalesArray);
        
        setInventoryItems(Array.isArray(inventoryData) ? inventoryData : []);
        
        // Calculate stats from combined sales data
        const calculatedStats = calculateStatsFromSales(onlineSales, posSalesArray);
        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load sales data');
        // Ensure arrays are empty on error
        setSales([]);
        setPosSales([]);
        setInventoryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Helper function to calculate stats from sales data
  const calculateStatsFromSales = (onlineSales: Sale[], posSales: any[]): SalesStats => {
    const allSales = [...onlineSales, ...posSales];
    
    // Convert string amounts to numbers before summing
    const totalRevenue = allSales.reduce((sum, sale) => 
      sum + (Number(sale.total_amount) || 0), 0);
    
    const totalSales = allSales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Calculate monthly trend (last 12 months)
    const monthlyTrend = Array(12).fill(0);
    const now = new Date();
    
    allSales.forEach(sale => {
      const saleDate = new Date(sale.sale_date || sale.timestamp || sale.created_at);
      const monthsAgo = (now.getFullYear() - saleDate.getFullYear()) * 12 + 
                       (now.getMonth() - saleDate.getMonth());
      
      if (monthsAgo >= 0 && monthsAgo < 12) {
        monthlyTrend[11 - monthsAgo] += (Number(sale.total_amount) || 0);
      }

    });

    // Calculate recent sales (last 30 days)
    const recentSales = allSales.filter(sale => {
      const saleDate = new Date(sale.sale_date || sale.timestamp || sale.created_at);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return saleDate > monthAgo;
    });

    // Calculate low stock items from inventory
    const lowStockItems = inventoryItems.filter(item => 
      item.stock_qty > 0 && item.stock_qty <= item.low_stock_threshold
    ).length;

    const outOfStockItems = inventoryItems.filter(item => 
      item.stock_qty === 0
    ).length;

    return {
      total_revenue: totalRevenue,
      total_sales: totalSales,
      recent_sales: recentSales.length,
      avg_sale_value: avgOrderValue,
      top_products: [],
      low_stock_items: lowStockItems,
      out_of_stock_items: outOfStockItems,
    };
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        label: monthLabel(d),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        value,
      });
    }

    // Calculate online sales totals
    const onlineTotals = months.map((m) =>
      sales
        .filter((s) => {
          const d = new Date(s.sale_date);
          return (
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + (Number(b.total_amount) || 0), 0) // Convert to number
    );

    // Calculate POS sales totals
    const posTotals = months.map((m) =>
      posSales
        .filter((s) => {
          const d = new Date(s.timestamp);
          return (
            d.getFullYear() === m.year &&
            d.getMonth() === m.monthIndex
          );
        })
        .reduce((a, b) => a + (Number(b.total_amount) || 0), 0) // Convert to number
    );

    return {
      months: months.map(m => m.label),
      onlineTotals,
      posTotals,
      rawMonths: months,
    };
  }, [sales, posSales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (month) {
        const d = new Date(s.sale_date);
        const [y, m] = month.split("-").map(Number);
        if (d.getFullYear() !== y || d.getMonth() + 1 !== m) return false;
      }
      return true;
    });
  }, [sales, month]);

  const combinedSales = [...filteredSales, ...posSales.slice(0, 5)];
  const displaySales = combinedSales.slice(0, 10); // Show first 10 sales
  
  // Change the totalRevenue calculation:
  const totalRevenue = stats?.total_revenue || 
    [...sales, ...posSales].reduce((a, b) => a + (Number(b.total_amount) || 0), 0);

  async function addSale(saleData: any) {
    try {
      setLoading(true);
      
      // Since we have both online and POS sales, determine which one to create
      if (saleData.payment_method) {
        // This is a POS sale
        const posSaleData = {
          client: saleData.client_id || null,
          payment_method: saleData.payment_method || 'cash',
          served_by: 'Admin', // Get from auth context
          items: saleData.items?.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            unit_price: item.price_at_sale || item.price,
          })) || [],
        };

        await salesApi.createPOSSale(posSaleData);
      } else {
        // This is an online sale
        const onlineSaleData = {
          client: saleData.client_id || 1, // Default client
          shipping_address: saleData.address || 'N/A',
          items: saleData.items?.map((item: any) => ({
            product: item.product,
            quantity: item.quantity,
            price_at_sale: item.price,
          })) || [],
        };

        await salesApi.createSale(onlineSaleData);
      }
      
      // Refresh data
      const [salesData, posSalesData, inventoryData] = await Promise.all([
        salesApi.getSales(),
        salesApi.getPOSSales(),
        inventoryApi.getProducts(),
      ]);

      const onlineSales = Array.isArray(salesData) ? salesData : salesData.results || [];
      setSales(onlineSales);
      setPosSales(posSalesData);
      setInventoryItems(inventoryData);
      
      const calculatedStats = calculateStatsFromSales(onlineSales, posSalesData);
      setStats(calculatedStats);
      setMonth(null);
      
      toast.success('Sale recorded successfully!');
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      toast.error(error.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Sale Type",
      "Sale ID",
      "Customer",
      "Amount (KES)",
      "Status",
      "Payment Method",
    ];
    
    const allSales = [...sales, ...posSales];
    const rows = allSales.map((s) => {
      const date = s.sale_date || s.timestamp || s.created_at;
      const d = new Date(date);
      const dateStr = d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      
      return [
        dateStr,
        s.timestamp ? 'POS' : 'Online',
        s.id || s.transaction_id || s.id,
        s.client_name || s.client?.full_name || 'Guest',
        (s.total_amount || 0).toFixed(2),
        s.status || 'completed',
        s.payment_method || 'N/A',
      ];
    });
    
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${month || "all_time"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && sales.length === 0 && posSales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Sales Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Real-time sales tracking and analytics
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SalesFilters
              month={month}
              months={chartData.rawMonths.map((m) => ({
                label: `${m.label} ${m.year}`,
                value: m.value,
              }))}
              onMonth={setMonth}
            />
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                  KES {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sales.length} Online + {posSales.length} POS
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">
                  {stats?.total_sales || sales.length + posSales.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last 30 days: {stats?.recent_sales || 0}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Avg Order Value
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">
                  KES {stats?.avg_sale_value?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all sales
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 sm:p-6 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
                  Inventory Status
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                  {stats?.low_stock_items || 0} Low
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.out_of_stock_items || 0} Out of stock
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Charts and Tables Column */}
          <div className="lg:col-span-8 lg:order-1 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                  Online Sales
                </h3>
                <div className="h-56 sm:h-64">
                  <SalesChart
                    months={chartData.months}
                    totals={chartData.onlineTotals}
                  />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">
                  POS Sales
                </h3>
                <div className="h-56 sm:h-64">
                  <SalesChart
                    months={chartData.months}
                    totals={chartData.posTotals}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl overflow-hidden">
              <div className="px-6 py-5 flex justify-between items-center">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    Recent Transactions
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold">
                    Latest 10 Sales (Online + POS)
                  </p>
                </div>
                <button
                  onClick={() => setShowWalkInTable(!showWalkInTable)}
                  className="lg:hidden p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                >
                  {showWalkInTable ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
              <div
                className={`${showWalkInTable ? "block" : "hidden"} lg:block overflow-x-auto`}
              >
                <SalesTable sales={displaySales} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}