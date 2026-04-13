'use client';

import { useState } from 'react';
import { Plus, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, ChevronRight, Bell, SlidersHorizontal, Search, TrendingUp, Building, Key, HomeIcon } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { kznLocations, areaProfiles } from '@/lib/kzn-locations';

type MatchTab = 'rentals' | 'sales';

// Sample rental criteria with KZN locations
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

// Sales/Buyer criteria
const buyerCriteria = [
  {
    id: '1',
    budget: 'R1.5M - R2.5M',
    location: 'Umhlanga, KZN',
    beds: '3 bed',
    purchaseType: 'Primary residence',
    preApproved: true,
    matchCount: 4
  },
  {
    id: '2',
    budget: 'R800K - R1.2M',
    location: 'Ballito, KZN',
    beds: '2 bed',
    purchaseType: 'Investment',
    preApproved: true,
    matchCount: 6
  },
  {
    id: '3',
    budget: 'R2.5M - R4M',
    location: 'Zimbali, KZN',
    beds: '4 bed',
    purchaseType: 'Primary residence',
    preApproved: false,
    matchCount: 2
  }
];

export default function MatchingPage() {
  const [activeTab, setActiveTab] = useState<MatchTab>('rentals');
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
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-charcoal-100 rounded-lg w-fit mb-3">
            <button
              onClick={() => setActiveTab('rentals')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === 'rentals' 
                  ? "bg-white text-charcoal-900 shadow-sm" 
                  : "text-charcoal-500 hover:text-charcoal-700"
              )}
            >
              <Home className="w-4 h-4" />
              Rentals
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === 'sales' 
                  ? "bg-white text-charcoal-900 shadow-sm" 
                  : "text-charcoal-500 hover:text-charcoal-700"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Sales
            </button>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-semibold">
            {activeTab === 'rentals' ? 'Tenant Matching' : 'Buyer Matching'}
          </h1>
          <p className="text-charcoal-500 mt-2 flex items-center gap-3 text-sm md:text-base">
            {activeTab === 'rentals' ? (
              <>
                <Users className="w-4 h-4" />
                <span>{sampleCriteria.length} active criteria</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>{buyerCriteria.length} active buyers</span>
              </>
            )}
            <span className="w-1 h-1 bg-charcoal-200 rounded-full" />
            <span className="text-lime-600">POPIA compliant</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-1.5 bg-lime-50 text-lime-600 border border-lime-200 text-xs md:text-sm">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            KZN Based
          </Badge>
          <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 transition-all text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5 rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'rentals' ? 'Add Criteria' : 'Add Buyer'}
          </Button>
        </div>
      </div>

      {activeTab === 'sales' ? (
        <div className="space-y-6">
          {/* Sales Matching - Buyer Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buyerCriteria.map((buyer) => (
              <div 
                key={buyer.id}
                onClick={() => setSelectedCriteria(selectedCriteria === buyer.id ? null : buyer.id)}
                className={cn(
                  "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedCriteria === buyer.id 
                    ? "border-lime-400 bg-lime-50" 
                    : "border-charcoal-100 hover:border-lime-300"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-lime-600" />
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    buyer.preApproved ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {buyer.preApproved ? 'Pre-approved' : 'Pending'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-1">{buyer.purchaseType}</h3>
                <p className="text-sm text-charcoal-500 mb-3">{buyer.location}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal-900">{buyer.budget}</span>
                  <span className="text-lime-600 font-medium">{buyer.matchCount} matches</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add buyer lead card */}
          <div className="bg-gradient-to-r from-lime-50 to-sky-50 rounded-xl p-6 border-2 border-lime-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-lime-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-charcoal-900 mb-1">Capture Buyer Leads</h3>
                <p className="text-sm text-charcoal-500 mb-4">
                  Add buyers looking for properties. Match them with your sales inventory.
                </p>
                <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Buyer Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* KZN Location Selector */}
      <div className="mb-8 p-5 bg-white border-2 border-charcoal-100 rounded-2xl">
        <h3 className="text-sm font-medium text-charcoal-500 mb-3">Search locations in KZN</h3>
        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-3 bg-charcoal-50 border border-charcoal-100 rounded-lg">
            <Search className="w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search Ballito, Umhlanga, Sheffield, Salt Rock, Midlands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          {filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal-100 rounded-lg shadow-lg z-10">
              {filteredLocations.map((loc, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-lime-50 flex items-center gap-2"
                  onClick={() => setSearchQuery(loc)}
                >
                  <MapPin className="w-4 h-4 text-charcoal-400" />
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
              className="px-3 py-1.5 text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full hover:bg-lime-100 transition-colors"
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
            className="w-full flex items-center justify-between px-5 py-4 bg-white border-2 border-charcoal-100 rounded-2xl"
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
            <h2 className="text-sm font-medium text-charcoal-500 uppercase tracking-widest">Active Criteria</h2>
            <span className="text-xs text-charcoal-400">{sampleCriteria.length}</span>
          </div>
          
          {sampleCriteria.map((c) => (
            <div 
              key={c.id}
              onClick={() => {
                setSelectedCriteria(c.id);
                setMobileListOpen(false);
              }}
              className={cn(
                "group cursor-pointer p-5 bg-white border-2 border-charcoal-100 rounded-2xl transition-all duration-300",
                selectedCriteria === c.id 
                  ? "border-lime-400 shadow-md" 
                  : "hover:border-lime-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-lg font-medium">{c.budget}</span>
                <Badge variant="success" className="text-xs">{c.matchCount} matches</Badge>
              </div>
              <div className="space-y-2 text-sm text-charcoal-500">
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
                  <div className="flex items-center gap-1.5 text-lime-600">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal-100">
              <h2 className="text-lg font-semibold">Property Matches</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-charcoal-50 border border-charcoal-100 rounded-lg text-sm hover:border-lime-300 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="px-4 py-2 bg-white border border-charcoal-100 rounded-lg text-sm focus:outline-none focus:border-lime-300">
                  <option>Sort by match %</option>
                  <option>Sort by price</option>
                  <option>Sort by date</option>
                </select>
              </div>
            </div>
            
            {selectedCriteria ? (
              <div className="grid gap-4">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="group flex items-center gap-5 p-4 bg-white border-2 border-charcoal-100 rounded-2xl hover:border-lime-400 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="w-28 h-24 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-charcoal-50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium mb-1">Modern Apartment in Umhlanga</h4>
                          <p className="text-charcoal-500 text-sm">R12,500 • 2 bed • 1 bath • 85m²</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-2xl font-semibold text-lime-600">{98 - (i * 2)}%</span>
                          <span className="text-xs text-charcoal-400">match</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="success" className="text-xs">Available now</Badge>
                        <Badge variant="info" className="text-xs">Garden</Badge>
                        <Badge variant="info" className="text-xs">Parking</Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-charcoal-200 group-hover:text-lime-500 transition-colors flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 bg-lime-50 rounded-full flex items-center justify-center mb-6">
                  <Target className="w-10 h-10 text-lime-300" />
                </div>
                <h3 className="text-xl font-medium text-charcoal-600 mb-2">Select criteria to view matches</h3>
                <p className="text-charcoal-400 text-sm max-w-sm">
                  Choose a tenant criteria from the left panel to see matching properties
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-5 bg-lime-50 border-2 border-lime-200 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-lime-600" />
        </div>
        <div>
          <h4 className="font-medium text-lg mb-1">POPIA Protected Matching</h4>
          <p className="text-charcoal-500 text-sm leading-relaxed">
            {activeTab === 'sales' 
              ? 'Buyer criteria is anonymized and matched against sales properties. No personal data stored.'
              : 'Criteria-only matching ensures no client personal data ever touches our servers. Client requirements are anonymized and matched property-to-property.'
            }
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
