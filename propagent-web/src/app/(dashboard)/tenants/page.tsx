'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Calendar, MoreVertical, Building, User, Filter, Sparkles, X } from 'lucide-react';
import { mockTenants, mockProperties } from '@/lib/data';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const statusConfig = {
  active: { label: 'Active', class: 'bg-[var(--emerald-500)]/15 text-[var(--emerald-600)]' },
  pending: { label: 'Pending', class: 'bg-[var(--amber-500)]/15 text-[var(--amber-600)]' },
  former: { label: 'Former', class: 'bg-[var(--charcoal-200)] text-[var(--charcoal-500)]' },
};

const statusColors: Record<string, string> = {
  active: '#10B981',
  pending: '#F59E0B',
  former: '#6B7280',
};

function getPropertyAddress(propertyId?: string) {
  if (!propertyId) return null;
  const property = mockProperties.find(p => p.id === propertyId);
  return property ? `${property.address}, ${property.suburb}` : null;
}

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 bg-white border border-[var(--charcoal-100)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--lime-50)] via-white to-[var(--sky-50)]" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--lime-400)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-[var(--sky-400)]/10 rounded-full blur-2xl" />
      <div className="relative px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[var(--lime-400)]/20 backdrop-blur rounded-xl">
            <User className="w-6 h-6 text-[var(--charcoal-900)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--charcoal-900)]">Tenants</h1>
        </div>
        <p className="text-[var(--charcoal-500)] text-sm">Manage your tenant records and lease information</p>
        <div className="flex items-center gap-4 mt-4 text-[var(--charcoal-500)] text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {mockTenants.length} total tenants
          </span>
          <span className="flex items-center gap-1">
            <Building className="w-3.5 h-3.5" />
            {mockTenants.filter(t => t.propertyId).length} with properties
          </span>
        </div>
      </div>
    </div>
  );
}

function GlassmorphismFilterPanel({ 
  searchQuery, 
  setSearchQuery, 
  filterStatus, 
  setFilterStatus 
}: { 
  searchQuery: string; 
  setSearchQuery: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-[var(--charcoal-100)] rounded-2xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--charcoal-400)]" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-sm text-[var(--charcoal-900)] placeholder:text-[var(--charcoal-400)] focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]/30 focus:border-[var(--lime-400)] transition-all duration-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--charcoal-400)] ml-3" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-sm text-[var(--charcoal-700)] focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]/30 focus:border-[var(--lime-400)] cursor-pointer transition-all duration-300 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          <option value="former">Former</option>
          </select>
        </div>
      </div>
    </div>
);
}

function PremiumStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const color = statusColors[status] || statusColors.active;
  
  return (
    <div className="relative inline-flex">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${config.class}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" style={{ backgroundColor: color }} />
        {config.label}
      </span>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: typeof mockTenants[0] }) {
  const propertyAddress = getPropertyAddress(tenant.propertyId);

  return (
    <div className="bg-white border border-[var(--charcoal-100)] rounded-2xl p-4 hover:border-[var(--lime-400)]/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--lime-400)] to-[var(--sky-400)] flex items-center justify-center text-[var(--charcoal-900)] font-medium shadow-lg">
            {tenant.avatarUrl ? (
              <img src={tenant.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              `${tenant.firstName[0]}${tenant.lastName[0]}`
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${tenant.status === 'active' ? 'bg-[var(--emerald-500)]' : tenant.status === 'pending' ? 'bg-[var(--amber-500)]' : 'bg-[var(--charcoal-400)]'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--charcoal-900)] truncate">{tenant.firstName} {tenant.lastName}</h3>
          <p className="text-xs text-[var(--charcoal-400)]">ID: {tenant.id.slice(0, 8)}</p>
        </div>
        <PremiumStatusBadge status={tenant.status} />
      </div>
      
      {propertyAddress && (
        <div className="flex items-center gap-2 text-sm text-[var(--charcoal-600)] mb-2">
          <Building className="w-4 h-4 text-[var(--lime-500)]" />
          <span className="truncate">{propertyAddress}</span>
        </div>
      )}
      
      <div className="flex items-center gap-4 text-xs text-[var(--charcoal-500)]">
        {tenant.leaseStart && tenant.leaseEnd && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(tenant.leaseStart)}
          </span>
        )}
        {tenant.rentAmount && (
          <span className="font-medium text-[var(--charcoal-700)]">
            {formatCurrency(tenant.rentAmount)}/mo
          </span>
        )}
      </div>
    </div>
  );
}

