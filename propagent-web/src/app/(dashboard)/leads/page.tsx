'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Plus, Home, Building2, Phone, Mail, Search, Filter, TrendingUp, Target, Globe, Share2, Handshake, X } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import { Lead, LeadSource, LeadStatus, LeadType, sampleLeads, leadSourceConfig, getLeadStats } from '@/lib/leads';
import { useCollection, newId } from '@/lib/persistence';
import { cn, formatCurrency } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { exportToCSV } from '@/lib/export';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-charcoal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-charcoal-500/5 to-transparent rounded-full" />
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
          className="absolute rounded-full bg-gradient-to-r from-charcoal-400 to-lime-400"
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'tenant',
    source: 'website',
    status: 'new',
    bedrooms: '',
    budgetMin: '',
    budgetMax: '',
    preferredSuburb: '',
    propertyAddress: '',
    askingRent: '',
    notes: '',
  });
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

  const {
    items: leads,
    add: addLead,
    remove: removeLead,
  } = useCollection<Lead>('leads', sampleLeads);

  const stats = useMemo(() => getLeadStats(leads), [leads]);

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    
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
  }, [leads, searchTerm, filterSource, filterStatus]);

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
      case 'new': return <Badge className="glass glass-card bg-charcoal-500/20 text-charcoal-300 border-charcoal-500/30">New</Badge>;
      case 'contacted': return <Badge className="glass glass-card bg-lime-500/20 text-lime-300 border-lime-500/30">Contacted</Badge>;
      case 'qualified': return <Badge className="glass glass-card bg-lime-500/20 text-lime-300 border-lime-500/30">Qualified</Badge>;
      case 'converted': return <Badge className="glass glass-card bg-blue-500/20 text-blue-300 border-blue-500/30">Converted</Badge>;
      case 'lost': return <Badge className="glass glass-card bg-slate-500/20 text-slate-300 border-slate-500/30">Lost</Badge>;
      default: return <Badge className="glass glass-card">{status}</Badge>;
    }
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.email) {
      alert('Please fill in required fields (Name, Email).');
      return;
    }
    const lead: Lead = {
      id: newId('lead'),
      source: newLead.source as LeadSource,
      type: newLead.type as LeadType,
      status: newLead.status as LeadStatus,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      bedrooms: newLead.bedrooms ? parseInt(newLead.bedrooms, 10) : undefined,
      budgetMin: newLead.budgetMin ? parseFloat(newLead.budgetMin) : undefined,
      budgetMax: newLead.budgetMax ? parseFloat(newLead.budgetMax) : undefined,
      preferredSuburb: newLead.preferredSuburb || undefined,
      propertyAddress: newLead.propertyAddress || undefined,
      askingRent: newLead.askingRent ? parseFloat(newLead.askingRent) : undefined,
      capturedAt: new Date().toISOString(),
    };
    addLead(lead);
    setShowAddModal(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      type: 'tenant',
      source: 'website',
      status: 'new',
      bedrooms: '',
      budgetMin: '',
      budgetMax: '',
      preferredSuburb: '',
      propertyAddress: '',
      askingRent: '',
      notes: '',
    });
  };

  return (
    <div ref={pageRef} className="space-y-6 relative">
      <Breadcrumbs />
      
      {/* Animated Gradient Header */}
      <div className="gradient-header relative rounded-2xl p-6 overflow-hidden">
        <AnimatedBackground />
        <FloatingParticles />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900 text-gradient-lime">Lead Generation</h1>
              <p className="text-charcoal-500 mt-1">
                Tenant & landlord leads from Property24, Facebook, Website
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="glow-lime hover:scale-105 transition-all duration-300 cursor-pointer">
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
              "glass-card hover-3d-card rounded-xl p-4 border border-charcoal-500/20",
              isVisible && "animate-on-scroll"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center glass" style={{ backgroundColor: `${config.color}20` }}>
                <span style={{ color: config.color }}>{config.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{stats.bySource[source as keyof typeof stats.bySource]}</p>
                <p className="text-xs text-charcoal-500">{config.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={cn("glass-card rounded-xl p-4 border border-charcoal-500/20", isVisible && "animate-on-scroll visible delay-200")}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-charcoal-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal-500 text-charcoal-900 placeholder-charcoal-400 cursor-pointer transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 bg-slate-100/50 border border-charcoal-500/30 rounded-lg text-sm text-charcoal-900 cursor-pointer transition-all duration-300"
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
              className="px-3 py-2 bg-slate-100/50 border border-charcoal-500/30 rounded-lg text-sm text-charcoal-900 cursor-pointer transition-all duration-300"
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
      <div className={cn("glass-card rounded-xl overflow-hidden border border-charcoal-500/20", isVisible && "animate-on-scroll visible delay-300")}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100/50 border-b border-charcoal-500/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Requirements</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-400 uppercase">Captured</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-500/10">
              {filteredLeads.map((lead) => {
                const sourceConfig = leadSourceConfig[lead.source];
                return (
                  <tr key={lead.id} className="hover:bg-slate-100/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-charcoal-900">{lead.name}</p>
                        <div className="flex items-center gap-2 text-xs text-charcoal-500">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-charcoal-500">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-charcoal-400">{sourceConfig.icon}</span>
                        <span className="text-sm text-charcoal-500">{sourceConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={lead.type === 'tenant' ? "glass glass-card bg-blue-500/20 text-blue-300 border-blue-500/30" : lead.type === 'landlord' ? "glass glass-card bg-lime-500/20 text-lime-300 border-lime-500/30" : "glass glass-card bg-charcoal-500/20 text-charcoal-300 border-charcoal-500/30"}>
                        {lead.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lead.type === 'tenant' && (
                        <div className="text-sm text-charcoal-500">
                          {lead.bedrooms && <span>{lead.bedrooms} bed • </span>}
                          {lead.budgetMin && <span>R{lead.budgetMin.toLocaleString()} - R{lead.budgetMax?.toLocaleString()}</span>}
                          {lead.preferredSuburb && <span> • {lead.preferredSuburb}</span>}
                        </div>
                      )}
                      {lead.type === 'landlord' && (
                        <div className="text-sm text-charcoal-500">
                          {lead.propertyAddress && <span>{lead.propertyAddress}</span>}
                          {lead.askingRent && <span> • R{lead.askingRent.toLocaleString()}/mo</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-charcoal-500">
                        {new Date(lead.capturedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete lead ${lead.name}?`)) {
                            removeLead(lead.id);
                          }
                        }}
                        className="text-xs text-charcoal-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
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
            <p className="text-charcoal-500">No leads found</p>
          </div>
        )}
      </div>

      {/* Integration Info */}
      <div className={cn("glass p-4 rounded-xl border border-charcoal-500/20", isVisible && "animate-on-scroll visible delay-400")}>
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal-900">Lead Sources</p>
            <p className="text-sm text-charcoal-500 mt-1">
              Connect Property24, Facebook Lead Ads, and your website to automatically capture tenant and landlord leads.
              Referral tracking included. Integration setup available via n8n automation.
            </p>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-2xl max-w-md w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-charcoal-900">Add New Lead</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-charcoal-900/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Name</label>
                <input 
                  type="text" 
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                    placeholder="+27831234567"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Type</label>
                  <select 
                    value={newLead.type}
                    onChange={(e) => setNewLead({...newLead, type: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer"
                  >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Source</label>
                  <select 
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer"
                  >
                    <option value="website">Website</option>
                    <option value="property24">Property24</option>
                    <option value="facebook">Facebook</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {newLead.type === 'tenant' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-500 mb-2">Bedrooms</label>
                    <select 
                      value={newLead.bedrooms}
                      onChange={(e) => setNewLead({...newLead, bedrooms: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer"
                    >
                      <option value="">Any</option>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                      <option value="3">3 Bedrooms</option>
                      <option value="4">4+ Bedrooms</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-500 mb-2">Min Budget (ZAR)</label>
                      <input 
                        type="number" 
                        value={newLead.budgetMin}
                        onChange={(e) => setNewLead({...newLead, budgetMin: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-500 mb-2">Max Budget (ZAR)</label>
                      <input 
                        type="number" 
                        value={newLead.budgetMax}
                        onChange={(e) => setNewLead({...newLead, budgetMax: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                        placeholder="20000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-500 mb-2">Preferred Suburb</label>
                    <input 
                      type="text" 
                      value={newLead.preferredSuburb}
                      onChange={(e) => setNewLead({...newLead, preferredSuburb: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                      placeholder="Sandton"
                    />
                  </div>
                </>
              )}
              
              {newLead.type === 'landlord' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-500 mb-2">Property Address</label>
                    <input 
                      type="text" 
                      value={newLead.propertyAddress}
                      onChange={(e) => setNewLead({...newLead, propertyAddress: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                      placeholder="123 Main Street, Suburb"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-500 mb-2">Asking Rent (ZAR/month)</label>
                    <input 
                      type="number" 
                      value={newLead.askingRent}
                      onChange={(e) => setNewLead({...newLead, askingRent: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                      placeholder="15000"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Notes</label>
                <textarea 
                  rows={3}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal-500 cursor-pointer transition-all duration-300"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-slate-50 rounded-lg text-charcoal-900 text-sm hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddLead}
                className="px-6 py-2.5 bg-gradient-to-r from-charcoal-500 to-charcoal-600 rounded-lg text-charcoal-900 text-sm font-medium hover:shadow-lg hover:shadow-charcoal-500/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}