'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, TrendingUp, ChevronRight, X, Bell } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Tenant Matching</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {criteria.length} active tenant criteria
            <span className="mx-2 text-slate-600">•</span>
            <span className="text-emerald-400">POPIA compliant</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FFC Verified Only
          </Badge>
          <Button className="bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold hover:from-gold-400 hover:to-gold-500">
            <Plus className="w-4 h-4 mr-2" />
            Add Criteria
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Criteria List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Active Criteria</h2>
          {criteria.map((c) => (
            <div 
              key={c.id}
              onClick={() => setSelectedCriteria(c.id)}
              className={cn(
                "group cursor-pointer bg-slate-900/50 border rounded-xl p-4 transition-all hover:border-gold-500/30",
                selectedCriteria === c.id ? "border-gold-500/50 bg-slate-800/50" : "border-slate-800 hover:bg-slate-800/30"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="font-medium">{c.budget}</span>
                </div>
                <Badge variant="success" className="text-xs">{c.matchCount} matches</Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {c.location}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Home className="w-4 h-4 text-slate-500" />
                    {c.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {c.moveIn}
                  </span>
                  {c.pets && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Sparkles className="w-4 h-4" />
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
          <Card className="h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Property Matches</h2>
              {selectedCriteria && (
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>
            
            {selectedCriteria ? (
              <div className="grid gap-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-gold-500/30 transition-all cursor-pointer">
                    <div className="w-24 h-20 bg-slate-700 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Modern Apartment in Umhlanga</h4>
                      <p className="text-sm text-slate-400">R12,500 • 2 bed • 1 bath</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success" className="text-xs">98% match</Badge>
                        <Badge variant="info" className="text-xs">Available now</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-gold-400 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">Select criteria to view matches</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Choose a tenant criteria from the left panel to see matching properties
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
        <div>
          <h4 className="font-medium text-blue-400">POPIA Protected Matching</h4>
          <p className="text-sm text-slate-400 mt-1">
            Criteria-only matching ensures no client personal data ever touches our servers. 
            Client requirements are anonymized and matched property-to-property. 
            Agent contact details are kept internal. FFC verification required for all agents.
          </p>
        </div>
      </div>
    </div>
  );
}
