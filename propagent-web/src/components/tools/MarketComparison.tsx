'use client';

import { useState } from 'react';
import { Home, MapPin, BedDouble, Bath, Car, Maximize, Filter, Search, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import {
  aiMarketComparison,
  AIComparable,
  AIMarketComparisonResult,
} from '@/lib/ai-client';

interface MarketComparisonProps {
  propertyAddress?: string;
  listingType?: 'sale' | 'rent';
}

export function MarketComparison({ propertyAddress, listingType = 'sale' }: MarketComparisonProps) {
  const [address, setAddress] = useState(propertyAddress || '');
  const [type, setType] = useState<'sale' | 'rent'>(listingType);
  const [filters, setFilters] = useState({ maxPrice: 10_000_000, beds: 0, maxDaysOnMarket: 120 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AIMarketComparisonResult | null>(null);

  const runSearch = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    const [suburb, city] = address.split(',').map((s) => s.trim());
    const res = await aiMarketComparison({
      address,
      suburb: suburb || address,
      city,
      listingType: type,
    });
    setLoading(false);
    if ('error' in res) {
      setErrorMsg(
        res.error.message ||
          'AI market comparison is unavailable. Check that GROQ_API_KEY is configured.',
      );
      return;
    }
    setResult(res.data);
  };

  const comparables: AIComparable[] = result?.comparables ?? [];
  const filtered = comparables.filter((c) =>
    c.price <= filters.maxPrice &&
    c.beds >= filters.beds &&
    c.daysOnMarket <= filters.maxDaysOnMarket,
  );

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">AI Market Comparison</h3>
            <p className="text-xs text-stone-500">Groq-powered comparables for any SA suburb</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 14 Oak Lane, Sandton"
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'sale' | 'rent')}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
          >
            <option value="sale">For sale</option>
            <option value="rent">To rent</option>
          </select>
          <Button onClick={runSearch} disabled={!address.trim() || loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" /> Run AI comparison
              </div>
            )}
          </Button>
        </div>
        {errorMsg && (
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        )}
      </Card>

      {result && (
        <>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-stone-500">Median</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(result.medianPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Avg days on market</p>
                <p className="text-lg font-bold text-blue-700">{result.averageDaysOnMarket}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Comparables</p>
                <p className="text-lg font-bold text-blue-700">{result.comparables.length}</p>
              </div>
            </div>
            {result.summary && (
              <p className="mt-3 text-sm text-stone-700 border-t border-blue-200 pt-3">
                {result.summary}
              </p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Filter className="w-4 h-4" />
                <span>Filters:</span>
              </div>
              <select
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }))}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              >
                <option value={type === 'rent' ? 20_000 : 2_000_000}>{type === 'rent' ? 'Up to R20k/m' : 'Up to R2M'}</option>
                <option value={type === 'rent' ? 40_000 : 5_000_000}>{type === 'rent' ? 'Up to R40k/m' : 'Up to R5M'}</option>
                <option value={type === 'rent' ? 80_000 : 10_000_000}>{type === 'rent' ? 'Up to R80k/m' : 'Up to R10M'}</option>
                <option value={type === 'rent' ? 200_000 : 50_000_000}>Any price</option>
              </select>
              <select
                value={filters.beds}
                onChange={(e) => setFilters(f => ({ ...f, beds: Number(e.target.value) }))}
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              >
                <option value={0}>Any beds</option>
                <option value={2}>2+ beds</option>
                <option value={3}>3+ beds</option>
                <option value={4}>4+ beds</option>
              </select>
              <span className="text-sm text-stone-500 ml-auto">{filtered.length} of {comparables.length}</span>
            </div>
          </Card>

          <div className="grid gap-4">
            {filtered.map((property) => (
              <div
                key={property.id}
                onClick={() => setSelectedId(property.id)}
                className={cn(
                  'card p-4 cursor-pointer transition-all',
                  selectedId === property.id ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-stone-300',
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-stone-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-stone-900">{property.address}</p>
                        <p className="text-sm text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {property.suburb}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-stone-900">
                          {formatCurrency(property.price)}
                          {property.listingType === 'rent' && (
                            <span className="text-xs text-stone-500 font-normal">/month</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-stone-600">
                      <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" /> {property.beds}</span>
                      <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {property.baths}</span>
                      <span className="flex items-center gap-1"><Car className="w-3 h-3" /> {property.garages}</span>
                      <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {property.floorSize} m²</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100">
                      <span className="text-xs text-stone-500">{property.daysOnMarket} days on market</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            property.similarity >= 90
                              ? 'bg-green-100 text-green-700'
                              : property.similarity >= 80
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-stone-100 text-stone-600',
                          )}
                        >
                          {property.similarity}% match
                        </span>
                        <span className="text-xs text-stone-500">R{property.pricePerSqm}/m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!result && !loading && !errorMsg && (
        <Card className="p-8 text-center text-sm text-stone-500">
          Enter a suburb or address above and press <span className="font-medium text-stone-700">Run AI comparison</span> to pull live comparables from Groq.
        </Card>
      )}
    </div>
  );
}

export default MarketComparison;
