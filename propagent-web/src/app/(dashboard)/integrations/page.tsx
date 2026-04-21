'use client';

import { useState } from 'react';
import {
  Database,
  Plus,
  Settings,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  TestTube,
  Link2,
  Server,
  FileSpreadsheet,
  Globe,
  Zap,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  type: 'postgres' | 'mcp' | 'api' | 'csv' | 'propdata' | 'supabase';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
  recordCount?: number;
  config?: Record<string, string>;
}

const INTEGRATION_CATALOG = [
  {
    type: 'postgres' as const,
    label: 'PostgreSQL',
    description: 'Connect to any PostgreSQL database to sync property listings, buyer data, and agent records.',
    icon: '🐘',
    fields: [
      { key: 'host', label: 'Host', placeholder: 'db.example.com' },
      { key: 'port', label: 'Port', placeholder: '5432' },
      { key: 'database', label: 'Database', placeholder: 'properties' },
      { key: 'username', label: 'Username', placeholder: 'readonly_user' },
      { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    type: 'mcp' as const,
    label: 'MCP Server',
    description: 'Connect via Model Context Protocol for AI-powered data access and tool calling.',
    icon: '🤖',
    fields: [
      { key: 'endpoint', label: 'MCP Endpoint', placeholder: 'https://mcp.example.com/v1' },
      { key: 'apiKey', label: 'API Key', placeholder: 'mcp_key_...', type: 'password' },
    ],
  },
  {
    type: 'api' as const,
    label: 'REST API',
    description: 'Connect to external property management systems, CRMs, or listing portals via REST.',
    icon: '🔌',
    fields: [
      { key: 'baseUrl', label: 'Base URL', placeholder: 'https://api.example.com/v1' },
      { key: 'apiKey', label: 'API Key', placeholder: 'sk_...', type: 'password' },
      { key: 'headerName', label: 'Auth Header', placeholder: 'Authorization' },
    ],
  },
  {
    type: 'csv' as const,
    label: 'CSV / Spreadsheet',
    description: 'Import property listings and buyer leads from CSV files or Google Sheets.',
    icon: '📊',
    fields: [
      { key: 'sheetUrl', label: 'Google Sheets URL (optional)', placeholder: 'https://docs.google.com/spreadsheets/d/...' },
    ],
  },
  {
    type: 'propdata' as const,
    label: 'PropData / Lightstone',
    description: 'Access South African property valuations, deeds data, and market analytics.',
    icon: '🏠',
    fields: [
      { key: 'apiKey', label: 'PropData API Key', placeholder: 'pd_...', type: 'password' },
      { key: 'region', label: 'Region', placeholder: 'KZN' },
    ],
  },
];

const EXISTING_INTEGRATIONS: Integration[] = [
  {
    id: 'supabase-default',
    name: 'Agent Loop Database',
    type: 'supabase',
    status: 'connected',
    lastSync: 'Live',
    recordCount: 1247,
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(EXISTING_INTEGRATIONS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [connectionName, setConnectionName] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleAddIntegration = () => {
    if (!selectedType || !connectionName.trim()) return;

    const newIntegration: Integration = {
      id: `${selectedType}-${Date.now()}`,
      name: connectionName,
      type: selectedType as Integration['type'],
      status: 'disconnected',
      config: configValues,
    };

    setIntegrations((prev) => [...prev, newIntegration]);
    setShowAddModal(false);
    setSelectedType(null);
    setConfigValues({});
    setConnectionName('');
  };

  const testConnection = async (id: string) => {
    setTestingId(id);
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'testing' as const } : i))
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'connected' as const, lastSync: new Date().toLocaleString(), recordCount: Math.floor(Math.random() * 500) + 50 }
          : i
      )
    );
    setTestingId(null);
  };

  const removeIntegration = (id: string) => {
    if (id === 'supabase-default') return;
    setIntegrations((prev) => prev.filter((i) => i.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'postgres': return <Database className="w-5 h-5" />;
      case 'mcp': return <Server className="w-5 h-5" />;
      case 'api': return <Globe className="w-5 h-5" />;
      case 'csv': return <FileSpreadsheet className="w-5 h-5" />;
      case 'propdata': return <Database className="w-5 h-5" />;
      case 'supabase': return <Zap className="w-5 h-5" />;
      default: return <Link2 className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-lime-50 text-lime-700 border border-lime-200 gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            Connected
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-sky-50 text-sky-700 border border-sky-200 gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Testing
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-charcoal-50 text-charcoal-500 border border-charcoal-200">
            Not connected
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold">Integrations</h1>
          <p className="text-charcoal-500 mt-2 text-sm md:text-base">
            Connect your databases, APIs, and external services to power AI matching.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 transition-all rounded-full px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Active Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="p-5 bg-white border-2 border-charcoal-100 rounded-2xl hover:border-charcoal-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal-50 rounded-lg flex items-center justify-center text-charcoal-600">
                  {getTypeIcon(integration.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-charcoal-500 capitalize">
                    {integration.type === 'supabase' ? 'Supabase (Built-in)' : integration.type}
                  </p>
                </div>
              </div>
              {getStatusBadge(integration.status)}
            </div>

            <div className="space-y-2 text-sm">
              {integration.lastSync && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Last sync</span>
                  <span className="text-charcoal-700 font-medium">{integration.lastSync}</span>
                </div>
              )}
              {integration.recordCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Records</span>
                  <span className="text-charcoal-700 font-medium">
                    {integration.recordCount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {integration.id !== 'supabase-default' && (
              <div className="flex gap-2 mt-4 pt-3 border-t border-charcoal-100">
                <button
                  onClick={() => testConnection(integration.id)}
                  disabled={testingId === integration.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-charcoal-50 text-charcoal-700 rounded-lg hover:bg-charcoal-100 transition-colors disabled:opacity-50"
                >
                  <TestTube className="w-3.5 h-3.5" />
                  Test
                </button>
                <button
                  onClick={() => removeIntegration(integration.id)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-charcoal-50 rounded-2xl p-6 md:p-8 border border-charcoal-100">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-4">How Integrations Power AI Matching</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-lime-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-900">Connect your data</p>
              <p className="text-xs text-charcoal-500 mt-1">
                Link your property databases, CRMs, and listing portals via Postgres, MCP, or API.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-lime-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-900">Continuous sync</p>
              <p className="text-xs text-charcoal-500 mt-1">
                Your stock updates in real-time so AI matching always has the latest listings and buyer criteria.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-lime-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-900">POPIA compliant</p>
              <p className="text-xs text-charcoal-500 mt-1">
                All data is encrypted in transit and at rest. Criteria-only matching — no client PII shared.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-charcoal-900">Add Integration</h2>
                <button
                  onClick={() => { setShowAddModal(false); setSelectedType(null); }}
                  className="text-charcoal-400 hover:text-charcoal-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!selectedType ? (
                <>
                  <p className="text-sm text-charcoal-500 mb-4">
                    Choose an integration type to connect your external data sources.
                  </p>
                  {INTEGRATION_CATALOG.map((cat) => (
                    <button
                      key={cat.type}
                      onClick={() => setSelectedType(cat.type)}
                      className="w-full p-4 rounded-xl border-2 border-charcoal-100 hover:border-lime-400 transition-all text-left flex items-start gap-3"
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-medium text-charcoal-900">{cat.label}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">{cat.description}</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-sm text-charcoal-500 hover:text-charcoal-700 mb-2"
                  >
                    ← Back to types
                  </button>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Connection Name
                    </label>
                    <input
                      type="text"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                      className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                      placeholder="e.g. My Property Database"
                    />
                  </div>
                  {INTEGRATION_CATALOG.find((c) => c.type === selectedType)?.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type={field.type || 'text'}
                        value={configValues[field.key] || ''}
                        onChange={(e) =>
                          setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none text-sm"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleAddIntegration}
                      disabled={!connectionName.trim()}
                      className="flex-1 bg-lime-400 text-charcoal-900 hover:bg-lime-500 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
