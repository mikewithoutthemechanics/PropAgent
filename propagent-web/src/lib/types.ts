export interface Property {
  id: string;
  address: string;
  suburb: string | null;
  city: string | null;
  province: string | null;
  postal_code?: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  square_meters?: number | null;
  monthly_rerent: number | null;
  deposit_amount: number | null;
  status: 'available' | 'rented' | 'maintenance' | 'unavailable';
  ai_description?: string | null;
  ai_description_generated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number?: string | null;
  id_number?: string | null;
  id_type?: 'sa_id' | 'passport' | 'foreign_id' | null;
  employer_name?: string | null;
  monthly_income?: number | null;
  employment_status?: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired' | null;
  property_id: string | null;
  lease_start_date?: string | null;
  lease_end_date?: string | null;
  monthly_rent?: number | null;
  rent_due_day?: number | null;
  last_payment_date?: string | null;
  payment_status?: 'current' | 'overdue' | 'partial' | 'paid_ahead' | null;
  preferred_contact_method?: 'whatsapp' | 'email' | 'sms' | 'call' | null;
  language_preference?: 'english' | 'afrikaans' | 'zulu' | 'xhosa' | 'sotho' | null;
  status: 'prospect' | 'applicant' | 'approved' | 'active' | 'previous' | 'blacklisted';
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTicket {
  id: string;
  tenant_id: string | null;
  property_id: string | null;
  request_source: 'whatsapp' | 'email' | 'phone' | 'app' | 'portal' | null;
  issue_description: string;
  issue_category: 'plumbing' | 'electrical' | 'appliance' | 'structural' | 'cosmetic' | 'hvac' | 'security' | 'other' | null;
  urgency_classified: 'emergency' | 'urgent' | 'routine' | 'cosmetic' | null;
  ai_summary?: string | null;
  recommended_contractor_type?: string | null;
  estimated_severity?: number | null;
  ai_confidence?: number | null;
  assigned_contractor_id?: string | null;
  contractor_notified: boolean;
  status: 'new' | 'ai_classified' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  ai_classified_at?: string | null;
  contractor_assigned_at?: string | null;
  completed_at?: string | null;
}

export interface Payment {
  id: string;
  tenant_id: string | null;
  property_id: string | null;
  amount: number;
  type: 'rent' | 'deposit' | 'utility' | 'fee' | 'other';
  status: 'pending' | 'paid' | 'late' | 'failed';
  due_date: string;
  paid_date?: string;
  reference?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_type: 'tenant' | 'landlord' | 'agent' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  tenant_name: string;
  property_id: string;
  property_address: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: Message[];
}

export interface DashboardStats {
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
  totalTenants: number;
  activeLeases: number;
  pendingMaintenance: number;
  monthlyRevenue: number;
  pendingPayments: number;
  occupancyRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'maintenance' | 'lease' | 'tenant' | 'property';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}
