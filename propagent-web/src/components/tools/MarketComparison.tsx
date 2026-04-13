'use client';

import { useState } from 'react';
import { Home, MapPin, BedDouble, Bath, Car, Maximize, ArrowRight, Filter, X } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

interface ComparableProperty {
  id: string;
  address: string;
  suburb: string;
  price: number;
  beds: number;
  baths: number;
  garages: number;
  floorSize: number;
  pricePerSqm: number;
  daysOnMarket: number;
  listingType: 'sale' | 'rent';
  similarity: number;
}

const generateComparables = (address: string, type: 'sale' | 'rent' = 'sale'): ComparableProperty[] => {
  const base = parseInt(address.replace(/\D/g, '')) || 14;
  return [
    { id: '1', address: `${base + 5} Oak Lane, Sandton`, suburb: 'Sandton', price: 2450000, beds: 3, baths: 2, garages: 2, floorSize: 180, pricePerSqm: 13611, daysOnMarket: 28, listingType: type, similarity: 95 },
    { id: '2', address: `${base - 3} Oak Lane, Sandton`, suburb: 'Sandton', price: 2180000, beds: 2, baths: 2, garages: 1, floorSize: 145, pricePerSqm: 15034, daysOnMarket: 15, listingType: type, similarity: 88 },
    { id: '3', address: `${base + 10} Maple Ave, Sandton`, suburb: 'Sandton', price: 2890000, beds: 4, baths: 3, garages: 2, floorSize: 220, pricePerSqm: 13136, daysOnMarket: 42, listingType: type, similarity: 82 },
    { id: '4', address: `${base + 2} Pine Street, Johannesburg`, suburb: 'Johannesburg', price: 1950000, beds: 3, baths: 2, garages: 1, floorSize: 150, pricePerSqm: 13000, daysOnMarket: 52, listingType: type, similarity: 75 },
  ];
};

export function MarketComparison({ propertyAddress, listingType = 'sale' }: { propertyAddress?: string; listingType?: 'sale' | 'rent' }) {
  const [filters, setFilters] = useState({
    maxPrice: 5000000,
    beds: 0,
    maxDaysOnMarket: 90,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const comparables = generateComparables(propertyAddress || '14', listingType);
  const filtered = comparables.filter(c => 
    c.price <= filters.maxPrice &&
    c.beds >= filters.beds &&
    c.daysOnMarket <= filters.maxDaysOnMarket
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
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
            <option value={2000000}>Up to R2M</option>
            <option value={3000000}>Up to R3M</option>
            <option value={5000000}>Up to R5M</option>
            <option value={10000000}>Any price</option>
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
          <span className="text-sm text-stone-500 ml-auto">{filtered.length} properties</span>
        </div>
      </Card>

      {/* Property Cards */}
      <div className="grid gap-4">
        {filtered.map((property) => (
          <Card 
            key={property.id} 
            className={cn(
              "p-4 cursor-pointer transition-all",
              selectedId === property.id ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-stone-300"
            )}
            onClick={() => setSelectedId(property.id)}
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
                    <p className="text-lg font-bold text-stone-900">{formatCurrency(property.price)}</p>
                    {listingType === 'rent' && <span className="text-xs text-stone-500">/month</span>}
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
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      property.similarity >= 90 ? "bg-green-100 text-green-700" :
                      property.similarity >= 80 ? "bg-blue-100 text-blue-700" :
                      "bg-stone-100 text-stone-600"
                    )}>
                      {property.similarity}% match
                    </span>
                    <span className="text-xs text-stone-500">R{property.pricePerSqm}/m²</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Property Actions */}
      {selectedId && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <p className="text-sm text-stone-600">Select a comparable to view details</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedId(null)}>Cancel</Button>
              <Button>View Property</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketComparison;