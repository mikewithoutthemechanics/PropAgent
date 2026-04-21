// Agent Loop - Escrow & Payment System
// Secure commission holding and release

export type EscrowStatus = 
  | 'pending_deposit'    // Awaiting agent deposits
  | 'deposited'         // Both agents deposited
  | 'in_verification' // Deal under verification
  | 'released'         // Funds released to agents
  | 'disputed'         // Dispute raised
  | 'forfeited';       // Off-app closure penalty

export interface EscrowTransaction {
  id: string;
  matchId: string;
  propertyId: string;
  propertyTitle: string;
  
  // Agent 1 (Listing Agent)
  agent1Id: string;
  agent1Name: string;
  agent1Deposit: number;
  agent1DepositStatus: 'pending' | ' deposited' | 'released';
  agent1Share: number; // Their portion after fees
  
  // Agent 2 (Introducing Agent)  
  agent2Id: string;
  agent2Name: string;
  agent2Deposit: number;
  agent2DepositStatus: 'pending' | 'deposited' | 'released';
  agent2Share: number;
  
  // Deal Details
  propertyPrice: number;
  commissionPercent: number;
  totalCommission: number;
  agreedSplit: number; // 50/50 default or negotiated
  
  // Platform Fee
  platformFeePercent: number;
  escrowFee: number;
  
  // Verification
  verificationMethod: 'lightstone' | 'windindeed' | 'conveyancer';
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationDate?: string;
  verificationProof?: string;
  
  // Timeline
  createdAt: string;
  depositedAt?: string;
  verificationStartedAt?: string;
  releasedAt?: string;
  
  // Status
  status: EscrowStatus;
}

// Calculate escrow amounts
export function calculateEscrow(
  propertyPrice: number,
  commissionPercent: number = 6, // Standard 6%
  agreedSplit: number = 50, // 50/50 split
  platformFeePercent: number = 1.5, // 1.5% platform fee
  escrowCharge: number = 250 // R250 escrow fee
) {
  const totalCommission = propertyPrice * (commissionPercent / 100);
  const grossShare = totalCommission * (agreedSplit / 100);
  
  const platformFee = grossShare * (platformFeePercent / 100);
  const netShare = grossShare - platformFee - escrowCharge;
  
  return {
    totalCommission,
    grossShare,
    platformFee,
    escrowCharge,
    netShare,
  };
}

// Verification required before release
export function requiresVerification(escrow: EscrowTransaction): boolean {
  return escrow.status === 'deposited' || escrow.status === 'in_verification';
}

// Can release funds
export function canReleaseFunds(escrow: EscrowTransaction): boolean {
  return (
    escrow.status === 'deposited' &&
    escrow.verificationStatus === 'verified'
  );
}

// Sample escrow transactions
export const sampleEscrowTransactions: EscrowTransaction[] = [
  {
    id: 'escrow1',
    matchId: 'match1',
    propertyId: 'prop1',
    propertyTitle: 'Ocean View Apartment - Umhlanga',
    agent1Id: 'agent1',
    agent1Name: 'John Smith',
    agent1Deposit: 4500,
    agent1DepositStatus: 'deposited',
    agent1Share: 4050,
    agent2Id: 'agent2',
    agent2Name: 'Sarah Johnson',
    agent2Deposit: 4500,
    agent2DepositStatus: 'deposited',
    agent2Share: 4050,
    propertyPrice: 1500000,
    commissionPercent: 6,
    totalCommission: 90000,
    agreedSplit: 50,
    platformFeePercent: 1.5,
    escrowFee: 250,
    verificationMethod: 'lightstone',
    verificationStatus: 'verified',
    verificationDate: '2024-02-15',
    createdAt: '2024-02-10',
    depositedAt: '2024-02-12',
    verificationStartedAt: '2024-02-14',
    releasedAt: '2024-02-16',
    status: 'released',
  },
  {
    id: 'escrow2',
    matchId: 'match2',
    propertyId: 'prop2',
    propertyTitle: 'Modern Townhouse - Ballito',
    agent1Id: 'agent1',
    agent1Name: 'John Smith',
    agent1Deposit: 6000,
    agent1DepositStatus: 'deposited',
    agent1Share: 5400,
    agent2Id: 'agent2',
    agent2Name: 'Sarah Johnson',
    agent2Deposit: 6000,
    agent2DepositStatus: 'deposited',
    agent2Share: 5400,
    propertyPrice: 2000000,
    commissionPercent: 6,
    totalCommission: 120000,
    agreedSplit: 50,
    platformFeePercent: 1.5,
    escrowFee: 250,
    verificationMethod: 'lightstone',
    verificationStatus: 'pending',
    createdAt: '2024-03-01',
    depositedAt: '2024-03-03',
    verificationStartedAt: '2024-03-04',
    status: 'in_verification',
  },
  {
    id: 'escrow3',
    matchId: 'match3',
    propertyId: 'prop3',
    propertyTitle: 'Beach Cottage - Scottburgh',
    agent1Id: 'agent1',
    agent1Name: 'John Smith',
    agent1Deposit: 0,
    agent1DepositStatus: 'pending',
    agent1Share: 2700,
    agent2Id: 'agent3',
    agent2Name: 'Mike Williams',
    agent2Deposit: 0,
    agent2DepositStatus: 'pending',
    agent2Share: 2700,
    propertyPrice: 900000,
    commissionPercent: 6,
    totalCommission: 54000,
    agreedSplit: 50,
    platformFeePercent: 1.5,
    escrowFee: 250,
    verificationMethod: 'windindeed',
    verificationStatus: 'pending',
    createdAt: '2024-03-10',
    status: 'pending_deposit',
  },
];