const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

import { authApi } from './authApi';

// Update interface to match Django serializer fields
export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string; 
  address?: string;
  additional_info?: string;
  created_at: string;
  updated_at: string;
}

// For frontend convenience, you can keep an optional "phone" alias
export interface ClientWithPhoneAlias extends Omit<Client, 'phone_number'> {
  phone?: string; // Optional alias for phone_number
}

export const clientApi = {
  // List all clients
  async list(): Promise<Client[]> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/`, {
      method: 'GET',
      headers: headers,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch clients' }));
      throw new Error(error.detail || 'Failed to fetch clients');
    }
    return res.json(); // Backend returns Client objects with phone_number
  },

  // Get single client
  async get(id: number): Promise<Client> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/${id}/`, {
      method: 'GET',
      headers: headers,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to fetch client' }));
      throw new Error(error.detail || 'Failed to fetch client');
    }
    return res.json();
  },

  // Create client
  async create(clientData: Partial<Client>): Promise<Client> {
    // Remove any "phone" field since backend expects "phone_number"
    const { phone, ...dataWithoutPhone } = clientData as any;
    const backendData = { ...dataWithoutPhone };
    
    // If phone was provided, add it as phone_number
    if (phone !== undefined) {
      backendData.phone_number = phone;
    }

    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/create/`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to create client' }));
      throw new Error(error.detail || 'Failed to create client');
    }

    return await res.json(); // Returns Client with phone_number
  },

  // Update client
  async update(id: number, clientData: Partial<Client>): Promise<Client> {
    // Remove any "phone" field since backend expects "phone_number"
    const { phone, ...dataWithoutPhone } = clientData as any;
    const backendData = { ...dataWithoutPhone };
    
    // If phone was provided, add it as phone_number
    if (phone !== undefined) {
      backendData.phone_number = phone;
    }

    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/${id}/`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to update client' }));
      throw new Error(error.detail || 'Failed to update client');
    }

    return await res.json();
  },

  // Delete client
  async delete(id: number): Promise<void> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/${id}/`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Failed to delete client' }));
      throw new Error(error.detail || 'Failed to delete client');
    }
  },

  // Search clients
  async search(query: string): Promise<Client[]> {
    const headers = authApi.getAuthHeaders();
    const res = await fetch(`${API_BASE}/staff/clients/search/?q=${encodeURIComponent(query)}`, {
      headers: headers,
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        const allClients = await this.list();
        return allClients.filter(client => 
          client.first_name.toLowerCase().includes(query.toLowerCase()) ||
          client.last_name.toLowerCase().includes(query.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(query.toLowerCase()))
        );
      }
      const error = await res.json().catch(() => ({ detail: 'Failed to search clients' }));
      throw new Error(error.detail || 'Failed to search clients');
    }
    
    return res.json();
  },
};

// Helper function to convert Client to frontend-friendly format with "phone" alias
export function clientToFrontendFormat(client: Client): ClientWithPhoneAlias {
  return {
    ...client,
    phone: client.phone_number,
  };
}

// Helper function to convert frontend data to backend format
export function clientToBackendFormat(data: Partial<ClientWithPhoneAlias>): Partial<Client> {
  const { phone, ...rest } = data;
  const backendData: Partial<Client> = { ...rest };
  
  if (phone !== undefined) {
    backendData.phone_number = phone;
  }
  
  return backendData;
}