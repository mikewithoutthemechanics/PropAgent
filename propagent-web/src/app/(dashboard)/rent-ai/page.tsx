'use client';

import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Home, 
  Building,
  MapPin,
  Check
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { 
  RentSuggestion, 
  RentAnalysisInput,
  generateRentSuggestion,
  formatRent,
  getRentRangeString,
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

  const features = [
    { key: 'hasGarden', label: 'Garden' },
    { key: 'hasPool', label: 'Pool' },
    { key: 'hasAirConditioning', label: 'A/C' },
    { key: 'hasSecurity', label: 'Security' },
    { key: 'hasFurnished', label: 'Furnished' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-700 rounded-2xl p-6 border border-navy-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-navy-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-serif">AI Rent Suggestions</h1>
              <p className="text-navy-200 text-sm">Market-based pricing with comparable analysis</p>
            </div>
          </div>
          <Badge variant="outline" className="border-gold-500/30 text-gold-400 bg-gold-500/10">
            {seasonalInfo.currentSeason} Season
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="xl:col-span-1 p-5 bg-navy-900/50 border-navy-700">
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5 text-gold-400" />
            <h2 className="text-lg font-semibold text-white">Property Details</h2>
          </div>
          
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Property Address
              </label>
              <Input
                value={propertyInput.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main Street, Sandton"
                className="bg-navy-800 border-navy-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Current Rent */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Current Rent (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R</span>
                <Input
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(e.target.value)}
                  placeholder="15000"
                  className="pl-7 bg-navy-800 border-navy-600 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Property Type</label>
              <select
                value={propertyInput.propertyType}
                onChange={(e) => updateField('propertyType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
              >
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="room">Room</option>
              </select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bedrooms</label>
                <select
                  value={propertyInput.bedrooms}
                  onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bathrooms</label>
                <select
                  value={propertyInput.bathrooms}
                  onChange={(e) => updateField('bathrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sq Meters */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Sq Meters</label>
              <Input
                type="number"
                value={propertyInput.sqft || ''}
                onChange={(e) => updateField('sqft', parseInt(e.target.value) || 0)}
                placeholder="80"
                className="bg-navy-800 border-navy-600 text-white placeholder-slate-500"
              />
            </div>

            {/* Parking */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Parking Spaces</label>
              <select
                value={propertyInput.parking}
                onChange={(e) => updateField('parking', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
              >
                {[0,1,2,3,4].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'None' : n === 1 ? '1 Space' : `${n} Spaces`}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Province</label>
                <select
                  value={propertyInput.location.province}
                  onChange={(e) => updateLocation('province', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
                >
                  <option value="gauteng">Gauteng</option>
                  <option value="kwazulu_natal">KwaZulu-Natal</option>
                  <option value="western_cape">Western Cape</option>
                  <option value="mpumalanga">Mpumalanga</option>
                  <option value="limpopo">Limpopo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                <select
                  value={propertyInput.location.city}
                  onChange={(e) => updateLocation('city', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-navy-600 bg-navy-800 text-white"
                >
                  <option value="Johannesburg">Johannesburg</option>
                  <option value="Pretoria">Pretoria</option>
                  <option value="Sandton">Sandton</option>
                  <option value="Durban">Durban</option>
                  <option value="Cape Town">Cape Town</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {features.map(({ key, label }) => {
                  const isActive = propertyInput[key as keyof RentAnalysisInput] as boolean;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateField(key, !isActive)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        isActive 
                          ? "border-gold-500 bg-gold-500/20 text-gold-400" 
                          : "border-navy-600 text-slate-400 hover:border-navy-500"
                      )}
                    >
                      {isActive && <Check className="w-4 h-4" />}
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
              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium"
            >
              {isAnalyzing ? 'Analyzing...' : 'Generate Suggestions'}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {suggestion ? (
            <>
              {/* Main Price Card */}
              <Card className="p-6 bg-navy-900/80 border-navy-700">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gold-400 text-sm font-medium mb-2">Market Rent Analysis</p>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/20 text-gold-400 border border-gold-500/30">
                      {suggestion.confidence.charAt(0).toUpperCase() + suggestion.confidence.slice(1)} Confidence
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Recommended Range</p>
                    <p className="text-2xl font-bold text-gold-400">{getRentRangeString(suggestion)}</p>
                  </div>
                </div>

                {/* Pricing Display */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-navy-800/50 border border-navy-600">
                    <p className="text-slate-400 text-sm mb-1">Minimum</p>
                    <p className="text-xl font-bold text-white">{formatRent(suggestion.minRent)}</p>
                    <p className="text-xs text-slate-500">Quick lease</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gold-500/20 border-2 border-gold-500/50">
                    <p className="text-gold-400 text-sm mb-1">Market Rate</p>
                    <p className="text-3xl font-bold text-gold-400">{formatRent(suggestion.marketRent)}</p>
                    <p className="text-xs text-slate-500">Optimal pricing</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-navy-800/50 border border-navy-600">
                    <p className="text-slate-400 text-sm mb-1">Maximum</p>
                    <p className="text-xl font-bold text-white">{formatRent(suggestion.maxRent)}</p>
                    <p className="text-xs text-slate-500">Premium</p>
                  </div>
                </div>

                {/* Competitiveness */}
                {competitiveness && (
                  <div className="p-4 rounded-xl bg-navy-800/50 border border-navy-600">
                    <div className="flex items-center gap-3">
                      {competitiveness.status === 'underpriced' ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : competitiveness.status === 'overpriced' ? (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      ) : (
                        <Minus className="w-5 h-5 text-gold-400" />
                      )}
                      <div>
                        <p className="font-medium text-white">{competitiveness.message}</p>
                        <p className="text-sm text-slate-400">{competitiveness.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Comparable Properties */}
              <Card className="p-6 bg-navy-900/50 border-navy-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-gold-400" />
                  Comparable Properties
                </h3>
                <div className="space-y-3">
                  {suggestion.comparables.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-navy-800/30 border border-navy-600/50">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{comp.address}</p>
                          <p className="text-xs text-slate-400">{comp.bedrooms} bed • {comp.bathrooms} bath • {comp.sqft}sqm</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gold-400">{formatRent(comp.rent)}/mo</p>
                        <p className="text-xs text-slate-400">{comp.distance}km away</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Seasonal Recommendation */}
              <Card className="p-6 bg-navy-900/50 border-navy-700">
                <h3 className="text-lg font-semibold text-white mb-3">Market Insight</h3>
                <div className="p-4 rounded-lg bg-gold-500/10 border border-gold-500/30">
                  <p className="text-white">{seasonalInfo.recommendation}</p>
                  <p className="text-sm text-slate-400 mt-2">{seasonalInfo.rationale}</p>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center bg-navy-900/30 border-navy-700">
              <Sparkles className="w-12 h-12 text-gold-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Enter Property Details</h3>
              <p className="text-slate-400">Fill in the property details on the left and click "Generate Suggestions" to get AI-powered rent recommendations.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}