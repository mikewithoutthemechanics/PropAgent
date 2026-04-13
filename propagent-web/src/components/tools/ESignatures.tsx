'use client';

import { useState } from 'react';
import { PenTool, Send, Check, Clock, X, FileText, User, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { formatCurrency, cn } from '@/lib/utils';

interface SignatureRequest {
  id: string;
  documentName: string;
  documentType: 'lease' | 'agreement' | 'addendum' | 'notice';
  parties: { name: string; email: string; role: 'landlord' | 'tenant' | 'buyer' | 'seller'; signed: boolean }[];
  status: 'pending' | 'partially_signed' | 'completed' | 'expired';
  createdAt: string;
  expiresAt: string;
  property?: string;
}

const initialRequests: SignatureRequest[] = [
  {
    id: '1',
    documentName: 'Lease Agreement - Unit 14B',
    documentType: 'lease',
    parties: [
      { name: 'John Smith', email: 'john@email.com', role: 'tenant', signed: true },
      { name: 'Sarah Owner', email: 'sarah@owner.com', role: 'landlord', signed: false },
    ],
    status: 'partially_signed',
    createdAt: '2026-04-01',
    expiresAt: '2026-04-15',
    property: '14 Oak Lane, Sandton',
  },
  {
    id: '2',
    documentName: 'Sale Agreement - Beach Rd',
    documentType: 'agreement',
    parties: [
      { name: 'Mike Buyer', email: 'mike@buyer.com', role: 'buyer', signed: true },
      { name: 'Jane Seller', email: 'jane@seller.com', role: 'seller', signed: true },
    ],
    status: 'completed',
    createdAt: '2026-03-20',
    expiresAt: '2026-04-20',
    property: '42 Beach Road, Mossel Bay',
  },
  {
    id: '3',
    documentName: 'Pet Addendum - Maple Ave',
    documentType: 'addendum',
    parties: [
      { name: 'Sarah Jones', email: 'sarah@rent.com', role: 'tenant', signed: false },
      { name: 'Property Mgmt', email: 'pm@agency.com', role: 'landlord', signed: false },
    ],
    status: 'pending',
    createdAt: '2026-04-07',
    expiresAt: '2026-04-21',
    property: '8 Maple Ave, Cape Town',
  },
];

export function ESignatures() {
  const [requests, setRequests] = useState<SignatureRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);

  const statusColors = {
    pending: 'bg-stone-100 text-stone-600',
    partially_signed: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
  };

  const typeIcons = {
    lease: '📄',
    agreement: '🤝',
    addendum: '📎',
    notice: '📢',
  };

  const getStatusText = (status: SignatureRequest['status']) => {
    switch (status) {
      case 'pending': return 'Awaiting Signatures';
      case 'partially_signed': return 'Partially Signed';
      case 'completed': return 'Completed';
      case 'expired': return 'Expired';
    }
  };

  const sendReminder = (id: string) => {
    alert('Reminder sent to pending parties!');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {requests.filter(r => r.status === 'pending' || r.status === 'partially_signed').length}
              </p>
              <p className="text-xs text-stone-500">Awaiting</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {requests.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-xs text-stone-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{requests.length}</p>
              <p className="text-xs text-stone-500">Total Sent</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">
                {requests.filter(r => r.status === 'expired').length}
              </p>
              <p className="text-xs text-stone-500">Expired</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">E-Signatures</h2>
              <p className="text-sm text-stone-500">Manage document signatures</p>
            </div>
          </div>
          <Button className="bg-teal-500 hover:bg-teal-600">
            <Send className="w-4 h-4 mr-2" /> Send for Signature
          </Button>
        </div>

        <div className="space-y-3">
          {requests.map(request => (
            <div 
              key={request.id}
              className="p-4 border border-stone-200 rounded-xl hover:border-stone-300 transition-colors cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{typeIcons[request.documentType]}</span>
                  <div>
                    <h3 className="font-medium text-stone-900">{request.documentName}</h3>
                    {request.property && (
                      <p className="text-sm text-stone-500">{request.property}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-stone-400">Created: {request.createdAt}</span>
                      <span className="text-xs text-stone-400">Expires: {request.expiresAt}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    statusColors[request.status]
                  )}>
                    {getStatusText(request.status)}
                  </span>
                </div>
              </div>
              
              {/* Signatures */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                {request.parties.map((party, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      party.signed ? "bg-green-100" : "bg-stone-100"
                    )}>
                      {party.signed ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-700">{party.name}</p>
                      <p className="text-xs text-stone-400 capitalize">{party.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6 m-4">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">{selectedRequest.documentName}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Signing Parties</h4>
                {selectedRequest.parties.map((party, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-stone-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{party.name}</p>
                        <p className="text-xs text-stone-500">{party.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium capitalize",
                        party.signed ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"
                      )}>
                        {party.signed ? 'Signed' : 'Pending'}
                      </span>
                      {!party.signed && selectedRequest.status !== 'completed' && (
                        <button 
                          onClick={() => sendReminder(selectedRequest.id)}
                          className="p-1 hover:bg-stone-200 rounded"
                        >
                          <RefreshCw className="w-3 h-3 text-stone-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedRequest(null)} className="flex-1">Close</Button>
              <Button variant="outline" className="flex-1">
                <FileText className="w-4 h-4 mr-2" /> View Document
              </Button>
              <Button className="flex-1 bg-teal-500">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ESignatures;