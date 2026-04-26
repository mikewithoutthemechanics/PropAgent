// AI Tenant Screener
// Scores tenants based on criteria

export interface TenantApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  employmentStatus: 'employed' | 'self-employed' | 'student' | 'unemployed';
  monthlyIncome: number;
  creditScore?: number;
  references: Array<{
    name: string;
    phone: string;
    relationship: string;
    responds?: boolean;
  }>;
  currentAddress: string;
  moveInDate: string;
  pets: boolean;
  petDetails?: string;
}

export interface ScreeningCriteria {
  requiredIncomeMultiple: number; // e.g., 3 = rent should be ≤ 1/3 income
  requireCreditCheck: boolean;
  minCreditScore: number;
  requireReferences: boolean;
  employmentVerified: boolean;
}

export interface TenantScore {
  overallScore: number; // 0-100
  incomeScore: number;
  creditScore: number;
  referenceScore: number;
  employmentScore: number;
  risks: string[];
  recommendation: 'approve' | 'review' | 'decline';
  summary: string;
}

export function scoreTenant(
  application: TenantApplication,
  propertyRent: number,
  criteria: ScreeningCriteria = {
    requiredIncomeMultiple: 3,
    requireCreditCheck: true,
    minCreditScore: 650,
    requireReferences: true,
    employmentVerified: true
  }
): TenantScore {
  const risks: string[] = [];
  let incomeScore = 0;
  let creditScore = 0;
  let referenceScore = 0;
  let employmentScore = 0;
  
  // Calculate income score (rent should be ≤ 1/3 of income)
  const affordableRent = propertyRent;
  const monthlyIncome = application.monthlyIncome;
  const rentToIncomeRatio = affordableRent > 0 ? monthlyIncome / affordableRent : 0;
  
  if (rentToIncomeRatio >= criteria.requiredIncomeMultiple) {
    incomeScore = 100;
  } else if (rentToIncomeRatio >= 2.5) {
    incomeScore = 75;
    risks.push("Income slightly below ideal threshold");
  } else if (rentToIncomeRatio >= 2) {
    incomeScore = 50;
    risks.push("Income may be stretched");
  } else {
    incomeScore = 25;
    risks.push("Income does not meet requirements");
  }
  
  // Calculate credit score
  if (application.creditScore) {
    if (application.creditScore >= criteria.minCreditScore) {
      creditScore = 100;
    } else if (application.creditScore >= 550) {
      creditScore = 60;
      risks.push("Credit score below preferred");
    } else {
      creditScore = 20;
      risks.push("Poor credit score");
    }
  } else {
    creditScore = 50;
    risks.push("No credit check available");
  }
  
  // Reference score
  if (application.references.length > 0) {
    const respondingRefs = application.references.filter(r => r.responds !== false).length;
    referenceScore = respondingRefs === application.references.length ? 100 : 50;
    if (respondingRefs < application.references.length) {
      risks.push("Some references not responding");
    }
  } else {
    referenceScore = 30;
    risks.push("No references provided");
  }
  
  // Employment score
  if (application.employmentStatus === 'employed') {
    employmentScore = 100;
  } else if (application.employmentStatus === 'self-employed') {
    employmentScore = 80;
  } else if (application.employmentStatus === 'student') {
    employmentScore = 50;
    risks.push("Student - guarantor may be required");
  } else {
    employmentScore = 20;
    risks.push("Not employed");
  }
  
  // Calculate overall score
  const weights = { income: 0.35, credit: 0.3, references: 0.15, employment: 0.2 };
  const overallScore = Math.round(
    incomeScore * weights.income +
    creditScore * weights.credit +
    referenceScore * weights.references +
    employmentScore * weights.employment
  );
  
  // Generate recommendation
  let recommendation: 'approve' | 'review' | 'decline';
  if (overallScore >= 75 && risks.length === 0) {
    recommendation = 'approve';
  } else if (overallScore >= 50) {
    recommendation = 'review';
  } else {
    recommendation = 'decline';
  }
  
  // Summary
  const summary = `${application.name} scores ${overallScore}/100. ${recommendation === 'approve' ? 'Recommended for approval' : recommendation === 'review' ? 'Requires additional review' : 'Does not meet criteria'}.`;
  
  return {
    overallScore,
    incomeScore,
    creditScore,
    referenceScore,
    employmentScore,
    risks,
    recommendation,
    summary
  };
}

export function generateTenantReport(
  application: TenantApplication,
  score: TenantScore,
  propertyRent: number
): string {
  return `TENANT SCREENING REPORT
${'='.repeat(40)}

Applicant: ${application.name}
Email: ${application.email}
Phone: ${application.phone}

Property Rent: R${propertyRent.toLocaleString()}/month
Applicant Income: R${application.monthlyIncome.toLocaleString()}/month

SCORES
${'-'.repeat(20)}
Income: ${score.incomeScore}/100
Credit: ${score.creditScore}/100
References: ${score.referenceScore}/100
Employment: ${score.employmentScore}/100

OVERALL: ${score.overallScore}/100 - ${score.recommendation.toUpperCase()}

${score.risks.length > 0 ? 'RISKS\n' + score.risks.map(r => `• ${r}`).join('\n') : ''}

${score.summary}
`;
}
