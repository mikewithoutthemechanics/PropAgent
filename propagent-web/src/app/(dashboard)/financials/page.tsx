'use client';

import { useState, useMemo, useEffect } from 'react';
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
  RentRollSummary,
  ExpenseSummary,
  CommissionBreakdown,
  FinancialReport
} from '@/lib/financials';
import { mockProperties, mockTenants } from '@/lib/data';

type TabType = 'rentroll' | 'expenses' | 'invoices' | 'reports' | 'commissions';

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rentroll');
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [expenseFilter, setExpenseFilter] = useState<ExpenseCategory | 'all'>('all');
  const [isVisible, setIsVisible] = useState(false);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
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

  const rentRoll = useMemo(() => getRentRollSummary(), []);
  const expenseSummary = useMemo(() => getExpenseSummary(sampleExpenses), []);
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
    
    const expense = {
      id: `exp_${Date.now()}`,
      propertyId: newExpense.propertyId,
      propertyAddress: mockProperties.find(p => p.id === newExpense.propertyId)?.address || 'Unknown',
      category: newExpense.category,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      vendor: newExpense.vendor || undefined,
      date: newExpense.date,
      status: newExpense.status
    };
    
    // In a real app, this would save to the database
    console.log('Adding expense:', expense);
    alert(`Expense added: ${formatCurrency(expense.amount)} for ${expense.propertyAddress}`);
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
      {/* Animated Gradient Header */}
      <div className={`gradient-header rounded-2xl p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-gradient-gold font-serif">Financials</h1>
            <p className="text-gray-400 mt-1">Track revenue, expenses, and generate reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="glass-light border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-400/50"
              onClick={() => handleExportCSV('rentroll')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button className="btn-premium text-gray-900" onClick={() => setShowInvoiceModal(true)}>
              <Receipt className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children visible">
        <Card className={`glass-card p-6 hover-3d-card cursor-pointer transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Rent Collectible</p>
              <p className="text-2xl font-bold text-gradient-gold mt-1">{formatCurrency(rentRoll.totalRent)}</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{rentRoll.totalProperties} properties
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <Home className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className={`glass-card p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Collected This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(rentRoll.totalCollected)}</p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${rentRoll.collectionRate >= 80 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                <TrendingUp className="w-3 h-3" /> {formatPercent(rentRoll.collectionRate)} collection rate
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className={`glass-card p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(rentRoll.totalOutstanding)}</p>
              <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Requires attention
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <CreditCard className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className={`glass-card p-6 hover-3d-card cursor-pointer transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(expenseSummary.totalExpenses)}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> This period
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
              <Wrench className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs - Dark Theme */}
      <div className="border-b border-gray-700/50 bg-dark-800/50 rounded-t-xl backdrop-blur-sm">
        <nav className="flex space-x-1 -mb-px px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
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
        <Card className="glass-card card-gold-shimmer">
          <CardHeader
            title="Rent Roll Summary"
            subtitle="All properties with rent status"
            action={
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 w-64 transition-all"
                />
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Monthly Rent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Collected</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRentRoll.map((item) => (
                  <tr key={item.propertyId} className="hover:bg-dark-700/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{item.propertyAddress}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400">{item.tenantName}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-white">{formatCurrency(item.monthlyRent)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-medium">{formatCurrency(item.collected)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${item.outstanding > 0 ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {formatCurrency(item.outstanding)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
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
              <p className="text-gray-500">No rent roll items found.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card className="glass-card card-gold-shimmer">
          <CardHeader
            title="Expense Tracking"
            subtitle="Maintenance, rates, utilities, and other expenses"
            action={
              <div className="flex items-center gap-2">
                <Button 
                  className="btn-premium text-gray-900"
                  onClick={() => setShowAddExpense(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
                <select
                  value={expenseFilter}
                  onChange={(e) => setExpenseFilter(e.target.value as ExpenseCategory | 'all')}
                  className="px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                >
                  <option value="all" className="bg-dark-800">All Categories</option>
                  <option value="maintenance" className="bg-dark-800">Maintenance</option>
                  <option value="rates" className="bg-dark-800">Rates</option>
                  <option value="utilities" className="bg-dark-800">Utilities</option>
                  <option value="insurance" className="bg-dark-800">Insurance</option>
                  <option value="management" className="bg-dark-800">Management</option>
                  <option value="other" className="bg-dark-800">Other</option>
                </select>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4 text-gray-400">{expense.date}</td>
                    <td className="px-6 py-4 text-white font-medium">{expense.propertyAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${getExpenseCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{expense.description}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.vendor || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-white">{formatCurrency(expense.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        expense.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
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
              <p className="text-gray-500">No expenses found.</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card className="glass-card card-gold-shimmer">
          <CardHeader
            title="Invoice Management"
            subtitle="Generate and track rent invoices"
            action={
              <div className="flex items-center gap-2">
                <Button 
                  className="btn-premium text-gray-900"
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
              <table className="w-full">
                <thead className="bg-dark-800/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-dark-700/50 transition-colors">
                      <td className="px-6 py-4 text-indigo-400 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-white font-medium">{invoice.property}</td>
                      <td className="px-6 py-4 text-gray-400">{invoice.tenant}</td>
                      <td className="px-6 py-4 text-gray-400">{invoice.date}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">{formatCurrency(invoice.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          invoice.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {invoice.status === 'draft' && (
                            <button 
                              onClick={() => setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'sent' as const } : i))}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Send
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button 
                              onClick={() => setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'paid' as const } : i))}
                              className="text-emerald-400 hover:text-emerald-300 text-sm"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-white">
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
              <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No invoices yet</p>
              <Button 
                className="btn-premium text-gray-900"
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
        <Card className="glass-card">
          <CardHeader
            title="Financial Reports"
            subtitle="Monthly, quarterly, and annual financial summaries"
            action={
              <div className="flex items-center gap-2">
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
                  className="px-3 py-2 bg-dark-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="monthly" className="bg-dark-800">Monthly</option>
                  <option value="quarterly" className="bg-dark-800">Quarterly</option>
                  <option value="annually" className="bg-dark-800">Annually</option>
                </select>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-dark-700">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            }
          />
          <div className="p-6 space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-sm font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Revenue
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Rent Collected</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.rentCollected)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Rent Outstanding</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.rentOutstanding)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Other Income</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.otherIncome)}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
                  <p className="text-xs text-emerald-400">Total Revenue</p>
                  <p className="text-lg font-semibold text-emerald-400">{formatCurrency(report.totalRevenue)}</p>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Expenses
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Maintenance</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.maintenanceExpenses)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Rates</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.ratesExpenses)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Utilities</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.utilitiesExpenses)}</p>
                </div>
                <div className="bg-dark-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-500">Other</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(report.otherExpenses)}</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                  <p className="text-xs text-red-400">Total Expenses</p>
                  <p className="text-lg font-semibold text-red-400">{formatCurrency(report.totalExpenses)}</p>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Net Income</p>
                  <p className={`text-3xl font-bold ${report.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(report.netIncome)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Occupancy Rate</p>
                  <p className="text-lg font-semibold text-white">{formatPercent(report.occupancyRate)}</p>
                  <p className="text-xs text-gray-600">
                    {report.occupiedProperties} of {report.totalProperties} properties occupied
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'commissions' && (
        <Card className="glass-card card-gold-shimmer">
          <CardHeader
            title="Commission Breakdown"
            subtitle="Escrow-based agent commissions from property sales"
            action={
              <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20" onClick={() => handleExportCSV('commissions')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Sale Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Listing Agent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Introducing Agent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Platform Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {commissions.map((item) => (
                  <tr key={item.propertyId} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{item.propertyAddress}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-white">{formatCurrency(item.salePrice)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span>{formatCurrency(item.totalCommission)}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.commissionPercent}%)</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-medium">{formatCurrency(item.listingAgentShare)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-medium">{formatCurrency(item.introducingAgentShare)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-500">{formatCurrency(item.platformFee)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        item.escrowStatus === 'released' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.escrowStatus === 'deposited' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        item.escrowStatus === 'in_verification' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
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
              <p className="text-gray-500">No commissions found.</p>
            </div>
          )}
        </Card>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white font-serif">Add New Expense</h2>
              <button 
                onClick={() => setShowAddExpense(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Property *</label>
                <select
                  value={newExpense.propertyId}
                  onChange={(e) => setNewExpense({...newExpense, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Amount *</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Enter expense description"
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Vendor</label>
                  <input
                    type="text"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                    placeholder="Vendor name"
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                <select
                  value={newExpense.status}
                  onChange={(e) => setNewExpense({...newExpense, status: e.target.value as 'pending' | 'paid'})}
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-dark-700"
                onClick={() => setShowAddExpense(false)}
              >
                Cancel
              </Button>
              <Button 
                className="btn-premium text-gray-900"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Create Invoice</h2>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Invoice Number & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Invoice Number</label>
                  <div className="px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-indigo-400 font-medium">
                    INV-{Date.now().toString().slice(-8)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as 'draft' | 'sent' | 'paid')}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Property</label>
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Select Property</option>
                    {mockProperties.map(prop => (
                      <option key={prop.id} value={prop.address}>{prop.address}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tenant</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Line Items</label>
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
                        className="flex-1 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                        className="w-32 px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {lineItems.length > 1 && (
                        <button
                          onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}
                          className="p-3 text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLineItems([...lineItems, { description: '', amount: 0, type: 'other' }])}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>

              {/* Tax Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the tenant..."
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-dark-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax ({taxRate}%)</span>
                  <span className="text-white">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) * taxRate / 100)}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-indigo-400">{formatCurrency(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0) * (1 + taxRate / 100))}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-dark-700"
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-dark-700"
                  onClick={() => {
                    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const tax = subtotal * taxRate / 100;
                    const total = subtotal + tax;
                    const newInvoice = {
                      id: Date.now(),
                      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
                      property: selectedProperty || 'N/A',
                      tenant: selectedTenant || 'N/A',
                      date: invoiceDate,
                      dueDate: dueDate,
                      items: lineItems,
                      subtotal,
                      tax,
                      total,
                      status: invoiceStatus,
                      notes
                    };
                    setInvoices([...invoices, newInvoice]);
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
                  className="btn-premium text-gray-900"
                  onClick={() => {
                    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
                    const tax = subtotal * taxRate / 100;
                    const total = subtotal + tax;
                    const newInvoice = {
                      id: Date.now(),
                      invoiceNumber: `INV-${Date.now().toString().slice(-8)}`,
                      property: selectedProperty || 'N/A',
                      tenant: selectedTenant || 'N/A',
                      date: invoiceDate,
                      dueDate: dueDate,
                      items: lineItems,
                      subtotal,
                      tax,
                      total,
                      status: 'sent' as const,
                      notes
                    };
                    setInvoices([...invoices, newInvoice]);
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
