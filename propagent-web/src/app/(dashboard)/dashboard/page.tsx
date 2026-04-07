'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  Building2, Target, Wallet, FileText, Trophy,
  UserCheck, Sparkles, Bell
} from 'lucide-react';
import { samplePropertyStats, sampleRecentInquiries, sampleProperties } from '@/lib/sample-data';
import { Card, Button, Badge } from '@/components/ui';
import { formatCurrency, cn, getStatusBadgeStyles, getInquiryStatusStyles } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'navy' | 'gold' | 'blue' | 'green';
  href?: string;
}

function StatCard({ title, value, change, changeLabel, icon, color, href }: StatCardProps) {
  const colorStyles = {
    navy: 'bg-navy-500 text-white',
    gold: 'bg-gold-500 text-navy-700',
    blue: 'bg-blue-500 text-white',
    green: 'bg-gold-500 text-white',
  };

  const bgStyle = colorStyles[color];
  const isDarkBg = color === 'navy' || color === 'blue' || color === 'green';

  const content = (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-gold-200/50 transition-all duration-200 group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", bgStyle)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            change >= 0 ? "bg-gold-50 text-gold-700" : "bg-red-50 text-red-700"
          )}>
            {change >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
        {changeLabel && (
          <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function QuickActionCard({ 
  title, 
  description, 
  icon, 
  href,
  variant = 'default',
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
  variant?: 'default' | 'primary';
}) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 border",
        variant === 'primary' 
          ? "bg-navy-500 border-navy-500 hover:bg-navy-600 hover:border-navy-600 text-white" 
          : "bg-white border-slate-200 hover:border-gold-300 hover:shadow-md"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-lg transition-all duration-200",
        variant === 'primary' ? "bg-white/20 text-white" : "bg-slate-50 text-navy-500"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn(
          "font-semibold text-sm",
          variant === 'primary' ? "text-white" : "text-slate-900"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-xs",
          variant === 'primary' ? "text-white/80" : "text-slate-500"
        )}>
          {description}
        </p>
      </div>
      {variant === 'primary' && (
        <Sparkles className="w-4 h-4 text-gold-400" />
      )}
    </Link>
  );
}

function RecentInquiryCard({ inquiry }: { inquiry: typeof sampleRecentInquiries[0] }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
        {inquiry.propertyImage ? (
          <img 
            src={inquiry.propertyImage} 
            alt={inquiry.propertyTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-slate-900 text-sm truncate">{inquiry.inquirerName}</p>
          <Badge className={cn(getInquiryStatusStyles(inquiry.status), "text-xs")}>
            {inquiry.status.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{inquiry.propertyTitle}</p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(inquiry.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function StatMiniCard({ label, value, subtext, icon, color = 'navy' }: { 
  label: string; 
  value: string | number; 
  subtext: string;
  icon: React.ReactNode;
  color?: 'navy' | 'gold' | 'blue' | 'green';
}) {
  const colorClasses = {
    navy: 'bg-navy-50 text-navy-600',
    gold: 'bg-gold-50 text-gold-700',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-gold-50 text-gold-600',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClasses[color])}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const stats = samplePropertyStats;
  const recentInquiries = sampleRecentInquiries.slice(0, 5);
  const recentProperties = sampleProperties.slice(0, 3);

  const occupancyRate = Math.round((stats.occupiedProperties / stats.totalProperties) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
              Dashboard
              <span className="inline-block ml-1">
                <Sparkles className="w-5 h-5 text-gold-500" />
              </span>
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back. Here&apos;s what&apos;s happening with your properties.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-gold-500" />
            <span className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-ZA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionCard
            title="Add Property"
            description="List a new property"
            icon={<Plus className="w-5 h-5" />}
            href="/properties/new"
            variant="primary"
          />
          <QuickActionCard
            title="Properties"
            description="View listings"
            icon={<Building2 className="w-5 h-5" />}
            href="/properties"
          />
          <QuickActionCard
            title="Tenants"
            description="View tenants"
            icon={<Users className="w-5 h-5" />}
            href="/tenants"
          />
          <QuickActionCard
            title="Maintenance"
            description="Track requests"
            icon={<Wrench className="w-5 h-5" />}
            href="/maintenance"
          />
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <TrendingUp className="w-4 h-4" />
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Listings"
              value={stats.totalListings}
              change={12}
              changeLabel="vs last month"
              icon={<Home className="w-5 h-5" />}
              color="navy"
              href="/properties"
            />
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              change={8}
              icon={<Eye className="w-5 h-5" />}
              color="blue"
              href="/properties"
            />
            <StatCard
              title="Views This Week"
              value={stats.viewsThisWeek.toLocaleString()}
              change={24}
              icon={<TrendingUp className="w-5 h-5" />}
              color="gold"
            />
            <StatCard
              title="New Inquiries"
              value={stats.inquiriesThisWeek}
              change={-5}
              icon={<MessageSquare className="w-5 h-5" />}
              color="green"
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Monthly Revenue</h3>
              <span className="text-xs text-gold-600 bg-gold-50 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.5%
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(stats.monthlyRevenue)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Occupied</span>
                <span className="text-slate-700 font-medium">{stats.occupiedProperties} of {stats.totalProperties}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{occupancyRate}% occupancy</p>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Pending Tasks</h3>
              <Badge variant="outline" className="border-navy-200 text-navy-600 bg-navy-50 text-xs">
                {stats.pendingMaintenance} tasks
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Maintenance</p>
                  <p className="text-xs text-slate-500">{stats.pendingMaintenance} pending</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Payments</p>
                  <p className="text-xs text-slate-500">{stats.pendingPayments} invoices</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gold-50 border border-gold-100">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-gold-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Leases</p>
                  <p className="text-xs text-slate-500">{stats.activeLeases} active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-900">Property Summary</h3>
            <div className="space-y-3">
              <StatMiniCard
                label="Sold"
                value={stats.soldListings}
                subtext="This month"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="green"
              />
              <StatMiniCard
                label="Rented"
                value={stats.rentedListings}
                subtext="Current"
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <StatMiniCard
                label="Avg Days"
                value={stats.averageDaysOnMarket}
                subtext="On market"
                icon={<Clock className="w-5 h-5" />}
                color="gold"
              />
            </div>
          </div>
        </div>

        {/* Recent Inquiries & Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-navy-500" />
                Recent Inquiries
              </h3>
              <Link href="/leads" className="text-xs text-navy-600 hover:text-navy-700 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-1">
              {recentInquiries.map((inquiry) => (
                <RecentInquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
              {recentInquiries.length === 0 && (
                <p className="text-center text-slate-400 py-6 text-sm">No recent inquiries</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-navy-500" />
                Recently Added
              </h3>
              <Link href="/properties" className="text-xs text-navy-600 hover:text-navy-700 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentProperties.map((property) => (
                <Link 
                  key={property.id}
                  href={`/properties/${property.slug}`}
                  className="flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 group"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    {property.images[0] ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate group-hover:text-navy-600 transition-colors">{property.title}</p>
                    <p className="text-xs text-slate-500">
                      {property.location.suburb}, {property.location.city}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        getStatusBadgeStyles(property.status)
                      )}>
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-slate-900 group-hover:text-navy-600 transition-colors">
                    {formatCurrency(property.pricing.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}