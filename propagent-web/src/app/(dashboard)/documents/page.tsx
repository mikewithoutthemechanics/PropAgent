'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Upload, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  File,
  FolderOpen,
  Building,
  User,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  Shield,
  X,
  FileText as FileIcon,
  ExternalLink,
  FileCheck,
  FileX,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, EmptyState } from '@/components/ui';
import { 
  PropertyDocument, 
  DocumentCategory, 
  DocumentStatus,
  sampleDocuments, 
  filterDocuments,
  sortDocuments,
  getDocumentStatus,
  getDaysUntilExpiry,
  formatFileSize,
  getCategoryLabel,
  getStatusVariant,
  getDocumentStats 
} from '@/lib/documents';
import { mockProperties } from '@/lib/data';
import { cn } from '@/lib/utils';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-lime-400 to-lime-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PropertyDocument[]>(sampleDocuments);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'expiry' | 'title' | 'property'>('date');
  const [isVisible, setIsVisible] = useState(false);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<PropertyDocument | null>(null);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    category: 'lease' as DocumentCategory,
    propertyId: '',
    tenantId: '',
    expiryDate: '',
    notes: ''
  });

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (pageRef.current) {
      observer.observe(pageRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredDocs = useMemo(() => {
    const docs = filterDocuments(documents, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      searchQuery: searchQuery || undefined,
      expiringWithinDays: showExpiringOnly ? 60 : undefined,
    });
    return sortDocuments(docs, sortBy, 'desc');
  }, [documents, selectedCategory, selectedStatus, searchQuery, showExpiringOnly, sortBy]);

  const stats = useMemo(() => getDocumentStats(documents), [documents]);
  const selectedDocData = documents.find(d => d.id === selectedDoc);

  const handleUploadDocument = () => {
    if (!newDocument.title || !newDocument.propertyId || !newDocument.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    const property = mockProperties.find(p => p.id === newDocument.propertyId);
    const doc: PropertyDocument = {
      id: `doc_${Date.now()}`,
      title: newDocument.title,
      fileName: `${newDocument.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: Math.floor(Math.random() * 1000000) + 50000,
      mimeType: 'application/pdf',
      category: newDocument.category,
      propertyId: newDocument.propertyId,
      propertyAddress: property?.address || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: newDocument.expiryDate || null,
      status: 'active',
      uploadedBy: 'Current User',
      notes: newDocument.notes || undefined,
      tenantId: newDocument.tenantId || undefined,
      tenantName: undefined,
      startDate: new Date().toISOString().split('T')[0],
      endDate: newDocument.expiryDate || undefined,
      monthlyRent: property?.monthlyRent,
      uploadedAt: new Date().toISOString(),
      versions: [{ version: 1, uploadedAt: new Date().toISOString(), uploadedBy: 'Current User' }]
    };
    
    setDocuments(prev => [doc, ...prev]);
    alert(`Document "${doc.title}" uploaded successfully!`);
    setShowUploadModal(false);
    setNewDocument({
      title: '',
      category: 'lease',
      propertyId: '',
      tenantId: '',
      expiryDate: '',
      notes: ''
    });
  };

  const handleViewDocument = (doc: PropertyDocument) => {
    setViewingDoc(doc);
    setShowViewModal(true);
  };

  const handleDownloadDocument = (doc: PropertyDocument) => {
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(${doc.title}) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \n0000000303 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n385\n%%EOF`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteDocument = () => {
    if (!deletingDocId) return;
    setDocuments(prev => prev.filter(d => d.id !== deletingDocId));
    if (selectedDoc === deletingDocId) {
      setSelectedDoc(null);
    }
    setShowDeleteConfirm(false);
    setDeletingDocId(null);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const variant = getStatusVariant(status);
    const labels: Record<DocumentStatus, string> = {
      active: 'Active',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired',
      pending: 'Pending',
      archived: 'Archived',
    };
    
    const badgeClass = {
      active: "bg-white border-2 border-charcoal-100 rounded-2xl bg-lime-400/20 text-lime-400 border-lime-400/30",
      expiring_soon: "bg-white border-2 border-charcoal-100 rounded-2xl bg-lime-400/20 text-lime-400 border-lime-400/30",
      expired: "bg-white border-2 border-charcoal-100 rounded-2xl bg-lime-400/20 text-lime-400 border-lime-400/30",
      pending: "bg-white border-2 border-charcoal-100 rounded-2xl bg-lime-400/20 text-lime-400 border-lime-400/30",
      archived: "bg-white border-2 border-charcoal-100 rounded-2xl bg-lime-400/20 text-lime-400 border-lime-400/30",
    };

    return (
      <Badge className={cn("gap-1", badgeClass[status])}>
        {status === 'active' && <CheckCircle className="w-3 h-3" />}
        {status === 'expiring_soon' && <Clock className="w-3 h-3" />}
        {status === 'expired' && <AlertTriangle className="w-3 h-3" />}
        {labels[status]}
      </Badge>
    );
  };

  const categories: { value: DocumentCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Documents', count: stats.total },
    { value: 'lease', label: 'Leases', count: stats.leases },
    { value: 'contract', label: 'Contracts', count: stats.contracts },
    { value: 'id_document', label: 'ID Documents', count: stats.idDocuments },
    { value: 'report', label: 'Reports', count: stats.reports },
  ];

  const statCards = [
    { icon: <FileText className="w-5 h-5 text-lime-400" />, value: stats.total, label: 'Total Docs', color: 'lime' },
    { icon: <File className="w-5 h-5 text-lime-400" />, value: stats.leases, label: 'Leases', color: 'lime' },
    { icon: <AlertTriangle className="w-5 h-5 text-lime-400" />, value: stats.expiringSoon, label: 'Expiring Soon', color: 'lime' },
    { icon: <AlertTriangle className="w-5 h-5 text-lime-400" />, value: stats.expired, label: 'Expired', color: 'lime' },
    { icon: <Shield className="w-5 h-5 text-lime-400" />, value: stats.idDocuments, label: 'ID Documents', color: 'lime' },
  ];

  return (
    <div ref={pageRef} className="space-y-6 relative">
      {/* Animated Gradient Header */}
      <div className="bg-gradient-to-r from-lime-400 via-lime-400 to-lime-400 relative rounded-2xl p-6 overflow-hidden">
        <AnimatedBackground />
        <FloatingParticles />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">Document Management</h1>
              <p className="text-charcoal-600 mt-1">
                Secure storage for leases, contracts & property documents
              </p>
            </div>
            <Button className="bg-lime-400 text-charcoal-900 hover:bg-lime-500 transition-transform duration-300 rounded-full font-medium" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-1.5" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cn("grid grid-cols-2 md:grid-cols-5 gap-4", isVisible && "animate-on-scroll visible stagger-children")}>
        {statCards.map((stat, idx) => (
          <div 
            key={stat.label} 
            className={cn(
              "bg-white border-2 border-charcoal-100 rounded-2xl hover-3d-card rounded-xl p-4 border border-charcoal-100",
              isVisible && "animate-on-scroll"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/50 border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
                <p className="text-xs text-charcoal-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl rounded-xl p-4 border border-charcoal-100", isVisible && "animate-on-scroll visible delay-200")}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lime-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-charcoal-100/50 border border-charcoal-300/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 text-charcoal-900 placeholder-charcoal-400"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
                  selectedCategory === cat.value
                    ? "bg-gradient-to-r from-lime-400 to-lime-400 text-charcoal-900 shadow-lg"
                    : "bg-charcoal-100/50 text-charcoal-500 hover:bg-charcoal-50/50 border border-charcoal-100"
                )}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-white/50 border-2 border-charcoal-100 rounded-2xl rounded-lg cursor-pointer border border-lime-400/30">
            <input
              type="checkbox"
              checked={showExpiringOnly}
              onChange={(e) => setShowExpiringOnly(e.target.checked)}
              className="w-4 h-4 text-lime-500"
            />
            <AlertTriangle className="w-4 h-4 text-lime-400" />
            <span className="text-sm font-medium text-lime-400">Expiring Soon</span>
          </label>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl rounded-xl overflow-hidden border border-charcoal-100 lg:col-span-2", isVisible && "animate-on-scroll visible delay-300")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-charcoal-100/50 border-b border-charcoal-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-lime-400 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-lime-400 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-lime-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-lime-400 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-lime-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredDocs.map(doc => (
                  <tr 
                    key={doc.id} 
                    className={cn(
                      "hover:bg-charcoal-100/30 cursor-pointer transition-colors",
                      selectedDoc === doc.id && "bg-charcoal-100/10"
                    )}
                    onClick={() => setSelectedDoc(doc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/50 border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
                          <FileText className="w-4 h-4 text-lime-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900 text-sm">{doc.title}</p>
                          <p className="text-xs text-charcoal-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-charcoal-500">{doc.propertyAddress}</p>
                      {doc.tenantName && (
                        <p className="text-xs text-charcoal-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {doc.tenantName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-lime-400 bg-lime-400/10 px-2 py-1 rounded-lg bg-white/50 border-2 border-charcoal-100">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.endDate ? (
                        <p className="text-sm text-charcoal-500">
                          {new Date(doc.endDate).toLocaleDateString('en-ZA')}
                          {getDaysUntilExpiry(doc) !== null && getDaysUntilExpiry(doc)! <= 30 && (
                            <span className="ml-2 text-xs text-lime-400 font-medium">
                              ({getDaysUntilExpiry(doc)} days)
                            </span>
                          )}
                        </p>
                      ) : (
                        <span className="text-xs text-charcoal-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(getDocumentStatus(doc))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDocs.length === 0 && (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-charcoal-600" />}
              title="No documents found"
              description="Try adjusting your filters or upload new documents"
              action={<Button size="sm" className="bg-lime-400 rounded-full">Upload Document</Button>}
            />
          )}
        </div>

        {/* Detail Panel */}
        <div className={cn("bg-white border-2 border-charcoal-100 rounded-2xl rounded-xl p-4 border border-charcoal-100", isVisible && "animate-on-scroll visible delay-400")}>
          {selectedDocData ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white/50 border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">{selectedDocData.title}</h3>
                    <p className="text-xs text-charcoal-500">{selectedDocData.fileName}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-charcoal-100/50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-charcoal-500" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(getDocumentStatus(selectedDocData))}
              </div>

              <div className="space-y-3 border-t border-charcoal-100 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-lime-400" />
                  <span className="text-charcoal-500">Property:</span>
                  <span className="font-medium text-charcoal-900">{selectedDocData.propertyAddress}</span>
                </div>
                
                {selectedDocData.tenantName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-lime-400" />
                    <span className="text-charcoal-500">Tenant:</span>
                    <span className="font-medium text-charcoal-900">{selectedDocData.tenantName}</span>
                  </div>
                )}

                {selectedDocData.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-lime-400" />
                    <span className="text-charcoal-500">Lease Period:</span>
                    <span className="font-medium text-charcoal-900">
                      {new Date(selectedDocData.startDate).toLocaleDateString('en-ZA')} - {new Date(selectedDocData.endDate!).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}

                {selectedDocData.monthlyRent && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-lime-400" />
                    <span className="text-charcoal-500">Monthly Rent:</span>
                    <span className="font-medium text-charcoal-900">R{selectedDocData.monthlyRent.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-lime-400" />
                  <span className="text-charcoal-500">Uploaded:</span>
                  <span className="font-medium text-charcoal-900">
                    {new Date(selectedDocData.uploadedAt).toLocaleDateString('en-ZA')}
                  </span>
                </div>

                {selectedDocData.lastReviewedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-lime-400" />
                    <span className="text-charcoal-500">Last Reviewed:</span>
                    <span className="font-medium text-charcoal-900">
                      {new Date(selectedDocData.lastReviewedAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}
              </div>

              {selectedDocData.versions.length > 1 && (
                <div className="border-t border-charcoal-100 pt-4">
                  <h4 className="text-sm font-medium text-lime-400 mb-2">Version History</h4>
                  <div className="space-y-2">
                    {selectedDocData.versions.map((v, i) => (
                      <div key={v.version} className="flex items-center justify-between text-xs">
                        <span className="text-charcoal-500">v{v.version}</span>
                        <span className="text-charcoal-600">{new Date(v.uploadedAt).toLocaleDateString('en-ZA')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t border-charcoal-100 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1 bg-white/50 border-2 border-charcoal-100 rounded-2xl hover:bg-lime-400/20"
                  onClick={() => handleViewDocument(selectedDocData)}
                >
                  <Eye className="w-4 h-4 text-lime-400" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1 bg-white/50 border-2 border-charcoal-100 rounded-2xl hover:bg-lime-400/20"
                  onClick={() => handleDownloadDocument(selectedDocData)}
                >
                  <Download className="w-4 h-4 text-lime-400" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 bg-white/50 border-2 border-charcoal-100 rounded-2xl hover:bg-lime-400/20 text-lime-400"
                  onClick={() => {
                    setDeletingDocId(selectedDocData.id);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderOpen className="w-12 h-12 text-charcoal-600 mx-auto mb-3" />
              <p className="text-charcoal-500">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className={cn("bg-white p-4 rounded-xl border border-charcoal-100", isVisible && "animate-on-scroll visible delay-500")}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-charcoal-900">Secure Document Storage</p>
            <p className="text-sm text-charcoal-500 mt-1">
              All documents are encrypted at rest. Lease agreements automatically trigger expiry alerts at 30, 14, 7, and 1 day(s) before expiration. 
              ID documents are stored with the highest security level and are only accessible to authorized agents.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
              <h2 className="text-xl font-bold text-charcoal-900 font-serif">Upload Document</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-charcoal-500 hover:text-charcoal-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Document Title *</label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  placeholder="e.g., Lease Agreement - Unit 4B"
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Category *</label>
                <select
                  value={newDocument.category}
                  onChange={(e) => setNewDocument({...newDocument, category: e.target.value as DocumentCategory})}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400/50"
                >
                  <option value="lease">Lease Agreement</option>
                  <option value="id">ID Document</option>
                  <option value="financial">Financial Document</option>
                  <option value="inspection">Inspection Report</option>
                  <option value="contract">Contract</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Property *</label>
                <select
                  value={newDocument.propertyId}
                  onChange={(e) => setNewDocument({...newDocument, propertyId: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400/50"
                >
                  <option value="">Select a property</option>
                  {mockProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-500 mb-2">Notes (optional)</label>
                <textarea
                  value={newDocument.notes}
                  onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-600 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400/50 resize-none"
                />
              </div>

              <div className="border-2 border-dashed border-charcoal-600 rounded-lg p-8 text-center">
                <FileIcon className="w-10 h-10 text-charcoal-500 mx-auto mb-3" />
                <p className="text-charcoal-500 text-sm">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-charcoal-500 text-xs mt-2">
                  PDF, DOC, DOCX, JPG, PNG (max 10MB)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-charcoal-700">
              <Button 
                variant="outline" 
                className="border-charcoal-600 text-charcoal-400 hover:bg-charcoal-700 bg-lime-400 rounded-full"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-lime-400 rounded-full"
                onClick={handleUploadDocument}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      {showViewModal && viewingDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/50 border-2 border-charcoal-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-charcoal-900 font-serif">{viewingDoc.title}</h2>
                  <p className="text-sm text-charcoal-500">{viewingDoc.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-charcoal-500 hover:text-charcoal-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Document Preview Placeholder */}
              <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-8 text-center mb-6">
                <FileText className="w-16 h-16 text-charcoal-600 mx-auto mb-4" />
                <p className="text-charcoal-500">Document Preview</p>
                <p className="text-sm text-charcoal-500 mt-2">
                  {viewingDoc.mimeType} • {formatFileSize(viewingDoc.fileSize)}
                </p>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-charcoal-800/50 rounded-lg">
                  <p className="text-xs text-charcoal-500 mb-1">Property</p>
                  <p className="text-sm font-medium text-charcoal-900">{viewingDoc.propertyAddress}</p>
                </div>
                <div className="p-4 bg-charcoal-800/50 rounded-lg">
                  <p className="text-xs text-charcoal-500 mb-1">Category</p>
                  <p className="text-sm font-medium text-charcoal-900">{getCategoryLabel(viewingDoc.category)}</p>
                </div>
                <div className="p-4 bg-charcoal-800/50 rounded-lg">
                  <p className="text-xs text-charcoal-500 mb-1">Uploaded By</p>
                  <p className="text-sm font-medium text-charcoal-900">{viewingDoc.uploadedBy}</p>
                </div>
                <div className="p-4 bg-charcoal-800/50 rounded-lg">
                  <p className="text-xs text-charcoal-500 mb-1">Upload Date</p>
                  <p className="text-sm font-medium text-charcoal-900">
                    {new Date(viewingDoc.uploadedAt).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                {viewingDoc.tenantName && (
                  <div className="p-4 bg-charcoal-800/50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Tenant</p>
                    <p className="text-sm font-medium text-charcoal-900">{viewingDoc.tenantName}</p>
                  </div>
                )}
                {viewingDoc.endDate && (
                  <div className="p-4 bg-charcoal-800/50 rounded-lg">
                    <p className="text-xs text-charcoal-500 mb-1">Expiry Date</p>
                    <p className="text-sm font-medium text-charcoal-900">
                      {new Date(viewingDoc.endDate).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                )}
              </div>

              {viewingDoc.notes && (
                <div className="mt-4 p-4 bg-charcoal-800/50 rounded-lg">
                  <p className="text-xs text-charcoal-500 mb-1">Notes</p>
                  <p className="text-sm text-charcoal-900">{viewingDoc.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-charcoal-700">
              <div className="flex items-center gap-2">
                {getStatusBadge(getDocumentStatus(viewingDoc))}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  className="border-charcoal-600 text-charcoal-400 hover:bg-charcoal-700 bg-lime-400 rounded-full"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                <Button 
                  className="bg-lime-400 rounded-full"
                  onClick={() => {
                    handleDownloadDocument(viewingDoc);
                    setShowViewModal(false);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-lime-400/30 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-lime-400" />
              </div>
              <h2 className="text-xl font-bold text-charcoal-900 mb-2">Delete Document?</h2>
              <p className="text-charcoal-500 text-sm">
                This action cannot be undone. The document &quot;{documents.find(d => d.id === deletingDocId)?.title}&quot; will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 p-6 border-t border-charcoal-700">
              <Button 
                variant="outline" 
                className="border-charcoal-600 text-charcoal-400 hover:bg-charcoal-700 bg-lime-400 rounded-full"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingDocId(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-lime-400 hover:bg-lime-500 text-charcoal-900 rounded-full"
                onClick={handleDeleteDocument}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}