'use client';

import { useState } from 'react';
import { Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, Calendar, X } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { mockMaintenanceRequests, mockProperties, mockTenants } from '@/lib/data';
import { formatDate, getStatusColor } from '@/lib/utils';

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [requests, setRequests] = useState(mockMaintenanceRequests);
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

  const handleAddRequest = () => {
    if (!newRequest.title || !newRequest.propertyId) {
      alert('Please fill in required fields (Title, Property)');
      return;
    }
    
    const request = {
      id: `maint_${Date.now()}`,
      title: newRequest.title,
      description: newRequest.description || 'No description provided',
      propertyId: newRequest.propertyId,
      tenantId: newRequest.tenantId || null,
      priority: newRequest.priority as 'low' | 'medium' | 'high' | 'emergency',
      category: newRequest.category,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      dueDate: newRequest.dueDate || null,
      estimatedCost: newRequest.estimatedCost ? parseFloat(newRequest.estimatedCost) : null,
      assignedContractor: newRequest.assignedContractor || null,
      notes: newRequest.notes || null,
    };
    
    setRequests([request, ...requests]);
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

  const getPropertyAddress = (propertyId: string) => {
    const property = mockProperties.find(p => p.id === propertyId);
    return property ? `${property.address}, ${property.suburb}` : 'Unknown';
  };

  const getTenantName = (tenantId: string) => {
    const tenant = mockTenants.find(t => t.id === tenantId);
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
      pending: 'bg-gold-100 text-gold-800 border-slate-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-gold-100 text-gold-800 border-gold-300',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-300',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      low: 'bg-slate-100 text-slate-700 border-slate-300',
      medium: 'bg-gold-100 text-gold-800 border-slate-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      emergency: 'bg-red-100 text-red-800 border-red-300',
      urgent: 'bg-red-100 text-red-800 border-red-300',
    };
    return priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-500 mt-1">Track and manage maintenance requests</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-xl font-bold text-slate-900">
                {mockMaintenanceRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-xl font-bold text-slate-900">
                {mockMaintenanceRequests.filter(r => r.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-xl font-bold text-slate-900">
                {mockMaintenanceRequests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Emergency</p>
              <p className="text-xl font-bold text-slate-900">
                {mockMaintenanceRequests.filter(r => r.priority === 'emergency').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search maintenance requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 cursor-pointer"
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
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{request.title}</h3>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{request.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
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
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-sm text-slate-600">{formatDate(request.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-500">No maintenance requests found.</p>
          </div>
        )}
      </Card>

      {/* Add Maintenance Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">New Maintenance Request</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input 
                  type="text" 
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g., Leaking tap in kitchen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Describe the issue in detail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Property</label>
                <select 
                  value={newRequest.propertyId}
                  onChange={(e) => setNewRequest({...newRequest, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer"
                >
                  <option value="">Select a property...</option>
                  {mockProperties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.address}, {prop.suburb}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select 
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select 
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 cursor-pointer"
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
                className="px-4 py-2.5 bg-slate-700 rounded-lg text-white text-sm hover:bg-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddRequest}
                className="px-6 py-2.5 bg-gradient-to-r from-navy-500 to-navy-600 rounded-lg text-white text-sm font-medium hover:shadow-lg hover:shadow-navy-500/25 transition-all cursor-pointer"
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
