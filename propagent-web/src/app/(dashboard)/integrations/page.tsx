'use client';

import { useState } from 'react';
import {
  Database,
  Globe,
  Link as LinkIcon,
  Plus,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Server,
  Cloud
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

const INTEGRATION_TYPES = [
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: Database,
    desc: 'Connect directly to your existing property database.',
    status: 'available'
  },
  {
    id: 'mcp',
    name: 'MCP (Model Context Protocol)',
    icon: Globe,
    desc: 'Allow AI to read from your local data sources securely.',
    status: 'available'
  },
  {
    id: 'propcontrol',
    name: 'PropControl',
    icon: Server,
    desc: 'Native South African property management integration.',
    status: 'beta'
  },
  {
    id: 'rest_api',
    name: 'REST API',
    icon: LinkIcon,
    desc: 'Custom API integration for third-party CRMs.',
    status: 'available'
  }
];

export default function IntegrationsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 font-serif">Integrations</h1>
          <p className="text-charcoal-500 mt-1">Connect your existing databases to the Agent Loop matching engine.</p>
        </div>
        <Button className="bg-charcoal-900 text-white rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Integration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-lime-400 rounded-2xl p-6 border border-lime-500 shadow-sm">
          <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <h3 className="font-bold text-charcoal-900 mb-1">Active Sync</h3>
          <p className="text-sm text-charcoal-900/70 mb-4">Your databases are being scanned for new matching opportunities.</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black/50" />
            <span className="text-xs font-semibold text-charcoal-900">3 Sources Connected</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-charcoal-100 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-charcoal-900">Secure Connectivity</h3>
          </div>
          <p className="text-sm text-charcoal-500 leading-relaxed">
            Agent Loop uses encrypted tunnels and read-only credentials to access your data. We never modify your existing records. All matching happens on anonymized criteria to ensure POPIA compliance.
          </p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-charcoal-900 px-1">Supported Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer group ${
                  selectedType === type.id
                    ? 'border-lime-400 bg-lime-50'
                    : 'border-charcoal-100 bg-white hover:border-lime-300'
                }`}
              >
                <div className="w-12 h-12 bg-charcoal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lime-100 transition-colors">
                  <Icon className="w-6 h-6 text-charcoal-900" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-charcoal-900">{type.name}</h3>
                  {type.status === 'beta' && (
                    <Badge className="bg-sky-100 text-sky-700 text-[10px]">BETA</Badge>
                  )}
                </div>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  {type.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config Panel (Simulated) */}
      {selectedType && (
        <Card className="p-8 border-2 border-lime-400 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-charcoal-900" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-charcoal-900">Configure {INTEGRATION_TYPES.find(t => t.id === selectedType)?.name}</h2>
                <p className="text-sm text-charcoal-500">Provide connection details to start the sync.</p>
              </div>
            </div>
            <button onClick={() => setSelectedType(null)} className="text-charcoal-400 hover:text-charcoal-600">
              <AlertCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Host / Endpoint URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-lime-400 outline-none"
                  placeholder="db.example.com or https://api.service.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-lime-400 outline-none"
                    placeholder="agent_loop_readonly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Password / Key</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-lime-400 outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">Database Name / Namespace</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-xl focus:ring-2 focus:ring-lime-400 outline-none"
                  placeholder="production_stock"
                />
              </div>
              <div className="pt-4">
                <Button className="w-full py-4 bg-charcoal-900 text-white rounded-xl font-bold">
                  Test Connection & Start Sync
                </Button>
              </div>
            </div>
            <div className="bg-charcoal-50 rounded-2xl p-6 border border-charcoal-100">
              <h4 className="font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-600" />
                Sync Preview
              </h4>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border border-charcoal-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal-600">Properties found:</span>
                  <span className="text-xs font-bold text-charcoal-900">0</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-charcoal-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-charcoal-600">Matching buyers:</span>
                  <span className="text-xs font-bold text-charcoal-900">0</span>
                </div>
                <div className="mt-8">
                  <p className="text-[10px] text-charcoal-400 leading-relaxed uppercase tracking-widest font-bold mb-2">Connection Log</p>
                  <div className="font-mono text-[10px] text-charcoal-600 space-y-1">
                    <p>[INFO] Waiting for configuration...</p>
                    <p>[INFO] SSL required for PostgreSQL connections.</p>
                    <p>[INFO] PropControl API requires v2 key format.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
