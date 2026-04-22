'use client';

import { useState } from 'react';
import { Plus, Users, Home, MapPin, Sparkles, Search, TrendingUp, Building, Key, Brain, Zap, RefreshCw, Eye } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { kznLocations } from '@/lib/kzn-locations';

type MatchTab = 'ai-recommendations' | 'rentals' | 'sales';

const aiRecommendations = [
  {
    id: 'ai-1',
    propertyTitle: '3-Bed Family Home, Umhlanga Ridge',
    propertyPrice: 'R2.1M',
    propertyType: 'House',
    matchedAgent: 'Sarah van der Merwe',
    matchedAgency: 'Coastal Properties KZN',
    buyerBudget: 'R1.8M - R2.5M',
    buyerLocation: 'Umhlanga, KZN',
    matchScore: 94,
    matchReasons: ['Exact suburb match', 'Within budget', 'Bedroom requirements met', '3 bed family home preference'],
    status: 'new' as const,
    timeAgo: '2 min ago',
  },
  {
    id: 'ai-2',
    propertyTitle: '2-Bed Apartment, Ballito',
    propertyPrice: 'R1.1M',
    propertyType: 'Apartment',
    matchedAgent: 'Michael Roberts',
    matchedAgency: 'Urban Living SA',
    buyerBudget: 'R800K - R1.2M',
    buyerLocation: 'Ballito, KZN',
    matchScore: 89,
    matchReasons: ['Within budget', 'Same area', 'Investment property match', 'Pre-approved buyer'],
    status: 'new' as const,
    timeAgo: '15 min ago',
  },
  {
    id: 'ai-3',
    propertyTitle: '4-Bed Zimbali Estate',
    propertyPrice: 'R3.8M',
    propertyType: 'House',
    matchedAgent: 'James Mitchell',
    matchedAgency: 'Mitchell Properties',
    buyerBudget: 'R2.5M - R4M',
    buyerLocation: 'Zimbali, KZN',
    matchScore: 91,
    matchReasons: ['Exact location match', 'Within budget', 'Luxury spec match', 'Pre-approved buyer'],
    status: 'contacted' as const,
    timeAgo: '1 hr ago',
  },
  {
    id: 'ai-4',
    propertyTitle: 'Studio Flat, Sheffield Beach',
    propertyPrice: 'R6,500/mo',
    propertyType: 'Rental',
    matchedAgent: 'Lisa Naidoo',
    matchedAgency: 'North Coast Rentals',
    buyerBudget: 'R5,000 - R8,000/mo',
    buyerLocation: 'Sheffield Beach',
    matchScore: 86,
    matchReasons: ['Within budget', 'Exact suburb', 'Immediate move-in', 'Pet-friendly match'],
    status: 'new' as const,
    timeAgo: '30 min ago',
  },
  {
    id: 'ai-5',
    propertyTitle: '3-Bed Townhouse, La Lucia',
    propertyPrice: 'R15,000/mo',
    propertyType: 'Rental',
    matchedAgent: 'David Pillay',
    matchedAgency: 'KZN Premier Rentals',
    buyerBudget: 'R12,000 - R18,000/mo',
    buyerLocation: 'La Lucia / Umhlanga',
    matchScore: 82,
    matchReasons: ['Within budget', 'Same city area', 'Bedroom match', 'Corporate tenant'],
    status: 'contacted' as const,
    timeAgo: '2 hrs ago',
  },
];

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
  const [activeTab, setActiveTab] = useState<MatchTab>('ai-recommendations');
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique locations for search
  const allLocations = kznLocations.suburbs.map(s => `${s.name}, ${s.city}`);
  const filteredLocations = searchQuery 
    ? allLocations.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
    : [];

  // Popular KZN areas
  const popularAreas = kznLocations.popularAreas;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-lime-600 bg-lime-50 border-lime-200';
    if (score >= 80) return 'text-sky-600 bg-sky-50 border-sky-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-charcoal-600 bg-charcoal-50 border-charcoal-200';
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
        <div>
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-charcoal-100 rounded-lg w-fit mb-3">
            <button
              onClick={() => setActiveTab('ai-recommendations')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === 'ai-recommendations' 
                  ? "bg-white text-charcoal-900 shadow-sm" 
                  : "text-charcoal-500 hover:text-charcoal-700"
              )}
            >
              <Brain className="w-4 h-4" />
              AI Matches
            </button>
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
            {activeTab === 'ai-recommendations' ? 'AI Matching' : activeTab === 'rentals' ? 'Tenant Matching' : 'Buyer Matching'}
          </h1>
          <p className="text-charcoal-500 mt-2 flex items-center gap-3 text-sm md:text-base">
            {activeTab === 'ai-recommendations' ? (
              <>
                <Brain className="w-4 h-4" />
                <span>Your stock recommended to agents with matching buyers</span>
              </>
            ) : activeTab === 'rentals' ? (
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
            AI Active
          </Badge>
          {activeTab === 'ai-recommendations' ? (
            <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 transition-all text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5 rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Matches
            </Button>
          ) : (
            <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 transition-all text-xs md:text-sm py-2 px-4 md:py-2.5 md:px-5 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === 'rentals' ? 'Add Criteria' : 'Add Buyer'}
            </Button>
          )}
        </div>
      </div>

      {/* AI Recommendations Tab */}
      {activeTab === 'ai-recommendations' && (
        <div className="space-y-6">
          {/* AI Summary Bar */}
          <div className="bg-gradient-to-r from-charcoal-900 to-charcoal-800 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-lime-400/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">AI Matching Engine</h2>
                  <p className="text-sm text-white/60">
                    Continuously scanning {aiRecommendations.length} potential matches across the network
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-lime-400">{aiRecommendations.length}</p>
                  <p className="text-white/50 text-xs">New Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-lime-400">89%</p>
                  <p className="text-white/50 text-xs">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-lime-400">12</p>
                  <p className="text-white/50 text-xs">Agents Connected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Match Cards */}
          <div className="space-y-4">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 bg-white border-2 border-charcoal-100 rounded-2xl hover:border-lime-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left: Property Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-charcoal-900">{rec.propertyTitle}</h3>
                          {rec.status === 'new' && (
                            <span className="text-[10px] bg-lime-400 text-charcoal-900 px-2 py-0.5 rounded-full font-bold uppercase">New</span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-charcoal-900">{rec.propertyPrice}</p>
                      </div>
                      <div className={cn(
                        "px-3 py-1.5 rounded-full border text-sm font-bold",
                        getScoreColor(rec.matchScore)
                      )}>
                        {rec.matchScore}% match
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.matchReasons.map((reason, i) => (
                        <span key={i} className="text-xs bg-charcoal-50 text-charcoal-600 px-2 py-1 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Matched Agent */}
                  <div className="lg:w-72 p-4 bg-charcoal-50 rounded-xl">
                    <p className="text-xs text-charcoal-500 mb-2 uppercase tracking-wider font-medium">Matched Agent&apos;s Buyer</p>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold text-xs">
                        {rec.matchedAgent.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-900">{rec.matchedAgent}</p>
                        <p className="text-xs text-charcoal-500">{rec.matchedAgency}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-charcoal-600">
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span className="font-medium">{rec.buyerBudget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Area</span>
                        <span className="font-medium">{rec.buyerLocation}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-lime-400 text-charcoal-900 rounded-lg text-xs font-medium hover:bg-lime-500 transition-colors">
                        <Zap className="w-3 h-3" />
                        Connect
                      </button>
                      <button className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white text-charcoal-700 rounded-lg text-xs font-medium border border-charcoal-200 hover:bg-charcoal-50 transition-colors">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="bg-lime-50 rounded-2xl p-6 border border-lime-200">
            <h3 className="text-sm font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-600" />
              How AI Matching Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-charcoal-900">1. You list stock</p>
                <p className="text-charcoal-600 text-xs mt-1">
                  Your properties and rentals from connected databases are indexed automatically.
                </p>
              </div>
              <div>
                <p className="font-medium text-charcoal-900">2. AI scans the network</p>
                <p className="text-charcoal-600 text-xs mt-1">
                  Our engine scores every buyer/tenant criteria from other agents against your stock.
                </p>
              </div>
              <div>
                <p className="font-medium text-charcoal-900">3. Hot matches surface</p>
                <p className="text-charcoal-600 text-xs mt-1">
                  High-scoring matches appear here. Connect with the agent to close the deal together.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
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
                  Add buyers looking for properties. AI will match them with stock from other agents.
                </p>
                <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Buyer Lead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rentals' && (
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

      {/* Rental Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleCriteria.map((criteria) => (
          <div 
            key={criteria.id}
            onClick={() => setSelectedCriteria(selectedCriteria === criteria.id ? null : criteria.id)}
            className={cn(
              "p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
              selectedCriteria === criteria.id 
                ? "border-lime-400 bg-lime-50" 
                : "border-charcoal-100 hover:border-lime-300"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-lime-600" />
              </div>
              <Badge className="text-xs bg-charcoal-50 text-charcoal-600">
                {criteria.moveIn}
              </Badge>
            </div>
            <h3 className="font-semibold text-charcoal-900 mb-1">{criteria.beds}</h3>
            <p className="text-sm text-charcoal-500 mb-3">{criteria.location}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-charcoal-900">{criteria.budget}</span>
              <span className="text-lime-600 font-medium">{criteria.matchCount} matches</span>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
