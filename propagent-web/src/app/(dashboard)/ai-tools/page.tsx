"use client";

import { useState } from "react";
import { 
  Sparkles, 
  FileText, 
  Users, 
  BarChart3, 
  Search,
  Copy,
  Check
} from "lucide-react";
import { generatePropertyDescription, PropertyDetails } from "@/lib/aiPropertyDescription";
import { generateLease, LeaseData } from "@/lib/aiLeaseGenerator";
import { scoreTenant, generateTenantReport, TenantApplication } from "@/lib/aiTenantScreener";
import { queryPortfolio, PortfolioData } from "@/lib/aiPortfolioInsights";

type AITool = "description" | "lease" | "screener" | "insights";

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<AITool>("description");
  const [propertyDesc, setPropertyDesc] = useState<Partial<PropertyDetails>>({});
  const [leaseData, setLeaseData] = useState<Partial<LeaseData>>({});
  const [tenantApp, setTenantApp] = useState<Partial<TenantApplication>>({});
  const [portfolioQuery, setPortfolioQuery] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const tools = [
    { id: "description", name: "Property Writer", icon: FileText, desc: "Generate property listings" },
    { id: "lease", name: "Lease Generator", icon: FileText, desc: "Create lease agreements" },
    { id: "screener", name: "Tenant Screener", icon: Users, desc: "Score tenant applications" },
    { id: "insights", name: "Portfolio Insights", icon: BarChart3, desc: "Query your portfolio" }
  ];

  const generateDescription = () => {
    if (!propertyDesc.type || !propertyDesc.bedrooms) {
      setResult("Please fill in property type and bedrooms");
      return;
    }
    const desc = generatePropertyDescription(propertyDesc as PropertyDetails);
    setResult(desc.long);
  };

  const generateLeaseAgreement = () => {
    if (!leaseData.monthlyRent || !leaseData.startDate) {
      setResult("Please fill in rent and start date");
      return;
    }
    const lease = generateLease(leaseData as LeaseData);
    setResult(lease.fullText);
  };

  const screenTenant = () => {
    if (!tenantApp.name || !tenantApp.monthlyIncome) {
      setResult("Please fill in tenant name and income");
      return;
    }
    const score = scoreTenant(tenantApp as TenantApplication, leaseData.monthlyRent || 10000);
    setResult(generateTenantReport(tenantApp as TenantApplication, score, leaseData.monthlyRent || 10000));
  };

  const runQuery = () => {
    const demoData: PortfolioData = {
      properties: [
        { id: "1", address: "123 Main St", suburb: "Sandton", rent: 15000, status: "occupied" },
        { id: "2", address: "456 Oak Ave", suburb: "Rosebank", rent: 12000, status: "occupied" },
        { id: "3", address: "789 Pine Rd", suburb: "Midrand", rent: 10000, status: "vacant" }
      ],
      financials: [
        { date: "2026-04", income: 27000, expenses: 5000, category: "rental" }
      ]
    };
    const response = queryPortfolio(portfolioQuery, demoData);
    setResult(response.text);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-gray-900" />
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">AI Tools</h1>
      </div>

      {/* Tool Selection - responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id as AITool); setResult(""); }}
            className={`p-3 md:p-4 rounded-lg border text-left transition-all ${
              activeTool === tool.id 
                ? "border-lime-500 bg-lime-500/10" 
                : "border-gray-700 hover:border-lime-500/50"
            }`}
          >
            <tool.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-900 mb-1 md:mb-2" />
            <div className="text-sm md:text-base font-medium text-gray-900">{tool.name}</div>
            <div className="text-xs md:text-sm text-gray-900">{tool.desc}</div>
          </button>
        ))}
      </div>

      {/* Tool Content */}
      <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700">
        {activeTool === "description" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Generate Property Description</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={propertyDesc.type}
                onChange={e => setPropertyDesc({...propertyDesc, type: e.target.value as any})}
              >
                <option value="">Select Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
              </select>
              <input 
                type="number" 
                placeholder="Bedrooms"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={propertyDesc.bedrooms || ""}
                onChange={e => setPropertyDesc({...propertyDesc, bedrooms: Number(e.target.value)})}
              />
              <input 
                type="number" 
                placeholder="Rent (R)"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={propertyDesc.rent || ""}
                onChange={e => setPropertyDesc({...propertyDesc, rent: Number(e.target.value)})}
              />
            </div>
            <button 
              onClick={generateDescription}
              className="w-full md:w-auto px-6 py-3 md:py-4 bg-lime-600 text-gray-900 rounded-lg hover:bg-lime-500 font-medium text-base"
            >
              Generate Description
            </button>
          </div>
        )}

        {activeTool === "lease" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Generate Lease</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Tenant Name"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={leaseData.tenant?.fullName || ""}
                onChange={e => setLeaseData({...leaseData, tenant: {...leaseData.tenant!, fullName: e.target.value}})}
              />
              <input 
                type="date" 
                placeholder="Start Date"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={leaseData.startDate || ""}
                onChange={e => setLeaseData({...leaseData, startDate: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Monthly Rent"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={leaseData.monthlyRent || ""}
                onChange={e => setLeaseData({...leaseData, monthlyRent: Number(e.target.value)})}
              />
              <input 
                type="number" 
                placeholder="Deposit"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={leaseData.deposit || ""}
                onChange={e => setLeaseData({...leaseData, deposit: Number(e.target.value)})}
              />
            </div>
            <button 
              onClick={generateLeaseAgreement}
              className="w-full md:w-auto px-6 py-3 md:py-4 bg-lime-600 text-gray-900 rounded-lg hover:bg-lime-500 font-medium text-base"
            >
              Generate Lease
            </button>
          </div>
        )}

        {activeTool === "screener" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Screen Tenant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                type="text" 
                placeholder="Applicant Name"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={tenantApp.name || ""}
                onChange={e => setTenantApp({...tenantApp, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Monthly Income"
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={tenantApp.monthlyIncome || ""}
                onChange={e => setTenantApp({...tenantApp, monthlyIncome: Number(e.target.value)})}
              />
              <select 
                className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={tenantApp.employmentStatus}
                onChange={e => setTenantApp({...tenantApp, employmentStatus: e.target.value as any})}
              >
                <option value="">Employment</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
                <option value="student">Student</option>
              </select>
            </div>
            <button 
              onClick={screenTenant}
              className="w-full md:w-auto px-6 py-3 md:py-4 bg-lime-600 text-gray-900 rounded-lg hover:bg-lime-500 font-medium text-base"
            >
              Screen Tenant
            </button>
          </div>
        )}

        {activeTool === "insights" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Portfolio Insights</h3>
            <p className="text-gray-900 text-sm">
              Try: "total portfolio value", "occupancy rate", "vacant properties", "net operating income"
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                placeholder="Ask about your portfolio..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 text-gray-900 text-base"
                value={portfolioQuery}
                onChange={e => setPortfolioQuery(e.target.value)}
              />
              <button 
                onClick={runQuery}
                className="w-full sm:w-auto px-6 py-3 md:py-4 bg-lime-600 text-gray-900 rounded-lg hover:bg-lime-500 font-medium"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4 md:mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 max-h-[60vh] md:max-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 sticky top-0 bg-gray-800 py-2">
              <span className="text-sm font-medium text-gray-900">Result</span>
              <button onClick={copyResult} className="p-2 text-gray-900 hover:text-gray-900 hover:bg-gray-700 rounded-lg">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="text-gray-900 whitespace-pre-wrap font-mono text-sm leading-relaxed">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
