export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const keys = columns ? columns.map(c => c.key) : (Object.keys(data[0]) as (keyof T)[]);
  const labels = columns ? columns.map(c => c.label) : keys.map(k => String(k));

  const header = labels.join(',');
  const rows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export type PropertyRow = {
  name: string;
  address: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  status: string;
};

export type TenantRow = {
  name: string;
  email: string;
  phone: string;
  property: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: string;
};

export type LeadRow = {
  name: string;
  email: string;
  phone: string;
  source: string;
  property: string;
  budget: number;
  status: string;
  createdAt: string;
};

export type FinancialRow = {
  date: string;
  property: string;
  description: string;
  category: string;
  amount: number;
  type: string;
  status: string;
};