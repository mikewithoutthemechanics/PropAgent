'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  Building2, Target, Wallet, FileText, Trophy,
  UserCheck, Sparkles, Bell, Search, ChevronRight, X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Property, Tenant, MaintenanceTicket } from '@/lib/types';
import { mockProperties, mockTenants, mockMaintenanceRequests } from '@/lib/data';

// Fallback mock data in case DB is empty
const mockPaymentData = {
  rent: { value: 102054, change: 5 },
  additionalServices: { value: 28450, change: 12 },
  maintenance: { value: 12800, change: -3 },
  debt: { value: 4200, change: -15 },
};

const defaultSpotlight = {
  title: "Property Portfolio Overview",
  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa84830?w=800&q=80",
  stats: { residents: 0, units: 0, vacant: 0, upcoming: 0 },
  priceHistory: [3200, 3350, 3280, 3420, 3500, 3450, 3600, 3580, 3720, 3800, 3750, 3900],
};

const statusStyles = {
  new: "bg-[var(--status-new-bg)] text-[var(--status-new-text)]",
  in_progress: "bg-[var(--status-in-progress-bg)] text-[var(--status-in-progress-text)]",
  pending: "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)]",
  ai_classified: "bg-[var(--status-ai-classified-bg)] text-[var(--status-ai-classified-text)]",
  assigned: "bg-[var(--status-assigned-bg)] text-[var(--status-assigned-text)]",
  completed: "bg-[var(--status-completed-bg)] text-[var(--status-completed-text)]",
  cancelled: "bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled-text)]",
};

