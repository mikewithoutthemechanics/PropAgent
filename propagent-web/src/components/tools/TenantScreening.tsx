'use client';

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, User, Building, CreditCard, FileText, Phone, Mail, Search } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

interface TenantApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedProperty: string;
  applicationDate: string;
  income: number;
  employmentStatus: 'employed' | 'self_employed' | 'contract' | 'retired' | 'unemployed';
  creditScore: number;
  hasPets: boolean;
  petDetails?: string;
  references: {
    landlord: string;
    landlordPhone: string;
    response: 'good' | 'bad' | 'pending' | 'no_response';
  }[];
}

interface ScreeningResult {
  recommendation: 'approve' | 'conditional' | 'decline';
  score: number;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning' | 'pending';
    details: string;
  }[];
  riskFactors: string[];
}

const generateScreeningResult = (application: TenantApplication): ScreeningResult => {
  const checks = [];
  const riskFactors = [];
  let score = 100;

  // Income check (must earn 3x rent)
  const requiredIncome = 18000 * 3;
  const incomePass = application.income >= requiredIncome;
  checks.push({
    name: 'Income Verification',
    status: incomePass ? 'pass' : 'fail',
    details: incomePass 
      ? `R${application.income.toLocaleString()} meets 3x rent requirement`
      : `Income below required R${requiredIncome.toLocaleString()}`,
  });
  if (!incomePass) {
    score -= 30;
    riskFactors.push('Income does not meet 3x rent requirement');
  }

  // Credit score
  const creditPass = application.creditScore >= 650;
  const creditWarning = application.creditScore >= 500 && application.creditScore < 650;
  checks.push({
    name: 'Credit Check',
    status: creditPass ? 'pass' : creditWarning ? 'warning' : 'fail',
    details: `Credit score: ${application.creditScore}`,
  });
  if (!creditPass) {
    score -= 25;
    riskFactors.push('Low credit score');
  } else if (creditWarning) {
    score -= 10;
    riskFactors.push('Moderate credit score');
  }

  // Employment
  const employed = application.employmentStatus !== 'unemployed';
  checks.push({
    name: 'Employment Verification',
    status: employed ? 'pass' : 'fail',
    details: `Status: ${application.employmentStatus.replace('_', ' ')}`,
  });
  if (!employed) {
    score -= 30;
    riskFactors.push('Not employed');
  }

  // References
  const goodRefs = application.references.filter(r => r.response === 'good').length;
  const badRefs = application.references.filter(r => r.response === 'bad').length;
  checks.push({
    name: ' landlord References',
    status: badRefs > 0 ? 'fail' : goodRefs > 0 ? 'pass' : 'pending',
    details: `${goodRefs} positive / ${badRefs} negative references`,
  });
  if (badRefs > 0) {
    score -= 20;
    riskFactors.push('Negative landlord reference');
  }

  let recommendation: ScreeningResult['recommendation'];
  if (score >= 70) recommendation = 'approve';
  else if (score >= 40) recommendation = 'conditional';
  else recommendation = 'decline';

  return { recommendation, score, checks, riskFactors };
};

export function TenantScreening({ application }: { application: TenantApplication }) {
  const [isScreening, setIsScreening] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);

  const handleScreen = () => {
    setIsScreening(true);
    setTimeout(() => {
      const screeningResult = generateScreeningResult(application);
      setResult(screeningResult);
      setIsScreening(false);
    }, 2000);
  };

  const getStatusIcon = (status: ScreeningResult['checks'][0]['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'pending': return <Search className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Tenant Screening</h2>
            <p className="text-sm text-stone-500">Verify applicant details and background</p>
          </div>
        </div>

        {/* Applicant Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-stone-500" />
              <span className="text-sm font-medium text-stone-700">Applicant</span>
            </div>
            <p className="text-base font-semibold text-stone-900">{application.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-3 h-3 text-stone-400" />
              <span className="text-sm text-stone-500">{application.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-3 h-3 text-stone-400" />
              <span className="text-sm text-stone-500">{application.phone}</span>
            </div>
          </div>
          <div className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-stone-500" />
              <span className="text-sm font-medium text-stone-700">Property</span>
            </div>
            <p className="text-base font-semibold text-stone-900">{application.appliedProperty}</p>
            <p className="text-sm text-stone-500">R18,000/month</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-stone-50 rounded-lg text-center">
            <CreditCard className="w-4 h-4 mx-auto mb-1 text-stone-500" />
            <p className="text-lg font-bold text-stone-900">{application.creditScore}</p>
            <p className="text-xs text-stone-500">Credit Score</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg text-center">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-stone-500" />
            <p className="text-lg font-bold text-stone-900">{formatCurrency(application.income)}</p>
            <p className="text-xs text-stone-500">Monthly Income</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg text-center">
            <FileText className="w-4 h-4 mx-auto mb-1 text-stone-500" />
            <p className="text-lg font-bold text-stone-900 capitalize">{application.employmentStatus.replace('_', ' ')}</p>
            <p className="text-xs text-stone-500">Employment</p>
          </div>
        </div>

        {/* Run Screening */}
        <button
          onClick={handleScreen}
          disabled={isScreening}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isScreening ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Screening...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Run Full Screening
            </>
          )}
        </button>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card className={cn(
            "p-6 border-2",
            result.recommendation === 'approve' ? 'border-green-200 bg-green-50' :
            result.recommendation === 'conditional' ? 'border-amber-200 bg-amber-50' :
            'border-red-200 bg-red-50'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Screening Result</h3>
                <p className="text-sm text-stone-500">Score: {result.score}/100</p>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl font-semibold",
                result.recommendation === 'approve' ? 'bg-green-500 text-white' :
                result.recommendation === 'conditional' ? 'bg-amber-500 text-white' :
                'bg-red-500 text-white'
              )}>
                {result.recommendation === 'approve' ? 'Recommended' :
                 result.recommendation === 'conditional' ? 'Conditional' :
                 'Declined'}
              </div>
            </div>
          </Card>

          {/* Check Results */}
          <Card className="p-6">
            <h4 className="text-sm font-medium text-stone-700 mb-4">Screening Checks</h4>
            <div className="space-y-3">
              {result.checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <span className="text-sm font-medium text-stone-700">{check.name}</span>
                  </div>
                  <span className="text-xs text-stone-500">{check.details}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <Card className="p-4 bg-amber-50 border border-amber-200">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Risk Factors Identified</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {result.riskFactors.map((risk, i) => (
                  <li key={i}>• {risk}</li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default TenantScreening;