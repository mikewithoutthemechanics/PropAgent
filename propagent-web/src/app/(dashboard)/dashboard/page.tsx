'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle,
  Building2, Target, Wallet, FileText, Trophy,
  UserCheck, Sparkles, Bell, Search, ChevronRight
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
    navy: 'from-slate-700 to-slate-800 text-white',
    gold: 'from-amber-400 to-amber-600 text-slate-900',
    blue: 'from-blue-500 to-blue-600 text-white',
    green: 'from-emerald-500 to-emerald-600 text-white',
  };

  const glowColors = {
    navy: 'shadow-slate-500/20',
    gold: 'shadow-amber-500/30',
    blue: 'shadow-blue-500/30',
    green: 'shadow-emerald-500/30',
  };

  const bgStyle = colorStyles[color];
  const glow = glowColors[color];

  const content = (
    <div className="group relative overflow-hidden bg-gradient-to-br border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Subtle background effect */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className={cn("p-3 rounded-xl bg-gradient-to-br", bgStyle, "shadow-lg", glow)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
            change >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
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
      
      <div className="relative mt-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
        {changeLabel && (
          <p className="text-xs text-slate-500 mt-1">{changeLabel}</p>
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
        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 border",
        variant === 'primary' 
          ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" 
          : "bg-slate-800/50 border-slate-700 hover:border-amber-500/30 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/50"
      )}
    >
      <div className={cn(
        "p-3 rounded-xl transition-all duration-200",
        variant === 'primary' ? "bg-white/20 text-slate-900" : "bg-slate-700/50 text-amber-400"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={cn("text-sm font-semibold", variant === 'primary' ? "text-slate-900" : "text-slate-100")}>{title}</h4>
        <p className={cn("text-xs mt-0.5", variant === 'primary' ? "text-slate-800" : "text-slate-500")}>{description}</p>
      </div>
      <ChevronRight className={cn("w-5 h-5", variant === 'primary' ? "text-slate-900" : "text-slate-600 group-hover:text-amber-400 transition-colors")} />
    </Link>
  );
}

export default function DashboardPage() {
  const stats = samplePropertyStats;
  const inquiries = sampleRecentInquiries;
  const properties = sampleProperties;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            <FileText className="w-4 h-4" />
            Export
          </Button>
          <Link href="/properties/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          change={12}
          changeLabel="vs last month"
          icon={<Building2 className="w-5 h-5" />}
          color="navy"
          href="/properties"
        />
        <StatCard
          title="Active Tenants"
          value={stats.activeTenants}
          change={8}
          changeLabel="vs last month"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          href="/tenants"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          change={23}
          changeLabel="vs last month"
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          href="/financials"
        />
        <StatCard
          title="Pending Inquiries"
          value={stats.pendingInquiries}
          change={-5}
          changeLabel="vs last month"
          icon={<MessageSquare className="w-5 h-5" />}
          color="gold"
          href="/chat"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Add New Property"
          description="List a new property"
          icon={<Building2 className="w-5 h-5" />}
          href="/properties/new"
        />
        <QuickActionCard
          title="Review Inquiries"
          description="12 new messages"
          icon={<MessageSquare className="w-5 h-5" />}
          href="/chat"
        />
        <QuickActionCard
          title="Schedule Viewing"
          description="Calendar overview"
          icon={<Calendar className="w-5 h-5" />}
          href="/calendar"
        />
        <QuickActionCard
          title="Rent AI Assistant"
          description="Smart pricing help"
          icon={<Sparkles className="w-5 h-5" />}
          href="/rent-ai"
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Inquiries</h2>
              <Link href="/chat" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <Link 
                  key={inquiry.id}
                  href={`/chat/${inquiry.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-300 text-sm font-medium">
                    {inquiry.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white truncate">{inquiry.name}</h4>
                      <Badge variant={getInquiryStatusStyles(inquiry.status) as any}>{inquiry.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{inquiry.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{inquiry.date}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{inquiry.time}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Property Overview */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Properties</h2>
              <Link href="/properties" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                View all →
              </Link>
            </div>
            
            <div className="space-y-3">
              {properties.slice(0, 4).map((property) => (
                <Link 
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden">
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{property.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{property.address}</p>
                  </div>
                  <Badge>{property.status}</Badge>
                </Link>
              ))}
            </div>

            {/* Mini Stats */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-slate-800/50">
                  <p className="text-xl font-bold text-white">{stats.occupiedUnits}</p>
                  <p className="text-xs text-slate-500">Occupied</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-800/50">
                  <p className="text-xl font-bold text-amber-400">{stats.vacantUnits}</p>
                  <p className="text-xs text-slate-500">Vacant</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", text: "New tenant application", sub: "2 hours ago" },
              { icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10", text: "Rent payment received", sub: "4 hours ago" },
              { icon: Wrench, color: "text-amber-400", bg: "bg-amber-500/10", text: "Maintenance request", sub: "6 hours ago" },
              { icon: Building2, color: "text-slate-400", bg: "bg-slate-500/10", text: "Property listing updated", sub: "1 day ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", activity.bg)}>
                  <activity.icon className={cn("w-4 h-4", activity.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{activity.text}</p>
                  <p className="text-xs text-slate-500">{activity.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10", text: "Property viewing", sub: "Tomorrow, 10:00 AM" },
              { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", text: "Lease renewal", sub: "Feb 15, 2026" },
              { icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10", text: "Maintenance deadline", sub: "Feb 18, 2026" },
              { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", text: "Inspection scheduled", sub: "Feb 20, 2026" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", item.bg)}>
                  <item.icon className={cn("w-4 h-4", item.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{item.text}</p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
