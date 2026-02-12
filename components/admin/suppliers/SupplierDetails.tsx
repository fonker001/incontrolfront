'use client';

import { useState, useEffect } from 'react';
import { Supplier, Purchase } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  X,
} from 'lucide-react';

interface SupplierDetailsProps {
  supplier: Supplier;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function SupplierDetails({
  supplier,
  onClose,
  onRefresh,
}: SupplierDetailsProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPurchase, setAddingPurchase] = useState(false);

  // Form state
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');


  useEffect(() => {
    try {
      const raw = localStorage.getItem(`purchases_${supplier.id}`);
      if (raw) {
        setPurchases(JSON.parse(raw));
      }
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoading(false);
    }
  }, [supplier.id]);


  const totals = {
    totalPaid: purchases.reduce((s, p) => s + p.amount, 0),
    totalItems: purchases.reduce((s, p) => s + p.quantity, 0),
    recentPurchases: purchases.filter(p => {
      const d = new Date(p.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d > monthAgo;
    }).length,
  };


  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newPurchase: Purchase = {
      id: Date.now(),                 // ✅ numeric ID
      supplier_id: supplier.id,       // ✅ numeric FK
      supplier_name: supplier.name,
      product_name: productName,
      quantity,
      amount,
      date: purchaseDate,
      notes: notes || undefined,
      created_at: new Date().toISOString(),
    };

    const updated = [newPurchase, ...purchases];
    setPurchases(updated);
    localStorage.setItem(
      `purchases_${supplier.id}`,
      JSON.stringify(updated)
    );

    setProductName('');
    setQuantity(1);
    setAmount(0);
    setNotes('');
    setAddingPurchase(false);

    onRefresh?.();
  };


  const handleDeletePurchase = (purchaseId: number) => {
    if (!confirm('Delete this purchase?')) return;

    const updated = purchases.filter(p => p.id !== purchaseId);
    setPurchases(updated);
    localStorage.setItem(
      `purchases_${supplier.id}`,
      JSON.stringify(updated)
    );
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin h-10 w-10 border-b-2 border-emerald-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">{supplier.name}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-3 gap-4">
          <Stat label="Total Spent" value={`KES ${totals.totalPaid}`} />
          <Stat label="Items" value={totals.totalItems} />
          <Stat label="Last 30 Days" value={totals.recentPurchases} />
        </div>

        {/* Purchases */}
        <div className="p-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold flex gap-2 items-center">
              <ShoppingCart /> Purchases
            </h3>
            <button
              onClick={() => setAddingPurchase(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus /> Add
            </button>
          </div>

          {purchases.length ? (
            <table className="w-full text-sm">
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id} className="border-t">
                    <td>{p.product_name}</td>
                    <td>{p.quantity}</td>
                    <td>KES {p.amount}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePurchase(p.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No purchases yet</p>
          )}
        </div>

        {/* Add Purchase Form */}
        <AnimatePresence>
          {addingPurchase && (
            <motion.form
              onSubmit={handleAddPurchase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 bg-emerald-50 space-y-3"
            >
              <input
                className="w-full border p-2 rounded"
                placeholder="Product name"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                required
              />
              <input
                className="w-full border p-2 rounded"
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
              />
              <input
                className="w-full border p-2 rounded"
                type="number"
                min={0}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
              />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded">
                Save
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
