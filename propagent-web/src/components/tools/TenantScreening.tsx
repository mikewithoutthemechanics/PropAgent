'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building,
  CreditCard,
  FileText,
  Phone,
  Mail,
  Search,
  DollarSign,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import { aiTenantScreening, AITenantScreeningResult } from '@/lib/ai-client';

interface TenantApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedProperty: string;
  applicationDate: string;
  income: number;
  monthlyRent?: number;
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

export function TenantScreening({ application }: { application: TenantApplication }) {
  const [isScreening, setIsScreening] = useState(false);
  const [result, setResult] = useState<AITenantScreeningResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScreen = async () => {
    setIsScreening(true);
    setErrorMsg(null);
    const res = await aiTenantScreening({
      name: application.name,
      monthlyIncome: application.income,
      monthlyRent: application.monthlyRent ?? 18_000,
      creditScore: application.creditScore,
      employmentStatus: application.employmentStatus,
      hasPets: application.hasPets,
      petDetails: application.petDetails,
      references: application.references.map((r) => ({
        landlord: r.landlord,
        response: r.response,
      })),
    });
    setIsScreening(false);
    if ('error' in res) {
      setErrorMsg(
        res.error.message ||
          'AI screening unavailable. Check that GROQ_API_KEY is configured.',
      );
      return;
    }
    setResult(res.data);
  };

  const getStatusIcon = (status: AITenantScreeningResult['checks'][number]['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'pending':
        return <Search className="w-5 h-5 text-stone-400" />;
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
            <h2 className="text-lg font-semibold text-stone-900">AI Tenant Screening</h2>
            <p className="text-sm text-stone-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Groq-powered applicant risk assessment
            </p>
          </div>
        </div>

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
            <p className="text-sm text-stone-500">
              {formatCurrency(application.monthlyRent ?? 18_000)}/month
            </p>
          </div>
        </div>

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
            <p className="text-lg font-bold text-stone-900 capitalize">
              {application.employmentStatus.replace('_', ' ')}
            </p>
            <p className="text-xs text-stone-500">Employment</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleScreen}
          disabled={isScreening}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isScreening ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI analysing applicant...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run AI Screening
            </>
          )}
        </button>
      </Card>

      {result && (
        <>
          <Card
            className={cn(
              'p-6 border-2',
              result.recommendation === 'approve'
                ? 'border-green-200 bg-green-50'
                : result.recommendation === 'conditional'
                ? 'border-amber-200 bg-amber-50'
                : 'border-red-200 bg-red-50',
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Screening Result</h3>
                <p className="text-sm text-stone-500">Score: {result.score}/100</p>
              </div>
              <div
                className={cn(
                  'px-4 py-2 rounded-xl font-semibold',
                  result.recommendation === 'approve'
                    ? 'bg-green-500 text-white'
                    : result.recommendation === 'conditional'
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-500 text-white',
                )}
              >
                {result.recommendation === 'approve'
                  ? 'Recommended'
                  : result.recommendation === 'conditional'
                  ? 'Conditional'
                  : 'Declined'}
              </div>
            </div>
            {result.narrative && (
              <p className="mt-4 text-sm text-stone-700 leading-relaxed">
                {result.narrative}
              </p>
            )}
          </Card>

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

          {result.strengths.length > 0 && (
            <Card className="p-4 bg-green-50 border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700">
                    • {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.riskFactors.length > 0 && (
            <Card className="p-4 bg-amber-50 border border-amber-200">
              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Risk Factors Identified
              </h4>
              <ul className="space-y-1">
                {result.riskFactors.map((f, i) => (
                  <li key={i} className="text-sm text-amber-700">
                    • {f}
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

export default TenantScreening;