function PaymentsSkeleton() {
  return (
    <div className="bg-charcoal-900 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-24 bg-charcoal-800 rounded"></div>
        <div className="h-8 w-28 bg-charcoal-800 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-charcoal-800 rounded-2xl p-5">
            <div className="h-4 w-16 bg-charcoal-700 rounded"></div>
            <div className="h-8 w-24 bg-charcoal-700 rounded mt-3"></div>
            <div className="h-3 w-20 bg-charcoal-700 rounded mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertySpotlightSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-charcoal-100 animate-pulse">
      <div className="h-48 bg-charcoal-200"></div>
      <div className="p-5">
        <div className="h-6 w-48 bg-charcoal-200 rounded"></div>
        <div className="grid grid-cols-4 gap-4 mt-4 py-4 border-y border-charcoal-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-6 w-8 bg-charcoal-200 rounded mx-auto"></div>
              <div className="h-3 w-12 bg-charcoal-200 rounded mt-1 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="h-4 w-20 bg-charcoal-200 rounded mb-3"></div>
          <div className="h-24 bg-charcoal-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function RequestsListSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 h-full animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-24 bg-charcoal-200 rounded"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-200"></div>
              <div>
                <div className="h-4 w-24 bg-charcoal-200 rounded"></div>
                <div className="h-3 w-16 bg-charcoal-200 rounded mt-1"></div>
              </div>
            </div>
            <div className="h-6 w-16 bg-charcoal-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingUnitsSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-6 w-28 bg-charcoal-200 rounded"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="h-20 bg-charcoal-200"></div>
            <div className="p-3">
              <div className="h-4 w-32 bg-charcoal-200 rounded"></div>
              <div className="h-3 w-24 bg-charcoal-200 rounded mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentsOverview() {
  const payments = [
    { label: "Rent", ...mockPaymentData.rent, isPrimary: true },
    { label: "Additional services", ...mockPaymentData.additionalServices, isPrimary: false },
    { label: "Maintenance", ...mockPaymentData.maintenance, isPrimary: false },
    { label: "Debt", ...mockPaymentData.debt, isPrimary: false },
  ];

  return (
    <div className="bg-charcoal-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-lg font-semibold">Payments</h2>
        <button className="bg-charcoal-800 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-charcoal-700 transition-colors cursor-pointer">
          This month <ChevronRight className="w-4 h-4 rotate-90" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {payments.map((payment, index) => (
          <div
            key={payment.label}
            className={`${
              payment.isPrimary 
                ? "bg-lime-400" 
                : "bg-charcoal-800"
            } rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02] cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <span className={`text-sm font-medium ${payment.isPrimary ? "text-charcoal-900/70" : "text-white/70"}`}>
                {payment.label}
              </span>
              <ArrowUpRight className={`w-4 h-4 ${payment.isPrimary ? "text-charcoal-900/50" : "text-white/50"}`} />
            </div>
            <p className={`text-2xl font-bold mt-3 ${payment.isPrimary ? "text-charcoal-900" : "text-white"}`}>
              R{payment.value.toLocaleString()}.00
            </p>
            <p className={`text-xs mt-2 ${payment.isPrimary ? "text-charcoal-900/60" : "text-white/60"}`}>
              {payment.change >= 0 ? "+" : ""}{payment.change}% vs last month
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertySpotlight({ properties, tenants }: { properties: Property[], tenants: Tenant[] }) {
  const spotlight = properties.length > 0 ? {
    title: properties[0].address,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa84830?w=800&q=80",
    stats: {
      residents: tenants.filter(t => t.property_id === properties[0].id).length,
      units: 1,
      vacant: properties[0].status === 'available' ? 1 : 0,
      upcoming: 0
    },
    priceHistory: defaultSpotlight.priceHistory,
  } : {
    ...defaultSpotlight,
    stats: {
      residents: tenants.length,
      units: properties.length,
      vacant: properties.filter(p => p.status === 'available').length,
      upcoming: 0
    }
  };

  const maxPrice = Math.max(...spotlight.priceHistory);
  const minPrice = Math.min(...spotlight.priceHistory);
  const range = maxPrice - minPrice;
  
  const points = spotlight.priceHistory
    .map((price, i) => {
      const x = (i / (spotlight.priceHistory.length - 1)) * 100;
      const y = 100 - ((price - minPrice) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-charcoal-100">
      <div className="relative h-48 bg-charcoal-100">
        <img 
          src={spotlight.image}
          alt={spotlight.title}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-charcoal-50 transition-colors cursor-pointer" aria-label="Close property spotlight">
          <X className="w-4 h-4 text-charcoal-600" />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal-900">{spotlight.title}</h3>
          <ArrowUpRight className="w-5 h-5 text-charcoal-400" />
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4 py-4 border-y border-charcoal-100">
          {[
            { label: "Residents", value: spotlight.stats.residents },
            { label: "Units", value: spotlight.stats.units },
            { label: "Vacant", value: spotlight.stats.vacant },
            { label: "Upcoming", value: spotlight.stats.upcoming },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-charcoal-900">{stat.value}</p>
              <p className="text-xs text-charcoal-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-charcoal-900">Price Trend</h4>
            <button className="bg-charcoal-100 text-charcoal-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-charcoal-200 transition-colors cursor-pointer">
              Last year <ChevronRight className="w-3 h-3 rotate-90" />
            </button>
          </div>
          <div className="h-24">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#53B4F0" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#53B4F0" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#53B4F0"
                strokeWidth="2"
                points={points}
                vectorEffect="non-scaling-stroke"
              />
              <polygon
                fill="url(#chartGradient)"
                points={`0,100 ${points} 100,100`}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestsList({ tickets, tenants }: { tickets: MaintenanceTicket[], tenants: Tenant[] }) {
  const getTenantName = (id: string | null) => {
    if (!id) return "Unknown";
    const tenant = tenants.find(t => t.id === id);
    return tenant ? `${tenant.first_name} ${tenant.last_name}` : "Unknown";
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Requests</h3>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
        <Link href="/maintenance" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
          View all →
        </Link>
      </div>
      
      <div className="space-y-3">
        {tickets.length > 0 ? tickets.slice(0, 5).map((ticket) => (
          <div 
            key={ticket.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-charcoal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                {getTenantName(ticket.tenant_id).charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{getTenantName(ticket.tenant_id)}</p>
                <p className="text-xs text-slate-500">{ticket.issue_category || 'General'}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusStyles[ticket.status as keyof typeof statusStyles] || statusStyles.new}`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
        )) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">No active requests</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingUnits({ properties }: { properties: Property[] }) {
  const upcoming = properties.filter(p => p.status === 'available').slice(0, 2);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Upcoming units</h3>
        <button className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-slate-200 transition-colors">
          Next 6 months <ChevronRight className="w-3 h-3 rotate-90" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {upcoming.length > 0 ? upcoming.map((unit) => (
          <div 
            key={unit.id}
            className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
          >
            <div className="h-20 bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80"
                alt={unit.address}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 truncate">{unit.address}</span>
                <span className="text-sm font-bold text-slate-900">R{unit.monthly_rerent?.toLocaleString()}/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{unit.suburb}, {unit.city}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-400">No available units at the moment</p>
            <Link href="/properties/new" className="text-xs text-lime-600 font-medium hover:text-lime-700 mt-2 inline-block">
              + Add new property
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isDemoMode } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (isDemoMode) {
        setProperties(mockProperties);
        setTenants(mockTenants);
        setTickets(mockMaintenanceRequests);
        setLoading(false);
        return;
      }

      try {
        const [propRes, tenantRes, ticketRes] = await Promise.all([
          supabase.from('properties').select('*').order('created_at', { ascending: false }),
          supabase.from('tenants').select('*').order('created_at', { ascending: false }),
          supabase.from('maintenance_tickets').select('*').order('created_at', { ascending: false })
        ]);

        if (propRes.data) setProperties(propRes.data as Property[]);
        if (tenantRes.data) setTenants(tenantRes.data as Tenant[]);
        if (ticketRes.data) setTickets(ticketRes.data as MaintenanceTicket[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [isDemoMode]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-charcoal-200 rounded animate-pulse"></div>
            <div className="h-4 w-56 bg-charcoal-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <PaymentsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertySpotlightSkeleton />
          </div>
          <div className="lg:col-span-1">
            <RequestsListSkeleton />
          </div>
        </div>
        <UpcomingUnitsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! You have {properties.length} properties under management.</p>
        </div>
      </div>

      <PaymentsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropertySpotlight properties={properties} tenants={tenants} />
        </div>
        <div className="lg:col-span-1">
          <RequestsList tickets={tickets} tenants={tenants} />
        </div>
      </div>

      <UpcomingUnits properties={properties} />
    </div>
  );
}
