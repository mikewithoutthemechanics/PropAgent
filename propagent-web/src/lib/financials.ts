// PropAgent - Financial Management System
// Comprehensive rent roll, expenses, invoices, and reporting

import { Property, Tenant, Payment } from './types';
import { mockProperties, mockTenants, mockPayments } from './data';

// =============================================================================
// TYPES
// =============================================================================

export type PaymentStatus = 'pending' | 'paid' | 'late' | 'failed' | 'partial';
export type PaymentType = 'rent' | 'deposit' | 'utility' | 'fee' | 'other' | 'rates' | 'maintenance';
export type ExpenseCategory = 'maintenance' | 'rates' | 'utilities' | 'insurance' | 'management' | 'other';
export type ReportPeriod = 'monthly' | 'quarterly' | 'annually';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface RentRollItem {
  propertyId: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  monthlyRent: number;
  collected: number;
  outstanding: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
}

export interface RentRollSummary {
  totalProperties: number;
  totalRent: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  items: RentRollItem[];
}

export interface Expense {
  id: string;
  propertyId: string;
  propertyAddress?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  status: 'pending' | 'paid';
  receiptUrl?: string;
}

export interface ExpenseSummary {
  totalMaintenance: number;
  totalRates: number;
  totalUtilities: number;
  totalInsurance: number;
  totalManagement: number;
  totalOther: number;
  totalExpenses: number;
  expenses: Expense[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyId: string;
  propertyAddress: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface CommissionBreakdown {
  propertyId: string;
  propertyAddress: string;
  salePrice: number;
  commissionPercent: number;
  totalCommission: number;
  listingAgentShare: number;
  introducingAgentShare: number;
  platformFee: number;
  netCommissions: number;
  escrowStatus: 'pending' | 'deposited' | 'released' | 'disputed';
  processedDate?: string;
}

export interface FinancialReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  generatedAt: string;
  
  // Revenue
  rentCollected: number;
  rentOutstanding: number;
  otherIncome: number;
  totalRevenue: number;
  
  // Expenses
  totalExpenses: number;
  maintenanceExpenses: number;
  ratesExpenses: number;
  utilitiesExpenses: number;
  otherExpenses: number;
  
  // Net
  netIncome: number;
  occupancyRate: number;
  
  // Counts
  totalProperties: number;
  occupiedProperties: number;
  invoicesGenerated: number;
  paymentsReceived: number;
}

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

// =============================================================================
// RENT ROLL FUNCTIONS
// =============================================================================

export function getRentRollSummary(
  properties: Property[] = mockProperties,
  tenants: Tenant[] = mockTenants,
  payments: Payment[] = mockPayments
): RentRollSummary {
  const items: RentRollItem[] = [];
  
  properties.forEach(property => {
    if (property.status === 'occupied' && property.tenantId) {
      const tenant = tenants.find(t => t.id === property.tenantId);
      const propertyPayments = payments.filter(
        p => p.propertyId === property.id && p.type === 'rent'
      );
      
      const collected = propertyPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const outstanding = propertyPayments
        .filter(p => p.status !== 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const latestPayment = propertyPayments.find(p => p.status === 'paid');
      
      items.push({
        propertyId: property.id,
        propertyAddress: property.address,
        tenantId: property.tenantId,
        tenantName: tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown',
        monthlyRent: property.rent,
        collected,
        outstanding,
        status: outstanding > 0 ? 'pending' : 'paid',
        dueDate: new Date().toISOString().split('T')[0],
        paidDate: latestPayment?.paidDate,
      });
    }
  });
  
  const totalRent = items.reduce((sum, item) => sum + item.monthlyRent, 0);
  const totalCollected = items.reduce((sum, item) => sum + item.collected, 0);
  const totalOutstanding = items.reduce((sum, item) => sum + item.outstanding, 0);
  const collectionRate = totalRent > 0 ? (totalCollected / totalRent) * 100 : 0;
  
  return {
    totalProperties: items.length,
    totalRent,
    totalCollected,
    totalOutstanding,
    collectionRate,
    items,
  };
}

// =============================================================================
// EXPENSE FUNCTIONS
// =============================================================================

export const sampleExpenses: Expense[] = [
  {
    id: 'exp-1',
    propertyId: 'prop-1',
    propertyAddress: '42 Oak Street, Sandton',
    category: 'maintenance',
    description: 'AC Unit Repair',
    amount: 2500,
    date: '2024-06-10',
    vendor: 'CoolTech HVAC',
    status: 'paid',
  },
  {
    id: 'exp-2',
    propertyId: 'prop-2',
    propertyAddress: '78 Beach Road, Muizenberg',
    category: 'rates',
    description: 'Property Rates Q2',
    amount: 4500,
    date: '2024-04-01',
    vendor: 'City of Cape Town',
    status: 'paid',
  },
  {
    id: 'exp-3',
    propertyId: 'prop-1',
    propertyAddress: '42 Oak Street, Sandton',
    category: 'utilities',
    description: 'Electricity - Common Areas',
    amount: 1200,
    date: '2024-06-05',
    vendor: 'Eskom',
    status: 'paid',
  },
  {
    id: 'exp-4',
    propertyId: 'prop-5',
    propertyAddress: '9 Riverside Drive, Umhlanga',
    category: 'insurance',
    description: 'Building Insurance Premium',
    amount: 3800,
    date: '2024-05-15',
    vendor: 'Santam',
    status: 'paid',
  },
  {
    id: 'exp-5',
    propertyId: 'prop-4',
    propertyAddress: '203 Durban Road, Bellville',
    category: 'maintenance',
    description: 'Gate Motor Repair',
    amount: 3500,
    date: '2024-06-08',
    vendor: 'SecureGate Solutions',
    status: 'pending',
  },
  {
    id: 'exp-6',
    propertyId: 'prop-3',
    propertyAddress: '15 Garden Avenue, Sea Point',
    category: 'rates',
    description: 'Property Rates Q2',
    amount: 2200,
    date: '2024-04-01',
    vendor: 'City of Cape Town',
    status: 'paid',
  },
];

export function getExpenseSummary(expenses: Expense[] = sampleExpenses): ExpenseSummary {
  const summary: ExpenseSummary = {
    totalMaintenance: 0,
    totalRates: 0,
    totalUtilities: 0,
    totalInsurance: 0,
    totalManagement: 0,
    totalOther: 0,
    totalExpenses: 0,
    expenses: expenses,
  };
  
  expenses.forEach(expense => {
    switch (expense.category) {
      case 'maintenance':
        summary.totalMaintenance += expense.amount;
        break;
      case 'rates':
        summary.totalRates += expense.amount;
        break;
      case 'utilities':
        summary.totalUtilities += expense.amount;
        break;
      case 'insurance':
        summary.totalInsurance += expense.amount;
        break;
      case 'management':
        summary.totalManagement += expense.amount;
        break;
      default:
        summary.totalOther += expense.amount;
    }
  });
  
  summary.totalExpenses = 
    summary.totalMaintenance +
    summary.totalRates +
    summary.totalUtilities +
    summary.totalInsurance +
    summary.totalManagement +
    summary.totalOther;
  
  return summary;
}

// =============================================================================
// INVOICE FUNCTIONS
// =============================================================================

export function generateInvoice(
  tenant: Tenant,
  property: Property,
  lineItems: InvoiceLineItem[],
  dueDate: string,
  invoicePrefix: string = 'INV'
): Invoice {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15; // 15% VAT
  const total = subtotal + vat;
  
  const invoiceNumber = `${invoicePrefix}-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
  
  return {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    tenantId: tenant.id,
    tenantName: `${tenant.firstName} ${tenant.lastName}`,
    tenantEmail: tenant.email,
    propertyId: property.id,
    propertyAddress: property.address,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate,
    lineItems,
    subtotal,
    vat,
    total,
    status: 'draft',
  };
}

export function createRentInvoice(
  tenant: Tenant,
  property: Property,
  month: string
): Invoice {
  const lineItems: InvoiceLineItem[] = [
    {
      description: `Monthly Rent - ${month}`,
      quantity: 1,
      unitPrice: property.rent,
      amount: property.rent,
    },
  ];
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  
  return generateInvoice(tenant, property, lineItems, dueDate.toISOString().split('T')[0]);
}

// =============================================================================
// COMMISSION FUNCTIONS
// =============================================================================

export interface EscrowCommission {
  id: string;
  propertyId: string;
  propertyAddress: string;
  salePrice: number;
  commissionPercent: number;
  totalCommission: number;
  agent1Id: string;
  agent1Name: string;
  agent1Share: number;
  agent2Id: string;
  agent2Name: string;
  agent2Share: number;
  platformFee: number;
  status: 'pending_deposit' | 'deposited' | 'in_verification' | 'released' | 'disputed';
  createdAt: string;
  processedAt?: string;
}

export const sampleCommissions: EscrowCommission[] = [
  {
    id: 'com-1',
    propertyId: 'prop-1',
    propertyAddress: '42 Oak Street, Sandton',
    salePrice: 1500000,
    commissionPercent: 6,
    totalCommission: 90000,
    agent1Id: 'agent-1',
    agent1Name: 'John Smith',
    agent1Share: 40500,
    agent2Id: 'agent-2',
    agent2Name: 'Sarah Johnson',
    agent2Share: 40500,
    platformFee: 9000,
    status: 'released',
    createdAt: '2024-02-10',
    processedAt: '2024-03-15',
  },
  {
    id: 'com-2',
    propertyId: 'prop-2',
    propertyAddress: '78 Beach Road, Muizenberg',
    salePrice: 2800000,
    commissionPercent: 5,
    totalCommission: 140000,
    agent1Id: 'agent-1',
    agent1Name: 'John Smith',
    agent1Share: 63000,
    agent2Id: 'agent-3',
    agent2Name: 'Mike Williams',
    agent2Share: 63000,
    platformFee: 14000,
    status: 'in_verification',
    createdAt: '2024-05-01',
  },
  {
    id: 'com-3',
    propertyId: 'prop-5',
    propertyAddress: '9 Riverside Drive, Umhlanga',
    salePrice: 950000,
    commissionPercent: 6,
    totalCommission: 57000,
    agent1Id: 'agent-2',
    agent1Name: 'Sarah Johnson',
    agent1Share: 25650,
    agent2Id: 'agent-4',
    agent2Name: 'Lisa Anderson',
    agent2Share: 25650,
    platformFee: 5700,
    status: 'deposited',
    createdAt: '2024-05-20',
  },
];

export function getCommissionBreakdown(commissions: EscrowCommission[] = sampleCommissions): CommissionBreakdown[] {
  return commissions.map(commission => ({
    propertyId: commission.propertyId,
    propertyAddress: commission.propertyAddress,
    salePrice: commission.salePrice,
    commissionPercent: commission.commissionPercent,
    totalCommission: commission.totalCommission,
    listingAgentShare: commission.agent1Share,
    introducingAgentShare: commission.agent2Share,
    platformFee: commission.platformFee,
    netCommissions: commission.agent1Share + commission.agent2Share,
    escrowStatus: commission.status,
    processedDate: commission.processedAt,
  }));
}

// =============================================================================
// FINANCIAL REPORT FUNCTIONS
// =============================================================================

export function generateFinancialReport(
  period: ReportPeriod,
  properties: Property[] = mockProperties,
  tenants: Tenant[] = mockTenants,
  payments: Payment[] = mockPayments,
  expenses: Expense[] = sampleExpenses
): FinancialReport {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  
  switch (period) {
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      break;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'annually':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  const rentCollected = payments
    .filter(p => p.status === 'paid' && p.type === 'rent')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const rentOutstanding = payments
    .filter(p => p.status !== 'paid' && p.type === 'rent')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const otherIncome = payments
    .filter(p => p.status === 'paid' && p.type !== 'rent')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const expenseSummary = getExpenseSummary(expenses);
  
  const occupiedCount = properties.filter(p => p.status === 'occupied').length;
  const occupancyRate = properties.length > 0 ? (occupiedCount / properties.length) * 100 : 0;
  
  return {
    period,
    startDate: startDateStr,
    endDate: endDateStr,
    generatedAt: new Date().toISOString(),
    rentCollected,
    rentOutstanding,
    otherIncome,
    totalRevenue: rentCollected + otherIncome,
    totalExpenses: expenseSummary.totalExpenses,
    maintenanceExpenses: expenseSummary.totalMaintenance,
    ratesExpenses: expenseSummary.totalRates,
    utilitiesExpenses: expenseSummary.totalUtilities,
    otherExpenses: expenseSummary.totalOther,
    netIncome: (rentCollected + otherIncome) - expenseSummary.totalExpenses,
    occupancyRate,
    totalProperties: properties.length,
    occupiedProperties: occupiedCount,
    invoicesGenerated: 12,
    paymentsReceived: payments.filter(p => p.status === 'paid').length,
  };
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

export function exportToCSV(data: ExportData): string {
  const headerRow = data.headers.join(',');
  const dataRows = data.rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

export function exportRentRollToCSV(rentRoll: RentRollSummary): ExportData {
  const headers = ['Property Address', 'Tenant Name', 'Monthly Rent', 'Collected', 'Outstanding', 'Status', 'Due Date'];
  const rows = rentRoll.items.map(item => [
    item.propertyAddress,
    item.tenantName,
    item.monthlyRent,
    item.collected,
    item.outstanding,
    item.status,
    item.dueDate,
  ]);
  
  return {
    headers,
    rows,
    filename: `rent-roll-${new Date().toISOString().split('T')[0]}.csv`,
  };
}

export function exportExpensesToCSV(expenses: Expense[]): ExportData {
  const headers = ['Date', 'Property', 'Category', 'Description', 'Amount', 'Vendor', 'Status'];
  const rows = expenses.map(expense => [
    expense.date,
    expense.propertyAddress || 'N/A',
    expense.category,
    expense.description,
    expense.amount,
    expense.vendor || 'N/A',
    expense.status,
  ]);
  
  return {
    headers,
    rows,
    filename: `expenses-${new Date().toISOString().split('T')[0]}.csv`,
  };
}

export function exportCommissionsToCSV(commissions: EscrowCommission[]): ExportData {
  const headers = ['Property', 'Sale Price', 'Commission %', 'Total', 'Listing Agent', 'Share', 'Introducing Agent', 'Share', 'Platform Fee', 'Status'];
  const rows = commissions.map(comm => [
    comm.propertyAddress,
    comm.salePrice,
    comm.commissionPercent,
    comm.totalCommission,
    comm.agent1Name,
    comm.agent1Share,
    comm.agent2Name,
    comm.agent2Share,
    comm.platformFee,
    comm.status,
  ]);
  
  return {
    headers,
    rows,
    filename: `commissions-${new Date().toISOString().split('T')[0]}.csv`,
  };
}

// =============================================================================
// FORMATTING HELPERS
// =============================================================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getCollectionRateColor(rate: number): string {
  if (rate >= 95) return 'text-emerald-600';
  if (rate >= 80) return 'text-gold-600';
  return 'text-red-600';
}

export function getExpenseCategoryColor(category: ExpenseCategory): string {
  switch (category) {
    case 'maintenance': return 'bg-blue-100 text-blue-700';
    case 'rates': return 'bg-purple-100 text-purple-700';
    case 'utilities': return 'bg-gold-100 text-gold-700';
    case 'insurance': return 'bg-cyan-100 text-cyan-700';
    case 'management': return 'bg-pink-100 text-pink-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'draft': return 'bg-slate-100 text-slate-700';
    case 'sent': return 'bg-blue-100 text-blue-700';
    case 'paid': return 'bg-emerald-100 text-emerald-700';
    case 'overdue': return 'bg-red-100 text-red-700';
    case 'cancelled': return 'bg-slate-100 text-slate-500';
  }
}