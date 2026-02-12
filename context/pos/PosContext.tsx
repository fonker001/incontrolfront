// context/pos/PosContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { posApi, Sale } from '@/lib/api/sales';

{/*
  
  PosContext provides a context for managing POS (Point of Sale) related state. It includes:
  - sales: List of sales records.
  - loading: Boolean indicating if a request is in progress.    
  - error: Error message if any operation fails.
  - selectedSale: Currently selected sale record.
*/}

interface PosContextType {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  selectedSale: Sale | null;
  // Optional: Add pagination info if you need it
  pagination?: {
    total: number;
    page: number;
    page_size: number;
    pages: number;
  };
  
  fetchSales: (params?: any) => Promise<void>;
  createSale: (data: any) => Promise<Sale>;
  cancelSale: (saleId: string) => Promise<void>;
  selectSale: (sale: Sale | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    page_size: number;
    pages: number;
  } | null>(null);

  const fetchSales = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await posApi.getSales(params);
      // Extract just the sales array from the response
      setSales(data.sales);
      // Store pagination data if needed
      setPagination({
        total: data.total,
        page: data.page,
        page_size: data.page_size,
        pages: data.pages,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (saleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newSale = await posApi.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await posApi.cancelSale(saleId);
      setSales(prev => prev.filter(sale => sale.id !== saleId));
      if (selectedSale?.id === saleId) {
        setSelectedSale(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedSale]);

  const selectSale = useCallback((sale: Sale | null) => {
    setSelectedSale(sale);
  }, []);

  return (
    <PosContext.Provider value={{
      sales,
      loading,
      error,
      selectedSale,
      pagination: pagination || undefined,
      fetchSales,
      createSale,
      cancelSale,
      selectSale,
    }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}