// Client-side seed data + Supabase helpers.
//
// The seed arrays below are shaped to match the UI's camelCase field usage
// (firstName, propertyId, leaseStart, rentAmount, etc.) rather than the raw
// snake_case Supabase schema. This lets the dashboard work fully in demo mode
// with localStorage persistence (see `src/lib/persistence.ts`).

import { supabase } from './supabase';

// -------- UI-facing seed types --------

export interface UIProperty {
  id: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  monthlyRent: number;
  depositAmount: number;
  status: 'available' | 'rented' | 'maintenance' | 'unavailable';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UITenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  rentAmount: number | null;
  status: 'active' | 'pending' | 'former';
  avatarUrl: string | null;
}

export interface UIMaintenanceRequest {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  tenantId: string | null;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  category: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  dueDate: string | null;
  estimatedCost: number | null;
  assignedContractor: string | null;
  notes: string | null;
}

export interface UIPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  dueDate: string;
  paidDate: string | null;
  method: 'eft' | 'card' | 'cash' | 'debit_order';
  reference: string;
}

// -------- Seed data --------

export const mockProperties: UIProperty[] = [
  {
    id: 'prop-1',
    address: '42 Oak Street',
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    bedrooms: 2,
    bathrooms: 1,
    garages: 1,
    monthlyRent: 15000,
    depositAmount: 15000,
    status: 'rented',
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
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
    monthlyRent: 28000,
    depositAmount: 28000,
    status: 'rented',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
  },
  {
    id: 'prop-3',
    address: '12 Umhlanga Rocks Drive',
    suburb: 'Umhlanga',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    bedrooms: 4,
    bathrooms: 3,
    garages: 2,
    monthlyRent: 35000,
    depositAmount: 35000,
    status: 'available',
    imageUrl:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'prop-4',
    address: '7 Protea Avenue',
    suburb: 'Stellenbosch',
    city: 'Cape Town',
    province: 'Western Cape',
    bedrooms: 2,
    bathrooms: 2,
    garages: 1,
    monthlyRent: 18500,
    depositAmount: 18500,
    status: 'maintenance',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
  },
];

export const mockTenants: UITenant[] = [
  {
    id: 'tenant-1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+27 82 456 7890',
    propertyId: 'prop-1',
    leaseStart: '2024-01-01',
    leaseEnd: '2025-12-31',
    rentAmount: 15000,
    status: 'active',
    avatarUrl: null,
  },
  {
    id: 'tenant-2',
    firstName: 'Thabo',
    lastName: 'Ndlovu',
    email: 'thabo.ndlovu@email.com',
    phone: '+27 83 221 8874',
    propertyId: 'prop-2',
    leaseStart: '2024-02-15',
    leaseEnd: '2026-02-14',
    rentAmount: 28000,
    status: 'active',
    avatarUrl: null,
  },
  {
    id: 'tenant-3',
    firstName: 'Amira',
    lastName: 'Patel',
    email: 'amira.patel@email.com',
    phone: '+27 84 112 9933',
    propertyId: null,
    leaseStart: null,
    leaseEnd: null,
    rentAmount: null,
    status: 'pending',
    avatarUrl: null,
  },
];

export const mockMaintenanceRequests: UIMaintenanceRequest[] = [
  {
    id: 'maint-1',
    title: 'Leaking kitchen tap',
    description:
      'Kitchen sink tap has been dripping for two days and water is pooling under the basin.',
    propertyId: 'prop-1',
    tenantId: 'tenant-1',
    priority: 'medium',
    category: 'plumbing',
    status: 'in-progress',
    createdAt: '2024-06-01T09:10:00Z',
    dueDate: '2024-06-05',
    estimatedCost: 850,
    assignedContractor: 'QuickFix Plumbing',
    notes: 'Parts ordered, awaiting delivery.',
  },
  {
    id: 'maint-2',
    title: 'Geyser replacement',
    description: 'Hot water geyser is leaking from the base; needs replacement.',
    propertyId: 'prop-4',
    tenantId: null,
    priority: 'high',
    category: 'plumbing',
    status: 'pending',
    createdAt: '2024-06-10T14:25:00Z',
    dueDate: '2024-06-12',
    estimatedCost: 6500,
    assignedContractor: null,
    notes: null,
  },
  {
    id: 'maint-3',
    title: 'Broken garage door motor',
    description:
      'Garage door motor stopped working. Tenant unable to park inside.',
    propertyId: 'prop-2',
    tenantId: 'tenant-2',
    priority: 'low',
    category: 'electrical',
    status: 'completed',
    createdAt: '2024-05-20T11:00:00Z',
    dueDate: '2024-05-25',
    estimatedCost: 1800,
    assignedContractor: 'Coastal Electrical',
    notes: 'Completed on 24 May; invoice settled.',
  },
];

export const mockPayments: UIPayment[] = [
  {
    id: 'pay-1',
    tenantId: 'tenant-1',
    propertyId: 'prop-1',
    amount: 15000,
    status: 'paid',
    dueDate: '2024-06-01',
    paidDate: '2024-05-29',
    method: 'eft',
    reference: 'RENT-2024-06-001',
  },
  {
    id: 'pay-2',
    tenantId: 'tenant-2',
    propertyId: 'prop-2',
    amount: 28000,
    status: 'pending',
    dueDate: '2024-07-01',
    paidDate: null,
    method: 'debit_order',
    reference: 'RENT-2024-07-002',
  },
  {
    id: 'pay-3',
    tenantId: 'tenant-1',
    propertyId: 'prop-1',
    amount: 15000,
    status: 'overdue',
    dueDate: '2024-05-01',
    paidDate: null,
    method: 'eft',
    reference: 'RENT-2024-05-001',
  },
];

export interface UIChatMessage {
  id: string;
  senderId: string;
  senderType: 'agent' | 'tenant' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface UIConversation {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyAddress: string;
  subject?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: UIChatMessage[];
}

export const mockConversations: UIConversation[] = [
  {
    id: 'conv-1',
    tenantId: 'tenant-1',
    tenantName: 'Sarah Johnson',
    propertyId: 'prop-1',
    propertyAddress: '15 Bree Street, Cape Town CBD, Cape Town',
    subject: 'Lease renewal inquiry',
    lastMessage: 'Hi, would love to discuss renewing the lease for another year.',
    lastMessageTime: '2024-06-14T09:30:00Z',
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderId: 'tenant-1',
        senderType: 'tenant',
        content: 'Hi, would love to discuss renewing the lease for another year.',
        timestamp: '2024-06-14T09:30:00Z',
        read: false,
      },
    ],
  },
  {
    id: 'conv-2',
    tenantId: 'tenant-2',
    tenantName: 'Michael Dlamini',
    propertyId: 'prop-2',
    propertyAddress: '42 Oak Avenue, Sandton, Johannesburg',
    subject: 'Maintenance update',
    lastMessage: 'Thanks for sending the electrician so quickly!',
    lastMessageTime: '2024-05-25T16:45:00Z',
    unreadCount: 0,
    messages: [
      {
        id: 'msg-2',
        senderId: 'tenant-2',
        senderType: 'tenant',
        content: 'Thanks for sending the electrician so quickly!',
        timestamp: '2024-05-25T16:45:00Z',
        read: true,
      },
    ],
  },
];

// -------- Supabase helpers (only used when NEXT_PUBLIC_SUPABASE_* is set) --------

export async function fetchProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchMaintenanceTickets() {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
