import { supabase } from './supabase';
import { Property, Tenant, MaintenanceTicket, Payment, Conversation } from './types';

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    address: '42 Oak Street',
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    bedrooms: 2,
    bathrooms: 1,
    garages: 1,
    monthly_rerent: 15000,
    deposit_amount: 15000,
    status: 'rented',
    created_at: '2024-01-15',
    updated_at: '2024-06-01',
  },
  {
    id: 'prop-2',
    address: '78 Beach Road',
    suburb: 'Muizenberg',
    city: 'Cape Town',
    province: 'Western Cape',
    bedrooms: 3,
    bathrooms: 2,
    garages: 2,
    monthly_rerent: 28000,
    deposit_amount: 28000,
    status: 'rented',
    created_at: '2024-02-20',
    updated_at: '2024-05-15',
  },
];

export const mockTenants: Tenant[] = [
  {
    id: 'tenant-1',
    first_name: 'Sarah',
    last_name: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+27 82 456 7890',
    property_id: 'prop-1',
    lease_start_date: '2024-01-01',
    lease_end_date: '2025-12-31',
    monthly_rent: 15000,
    status: 'active',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
];

export const mockMaintenanceRequests: MaintenanceTicket[] = [];
export const mockPayments: Payment[] = [];
export const mockConversations: Conversation[] = [];

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Property[];
}

export async function fetchTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Tenant[];
}

export async function fetchMaintenanceTickets(): Promise<MaintenanceTicket[]> {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MaintenanceTicket[];
}

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}
