// Standard Page Layout Template
// All dashboard pages should follow this structure for consistency

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button, Badge } from './index';

// Layout Containers
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}

export function PageGrid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return (
    <div className={cn("grid gap-4 md:gap-6", colClasses[cols])}>
      {children}
    </div>
  );
}

export function PageSection({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {children}
    </div>
  );
}

// Page Header with consistent styling
export function PageHeader({ 
  title, 
  subtitle, 
  actions,
  badge 
}: { 
  title: string; 
  subtitle?: string;
  actions?: ReactNode;
  badge?: { label: string; variant?: 'success' | 'warning' | 'info' | 'default' };
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-semibold text-slate-900">{title}</h1>
          {badge && (
            <Badge variant={badge.variant || 'default'}>{badge.label}</Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// Card with consistent styling
export function PageCard({ 
  children, 
  title, 
  subtitle,
  action,
  className 
}: { 
  children: ReactNode; 
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white border border-slate-200 rounded-2xl overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// Stat Card with consistent styling
export function StatCard({ 
  label, 
  value, 
  change, 
  icon, 
  color = 'slate' 
}: { 
  label: string; 
  value: string | number; 
  change?: number;
  icon?: ReactNode;
  color?: 'slate' | 'amber' | 'blue' | 'green' | 'rose';
}) {
  const colorStyles = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700' },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorStyles[color].bg, colorStyles[color].text)}>
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

// List Item Row
export function ListRow({ 
  children, 
  href, 
  onClick 
}: { 
  children: ReactNode; 
  href?: string; 
  onClick?: () => void;
}) {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {children}
    </a>
  );
}

// Empty State
export function PageEmpty({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon?: ReactNode; 
  title: string; 
  description?: string; 
  action?: ReactNode;
}) {
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

// Section with title
export function PageSectionTitle({ 
  title, 
  action 
}: { 
  title: string; 
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {action}
    </div>
  );
}

// Info Box
export function InfoBox({ 
  children, 
  variant = 'info' 
}: { 
  children: ReactNode; 
  variant?: 'info' | 'success' | 'warning';
}) {
  const variants = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
  };

  return (
    <div className={cn("p-4 rounded-xl border flex items-start gap-3", variants[variant])}>
      {children}
    </div>
  );
}

// Search and Filter Bar
export function SearchFilterBar({ 
  searchPlaceholder,
  onSearchChange,
  filterContent,
  actionContent
}: { 
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterContent?: ReactNode;
  actionContent?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {onSearchChange && (
        <input
          type="text"
          placeholder={searchPlaceholder || "Search..."}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-300"
        />
      )}
      <div className="flex items-center gap-3">
        {filterContent}
        {actionContent}
      </div>
    </div>
  );
}
