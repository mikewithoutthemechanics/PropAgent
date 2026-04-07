// AgentPing - Ranking & Reviews System
// NPS-based agent feedback (principals only)

export type ReviewStatus = 'pending' | 'completed' | 'disputed';

export interface Review {
  id: string;
  matchId: string;
  propertyId: string;
  
  // Reviewer (agent who closed the deal)
  reviewerId: string;
  reviewerName: string;
  
  // Reviewee (other agent in the deal)
  agentId: string;
  agentName: string;
  
  // Ratings
  npsScore: number; // 0-10 scale
  wouldRecommend: boolean;
  communicationRating: number; // 1-5
  professionalismRating: number; // 1-5
  dealCloseRating: number; // 1-5
  
  // Comments
  positiveFeedback?: string;
  constructiveFeedback?: string;
  
  // Status
  status: ReviewStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface AgentRanking {
  agentId: string;
  agentName: string;
  agencyId: string;
  
  // NPS Score (0-100)
  npsScore: number;
  
  // Total reviews
  reviewCount: number;
  
  // Individual ratings (1-5)
  avgCommunication: number;
  avgProfessionalism: number;
  avgDealClose: number;
  
  // Detractors, Passives, Promoters
  detractors: number;
  passives: number;
  promoters: number;
  
  // Ranking in agency
  agencyRank: number;
}

// Calculate NPS from reviews
export function calculateNPS(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  
  const promoters = reviews.filter(r => r.npsScore >= 9).length;
  const detractors = reviews.filter(r => r.npsScore <= 6).length;
  
  const nps = ((promoters - detractors) / reviews.length) * 100;
  return Math.round(nps);
}

// NPS Category
export function getNPSCategory(nps: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (nps >= 80) return 'excellent';
  if (nps >= 60) return 'good';
  if (nps >= 40) return 'average';
  return 'poor';
}

// NPS Color
export function getNPSColor(nps: number): string {
  const category = getNPSCategory(nps);
  switch (category) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'average': return 'text-gold-600';
    case 'poor': return 'text-red-600';
  }
}

// Sample reviews
export const sampleReviews: Review[] = [
  {
    id: 'rev1',
    matchId: 'match1',
    propertyId: 'prop1',
    reviewerId: 'agent1',
    reviewerName: 'John Smith',
    agentId: 'agent2',
    agentName: 'Sarah Johnson',
    npsScore: 10,
    wouldRecommend: true,
    communicationRating: 5,
    professionalismRating: 5,
    dealCloseRating: 5,
    positiveFeedback: 'Excellent communication throughout the process. Very professional and responsive.',
    status: 'completed',
    createdAt: '2024-02-15',
    respondedAt: '2024-02-16',
  },
  {
    id: 'rev2',
    matchId: 'match1',
    propertyId: 'prop1',
    reviewerId: 'agent2',
    reviewerName: 'Sarah Johnson',
    agentId: 'agent1',
    agentName: 'John Smith',
    npsScore: 9,
    wouldRecommend: true,
    communicationRating: 5,
    professionalismRating: 4,
    dealCloseRating: 5,
    positiveFeedback: 'Great to work with. Deal closed smoothly.',
    status: 'completed',
    createdAt: '2024-02-15',
    respondedAt: '2024-02-16',
  },
  {
    id: 'rev3',
    matchId: 'match2',
    propertyId: 'prop2',
    reviewerId: 'agent1',
    reviewerName: 'John Smith',
    agentId: 'agent2',
    agentName: 'Sarah Johnson',
    npsScore: 8,
    wouldRecommend: true,
    communicationRating: 4,
    professionalismRating: 5,
    dealCloseRating: 4,
    positiveFeedback: 'Very professional, good market knowledge.',
    constructiveFeedback: 'Could be slightly faster with responses.',
    status: 'completed',
    createdAt: '2024-03-01',
    respondedAt: '2024-03-02',
  },
  {
    id: 'rev4',
    matchId: 'match3',
    propertyId: 'prop3',
    reviewerId: 'agent3',
    reviewerName: 'Mike Williams',
    agentId: 'agent1',
    agentName: 'John Smith',
    npsScore: 5,
    wouldRecommend: false,
    communicationRating: 3,
    professionalismRating: 3,
    dealCloseRating: 3,
    positiveFeedback: 'Responsive at times.',
    constructiveFeedback: 'Communication was inconsistent. Felt like I had to chase for updates.',
    status: 'completed',
    createdAt: '2024-03-12',
    respondedAt: '2024-03-13',
  },
];

// Sample rankings
export const sampleRankings: AgentRanking[] = [
  {
    agentId: 'agent2',
    agentName: 'Sarah Johnson',
    agencyId: 'agency1',
    npsScore: 92,
    reviewCount: 67,
    avgCommunication: 4.9,
    avgProfessionalism: 4.8,
    avgDealClose: 4.9,
    detractors: 2,
    passives: 8,
    promoters: 57,
    agencyRank: 1,
  },
  {
    agentId: 'agent1',
    agentName: 'John Smith',
    agencyId: 'agency1',
    npsScore: 85,
    reviewCount: 42,
    avgCommunication: 4.7,
    avgProfessionalism: 4.6,
    avgDealClose: 4.8,
    detractors: 3,
    passives: 5,
    promoters: 34,
    agencyRank: 2,
  },
  {
    agentId: 'agent3',
    agentName: 'Mike Williams',
    agencyId: 'agency1',
    npsScore: 45,
    reviewCount: 12,
    avgCommunication: 3.2,
    avgProfessionalism: 3.5,
    avgDealClose: 3.8,
    detractors: 4,
    passives: 4,
    promoters: 4,
    agencyRank: 3,
  },
];