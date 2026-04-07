'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign, 
  Home, 
  Building,
  Car,
  TreePine,
  Wind,
  Shield,
  Sofa,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Input, Badge, Select } from '@/components/ui';
import { 
  RentSuggestion, 
  RentAnalysisInput,
  generateRentSuggestion,
  formatRent,
  getRentRangeString,
  getConfidenceColor,
  getConfidenceBgColor,
  analyzeCompetitiveness,
  getSeasonalRecommendation
} from '@/lib/rentAI';
import { cn } from '@/lib/utils';

const defaultPropertyInput: RentAnalysisInput = {
  propertyType: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  sqft: 80,
  address: '',
  parking: 1,
  hasGarden: false,
  hasPool: false,
  hasAirConditioning: false,
  hasSecurity: true,
  hasFurnished: false,
  location: {
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'gauteng',
  },
};

export default function RentAIPage() {
  const [propertyInput, setPropertyInput] = useState<RentAnalysisInput>(defaultPropertyInput);
  const [suggestion, setSuggestion] = useState<RentSuggestion | null>(null);
  const [currentRent, setCurrentRent] = useState<string>('15000');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const seasonalInfo = useMemo(() => getSeasonalRecommendation(), []);
  
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const inputWithCurrentRent = {
        ...propertyInput,
        currentRent: currentRent ? parseInt(currentRent) : undefined,
      };
      const result = generateRentSuggestion(inputWithCurrentRent);
      setSuggestion(result);
      setIsAnalyzing(false);
    }, 800);
  };
  
  const competitiveness = suggestion && currentRent 
    ? analyzeCompetitiveness(parseInt(currentRent), suggestion)
    : null;

  const updateField = (field: keyof RentAnalysisInput, value: any) => {
    setPropertyInput(prev => ({ ...prev, [field]: value }));
  };

  const updateLocation = (field: 'suburb' | 'city' | 'province', value: string) => {
    setPropertyInput(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Animated Gradient Header */}
      <div className={`gradient-header rounded-2xl p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg glow-gold">
              <Sparkles className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-gold font-serif">AI Rent Suggestions</h1>
              <p className="text-gray-400 mt-0.5">Market-based pricing with comparable analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-gold-500/30 text-gold-400 bg-gold-500/10">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              {seasonalInfo.currentSeason} Season
            </Badge>
          </div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Panel - Glassmorphism */}
        <Card className={`xl:col-span-1 p-5 glass-card hover-3d transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg font-semibold text-white">Property Details</h2>
          </div>
          
          <div className="space-y-5">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Property Address
              </label>
              <Input
                value={propertyInput.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main Street, Sandton"
                className="bg-dark-700 border-gray-600 text-white placeholder-gray-500 focus:border-gold-500/50 focus:ring-gold-500/20"
              />
            </div>

            {/* Current Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Current Rent (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                <Input
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(e.target.value)}
                  placeholder="15000"
                  className="pl-7 bg-dark-700 border-gray-600 text-white placeholder-gray-500 focus:border-gold-500/50 focus:ring-gold-500/20"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">For competitiveness comparison</p>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Property Type</label>
              <select
                value={propertyInput.propertyType}
                onChange={(e) => updateField('propertyType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
              >
                <option value="house" className="bg-dark-800">House</option>
                <option value="townhouse" className="bg-dark-800">Townhouse</option>
                <option value="apartment" className="bg-dark-800">Apartment</option>
                <option value="flat" className="bg-dark-800">Flat</option>
                <option value="room" className="bg-dark-800">Room</option>
              </select>
            </div>

            {/* Bedrooms & Bathrooms & Sqft */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Bedrooms</label>
                <select
                  value={propertyInput.bedrooms}
                  onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n} className="bg-dark-800">{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Bathrooms</label>
                <select
                  value={propertyInput.bathrooms}
                  onChange={(e) => updateField('bathrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n} className="bg-dark-800">{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Sq Meters</label>
                <Input
                  type="number"
                  value={propertyInput.sqft || ''}
                  onChange={(e) => updateField('sqft', parseInt(e.target.value) || 0)}
                  placeholder="80"
                  className="bg-dark-700 border-gray-600 text-white placeholder-gray-500 focus:border-gold-500/50 focus:ring-gold-500/20"
                />
              </div>
            </div>

            {/* Parking */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Parking Spaces</label>
              <select
                value={propertyInput.parking}
                onChange={(e) => updateField('parking', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
              >
                {[0,1,2,3,4].map(n => (
                  <option key={n} value={n} className="bg-dark-800">{n} {n === 0 ? '(None)' : n === 1 ? '(Single)' : '(Multiple)'}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Province</label>
                <select
                  value={propertyInput.location.province}
                  onChange={(e) => updateLocation('province', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                >
                  <option value="gauteng" className="bg-dark-800">Gauteng</option>
                  <option value="kwazulu_natal" className="bg-dark-800">KwaZulu-Natal</option>
                  <option value="western_cape" className="bg-dark-800">Western Cape</option>
                  <option value="mpumalanga" className="bg-dark-800">Mpumalanga</option>
                  <option value="limpopo" className="bg-dark-800">Limpopo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
                <select
                  value={propertyInput.location.city}
                  onChange={(e) => updateLocation('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-dark-700 text-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                >
                  {propertyInput.location.province === 'gauteng' && (
                    <>
                      <option value="Johannesburg" className="bg-dark-800">Johannesburg</option>
                      <option value="Pretoria" className="bg-dark-800">Pretoria</option>
                      <option value="Sandton" className="bg-dark-800">Sandton</option>
                    </>
                  )}
                  {propertyInput.location.province === 'kwazulu_natal' && (
                    <>
                      <option value="Durban" className="bg-dark-800">Durban</option>
                      <option value="Pietermaritzburg" className="bg-dark-800">Pietermaritzburg</option>
                    </>
                  )}
                  {propertyInput.location.province === 'western_cape' && (
                    <>
                      <option value="Cape Town" className="bg-dark-800">Cape Town</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Suburb (optional)</label>
                <Input
                  value={propertyInput.location.suburb || ''}
                  onChange={(e) => updateLocation('suburb', e.target.value)}
                  placeholder="Enter suburb"
                  className="bg-dark-700 border-gray-600 text-white placeholder-gray-500 focus:border-gold-500/50 focus:ring-gold-500/20"
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'hasGarden', label: 'Garden', icon: TreePine },
                  { key: 'hasPool', label: 'Pool', icon: Home },
                  { key: 'hasAirConditioning', label: 'A/C', icon: Wind },
                  { key: 'hasSecurity', label: 'Security', icon: Shield },
                  { key: 'hasFurnished', label: 'Furnished', icon: Sofa },
                  { key: 'hasParking', label: 'Parking', icon: Car, customKey: 'parking' },
                ].map(({ key, label, icon: Icon, customKey }) => {
                  const isActive = customKey 
                    ? propertyInput.parking > 0 
                    : propertyInput[key as keyof RentAnalysisInput] as boolean;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (customKey === 'parking') {
                          updateField('parking', propertyInput.parking > 0 ? 0 : 1);
                        } else {
                          updateField(key, !propertyInput[key as keyof RentAnalysisInput]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        isActive 
                          ? "border-gold-500 bg-gold-500/20 text-gold-400" 
                          : "border-gray-600 text-gray-400 hover:border-gray-500 hover:bg-dark-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full btn-premium text-gray-900"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {suggestion ? (
            <>
              {/* Main Price Card - Premium Dark */}
              <Card className="p-6 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-hidden relative border border-gold-500/20 hover-3d-card transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy-600/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-gold-400 text-sm font-medium mb-1">Market Rent Analysis</p>
                      <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium", getConfidenceBgColor(suggestion.confidence))}>
                        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", 
                          suggestion.confidence === 'high' ? "bg-green-500" :
                          suggestion.confidence === 'medium' ? "bg-yellow-500" : "bg-red-500"
                        )} />
                        <span className={getConfidenceColor(suggestion.confidence)}>
                          {suggestion.confidence.charAt(0).toUpperCase() + suggestion.confidence.slice(1)} Confidence
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-400/70 text-sm">Recommended Range</p>
                      <p className="text-2xl font-bold text-gradient-gold">{getRentRangeString(suggestion)}</p>
                    </div>
                  </div>

                  {/* Main Pricing Display */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-dark-800/50 border border-gray-700">
                      <p className="text-gold-400/70 text-sm mb-1">Minimum</p>
                      <p className="text-xl font-bold text-white">{formatRent(suggestion.minRent)}</p>
                      <p className="text-xs text-gray-500">Quick lease</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gold-500/20 border-2 border-gold-400/50 relative hover:scale-105 transition-transform">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gold-500 text-gray-900 text-xs rounded-full font-medium">
                        Recommended
                      </div>
                      <p className="text-gold-400 text-sm mb-1">Market Rate</p>
                      <p className="text-3xl font-bold text-gradient-gold">{formatRent(suggestion.marketRent)}</p>
                      <p className="text-xs text-gray-500">Optimal pricing</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-dark-800/50 border border-gray-700">
                      <p className="text-gold-400/70 text-sm mb-1">Maximum</p>
                      <p className="text-xl font-bold text-white">{formatRent(suggestion.maxRent)}</p>
                      <p className="text-xs text-gray-500">Premium</p>
                    </div>
                  </div>

                  {/* Competitiveness Indicator */}
                  {competitiveness && currentRent && (
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      competitiveness.status === 'competitive' ? "bg-gold-500/10 border-gold-500/30" :
                      competitiveness.status === 'underpriced' ? "bg-yellow-500/10 border-yellow-500/30" :
                      "bg-red-500/10 border-red-500/30"
                    )}>
                      {competitiveness.status === 'competitive' ? (
                        <CheckCircle2 className="w-5 h-5 text-gold-400" />
                      ) : competitiveness.status === 'underpriced' ? (
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-white">
                          {competitiveness.status === 'competitive' ? 'Rent is Competitive' :
                           competitiveness.status === 'underpriced' ? 'Rent is Below Market' : 
                           'Rent is Above Market'}
                        </p>
                        <p className="text-xs text-gray-400">{competitiveness.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Price Breakdown */}
              <Card className="glass-card p-5 hover-3d transition-all duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-gold-400" />
                  <h3 className="text-lg font-semibold text-white">Price Breakdown</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Base Rent (area average)', value: suggestion.baseRent, isPositive: false },
                    { label: 'Location Adjustment', value: suggestion.locationAdjustment, isPositive: true },
                    { label: 'Property Features', value: suggestion.propertyFeaturesAdjustment, isPositive: true },
                    { label: 'Seasonal Adjustment', value: suggestion.seasonalAdjustment, isPositive: suggestion.seasonalAdjustment >= 0 },
                    { label: 'Market Adjustment', value: suggestion.marketAdjustment, isPositive: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-gray-700">
                      <span className="text-sm text-gray-300">{item.label}</span>
                      <span className={cn(
                        "font-medium",
                        item.isPositive ? "text-gold-400" : "text-gray-300"
                      )}>
                        {item.value >= 0 ? '+' : ''}{formatRent(item.value)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gold-500/10 border border-gold-500/30">
                    <span className="text-sm font-medium text-gold-400">Market Rent</span>
                    <span className="text-lg font-bold text-gradient-gold">{formatRent(suggestion.marketRent)}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center p-3 rounded-lg bg-dark-800/50 border border-gray-700">
                    <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Recommended Days on Market</p>
                    <p className="text-lg font-bold text-white">{suggestion.recommendedDaysOnMarket}</p>
                  </div>
                  {suggestion.pricePerSqm && (
                    <div className="text-center p-3 rounded-lg bg-dark-800/50 border border-gray-700">
                      <Home className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Price per m²</p>
                      <p className="text-lg font-bold text-white">R{suggestion.pricePerSqm}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Comparables */}
              <Card className="glass-card p-5 hover-3d transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gold-400" />
                    <h3 className="text-lg font-semibold text-white">Comparable Properties</h3>
                  </div>
                  <Badge variant="outline" className="border-gold-500/30 text-gold-400">{suggestion.comparables.length} found</Badge>
                </div>
                
                <div className="space-y-3">
                  {suggestion.comparables.map((comp) => (
                    <div 
                      key={comp.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-dark-800/30 hover:border-gold-500/30 hover:bg-dark-700/50 transition-all cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{comp.title}</p>
                        <p className="text-sm text-gray-500">{comp.address}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-600">{comp.bedrooms} bed</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-600">{comp.bathrooms} bath</span>
                          <span className="text-xs text-gray-600">•</span>
                          <span className="text-xs text-gray-600">{comp.distance}km</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{formatRent(comp.rent)}</p>
                        <div className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          comp.similarityScore >= 80 ? "bg-gold-500/20 text-gold-400 border border-gold-500/30" :
                          comp.similarityScore >= 60 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          "bg-red-500/20 text-red-400 border border-red-500/30"
                        )}>
                          {comp.similarityScore}% match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Price History */}
              <Card className="glass-card p-5 hover-3d transition-all duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gold-400" />
                  <h3 className="text-lg font-semibold text-white">Price History</h3>
                </div>
                
                <div className="flex items-end justify-between h-32 gap-2">
                  {suggestion.priceHistory.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div 
                        className="w-full bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-md transition-all hover:from-navy-500 hover:to-gold-300"
                        style={{ 
                          height: `${((item.rent - Math.min(...suggestion.priceHistory.map(p => p.rent))) / 
                            (Math.max(...suggestion.priceHistory.map(p => p.rent)) - Math.min(...suggestion.priceHistory.map(p => p.rent))) * 100) || 50}%` 
                        }}
                      />
                      <p className="text-xs text-gray-600 mt-2 group-hover:text-gray-400 transition-colors">{item.date}</p>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-white transition-colors">{formatRent(item.rent)}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="glass-card p-5 hover-3d transition-all duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-gold-400" />
                  <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                </div>
                
                <div className="space-y-3">
                  {suggestion.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gold-500/10 border border-gold-500/20">
                      <CheckCircle2 className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-200">{rec}</p>
                    </div>
                  ))}
                </div>

                {/* Confidence Factors */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs font-medium text-gray-500 mb-2">Confidence Factors</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.confidenceFactors.map((factor, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            /* Empty State */
            <Card className="glass-card p-12 text-center hover-3d transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-navy-500/20 to-navy-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-500/30">
                <Sparkles className="w-10 h-10 text-gold-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Enter your property details on the left to generate AI-powered rent suggestions based on market data and comparable properties.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <Card className="glass p-4 bg-gradient-to-r from-dark-800/50 to-dark-900/50 border-gold-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 border border-gold-500/30">
            <Info className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <p className="font-medium text-gold-400">How AI Rent Suggestions Work</p>
            <p className="text-sm text-gray-400 mt-1">
              Our algorithm analyzes thousands of rental listings, considers seasonal trends, 
              property features, and local market conditions to provide data-driven rent recommendations. 
              The confidence score reflects the quality and quantity of comparable data available.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
