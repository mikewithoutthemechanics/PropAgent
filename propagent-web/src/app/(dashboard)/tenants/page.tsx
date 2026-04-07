'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, Calendar, MoreVertical, Building, User, Filter, Sparkles, X } from 'lucide-react';
import { mockTenants, mockProperties } from '@/lib/data';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusConfig = {
  active: { label: 'Active', class: 'status-active' },
  pending: { label: 'Pending', class: 'status-pending' },
  former: { label: 'Former', class: 'status-former' },
};

const statusColors: Record<string, string> = {
  active: '#16a34a',
  pending: '#ca8a04',
  former: '#6b7280',
};

function getPropertyAddress(propertyId?: string) {
  if (!propertyId) return null;
  const property = mockProperties.find(p => p.id === propertyId);
  return property ? `${property.address}, ${property.suburb}` : null;
}

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      <div className="absolute inset-0 gradient-animated" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/40 to-white/60" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="relative px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
            <User className="w-6 h-6 text-slate-900" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Tenants</h1>
        </div>
        <p className="text-slate-900/80 text-sm ml-1">Manage your tenant records and lease information</p>
        <div className="flex items-center gap-4 mt-4 text-slate-900/70 text-xs">
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
    <div className="glass-panel p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 to-rose-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-700/50" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur border border-slate-200/50 rounded-xl text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-400/50 transition-all duration-300"
              />
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold-700/50 ml-3" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white/60 backdrop-blur border border-slate-200/50 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-400/50 cursor-pointer transition-all duration-300 appearance-none"
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
    </div>
  );
}

function PremiumStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  const color = statusColors[status] || statusColors.active;
  
  return (
    <div className="relative inline-flex">
      <span className={`status-badge ${config.class}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" style={{ backgroundColor: color }} />
        {config.label}
      </span>
      <span 
        className="absolute inset-0 rounded-full blur-md opacity-40 animate-pulse" 
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function TenantCard({ tenant }: { tenant: typeof mockTenants[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotateX(rotateX);
    setRotateY(rotateY);
  };

  const propertyAddress = getPropertyAddress(tenant.propertyId);

  return (
    <div
      className="tenant-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotateX(0); setRotateY(0); }}
      onMouseMove={handleMouseMove}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-rose-500 flex items-center justify-center text-slate-900 font-medium shadow-lg">
              {tenant.avatarUrl ? (
                <img src={tenant.avatarUrl} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                `${tenant.firstName[0]}${tenant.lastName[0]}`
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${tenant.status === 'active' ? 'bg-green-500' : tenant.status === 'pending' ? 'bg-gold-500' : 'bg-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-900 truncate">{tenant.firstName} {tenant.lastName}</h3>
            <p className="text-xs text-slate-500">ID: {tenant.id.slice(0, 8)}</p>
          </div>
          <PremiumStatusBadge status={tenant.status} />
        </div>
        
        {propertyAddress && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Building className="w-4 h-4 text-gold-600/70" />
            <span className="truncate">{propertyAddress}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-slate-500">
          {tenant.leaseStart && tenant.leaseEnd && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(tenant.leaseStart)}
            </span>
          )}
          {tenant.rentAmount && (
            <span className="font-medium text-slate-700">
              {formatCurrency(tenant.rentAmount)}/mo
            </span>
          )}
        </div>
      </div>
      
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
        <a href={`mailto:${tenant.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-all duration-200">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{tenant.email}</span>
        </a>
        <a href={`tel:${tenant.phone}`} className="flex items-center justify-center p-1.5 text-slate-500 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-all duration-200">
          <Phone className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

function TableRow({ tenant, index }: { tenant: typeof mockTenants[0]; index: number }) {
  const propertyAddress = getPropertyAddress(tenant.propertyId);
  
  return (
    <tr 
      className="table-row group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-rose-400 flex items-center justify-center text-slate-900 text-sm font-medium shadow-md">
              {tenant.avatarUrl ? (
                <img src={tenant.avatarUrl} alt="" className="w-full h-full rounded-lg object-cover" />
              ) : (
                `${tenant.firstName[0]}${tenant.lastName[0]}`
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${tenant.status === 'active' ? 'bg-green-500' : tenant.status === 'pending' ? 'bg-gold-500' : 'bg-gray-400'}`} />
          </div>
          <div>
            <p className="font-medium text-slate-900">{tenant.firstName} {tenant.lastName}</p>
            <p className="text-xs text-slate-500">ID: {tenant.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {propertyAddress ? (
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-gold-600/70" />
            <span className="text-slate-700">{propertyAddress}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-500 italic">No property assigned</span>
        )}
      </td>
      <td className="px-6 py-4">
        {tenant.leaseStart && tenant.leaseEnd ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-gold-600/50" />
            <span>{formatDate(tenant.leaseStart)} - {formatDate(tenant.leaseEnd)}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-500 italic">No lease</span>
        )}
      </td>
      <td className="px-6 py-4">
        {tenant.rentAmount ? (
          <span className="font-medium text-slate-900">{formatCurrency(tenant.rentAmount)}<span className="text-slate-500 text-xs">/mo</span></span>
        ) : (
          <span className="text-slate-500">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <PremiumStatusBadge status={tenant.status} />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-gold-700 transition-colors">
            <Mail className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{tenant.email}</span>
          </a>
          <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-gold-700 transition-colors">
            <Phone className="w-4 h-4" />
            {tenant.phone}
          </a>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 group-hover:bg-gold-50 group-hover:text-gold-700">
          <MoreVertical className="w-4 h-4 text-slate-500 group-hover:text-gold-700" />
        </button>
      </td>
    </tr>
  );
}

function AnimatedEmptyState({ searchQuery, filterStatus }: { searchQuery: string; filterStatus: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hasFilters = searchQuery || filterStatus !== 'all';

  return (
    <div 
      className={`empty-state transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full animate-pulse" />
        <div className="relative w-full h-full bg-gradient-to-br from-amber-200 to-rose-200 rounded-full flex items-center justify-center">
          {hasFilters ? (
            <Search className="w-8 h-8 text-gold-600" />
          ) : (
            <User className="w-8 h-8 text-gold-600" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-gold-400 to-rose-400 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-3 h-3 text-slate-900" />
        </div>
      </div>
      <h3 className="font-serif text-lg font-semibold text-slate-800 mb-2">
        {hasFilters ? 'No tenants found' : 'No tenants yet'}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
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
    <button onClick={onClick} className="fixed bottom-6 right-6 z-50 group cursor-pointer" aria-label="Add new tenant">
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-rose-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
      <div className="relative w-14 h-14 bg-gradient-to-r from-gold-500 to-rose-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
        <Plus className="w-6 h-6 text-slate-900" />
      </div>
    </button>
  );
}

function ParallaxBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-20 left-10 w-64 h-64 bg-gold-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '8s' }} />
      <div className="absolute top-40 right-20 w-48 h-48 bg-rose-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-blue-200/10 rounded-full blur-3xl animate-float" style={{ animationDuration: '12s', animationDelay: '1s' }} />
    </div>
  );
}

function ViewToggle({ view, setView }: { view: 'table' | 'cards'; setView: (v: 'table' | 'cards') => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      <button
        onClick={() => setView('table')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${view === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        Table
      </button>
      <button
        onClick={() => setView('cards')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${view === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
  const [isLoaded, setIsLoaded] = useState(false);
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

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
    <div className={`min-h-screen p-6 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <ParallaxBackground />
      
      <div className="max-w-7xl mx-auto relative">
        <AnimatedGradientHeader />
        
        <div className="flex items-center justify-between mb-4">
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
              <div 
                key={tenant.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <TenantCard tenant={tenant} />
              </div>
            ))}
            {filteredTenants.length === 0 && (
              <div className="col-span-full">
                <AnimatedEmptyState searchQuery={searchQuery} filterStatus={filterStatus} />
              </div>
            )}
          </div>
        ) : (
          <div className="premium-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-stone-50 to-stone-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lease Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTenants.map((tenant, index) => (
                    <TableRow key={tenant.id} tenant={tenant} index={index} />
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl max-w-md w-full p-6 animate-on-scroll">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-slate-900">Add New Tenant</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-slate-900/60" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900/80 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={newTenant.firstName}
                      onChange={(e) => setNewTenant({...newTenant, firstName: e.target.value})}
                      className="w-full px-4 py-3 glass rounded-lg text-slate-900 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900/80 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={newTenant.lastName}
                      onChange={(e) => setNewTenant({...newTenant, lastName: e.target.value})}
                      className="w-full px-4 py-3 glass rounded-lg text-slate-900 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900/80 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-lg text-slate-900 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="tenant@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900/80 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-lg text-slate-900 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="+27831234567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900/80 mb-2">Property</label>
                  <select 
                    value={newTenant.propertyId}
                    onChange={(e) => setNewTenant({...newTenant, propertyId: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                  >
                    <option value="" className="bg-gray-900">Select a property...</option>
                    {mockProperties.map(prop => (
                      <option key={prop.id} value={prop.id} className="bg-gray-900">{prop.address}, {prop.suburb}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900/80 mb-2">Lease Start</label>
                    <input 
                      type="date" 
                      value={newTenant.leaseStart}
                      onChange={(e) => setNewTenant({...newTenant, leaseStart: e.target.value})}
                      className="w-full px-4 py-3 glass rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900/80 mb-2">Lease End</label>
                    <input 
                      type="date" 
                      value={newTenant.leaseEnd}
                      onChange={(e) => setNewTenant({...newTenant, leaseEnd: e.target.value})}
                      className="w-full px-4 py-3 glass rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-900/80 mb-2">Monthly Rent (ZAR)</label>
                  <input 
                    type="number" 
                    value={newTenant.rentAmount}
                    onChange={(e) => setNewTenant({...newTenant, rentAmount: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-lg text-slate-900 placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
                    placeholder="15000"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 glass rounded-lg text-slate-900 text-sm hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTenant}
                  className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-rose-500 rounded-lg text-slate-900 text-sm font-medium hover:shadow-lg hover:shadow-gold-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Add Tenant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .gradient-animated {
          background: linear-gradient(-45deg, #f59e0b, #ec4899, #8b5cf6, #06b6d4);
          background-size: 300% 300%;
          animation: gradient-shift 8s ease infinite;
        }
        
        .glass-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.5) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 16px;
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        
        .premium-card {
          background: white;
          border: 1px solid rgba(212, 184, 139, 0.3);
          border-radius: 16px;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
        }
        
        .tenant-card {
          background: white;
          border: 1px solid rgba(212, 184, 139, 0.2);
          border-radius: 16px;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.04),
            0 10px 40px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }
        
        .tenant-card:hover {
          border-color: rgba(251, 191, 36, 0.4);
          box-shadow: 
            0 8px 30px rgba(0, 0, 0, 0.08),
            0 20px 60px rgba(245, 158, 11, 0.15);
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-active {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
        }
        
        .status-pending {
          background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
          color: #854d0e;
        }
        
        .status-former {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #4b5563;
        }
        
        .table-row {
          opacity: 0;
          animation: fade-in-row 0.4s ease forwards;
        }
        
        @keyframes fade-in-row {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .table-row:hover {
          background: linear-gradient(90deg, rgba(251, 191, 36, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%);
        }
        
        .animate-in {
          animation-duration: 0.5s;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}