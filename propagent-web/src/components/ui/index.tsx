import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReactNode } from 'react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("premium-card p-5", className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4 pb-3 border-b border-warm-gray/50", className)}>
      <div>
        <h3 className="font-serif text-lg font-semibold text-deep-charcoal">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

const badgeStyles = {
  default: "bg-soft-beige text-deep-charcoal",
  success: "bg-[#E8EDE5] text-[#4A5540]",
  warning: "bg-[#F5F0E6] text-[#6B5C40]",
  danger: "bg-[#F5EDE9] text-[#704030]",
  info: "bg-[#EDE8E3] text-[#5A4A3A]",
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex px-2.5 py-1 rounded text-xs font-medium",
      badgeStyles[variant],
      className
    )}>
      {children}
    </span>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const buttonStyles = {
  primary: "bg-deep-bronze text-white hover:bg-[#7A6548] border-deep-bronze",
  secondary: "bg-warm-white text-deep-charcoal border-warm-gray hover:border-subtle-taupe hover:bg-soft-beige",
  ghost: "bg-transparent text-deep-charcoal hover:bg-soft-beige",
  outline: "bg-white text-stone-700 border-stone-200 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50",
};

const buttonSizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded border transition-minimal",
        buttonStyles[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-deep-charcoal">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2 bg-warm-white border border-warm-gray rounded text-deep-charcoal placeholder:text-muted-light text-sm",
          "focus:outline-none focus:border-deep-bronze focus:ring-1 focus:ring-deep-bronze/20",
          "transition-minimal",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-deep-charcoal">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-3 py-2 bg-warm-white border border-warm-gray rounded text-deep-charcoal text-sm",
          "focus:outline-none focus:border-deep-bronze focus:ring-1 focus:ring-deep-bronze/20",
          "transition-minimal",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-soft-beige/50">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-warm-gray/50">
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("hover:bg-soft-beige/30 transition-minimal", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 text-sm text-deep-charcoal", className)}>
      {children}
    </td>
  );
}

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  className?: string;
}

export function Avatar({ src, alt, initials, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("w-10 h-10 rounded object-cover", className)}
      />
    );
  }
  
  return (
    <div className={cn(
      "w-10 h-10 rounded bg-deep-bronze text-white flex items-center justify-center text-sm font-medium",
      className
    )}>
      {initials || "?"}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 bg-soft-beige rounded-full flex items-center justify-center text-muted mb-4">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-medium text-deep-charcoal mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-soft-beige rounded", className)} />
  );
}