'use client';

import { useState } from 'react';
import { 
  Wrench, Plus, Clock, CheckCircle, AlertTriangle, DollarSign, 
  Calendar, User, ChevronRight, MoreVertical, Search,
  Filter, Home, Lightbulb, Droplets, Thermometer
} from 'lucide-react';
import { Card } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

interface MaintenanceRequest {
  id: string;
  property: string;
  issue: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  vendor?: string;
  notes?: string;
}

const initialRequests: MaintenanceRequest[] = [
  {
    id: '1',
    property: '14 Oak Lane, Sandton',
    issue: 'Geyser replacement needed',
    category: 'plumbing',
    priority: 'urgent',
    status: 'in_progress',
    reportedDate: '2026-04-05',
    scheduledDate: '2026-04-10',
    estimatedCost: 15000,
    vendor: 'PlumbPro SA',
  },
  {
    id: '2',
    property: '8 Maple Ave, Cape Town',
    issue: 'Aircon not cooling',
    category: 'hvac',
    priority: 'high',
    status: 'pending',
    reportedDate: '2026-04-07',
    estimatedCost: 3500,
  },
  {
    id: '3',
    property: '25 Pine Street, Durban',
    issue: 'Broken gate lock',
    category: 'other',
    priority: 'low',
    status: 'completed',
    reportedDate: '2026-03-20',
    scheduledDate: '2026-03-25',
    completedDate: '2026-03-25',
    estimatedCost: 800,
    actualCost: 650,
  },
];

const categoryIcons = {
  plumbing: Droplets,
  electrical: Lightbulb,
  hvac: Thermometer,
  appliance: Home,
  structural: Home,
  pest: AlertTriangle,
  other: Wrench,
};

const priorityColors = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function MaintenanceTracker() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (search && !req.issue.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalValue: requests.reduce((sum, r) => sum + (r.actualCost || r.estimatedCost), 0),
  };

  const getCategoryIcon = (category: MaintenanceRequest['category']) => {
    const Icon = categoryIcons[category];
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.pending}</p>
              <p className="text-xs text-stone-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.inProgress}</p>
              <p className="text-xs text-stone-500">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.completed}</p>
              <p className="text-xs text-stone-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-stone-500">Total Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors capitalize",
                  filter === status
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </Card>

      {/* Request List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-stone-100">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No maintenance requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const Icon = categoryIcons[request.category];
              return (
                <div key={request.id} className="p-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        request.category === 'plumbing' && 'bg-blue-100 text-blue-600',
                        request.category === 'electrical' && 'bg-yellow-100 text-yellow-600',
                        request.category === 'hvac' && 'bg-cyan-100 text-cyan-600',
                        request.category === 'appliance' && 'bg-purple-100 text-purple-600',
                        request.category === 'other' && 'bg-stone-100 text-stone-600'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{request.issue}</p>
                        <p className="text-sm text-stone-500">{request.property}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {request.reportedDate}
                          </span>
                          {request.vendor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {request.vendor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full border capitalize",
                          priorityColors[request.priority]
                        )}>
                          {request.priority}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full capitalize",
                          request.status === 'completed' && "bg-green-100 text-green-700",
                          request.status === 'in_progress' && "bg-blue-100 text-blue-700",
                          request.status === 'pending' && "bg-stone-100 text-stone-700"
                        )}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">
                        {formatCurrency(request.actualCost || request.estimatedCost)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-stone-400 ml-auto mt-2" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

export default MaintenanceTracker;