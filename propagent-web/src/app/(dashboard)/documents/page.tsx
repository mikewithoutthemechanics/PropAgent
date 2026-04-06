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
  Shield
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
import { cn } from '@/lib/utils';

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
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
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'expiry' | 'title' | 'property'>('date');
  const [isVisible, setIsVisible] = useState(false);
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
    let docs = filterDocuments(sampleDocuments, {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      searchQuery: searchQuery || undefined,
      expiringWithinDays: showExpiringOnly ? 60 : undefined,
    });
    return sortDocuments(docs, sortBy, 'desc');
  }, [selectedCategory, selectedStatus, searchQuery, showExpiringOnly, sortBy]);

  const stats = useMemo(() => getDocumentStats(sampleDocuments), []);
  const selectedDocData = sampleDocuments.find(d => d.id === selectedDoc);

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
      active: "glass glass-card bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      expiring_soon: "glass glass-card bg-orange-500/20 text-orange-300 border-orange-500/30",
      expired: "glass glass-card bg-red-500/20 text-red-300 border-red-500/30",
      pending: "glass glass-card bg-amber-500/20 text-amber-300 border-amber-500/30",
      archived: "glass glass-card bg-slate-500/20 text-slate-300 border-slate-500/30",
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
    { icon: <FileText className="w-5 h-5 text-blue-400" />, value: stats.total, label: 'Total Docs', color: 'blue' },
    { icon: <File className="w-5 h-5 text-amber-400" />, value: stats.leases, label: 'Leases', color: 'amber' },
    { icon: <AlertTriangle className="w-5 h-5 text-orange-400" />, value: stats.expiringSoon, label: 'Expiring Soon', color: 'orange' },
    { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, value: stats.expired, label: 'Expired', color: 'red' },
    { icon: <Shield className="w-5 h-5 text-emerald-400" />, value: stats.idDocuments, label: 'ID Documents', color: 'emerald' },
  ];

  return (
    <div ref={pageRef} className="space-y-6 relative">
      {/* Animated Gradient Header */}
      <div className="gradient-header relative rounded-2xl p-6 overflow-hidden">
        <AnimatedBackground />
        <FloatingParticles />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white text-gradient-gold">Document Management</h1>
              <p className="text-slate-300 mt-1">
                Secure storage for leases, contracts & property documents
              </p>
            </div>
            <Button className="glow-gold hover:scale-105 transition-transform duration-300">
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
              "glass-card hover-3d-card rounded-xl p-4 border border-amber-500/20",
              isVisible && "animate-on-scroll"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className={cn("glass-card rounded-xl p-4 border border-amber-500/20", isVisible && "animate-on-scroll visible delay-200")}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-amber-500/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-slate-400"
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
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg glow-gold"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-amber-500/20"
                )}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
          
          <label className="flex items-center gap-2 px-3 py-2 glass rounded-lg cursor-pointer border border-orange-500/30">
            <input
              type="checkbox"
              checked={showExpiringOnly}
              onChange={(e) => setShowExpiringOnly(e.target.checked)}
              className="w-4 h-4 text-orange-500"
            />
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Expiring Soon</span>
          </label>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={cn("glass-card rounded-xl overflow-hidden border border-amber-500/20 lg:col-span-2", isVisible && "animate-on-scroll visible delay-300")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredDocs.map(doc => (
                  <tr 
                    key={doc.id} 
                    className={cn(
                      "hover:bg-slate-800/30 cursor-pointer transition-colors",
                      selectedDoc === doc.id && "bg-amber-500/10"
                    )}
                    onClick={() => setSelectedDoc(doc.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded glass flex items-center justify-center">
                          <FileText className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{doc.title}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-300">{doc.propertyAddress}</p>
                      {doc.tenantName && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {doc.tenantName}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded glass">
                        {getCategoryLabel(doc.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {doc.endDate ? (
                        <p className="text-sm text-slate-300">
                          {new Date(doc.endDate).toLocaleDateString('en-ZA')}
                          {getDaysUntilExpiry(doc) !== null && getDaysUntilExpiry(doc)! <= 30 && (
                            <span className="ml-2 text-xs text-orange-400 font-medium">
                              ({getDaysUntilExpiry(doc)} days)
                            </span>
                          )}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
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
              icon={<FileText className="w-8 h-8 text-slate-600" />}
              title="No documents found"
              description="Try adjusting your filters or upload new documents"
              action={<Button size="sm" className="glow-gold">Upload Document</Button>}
            />
          )}
        </div>

        {/* Detail Panel */}
        <div className={cn("glass-card rounded-xl p-4 border border-amber-500/20", isVisible && "animate-on-scroll visible delay-400")}>
          {selectedDocData ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg glass flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedDocData.title}</h3>
                    <p className="text-xs text-slate-500">{selectedDocData.fileName}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(getDocumentStatus(selectedDocData))}
              </div>

              <div className="space-y-3 border-t border-amber-500/20 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Property:</span>
                  <span className="font-medium text-white">{selectedDocData.propertyAddress}</span>
                </div>
                
                {selectedDocData.tenantName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Tenant:</span>
                    <span className="font-medium text-white">{selectedDocData.tenantName}</span>
                  </div>
                )}

                {selectedDocData.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Lease Period:</span>
                    <span className="font-medium text-white">
                      {new Date(selectedDocData.startDate).toLocaleDateString('en-ZA')} - {new Date(selectedDocData.endDate!).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}

                {selectedDocData.monthlyRent && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Monthly Rent:</span>
                    <span className="font-medium text-white">R{selectedDocData.monthlyRent.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400">Uploaded:</span>
                  <span className="font-medium text-white">
                    {new Date(selectedDocData.uploadedAt).toLocaleDateString('en-ZA')}
                  </span>
                </div>

                {selectedDocData.lastReviewedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Last Reviewed:</span>
                    <span className="font-medium text-white">
                      {new Date(selectedDocData.lastReviewedAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}
              </div>

              {selectedDocData.versions.length > 1 && (
                <div className="border-t border-amber-500/20 pt-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-2">Version History</h4>
                  <div className="space-y-2">
                    {selectedDocData.versions.map((v, i) => (
                      <div key={v.version} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">v{v.version}</span>
                        <span className="text-slate-600">{new Date(v.uploadedAt).toLocaleDateString('en-ZA')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 border-t border-amber-500/20 pt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1 glass hover:bg-amber-500/20">
                  <Eye className="w-4 h-4 text-amber-400" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 glass hover:bg-amber-500/20">
                  <Download className="w-4 h-4 text-amber-400" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1 glass hover:bg-red-500/20 text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className={cn("glass p-4 rounded-xl border border-amber-500/20", isVisible && "animate-on-scroll visible delay-500")}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-white">Secure Document Storage</p>
            <p className="text-sm text-slate-400 mt-1">
              All documents are encrypted at rest. Lease agreements automatically trigger expiry alerts at 30, 14, 7, and 1 day(s) before expiration. 
              ID documents are stored with the highest security level and are only accessible to authorized agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}