'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionCompat = any;

import { useState, useRef, useEffect } from 'react';
import { Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, X, Mic, MicOff } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import {
  mockMaintenanceRequests,
  mockProperties,
  mockTenants,
  UIMaintenanceRequest,
  UIProperty,
  UITenant,
} from '@/lib/data';
import { useCollection, newId } from '@/lib/persistence';
import { useNotify } from '@/lib/useNotify';
import { formatDate, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const {
    items: requests,
    add: addRequest,
    update: updateRequest,
  } = useCollection<UIMaintenanceRequest>(
    'maintenance_requests',
    mockMaintenanceRequests,
  );
  const { items: properties } = useCollection<UIProperty>(
    'properties',
    mockProperties,
  );
  const { items: tenants } = useCollection<UITenant>('tenants', mockTenants);
  const notify = useNotify();
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    propertyId: '',
    unitNumber: '',
    tenantId: '',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    estimatedCost: '',
    assignedContractor: '',
    notes: '',
  });
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionCompat | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Set up speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setVoiceTranscript(prev => prev + ' ' + final);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setVoiceTranscript('');
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch {}
    }
  };

  // Auto-fill description from voice
  useEffect(() => {
    if (voiceTranscript && !isRecording) {
      setNewRequest(prev => ({ ...prev, description: prev.description + voiceTranscript }));
      setVoiceTranscript('');
    }
  }, [voiceTranscript, isRecording]);

  const handleAddRequest = () => {
    if (!newRequest.title || !newRequest.propertyId) {
      alert('Please fill in required fields (Title, Property)');
      return;
    }
    
    // AI-powered automatic priority detection
    const autoPriority = detectUrgency(newRequest.title, newRequest.description);
    const priority = autoPriority || newRequest.priority;
    
    const request: UIMaintenanceRequest = {
      id: newId('maint'),
      title: newRequest.title,
      description: newRequest.description || 'No description provided',
      propertyId: newRequest.propertyId,
      tenantId: newRequest.tenantId || null,
      priority: priority as 'low' | 'medium' | 'high' | 'emergency',
      category: newRequest.category,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: newRequest.dueDate || null,
      estimatedCost: newRequest.estimatedCost ? parseFloat(newRequest.estimatedCost) : null,
      assignedContractor: newRequest.assignedContractor || null,
      notes: newRequest.notes || null,
    };

    addRequest(request);
    const tenant = tenants.find((t) => t.id === request.tenantId);
    notify({
      type: 'maintenance_update',
      priority: priority === 'emergency' ? 'urgent' : priority === 'high' ? 'high' : 'medium',
      title: `New maintenance ticket: ${request.title}`,
      message: `A ${priority} priority maintenance request has been created${
        request.assignedContractor ? ` and assigned to ${request.assignedContractor}` : ''
      }.`,
      actionUrl: '/maintenance',
      email: tenant?.email
        ? {
            to: tenant.email,
            recipientName: `${tenant.firstName} ${tenant.lastName}`,
            actionLabel: 'View ticket',
          }
        : undefined,
    });
    setShowAddModal(false);
    setNewRequest({
      title: '',
      description: '',
      propertyId: '',
      unitNumber: '',
      tenantId: '',
      priority: 'medium',
      category: 'general',
      dueDate: '',
      estimatedCost: '',
      assignedContractor: '',
      notes: '',
    });
  };

  // AI urgency detection based on keywords
  const detectUrgency = (title: string, description: string): string | null => {
    const text = (title + ' ' + description).toLowerCase();
    
    const emergencyKeywords = ['fire', 'flood', 'gas', 'electrical hazard', 'no water', 'no electricity', 'burst pipe', 'gas leak', 'security', 'broken window', 'roof collapse', 'structural'];
    const highKeywords = ['leaking', 'water damage', 'no hot water', 'ac not working', 'heater broken', 'toilet overflowing', 'no heat', 'security camera', 'gate broken'];
    const mediumKeywords = ['drip', 'slow drain', 'light not working', 'tap running', 'paint', 'door handle', 'lock'];
    
    if (emergencyKeywords.some(k => text.includes(k))) return 'emergency';
    if (highKeywords.some(k => text.includes(k))) return 'high';
    if (mediumKeywords.some(k => text.includes(k))) return 'medium';
    
    return null;
  };

  const getPropertyAddress = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property ? `${property.address}, ${property.suburb}` : 'Unknown';
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'Unassigned';
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <AlertTriangle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-primary/10 text-primary border-charcoal-300',
      'in-progress': 'bg-accent/10 text-accent border-charcoal-300',
      completed: 'bg-primary/10 text-primary border-primary/30',
      cancelled: 'bg-charcoal-100 text-charcoal-600 border-charcoal-300',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      low: 'bg-charcoal-100 text-charcoal-700 border-charcoal-300',
      medium: 'bg-primary/10 text-primary border-charcoal-300',
      high: 'bg-rose-100 text-rose-800 border-rose-300',
      emergency: 'bg-red-100 text-red-800 border-red-300',
      urgent: 'bg-red-100 text-red-800 border-red-300',
    };
    return priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Maintenance</h1>
          <p className="text-charcoal-500 mt-1">Track and manage maintenance requests</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="transition-all duration-300 cursor-pointer">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-2 border-charcoal-100 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Pending</p>
              <p className="text-xl font-bold text-charcoal-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-2 border-charcoal-100 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">In Progress</p>
              <p className="text-xl font-bold text-charcoal-900">
                {requests.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-2 border-charcoal-100 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Completed</p>
              <p className="text-xl font-bold text-charcoal-900">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-2 border-charcoal-100 rounded-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Emergency</p>
              <p className="text-xl font-bold text-charcoal-900">
                {requests.filter(r => r.priority === 'emergency').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-charcoal-100 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              <input
                type="text"
                placeholder="Search maintenance requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-charcoal-50 border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white border border-charcoal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all duration-300"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-charcoal-100">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-charcoal-50 transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-charcoal-900">{request.title}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-500 mb-2">{request.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {getPropertyAddress(request.propertyId)}
                    </span>
                    <span>Tenant: {getTenantName(request.tenantId)}</span>
                    <span>Category: {request.category}</span>
                    {request.estimatedCost && (
                      <span>Est. Cost: R{request.estimatedCost}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="text-xs text-charcoal-500">Created</p>
                  <p className="text-sm text-charcoal-600">{formatDate(new Date(request.createdAt))}</p>
                  <select
                    value={request.status}
                    onChange={(e) =>
                      updateRequest(request.id, {
                        status: e.target.value as UIMaintenanceRequest['status'],
                      })
                    }
                    className="px-2 py-1 text-xs bg-white border border-charcoal-200 rounded-md cursor-pointer"
                    aria-label={`Change status for ${request.title}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-charcoal-500">No maintenance requests found.</p>
          </div>
        )}
      </Card>

      {/* Add Maintenance Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-charcoal-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-charcoal-900">New Maintenance Request</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-charcoal-50 rounded-lg transition-all duration-300 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-charcoal-900/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Title</label>
                <input 
                  type="text" 
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 cursor-pointer"
                  placeholder="e.g., Leaking tap in kitchen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">
                  Description
                  {isRecording && <span className="ml-2 text-red-500 text-xs"> (Recording...)</span>}
                </label>
                <div className="relative">
                  <textarea 
                    rows={3}
                    value={newRequest.description + (voiceTranscript && isRecording ? ' ' + voiceTranscript : '')}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 cursor-pointer"
                    placeholder="Describe the issue in detail... (or use voice input)"
                  />
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={cn(
                      "absolute right-3 top-3 p-2 rounded-full transition-all duration-300 cursor-pointer",
                      isRecording && !prefersReducedMotion ? "bg-red-500 text-white animate-pulse" : "bg-charcoal-200 text-charcoal-600 hover:bg-charcoal-300"
                    )}
                    title={isRecording ? "Stop recording" : "Record voice note"}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                {isRecording && (
                  <p className="text-xs text-red-500 mt-1">Listening... Speak your description</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Property</label>
                <select 
                  value={newRequest.propertyId}
                  onChange={(e) => setNewRequest({...newRequest, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all duration-300"
                >
                  <option value="">Select a property...</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.address}, {prop.suburb}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Priority</label>
                  <select 
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all duration-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-500 mb-2">Category</label>
                  <select 
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                    className="w-full px-4 py-3 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all duration-300"
                  >
                    <option value="general">General</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-charcoal-50 rounded-lg text-charcoal-900 text-sm hover:bg-charcoal-200 transition-all duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddRequest}
                className="px-6 py-2.5 bg-primary rounded-full text-charcoal-900 text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
