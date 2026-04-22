'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  Building2, Target, Wallet, FileText, Trophy,
  UserCheck, Sparkles, Bell, Search, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import {
  mockProperties,
  mockTenants,
  mockMaintenanceRequests,
  UIProperty,
  UITenant,
  UIMaintenanceRequest,
} from '@/lib/data';
import { useCollection } from '@/lib/persistence';
import { ProductTour, TourStep } from '@/components/onboarding/ProductTour';
import { useOnboardingState, setTourDone } from '@/lib/onboarding';

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'This is your dashboard',
    description:
      "At a glance — payments, properties, requests, and upcoming units. Everything streams live from your data.",
    placement: 'right',
  },
  {
    target: '[data-tour="payments"]',
    title: 'Payments overview',
    description:
      'Track rent, additional services, maintenance and debt in one card. Tap any tile to drill into the details.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tools"]',
    title: 'AI Tools',
    description:
      'Valuations, tenant screening, market comparisons and more — all powered by the same AI engine.',
    placement: 'right',
  },
  {
    target: '[data-tour="properties"]',
    title: 'Manage your properties',
    description:
      'Add listings, manage tenants, track occupancy and maintenance in one place.',
    placement: 'right',
  },
  {
    target: '[data-tour="leads"]',
    title: 'Capture & score leads',
    description:
      'Inbound leads from your syndicated listings land here and get auto-prioritized.',
    placement: 'right',
  },
  {
    target: '[data-tour="valuations"]',
    title: 'Instant property valuations',
    description:
      'Run AI-powered valuations in seconds to price listings or advise sellers with confidence.',
    placement: 'right',
  },
];

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
    <div data-tour="payments" className="bg-charcoal-900 rounded-2xl p-6">
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

