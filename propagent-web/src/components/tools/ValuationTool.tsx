'use client';

import { useState, useMemo } from 'react';
import { Home, Search, MapPin, HomeIcon, Calculator, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

interface ValuationToolProps {
  address?: string;
  onComplete?: (valuation: PropertyValuation) => void;
}

export interface PropertyValuation {
  address: string;
  suburb: string;
  province: string;
  estimatedValue: number;
  valueRange: { min: number; max: number };
  confidence: number;
  comparableCount: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

const marketTrends: Record<string, number> = {
  sandton: 8.5, cape_town: 6.2, durban: 4.8, port_elizabeth: 3.2, bloemfontein: 2.5,
  pretoria: 7.2, johannesburg: 6.8, midrand: 7.5, rosebank: 9.2, fourways: 7.8,
};

export function ValuationTool({ address, onComplete }: ValuationToolProps) {
  const [searchAddress, setSearchAddress] = useState(address || '');
  const [isValuing, setIsValuing] = useState(false);
  const [result, setResult] = useState<PropertyValuation | null>(null);
  const [step, setStep] = useState<'input' | 'details' | 'result'>('input');

  const [details, setDetails] = useState({
    bedrooms: 3,
    bathrooms: 2,
    garages: 1,
    floorSize: 180,
    erfSize: 400,
    yearBuilt: 2010,
    condition: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
    hasPool: false,
    hasSecurity: false,
  });

  const handleValuate = async () => {
    if (!searchAddress) return;
    
    setIsValuing(true);
    setStep('details');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suburbKey = searchAddress.split(',')[0].toLowerCase().trim().replace(/ /g, '_');
    const trend = marketTrends[suburbKey] || 5.5;
    
    const baseValue = details.bedrooms * 400000 + details.bathrooms * 150000 + details.floorSize * 8000;
    const conditionMultiplier = details.condition === 'excellent' ? 1.15 : 
                              details.condition === 'good' ? 1.0 : 
                              details.condition === 'fair' ? 0.85 : 0.7;
    const poolBonus = details.hasPool ? 250000 : 0;
    const securityBonus = details.hasSecurity ? 150000 : 0;
    
    const estimatedValue = Math.round((baseValue * conditionMultiplier + poolBonus + securityBonus) * (1 + trend / 100));
    const variance = estimatedValue * 0.12;
    
    const valuation: PropertyValuation = {
      address: searchAddress,
      suburb: searchAddress.split(',')[0].trim(),
      province: searchAddress.split(',')[1]?.trim() || 'Gauteng',
      estimatedValue,
      valueRange: {
        min: Math.round(estimatedValue - variance),
        max: Math.round(estimatedValue + variance),
      },
      confidence: Math.min(95, 70 + (details.floorSize > 150 ? 10 : 0) + (details.yearBuilt > 2015 ? 5 : 0)),
      comparableCount: Math.floor(8 + Math.random() * 10),
      factors: [
        { name: 'Location', impact: 'positive', description: `${trend}% annual appreciation in area` },
        { name: 'Property Size', impact: details.floorSize > 150 ? 'positive' : 'neutral', description: `${details.floorSize}m² floor area` },
        { name: 'Condition', impact: details.condition === 'good' ? 'positive' : 'neutral', description: `${details.condition} condition` },
        { name: 'Security', impact: details.hasSecurity ? 'positive' : 'neutral', description: details.hasSecurity ? '24/7 security' : 'No security' },
      ],
    };
    
    setResult(valuation);
    setStep('result');
    setIsValuing(false);
    onComplete?.(valuation);
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Property Valuation</h2>
              <p className="text-sm text-stone-500">Get an instant estimated property value</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Property Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="e.g., 14 Oak Lane, Sandton"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>
            </div>

            <Button
              onClick={handleValuate}
              disabled={!searchAddress || isValuing}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {isValuing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Get Valuation
                </div>
              )}
            </Button>
          </div>
        </Card>
      )}

      {step === 'details' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Property Details</h2>
              <p className="text-sm text-stone-500">{searchAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Bedrooms</label>
              <input
                type="number"
                value={details.bedrooms}
                onChange={(e) => setDetails(d => ({ ...d, bedrooms: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Bathrooms</label>
              <input
                type="number"
                value={details.bathrooms}
                onChange={(e) => setDetails(d => ({ ...d, bathrooms: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Garages</label>
              <input
                type="number"
                value={details.garages}
                onChange={(e) => setDetails(d => ({ ...d, garages: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Floor Size (m²)</label>
              <input
                type="number"
                value={details.floorSize}
                onChange={(e) => setDetails(d => ({ ...d, floorSize: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Year Built</label>
              <input
                type="number"
                value={details.yearBuilt}
                onChange={(e) => setDetails(d => ({ ...d, yearBuilt: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Condition</label>
              <select
                value={details.condition}
                onChange={(e) => setDetails(d => ({ ...d, condition: e.target.value as typeof details.condition }))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={details.hasPool}
                onChange={(e) => setDetails(d => ({ ...d, hasPool: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <HomeIcon className="w-4 h-4 text-cyan-600" />
              <span className="text-sm">Swimming Pool</span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={details.hasSecurity}
                onChange={(e) => setDetails(d => ({ ...d, hasSecurity: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <AlertCircle className="w-4 h-4 text-cyan-600" />
              <span className="text-sm">24/7 Security</span>
            </label>
          </div>

          <Button
            onClick={handleValuate}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
          >
            {isValuing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Calculate Value <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </Card>
      )}

      {step === 'result' && result && (
        <>
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
            <div className="text-center mb-4">
              <p className="text-sm text-cyan-600 font-medium">Estimated Property Value</p>
              <p className="text-4xl font-bold text-cyan-700">{formatCurrency(result.estimatedValue)}</p>
              <p className="text-sm text-stone-500 mt-2">
                Range: {formatCurrency(result.valueRange.min)} - {formatCurrency(result.valueRange.max)}
              </p>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                {result.confidence}% confidence
              </span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                {result.comparableCount} comparables
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Value Factors</h3>
            <div className="space-y-3">
              {result.factors.map((factor, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  factor.impact === 'positive' && "bg-green-50",
                  factor.impact === 'negative' && "bg-red-50",
                  factor.impact === 'neutral' && "bg-stone-50"
                )}>
                  <span className="text-sm font-medium text-stone-700">{factor.name}</span>
                  <span className="text-sm text-stone-600">{factor.description}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setStep('input'); setResult(null); }}
              className="flex-1"
            >
              New Valuation
            </Button>
            <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">
              Use This Value
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ValuationTool;