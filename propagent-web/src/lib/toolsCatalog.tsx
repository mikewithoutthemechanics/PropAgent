import {
  Calculator,
  Home,
  BarChart3,
  Shield,
  TrendingUp,
  Wrench,
  DollarSign,
  Calendar,
  FileText,
  PenTool,
  type LucideIcon,
} from 'lucide-react';
import {
  BondCalculator,
  PropertyAnalytics,
  TenantScreening,
  MaintenanceTracker,
  FinancialReports,
  ValuationTool,
  MarketComparison,
  CalendarView,
  DocumentTemplates,
  ESignatures,
} from '@/components/tools';

export interface ToolCatalogEntry {
  slug: string;
  title: string;
  description: string;
  category: 'Valuation' | 'Finance' | 'Tenants' | 'Operations' | 'Documents';
  icon: LucideIcon;
  accent: string;
  render: () => React.ReactElement;
}

const sampleApplication = {
  id: 'sample-1',
  name: 'Thabo Mokoena',
  email: 'thabo.mokoena@example.co.za',
  phone: '+27 82 555 0199',
  appliedProperty: '12 Oak Avenue, Sandton',
  applicationDate: new Date().toISOString(),
  income: 68000,
  employmentStatus: 'employed' as const,
  creditScore: 712,
  hasPets: false,
  references: [
    {
      landlord: 'Sarah van der Merwe',
      landlordPhone: '+27 83 555 0100',
      response: 'good' as const,
    },
  ],
};

export const toolsCatalog: ToolCatalogEntry[] = [
  {
    slug: 'valuation',
    title: 'AI Property Valuation',
    description:
      'Automated valuation model (AVM) using comparable sales, neighbourhood factors and rental yields.',
    category: 'Valuation',
    icon: Home,
    accent: 'from-lime-400 to-emerald-500',
    render: () => <ValuationTool />,
  },
  {
    slug: 'bond-calculator',
    title: 'Bond Calculator',
    description:
      'Estimate monthly bond repayments, transfer costs and total interest for South African property purchases.',
    category: 'Finance',
    icon: Calculator,
    accent: 'from-cyan-400 to-blue-500',
    render: () => <BondCalculator />,
  },
  {
    slug: 'market-comparison',
    title: 'Market Comparison',
    description:
      'Side-by-side comparables for any property — price, beds, baths, size and suburb trends.',
    category: 'Valuation',
    icon: BarChart3,
    accent: 'from-fuchsia-400 to-pink-500',
    render: () => <MarketComparison />,
  },
  {
    slug: 'tenant-screening',
    title: 'Tenant Screening',
    description:
      'AI-scored affordability, credit, employment and reference checks with pass / conditional / decline recommendation.',
    category: 'Tenants',
    icon: Shield,
    accent: 'from-amber-400 to-orange-500',
    render: () => <TenantScreening application={sampleApplication} />,
  },
  {
    slug: 'property-analytics',
    title: 'Property Analytics',
    description:
      'Suburb-level median price, 12-month change, days on market and rental yield insights.',
    category: 'Valuation',
    icon: TrendingUp,
    accent: 'from-emerald-400 to-teal-500',
    render: () => <PropertyAnalytics suburb="Sandton" province="Gauteng" />,
  },
  {
    slug: 'maintenance-tracker',
    title: 'Maintenance Tracker',
    description:
      'Log, classify and assign maintenance tickets across your portfolio with cost tracking.',
    category: 'Operations',
    icon: Wrench,
    accent: 'from-rose-400 to-red-500',
    render: () => <MaintenanceTracker />,
  },
  {
    slug: 'financial-reports',
    title: 'Financial Reports',
    description:
      'Income, expenses, NOI and cash-flow summaries by month, quarter or year — ready to export.',
    category: 'Finance',
    icon: DollarSign,
    accent: 'from-lime-400 to-green-500',
    render: () => <FinancialReports period="month" />,
  },
  {
    slug: 'calendar',
    title: 'Smart Calendar',
    description:
      'Unified showings, inspections, viewings and maintenance appointments with conflict detection.',
    category: 'Operations',
    icon: Calendar,
    accent: 'from-indigo-400 to-violet-500',
    render: () => <CalendarView />,
  },
  {
    slug: 'document-templates',
    title: 'Document Templates',
    description:
      'Pre-filled SA lease, mandate, addendum, notice and checklist templates ready to send.',
    category: 'Documents',
    icon: FileText,
    accent: 'from-sky-400 to-blue-500',
    render: () => <DocumentTemplates />,
  },
  {
    slug: 'e-signatures',
    title: 'E-Signatures',
    description:
      'Send documents for signature, track parties, expiry dates and completion status.',
    category: 'Documents',
    icon: PenTool,
    accent: 'from-purple-400 to-fuchsia-500',
    render: () => <ESignatures />,
  },
];

export function getToolBySlug(slug: string): ToolCatalogEntry | undefined {
  return toolsCatalog.find((t) => t.slug === slug);
}
