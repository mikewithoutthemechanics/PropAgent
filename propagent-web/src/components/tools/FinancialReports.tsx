'use client';

import { TrendingUp, TrendingDown, DollarSign, Receipt, Download, PieChart } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

interface FinancialReportProps {
  period?: 'month' | 'quarter' | 'year';
}

const sampleData = {
  income: {
    rent: 245000,
    lateFees: 2500,
    other: 1500,
  },
  expenses: {
    maintenance: 18500,
    rates: 12500,
    levies: 28000,
    insurance: 4200,
    management: 12250,
    other: 5000,
  },
  properties: [
    { name: '14 Oak Lane, Sandton', income: 45000, expenses: 12500, profit: 32500 },
    { name: '8 Maple Ave, Cape Town', income: 38000, expenses: 9800, profit: 28200 },
    { name: '25 Pine Street, Durban', income: 28000, expenses: 7200, profit: 20800 },
    { name: '42 Beach Rd, Mossel Bay', income: 18000, expenses: 4500, profit: 13500 },
  ],
};

export function FinancialReports({ period = 'month' }: FinancialReportProps) {
  const totalIncome = sampleData.income.rent + sampleData.income.lateFees + sampleData.income.other;
  const totalExpenses = Object.values(sampleData.expenses).reduce((a, b) => a + b, 0);
  const netIncome = totalIncome - totalExpenses;
  const margin = (netIncome / totalIncome) * 100;

  const exportCsv = () => {
    const rows: string[][] = [];
    rows.push(['Financial report — PropAgent', `Period: ${period}`]);
    rows.push([]);
    rows.push(['Summary']);
    rows.push(['Metric', 'Amount (ZAR)']);
    rows.push(['Total income', String(totalIncome)]);
    rows.push(['Total expenses', String(totalExpenses)]);
    rows.push(['Net income', String(netIncome)]);
    rows.push(['Profit margin (%)', margin.toFixed(2)]);
    rows.push([]);
    rows.push(['Income breakdown']);
    rows.push(['Category', 'Amount (ZAR)']);
    for (const [k, v] of Object.entries(sampleData.income)) {
      rows.push([k, String(v)]);
    }
    rows.push([]);
    rows.push(['Expense breakdown']);
    rows.push(['Category', 'Amount (ZAR)']);
    for (const [k, v] of Object.entries(sampleData.expenses)) {
      rows.push([k, String(v)]);
    }
    rows.push([]);
    rows.push(['Property performance']);
    rows.push(['Property', 'Income', 'Expenses', 'Net', 'Yield (%)']);
    for (const p of sampleData.properties) {
      const y = (p.profit / p.income) * 100;
      rows.push([p.name, String(p.income), String(p.expenses), String(p.profit), y.toFixed(1)]);
    }
    const escape = (cell: string) =>
      /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
    const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Total Income</p>
              <p className="text-xl font-bold text-stone-900">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Total Expenses</p>
              <p className="text-xl font-bold text-stone-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Net Income</p>
              <p className="text-xl font-bold text-stone-900">{formatCurrency(netIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Profit Margin</p>
              <p className="text-xl font-bold text-purple-600">{margin.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Income Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900">Income Breakdown</h3>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
          >
            <Download className="w-4 h-4" />Export CSV
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(sampleData.income).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-stone-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              <span className="font-semibold text-stone-900">{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Expense Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(sampleData.expenses).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-stone-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              <span className="font-semibold text-stone-900">{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Property Performance */}
      <Card className="p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Property Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-2 text-xs font-medium text-stone-500">Property</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-stone-500">Income</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-stone-500">Expenses</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-stone-500">Net</th>
                <th className="text-right py-3 px-2 text-xs font-medium text-stone-500">Yield</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.properties.map((prop) => {
                const propYield = (prop.profit / prop.income) * 100;
                return (
                  <tr key={prop.name} className="border-b border-stone-100">
                    <td className="py-3 px-2 text-sm font-medium text-stone-900">{prop.name}</td>
                    <td className="py-3 px-2 text-sm text-stone-600 text-right">{formatCurrency(prop.income)}</td>
                    <td className="py-3 px-2 text-sm text-stone-600 text-right">{formatCurrency(prop.expenses)}</td>
                    <td className="py-3 px-2 text-sm font-medium text-green-600 text-right">{formatCurrency(prop.profit)}</td>
                    <td className="py-3 px-2 text-sm text-right">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        propYield > 60 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {propYield.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default FinancialReports;