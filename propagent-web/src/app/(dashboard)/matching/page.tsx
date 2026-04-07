'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, ChevronRight, X, Bell, Menu } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Tenant Matching</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm md:text-base">
            <Users className="w-4 h-4" />
            {criteria.length} active tenant criteria
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-emerald-400">POPIA compliant</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs md:text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FFC Verified Only
          </Badge>
          <Button className="bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold hover:from-gold-400 hover:to-gold-500 text-xs md:text-sm py-2 px-3 md:py-2.5 md:px-4">
            <Plus className="w-4 h-4 mr-1.5 md:mr-2" />
            Add Criteria
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Mobile: Toggle Button for Criteria List */}
        <div className="lg:hidden mb-2">
          <button 
            onClick={() => setMobileListOpen(!mobileListOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl"
          >
            <span className="font-medium">Active Criteria ({criteria.length})</span>
            <ChevronRight className={cn("w-5 h-5 transition-transform", mobileListOpen && "rotate-90")} />
          </button>
        </div>

        {/* Criteria List - Desktop always visible, Mobile toggleable */}
        <div className={cn(
          "lg:col-span-1 space-y-3 md:space-y-4",
          mobileListOpen ? "block" : "hidden lg:block"
        )}>
          <h2 className="text-base md:text-lg font-semibold text-slate-300 mb-3 md:mb-4 hidden lg:block">Active Criteria</h2>
          {criteria.map((c) => (
            <div 
              key={c.id}
              onClick={() => {
                setSelectedCriteria(c.id);
                setMobileListOpen(false);
              }}
              className={cn(
                "group cursor-pointer bg-slate-900/50 border rounded-xl p-3 md:p-4 transition-all hover:border-gold-500/30",
                selectedCriteria === c.id ? "border-gold-500/50 bg-slate-800/50" : "border-slate-800 hover:bg-slate-800/30"
              )}
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="font-medium text-sm md:text-base">{c.budget}</span>
                </div>
                <Badge variant="success" className="text-xs">{c.matchCount} matches</Badge>
              </div>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                  {c.location}
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                    {c.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-slate-500" />
                    {c.moveIn}
                  </span>
                  {c.pets && (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <Sparkles className="w-3 h-3" />
                      Pets OK
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Property Matches */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[300px] md:min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold">Property Matches</h2>
              {selectedCriteria && (
                <Button variant="secondary" size="sm" className="text-xs">
                  <Filter className="w-4 h-4 mr-1.5" />
                  Filter
                </Button>
              )}
            </div>
            
            {selectedCriteria ? (
              <div className="grid gap-3 md:gap-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-gold-500/30 transition-all cursor-pointer">
                    <div className="w-16 md:w-24 h-14 md:h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">Modern Apartment in Umhlanga</h4>
                      <p className="text-xs md:text-sm text-slate-400">R12,500 • 2 bed • 1 bath</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 md:mt-2">
                        <Badge variant="success" className="text-xs">98% match</Badge>
                        <Badge variant="info" className="text-xs">Available now</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-5 md:w-5 md:h-5 text-slate-500 flex-shrink-0 group-hover:text-gold-400 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center px-4">
                <div className="w-12 md:w-16 h-12 md:h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Target className="w-6 md:w-8 h-6 md:h-8 text-slate-500" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-slate-300 mb-2">Select criteria to view matches</h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-xs">
                  Choose a tenant criteria from the left panel to see matching properties
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2 md:gap-3">
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-400 text-sm md:text-base">POPIA Protected Matching</h4>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Criteria-only matching ensures no client personal data ever touches our servers. 
            Client requirements are anonymized and matched property-to-property.
          </p>
        </div>
      </div>
    </div>
  );
}
