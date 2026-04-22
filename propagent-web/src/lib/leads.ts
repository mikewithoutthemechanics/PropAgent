// Agent Loop - Lead Generation Sources
// Property24, Facebook, website integration for tenant/landlord leads

export type LeadSource = 'property24' | 'facebook' | 'website' | 'referral' | 'direct';

export type LeadType = 'tenant' | 'landlord' | 'buyer';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export interface Lead {
  id: string;
  source: LeadSource;
  type: LeadType;
  
  // Contact info
  name: string;
  email: string;
  phone: string;
  
  // Requirements (for tenants)
  budgetMin?: number;
  budgetMax?: number;
  preferredSuburb?: string;
  bedrooms?: number;
  propertyTypes?: string[];
  
  // Property info (for landlords)
  propertyAddress?: string;
  propertyType?: string;
  askingPrice?: number;
  askingRent?: number;
  
  // Status
  status: LeadStatus;
  assignedAgentId?: string;
  
  // Source details
  sourceId?: string; // Property24 listing ID, Facebook ad ID, etc.
  sourceUrl?: string;
  capturedAt: string;
  lastContactAt?: string;
}

// Lead source icons and colors
export const leadSourceConfig: Record<LeadSource, { icon: string; color: string; label: string }> = {
  property24: { icon: '🏠', color: '#FF6B35', label: 'Property24' },
  facebook: { icon: '📘', color: '#1877F2', label: 'Facebook' },
  website: { icon: '🌐', color: '#6366F1', label: 'Website' },
  referral: { icon: '🤝', color: '#10B981', label: 'Referral' },
  direct: { icon: '📞', color: '#F59E0B', label: 'Direct' },
};

// Sample leads
export const sampleLeads: Lead[] = [
  {
    id: 'lead1',
    source: 'property24',
    type: 'tenant',
    name: 'Jane Doe',
    email: 'jane.doe@email.com',
    phone: '+27831234567',
    budgetMin: 8000,
    budgetMax: 15000,
    preferredSuburb: 'Umhlanga',
    bedrooms: 2,
    propertyTypes: ['apartment', 'flat'],
    status: 'qualified',
    assignedAgentId: 'agent1',
    sourceId: 'P24-12345',
    sourceUrl: 'https://property24.co.za/12345',
    capturedAt: '2024-03-01T10:00:00Z',
    lastContactAt: '2024-03-02T14:00:00Z',
  },
  {
    id: 'lead2',
    source: 'facebook',
    type: 'landlord',
    name: 'Tom Smith',
    email: 'tom.smith@email.com',
    phone: '+27839876543',
    propertyAddress: '45 Beach Road, Ballito',
    propertyType: 'house',
    askingRent: 25000,
    status: 'new',
    sourceId: 'FB-ads-67890',
    capturedAt: '2024-03-05T15:30:00Z',
  },
  {
    id: 'lead3',
    source: 'website',
    type: 'tenant',
    name: 'Sarah Wilson',
    email: 'sarah.w@email.com',
    phone: '+27835551234',
    budgetMin: 10000,
    budgetMax: 20000,
    preferredSuburb: 'Durban North',
    bedrooms: 3,
    status: 'contacted',
    assignedAgentId: 'agent2',
    capturedAt: '2024-03-03T09:00:00Z',
    lastContactAt: '2024-03-04T11:00:00Z',
  },
  {
    id: 'lead4',
    source: 'referral',
    type: 'buyer',
    name: 'Mike Brown',
    email: 'mike.b@email.com',
    phone: '+27837771111',
    bedrooms: 4,
    preferredSuburb: 'Zimbali',
    status: 'converted',
    assignedAgentId: 'agent2',
    capturedAt: '2024-02-20T10:00:00Z',
    lastContactAt: '2024-02-25T16:00:00Z',
  },
  {
    id: 'lead5',
    source: 'property24',
    type: 'tenant',
    name: 'Lisa Johnson',
    email: 'lisa.j@email.com',
    phone: '+27832222333',
    budgetMin: 6000,
    budgetMax: 10000,
    preferredSuburb: 'Phoenix',
    bedrooms: 1,
    status: 'lost',
    assignedAgentId: 'agent3',
    capturedAt: '2024-02-15T10:00:00Z',
    lastContactAt: '2024-02-18T10:00:00Z',
  },
];

// Lead stats
export function getLeadStats(leads: Lead[]) {
  const bySource: Record<LeadSource, number> = {
    property24: 0,
    facebook: 0,
    website: 0,
    referral: 0,
    direct: 0,
  };
  
  const byStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  };
  
  leads.forEach(lead => {
    bySource[lead.source]++;
    byStatus[lead.status]++;
  });
  
  return { bySource, byStatus };
}