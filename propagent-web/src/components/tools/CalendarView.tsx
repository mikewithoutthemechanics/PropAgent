'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, Home, User, Video, Phone, MapPin, X } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'showing' | 'inspection' | 'viewing' | 'meeting' | 'maintenance';
  property: string;
  date: string;
  time: string;
  duration: number;
  client?: string;
  clientPhone?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  hasReminder: boolean;
}

interface CalendarViewProps {
  onEventClick?: (event: CalendarEvent) => void;
}

const sampleEvents: CalendarEvent[] = [
  { id: '1', title: 'Property Showing', type: 'showing', property: '14 Oak Lane, Sandton', date: '2026-04-08', time: '10:00', duration: 1, client: 'John Smith', clientPhone: '+27 82 123 4567', status: 'scheduled', hasReminder: true },
  { id: '2', title: 'Tenant Inspection', type: 'inspection', property: '8 Maple Ave, Cape Town', date: '2026-04-08', time: '14:00', duration: 1, client: 'Sarah Jones', status: 'scheduled', hasReminder: false },
  { id: '3', title: 'Open Viewing', type: 'viewing', property: '25 Pine Street, Durban', date: '2026-04-12', time: '09:00', duration: 3, status: 'scheduled', hasReminder: true },
  { id: '4', title: 'Maintenance Review', type: 'maintenance', property: '42 Beach Rd, Mossel Bay', date: '2026-04-10', time: '11:00', duration: 1, status: 'scheduled', hasReminder: false },
  { id: '5', title: 'Client Meeting', type: 'meeting', property: 'Office', date: '2026-04-15', time: '15:00', duration: 1, client: 'Mike Brown', status: 'scheduled', hasReminder: true },
];

const typeColors = {
  showing: 'bg-blue-100 text-blue-700 border-blue-200',
  inspection: 'bg-purple-100 text-purple-700 border-purple-200',
  viewing: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  meeting: 'bg-orange-100 text-orange-700 border-orange-200',
  maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
};

export function CalendarView({ onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 8));
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sampleEvents.filter(e => e.date === dateStr);
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const EventItem = ({ event }: { event: CalendarEvent }) => (
    <div 
      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); onEventClick?.(event); }}
      className={cn(
        "px-2 py-1 rounded text-xs font-medium truncate cursor-pointer",
        typeColors[event.type]
      )}
    >
      {event.time} {event.title}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-stone-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold w-32 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-stone-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-stone-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={cn("px-3 py-1.5 text-sm rounded-md", view === 'month' ? "bg-white shadow-sm" : "")}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={cn("px-3 py-1.5 text-sm rounded-md", view === 'week' ? "bg-white shadow-sm" : "")}
              >
                Week
              </button>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Event
            </button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-4 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-stone-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-stone-50 p-2 text-center text-xs font-medium text-stone-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-stone-200">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-stone-100 min-h-[100px]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const events = getEventsForDay(day);
            const isToday = day === 8 && currentDate.getMonth() === 3;
            return (
              <div 
                key={day} 
                className={cn(
                  "bg-white min-h-[100px] p-1",
                  isToday && "bg-blue-50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday ? "text-blue-600" : "text-stone-900"
                )}>
                  {day}
                </span>
                <div className="space-y-1 mt-1">
                  {events.slice(0, 3).map(event => (
                    <EventItem key={event.id} event={event} />
                  ))}
                  {events.length > 3 && (
                    <span className="text-xs text-stone-500">+{events.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Today's Schedule</h3>
        <div className="space-y-2">
          {getEventsForDay(8).length === 0 ? (
            <p className="text-sm text-stone-500 py-4 text-center">No events scheduled for today</p>
          ) : (
            getEventsForDay(8).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                <div className={cn("w-1 h-12 rounded-full", typeColors[event.type].split(' ')[0].replace('bg-', 'bg-'))} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-stone-900">{event.title}</p>
                  <p className="text-xs text-stone-500 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> {event.time} • {event.property}
                  </p>
                </div>
                {event.client && (
                  <div className="text-right">
                    <p className="text-xs font-medium text-stone-700">{event.client}</p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {event.clientPhone}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 m-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-stone-900">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-stone-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-stone-500" />
                <span className="text-stone-700">{selectedEvent.property}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-stone-500" />
                <span className="text-stone-700">{selectedEvent.time} ({selectedEvent.duration} hour{selectedEvent.duration > 1 ? 's' : ''})</span>
              </div>
              {selectedEvent.client && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-stone-500" />
                  <span className="text-stone-700">{selectedEvent.client}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1">Reschedule</Button>
              <Button className="flex-1 bg-blue-500">Join Call</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CalendarView;