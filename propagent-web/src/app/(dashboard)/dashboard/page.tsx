'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  Building2, Target, Wallet, FileText, Trophy,
  UserCheck, Sparkles, Bell, Search, ChevronRight, X
} from 'lucide-react';

const mockPaymentData = {
  rent: { value: 102054, change: 5 },
  additionalServices: { value: 28450, change: 12 },
  maintenance: { value: 12800, change: -3 },
  debt: { value: 4200, change: -15 },
};

const mockPropertySpotlight = {
  title: "Modern Residential Complex",
  image: "https://images.unsplash.com/photo-1545324418-cc1a3fa84830?w=800&q=80",
  stats: { residents: 1054, units: 512, vacant: 102, upcoming: 54 },
  priceHistory: [3200, 3350, 3280, 3420, 3500, 3450, 3600, 3580, 3720, 3800, 3750, 3900],
};

const mockRequests = [
  { id: 1, name: "Sarah Mitchell", unit: "Unit 204", status: "New", avatar: "S" },
  { id: 2, name: "James Wilson", unit: "Unit 512", status: "In Progress", avatar: "J" },
  { id: 3, name: "Maria Garcia", unit: "Unit 108", status: "Pending", avatar: "M" },
  { id: 4, name: "David Chen", unit: "Unit 356", status: "New", avatar: "D" },
  { id: 5, name: "Emma Thompson", unit: "Unit 421", status: "In Progress", avatar: "E" },
];

const mockUpcomingUnits = [
  { id: 1, unitNumber: "Unit 618", price: 2450, availableDate: "May 1, 2026", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80" },
  { id: 2, unitNumber: "Unit 302", price: 3200, availableDate: "June 15, 2026", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80" },
];

const statusStyles = {
  New: "bg-black text-white",
  "In Progress": "bg-[#D8F053] text-black",
  Pending: "bg-[#53B4F0] text-white",
};

function PaymentsOverview() {
  const payments = [
    { label: "Rent", ...mockPaymentData.rent, isPrimary: true },
    { label: "Additional services", ...mockPaymentData.additionalServices, isPrimary: false },
    { label: "Maintenance", ...mockPaymentData.maintenance, isPrimary: false },
    { label: "Debt", ...mockPaymentData.debt, isPrimary: false },
  ];

  return (
    <div className="bg-black rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-lg font-semibold">Payments</h2>
        <button className="bg-white/10 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-colors">
          This month <ChevronRight className="w-4 h-4 rotate-90" />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {payments.map((payment, index) => (
          <div
            key={payment.label}
            className={`${
              payment.isPrimary 
                ? "bg-[#D8F053]" 
                : "bg-[#1A1A1A]"
            } rounded-2xl p-5 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between">
              <span className={`text-sm font-medium ${payment.isPrimary ? "text-black/70" : "text-white/70"}`}>
                {payment.label}
              </span>
              <ArrowUpRight className={`w-4 h-4 ${payment.isPrimary ? "text-black/50" : "text-white/50"}`} />
            </div>
            <p className={`text-2xl font-bold mt-3 ${payment.isPrimary ? "text-black" : "text-white"}`}>
              ${payment.value.toLocaleString()}.00
            </p>
            <p className={`text-xs mt-2 ${payment.isPrimary ? "text-black/60" : "text-white/60"}`}>
              {payment.change >= 0 ? "+" : ""}{payment.change}% vs last month
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertySpotlight() {
  const maxPrice = Math.max(...mockPropertySpotlight.priceHistory);
  const minPrice = Math.min(...mockPropertySpotlight.priceHistory);
  const range = maxPrice - minPrice;
  
  const points = mockPropertySpotlight.priceHistory
    .map((price, i) => {
      const x = (i / (mockPropertySpotlight.priceHistory.length - 1)) * 100;
      const y = 100 - ((price - minPrice) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
      <div className="relative h-48 bg-slate-100">
        <img 
          src={mockPropertySpotlight.image} 
          alt={mockPropertySpotlight.title}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Close property spotlight">
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{mockPropertySpotlight.title}</h3>
          <ArrowUpRight className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4 py-4 border-y border-slate-100">
          {[
            { label: "Residents", value: mockPropertySpotlight.stats.residents },
            { label: "Units", value: mockPropertySpotlight.stats.units },
            { label: "Vacant", value: mockPropertySpotlight.stats.vacant },
            { label: "Upcoming", value: mockPropertySpotlight.stats.upcoming },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-900">Price Trend</h4>
            <button className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-slate-200 transition-colors">
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

function RequestsList() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Requests</h3>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
        <Link href="/requests" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
          View all →
        </Link>
      </div>
      
      <div className="space-y-3">
        {mockRequests.map((request) => (
          <div 
            key={request.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-charcoal-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                {request.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{request.name}</p>
                <p className="text-xs text-slate-500">{request.unit}</p>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusStyles[request.status as keyof typeof statusStyles]}`}>
              {request.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingUnits() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Upcoming units</h3>
        <button className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-slate-200 transition-colors">
          Next 6 months <ChevronRight className="w-3 h-3 rotate-90" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockUpcomingUnits.map((unit) => (
          <div 
            key={unit.id}
            className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
          >
            <div className="h-20 bg-slate-100">
              <img 
                src={unit.image} 
                alt={unit.unitNumber}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{unit.unitNumber}</span>
                <span className="text-sm font-bold text-slate-900">${unit.price}/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Available {unit.availableDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here&apos;s an overview of your properties.</p>
        </div>
      </div>

      {/* A. Payments Overview */}
      <PaymentsOverview />

      {/* B. Property Spotlight & C. Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropertySpotlight />
        </div>
        <div className="lg:col-span-1">
          <RequestsList />
        </div>
      </div>

      {/* D. Upcoming Units */}
      <UpcomingUnits />
    </div>
  );
}
