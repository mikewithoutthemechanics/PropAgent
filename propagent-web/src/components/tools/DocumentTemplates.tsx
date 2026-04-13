'use client';

import { useState } from 'react';
import { FileText, Download, Eye, Edit, Copy, Plus, Check } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lease' | 'agreement' | 'notice' | 'checklist' | 'form';
  lastUpdated: string;
  fields: string[];
}

const templates: DocumentTemplate[] = [
  {
    id: '1',
    name: 'Residential Lease Agreement',
    description: 'Standard residential lease agreement for rental properties',
    category: 'lease',
    lastUpdated: '2026-01-15',
    fields: ['tenant_name', 'property_address', 'monthly_rent', 'deposit', 'lease_start', 'lease_end'],
  },
  {
    id: '2',
    name: 'Tenant Application Form',
    description: 'Rental application form for prospective tenants',
    category: 'form',
    lastUpdated: '2026-02-20',
    fields: ['full_name', 'id_number', 'employment', 'income', 'references'],
  },
  {
    id: '3',
    name: 'Property Inspection Report',
    description: 'Checklist for move-in/move-out property inspections',
    category: 'checklist',
    lastUpdated: '2026-03-01',
    fields: ['property_address', 'inspector', 'date', 'condition_items'],
  },
  {
    id: '4',
    name: 'Lease Renewal Notice',
    description: 'Notice to tenant regarding lease renewal',
    category: 'notice',
    lastUpdated: '2026-02-10',
    fields: ['tenant_name', 'property_address', 'current_lease_end', 'new_terms'],
  },
  {
    id: '5',
    name: 'Sale Agreement',
    description: 'Property sale agreement template',
    category: 'agreement',
    lastUpdated: '2026-01-20',
    fields: ['buyer_name', 'seller_name', 'property_address', 'purchase_price', 'conditions'],
  },
  {
    id: '6',
    name: 'Maintenance Request Form',
    description: 'Form for tenants to request maintenance',
    category: 'form',
    lastUpdated: '2026-03-15',
    fields: ['tenant_name', 'property', 'issue_description', 'urgency'],
  },
];

const categoryColors = {
  lease: 'bg-blue-100 text-blue-700',
  agreement: 'bg-purple-100 text-purple-700',
  notice: 'bg-amber-100 text-amber-700',
  checklist: 'bg-green-100 text-green-700',
  form: 'bg-cyan-100 text-cyan-700',
};

export function DocumentTemplates() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  const filteredTemplates = templates.filter(t => 
    filter === 'all' || t.category === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Document Templates</h2>
              <p className="text-sm text-stone-500">Create and manage document templates</p>
            </div>
          </div>
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'lease', 'agreement', 'notice', 'checklist', 'form'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors capitalize",
                filter === cat
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {cat === 'all' ? 'All Documents' : cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id} 
            className="p-5 hover:border-indigo-300 cursor-pointer transition-all"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium capitalize",
                categoryColors[template.category]
              )}>
                {template.category}
              </div>
              <span className="text-xs text-stone-400">{template.lastUpdated}</span>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">{template.name}</h3>
            <p className="text-sm text-stone-500 mb-4">{template.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">{template.fields.length} fields</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 m-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium capitalize",
                  categoryColors[selectedTemplate.category]
                )}>
                  {selectedTemplate.category}
                </span>
                <h3 className="text-lg font-semibold text-stone-900 mt-2">{selectedTemplate.name}</h3>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-4">{selectedTemplate.description}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-stone-700 mb-2">Template Fields</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.fields.map(field => (
                  <span 
                    key={field}
                    className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded font-mono"
                  >
                    {`{{${field}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
              <Button variant="outline" className="flex-1">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button className="flex-1 bg-indigo-500">
                <Download className="w-4 h-4 mr-2" /> Use
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DocumentTemplates;