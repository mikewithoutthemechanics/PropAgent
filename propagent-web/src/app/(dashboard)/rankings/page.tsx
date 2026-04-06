'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trophy, Star, Users, TrendingUp, TrendingDown, Minus, Shield, Crown } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { AgentRanking, sampleRankings, getNPSCategory, getNPSColor } from '@/lib/rankings';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const topPerformer = useMemo(() => {
    return [...sampleRankings].sort((a, b) => b.npsScore - a.npsScore)[0];
  }, []);

  const stats = useMemo(() => {
    const avgNps = sampleRankings.reduce((sum, r) => sum + r.npsScore, 0) / sampleRankings.length;
    const totalReviews = sampleRankings.reduce((sum, r) => sum + r.reviewCount, 0);
    const top3Avg = sampleRankings.slice(0, 3).reduce((sum, r) => sum + r.npsScore, 0) / 3;
    
    return {
      avgNps: Math.round(avgNps),
      totalReviews,
      top3Avg: Math.round(top3Avg),
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Animated Gradient Header */}
      <div className={cn(
        "gradient-header rounded-xl p-6 relative overflow-hidden transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Rankings</h1>
            <p className="text-white/60 mt-1">
              Performance scores • NPS-based feedback • Principals only
            </p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 w-fit">
            <Crown className="w-3 h-3" />
            Principal Access Only
          </Badge>
        </div>
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <Card className={cn(
          "glass-card p-6 hover-3d-card transition-all duration-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg glow-gold">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-amber-400/80 text-sm">Top Performer</p>
              <p className="text-2xl font-bold text-white">{topPerformer.agentName}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-amber-400">{topPerformer.npsScore} NPS</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/60">{topPerformer.reviewCount} reviews</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <Card className={cn(
          "glass-card p-4 hover-3d transition-all duration-300 group",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.avgNps}</p>
              <p className="text-xs text-white/50">Avg NPS</p>
            </div>
          </div>
        </Card>
        
        <Card className={cn(
          "glass-card p-4 hover-3d transition-all duration-300 group",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
              <p className="text-xs text-white/50">Total Reviews</p>
            </div>
          </div>
        </Card>
        
        <Card className={cn(
          "glass-card p-4 hover-3d transition-all duration-300 group",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.top3Avg}</p>
              <p className="text-xs text-white/50">Top 3 Avg</p>
            </div>
          </div>
        </Card>
        
        <Card className={cn(
          "glass-card p-4 hover-3d transition-all duration-300 group",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sampleRankings.length}</p>
              <p className="text-xs text-white/50">Ranked Agents</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rankings Table */}
      <Card className={cn(
        "glass-card overflow-hidden transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Agency Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">NPS Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Reviews</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Communication</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Professionalism</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Deal Close</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">D/P/N</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sampleRankings.map((ranking, index) => (
                <tr key={ranking.agentId} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {index === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-xs font-bold shadow-lg glow-gold">
                          1
                        </span>
                      ) : index === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-white/20 text-white/60 flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                      ) : (
                        <span className="w-6 h-6 text-white/40 text-xs font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        index === 0 ? "bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-500/30 text-amber-400" :
                        index === 1 ? "bg-white/10 text-white/60" :
                        index === 2 ? "bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 text-orange-400" :
                        "bg-white/5 text-white/60"
                      )}>
                        {ranking.agentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-white">{ranking.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold text-lg", getNPSColor(ranking.npsScore))}>
                      {ranking.npsScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    <span>{ranking.reviewCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-white/80">
                      <span>{ranking.avgCommunication.toFixed(1)}</span>
                      <Star className="w-3 h-3 text-amber-500" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-white/80">
                      <span>{ranking.avgProfessionalism.toFixed(1)}</span>
                      <Star className="w-3 h-3 text-amber-500" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-white/80">
                      <span>{ranking.avgDealClose.toFixed(1)}</span>
                      <Star className="w-3 h-3 text-amber-500" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-red-400">{ranking.detractors}</span>
                      <span className="text-amber-400">{ranking.passives}</span>
                      <span className="text-green-400">{ranking.promoters}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NPS Distribution */}
      <Card className={cn(
        "glass-card p-4 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <h3 className="font-semibold text-white mb-4">NPS Distribution</h3>
        <div className="space-y-3">
          {sampleRankings.map(ranking => (
            <div key={ranking.agentId} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium text-white/70 truncate">{ranking.agentName}</span>
              <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-red-500/80" 
                  style={{ width: `${(ranking.detractors / ranking.reviewCount) * 100}%` }}
                />
                <div 
                  className="h-full bg-amber-400/80" 
                  style={{ width: `${(ranking.passives / ranking.reviewCount) * 100}%` }}
                />
                <div 
                  className="h-full bg-green-500/80" 
                  style={{ width: `${(ranking.promoters / ranking.reviewCount) * 100}%` }}
                />
              </div>
              <span className="w-16 text-sm text-right text-white/50">
                {ranking.reviewCount}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="text-white/50">Detractors (0-6)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="text-white/50">Passives (7-8)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-white/50">Promoters (9-10)</span>
          </div>
        </div>
      </Card>

      {/* Info Banner */}
      <Card className={cn(
        "glass p-4 info-banner-premium transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-white">Confidential Rankings</p>
            <p className="text-sm text-white/60 mt-1">
              Agent rankings are visible only to agency principals. Individual agents cannot see their own scores.
              This creates quiet performance pressure while maintaining professional relationships.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}