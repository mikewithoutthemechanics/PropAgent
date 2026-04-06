'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  XCircle,
  AlertCircle,
  ExternalLink,
  Bell,
  Settings
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { 
  samplePropertyViewings, 
  sampleViewingSlots, 
  sampleAgentAvailability,
  sampleCalendarSyncConfig,
  getViewingStats,
  formatTime,
  formatViewingDateTime,
  getViewingStatusStyles,
  getViewingStatusLabel,
  generateTimeSlots,
  PropertyViewing,
  ViewingStatus
} from '@/lib/calendar';
import { cn } from '@/lib/utils';

type ViewMode = 'calendar' | 'list';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function ViewingCard({ viewing }: { viewing: PropertyViewing }) {
  const statusStyles = getViewingStatusStyles(viewing.status);
  
  return (
    <div className="glass-card hover-3d-card p-4 rounded-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <Home className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white text-sm">{viewing.clientName}</p>
            <p className="text-xs text-white/60 truncate">{viewing.propertyTitle || viewing.propertyAddress}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Clock className="w-3 h-3 text-white/40" />
              <span className="text-xs text-white/60">
                {new Date(viewing.scheduledTime).toLocaleTimeString('en-ZA', { 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })} ({viewing.duration} min)
              </span>
            </div>
          </div>
        </div>
        <Badge className={statusStyles}>
          {getViewingStatusLabel(viewing.status)}
        </Badge>
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Mail className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{viewing.clientEmail}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Phone className="w-3 h-3" />
            <span>{viewing.clientPhone}</span>
          </div>
        </div>
        
        {viewing.status === 'pending' && (
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all hover-3d">
              <Check className="w-3 h-3" />
            </button>
            <button className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all hover-3d">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        
        {viewing.status === 'confirmed' && (
          <button className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all hover-3d">
            <Bell className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusFilter({ 
  status, 
  label, 
  count, 
  active, 
  onClick 
}: { 
  status: ViewingStatus | 'all'; 
  label: string; 
  count: number; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover-3d",
        active 
          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg glow-gold" 
          : "glass text-white/80 hover:bg-white/10"
      )}
    >
      {label}
      <span className={cn("ml-2", active ? "text-white/90" : "text-white/60")}>
        ({count})
      </span>
    </button>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [statusFilter, setStatusFilter] = useState<ViewingStatus | 'all'>('all');
  const [showNewViewing, setShowNewViewing] = useState(false);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.id = `anim-${Math.random().toString(36).substr(2, 9)}`;
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  const viewings = samplePropertyViewings;
  const stats = getViewingStats(viewings);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const filteredViewings = viewings.filter(v => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });
  
  const selectedDateViewings = selectedDate 
    ? filteredViewings.filter(v => {
        const viewingDate = new Date(v.scheduledTime).toISOString().split('T')[0];
        return viewingDate === selectedDate;
      })
    : filteredViewings;
  
  const upcomingViewings = filteredViewings
    .filter(v => new Date(v.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);
  
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  
  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    setSelectedDate(dateKey);
  };
  
  return (
    <div className="space-y-6">
      {/* Animated Gradient Header */}
      <div className="gradient-header rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-white/80 mt-1">
            Manage property viewings and schedule appointments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'calendar' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'glow-gold' : ''}
          >
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            Calendar
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'glow-gold' : ''}
          >
            <Settings className="w-4 h-4 mr-1.5" />
            List
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowNewViewing(true)} className="glow-gold">
            <Plus className="w-4 h-4 mr-1.5" />
            New Viewing
          </Button>
        </div>
      </div>
      
      {/* Stats - Glassmorphism Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card hover-3d-card p-4 rounded-xl">
          <p className="text-xs text-white/60 font-medium">Total Viewings</p>
          <p className="text-2xl font-semibold text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass-card hover-3d-card p-4 rounded-xl">
          <p className="text-xs text-white/60 font-medium">Upcoming</p>
          <p className="text-2xl font-semibold text-white mt-1">{stats.upcoming}</p>
        </div>
        <div className="glass-card hover-3d-card p-4 rounded-xl">
          <p className="text-xs text-white/60 font-medium">Confirmed</p>
          <p className="text-2xl font-semibold text-green-400 mt-1">{stats.confirmed}</p>
        </div>
        <div className="glass-card hover-3d-card p-4 rounded-xl">
          <p className="text-xs text-white/60 font-medium">Pending</p>
          <p className="text-2xl font-semibold text-amber-400 mt-1">{stats.pending}</p>
        </div>
      </div>
      
      {/* Status Filters - Glassmorphism */}
      <div className="glass p-4 rounded-xl animate-on-scroll">
        <div className="flex flex-wrap items-center gap-2">
          <StatusFilter 
            status="all" 
            label="All" 
            count={stats.total} 
            active={statusFilter === 'all'} 
            onClick={() => setStatusFilter('all')}
          />
          <StatusFilter 
            status="pending" 
            label="Pending" 
            count={stats.byStatus.pending} 
            active={statusFilter === 'pending'} 
            onClick={() => setStatusFilter('pending')}
          />
          <StatusFilter 
            status="confirmed" 
            label="Confirmed" 
            count={stats.byStatus.confirmed} 
            active={statusFilter === 'confirmed'} 
            onClick={() => setStatusFilter('confirmed')}
          />
          <StatusFilter 
            status="completed" 
            label="Completed" 
            count={stats.byStatus.completed} 
            active={statusFilter === 'completed'} 
            onClick={() => setStatusFilter('completed')}
          />
          <StatusFilter 
            status="cancelled" 
            label="Cancelled" 
            count={stats.byStatus.cancelled} 
            active={statusFilter === 'cancelled'} 
            onClick={() => setStatusFilter('cancelled')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid - Glassmorphism */}
        <div className="lg:col-span-2 glass-card hover-3d-card rounded-xl overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h3 className="font-semibold text-white text-lg">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white/70" />
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-white/60">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-3 min-h-[90px] bg-white/5" />
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(year, month, day);
              const dayViewings = viewings.filter(v => {
                const viewingDate = new Date(v.scheduledTime).toISOString().split('T')[0];
                return viewingDate === dateKey;
              });
              const hasViewings = dayViewings.length > 0;
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === new Date().toISOString().split('T')[0];
              
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "p-3 min-h-[90px] text-left border-b border-r border-white/5 hover:bg-white/10 transition-all hover-3d",
                    isSelected && "bg-amber-500/20 border-amber-500/30",
                    isToday && !isSelected && "bg-amber-500/10"
                  )}
                >
                  <div className={cn(
                    "text-base font-medium",
                    isSelected ? "text-amber-400" : "text-white"
                  )}>
                    {day}
                  </div>
                  {hasViewings && (
                    <div className="mt-2 space-y-1">
                      {dayViewings.slice(0, 2).map(v => (
                        <div 
                          key={v.id}
                          className={cn(
                            "text-xs px-2 py-1 rounded-full truncate",
                            getViewingStatusStyles(v.status)
                          )}
                        >
                          {new Date(v.scheduledTime).toLocaleTimeString('en-ZA', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      ))}
                      {dayViewings.length > 2 && (
                        <div className="text-xs text-white/50">
                          +{dayViewings.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Sidebar - Selected Date Viewings */}
        <div className="space-y-4">
          {/* Upcoming Viewings */}
          <div className="glass-card hover-3d-card p-5 rounded-xl animate-on-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-lg">Upcoming</h3>
              <Badge variant="outline" className="glass text-white/80 text-xs">
                {upcomingViewings.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {upcomingViewings.length > 0 ? (
                upcomingViewings.map(viewing => (
                  <ViewingCard key={viewing.id} viewing={viewing} />
                ))
              ) : (
                <p className="text-center text-white/50 py-4 text-sm">
                  No upcoming viewings
                </p>
              )}
            </div>
          </div>
          
          {/* Calendar Sync */}
          <div className="glass-card hover-3d-card p-5 rounded-xl animate-on-scroll" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-semibold text-white text-lg mb-4">Calendar Sync</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
                    <CalendarIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Google Calendar</p>
                    <p className="text-xs text-white/60">Connected</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  Synced
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Last synced: {sampleCalendarSyncConfig.lastSyncedAt ? new Date(sampleCalendarSyncConfig.lastSyncedAt).toLocaleString('en-ZA') : 'Never'}</span>
                <button className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Sync now
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="glass-card hover-3d-card p-5 rounded-xl animate-on-scroll" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-semibold text-white text-lg mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all hover-3d text-left">
                <Settings className="w-4 h-4 text-amber-400" />
                Availability Settings
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all hover-3d text-left">
                <Bell className="w-4 h-4 text-amber-400" />
                Reminder Templates
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-all hover-3d text-left">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Block Time Slots
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selected Date Details - Glassmorphism */}
      {selectedDate && (
        <div className="glass-card hover-3d-card p-5 rounded-xl animate-on-scroll">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-lg">
              Viewings for {new Date(selectedDate).toLocaleDateString('en-ZA', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <button 
              onClick={() => setSelectedDate(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          
          {selectedDateViewings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDateViewings.map(viewing => (
                <ViewingCard key={viewing.id} viewing={viewing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 mb-4">No viewings scheduled for this day</p>
              <Button variant="outline" size="sm" onClick={() => setShowNewViewing(true)} className="glass hover:bg-white/20">
                <Plus className="w-4 h-4 mr-1.5" />
                Schedule Viewing
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* New Viewing Modal - Glassmorphism */}
      {showNewViewing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 animate-on-scroll">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">Schedule New Viewing</h2>
              <button 
                onClick={() => setShowNewViewing(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Property
                </label>
                <select className="w-full px-4 py-3 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option className="bg-gray-900">Select a property...</option>
                  <option className="bg-gray-900">45 Beach Road, Umhlanga</option>
                  <option className="bg-gray-900">12 Lagoon Drive, Ballito</option>
                  <option className="bg-gray-900">8 Marine Parade, Durban</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Name
                </label>
                <input 
                  type="text" 
                  placeholder="Enter client name"
                  className="w-full px-4 py-3 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Time
                  </label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Email
                </label>
                <input 
                  type="email" 
                  placeholder="client@email.com"
                  className="w-full px-4 py-3 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Client Phone
                </label>
                <input 
                  type="tel" 
                  placeholder="+27831234567"
                  className="w-full px-4 py-3 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Notes (optional)
                </label>
                <textarea 
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full px-4 py-3 glass rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowNewViewing(false)} className="glass hover:bg-white/20 text-white">
                Cancel
              </Button>
              <Button variant="primary" className="glow-gold">
                <Plus className="w-4 h-4 mr-1.5" />
                Schedule Viewing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}