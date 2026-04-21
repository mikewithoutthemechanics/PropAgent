'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  TrendingUp,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { aiPropertyAnalytics, AIPropertyAnalyticsResult } from '@/lib/ai-client';

interface PropertyAnalyticsProps {
  suburb: string;
  province: string;
}

export function PropertyAnalytics({ suburb, province }: PropertyAnalyticsProps) {
  const [stats, setStats] = useState<AIPropertyAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!suburb) return;
    setLoading(true);
    setErrorMsg(null);
    const res = await aiPropertyAnalytics({ suburb, province });
    setLoading(false);
    if ('error' in res) {
      setErrorMsg(
        res.error.message ||
          'AI analytics unavailable. Check that GROQ_API_KEY is configured.',
      );
      return;
    }
    setStats(res.data);
  }, [suburb, province]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const isPriceUp = (stats?.priceChange12m ?? 0) > 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-1.5">
                AI Market Analytics
                <Sparkles className="w-4 h-4 text-blue-500" />
              </h2>
              <p className="text-sm text-stone-500">
                {suburb}
                {province ? `, ${province}` : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {loading && !stats && (
          <div className="py-12 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            AI analysing {suburb}…
          </div>
        )}

        {stats && (
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
                <p className={isPriceUp ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
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
        )}
      </Card>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-stone-700 mb-3">Supply (Active Listings)</h3>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stats.inventoryLevel === 'low'
                      ? 'bg-red-100 text-red-600'
                      : stats.inventoryLevel === 'medium'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-900 capitalize">
                    {stats.inventoryLevel}
                  </p>
                  <p className="text-xs text-stone-500">
                    {stats.inventoryLevel === 'low'
                      ? 'Few options available'
                      : stats.inventoryLevel === 'medium'
                      ? 'Balanced market'
                      : 'Plenty of options'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-stone-700 mb-3">Demand Level</h3>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stats.demandLevel === 'high'
                      ? 'bg-green-100 text-green-600'
                      : stats.demandLevel === 'medium'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-stone-900 capitalize">
                    {stats.demandLevel}
                  </p>
                  <p className="text-xs text-stone-500">
                    {stats.demandLevel === 'high'
                      ? 'Strong buyer interest'
                      : stats.demandLevel === 'medium'
                      ? 'Moderate activity'
                      : 'Slow market'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-stone-700 mb-4">Recommended Pricing Strategy</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-xs text-emerald-600 mb-1">Quick Sale</p>
                <p className="text-lg font-bold text-emerald-700">
                  {formatCurrency(stats.priceRangeLow)}
                </p>
                <p className="text-xs text-emerald-500">List immediately</p>
              </div>
              <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <p className="text-xs text-blue-600 mb-1">Market Value</p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(stats.recommendedPrice)}
                </p>
                <p className="text-xs text-blue-500">Recommended</p>
              </div>
              <div className="flex-1 p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                <p className="text-xs text-purple-600 mb-1">Max Value</p>
                <p className="text-lg font-bold text-purple-700">
                  {formatCurrency(stats.priceRangeHigh)}
                </p>
                <p className="text-xs text-purple-500">Negotiate up</p>
              </div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600">
                <strong>Strategy:</strong>{' '}
                {stats.demandLevel === 'high'
                  ? 'Price competitively to attract multiple offers'
                  : stats.demandLevel === 'medium'
                  ? 'Price at market value for fair consideration'
                  : 'Consider pricing below market to generate interest'}
              </p>
            </div>
          </Card>

          {stats.insights.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-stone-700 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                AI Insights
              </h3>
              <ul className="space-y-2">
                {stats.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-stone-700 leading-relaxed">
                    • {insight}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default PropertyAnalytics;
