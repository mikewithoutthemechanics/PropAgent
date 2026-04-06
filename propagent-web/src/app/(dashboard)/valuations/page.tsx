'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Home, 
  MapPin, 
  Building2,
  Bed,
  Bath,
  Square,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  DollarSign,
  BarChart3,
  Target,
  Users,
  Car,
  TreePine,
  School,
  Bus,
  Shield
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, Badge } from '@/components/ui';
import { 
  calculateAVM, 
  analyzeNeighborhood, 
  calculatePricePerSqm, 
  calculateRentalYield,
  generateCMASubject,
  type AVMCalculationInput,
  type PropertyValuation,
  type ComparableSale,
  type ValueTrend,
  type NeighborhoodFactor
} from '@/lib/valuations';
import { formatCurrency } from '@/lib/utils';

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'flat', label: 'Flat' },
  { value: 'cottage', label: 'Cottage' },
];

const cities = [
  { value: 'Johannesburg', label: 'Johannesburg' },
  { value: 'Cape Town', label: 'Cape Town' },
  { value: 'Durban', label: 'Durban' },
  { value: 'Pretoria', label: 'Pretoria' },
  { value: 'Port Elizabeth', label: 'Port Elizabeth' },
  { value: 'Bloemfontein', label: 'Bloemfontein' },
];

export default function ValuationsPage() {
  const [formData, setFormData] = useState<AVMCalculationInput>({
    address: '',
    suburb: '',
    city: 'Johannesburg',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    yearBuilt: 2015,
    features: [],
    parkingSpaces: 1,
    pool: false,
    garden: false,
  });
  
  const [valuation, setValuation] = useState<PropertyValuation | null>(null);
  const [neighborhoodFactors, setNeighborhoodFactors] = useState<NeighborhoodFactor[]>([]);
  const [rentalYield, setRentalYield] = useState<{ grossYield: number; netYield: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'avm' | 'comparables' | 'trends' | 'neighborhood'>('avm');
  const [expandedComparables, setExpandedComparables] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [valuation]);

  const handleInputChange = (field: keyof AVMCalculationInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCalculate = () => {
    if (!formData.address || !formData.suburb) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const result = calculateAVM(formData);
      setValuation(result);
      
      const factors = analyzeNeighborhood(formData.suburb);
      setNeighborhoodFactors(factors);
      
      const yieldData = calculateRentalYield(result.estimatedValue, result.estimatedValue * 0.006);
      setRentalYield(yieldData);
      
      setIsCalculating(false);
    }, 1000);
  };

  const toggleComparable = (id: string) => {
    setExpandedComparables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'default';
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-slate-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schools': return School;
      case 'transport': return Bus;
      case 'safety': return Shield;
      case 'amenities': return Building2;
      case 'market': return DollarSign;
      case 'location': return MapPin;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-dark-950 -mx-4 px-4 py-6">
      {/* Animated Gradient Header */}
      <div className="gradient-header rounded-xl p-6 -mx-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white text-gradient-gold">Property Valuation</h1>
            <p className="text-slate-400 mt-1">Automated valuation model and comparable analysis</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="info-banner-premium text-amber-400 border-amber-500/30">Lightstone Integration</Badge>
            <Badge className="info-banner-premium text-amber-400 border-amber-500/30">Windeed Integration</Badge>
          </div>
        </div>
      </div>

      {/* Input Form - Glass Card */}
      <Card className="glass-card hover-3d-card transition-all duration-300">
        <CardHeader 
          title={<span className="text-gradient-gold">Property Details</span>} 
          subtitle="Enter property information for valuation"
          action={
            <Button 
              onClick={handleCalculate} 
              disabled={isCalculating || !formData.address || !formData.suburb}
              className="gap-2 btn-premium text-white"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              Calculate Value
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              label="Property Address"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          
          <Input
            label="Suburb"
            placeholder="Sandton"
            value={formData.suburb}
            onChange={(e) => handleInputChange('suburb', e.target.value)}
          />
          
          <Select
            label="City"
            options={cities}
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          
          <Select
            label="Property Type"
            options={propertyTypes}
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              min={1}
              max={10}
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
            />
            <Input
              label="Bathrooms"
              type="number"
              min={1}
              max={10}
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
            />
          </div>
          
          <Input
            label="Size (sqm)"
            type="number"
            min={10}
            value={formData.size}
            onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
          />
          
          <Input
            label="Year Built"
            type="number"
            min={1900}
            max={2026}
            value={formData.yearBuilt}
            onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value))}
          />
          
          <Input
            label="Parking Spaces"
            type="number"
            min={0}
            max={10}
            value={formData.parkingSpaces}
            onChange={(e) => handleInputChange('parkingSpaces', parseInt(e.target.value))}
          />
        </div>

        {/* Feature Toggles */}
        <div className="mt-4 pt-4 border-t border-dark-700">
          <label className="block text-sm font-medium text-slate-300 mb-3">Additional Features</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.pool}
                onChange={(e) => handleInputChange('pool', e.target.checked)}
                className="w-4 h-4 rounded border-dark-500 text-amber-500 focus:ring-amber-500 bg-dark-800"
              />
              <span className="text-sm text-slate-400">Pool</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.garden}
                onChange={(e) => handleInputChange('garden', e.target.checked)}
                className="w-4 h-4 rounded border-dark-500 text-amber-500 focus:ring-amber-500 bg-dark-800"
              />
              <span className="text-sm text-slate-400">Garden</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Results */}
      {valuation && (
        <>
          {/* Valuation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            <Card className="p-6 glass-card hover-3d-card animate-on-scroll">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Estimated Value</p>
                  <p className="text-2xl font-bold text-gradient-gold mt-1">
                    {formatCurrency(valuation.estimatedValue)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatCurrency(valuation.valueRange.low)} - {formatCurrency(valuation.valueRange.high)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <Calculator className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card hover-3d-card animate-on-scroll delay-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Price / sqm</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatCurrency(valuation.pricePerSqm)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{valuation.size} sqm total</p>
                </div>
                <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center">
                  <Square className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6 glass-card hover-3d-card animate-on-scroll delay-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Confidence</p>
                  <p className="text-2xl font-bold text-white mt-1">{valuation.confidenceScore}%</p>
                  <Badge variant={getConfidenceColor(valuation.confidence) as any} className="mt-1">
                    {valuation.confidence} confidence
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
              </div>
            </Card>

            {rentalYield && (
              <Card className="p-6 glass-card hover-3d-card animate-on-scroll delay-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Est. Rental Yield</p>
                    <p className="text-2xl font-bold text-gradient-gold mt-1">{rentalYield.grossYield}%</p>
                    <p className="text-xs text-slate-500 mt-1">Net: {rentalYield.netYield}%</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Tabs - Glass Card */}
          <Card className="glass-card">
            <div className="border-b border-amber-500/20 -mx-5 px-5 mb-4">
              <div className="flex gap-1 -mb-px">
                {[
                  { id: 'avm', label: 'Valuation Details' },
                  { id: 'comparables', label: 'Comparables' },
                  { id: 'trends', label: 'Value Trends' },
                  { id: 'neighborhood', label: 'Neighborhood' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-gradient-gold'
                        : 'border-transparent text-slate-400 hover:text-amber-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'avm' && (
              <div className="space-y-6">
                {/* Value Factors */}
                <div>
                  <h4 className="font-medium text-white mb-4 text-gradient-gold">Value Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valuation.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                        <div>
                          <p className="font-medium text-white">{factor.name}</p>
                          <p className="text-sm text-slate-400">{factor.description}</p>
                        </div>
                        <div className={`text-sm font-medium ${factor.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CMA Summary */}
                {(() => {
                  const cma = generateCMASubject(formData, valuation);
                  return (
                    <div className="p-4 bg-dark-800/50 rounded-lg border border-amber-500/20">
                      <h4 className="font-medium text-white mb-2 text-gradient-gold">Comparative Market Analysis</h4>
                      <p className="text-sm text-slate-400 mb-4">{cma.summary}</p>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-slate-300">Market Conditions: </span>
                        <span className="text-sm text-amber-400">{cma.marketConditions}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300 mb-2">Recommendations:</p>
                        <ul className="text-sm text-slate-400 space-y-1">
                          {cma.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'comparables' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {valuation.comparables.length} comparable sales found
                  </p>
                </div>
                {valuation.comparables.map((comp) => (
                  <div 
                    key={comp.id} 
                    className="border border-dark-700 rounded-lg overflow-hidden glass-card hover-3d-card transition-all"
                  >
                    <button
                      onClick={() => toggleComparable(comp.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-dark-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/30">
                          <Home className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-white">{comp.address}</p>
                          <p className="text-sm text-slate-400">
                            {comp.bedrooms} bed • {comp.bathrooms} bath • {comp.size} sqm • {comp.distance}km away
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gradient-gold">{formatCurrency(comp.salePrice)}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(comp.pricePerSqm)}/sqm</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-amber-400">{comp.similarity}% match</span>
                          {expandedComparables.has(comp.id) ? (
                            <ChevronUp className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedComparables.has(comp.id) && (
                      <div className="px-4 pb-4 bg-dark-800/50 border-t border-dark-700">
                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div>
                            <p className="text-xs text-slate-500">Sale Date</p>
                            <p className="text-sm font-medium text-white">
                              {new Date(comp.saleDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Source</p>
                            <p className="text-sm font-medium text-white capitalize">{comp.source}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Similarity Score</p>
                            <p className="text-sm font-medium text-amber-400">{comp.similarity}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                {/* Trend Chart Visual */}
                <div className="h-64 flex items-end gap-2 px-4">
                  {valuation.trends.map((trend, index) => {
                    const maxValue = Math.max(...valuation.trends.map(t => t.value));
                    const height = (trend.value / maxValue) * 100;
                    const isCurrent = index === valuation.trends.length - 1;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={`w-full rounded-t ${isCurrent ? 'bg-gradient-to-t from-amber-500 to-amber-400' : 'bg-dark-600'}`}
                          style={{ height: `${height}%`, minHeight: '20px' }}
                        />
                        <span className="text-xs text-slate-500">
                          {new Date(trend.date).toLocaleDateString('en-ZA', { month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Trend Data */}
                <div className="space-y-2">
                  {valuation.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                      <span className="text-sm text-slate-400">
                        {new Date(trend.date).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">
                          {formatCurrency(trend.value)}
                        </span>
                        <span className={`text-sm ${getTrendColor(trend.change)}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trend Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
                  <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <p className="text-xs text-slate-500 mb-1">12-Month Change</p>
                    <p className={`text-lg font-bold ${getTrendColor(valuation.trends[11].value - valuation.trends[0].value)}`}>
                      {((valuation.trends[11].value - valuation.trends[0].value) / valuation.trends[0].value * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <p className="text-xs text-slate-500 mb-1">Avg Monthly</p>
                    <p className="text-lg font-bold text-white">
                      {(valuation.trends.reduce((sum, t) => sum + t.change, 0) / 12).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                    <p className="text-xs text-slate-500 mb-1">High/Low</p>
                    <p className="text-lg font-bold text-amber-400">
                      {Math.max(...valuation.trends.map(t => t.change)).toFixed(1)}% / {Math.min(...valuation.trends.map(t => t.change)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'neighborhood' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {neighborhoodFactors.map((factor) => {
                    const Icon = getCategoryIcon(factor.category);
                    return (
                      <div key={factor.id} className="p-4 border border-dark-700 rounded-lg glass-card hover-3d-card transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/30">
                              <Icon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{factor.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{factor.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Score Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Score</span>
                            <span className="font-medium text-white">{factor.score.toFixed(1)}/10</span>
                          </div>
                          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                              style={{ width: `${factor.score * 10}%` }}
                            />
                          </div>
                        </div>
                        
                        <p className={`text-sm font-medium ${factor.impact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}% value impact
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                  <h4 className="font-medium text-white mb-2 text-gradient-gold">Neighborhood Analysis Summary</h4>
                  <p className="text-sm text-slate-400">
                    The {formData.suburb} area in {formData.city} shows a combined neighborhood score of{' '}
                    <span className="font-medium text-amber-400">
                      {(neighborhoodFactors.reduce((sum, f) => sum + f.score, 0) / neighborhoodFactors.length).toFixed(1)}/10
                    </span>
                    . The strongest factors are{' '}
                    {neighborhoodFactors
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 2)
                      .map(f => f.name)
                      .join(' and ')}
                    . This neighborhood is{' '}
                    {neighborhoodFactors.reduce((sum, f) => sum + f.impact, 0) > 5 ? 'above average' : 
                     neighborhoodFactors.reduce((sum, f) => sum + f.impact, 0) > -5 ? 'average' : 'below average'} for property values.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Empty State - Glass Card */}
      {!valuation && !isCalculating && (
        <Card className="p-12 glass-card hover-3d-card">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Calculator className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Valuation Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Enter property details above and click &quot;Calculate Value&quot; to get an automated valuation estimate based on market data and comparable sales.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}