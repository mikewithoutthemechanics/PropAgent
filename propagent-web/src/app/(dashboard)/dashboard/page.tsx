'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  Home, Users, Wrench, DollarSign, TrendingUp, Eye, 
  MessageSquare, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { samplePropertyStats, sampleRecentInquiries, sampleProperties } from '@/lib/sample-data';
import { Card, Button, Badge } from '@/components/ui';
import { formatCurrency, cn, getStatusBadgeStyles, getInquiryStatusStyles } from '@/lib/utils';
import Link from 'next/link';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.2 + 0.05
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 160, 102, ${p.alpha})`;
        ctx.fill();
      });
      
      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none opacity-40"
    />
  );
};

const FloatingElement = ({ delay, duration, className }: { delay: number; duration: number; className?: string }) => (
  <div 
    className={`absolute animate-float ${className}`}
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const GlassCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn(
      "relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-700",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      className
    )}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  href?: string;
  delay?: number;
}

function StatCard({ title, value, change, changeLabel, icon, color, href, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const glassColorStyles = {
    blue: {
      border: "border-blue-500/20",
      gradient: "from-blue-500/20 via-blue-600/10 to-transparent",
      icon: "from-blue-500 to-blue-600",
      glow: "hover:shadow-blue-500/20"
    },
    green: {
      border: "border-emerald-500/20",
      gradient: "from-emerald-500/20 via-emerald-600/10 to-transparent",
      icon: "from-emerald-500 to-emerald-600",
      glow: "hover:shadow-emerald-500/20"
    },
    purple: {
      border: "border-violet-500/20",
      gradient: "from-violet-500/20 via-violet-600/10 to-transparent",
      icon: "from-violet-500 to-violet-600",
      glow: "hover:shadow-violet-500/20"
    },
    amber: {
      border: "border-amber-500/20",
      gradient: "from-amber-500/20 via-amber-600/10 to-transparent",
      icon: "from-amber-500 to-amber-600",
      glow: "hover:shadow-amber-500/20"
    },
    red: {
      border: "border-red-500/20",
      gradient: "from-red-500/20 via-red-600/10 to-transparent",
      icon: "from-red-500 to-red-600",
      glow: "hover:shadow-red-500/20"
    },
  };

  const style = glassColorStyles[color];

  const content = (
    <div 
      className={cn(
        "relative p-5 rounded-xl transition-all duration-500 cursor-pointer group",
        "backdrop-blur-xl bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80",
        style.border,
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        isHovered ? `${style.glow} shadow-xl` : "hover:shadow-lg",
        "hover:-translate-y-1"
      )}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${color === 'amber' ? 'rgba(251, 191, 36, 0.1)' : `rgba(59, 130, 246, 0.1)`}, transparent)`,
        }}
      />
      
      <div 
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
        style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color === 'amber' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(59, 130, 246, 0.15)'}, transparent 40%)` }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-2.5 rounded-xl bg-gradient-to-br text-white shadow-lg",
            style.icon
          )}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              change >= 0 
                ? "bg-emerald-500/20 text-emerald-400" 
                : "bg-red-500/20 text-red-400"
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
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</p>
          {changeLabel && (
            <p className="text-xs text-slate-500 mt-1">{changeLabel}</p>
          )}
        </div>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div 
          className="h-full rounded-full animate-pulse"
          style={{ 
            background: color === 'amber' 
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' 
              : color === 'green'
              ? 'linear-gradient(90deg, #10b981, #34d399, #10b981)'
              : color === 'blue'
              ? 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)'
              : color === 'purple'
              ? 'linear-gradient(90deg, #8b5cf6, #a78bfa, #8b5cf6)'
              : 'linear-gradient(90deg, #ef4444, #f87171, #ef4444)'
          }}
        />
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
  delay = 0
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
  variant?: 'default' | 'primary';
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link 
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        variant === 'primary' 
          ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5" 
          : "backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
      )}
      style={{
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered && variant === 'primary' 
          ? '0 10px 40px -10px rgba(245, 158, 11, 0.4)' 
          : 'none',
      }}
    >
      <div className={cn(
        "p-2.5 rounded-xl transition-all duration-300",
        variant === 'primary' ? "bg-white/20 text-white" : "bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-400"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn(
          "font-semibold text-sm",
          variant === 'primary' ? "text-white" : "text-slate-100"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-xs",
          variant === 'primary' ? "text-white/80" : "text-slate-400"
        )}>
          {description}
        </p>
      </div>
      {variant === 'primary' && (
        <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
      )}
    </Link>
  );
}

function RecentInquiryCard({ inquiry, delay = 0 }: { inquiry: typeof sampleRecentInquiries[0]; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl transition-all duration-300 cursor-pointer",
        "backdrop-blur-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15",
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
        isHovered ? "transform scale-[1.02]" : ""
      )}
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-amber-500/20">
        {inquiry.propertyImage ? (
          <img 
            src={inquiry.propertyImage} 
            alt={inquiry.propertyTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20">
            <Home className="w-5 h-5 text-amber-400" />
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-white/10 rounded-xl" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-100 text-sm truncate">{inquiry.inquirerName}</p>
          <Badge className={cn(getInquiryStatusStyles(inquiry.status), "text-xs")}>
            {inquiry.status.replace('_', ' ')}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{inquiry.propertyTitle}</p>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(inquiry.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function AnimatedProgressBar({ value, color = 'amber', delay = 0 }: { value: number; color?: 'amber' | 'blue' | 'green'; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay + 500);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    amber: 'from-amber-500 to-amber-400',
    blue: 'from-blue-500 to-blue-400',
    green: 'from-emerald-500 to-emerald-400',
  };

  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div 
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
          colorClasses[color]
        )}
        style={{ 
          width: isVisible ? `${value}%` : '0%',
          boxShadow: `0 0 20px ${color === 'amber' ? 'rgba(251, 191, 36, 0.5)' : color === 'blue' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`
        }}
      />
    </div>
  );
}

