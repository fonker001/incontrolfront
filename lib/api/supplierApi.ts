// lib/api/supplierApi.ts
import { authApi } from './authApi';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Supplier type aligned with Django (UUID string)
export interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  additional_info?: any | null;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Data for create/update
export interface SupplierFormData {
  name: string;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  additional_info?: any | null;
}

// --- Helper to enforce auth ---
function getHeadersOrThrow() {
  if (!authApi.isAuthenticated()) throw new Error('Not authenticated');
  return authApi.getAuthHeaders();
}

// --- API methods ---
export const supplierApi = {
  async create(data: SupplierFormData): Promise<Supplier> {
    const headers = getHeadersOrThrow();
    const res = await fetch(`${API_BASE}/staff/suppliers/create/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to create supplier' }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  async list(): Promise<Supplier[]> {
    const headers = getHeadersOrThrow();
    const res = await fetch(`${API_BASE}/staff/suppliers/`, { headers });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch suppliers' }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  async get(id: number): Promise<Supplier> {
    const headers = getHeadersOrThrow();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, { headers });
    if (!res.ok) {
      if (res.status === 404) throw new Error('Supplier not found');
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch supplier' }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  async update(id: number, data: Partial<SupplierFormData>): Promise<Supplier> {
    const headers = getHeadersOrThrow();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error('Supplier not found');
      const error = await res.json().catch(() => ({ detail: 'Failed to update supplier' }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const headers = getHeadersOrThrow();
    const res = await fetch(`${API_BASE}/staff/suppliers/${id}/`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error('Supplier not found');
      const error = await res.json().catch(() => ({ detail: 'Failed to delete supplier' }));
      throw new Error(error.detail);
    }
  },

  async search(query: string): Promise<Supplier[]> {
    const headers = getHeadersOrThrow();
    try {
      const res = await fetch(`${API_BASE}/staff/suppliers/search/?q=${encodeURIComponent(query)}`, { headers });
      if (res.ok) return res.json();
    } catch {}
    // fallback to client-side search
    const all = await this.list();
    const q = query.toLowerCase();
    return all.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.phone_number && s.phone_number.toLowerCase().includes(q))
    );
  },
};
