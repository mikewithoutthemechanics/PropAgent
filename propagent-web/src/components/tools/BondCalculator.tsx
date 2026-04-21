'use client';

import { useState, useMemo } from 'react';
import { Calculator, Info, Percent, Calendar, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';
import { aiChat } from '@/lib/ai-client';

interface BondCalculatorProps {
  propertyPrice?: number;
  onComplete?: (results: BondCalculation) => void;
}

export interface BondCalculation {
  propertyPrice: number;
  deposit: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  monthlyRates: number;
  monthlyLevies: number;
  totalMonthly: number;
}

const SA_BANKS = [
  { name: 'Standard Bank', rate: 11.25, code: 'sbg' },
  { name: 'FNB', rate: 11.25, code: 'fnb' },
  { name: ' Nedbank', rate: 11.25, code: 'nedbank' },
  { name: 'Absa', rate: 11.25, code: 'absa' },
  { name: 'Capitec', rate: 11.50, code: 'capitec' },
  { name: 'Discovery', rate: 10.75, code: 'discovery' },
];

export function BondCalculator({ propertyPrice = 2500000, onComplete }: BondCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [deposit, setDeposit] = useState(0);
  const [interestRate, setInterestRate] = useState(11.25);
  const [termYears, setTermYears] = useState(20);
  const [rates, setRates] = useState(2500);
  const [levies, setLevies] = useState(3500);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedBank, setSelectedBank] = useState(SA_BANKS[0]);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const calculation = useMemo((): BondCalculation => {
    const depositAmount = deposit || 0;
    const loanAmount = Math.max(0, price - depositAmount);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = termYears * 12;
    
    let monthlyPayment = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      monthlyPayment = loanAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - loanAmount;
    const totalCost = price + totalInterest;
    const totalMonthly = monthlyPayment + rates + levies;
    
    return {
      propertyPrice: price,
      deposit: depositAmount,
      loanAmount,
      interestRate,
      termYears,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalCost),
      monthlyRates: rates,
      monthlyLevies: levies,
      totalMonthly: Math.round(totalMonthly),
    };
  }, [price, deposit, interestRate, termYears, rates, levies]);

  const loanToValue = Math.round((calculation.loanAmount / price) * 100);
  const isHighRisk = loanToValue > 90;

  const handleBankSelect = (bank: typeof SA_BANKS[0]) => {
    setSelectedBank(bank);
    setInterestRate(bank.rate);
  };

  const loadAffordability = async () => {
    setInsight(null);
    setInsightError(null);
    setInsightLoading(true);
    const prompt = `
You are a South African home-loan affordability advisor. Analyse the following scenario and respond in 120-160 words of plain text (no markdown headings, no JSON). Cover: (1) whether the bond is affordable given income, (2) the debt-to-income ratio, (3) effect of deposit and LTV, (4) one concrete suggestion for the buyer.

Data:
- Property price: R${price.toLocaleString()}
- Deposit: R${(deposit || 0).toLocaleString()} (${Math.round(((deposit || 0) / price) * 100)}% of price)
- Loan amount: R${calculation.loanAmount.toLocaleString()}
- Interest rate: ${interestRate}% (${selectedBank.name})
- Term: ${termYears} years
- Estimated monthly bond: R${calculation.monthlyPayment.toLocaleString()}
- Monthly rates & levies: R${(rates + levies).toLocaleString()}
- Gross monthly household income: ${monthlyIncome > 0 ? `R${monthlyIncome.toLocaleString()}` : 'not provided'}
`.trim();

    try {
      const reply = await aiChat([{ role: 'user', content: prompt }]);
      if (!reply) {
        setInsightError('No insight returned. Check that GROQ_API_KEY is configured.');
      } else {
        setInsight(reply);
      }
    } catch (err) {
      setInsightError(String(err));
    } finally {
      setInsightLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Bond Calculator</h2>
            <p className="text-sm text-stone-500">Estimate your monthly home loan payments</p>
          </div>
        </div>

        {/* Property Price */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-stone-700">
            Property Price (ZAR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">R</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Deposit */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700">Deposit</label>
            <span className="text-sm text-emerald-600 font-medium">
              {formatCurrency(deposit)} ({Math.round((deposit / price) * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max={price}
            step="10000"
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-stone-500">
            <span>R0</span>
            <span>{formatCurrency(price * 0.5)}</span>
            <span>{formatCurrency(price)}</span>
          </div>
        </div>

        {/* Bank Selection */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-stone-700">Select Bank</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SA_BANKS.map((bank) => (
              <button
                key={bank.code}
                onClick={() => handleBankSelect(bank)}
                className={cn(
                  "p-2 text-xs font-medium rounded-lg border transition-all",
                  selectedBank.code === bank.code
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-stone-200 text-stone-600 hover:border-emerald-300"
                )}
              >
                {bank.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate & Term */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700">Interest Rate (%)</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700">Loan Term (Years)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <select
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {[5, 10, 15, 20, 25, 30].map((years) => (
                  <option key={years} value={years}>{years} years</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-stone-600 hover:text-stone-900 flex items-center gap-1.5 mb-4"
        >
          <Info className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} monthly costs
        </button>

        {/* Advanced: Rates & Levies */}
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg mb-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600">Monthly Rates (ZAR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                <input
                  type="number"
                  value={rates}
                  onChange={(e) => setRates(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-600">Monthly Levies (ZAR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                <input
                  type="number"
                  value={levies}
                  onChange={(e) => setLevies(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Estimated Monthly Payment</h3>
        
        <div className="text-4xl font-bold text-emerald-600 mb-2">
          {formatCurrency(calculation.monthlyPayment)}
          <span className="text-lg font-normal text-stone-500">/month</span>
        </div>
        
        {/* Loan Details */}
        <div className="space-y-2 mt-4 pt-4 border-t border-emerald-200">
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Loan Amount</span>
            <span className="font-medium text-stone-900">{formatCurrency(calculation.loanAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Total Interest</span>
            <span className="font-medium text-red-600">-{formatCurrency(calculation.totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-600">Total Cost</span>
            <span className="font-medium text-stone-900">{formatCurrency(calculation.totalCost)}</span>
          </div>
        </div>

        {/* LTV Warning */}
        {isHighRisk && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ Loan to Value ratio is {loanToValue}%. Banks may require bridge financing or mortgage insurance.
            </p>
          </div>
        )}

        {showAdvanced && (
          <div className="space-y-2 mt-4 pt-4 border-t border-emerald-200">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">+ Monthly Rates</span>
              <span className="font-medium text-stone-900">{formatCurrency(rates)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">+ Monthly Levies</span>
              <span className="font-medium text-stone-900">{formatCurrency(levies)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-emerald-200">
              <span className="text-stone-800">Total Monthly Cost</span>
              <span className="text-emerald-700">{formatCurrency(calculation.totalMonthly)}</span>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h3 className="text-base font-semibold text-stone-900">AI Affordability Insight</h3>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Optionally enter gross monthly income. Groq will analyse if this bond is affordable and suggest next steps.
        </p>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">R</span>
            <input
              type="number"
              placeholder="Monthly income (optional)"
              value={monthlyIncome || ''}
              onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm"
            />
          </div>
          <Button
            onClick={loadAffordability}
            disabled={insightLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {insightLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analysing…
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Get AI insight
              </div>
            )}
          </Button>
        </div>
        {insightError && (
          <p className="text-sm text-red-600">{insightError}</p>
        )}
        {insight && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-stone-50">
        <h4 className="text-sm font-medium text-stone-700 mb-2">Tips for SA Buyers</h4>
        <ul className="text-xs text-stone-600 space-y-1">
          <li>• Most banks offer 11.25% - 12.25% for first-time buyers</li>
          <li>• A 10-20% deposit can help negotiate better rates</li>
          <li>• Transfer duty: 0% under R1,000,000 | 3% up to R1,875,000</li>
          <li>• Banks may approve 100% bond + higher rate for qualified buyers</li>
        </ul>
      </Card>

      {onComplete && calculation.monthlyPayment > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onComplete(calculation)}
          >
            Use this calculation
          </Button>
        </div>
      )}
    </div>
  );
}

export default BondCalculator;