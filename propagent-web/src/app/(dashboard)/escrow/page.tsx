'use client';

import { useState, useMemo, useEffect } from 'react';
import { Wallet, Clock, CheckCircle, AlertTriangle, XCircle, Search, ArrowRightLeft, Shield, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { EscrowTransaction, sampleEscrowTransactions, calculateEscrow, canReleaseFunds } from '@/lib/escrow';
import { cn } from '@/lib/utils';

function AnimatedGradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 mb-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse-slow" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(to right, #f59e0b 1px, transparent 1px),
                         linear-gradient(to bottom, #f59e0b 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/20 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Escrow Management</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Secure commission holding & verified releases
        </p>
        
        {/* Animated metrics bar */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">System Status</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Trust Score</span>
            <span className="text-xs font-medium text-amber-400">98.5%</span>
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
        "relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        hoverEffect && "transition-all duration-300 ease-out",
        hoverEffect && isHovered && "transform -translate-y-1 shadow-2xl shadow-amber-500/20 border-amber-500/30 scale-[1.02]",
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
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? count : value}
          </p>
          <p className="text-xs text-slate-400">{label}</p>
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
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    destructive: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]',
  };
  
  return (
    <Badge 
      className={cn(
        "gap-1 border backdrop-blur-sm animate-glow",
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
    pending_deposit: 'from-amber-500 to-yellow-500',
    deposited: 'from-blue-500 to-cyan-500',
    in_verification: 'from-purple-500 to-pink-500',
    released: 'from-emerald-500 to-green-500',
    disputed: 'from-red-500 to-orange-500',
    forfeited: 'from-slate-500 to-slate-600',
  };

  return (
    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
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
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
        active 
          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/25" 
          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
      )}
    >
      {children}
    </button>
  );
}

export default function EscrowManagementPage() {
  const [filter, setFilter] = useState<'all' | EscrowStatus>('all');
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  
  // Filter escrow
  const filteredEscrow = useMemo(() => {
    if (filter === 'all') return sampleEscrowTransactions;
    return sampleEscrowTransactions.filter(e => e.status === filter);
  }, [filter]);
  
  // Stats
  const stats = useMemo(() => {
    const total = sampleEscrowTransactions;
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
  }, []);
  
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedEscrowData = sampleEscrowTransactions.find(e => e.id === selectedEscrow);

  return (
    <div className="space-y-6 min-h-screen bg-slate-900 p-6">
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
          iconBg="bg-amber-500/20" 
          label="Pending Deposit" 
          value={stats.pending}
          delay={0}
        />
        <StatCard 
          icon={Shield} 
          iconBg="bg-blue-500/20" 
          label="In Escrow" 
          value={stats.active}
          delay={100}
        />
        <StatCard 
          icon={CheckCircle} 
          iconBg="bg-emerald-500/20" 
          label="Released" 
          value={stats.released}
          delay={200}
        />
        <StatCard 
          icon={DollarSign} 
          iconBg="bg-purple-500/20" 
          label="Total in Escrow" 
          value={`R${(stats.totalValue / 1000).toFixed(0)}k`}
          delay={300}
        />
      </div>

      {/* Filter Tabs */}
      <GlassCard className="p-2">
        <div className="flex gap-2 flex-wrap">
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterTab>
          <FilterTab active={filter === 'pending_deposit'} onClick={() => setFilter('pending_deposit')}>Pending</FilterTab>
          <FilterTab active={filter === 'in_verification'} onClick={() => setFilter('in_verification')}>Verifying</FilterTab>
          <FilterTab active={filter === 'released'} onClick={() => setFilter('released')}>Released</FilterTab>
        </div>
      </GlassCard>

      {/* Escrow List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Agents</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
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
                        "cursor-pointer transition-all duration-300 hover:bg-slate-700/30 group",
                        selectedEscrow === escrow.id && "bg-slate-700/50"
                      )}
                      onClick={() => setSelectedEscrow(escrow.id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white text-sm group-hover:text-amber-400 transition-colors">{escrow.propertyTitle}</p>
                        <p className="text-xs text-slate-500">{new Date(escrow.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-slate-300">
                          <span className="group-hover:text-amber-400 transition-colors">{escrow.agent1Name.split(' ')[0]}</span>
                          <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                          <span className="group-hover:text-amber-400 transition-colors">{escrow.agent2Name.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
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
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700/50">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-white">{selectedEscrowData.propertyTitle}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Property Price</span>
                  <span className="font-medium text-white">R{selectedEscrowData.propertyPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Commission</span>
                  <span className="font-medium text-white">R{selectedEscrowData.totalCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Agent 1 Share</span>
                  <span className="font-medium text-white">R{selectedEscrowData.agent1Share.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Agent 2 Share</span>
                  <span className="font-medium text-white">R{selectedEscrowData.agent2Share.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-700/50 pt-3 flex justify-between text-sm">
                  <span className="text-slate-400">Platform Fee (1.5%)</span>
                  <span className="font-medium text-amber-400">
                    R{((selectedEscrowData.totalCommission * 0.5) * 0.015).toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Escrow Progress</span>
                  <span className="text-amber-400 font-medium">
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
                <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/25">
                  <Wallet className="w-4 h-4 mr-2" />
                  Deposit Commission
                </Button>
              )}
              
              {selectedEscrowData.status === 'in_verification' && (
                <Button className="w-full" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Search className="w-4 h-4 mr-2" />
                  Check Verification Status
                </Button>
              )}
              
              {canReleaseFunds(selectedEscrowData) && (
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-400 hover:to-green-400 shadow-lg shadow-emerald-500/25">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Release Funds
                </Button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-500">Select a transaction to view details</p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Info Banner */}
      <GlassCard className="p-4 bg-emerald-900/20 border-emerald-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg backdrop-blur-sm">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-white">Secure Escrow System</p>
            <p className="text-sm text-slate-400 mt-1">
              All funds are held in our Business Trust Account. After deal verification via Lightstone/Windeed API,
              funds are released minus 1.5% platform fee + R250 escrow charge. Off-app closures result in forfeited deposits.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}