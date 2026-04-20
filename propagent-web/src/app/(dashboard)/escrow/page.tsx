'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, newId } from '@/lib/persistence';
import { Wallet, Clock, CheckCircle, AlertTriangle, XCircle, Search, ArrowRightLeft, Shield, DollarSign, TrendingUp, Activity, Plus, X } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { EscrowTransaction, EscrowStatus, sampleEscrowTransactions, calculateEscrow, canReleaseFunds } from '@/lib/escrow';
import { cn } from '@/lib/utils';

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-lime-400 via-sky-400 to-lime-400 p-6 mb-6">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-charcoal-900/20 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6 text-charcoal-900" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">Escrow Management</h1>
        </div>
        <p className="text-charcoal-600 text-sm">
          Secure commission holding & verified releases
        </p>
        
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-charcoal-200/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-charcoal-900 animate-pulse" />
            <span className="text-xs text-charcoal-600">System Status</span>
            <span className="text-xs font-medium text-charcoal-900 bg-charcoal-900/10 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-charcoal-900" />
            <span className="text-xs text-charcoal-600">Trust Score</span>
            <span className="text-xs font-medium text-charcoal-900">98.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children, className, hoverEffect = false }: { children: React.ReactNode; className?: string; hoverEffect?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border-2 border-charcoal-100",
        hoverEffect && "transition-all duration-300 ease-out",
        hoverEffect && isHovered && "transform -translate-y-1 shadow-lg border-lime-400 scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(isHovered)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, label, value, delay = 0 }: { 
  icon: React.ElementType; 
  iconBg: string; 
  label: string; 
  value: string | number; 
  delay?: number 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;
    
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [isVisible, value]);

  return (
    <GlassCard 
      className={cn(
        "p-4 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      hoverEffect
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">
            {typeof value === 'number' ? count : value}
          </p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function GlowingBadge({ children, variant, className }: { 
  children: React.ReactNode; 
  variant: 'warning' | 'info' | 'success' | 'destructive'; 
  className?: string;
}) {
  const glowColors = {
    warning: 'bg-lime-400/20 text-charcoal-900 border-lime-400/30',
    info: 'bg-sky-400/20 text-sky-900 border-sky-400/30',
    success: 'bg-lime-400/20 text-charcoal-900 border-lime-400/30',
    destructive: 'bg-rose-500/20 text-rose-600 border-rose-500/30',
  };
  
  return (
    <Badge 
      className={cn(
        "gap-1 border rounded-full px-3 py-1 text-xs font-medium",
        glowColors[variant],
        className
      )}
    >
      {children}
    </Badge>
  );
}

function AnimatedProgressBar({ progress, status }: { progress: number; status: EscrowStatus }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setTimeout(() => setWidth(progress), 100);
  }, [progress]);

  const colors = {
    pending_deposit: 'from-lime-400 to-sky-400',
    deposited: 'from-sky-400 to-cyan-400',
    in_verification: 'from-purple-500 to-pink-500',
    released: 'from-lime-500 to-green-500',
    disputed: 'from-red-500 to-rose-500',
    forfeited: 'from-charcoal-400 to-charcoal-500',
  };

  return (
    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
      <div 
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
          colors[status]
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
        active 
          ? "bg-lime-400 text-charcoal-900 shadow-lg shadow-lime-400/25" 
          : "text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-50"
      )}
    >
      {children}
    </button>
  );
}