function PropertySpotlight({ properties, tenants }: { properties: UIProperty[], tenants: UITenant[] }) {
  const spotlight = properties.length > 0 ? {
    title: properties[0].address,
    image: properties[0].imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa84830?w=800&q=80",
    stats: {
      residents: tenants.filter(t => t.propertyId === properties[0].id).length,
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

function RequestsList({ tickets, tenants }: { tickets: UIMaintenanceRequest[], tenants: UITenant[] }) {
  const getTenantName = (id: string | null) => {
    if (!id) return "Unassigned";
    const tenant = tenants.find(t => t.id === id);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unknown";
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
                {getTenantName(ticket.tenantId).charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{getTenantName(ticket.tenantId)}</p>
                <p className="text-xs text-slate-500">{ticket.category || 'General'}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusStyles[ticket.status as keyof typeof statusStyles] || statusStyles.new}`}>
              {ticket.status.replace('-', ' ').replace('_', ' ')}
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

function UpcomingUnits({ properties }: { properties: UIProperty[] }) {
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
                <span className="text-sm font-bold text-slate-900">R{unit.monthlyRent?.toLocaleString()}/mo</span>
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

function DashboardView() {
  // useAuth is kept for future use but we now source data from the persistent
  // client store so the dashboard works identically online or offline.
  useAuth();
  const { items: properties } = useCollection<UIProperty>('properties', mockProperties);
  const { items: tenants } = useCollection<UITenant>('tenants', mockTenants);
  const { items: tickets } = useCollection<UIMaintenanceRequest>('maintenance_requests', mockMaintenanceRequests);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hydrated: onboardingHydrated, tourComplete } = useOnboardingState();
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    // Wait one tick so hydration finishes before showing live data.
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);
  const loading = !mounted;

  // Snapshot the ?tour=1 query param to a primitive string once per render.
  // Using `searchParams` directly as a useEffect dep triggers unnecessary
  // re-runs because Next.js may return a new URLSearchParams instance on
  // every render, whereas the raw string compares stably.
  const tourParam = searchParams?.get('tour') ?? null;

  // Auto-open the tour when either:
  //   1. The URL carries ?tour=1 (sent after finishing /onboarding), or
  //   2. The user has never completed the tour on this device (first visit
  //      post-onboarding, e.g. after a refresh before finishing).
  useEffect(() => {
    if (!onboardingHydrated || loading) return;
    if (tourOpen) return;
    if (tourParam === '1') {
      setTourOpen(true);
      return;
    }
    if (!tourComplete) {
      setTourOpen(true);
    }
  }, [onboardingHydrated, loading, tourComplete, tourParam, tourOpen]);

  const handleTourClose = (finished: boolean) => {
    setTourOpen(false);
    if (finished) {
      setTourDone(true);
    }
    if (tourParam === '1') {
      router.replace('/dashboard');
    }
  };

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
    <div className="space-y-6 animate-fade-in" data-tour="dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! You have {properties.length} properties under management.</p>
        </div>
        {onboardingHydrated && tourComplete && !tourOpen && (
          <button
            type="button"
            onClick={() => setTourOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-charcoal-700 bg-white border border-charcoal-100 rounded-full px-4 py-2 hover:bg-charcoal-50 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-lime-500" />
            Replay tour
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Stats Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-charcoal-900 rounded-2xl p-6 h-full border border-charcoal-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-lime-400" />
                    <h2 className="text-white text-lg font-semibold">AI Matching Engine</h2>
                  </div>
                  <Link href="/matching" className="text-xs text-lime-400 hover:text-lime-300">View matches →</Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-charcoal-800 rounded-xl p-4 border border-charcoal-700/50">
                    <p className="text-xs text-charcoal-400 uppercase tracking-wider font-semibold">Total Stock</p>
                    <p className="text-2xl font-bold text-white mt-1">{properties.length}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-lime-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>Ready to match</span>
                    </div>
                  </div>
                  <div className="bg-charcoal-800 rounded-xl p-4 border border-charcoal-700/50">
                    <p className="text-xs text-charcoal-400 uppercase tracking-wider font-semibold">Buyer Requests</p>
                    <p className="text-2xl font-bold text-white mt-1">42</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-sky-400">
                      <Users className="w-3 h-3" />
                      <span>Active criteria</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-lime-400/10 rounded-xl border border-lime-400/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-lime-400">Active Matching Focus</span>
                    <span className="text-[10px] text-charcoal-400 uppercase">20% Variance enabled</span>
                  </div>
                  <div className="w-full h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
                    <div className="h-full bg-lime-400 w-[78%] rounded-full shadow-[0_0_8px_rgba(163,230,53,0.5)]"></div>
                  </div>
                  <p className="text-[10px] text-charcoal-400 mt-2">AI is currently scanning 248 possible combinations across your network.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 h-full border border-charcoal-100 shadow-sm flex flex-col">
                <div className="w-10 h-10 bg-lime-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-lime-600" />
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-1">New Match Alert</h3>
                <p className="text-xs text-charcoal-500 mb-4 flex-1">
                  A new property in Umhlanga matches 92% of your client "Sarah J" criteria.
                </p>
                <Link href="/matching" className="w-full py-2 bg-charcoal-900 text-white rounded-lg text-xs font-semibold text-center hover:bg-charcoal-800 transition-colors">
                  View Match
                </Link>
              </div>
            </div>
          </div>
          <PaymentsOverview />
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          <RequestsList tickets={tickets} tenants={tenants} />
          <div className="bg-sky-900 rounded-2xl p-5 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-semibold mb-2">Stock Recommendations</h3>
              <p className="text-xs text-sky-100 mb-4 opacity-80">
                Recommended stock for your existing buyers based on AI scoring.
              </p>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">94% Match</span>
                      <ArrowUpRight className="w-3 h-3 text-white/50" />
                    </div>
                    <p className="text-sm font-medium truncate">Modern Umhlanga Suite</p>
                    <p className="text-[10px] text-sky-100 opacity-60 mt-1">Recommended for: Buyer #829</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-400/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <PropertySpotlight properties={properties} tenants={tenants} />
        </div>
      </div>

      <UpcomingUnits properties={properties} />

      <ProductTour
        steps={TOUR_STEPS}
        open={tourOpen}
        onClose={handleTourClose}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardView />
    </Suspense>
  );
}
