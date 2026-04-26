'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn('premium-card p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="font-serif text-2xl font-semibold text-deep-charcoal mt-1">{value}</p>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', trend.value >= 0 ? 'text-warm-olive' : 'text-rich-terracotta')}>
              <span className="font-medium">{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              <span className="text-muted-light">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="w-11 h-11 bg-soft-beige rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-deep-bronze" />
        </div>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
}

export function ActivityItem({ icon: Icon, title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-soft-beige/50 rounded transition-minimal cursor-pointer">
      <div className="w-9 h-9 bg-soft-beige rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-deep-bronze" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-deep-charcoal">{title}</p>
        <p className="text-sm text-muted truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-light flex-shrink-0">{time}</span>
    </div>
  );
}