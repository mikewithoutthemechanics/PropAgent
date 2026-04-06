'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Users, Home, DollarSign, MapPin, Calendar, Sparkles, Target, TrendingUp } from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { TenantCriteria, calculatePropertyMatch, rankMatches } from '@/lib/matching';
import { sampleProperties } from '@/lib/sample-data';
import { cn } from '@/lib/utils';

const sampleCriteria: TenantCriteria[] = [
  {
    id: 'c1',
    agentId: 'agent1',
    budget: { min: 8000, max: 15000 },
    location: { suburb: 'Umhlanga', city: 'Durban', province: 'KZN' },
    bedrooms: 2,
    urgency: 'immediate',
    propertyTypes: ['apartment', 'flat'],
    hasPets: false,
    employmentStatus: 'employed',
    dateCreated: '2024-01-15',
  },
  {
    id: 'c2',
    agentId: 'agent2',
    budget: { min: 12000, max: 20000 },
    location: { suburb: 'Ballito', city: 'Durban', province: 'KZN' },
    bedrooms: 3,
    urgency: '30_days',
    propertyTypes: ['house', 'townhouse'],
    hasPets: true,
    employmentStatus: 'business_owner',
    dateCreated: '2024-01-20',
  },
  {
    id: 'c3',
    agentId: 'agent1',
    budget: { min: 5000, max: 10000 },
    location: { city: 'Durban', province: 'KZN' },
    bedrooms: 1,
    urgency: '60_days',
    propertyTypes: ['flat'],
    hasPets: false,
    employmentStatus: 'employed',
    dateCreated: '2024-01-22',
  },
];

