'use client';

import { TrendingUp, TrendingDown, Home, DollarSign, Calendar, Percent, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

interface PropertyAnalyticsProps {
  suburb: string;
  province: string;
}

interface MarketStats {
  medianPrice: number;
  priceChange12m: number;
  avgDaysOnMarket: number;
  inventoryLevel: 'low' | 'medium' | 'high';
  demandLevel: 'low' | 'medium' | 'high';
  recommendedPrice: number;
  priceRangeLow: number;
  priceRangeHigh: number;
  rentalYield: number;
  vacancyRate: number;
}

// Simulated market data (in real app, this would come from an API)
const getMarketData = (suburb: string): MarketStats => {
  const baseMultiplier = suburb.toLowerCase().includes('sandton') ? 3.5 :
    suburb.toLowerCase().includes('cape') ? 2.8 :
    suburb.toLowerCase().includes('durban') ? 2.0 :
    1.5;
  
  return {
    medianPrice: 1800000 * baseMultiplier,
    priceChange12m: 4.2 + Math.random() * 3,
    avgDaysOnMarket: Math.floor(30 + Math.random() * 45),
    inventoryLevel: Math.random() > 0.5 ? 'low' : 'medium',
    demandLevel: Math.random() > 0.4 ? 'high' : 'medium',
    recommendedPrice: 1650000 * baseMultiplier,
    priceRangeLow: 1400000 * baseMultiplier,
    priceRangeHigh: 2100000 * baseMultiplier,
    rentalYield: 5.5 + Math.random() * 2,
    vacancyRate: 3 + Math.random() * 5,
  };
};

const ComparableProperty = ({
  address,
  price,
  beds,
  baths,
  size,
  daysOnMarket,
}: {
  address: string;
  price: number;
  beds: number;
  baths: number;
  size: number;
  daysOnMarket: number;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
    <div className="flex-1">
      <p className="text-sm font-medium text-stone-900">{address}</p>
      <p className="text-xs text-stone-500">{beds} bed • {baths} bath • {size} m²</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-stone-900">{formatCurrency(price)}</p>
      <p className="text-xs text-stone-500">{daysOnMarket} days</p>
    </div>
  </div>
);

export function PropertyAnalytics({ suburb, province }: PropertyAnalyticsProps) {
  const stats = getMarketData(suburb);
  const isPriceUp = stats.priceChange12m > 0;

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Market Analytics</h2>
              <p className="text-sm text-stone-500">{suburb}, {province}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">Median Price</p>
            <p className="text-xl font-bold text-stone-900">{formatCurrency(stats.medianPrice)}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">12-Month Change</p>
            <div className="flex items-center gap-1">
              {isPriceUp ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <p className={isPriceUp ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {Math.abs(stats.priceChange12m).toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">Days on Market</p>
            <p className="text-xl font-bold text-stone-900">{stats.avgDaysOnMarket}</p>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <p className="text-xs text-stone-500 mb-1">Rental Yield</p>
            <p className="text-xl font-bold text-emerald-600">{stats.rentalYield.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      {/* Supply & Demand */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-3">Supply (Active Listings)</h3>
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${stats.inventoryLevel === 'low' ? 'bg-red-100 text-red-600' :
                stats.inventoryLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-green-100 text-green-600'}
            `}>
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-900 capitalize">{stats.inventoryLevel}</p>
              <p className="text-xs text-stone-500">
                {stats.inventoryLevel === 'low' ? 'Few options available' : 
                 stats.inventoryLevel === 'medium' ? 'Balanced market' : 
                 'Plenty of options'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-700 mb-3">Demand Level</h3>
          <div className="flex items-center gap-3">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${stats.demandLevel === 'high' ? 'bg-green-100 text-green-600' :
                stats.demandLevel === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'}
            `}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-900 capitalize">{stats.demandLevel}</p>
              <p className="text-xs text-stone-500">
                {stats.demandLevel === 'high' ? 'Strong buyer interest' : 
                 stats.demandLevel === 'medium' ? 'Moderate activity' : 
                 'Slow market'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Price Recommendation */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Recommended Pricing Strategy</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-xs text-emerald-600 mb-1">Quick Sale</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(stats.priceRangeLow)}</p>
            <p className="text-xs text-emerald-500">List immediately</p>
          </div>
          <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-xs text-blue-600 mb-1">Market Value</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(stats.recommendedPrice)}</p>
            <p className="text-xs text-blue-500">Recommended</p>
          </div>
          <div className="flex-1 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
            <p className="text-xs text-purple-600 mb-1">Max Value</p>
            <p className="text-lg font-bold text-purple-700">{formatCurrency(stats.priceRangeHigh)}</p>
            <p className="text-xs text-purple-500">Negotiate up</p>
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg">
          <p className="text-sm text-stone-600">
            <strong>Strategy:</strong> {stats.demandLevel === 'high' 
              ? 'Price competitively to attract multiple offers' 
              : stats.demandLevel === 'medium'
              ? 'Price at market value for fair consideration'
              : 'Consider pricing below market togenerate interest'}
          </p>
        </div>
      </Card>

      {/* Comparable Properties */}
      <Card className="p-6">
        <h3 className="text-sm font-medium text-stone-700 mb-4">Comparable Properties</h3>
        <div className="divide-y divide-stone-100">
          <ComparableProperty
            address={`12 ${suburb} Road, ${province}`}
            price={stats.medianPrice * 0.95}
            beds={3}
            baths={2}
            size={180}
            daysOnMarket={28}
          />
          <ComparableProperty
            address={`8 ${suburb} Avenue, ${province}`}
            price={stats.medianPrice * 1.05}
            beds={4}
            baths={2}
            size={220}
            daysOnMarket={15}
          />
          <ComparableProperty
            address={`25 ${suburb} Street, ${province}`}
            price={stats.medianPrice}
            beds={3}
            baths={2}
            size={165}
            daysOnMarket={42}
          />
        </div>
      </Card>
    </div>
  );
}

export default PropertyAnalytics;