function StatMiniCard({ label, value, subtext, icon, color = 'amber', delay = 0 }: { 
  label: string; 
  value: string | number; 
  subtext: string;
  icon: React.ReactNode;
  color?: 'amber' | 'blue' | 'green' | 'purple';
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
    purple: 'from-violet-500/20 to-violet-600/10 text-violet-400',
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
      "backdrop-blur-xl bg-white/5 border border-white/5",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
        colorClasses[color]
      )}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{subtext}</p>
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
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <FloatingElement delay={0} duration={6} className="top-20 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
      <FloatingElement delay={2} duration={8} className="top-40 right-20 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl" />
      <FloatingElement delay={4} duration={7} className="bottom-20 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Dashboard
              <span className="inline-block ml-2 align-middle">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </span>
            </h1>
            <p className="text-slate-400 mt-1">
              Welcome back. Here&apos;s what&apos;s happening with your properties.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-slate-300">
              {new Date().toLocaleDateString('en-ZA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickActionCard
            title="Add Property"
            description="List a new property"
            icon={<Plus className="w-5 h-5" />}
            href="/properties/new"
            variant="primary"
            delay={100}
          />
          <QuickActionCard
            title="Properties"
            description="View listings"
            icon={<Home className="w-5 h-5" />}
            href="/properties"
            delay={200}
          />
          <QuickActionCard
            title="Tenants"
            description="View tenants"
            icon={<Users className="w-5 h-5" />}
            href="/tenants"
            delay={300}
          />
          <QuickActionCard
            title="Maintenance"
            description="Track requests"
            icon={<Wrench className="w-5 h-5" />}
            href="/maintenance"
            delay={400}
          />
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Listings"
              value={stats.totalListings}
              change={12}
              changeLabel="vs last month"
              icon={<Home className="w-5 h-5" />}
              color="blue"
              href="/properties"
              delay={200}
            />
            <StatCard
              title="Active Listings"
              value={stats.activeListings}
              change={8}
              icon={<Eye className="w-5 h-5" />}
              color="green"
              href="/properties"
              delay={300}
            />
            <StatCard
              title="Views This Week"
              value={stats.viewsThisWeek.toLocaleString()}
              change={24}
              icon={<TrendingUp className="w-5 h-5" />}
              color="purple"
              delay={400}
            />
            <StatCard
              title="New Inquiries"
              value={stats.inquiriesThisWeek}
              change={-5}
              icon={<MessageSquare className="w-5 h-5" />}
              color="amber"
              delay={500}
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Card */}
          <GlassCard delay={400} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">Monthly Revenue</h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8.5%
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(stats.monthlyRevenue)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Occupied</span>
                <span className="text-slate-200 font-medium">{stats.occupiedProperties} of {stats.totalProperties}</span>
              </div>
              <AnimatedProgressBar value={occupancyRate} color="amber" delay={500} />
              <p className="text-xs text-slate-500">{occupancyRate}% occupancy</p>
            </div>
          </GlassCard>

          {/* Pending Tasks */}
          <GlassCard delay={500} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100">Pending Tasks</h3>
              <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                {stats.pendingMaintenance} tasks
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Maintenance</p>
                  <p className="text-xs text-slate-400">{stats.pendingMaintenance} pending</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Payments</p>
                  <p className="text-xs text-slate-400">{stats.pendingPayments} invoices</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Leases</p>
                  <p className="text-xs text-slate-400">{stats.activeLeases} active</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Stats */}
          <GlassCard delay={600} className="space-y-4">
            <h3 className="font-semibold text-slate-100">Property Summary</h3>
            <div className="space-y-3">
              <StatMiniCard
                label="Sold"
                value={stats.soldListings}
                subtext="This month"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="green"
                delay={700}
              />
              <StatMiniCard
                label="Rented"
                value={stats.rentedListings}
                subtext="Current"
                icon={<Users className="w-5 h-5" />}
                color="blue"
                delay={800}
              />
              <StatMiniCard
                label="Avg Days"
                value={stats.averageDaysOnMarket}
                subtext="On market"
                icon={<Clock className="w-5 h-5" />}
                color="amber"
                delay={900}
              />
            </div>
          </GlassCard>
        </div>

        {/* Recent Inquiries & Properties */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard delay={700} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Recent Inquiries
              </h3>
              <Link href="/inquiries" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentInquiries.map((inquiry, index) => (
                <RecentInquiryCard key={inquiry.id} inquiry={inquiry} delay={800 + index * 100} />
              ))}
              {recentInquiries.length === 0 && (
                <p className="text-center text-slate-500 py-6 text-sm">No recent inquiries</p>
              )}
            </div>
          </GlassCard>

          <GlassCard delay={800} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                Recently Added
              </h3>
              <Link href="/properties" className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentProperties.map((property, index) => (
                <Link 
                  key={property.id}
                  href={`/properties/${property.slug}`}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 group"
                  style={{ 
                    animationDelay: `${900 + index * 100}ms`,
                    opacity: 0,
                    animation: 'fadeSlideIn 0.5s ease forwards',
                    animationDelay: `${900 + index * 100}ms`
                  }}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden ring-2 ring-amber-500/20 group-hover:ring-amber-400/40 transition-all">
                    {property.images[0] ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-amber-600/20">
                        <Home className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 text-sm truncate group-hover:text-amber-400 transition-colors">{property.title}</p>
                    <p className="text-xs text-slate-400">
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
                  <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {formatCurrency(property.pricing.price)}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}