// AI Portfolio Insights
// Natural language queries for portfolio data

interface Property {
  id: string;
  address: string;
  suburb: string;
  rent: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenant?: string;
}

interface Financial {
  date: string;
  income: number;
  expenses: number;
  category: string;
}

export interface PortfolioData {
  properties: Property[];
  financials: Financial[];
}

// Predefined insights queries
const insightTemplates = {
  totalValue: {
    query: "total portfolio value|total worth|portfolio value",
    calculate: (data: PortfolioData) => {
      const totalMonthlyRent = data.properties.reduce((sum, p) => sum + (p.status === 'occupied' ? p.rent : 0), 0);
      return {
        text: `Total portfolio value is R${(totalMonthlyRent * 12).toLocaleString()}/year (R${totalMonthlyRent.toLocaleString()}/month)`,
        value: totalMonthlyRent * 12
      };
    }
  },
  occupancy: {
    query: "occupancy|occupation rate|vacancy",
    calculate: (data: PortfolioData) => {
      const occupied = data.properties.filter(p => p.status === 'occupied').length;
      const total = data.properties.length;
      const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return {
        text: `Occupancy rate: ${rate}% (${occupied}/${total} properties occupied)`,
        value: rate
      };
    }
  },
  revenue: {
    query: "revenue|income|earnings",
    calculate: (data: PortfolioData) => {
      const totalIncome = data.financials.reduce((sum, f) => sum + f.income, 0);
      return {
        text: `Total income: R${totalIncome.toLocaleString()}`,
        value: totalIncome
      };
    }
  },
  expenses: {
    query: "expenses|costs|spending",
    calculate: (data: PortfolioData) => {
      const totalExpenses = data.financials.reduce((sum, f) => sum + f.expenses, 0);
      return {
        text: `Total expenses: R${totalExpenses.toLocaleString()}`,
        value: totalExpenses
      };
    }
  },
  netOperating: {
    query: "net operating NOI|profit|margin",
    calculate: (data: PortfolioData) => {
      const income = data.financials.reduce((sum, f) => sum + f.income, 0);
      const expenses = data.financials.reduce((sum, f) => sum + f.expenses, 0);
      const noi = income - expenses;
      return {
        text: `Net Operating Income: R${noi.toLocaleString()}`,
        value: noi
      };
    }
  },
  vacant: {
    query: "vacant|empty|vacancy",
    calculate: (data: PortfolioData) => {
      const vacant = data.properties.filter(p => p.status === 'vacant');
      return {
        text: `${vacant.length} properties vacant: ${vacant.map(p => p.address).join(', ')}`,
        value: vacant.length
      };
    }
  },
  maintenance: {
    query: "maintenance|issues|repair",
    calculate: (data: PortfolioData) => {
      const maintenance = data.properties.filter(p => p.status === 'maintenance');
      return {
        text: `${maintenance.length} properties in maintenance`,
        value: maintenance.length
      };
    }
  }
};

export function queryPortfolio(query: string, data: PortfolioData): { text: string; confidence: number } {
  const queryLower = query.toLowerCase();
  let bestMatch: { key: string; score: number } = { key: '', score: 0 };
  
  // Find best matching query template
  for (const [key, template] of Object.entries(insightTemplates)) {
    const score = template.query.split('|').reduce((s, term) => {
      return queryLower.includes(term) ? s + 1 : s;
    }, 0);
    if (score > bestMatch.score) {
      bestMatch = { key, score };
    }
  }
  
  if (bestMatch.score > 0 && bestMatch.key) {
    const result = insightTemplates[bestMatch.key as keyof typeof insightTemplates].calculate(data);
    return { text: result.text, confidence: Math.min(bestMatch.score * 25, 100) };
  }
  
  // Default response for unknown queries
  return {
    text: "I can help with: total portfolio value, occupancy rate, revenue, expenses, net operating income, vacant properties, and maintenance status. Try asking one of these.",
    confidence: 50
  };
}

export function getAvailableQueries(): string[] {
  return Object.values(insightTemplates).map(t => t.query.split('|')[0]);
}
