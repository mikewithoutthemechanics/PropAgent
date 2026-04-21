import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tools': 'AI Tools',
  '/properties': 'Properties',
  '/properties/[id]': 'Property Details',
  '/leads': 'Leads',
  '/syndication': 'Syndication',
  '/rent-ai': 'Rent AI',
  '/calendar': 'Calendar',
  '/valuations': 'Valuations',
  '/matching': 'Tenant Match',
  '/escrow': 'Escrow',
  '/documents': 'Documents',
  '/rankings': 'Rankings',
  '/agents': 'Agents',
  '/tenants': 'Tenants',
  '/maintenance': 'Maintenance',
  '/financials': 'Financials',
  '/chat': 'Messages',
  '/notifications': 'Notifications',
  '/pricing': 'Pricing',
  '/settings': 'Settings',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  
  const items: BreadcrumbItem[] = pathname
    .split('/')
    .filter(Boolean)
    .reduce((acc, part, index, arr) => {
      const path = '/' + arr.slice(0, index + 1).join('/');
      const label = routeLabels[path] || (part.charAt(0).toUpperCase() + part.slice(1));
      acc.push({ label, href: path });
      return acc;
    }, [] as BreadcrumbItem[]);

  if (items.length <= 1) return null;

  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link href={item.href!} className="text-gray-500 hover:text-gray-700">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}