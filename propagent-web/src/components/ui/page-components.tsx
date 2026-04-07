// Shared UI components for consistent page design
import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from './ui';

// Page Header Component
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  );
}

// Page Card Component
interface PageCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function PageCard({ children, className, title, action }: PageCardProps) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-2xl", className)}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// Stats Grid
interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const cols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return (
    <div className={cn("grid gap-4", cols[columns])}>
      {children}
    </div>
  );
}

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  color?: 'navy' | 'amber' | 'blue' | 'green' | 'rose';
}

const statColors = {
  navy: 'bg-slate-100 text-slate-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
};

export function StatCard({ label, value, change, icon, color = 'navy' }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", statColors[color])}>
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={cn(
          "mt-2 text-xs font-medium",
          change >= 0 ? "text-emerald-600" : "text-rose-600"
        )}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

// List Item
interface ListItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ListItem({ children, href, onClick, className }: ListItemProps) {
  const content = (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer",
      className
    )}>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }
  return content;
}

// Section Header
interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {action}
    </div>
  );
}

// Quick Action Button
interface QuickActionProps {
  icon: ReactNode;
  label: string;
  description?: string;
  href: string;
  variant?: 'default' | 'primary';
}

export function QuickAction({ icon, label, description, href, variant = 'default' }: QuickActionProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        variant === 'primary'
          ? "bg-navy-500 text-white border-navy-500 hover:bg-navy-600"
          : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        variant === 'primary' ? "bg-white/20" : "bg-slate-100"
      )}>
        {icon}
      </div>
      <div>
        <p className={cn("font-medium", variant === 'primary' ? "text-white" : "text-slate-900")}>{label}</p>
        {description && (
          <p className={cn("text-xs", variant === 'primary' ? "text-white/70" : "text-slate-500")}>{description}</p>
        )}
      </div>
    </Link>
  );
}
