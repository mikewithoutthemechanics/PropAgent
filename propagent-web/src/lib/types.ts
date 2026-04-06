export interface Property {
  id: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  type: 'house' | 'apartment' | 'flat' | 'townhouse' | 'commercial';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  rent: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenantId?: string;
  imageUrl?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId?: string;
  leaseStart?: string;
  leaseEnd?: string;
  rentAmount?: number;
  status: 'active' | 'pending' | 'former';
  avatarUrl?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'utility' | 'fee' | 'other';
  status: 'pending' | 'paid' | 'late' | 'failed';
  dueDate: string;
  paidDate?: string;
  reference?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'tenant' | 'landlord' | 'agent' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyAddress: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
