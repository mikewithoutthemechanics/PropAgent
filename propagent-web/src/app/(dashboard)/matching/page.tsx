'use client';

import { useState } from 'react';
import { Plus, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, ChevronRight, Bell, X, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

const criteria = [
  {
    id: '1',
    budget: 'R8,000 - R15,000',
    location: 'Umhlanga, KZN',
    beds: '2 bed',
    moveIn: 'immediate',
    pets: false,
    matchCount: 3
  },
  {
    id: '2',
    budget: 'R12,000 - R20,000',
    location: 'Ballito, KZN',
    beds: '3 bed',
    moveIn: '30 days',
    pets: true,
    matchCount: 5
  },
  {
    id: '3',
    budget: 'R5,000 - R10,000',
    location: 'Durban, KZN',
    beds: '1 bed',
    moveIn: '60 days',
    pets: false,
    matchCount: 2
  }
];

export default function MatchingPage() {
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-light tracking-tight">Tenant Matching</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-3 text-sm md:text-base">
            <Users className="w-4 h-4" />
            <span>{criteria.length} active criteria</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-emerald-600">POPIA compliant</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs md:text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FFC Verified
          </Badge>
          <Button className="bg-white text-slate-900 font-medium hover:bg-gold-400 transition-all duration-300 text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Criteria
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={() => setMobileListOpen(!mobileListOpen)}
            className="w-full flex items-center justify-between px-5 py-4 bg-slate-900 border border-white/5 rounded-xl"
          >
            <span className="font-light">Criteria ({criteria.length})</span>
            <ChevronRight className={cn("w-5 h-5 transition-transform", mobileListOpen && "rotate-90")} />
          </button>
        </div>

        {/* Criteria List */}
        <div className={cn(
          "lg:col-span-1 space-y-3",
          mobileListOpen ? "block" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-light text-white/50 uppercase tracking-widest">Active Criteria</h2>
            <span className="text-xs text-white/30">{criteria.length}</span>
          </div>
          
          {criteria.map((c) => (
            <div 
              key={c.id}
              onClick={() => {
                setSelectedCriteria(c.id);
                setMobileListOpen(false);
              }}
              className={cn(
                "group cursor-pointer p-5 bg-slate-900/30 border border-white/5 rounded-xl transition-all duration-300",
                selectedCriteria === c.id 
                  ? "border-gold-500/30 bg-slate-900/60" 
                  : "hover:border-white/10 hover:bg-slate-900/50"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-lg font-light">{c.budget}</span>
                <Badge variant="success" className="text-xs bg-emerald-500/10">{c.matchCount} matches</Badge>
              </div>
              <div className="space-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/30" />
                  {c.location}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-white/30" />
                    {c.beds}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-white/30" />
                    {c.moveIn}
                  </span>
                </div>
                {c.pets && (
                  <div className="flex items-center gap-1.5 text-emerald-400/70">
                    <Sparkles className="w-4 h-4" />
                    Pets considered
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Property Matches */}
        <div className="lg:col-span-3">
          <Card className="h-full min-h-[400px] bg-slate-900/30 border-white/5">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
              <h2 className="text-lg font-light">Property Matches</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg text-sm hover:border-white/20 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 bg-slate-800/50 border border-white/5 rounded-lg text-sm focus:outline-none focus:border-gold-500/30">
                  <option>Sort by match %</option>
                  <option>Sort by price</option>
                  <option>Sort by date</option>
                </select>
              </div>
            </div>
            
            {selectedCriteria ? (
              <div className="grid gap-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="group flex items-center gap-5 p-4 bg-slate-900/30 border border-white/5 rounded-xl hover:border-gold-500/20 hover:bg-slate-900/50 transition-all duration-300 cursor-pointer">
                    <div className="w-28 h-24 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-light mb-1">Modern Apartment in Umhlanga</h4>
                          <p className="text-white/50 text-sm">R12,500 • 2 bed • 1 bath • 85m²</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-light text-gold-400">{98 - (i * 2)}%</span>
                          <span className="text-xs text-white/30">match</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Available now</Badge>
                        <Badge className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">Garden</Badge>
                        <Badge className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">Parking</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-gold-400 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-light text-white/60 mb-2">Select criteria to view matches</h3>
                <p className="text-white/30 text-sm max-w-sm">
                  Choose a tenant criteria from the left panel to see matching properties
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h4 className="font-light text-lg mb-1">POPIA Protected Matching</h4>
          <p className="text-white/50 text-sm leading-relaxed">
            Criteria-only matching ensures no client personal data ever touches our servers. 
            Client requirements are anonymized and matched property-to-property. 
            Agent contact details are kept internal. FFC verification required for all agents.
          </p>
        </div>
      </div>
    </div>
  );
}