function TableRow({ tenant }: { tenant: typeof mockTenants[0] }) {
  const propertyAddress = getPropertyAddress(tenant.propertyId);
  
  return (
    <tr className="hover:bg-[var(--lime-50)]/50 transition-all duration-300">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--lime-400)] to-[var(--sky-400)] flex items-center justify-center text-[var(--charcoal-900)] text-sm font-medium shadow-md">
              {tenant.avatarUrl ? (
                <img src={tenant.avatarUrl} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                `${tenant.firstName[0]}${tenant.lastName[0]}`
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${tenant.status === 'active' ? 'bg-[var(--emerald-500)]' : tenant.status === 'pending' ? 'bg-[var(--amber-500)]' : 'bg-[var(--charcoal-400)]'}`} />
          </div>
          <div>
            <p className="font-medium text-[var(--charcoal-900)]">{tenant.firstName} {tenant.lastName}</p>
            <p className="text-xs text-[var(--charcoal-400)]">ID: {tenant.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {propertyAddress ? (
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-[var(--lime-500)]" />
            <span className="text-[var(--charcoal-700)]">{propertyAddress}</span>
          </div>
        ) : (
          <span className="text-sm text-[var(--charcoal-400)] italic">No property assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {tenant.leaseStart && tenant.leaseEnd ? (
          <div className="flex items-center gap-2 text-sm text-[var(--charcoal-600)]">
            <Calendar className="w-4 h-4 text-[var(--lime-500)]" />
            <span>{formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}</span>
          </div>
        ) : (
          <span className="text-sm text-[var(--charcoal-400)] italic">No lease</span>
        )}
      </td>
      <td className="px-6 py-4">
        {tenant.rentAmount ? (
          <span className="font-medium text-[var(--charcoal-900)]">{formatCurrency(tenant.rentAmount)}<span className="text-[var(--charcoal-500)] text-xs">/mo</span></span>
        ) : (
          <span className="text-[var(--charcoal-400)]">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <PremiumStatusBadge status={tenant.status} />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-lime-600 transition-all duration-300">
            <Mail className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{tenant.email}</span>
          </a>
          <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-lime-600 transition-all duration-300">
            <Phone className="w-4 h-4" />
            {tenant.phone}
          </a>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-[var(--charcoal-50)] rounded-lg transition-all duration-200 cursor-pointer">
          <MoreVertical className="w-4 h-4 text-[var(--charcoal-400)]" />
        </button>
      </td>
    </tr>
  );
}

function AnimatedEmptyState({ searchQuery, filterStatus }: { searchQuery: string; filterStatus: string }) {
  const hasFilters = searchQuery || filterStatus !== 'all';

  return (
    <div className="py-16 text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-[var(--lime-100)] rounded-full" />
        <div className="relative w-full h-full bg-[var(--lime-200)] rounded-full flex items-center justify-center">
          {hasFilters ? (
            <Search className="w-8 h-8 text-[var(--lime-600)]" />
          ) : (
            <User className="w-8 h-8 text-[var(--lime-600)]" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--lime-400)] rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-[var(--charcoal-900)]" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-[var(--charcoal-800)] mb-2">
        {hasFilters ? 'No tenants found' : 'No tenants yet'}
      </h3>
      <p className="text-sm text-[var(--charcoal-500)] max-w-xs mx-auto">
        {hasFilters 
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Start by adding your first tenant to manage properties and leases.'
        }
      </p>
    </div>
  );
}

function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="fixed bottom-6 right-6 z-50 cursor-pointer" aria-label="Add new tenant">
      <div className="w-14 h-14 bg-[var(--lime-400)] rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
        <Plus className="w-6 h-6 text-[var(--charcoal-900)]" />
      </div>
    </button>
  );
}

function ParallaxBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
      <div className="absolute top-40 right-20 w-48 h-48 bg-rose-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-sky-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }} />
    </div>
  );
}

function ViewToggle({ view, setView }: { view: 'table' | 'cards'; setView: (v: 'table' | 'cards') => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--charcoal-50)] rounded-lg">
      <button
        onClick={() => setView('table')}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${view === 'table' ? 'bg-[var(--lime-400)] text-[var(--charcoal-900)] shadow-sm' : 'text-[var(--charcoal-500)] hover:text-[var(--charcoal-700)]'}`}
      >
        Table
      </button>
      <button
        onClick={() => setView('cards')}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${view === 'cards' ? 'bg-[var(--lime-400)] text-[var(--charcoal-900)] shadow-sm' : 'text-[var(--charcoal-500)] hover:text-[var(--charcoal-700)]'}`}
      >
        Cards
      </button>
    </div>
  );
}

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tenants, setTenants] = useState(mockTenants);
  const [newTenant, setNewTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: '',
    leaseStart: '',
    leaseEnd: '',
    rentAmount: '',
  });

  const handleAddTenant = () => {
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.email) {
      alert('Please fill in required fields (First Name, Last Name, Email)');
      return;
    }
    
    const tenant = {
      id: `tenant_${Date.now()}`,
      firstName: newTenant.firstName,
      lastName: newTenant.lastName,
      email: newTenant.email,
      phone: newTenant.phone || '+27810000000',
      propertyId: newTenant.propertyId || null,
      leaseStart: newTenant.leaseStart || null,
      leaseEnd: newTenant.leaseEnd || null,
      rentAmount: newTenant.rentAmount ? parseFloat(newTenant.rentAmount) : null,
      status: 'active' as const,
      avatarUrl: null,
    };
    
    setTenants([tenant, ...tenants]);
    setShowAddModal(false);
    setNewTenant({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyId: '',
      leaseStart: '',
      leaseEnd: '',
      rentAmount: '',
    });
  };

  const filteredTenants = tenants.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 bg-white" />
      
      <div className="max-w-7xl mx-auto relative">
        <AnimatedGradientHeader />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <GlassmorphismFilterPanel 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
          <ViewToggle view={view} setView={setView} />
        </div>

        {view === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant, index) => (
              <TenantCard key={tenant.id} tenant={tenant} />
            ))}
            {filteredTenants.length === 0 && (
              <div className="col-span-full">
                <AnimatedEmptyState searchQuery={searchQuery} filterStatus={filterStatus} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[var(--charcoal-100)] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Tenant list">
                <thead className="bg-[var(--charcoal-50)] border-b border-[var(--charcoal-100)]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Lease Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Rent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--charcoal-500)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--charcoal-50)]">
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} tenant={tenant} />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTenants.length === 0 && (
              <div className="p-16">
                <AnimatedEmptyState searchQuery={searchQuery} filterStatus={filterStatus} />
              </div>
            )}
          </div>
        )}

        <FloatingActionButton onClick={() => setShowAddModal(true)} />
        
        {/* Add Tenant Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[var(--charcoal-900)]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[var(--charcoal-100)] rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-[var(--charcoal-900)]">Add New Tenant</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[var(--charcoal-50)] rounded-lg transition-all duration-300 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-[var(--charcoal-500)]" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={newTenant.firstName}
                      onChange={(e) => setNewTenant({...newTenant, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={newTenant.lastName}
                      onChange={(e) => setNewTenant({...newTenant, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                    placeholder="tenant@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                    placeholder="+27831234567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Property</label>
                  <select 
                    value={newTenant.propertyId}
                    onChange={(e) => setNewTenant({...newTenant, propertyId: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)] cursor-pointer"
                  >
                    <option value="">Select a property...</option>
                    {mockProperties.map(prop => (
                      <option key={prop.id} value={prop.id}>{prop.address}, {prop.suburb}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Lease Start</label>
                    <input 
                      type="date" 
                      value={newTenant.leaseStart}
                      onChange={(e) => setNewTenant({...newTenant, leaseStart: e.target.value})}
                      className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Lease End</label>
                    <input 
                      type="date" 
                      value={newTenant.leaseEnd}
                      onChange={(e) => setNewTenant({...newTenant, leaseEnd: e.target.value})}
                      className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--charcoal-700)] mb-2">Monthly Rent (ZAR)</label>
                  <input 
                    type="number" 
                    value={newTenant.rentAmount}
                    onChange={(e) => setNewTenant({...newTenant, rentAmount: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-900)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lime-400)]"
                    placeholder="15000"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-[var(--charcoal-50)] border border-[var(--charcoal-200)] rounded-xl text-[var(--charcoal-700)] text-sm hover:bg-[var(--charcoal-100)] transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTenant}
                  className="px-6 py-2.5 bg-[var(--lime-400)] rounded-xl text-[var(--charcoal-900)] text-sm font-medium hover:shadow-lg hover:shadow-[var(--lime-400)]/25 transition-all duration-300 cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Add Tenant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}