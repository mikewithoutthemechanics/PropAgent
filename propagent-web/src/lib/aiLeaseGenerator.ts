// AI Lease Generator
// Generates lease agreements from templates with property/tenant data

export interface TenantInfo {
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  employer?: string;
  monthlyIncome?: number;
}

export interface PropertyInfo {
  address: string;
  suburb: string;
  city: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
}

export interface LeaseData {
  property: PropertyInfo;
  tenant: TenantInfo;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  durationMonths: number;
  terms?: string;
}

const leaseClauses = {
  standard: [
    {
      title: "Parties",
      text: "This Agreement is between the Landlord and the Tenant named above."
    },
    {
      title: "Property",
      text: "The Landlord agrees to let the Property to the Tenant for residential purposes only."
    },
    {
      title: "Term",
      text: "The lease is for a fixed period of {{duration}} months, commencing {{startDate}}."
    },
    {
      title: "Rent",
      text: "The Tenant agrees to pay R{{rent}} per month, payable in advance on the 1st of each month."
    },
    {
      title: "Deposit",
      text: "A deposit of R{{deposit}} is payable upon signing and will be held in trust."
    },
    {
      title: "Utilities",
      text: "The Tenant is responsible for all municipal services, electricity, and water."
    },
    {
      title: "Maintenance",
      text: "The Tenant shall maintain the property in good condition and report any issues promptly."
    },
    {
      title: "Termination",
      text: "Either party may terminate with 30 days written notice."
    }
  ]
};

export function generateLease(leaseData: LeaseData): {
  title: string;
  sections: Array<{title: string; content: string}>;
  fullText: string;
} {
  const { property, tenant, monthlyRent, deposit, startDate, durationMonths } = leaseData;
  
  // Generate sections
  const sections = [
    {
      title: "Parties",
      content: `LANDLORD: [Property Owner Name]
TENANT: ${tenant.fullName}
ID: ${tenant.idNumber}
Contact: ${tenant.phone} / ${tenant.email}`
    },
    {
      title: "Property Details",
      content: `Address: ${property.address}, ${property.suburb}, ${property.city}
Type: ${property.type}
Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}`
    },
    {
      title: "Lease Terms",
      content: `Start Date: ${startDate}
Duration: ${durationMonths} months
Monthly Rent: R${monthlyRent.toLocaleString()}
Deposit: R${deposit.toLocaleString()}`
    },
    ...leaseClauses.standard.map(clause => ({
      title: clause.title,
      content: clause.text
        .replace('{{duration}}', String(durationMonths))
        .replace('{{startDate}}', startDate)
        .replace('{{rent}}', String(monthlyRent))
        .replace('{{deposit}}', String(deposit))
    }))
  ];
  
  // Generate full text
  let fullText = `RESIDENTIAL LEASE AGREEMENT

${sections.map(s => `${s.title.toUpperCase()}
${'-'.repeat(40)}
${s.content}

`).join('\n')}

SIGNATURES:

_________________________
Landlord

_________________________
Tenant

Date: ______________

Witness: ______________`;

  return { title: 'Residential Lease Agreement', sections, fullText };
}

export function generateLeaseSummary(leaseData: LeaseData): string {
  const { property, tenant, monthlyRent, startDate, durationMonths } = leaseData;
  
  return `Lease Summary:
- Property: ${property.address}, ${property.suburb}
- Tenant: ${tenant.fullName}
- Monthly: R${monthlyRent.toLocaleString()}
- Start: ${startDate}
- Duration: ${durationMonths} months
- Total Value: R${(monthlyRent * durationMonths).toLocaleString()}`;
}