function AnimatedGradientHeader() {
  return (
    <div className="gradient-header rounded-2xl p-6 mb-6 relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>
      
      {/* Header content */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient-gold font-serif">
            Tenant Matching
          </h1>
          <p className="text-dark-200 mt-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            {sampleCriteria.length} active tenant criteria
            <span className="mx-2 text-dark-400">•</span>
            <span className="text-green-400">POPIA compliant</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="gap-1.5 bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            FFC Verified Only
          </Badge>
          <Button className="btn-premium text-white border-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Criteria
          </Button>
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  );
}

function GlassCard({ children, className, hoverEffect = false }: { 
  children: React.ReactNode; 
  className?: string;
  hoverEffect?: boolean;
}) {
  return (
    <div className={cn(
      "glass-card rounded-xl card-gold-shimmer",
      hoverEffect && "hover-3d-card cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}

function CriteriaCard({ 
  criteria, 
  isSelected, 
  onSelect,
  index 
}: { 
  criteria: TenantCriteria;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-xl text-left transition-all duration-300",
        isSelected
          ? "matching-selection"
          : "glass-light hover:bg-dark-600/50 hover:border-amber-500/30"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gradient-gold text-lg">
            R{criteria.budget.min.toLocaleString()} - R{criteria.budget.max.toLocaleString()}
          </p>
          <p className="text-dark-300 text-sm mt-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {criteria.location.suburb || criteria.location.city}, {criteria.location.province}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-dark-700/80 text-dark-200 border-dark-500/50 text-xs">
              {criteria.bedrooms} bed
            </Badge>
            <Badge
              className={cn(
                "text-xs border",
                criteria.urgency === 'immediate' 
                  ? "bg-red-500/20 text-red-400 border-red-500/30" 
                  : criteria.urgency === '30_days'
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-dark-700/80 text-dark-300 border-dark-500/50"
              )}
            >
              {criteria.urgency.replace('_', ' ')}
            </Badge>
            {criteria.hasPets && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                Pets OK
              </Badge>
            )}
          </div>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5 text-dark-900" />
          </div>
        )}
      </div>
    </button>
  );
}

function MatchCard({ 
  match, 
  index 
}: { 
  match: {
    propertyId: string;
    propertyTitle: string;
    matchScore: number;
    matchReasons: string[];
  };
  index: number;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "match-score-high";
    if (score >= 70) return "match-score-medium";
    return "match-score-low";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-400 to-green-500";
    if (score >= 70) return "from-amber-400 to-amber-500";
    return "from-gray-400 to-gray-500";
  };

  return (
    <div
      className="p-5 rounded-xl glass-light hover-3d-card group transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-4 h-4 text-amber-400" />
            <p className="font-medium text-dark-100 group-hover:text-gradient-gold transition-colors">
              {match.propertyTitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.matchReasons.map((reason, i) => (
              <Badge 
                key={i} 
                className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-xs backdrop-blur-sm"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {reason}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Match Score Circle */}
        <div className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden",
          getScoreColor(match.matchScore)
        )}>
          <div className="absolute inset-0 bg-gradient-to-br to-transparent opacity-50" />
          <div className="relative z-10 text-center">
            <div className={cn(
              "text-2xl font-bold bg-gradient-to-br bg-clip-text text-transparent",
              getScoreGradient(match.matchScore)
            )}>
              {match.matchScore}%
            </div>
          </div>
          {/* Animated ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${(match.matchScore / 100) * 176} 176`}
              className="text-white/30"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FloatingDecorations() {
  return (
    <>
      {/* Corner decorations */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-40 left-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(245, 158, 11, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </>
  );
}

function ScrollAnimationWrapper({ 
  children, 
  className,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn(
        "transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function EmptyState({ type }: { type: 'select' | 'no-results' }) {
  return (
    <div className="py-16 text-center">
      <div className="relative inline-block mb-4">
        {type === 'select' ? (
          <Filter className="w-14 h-14 text-dark-400 mx-auto" />
        ) : (
          <Search className="w-14 h-14 text-dark-400 mx-auto" />
        )}
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
      </div>
      <p className="text-dark-300 text-lg">
        {type === 'select' ? 'Select criteria to view matches' : 'No matching properties found'}
      </p>
      <p className="text-dark-500 text-sm mt-2">
        {type === 'no-results' 
          ? 'Try adjusting the criteria or adding more properties'
          : 'Choose a tenant criteria from the left panel'
        }
      </p>
    </div>
  );
}

export default function TenantMatchingPage() {
  const [criteria] = useState<TenantCriteria[]>(sampleCriteria);
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null);
  
  const matches = selectedCriteria
    ? criteria
        .filter(c => c.id === selectedCriteria)
        .flatMap(c => {
          const results = sampleProperties
            .map(p => calculatePropertyMatch(c, {
              id: p.id,
              title: p.title,
              pricing: { price: p.pricing.price },
              location: p.location,
              specs: { bedrooms: p.specs.bedrooms },
              type: p.type,
            }))
            .filter((m): m is NonNullable<typeof m> => m !== null);
          return rankMatches(results, c.urgency);
        })
    : [];

  const selectedCriteriaData = criteria.find(c => c.id === selectedCriteria);

  return (
    <div className="min-h-screen bg-dark-950 relative">
      {/* Floating decorations */}
      <FloatingDecorations />
      
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Animated Header */}
        <AnimatedGradientHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Criteria List - Left Panel */}
          <ScrollAnimationWrapper className="lg:col-span-1" delay={100}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-dark-600/50">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gradient-gold font-serif">
                  Active Criteria
                </h2>
              </div>
              
              <div className="space-y-3 stagger-children">
                {criteria.map((c, index) => (
                  <CriteriaCard
                    key={c.id}
                    criteria={c}
                    isSelected={selectedCriteria === c.id}
                    onSelect={() => setSelectedCriteria(c.id)}
                    index={index}
                  />
                ))}
              </div>
            </GlassCard>
          </ScrollAnimationWrapper>

          {/* Matches - Right Panel */}
          <ScrollAnimationWrapper className="lg:col-span-2" delay={200}>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-dark-600/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-gradient-gold font-serif">
                    Property Matches
                  </h2>
                  {selectedCriteriaData && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      {matches.length} found
                    </Badge>
                  )}
                </div>
                
                {/* Stats */}
                {selectedCriteriaData && matches.length > 0 && (
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      {matches.filter(m => m.matchScore >= 80).length} excellent
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {matches.filter(m => m.matchScore >= 70 && m.matchScore < 80).length} good
                    </div>
                  </div>
                )}
              </div>
              
              {selectedCriteria ? (
                <div className="space-y-3 stagger-children">
                  {matches.map((m, index) => (
                    <MatchCard key={m.propertyId} match={m} index={index} />
                  ))}
                  
                  {matches.length === 0 && (
                    <EmptyState type="no-results" />
                  )}
                </div>
              ) : (
                <EmptyState type="select" />
              )}
            </GlassCard>
          </ScrollAnimationWrapper>
        </div>

        {/* Info Banner */}
        <ScrollAnimationWrapper className="mt-6" delay={300}>
          <div className="info-banner-premium rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-bold text-lg">i</span>
              </div>
              <div>
                <p className="font-semibold text-gradient-gold text-lg">
                  POPIA Protected Matching
                </p>
                <p className="text-dark-300 mt-2 leading-relaxed">
                  Criteria-only matching ensures no client personal data ever touches our servers. 
                  Client requirements are anonymized and matched property-to-property. Agent contact 
                  details are kept internal. FFC verification required for all agents.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </div>
  );
}
