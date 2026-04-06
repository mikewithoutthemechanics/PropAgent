// Document Management System for PropAgent
// Secure lease/contract storage with versioning and expiry alerts

export type DocumentCategory = 
  | 'lease'           // Lease agreements
  | 'contract'        // Service contracts
  | 'id_document'     // ID/Passport documents
  | 'report'          // Inspection/valuation reports
  | 'other';          // Miscellaneous

export type DocumentStatus = 
  | 'active'          // Currently in effect
  | 'expiring_soon'    // Expiring within 30 days
  | 'expired'         // Past expiry date
  | 'pending'         // Awiting signature
  | 'archived';       // No longer current

export interface DocumentVersion {
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSize: number;
  notes?: string;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantId?: string;
  tenantName?: string;
  
  // Document Info
  category: DocumentCategory;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  
  // Lease-specific fields
  startDate?: string;
  endDate?: string;
  monthlyRent?: number;
  depositAmount?: number;
  
  // Versioning
  currentVersion: number;
  versions: DocumentVersion[];
  
  // Metadata
  uploadedAt: string;
  uploadedBy: string;
  lastReviewedAt?: string;
  
  // Status & Alerts
  status: DocumentStatus;
  expiryAlertSent: boolean;
  
  // Access
  accessLevel: 'private' | 'tenant' | 'agent' | 'public';
}

// Filter and search types
export interface DocumentFilters {
  category?: DocumentCategory;
  status?: DocumentStatus;
  propertyId?: string;
  tenantId?: string;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  expiringWithinDays?: number;
}

// Get days until expiry
export function getDaysUntilExpiry(document: PropertyDocument): number | null {
  if (!document.endDate) return null;
  const end = new Date(document.endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Determine document status based on dates
export function getDocumentStatus(document: PropertyDocument): DocumentStatus {
  if (!document.endDate) return document.status;
  
  const daysUntil = getDaysUntilExpiry(document);
  
  if (daysUntil === null) return document.status;
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 30) return 'expiring_soon';
  return 'active';
}

// Check if document needs expiry alert
export function needsExpiryAlert(document: PropertyDocument): boolean {
  if (document.expiryAlertSent) return false;
  
  const daysUntil = getDaysUntilExpiry(document);
  if (daysUntil === null) return false;
  
  // Alert at 30, 14, 7, 1 days before expiry
  return daysUntil <= 30 && daysUntil > 0;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Get category icon name for display
export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    lease: 'Lease Agreement',
    contract: 'Service Contract',
    id_document: 'ID Document',
    report: 'Inspection Report',
    other: 'Other Document',
  };
  return labels[category];
}

// Get status badge variant
export function getStatusVariant(status: DocumentStatus): 'success' | 'warning' | 'danger' | 'info' | 'default' {
  const variants: Record<DocumentStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    active: 'success',
    expiring_soon: 'warning',
    expired: 'danger',
    pending: 'info',
    archived: 'default',
  };
  return variants[status];
}

// Filter documents
export function filterDocuments(
  documents: PropertyDocument[],
  filters: DocumentFilters
): PropertyDocument[] {
  let filtered = [...documents];
  
  if (filters.category) {
    filtered = filtered.filter(d => d.category === filters.category);
  }
  
  if (filters.status) {
    filtered = filtered.filter(d => d.status === filters.status);
  }
  
  if (filters.propertyId) {
    filtered = filtered.filter(d => d.propertyId === filters.propertyId);
  }
  
  if (filters.tenantId) {
    filtered = filtered.filter(d => d.tenantId === filters.tenantId);
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(query) ||
      d.description?.toLowerCase().includes(query) ||
      d.propertyAddress.toLowerCase().includes(query) ||
      d.tenantName?.toLowerCase().includes(query)
    );
  }
  
  if (filters.expiringWithinDays !== undefined) {
    filtered = filtered.filter(d => {
      const days = getDaysUntilExpiry(d);
      return days !== null && days <= filters.expiringWithinDays! && days > 0;
    });
  }
  
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    filtered = filtered.filter(d => {
      const docDate = new Date(d.uploadedAt);
      return docDate >= start && docDate <= end;
    });
  }
  
  return filtered;
}

// Sort documents
export function sortDocuments(
  documents: PropertyDocument[],
  sortBy: 'date' | 'expiry' | 'title' | 'property' = 'date',
  order: 'asc' | 'desc' = 'desc'
): PropertyDocument[] {
  const sorted = [...documents];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'expiry':
        const aExpiry = a.endDate ? new Date(a.endDate).getTime() : 0;
        const bExpiry = b.endDate ? new Date(b.endDate).getTime() : 0;
        comparison = aExpiry - bExpiry;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'property':
        comparison = a.propertyAddress.localeCompare(b.propertyAddress);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

// Sample documents for demo
export const sampleDocuments: PropertyDocument[] = [
  {
    id: 'doc1',
    propertyId: 'prop1',
    propertyAddress: 'Ocean View Apartment - Umhlanga',
    tenantId: 'tenant1',
    tenantName: 'Sarah Johnson',
    category: 'lease',
    title: 'Lease Agreement - Unit 204',
    description: 'Fixed-term lease agreement for 12 months',
    fileName: 'lease_umhlanga_204_2024.pdf',
    fileUrl: '/documents/lease_umhlanga_204_2024.pdf',
    fileSize: 245000,
    mimeType: 'application/pdf',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 15000,
    depositAmount: 22500,
    currentVersion: 2,
    versions: [
      {
        version: 2,
        uploadedAt: '2024-01-01',
        uploadedBy: 'admin@propagent.co.za',
        fileName: 'lease_umhlanga_204_2024.pdf',
        fileSize: 245000,
        notes: 'Signed copy received',
      },
      {
        version: 1,
        uploadedAt: '2023-12-15',
        uploadedBy: 'agent@propagent.co.za',
        fileName: 'lease_umhlanga_204_draft.pdf',
        fileSize: 238000,
        notes: 'Initial draft',
      },
    ],
    uploadedAt: '2024-01-01',
    uploadedBy: 'admin@propagent.co.za',
    lastReviewedAt: '2024-03-15',
    status: 'active',
    expiryAlertSent: false,
    accessLevel: 'tenant',
  },
  {
    id: 'doc2',
    propertyId: 'prop2',
    propertyAddress: 'Modern Townhouse - Ballito',
    tenantId: 'tenant2',
    tenantName: 'Michael Brown',
    category: 'lease',
    title: 'Lease Agreement - Unit 5B',
    description: 'Month-to-month lease agreement',
    fileName: 'lease_ballito_5b_2024.pdf',
    fileUrl: '/documents/lease_ballito_5b_2024.pdf',
    fileSize: 189000,
    mimeType: 'application/pdf',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    monthlyRent: 22000,
    depositAmount: 33000,
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: '2024-02-01',
        uploadedBy: 'agent@propagent.co.za',
        fileName: 'lease_ballito_5b_2024.pdf',
        fileSize: 189000,
      },
    ],
    uploadedAt: '2024-02-01',
    uploadedBy: 'agent@propagent.co.za',
    status: 'active',
    expiryAlertSent: false,
    accessLevel: 'tenant',
  },
  {
    id: 'doc3',
    propertyId: 'prop1',
    propertyAddress: 'Ocean View Apartment - Umhlanga',
    category: 'report',
    title: 'Property Condition Report',
    description: 'Quarterly inspection report',
    fileName: 'inspection_umhlanga_q1_2024.pdf',
    fileUrl: '/documents/inspection_umhlanga_q1_2024.pdf',
    fileSize: 1250000,
    mimeType: 'application/pdf',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: '2024-03-31',
        uploadedBy: 'inspector@propagent.co.za',
        fileName: 'inspection_umhlanga_q1_2024.pdf',
        fileSize: 1250000,
      },
    ],
    uploadedAt: '2024-03-31',
    uploadedBy: 'inspector@propagent.co.za',
    status: 'active',
    expiryAlertSent: false,
    accessLevel: 'private',
  },
  {
    id: 'doc4',
    propertyId: 'prop3',
    propertyAddress: 'Beach Cottage - Scottburgh',
    tenantId: 'tenant3',
    tenantName: 'Emily Davis',
    category: 'id_document',
    title: 'Tenant ID Copy',
    description: 'Certified ID copy for tenant screening',
    fileName: 'id_emily_davis.pdf',
    fileUrl: '/documents/id_emily_davis.pdf',
    fileSize: 89000,
    mimeType: 'application/pdf',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: '2024-04-01',
        uploadedBy: 'agent@propagent.co.za',
        fileName: 'id_emily_davis.pdf',
        fileSize: 89000,
      },
    ],
    uploadedAt: '2024-04-01',
    uploadedBy: 'agent@propagent.co.za',
    status: 'active',
    expiryAlertSent: false,
    accessLevel: 'private',
  },
  {
    id: 'doc5',
    propertyId: 'prop4',
    propertyAddress: 'Garden Villa - Durban North',
    category: 'contract',
    title: 'Gardening Service Contract',
    description: 'Monthly garden maintenance agreement',
    fileName: 'contract_garden_maintenance_2024.pdf',
    fileUrl: '/documents/contract_garden_maintenance_2024.pdf',
    fileSize: 156000,
    mimeType: 'application/pdf',
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: '2024-01-15',
        uploadedBy: 'admin@propagent.co.za',
        fileName: 'contract_garden_maintenance_2024.pdf',
        fileSize: 156000,
      },
    ],
    uploadedAt: '2024-01-15',
    uploadedBy: 'admin@propagent.co.za',
    status: 'active',
    expiryAlertSent: false,
    accessLevel: 'agent',
  },
  {
    id: 'doc6',
    propertyId: 'prop2',
    propertyAddress: 'Modern Townhouse - Ballito',
    category: 'lease',
    title: 'Lease Agreement Renewal - Unit 5B',
    description: 'Fixed-term lease renewal for 12 months',
    fileName: 'lease_ballito_5b_renewal.pdf',
    fileUrl: '/documents/lease_ballito_5b_renewal.pdf',
    fileSize: 267000,
    mimeType: 'application/pdf',
    startDate: '2024-02-01',
    endDate: '2026-01-31',
    monthlyRent: 23000,
    depositAmount: 34500,
    currentVersion: 1,
    versions: [
      {
        version: 1,
        uploadedAt: '2024-11-15',
        uploadedBy: 'agent@propagent.co.za',
        fileName: 'lease_ballito_5b_renewal.pdf',
        fileSize: 267000,
      },
    ],
    uploadedAt: '2024-11-15',
    uploadedBy: 'agent@propagent.co.za',
    status: 'expiring_soon',
    expiryAlertSent: true,
    accessLevel: 'tenant',
  },
];

// Get document statistics
export function getDocumentStats(documents: PropertyDocument[]) {
  const total = documents.length;
  const leases = documents.filter(d => d.category === 'lease');
  const expiring = leases.filter(d => getDocumentStatus(d) === 'expiring_soon');
  const expired = leases.filter(d => getDocumentStatus(d) === 'expired');
  const withExpiry = leases.filter(d => d.endDate);
  
  return {
    total,
    leases: leases.length,
    contracts: documents.filter(d => d.category === 'contract').length,
    idDocuments: documents.filter(d => d.category === 'id_document').length,
    reports: documents.filter(d => d.category === 'report').length,
    expiringSoon: expiring.length,
    expired: expired.length,
    withExpiryDate: withExpiry.length,
  };
}