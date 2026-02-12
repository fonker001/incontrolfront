{/*
  
  This file defines TypeScript types for sales data in the admin panel.
  */}

export type Sale = {
  id: string;
  date: string; // ISO
  productId?: string;
  productName: string;
  supplier?: string;
  quantity: number;
  amount: number; // total amount for the line
};

export const SALES_STORAGE_KEY = 'incontrol_sales_v1';

