'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, newId } from '@/lib/persistence';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  Download,
  CreditCard,
  Wrench,
  Home,
  Building,
  PieChart,
  BarChart3,
  Receipt,
  Send,
  Filter,
  Search,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  FileIcon,
  X,
  Plus,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { Card, CardHeader, Button, Badge, Input, Select } from '@/components/ui';
import { 
  getRentRollSummary,
  getExpenseSummary,
  getCommissionBreakdown,
  generateFinancialReport,
  exportRentRollToCSV,
  exportExpensesToCSV,
  exportCommissionsToCSV,
  exportToCSV,
  formatCurrency,
  formatPercent,
  getCollectionRateColor,
  getExpenseCategoryColor,
  sampleExpenses,
  sampleCommissions,
  ReportPeriod,
  ExpenseCategory,
  Expense,
  RentRollSummary,
  ExpenseSummary,
  CommissionBreakdown,
  FinancialReport
} from '@/lib/financials';
import { mockProperties, mockTenants } from '@/lib/data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

type TabType = 'rentroll' | 'expenses' | 'invoices' | 'reports' | 'commissions';

interface Invoice {
  id: string;
  invoiceNumber: string;
  property: string;
  tenant: string;
  date: string;
  dueDate: string;
  lineItems: { description: string; amount: number; type: string }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid';
  notes?: string;
}

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rentroll');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseCategory | 'all'>('all');
  const [isVisible, setIsVisible] = useState(false);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const {
    items: invoices,
    add: addInvoice,
    update: updateInvoice,
  } = useCollection<Invoice>('invoices', []);
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now().toString().slice(-8)}`);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [lineItems, setLineItems] = useState([
    { description: 'Monthly Rent', amount: 0, type: 'rent' }
  ]);
  const [taxRate, setTaxRate] = useState(15);
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'sent' | 'paid'>('draft');
  const [notes, setNotes] = useState('');

  // Add expense modal state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    propertyId: '',
    category: 'maintenance' as ExpenseCategory,
    description: '',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'paid'
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const {
    items: expenses,
    add: addExpenseRecord,
  } = useCollection<Expense>('expenses', sampleExpenses);

  const rentRoll = useMemo(() => getRentRollSummary(), []);
  const expenseSummary = useMemo(() => getExpenseSummary(expenses), [expenses]);
  const commissions = useMemo(() => getCommissionBreakdown(sampleCommissions), []);
  const report = useMemo(() => generateFinancialReport(reportPeriod), [reportPeriod]);

  const filteredExpenses = useMemo(() => {
    if (expenseFilter === 'all') return expenseSummary.expenses;
    return expenseSummary.expenses.filter(e => e.category === expenseFilter);
  }, [expenseSummary, expenseFilter]);

  const filteredRentRoll = useMemo(() => {
    if (!searchQuery) return rentRoll.items;
    return rentRoll.items.filter(item => 
      item.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rentRoll, searchQuery]);

  const handleExportCSV = (type: 'rentroll' | 'expenses' | 'commissions') => {
    let data;
    let filename: string;
    
    switch (type) {
      case 'rentroll':
        data = exportRentRollToCSV(rentRoll);
        break;
      case 'expenses':
        data = exportExpensesToCSV(sampleExpenses);
        break;
      case 'commissions':
        data = exportCommissionsToCSV(sampleCommissions);
        filename = data.filename;
        break;
    }
    
    if (data) {
      const csv = exportToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.filename;
      link.click();
    }
  };

  const handleAddExpense = () => {
    if (!newExpense.propertyId || !newExpense.description || !newExpense.amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    const expense: Expense = {
      id: newId('exp'),
      propertyId: newExpense.propertyId,
      propertyAddress: mockProperties.find(p => p.id === newExpense.propertyId)?.address || 'Unknown',
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      vendor: newExpense.vendor || undefined,
      date: newExpense.date,
      status: newExpense.status,
    };

    addExpenseRecord(expense);
    setShowAddExpense(false);
    setNewExpense({
      propertyId: '',
      category: 'maintenance',
      description: '',
      amount: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  const tabs = [
    { id: 'rentroll', label: 'Rent Roll', icon: Building },
    { id: 'expenses', label: 'Expenses', icon: Wrench },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r from-primary via-accent to-primary rounded-2xl p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-900 font-serif">Financials</h1>
            <p className="text-charcoal-500 mt-1">Track revenue, expenses, and generate reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-charcoal-200 text-charcoal-700 hover:bg-primary/20 hover:border-primary/50 cursor-pointer transition-all duration-300"
              onClick={() => handleExportCSV('rentroll')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300" onClick={() => setShowInvoiceModal(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children visible">
        <Card className={`bg-white border-2 border-charcoal-100 rounded-2xl p-6 hover-3d-card cursor-pointer transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-500">Total Rent Collectible</p>
              <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(rentRoll.totalRent)}</p>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{rentRoll.totalProperties} properties
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Home className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className={`bg-white border-2 border-charcoal-100 rounded-2xl p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-500">Collected This Month</p>
              <p className="text-2xl font-bold text-charcoal-900 mt-1">{formatCurrency(rentRoll.totalCollected)}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${rentRoll.collectionRate >= 80 ? 'text-primary' : 'text-primary-600'}`}>
                <TrendingUp className="w-3 h-3" /> {formatPercent(rentRoll.collectionRate)} collection rate
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className={`bg-white border-2 border-charcoal-100 rounded-2xl p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-500">Outstanding</p>
              <p className="text-2xl font-bold text-charcoal-900 mt-1">{formatCurrency(rentRoll.totalOutstanding)}</p>
              <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Requires attention
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className={`bg-white border-2 border-charcoal-100 rounded-2xl p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-500">Total Expenses</p>
              <p className="text-2xl font-bold text-charcoal-900 mt-1">{formatCurrency(expenseSummary.totalExpenses)}</p>
              <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> This period
              </p>
            </div>
            <div className="w-12 h-12 bg-charcoal-100 rounded-xl flex items-center justify-center border border-charcoal-200">
              <Wrench className="w-6 h-6 text-expense" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-charcoal-200 bg-white rounded-t-xl">
        <nav className="flex space-x-1 -mb-px px-4 overflow-x-auto" role="tablist" aria-label="Financials sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-900 hover:border-charcoal-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'rentroll' && (
        <Card className="bg-white border-2 border-charcoal-100 rounded-2xl">
          <CardHeader
            title="Rent Roll Summary"
            subtitle="All properties with rent status"
            action={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 w-full sm:w-64 transition-all cursor-pointer"
                />
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-50 border-b border-charcoal-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Monthly Rent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Collected</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredRentRoll.map((item) => (
                  <tr key={item.propertyId} className="hover:bg-charcoal-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <span className="font-medium text-charcoal-900">{item.propertyAddress}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-charcoal-500">{item.tenantName}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-charcoal-900">{formatCurrency(item.monthlyRent)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-primary font-medium">{formatCurrency(item.collected)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${item.outstanding > 0 ? 'text-primary-600' : 'text-charcoal-500'}`}>
                        {formatCurrency(item.outstanding)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'paid' ? 'bg-primary/20 text-primary-600 border border-primary/30' : 'bg-primary/20 text-primary-600 border border-primary/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRentRoll.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-charcoal-500">No rent roll items found.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card className="bg-white border-2 border-charcoal-100 rounded-2xl">
          <CardHeader
            title="Expense Tracking"
            subtitle="Maintenance, rates, utilities, and other expenses"
            action={
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300"
                  onClick={() => setShowAddExpense(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
                <select
                  value={expenseFilter}
                  onChange={(e) => setExpenseFilter(e.target.value as ExpenseCategory | 'all')}
                  className="px-3 py-2 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer transition-all duration-300"
                >
                  <option value="all" className="bg-white">All Categories</option>
                  <option value="maintenance" className="bg-white">Maintenance</option>
                  <option value="rates" className="bg-white">Rates</option>
                  <option value="utilities" className="bg-white">Utilities</option>
                  <option value="insurance" className="bg-white">Insurance</option>
                  <option value="management" className="bg-white">Management</option>
                  <option value="other" className="bg-white">Other</option>
                </select>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-50 border-b border-charcoal-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4 text-charcoal-500">{expense.date}</td>
                    <td className="px-6 py-4 text-charcoal-900 font-medium">{expense.propertyAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${getExpenseCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500">{expense.description}</td>
                    <td className="px-6 py-4 text-charcoal-500">{expense.vendor || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-charcoal-900">{formatCurrency(expense.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'paid' ? 'bg-primary/20 text-primary-600 border border-primary/30' : 'bg-primary/20 text-primary-600 border border-primary/30'
                      }`}>
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredExpenses.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-charcoal-500">No expenses found.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card className="bg-white border-2 border-charcoal-100 rounded-2xl">
          <CardHeader
            title="Invoice Management"
            subtitle="Generate and track rent invoices"
            action={
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300"
                  onClick={() => setShowInvoiceModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </div>
            }
          />
          {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Rent roll summary">
              <thead className="bg-charcoal-50 border-b border-charcoal-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-charcoal-50 transition-colors">
<td className="px-6 py-4 text-primary-600 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-primary/20 text-primary-600 border border-primary/30' :
                          invoice.status === 'sent' ? 'bg-accent/20 text-accent-600 border border-accent-300' :
                          'bg-primary/20 text-primary-600 border border-primary/30'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {invoice.status === 'draft' && (
<button 
                              onClick={() => updateInvoice(invoice.id, { status: 'sent' })}
                              className="text-accent hover:text-accent-700 text-sm cursor-pointer transition-all duration-300"
                            >
                              Send
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button 
                              onClick={() => updateInvoice(invoice.id, { status: 'paid' })}
                              className="text-primary-600 hover:text-primary-700 text-sm cursor-pointer transition-all duration-300"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button className="text-charcoal-500 hover:text-charcoal-900">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500 mb-4">No invoices yet</p>
              <Button 
                className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300"
                onClick={() => setShowInvoiceModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Invoice
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card className="bg-white border-2 border-charcoal-100 rounded-2xl">
          <CardHeader
            title="Financial Reports"
            subtitle="Monthly, quarterly, and annual financial summaries"
            action={
              <div className="flex items-center gap-2">
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
                  className="px-3 py-2 bg-white border border-charcoal-200 rounded-lg text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                >
                  <option value="monthly" className="bg-white">Monthly</option>
                  <option value="quarterly" className="bg-white">Quarterly</option>
                  <option value="annually" className="bg-white">Annually</option>
                </select>
                <Button variant="outline" className="border-charcoal-200 text-charcoal-700 hover:bg-primary/20 cursor-pointer transition-all duration-300">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            }
          />
          <div className="p-6 space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Revenue
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Rent Collected</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.rentCollected)}</p>
                </div>
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Rent Outstanding</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.rentOutstanding)}</p>
                </div>
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Other Income</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.otherIncome)}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <p className="text-xs text-primary-600">Total Revenue</p>
                  <p className="text-lg font-semibold text-primary-600">{formatCurrency(report.totalRevenue)}</p>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-sm font-semibold text-expense mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Expenses
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Maintenance</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.maintenanceExpenses)}</p>
                </div>
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Rates</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.ratesExpenses)}</p>
                </div>
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Utilities</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.utilitiesExpenses)}</p>
                </div>
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Other</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatCurrency(report.otherExpenses)}</p>
                </div>
                <div className="bg-charcoal-100 rounded-lg p-4 border border-charcoal-200">
                  <p className="text-xs text-charcoal-500">Total Expenses</p>
                  <p className="text-lg font-semibold text-charcoal-600">{formatCurrency(report.totalExpenses)}</p>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="border-t border-charcoal-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-500">Net Income</p>
                  <p className={`text-3xl font-bold ${report.netIncome >= 0 ? 'text-primary' : 'text-expense'}`}>
                    {formatCurrency(report.netIncome)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-charcoal-500">Occupancy Rate</p>
                  <p className="text-lg font-semibold text-charcoal-900">{formatPercent(report.occupancyRate)}</p>
                  <p className="text-xs text-charcoal-400">
                    {report.occupiedProperties} of {report.totalProperties} properties occupied
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'commissions' && (
        <Card className="bg-white border-2 border-charcoal-100 rounded-2xl">
          <CardHeader
            title="Commission Breakdown"
            subtitle="Escrow-based agent commissions from property sales"
            action={
              <Button variant="outline" className="border-charcoal-200 text-charcoal-700 hover:bg-primary/20 cursor-pointer transition-all duration-300" onClick={() => handleExportCSV('commissions')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-50 border-b border-charcoal-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Sale Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Listing Agent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Introducing Agent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Platform Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {commissions.map((item) => (
                  <tr key={item.propertyId} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-charcoal-900">{item.propertyAddress}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-charcoal-900">{formatCurrency(item.salePrice)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span>{formatCurrency(item.totalCommission)}</span>
                      <span className="text-xs text-charcoal-500 ml-1">({item.commissionPercent}%)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-primary-600 font-medium">{formatCurrency(item.listingAgentShare)}</span>
                    </td>
<td className="px-6 py-4 text-right">
                      <span className="text-primary-600 font-medium">{formatCurrency(item.listingAgentShare)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-primary-600 font-medium">{formatCurrency(item.introducingAgentShare)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        item.escrowStatus === 'released' ? 'bg-primary/20 text-primary-600 border border-primary/30' :
                        item.escrowStatus === 'deposited' ? 'bg-accent/20 text-accent-600 border border-accent-300' :
                        item.escrowStatus === 'in_verification' ? 'bg-primary/20 text-primary-600 border border-primary/30' :
                        'bg-charcoal-100 text-charcoal-600 border border-charcoal-200'
                      }`}>
                        {item.escrowStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {commissions.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-charcoal-500">No commissions found.</p>
            </div>
          )}
        </Card>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-200">
              <h2 className="text-xl font-bold text-charcoal-900 font-serif">Add New Expense</h2>
              <button 
                onClick={() => setShowAddExpense(false)}
                className="text-charcoal-500 hover:text-charcoal-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Property *</label>
                <select
                  value={newExpense.propertyId}
                  onChange={(e) => setNewExpense({...newExpense, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer transition-all duration-300"
                >
                  <option value="">Select a property</option>
                  {mockProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 cursor-pointer transition-all duration-300"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="rates">Rates</option>
                    <option value="utilities">Utilities</option>
                    <option value="insurance">Insurance</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Amount *</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Description *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Enter expense description"
                  className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Vendor</label>
                  <input
                    type="text"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                    placeholder="Vendor name"
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Status</label>
                <select
                  value={newExpense.status}
                  onChange={(e) => setNewExpense({...newExpense, status: e.target.value as 'pending' | 'paid'})}
                  className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-charcoal-200">
              <Button 
                variant="outline" 
                className="border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300"
                onClick={handleAddExpense}
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Create Invoice</h2>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-charcoal-500 hover:text-charcoal-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Invoice Number & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Invoice Number</label>
                  <div className="px-4 py-3 bg-charcoal-50 border border-charcoal-200 rounded-lg text-primary-600 font-medium">
                    {invoiceNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as 'draft' | 'sent' | 'paid')}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Property & Tenant Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Property</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                  >
                    <option value="">Select Property</option>
                    {mockProperties.map(prop => (
                      <option key={prop.id} value={prop.address}>{prop.address}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Tenant</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                  >
                    <option value="">Select Tenant</option>
                    {mockTenants.map(tenant => (
                      <option key={tenant.id} value={tenant.name}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Line Items</label>
                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[index].description = e.target.value;
                          setLineItems(newItems);
                        }}
                        placeholder="Description"
                        className="flex-1 px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                      />
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[index].amount = parseFloat(e.target.value) || 0;
                          setLineItems(newItems);
                        }}
                        placeholder="Amount"
                        className="w-32 px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                      />
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                          className="p-3 text-expense hover:text-expense-700 cursor-pointer transition-all duration-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLineItems([...lineItems, { description: '', amount: 0, type: 'other' }])}
                  className="mt-3 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 cursor-pointer transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the tenant..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-charcoal-200 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-charcoal-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-charcoal-500">
                  <span>Subtotal</span>
                  <span className="text-charcoal-900">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))}</span>
                </div>
                <div className="flex justify-between text-charcoal-500">
                  <span>Tax ({taxRate}%)</span>
                  <span className="text-charcoal-900">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) * taxRate / 100)}</span>
                </div>
                <div className="border-t border-charcoal-200 pt-2 flex justify-between text-lg font-semibold">
                  <span className="text-charcoal-900">Total</span>
                  <span className="text-primary-600">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) * (1 + taxRate / 100))}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-charcoal-200 flex items-center justify-between">
              <Button 
                variant="outline" 
                className="border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="border-charcoal-200 text-charcoal-700 hover:bg-charcoal-50"
                  onClick={() => {
                    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const tax = subtotal * taxRate / 100;
                    const total = subtotal + tax;
                    const newInvoice: Invoice = {
                      id: newId('inv'),
                      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
                      property: selectedProperty || 'N/A',
                      tenant: selectedTenant || 'N/A',
                      date: invoiceDate,
                      dueDate: dueDate,
                      lineItems,
                      subtotal,
                      tax,
                      total,
                      status: 'draft',
                      notes,
                    };
                    addInvoice(newInvoice);
                    setShowInvoiceModal(false);
                    setSelectedProperty('');
                    setSelectedTenant('');
                    setLineItems([{ description: 'Monthly Rent', amount: 0, type: 'rent' }]);
                    setNotes('');
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  className="bg-primary text-charcoal-900 rounded-full hover:bg-primary-600 cursor-pointer transition-all duration-300"
                  onClick={() => {
                    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const tax = subtotal * taxRate / 100;
                    const total = subtotal + tax;
                    const newInvoice: Invoice = {
                      id: newId('inv'),
                      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
                      property: selectedProperty || 'N/A',
                      tenant: selectedTenant || 'N/A',
                      date: invoiceDate,
                      dueDate: dueDate,
                      lineItems,
                      subtotal,
                      tax,
                      total,
                      status: 'sent',
                      notes,
                    };
                    addInvoice(newInvoice);
                    setShowInvoiceModal(false);
                    setSelectedProperty('');
                    setSelectedTenant('');
                    setLineItems([{ description: 'Monthly Rent', amount: 0, type: 'rent' }]);
                    setNotes('');
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create & Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
