'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Shield, ShieldCheck, AlertTriangle, Search, Star, TrendingUp, Crown, Sparkles, Plus, X } from 'lucide-react';
import { AgentProfile, sampleAgents } from '@/lib/agents';
import { cn } from '@/lib/utils';

function AnimatedGradientHeader() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-navy-500/20 via-yellow-500/20 to-navy-500/20 animate-pulse-slow" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-navy-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed" />
    </>
  );
}

function GlassCard({ children, hoverEffect = false }: { children: React.ReactNode; hoverEffect?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-800/40 backdrop-blur-xl border border-slate-700/50",
        hoverEffect && isHovered && "transform -translate-y-1 shadow-2xl shadow-navy-500/20 border-navy-500/30 scale-[1.02]",
        hoverEffect && "transition-all duration-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-transparent pointer-events-none" />
      {hoverEffect && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500/5 to-transparent" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, delay }: { icon: React.ElementType; value: string | number; label: string; color: 'amber' | 'green' | 'blue' | 'purple'; delay?: number }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay || 0);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const colorClasses = {
    amber: { bg: 'bg-navy-500/20', text: 'text-navy-400', border: 'border-navy-500/30', shadow: 'shadow-navy-500/20' },
    gold: { bg: 'bg-gold-500/20', text: 'text-gold-400', border: 'border-gold-500/30', shadow: 'shadow-gold-500/20' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', shadow: 'shadow-blue-500/20' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', shadow: 'shadow-purple-500/20' },
  };
  
  const colors = colorClasses[color];
  
  return (
    <GlassCard 
      className={cn(
        "p-4 transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function FFCBadge({ verified }: { verified: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  if (verified) {
    return (
      <div 
        className={cn(
          "relative px-3 py-1.5 rounded-full text-xs font-medium border gap-1 transition-all duration-300",
          "bg-gold-500/20 text-gold-400 border-gold-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
          isHovered && "shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="absolute inset-0 rounded-full bg-gold-400/10 animate-pulse" />
        <span className="relative flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Verified
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "relative px-3 py-1.5 rounded-full text-xs font-medium border gap-1 transition-all duration-300",
        "bg-navy-500/20 text-navy-400 border-navy-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        isHovered && "shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-105"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="relative flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Pending
      </span>
    </div>
  );
}

function AgentRow({ agent, index }: { agent: AgentProfile; index: number }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);
  
  return (
    <tr 
      className={cn(
        "group transition-all duration-500 border-b border-slate-700/30 hover:bg-slate-700/30 cursor-pointer",
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-navy-500/30 to-yellow-600/30 flex items-center justify-center text-white font-medium shadow-lg group-hover:shadow-navy-500/30 transition-all duration-300 group-hover:scale-110">
            <span className="relative z-10">{agent.firstName[0]}{agent.lastName[0]}</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-navy-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-navy-400 transition-colors">
              {agent.firstName} {agent.lastName}
            </p>
            <p className="text-sm text-slate-400">{agent.agencyName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <FFCBadge verified={agent.ffcVerified} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-4 h-4 transition-all duration-300",
                  i < Math.floor(agent.avgRating || 0) 
                    ? "text-navy-400 fill-navy-400" 
                    : "text-slate-600"
                )} 
              />
            ))}
          </div>
          <span className="font-medium text-white">{agent.avgRating?.toFixed(1) || '-'}</span>
          <span className="text-slate-400">({agent.reviewCount})</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          agent.subscriptionTier === 'enterprise' 
            ? "bg-gradient-to-r from-navy-500/20 to-gold-500/20 text-navy-400 border-navy-500/30"
            : agent.subscriptionTier === 'professional'
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : "bg-slate-600/30 text-slate-300 border-slate-600/30"
        )}>
          {agent.subscriptionTier}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <span className="font-bold text-gold-400">{agent.closedDeals}</span>
          <span className="text-slate-500">/ {agent.totalMatches}</span>
        </div>
        <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold-500 to-navy-500 rounded-full transition-all duration-1000"
            style={{ width: `${(agent.closedDeals / agent.totalMatches) * 100}%` }}
          />
        </div>
      </td>
    </tr>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
        active 
          ? "bg-gradient-to-r from-navy-500 to-yellow-500 text-slate-900 shadow-lg shadow-navy-500/25"
          : "bg-slate-800/40 backdrop-blur border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-navy-500/30 hover:text-navy-400",
        isHovered && !active && "transform -translate-y-0.5"
      )}
    >
      {label} ({count})
    </button>
  );
}

