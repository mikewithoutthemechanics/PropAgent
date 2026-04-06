'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Plus, Home, Building2, Phone, Mail, Search, Filter, TrendingUp, Target, Globe, Share2, Handshake } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { Lead, sampleLeads, leadSourceConfig, getLeadStats } from '@/lib/leads';
import { cn } from '@/lib/utils';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/5 to-transparent rounded-full" />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function LeadsPage() {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (pageRef.current) {
      observer.observe(pageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = useMemo(() => getLeadStats(sampleLeads), []);

  const filteredLeads = useMemo(() => {
    let result = [...sampleLeads];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        l.phone.includes(term) ||
        l.preferredSuburb?.toLowerCase().includes(term)
      );
    }
    
    if (filterSource !== 'all') {
      result = result.filter(l => l.source === filterSource);
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(l => l.status === filterStatus);
    }
    
    return result;
  }, [searchTerm, filterSource, filterStatus]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'property24': return <Home className="w-4 h-4" />;
      case 'facebook': return <Share2 className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      case 'referral': return <Handshake className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="glass glass-card bg-amber-500/20 text-amber-300 border-amber-500/30">New</Badge>;
      case 'contacted': return <Badge className="glass glass-card bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Contacted</Badge>;
      case 'qualified': return <Badge className="glass glass-card bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Qualified</Badge>;
      case 'converted': return <Badge className="glass glass-card bg-blue-500/20 text-blue-300 border-blue-500/30">Converted</Badge>;
      case 'lost': return <Badge className="glass glass-card bg-slate-500/20 text-slate-300 border-slate-500/30">Lost</Badge>;
      default: return <Badge className="glass glass-card">{status}</Badge>;
    }
  };

  return (
    <div ref={pageRef} className="space-y-6 relative">
      {/* Animated Gradient Header */}
      <div className="gradient-header relative rounded-2xl p-6 overflow-hidden">
        <AnimatedBackground />
        <FloatingParticles />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white text-gradient-gold">Lead Generation</h1>
              <p className="text-slate-300 mt-1">
                Tenant & landlord leads from Property24, Facebook, Website
              </p>
            </div>
            <Button className="glow-gold hover:scale-105 transition-transform duration-300">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4", isVisible && "animate-on-scroll visible stagger-children")}>
        {Object.entries(leadSourceConfig).map(([source, config], idx) => (
          <div 
            key={source} 
            className={cn(
              "glass-card hover-3d-card rounded-xl p-4 border border-amber-500/20",
              isVisible && "animate-on-scroll"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center glass" style={{ backgroundColor: `${config.color}20` }}>
                <span style={{ color: config.color }}>{config.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.bySource[source as keyof typeof stats.bySource]}</p>
                <p className="text-xs text-slate-400">{config.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={cn("glass-card rounded-xl p-4 border border-amber-500/20", isVisible && "animate-on-scroll visible delay-200")}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-sm text-white"
            >
              <option value="all">All Sources</option>
              <option value="property24">Property24</option>
              <option value="facebook">Facebook</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-sm text-white"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className={cn("glass-card rounded-xl overflow-hidden border border-amber-500/20", isVisible && "animate-on-scroll visible delay-300")}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-amber-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Requirements</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {filteredLeads.map((lead) => {
                const sourceConfig = leadSourceConfig[lead.source];
                return (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">{sourceConfig.icon}</span>
                        <span className="text-sm text-slate-300">{sourceConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={lead.type === 'tenant' ? "glass glass-card bg-blue-500/20 text-blue-300 border-blue-500/30" : lead.type === 'landlord' ? "glass glass-card bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "glass glass-card bg-amber-500/20 text-amber-300 border-amber-500/30"}>
                        {lead.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lead.type === 'tenant' && (
                        <div className="text-sm text-slate-300">
                          {lead.bedrooms && <span>{lead.bedrooms} bed • </span>}
                          {lead.budgetMin && <span>R{lead.budgetMin.toLocaleString()} - R{lead.budgetMax?.toLocaleString()}</span>}
                          {lead.preferredSuburb && <span> • {lead.preferredSuburb}</span>}
                        </div>
                      )}
                      {lead.type === 'landlord' && (
                        <div className="text-sm text-slate-300">
                          {lead.propertyAddress && <span>{lead.propertyAddress}</span>}
                          {lead.askingRent && <span> • R{lead.askingRent.toLocaleString()}/mo</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-400">
                        {new Date(lead.capturedAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredLeads.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No leads found</p>
          </div>
        )}
      </div>

      {/* Integration Info */}
      <div className={cn("glass p-4 rounded-xl border border-amber-500/20", isVisible && "animate-on-scroll visible delay-400")}>
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-white">Lead Sources</p>
            <p className="text-sm text-slate-400 mt-1">
              Connect Property24, Facebook Lead Ads, and your website to automatically capture tenant and landlord leads.
              Referral tracking included. Integration setup available via n8n automation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}