export default function EscrowManagementPage() {
  const { items: escrowTransactions, add: addEscrowTransaction } = useCollection<EscrowTransaction>('escrow_transactions', sampleEscrowTransactions);
  const [filter, setFilter] = useState<'all' | EscrowStatus>('all');
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEscrow, setNewEscrow] = useState({
    property: '',
    price: '',
    agent1Name: '',
    agent2Name: '',
    commission: '',
    deposit: '',
    status: 'pending_deposit' as EscrowStatus,
  });
  
  // Add new escrow handler
  const handleAddEscrow = () => {
    if (!newEscrow.property || !newEscrow.price || !newEscrow.agent1Name || !newEscrow.agent2Name) return;
    
    const price = parseFloat(newEscrow.price);
    const comm = parseFloat(newEscrow.commission) || 6;
    const deposit = parseFloat(newEscrow.deposit) || 0;
    const totalCommission = price * (comm / 100);
    const share = totalCommission / 2;
    
    const newEscrowEntry: EscrowTransaction = {
      id: newId('escrow'),
      matchId: newId('match'),
      propertyId: newId('prop'),
      propertyTitle: newEscrow.property,
      agent1Id: `agent_${Date.now()}_1`,
      agent1Name: newEscrow.agent1Name,
      agent1Deposit: deposit,
      agent1DepositStatus: 'pending',
      agent1Share: share * 0.98 - 250,
      agent2Id: `agent_${Date.now()}_2`,
      agent2Name: newEscrow.agent2Name,
      agent2Deposit: deposit,
      agent2DepositStatus: 'pending',
      agent2Share: share * 0.98 - 250,
      propertyPrice: price,
      commissionPercent: comm,
      totalCommission,
      agreedSplit: 50,
      platformFeePercent: 1.5,
      escrowFee: 250,
      verificationMethod: 'lightstone',
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      status: newEscrow.status,
    };
    
    addEscrowTransaction(newEscrowEntry);
    setNewEscrow({ property: '', price: '', agent1Name: '', agent2Name: '', commission: '', deposit: '', status: 'pending_deposit' });
    setShowAddModal(false);
  };
  
  // Filter escrow
  const filteredEscrow = useMemo(() => {
    if (filter === 'all') return escrowTransactions;
    return escrowTransactions.filter(e => e.status === filter);
  }, [filter, escrowTransactions]);
  
  // Stats
  const stats = useMemo(() => {
    const total = escrowTransactions;
    const pending = total.filter(e => e.status === 'pending_deposit');
    const deposited = total.filter(e => e.status === 'deposited' || e.status === 'in_verification');
    const released = total.filter(e => e.status === 'released');
    const totalValue = total.reduce((sum, e) => sum + e.agent1Deposit + e.agent2Deposit, 0);
    
    return {
      pending: pending.length,
      active: deposited.length,
      released: released.length,
      totalValue,
    };
  }, [escrowTransactions]);
  
  // Status badge helper
  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case 'pending_deposit':
        return <GlowingBadge variant="warning"><Clock className="w-3 h-3" /> Awaiting Deposit</GlowingBadge>;
      case 'deposited':
        return <GlowingBadge variant="info"><Shield className="w-3 h-3" /> Deposited</GlowingBadge>;
      case 'in_verification':
        return <GlowingBadge variant="warning"><Search className="w-3 h-3" /> Verifying</GlowingBadge>;
      case 'released':
        return <GlowingBadge variant="success"><CheckCircle className="w-3 h-3" /> Released</GlowingBadge>;
      case 'disputed':
        return <GlowingBadge variant="destructive"><AlertTriangle className="w-3 h-3" /> Disputed</GlowingBadge>;
      case 'forfeited':
        return <GlowingBadge variant="destructive"><XCircle className="w-3 h-3" /> Forfeited</GlowingBadge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const selectedEscrowData = escrowTransactions.find(e => e.id === selectedEscrow);

  return (
    <div className="space-y-6 min-h-screen bg-white text-charcoal-900 p-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50% { box-shadow: 0 0 30px currentColor; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* Animated Gradient Header */}
      <AnimatedGradientHeader />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Clock} 
          iconBg="bg-lime-400/20" 
          label="Pending Deposit" 
          value={stats.pending}
          delay={0}
        />
        <StatCard 
          icon={Shield} 
          iconBg="bg-sky-400/20" 
          label="In Escrow" 
          value={stats.active}
          delay={100}
        />
        <StatCard 
          icon={CheckCircle} 
          iconBg="bg-lime-400/20" 
          label="Released" 
          value={stats.released}
          delay={200}
        />
        <StatCard 
          icon={DollarSign} 
          iconBg="bg-lime-400/20" 
          label="Total in Escrow" 
          value={`R${(stats.totalValue / 1000).toFixed(0)}k`}
          delay={300}
        />
      </div>

      {/* Filter Tabs & Add Button */}
      <GlassCard className="p-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterTab>
            <FilterTab active={filter === 'pending_deposit'} onClick={() => setFilter('pending_deposit')}>Pending</FilterTab>
            <FilterTab active={filter === 'in_verification'} onClick={() => setFilter('in_verification')}>Verifying</FilterTab>
            <FilterTab active={filter === 'released'} onClick={() => setFilter('released')}>Released</FilterTab>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 shadow-lg shadow-lime-400/25 flex items-center gap-2 rounded-full font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Escrow
          </Button>
        </div>
      </GlassCard>

      {/* Escrow List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100/50 border-b border-slate-200/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Agents</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredEscrow.map((escrow, index) => {
                  const progress = {
                    pending_deposit: 10,
                    deposited: 40,
                    in_verification: 70,
                    released: 100,
                    disputed: 50,
                    forfeited: 0,
                  }[escrow.status];

                  return (
                    <tr 
                      key={escrow.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:bg-charcoal-50/30 group",
                        selectedEscrow === escrow.id && "bg-charcoal-50/50"
                      )}
                      onClick={() => setSelectedEscrow(escrow.id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm group-hover:text-lime-600 transition-colors">{escrow.propertyTitle}</p>
                        <p className="text-xs text-slate-500">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <span className="group-hover:text-lime-600 transition-colors">{escrow.agent1Name.split(' ')[0]}</span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                          <span className="group-hover:text-lime-600 transition-colors">{escrow.agent2Name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          R{(escrow.agent1Deposit + escrow.agent2Deposit).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <AnimatedProgressBar progress={progress} status={escrow.status} />
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(escrow.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Detail Panel */}
        <GlassCard className="p-4">
          {selectedEscrowData ? (
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50">
                <div className="p-2 bg-lime-400/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-lime-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{selectedEscrowData.propertyTitle}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Property Price</span>
                  <span className="font-medium text-slate-900">R{selectedEscrowData.propertyPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Commission</span>
                  <span className="font-medium text-slate-900">R{selectedEscrowData.totalCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Agent 1 Share</span>
                  <span className="font-medium text-slate-900">R{selectedEscrowData.agent1Share.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Agent 2 Share</span>
                  <span className="font-medium text-slate-900">R{selectedEscrowData.agent2Share.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200/50 pt-3 flex justify-between text-sm">
                  <span className="text-slate-500">Platform Fee (1.5%)</span>
                  <span className="font-medium text-lime-600">
                    R{((selectedEscrowData.totalCommission * 0.5) * 0.015).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500">Escrow Progress</span>
                  <span className="text-lime-600 font-medium">
                    {selectedEscrowData.status === 'pending_deposit' && '10%'}
                    {selectedEscrowData.status === 'deposited' && '40%'}
                    {selectedEscrowData.status === 'in_verification' && '70%'}
                    {selectedEscrowData.status === 'released' && '100%'}
                  </span>
                </div>
                <AnimatedProgressBar 
                  progress={
                    selectedEscrowData.status === 'pending_deposit' ? 10 :
                    selectedEscrowData.status === 'deposited' ? 40 :
                    selectedEscrowData.status === 'in_verification' ? 70 :
                    selectedEscrowData.status === 'released' ? 100 : 0
                  } 
                  status={selectedEscrowData.status} 
                />
              </div>

              {/* Actions */}
              {selectedEscrowData.status === 'pending_deposit' && (
                <Button className="w-full bg-lime-400 text-charcoal-900 hover:bg-lime-500 shadow-lg shadow-lime-400/25 rounded-full font-medium">
                  <Wallet className="w-4 h-4 mr-2" />
                  Deposit Commission
                </Button>
              )}
              
              {selectedEscrowData.status === 'in_verification' && (
                <Button variant="outline" className="w-full border-charcoal-300 text-charcoal-600 hover:bg-charcoal-50 rounded-full">
                  <Search className="w-4 h-4 mr-2" />
                  Check Verification Status
                </Button>
              )}
              
              {canReleaseFunds(selectedEscrowData) && (
                <Button className="w-full bg-lime-400 text-charcoal-900 hover:bg-lime-500 shadow-lg shadow-lime-400/25 rounded-full font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Release Funds
                </Button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100/50 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-500">Select a transaction to view details</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Info Banner */}
      <GlassCard className="p-4 bg-lime-400/10 border-2 border-lime-400/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-lime-400/20 rounded-lg">
            <Shield className="w-5 h-5 text-charcoal-900" />
          </div>
          <div>
            <p className="font-medium text-charcoal-900">Secure Escrow System</p>
            <p className="text-sm text-charcoal-600 mt-1">
              All funds are held in our Business Trust Account. After deal verification via Lightstone/Windeed API,
              funds are released minus 1.5% platform fee + R250 escrow charge. Off-app closures result in forfeited deposits.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Add Escrow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-charcoal-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border-2 border-charcoal-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-charcoal-900">Add New Escrow</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-charcoal-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-charcoal-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Property Address</label>
                <input 
                  type="text" 
                  value={newEscrow.property}
                  onChange={(e) => setNewEscrow({...newEscrow, property: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  placeholder="123 Ocean View, Umhlanga"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Property Price (ZAR)</label>
                  <input 
                    type="number" 
                    value={newEscrow.price}
                    onChange={(e) => setNewEscrow({...newEscrow, price: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="2500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Commission %</label>
                  <input 
                    type="number" 
                    value={newEscrow.commission}
                    onChange={(e) => setNewEscrow({...newEscrow, commission: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="6"
                    defaultValue="6"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Agent 1 Name</label>
                  <input 
                    type="text" 
                    value={newEscrow.agent1Name}
                    onChange={(e) => setNewEscrow({...newEscrow, agent1Name: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Agent 2 Name</label>
                  <input 
                    type="text" 
                    value={newEscrow.agent2Name}
                    onChange={(e) => setNewEscrow({...newEscrow, agent2Name: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Deposit Amount (ZAR)</label>
                  <input 
                    type="number" 
                    value={newEscrow.deposit}
                    onChange={(e) => setNewEscrow({...newEscrow, deposit: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Status</label>
                  <select 
                    value={newEscrow.status}
                    onChange={(e) => setNewEscrow({...newEscrow, status: e.target.value as EscrowStatus})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 cursor-pointer"
                  >
                    <option value="pending_deposit">Pending Deposit</option>
                    <option value="deposited">Deposited</option>
                    <option value="in_verification">In Verification</option>
                    <option value="released">Released</option>
                    <option value="disputed">Disputed</option>
                    <option value="forfeited">Forfeited</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm hover:bg-charcoal-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEscrow}
                className="px-6 py-2.5 bg-lime-400 rounded-lg text-charcoal-900 text-sm font-medium hover:shadow-lg hover:shadow-lime-400/25 transition-all cursor-pointer rounded-full"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Add Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}