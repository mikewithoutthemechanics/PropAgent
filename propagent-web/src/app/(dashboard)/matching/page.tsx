'use client';

import { useState } from 'react';
import { Plus, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, ChevronRight, Bell, SlidersHorizontal, Search } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { kznLocations, areaProfiles } from '@/lib/kzn-locations';

// Sample criteria with KZN locations
const sampleCriteria = [
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
    location: 'Sheffield Beach, KZN',
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
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique locations for search
  const allLocations = kznLocations.suburbs.map(s => `${s.name}, ${s.city}`);
  const filteredLocations = searchQuery 
    ? allLocations.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
    : [];

  // Popular KZN areas
  const popularAreas = kznLocations.popularAreas;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold">Tenant Matching</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-3 text-sm md:text-base">
            <Users className="w-4 h-4" />
            <span>{sampleCriteria.length} active criteria</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-emerald-600">POPIA compliant</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs md:text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            KZN Based
          </Badge>
          <Button className="bg-navy-500 text-white hover:bg-navy-600 transition-all text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5 rounded-lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Criteria
          </Button>
        </div>
      </div>

      {/* KZN Location Selector */}
      <div className="mb-8 p-5 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-sm font-medium text-slate-500 mb-3">Search locations in KZN</h3>
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Ballito, Umhlanga, Sheffield, Salt Rock, Midlands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          {filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              {filteredLocations.map((loc, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  onClick={() => setSearchQuery(loc)}
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Popular Areas */}
        <div className="mt-4 flex flex-wrap gap-2">
          {popularAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSearchQuery(area.name)}
              className="px-3 py-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-4 gap-4 md:gap-6">
        {/* Mobile Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={() => setMobileListOpen(!mobileListOpen)}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-slate-200 rounded-xl"
          >
            <span className="font-medium">Criteria ({sampleCriteria.length})</span>
            <ChevronRight className={cn("w-5 h-5", mobileListOpen && "rotate-90")} />
          </button>
        </div>

        {/* Criteria List */}
        <div className={cn(
          "lg:col-span-1 space-y-3",
          mobileListOpen ? "block" : "hidden lg:block"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Active Criteria</h2>
            <span className="text-xs text-slate-400">{sampleCriteria.length}</span>
          </div>
          
          {sampleCriteria.map((c) => (
            <div 
              key={c.id}
              onClick={() => {
                setSelectedCriteria(c.id);
                setMobileListOpen(false);
              }}
              className={cn(
                "group cursor-pointer p-5 bg-white border rounded-xl transition-all duration-300",
                selectedCriteria === c.id 
                  ? "border-amber-300 shadow-md" 
                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-lg font-medium">{c.budget}</span>
                <Badge variant="success" className="text-xs">{c.matchCount} matches</Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {c.location}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Home className="w-4 h-4" />
                    {c.beds}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {c.moveIn}
                  </span>
                </div>
                {c.pets && (
                  <div className="flex items-center gap-1.5 text-emerald-600">
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
          <Card className="h-full min-h-[400px]">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Property Matches</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm hover:border-slate-300 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-300">
                  <option>Sort by match %</option>
                  <option>Sort by price</option>
                  <option>Sort by date</option>
                </select>
              </div>
            </div>
            
            {selectedCriteria ? (
              <div className="grid gap-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="group flex items-center gap-5 p-4 bg-white border border-slate-100 rounded-xl hover:border-amber-200 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-28 h-24 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium mb-1">Modern Apartment in Umhlanga</h4>
                          <p className="text-slate-500 text-sm">R12,500 • 2 bed • 1 bath • 85m²</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-semibold text-amber-600">{98 - (i * 2)}%</span>
                          <span className="text-xs text-slate-400">match</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="success" className="text-xs">Available now</Badge>
                        <Badge variant="info" className="text-xs">Garden</Badge>
                        <Badge variant="info" className="text-xs">Parking</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-medium text-slate-600 mb-2">Select criteria to view matches</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Choose a tenant criteria from the left panel to see matching properties
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-lg mb-1">POPIA Protected Matching</h4>
          <p className="text-slate-500 text-sm leading-relaxed">
            Criteria-only matching ensures no client personal data ever touches our servers. 
            Client requirements are anonymized and matched property-to-property. 
            Agent contact details are kept internal. FFC verification required for all agents.
          </p>
        </div>
      </div>
    </div>
  );
}
