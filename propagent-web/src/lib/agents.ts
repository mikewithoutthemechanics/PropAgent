// agent-loop - Agent Types and Management
// FFC-verified estate agent management system

export type EmploymentStatus = 'employed' | 'self_employed' | 'business_owner';
export type AgentStatus = 'pending' | 'verified' | 'suspended' | 'archived';
export type SubscriptionTier = 'starter' | 'professional' | 'enterprise';

export interface AgentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // FFC Verification
  ffcNumber: string;
  ffcVerified: boolean;
  ffcVerificationDate?: string;
  ffcExpiryDate?: string;
  
  // Professional Details
  agencyId?: string;
  agencyName?: string;
  principalId?: string;
  areas: string[];
  specializations: string[];
  
  // Ranking (visible to principals only)
  npsScore?: number;
  reviewCount?: number;
  avgRating?: number;
  DealCount?: number;
  matchSuccessRate?: number;
  
  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionExpires?: string;
  
  // Stats
  totalMatches: number;
  closedDeals: number;
  escrowDeposits: number;
  
  // Status
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  principalId: string;
  
  // Stats
  totalAgents: number;
  activeAgents: number;
  
  // Subscription
  subscriptionTier: SubscriptionTier;
  
  createdAt: string;
}

// FFC Verification status helpers
export function isFFCVerified(agent: AgentProfile): boolean {
  return agent.ffcVerified && agent.status === 'verified';
}

export function canAccessMatching(agent: AgentProfile): boolean {
  return isFFCVerified(agent) && agent.subscriptionTier !== 'starter';
}

export function canViewRankings(agent: AgentProfile): boolean {
  // Only principals can view agent rankings
  return agent.principalId === agent.id;
}

export function getAccessLevel(agent: AgentProfile): 'none' | 'basic' | 'premium' | 'admin' {
  if (!isFFCVerified(agent)) return 'none';
  if (agent.principalId === agent.id) return 'admin';
  if (agent.subscriptionTier === 'enterprise') return 'premium';
  if (agent.subscriptionTier === 'professional') return 'premium';
  return 'basic';
}

// Sample data for demo
export const sampleAgents: AgentProfile[] = [
  {
    id: 'agent1',
    userId: 'user1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@agency.co.za',
    phone: '+27831234567',
    ffcNumber: 'FFC123456',
    ffcVerified: true,
    ffcVerificationDate: '2024-01-15',
    agencyName: 'Premier Properties',
    areas: ['Umhlanga', 'Durban North', 'Ballito'],
    specializations: ['Residential', 'Commercial'],
    npsScore: 85,
    reviewCount: 42,
    avgRating: 4.8,
    dealCount: 28,
    matchSuccessRate: 72,
    subscriptionTier: 'professional',
    totalMatches: 156,
    closedDeals: 28,
    escrowDeposits: 28,
    status: 'verified',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'agent2',
    userId: 'user2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@realty.co.za',
    phone: '+27839876543',
    ffcNumber: 'FFC789012',
    ffcVerified: true,
    ffcVerificationDate: '2024-02-01',
    agencyName: 'Coastal Estates',
    areas: ['Ballito', 'Zimbali', 'Salt Rock'],
    specializations: ['Luxury', 'Waterfront'],
    npsScore: 92,
    reviewCount: 67,
    avgRating: 4.9,
    dealCount: 45,
    matchSuccessRate: 85,
    subscriptionTier: 'enterprise',
    totalMatches: 234,
    closedDeals: 45,
    escrowDeposits: 45,
    status: 'verified',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15',
  },
  {
    id: 'agent3',
    userId: 'user3',
    firstName: 'Mike',
    lastName: 'Williams',
    email: 'mike.w@agency.co.za',
    phone: '+27835551234',
    ffcNumber: 'FFC345678',
    ffcVerified: true,
    ffcVerificationDate: '2024-03-01',
    agencyName: 'KZN Properties',
    areas: ['Pietermaritzburg', 'Hilton', 'Howick'],
    specializations: ['Agricultural', 'Residential'],
    npsScore: 45,
    reviewCount: 12,
    avgRating: 3.2,
    dealCount: 5,
    matchSuccessRate: 34,
    subscriptionTier: 'starter',
    totalMatches: 45,
    closedDeals: 5,
    escrowDeposits: 3,
    status: 'verified',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
  },
];

export const sampleAgencies: Agency[] = [
  {
    id: 'agency1',
    name: 'Premier Properties',
    address: '45 Lagoon Drive, Umhlanga, Durban',
    phone: '+27315671111',
    email: 'info@premierprop.co.za',
    website: 'https://premierproperties.co.za',
    principalId: 'agent1',
    totalAgents: 12,
    activeAgents: 10,
    subscriptionTier: 'enterprise',
    createdAt: '2023-06-01',
  },
  {
    id: 'agency2',
    name: 'Coastal Estates',
    address: '12 Ballito Bay Drive, Ballito',
    phone: '+27328441111',
    email: 'hello@coastalestates.co.za',
    website: 'https://coastalestates.co.za',
    principalId: 'agent2',
    totalAgents: 8,
    activeAgents: 8,
    subscriptionTier: 'enterprise',
    createdAt: '2023-09-01',
  },
];