export default function AgentManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFFC, setFilterFFC] = useState<'all' | 'verified' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgent, setNewAgent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agencyName: '',
    ffcNumber: '',
    ffcVerified: false,
  });
  
  const filteredAgents = useMemo(() => {
    let result = [...sampleAgents];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.firstName.toLowerCase().includes(term) ||
        a.lastName.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term) ||
        a.agencyName?.toLowerCase().includes(term) ||
        a.ffcNumber.toLowerCase().includes(term)
      );
    }
    
    if (filterFFC === 'verified') {
      result = result.filter(a => a.ffcVerified);
    } else if (filterFFC === 'pending') {
      result = result.filter(a => !a.ffcVerified);
    }
    
    return result;
  }, [searchTerm, filterFFC]);
  
  const stats = useMemo(() => {
    const verified = sampleAgents.filter(a => a.ffcVerified);
    const pending = sampleAgents.filter(a => !a.ffcVerified);
    const avgNps = verified.reduce((sum, a) => sum + (a.npsScore || 0), 0) / verified.length;
    const totalDeals = verified.reduce((sum, a) => sum + a.closedDeals, 0);
    
    return {
      total: sampleAgents.length,
      verified: verified.length,
      pending: pending.length,
      avgNps: Math.round(avgNps),
      totalDeals,
    };
  }, []);

  const handleAddAgent = () => {
    const newAgentProfile: AgentProfile = {
      id: `agent${Date.now()}`,
      userId: `user${Date.now()}`,
      firstName: newAgent.firstName,
      lastName: newAgent.lastName,
      email: newAgent.email,
      phone: newAgent.phone,
      ffcNumber: newAgent.ffcNumber,
      ffcVerified: newAgent.ffcVerified,
      agencyName: newAgent.agencyName,
      areas: [],
      specializations: [],
      subscriptionTier: 'starter',
      totalMatches: 0,
      closedDeals: 0,
      escrowDeposits: 0,
      status: newAgent.ffcVerified ? 'verified' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    sampleAgents.push(newAgentProfile);
    alert('Agent added successfully! (Demo mode)');
    setShowAddModal(false);
    setNewAgent({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      agencyName: '',
      ffcNumber: '',
      ffcVerified: false,
    });
  };

  return (
    <div className="space-y-8">
      <style>{`
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.5); }
        }
      `}</style>
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 sm:p-8">
        <AnimatedGradientHeader />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-navy-400 animate-pulse" />
              <span className="text-navy-400 text-sm font-medium">Agent Management</span>
            </div>
            <h1 className="text-3xl font-bold text-white font-serif">Agent Management</h1>
            <p className="text-slate-400 mt-2">
              FFC-verified estate agents • {stats.total} total agents
            </p>
          </div>
          <div className={cn(
            "relative px-4 py-2 rounded-full border backdrop-blur-sm transition-all duration-300",
            "bg-gradient-to-r from-navy-500/20 to-gold-500/20 border-navy-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          )}>
            <div className="absolute inset-0 rounded-full bg-navy-400/10 animate-pulse" />
            <span className="relative flex items-center gap-2 text-navy-400 font-medium">
              <Crown className="w-4 h-4" />
              Principal Access Only
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.total} label="Total Agents" color="blue" delay={100} />
        <StatCard icon={ShieldCheck} value={stats.verified} label="FFC Verified" color="green" delay={200} />
        <StatCard icon={AlertTriangle} value={stats.pending} label="Pending Verification" color="amber" delay={300} />
        <StatCard icon={TrendingUp} value={stats.avgNps} label="Avg NPS Score" color="purple" delay={400} />
      </div>

      {/* Search & Filter */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-navy-500/20 to-gold-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400/70 group-hover:text-navy-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, FFC number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <FilterButton active={filterFFC === 'all'} onClick={() => setFilterFFC('all')} label="All" count={stats.total} />
            <FilterButton active={filterFFC === 'verified'} onClick={() => setFilterFFC('verified')} label="Verified" count={stats.verified} />
            <FilterButton active={filterFFC === 'pending'} onClick={() => setFilterFFC('pending')} label="Pending" count={stats.pending} />
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-navy-500 to-yellow-500 rounded-xl text-slate-900 font-medium text-sm hover:shadow-lg hover:shadow-navy-500/25 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Agent
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Agent List */}
      <GlassCard className="overflow-hidden" hoverEffect>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">FFC Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Performance</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Deals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredAgents.map((agent, index) => (
                <AgentRow key={agent.id} agent={agent} index={index} />
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="py-16 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-slate-700/50 rounded-full animate-pulse" />
              <div className="relative w-full h-full flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-500" />
              </div>
            </div>
            <p className="text-slate-400 text-lg">No agents found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </GlassCard>

      {/* Info Banner */}
      <GlassCard className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-navy-500/20 rounded-xl backdrop-blur-sm">
            <Shield className="w-6 h-6 text-navy-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">FFC Verification Required</p>
            <p className="text-slate-400 mt-2 leading-relaxed">
              All agents must submit valid Fidelity Fund Certificate (FFC) documentation for verification.
              Only verified agents can access matching features. Rankings are visible only to agency principals.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-2xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 max-w-md w-full p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-500/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-white">Add New Agent</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                    <input 
                      type="text" 
                      value={newAgent.firstName}
                      onChange={(e) => setNewAgent({...newAgent, firstName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      value={newAgent.lastName}
                      onChange={(e) => setNewAgent({...newAgent, lastName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                    placeholder="agent@agency.co.za"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                    placeholder="+27831234567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Agency</label>
                  <input 
                    type="text" 
                    value={newAgent.agencyName}
                    onChange={(e) => setNewAgent({...newAgent, agencyName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                    placeholder="Real Estate Agency"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">FFC Number</label>
                  <input 
                    type="text" 
                    value={newAgent.ffcNumber}
                    onChange={(e) => setNewAgent({...newAgent, ffcNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/30 focus:border-navy-500/50 transition-all"
                    placeholder="FFC-2024-00001"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ffcVerified"
                    checked={newAgent.ffcVerified}
                    onChange={(e) => setNewAgent({...newAgent, ffcVerified: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700/50 text-navy-500 focus:ring-navy-500/30 focus:ring-offset-0 cursor-pointer"
                  />
                  <label htmlFor="ffcVerified" className="text-sm text-slate-300">
                    FFC Verified
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm hover:bg-slate-700/70 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddAgent}
                  disabled={!newAgent.firstName || !newAgent.lastName || !newAgent.email}
                  className="px-6 py-2.5 bg-gradient-to-r from-navy-500 to-yellow-500 rounded-lg text-slate-900 text-sm font-medium hover:shadow-lg hover:shadow-navy-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}