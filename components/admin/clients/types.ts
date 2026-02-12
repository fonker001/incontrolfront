
{/*
  This code defines the Data Architecture and Utility Logic for the clients section 
  of your application. It acts as the "source of truth" for how a client is represented 
  in TypeScript, 
  ensuring that your frontend and backend stay synchronized.
  */}

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
  created_by?: string;
}

// Helper function to get full name
export const getClientFullName = (client: Client): string => {
  return `${client.first_name} ${client.last_name}`.trim();
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  additional_info: string;
}

export const CLIENTS_KEY = 'incontrol_clients_v1';
