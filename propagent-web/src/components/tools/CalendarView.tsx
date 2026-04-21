'use client';

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, Home, User, Phone, X, Sparkles,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { aiChat } from '@/lib/ai-client';

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
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);
  const [showNew, setShowNew] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    type: 'showing',
    property: '',
    date: '',
    time: '',
    duration: 1,
    client: '',
    clientPhone: '',
    status: 'scheduled',
    hasReminder: false,
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const parseWithAI = async () => {
    if (!newPrompt.trim()) return;
    setParsing(true);
    setParseError(null);
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `You are a strict JSON generator. Extract a calendar event from the user's text and return ONLY a JSON object (no prose, no markdown). Assume today is ${today}. Use 24-hour HH:MM times. Property type defaults to "showing" if unclear. Use these keys exactly:
{"title": string, "type": "showing"|"inspection"|"viewing"|"meeting"|"maintenance", "property": string, "date": "YYYY-MM-DD", "time": "HH:MM", "duration": number, "client": string, "clientPhone": string}

User text: ${newPrompt}`;
    const reply = await aiChat([{ role: 'user', content: prompt }]);
    setParsing(false);
    if (!reply) {
      setParseError('AI service unavailable. Check that GROQ_API_KEY is configured.');
      return;
    }
    const match = reply.match(/\{[\s\S]*\}/);
    if (!match) {
      setParseError('AI did not return parseable JSON. Try rephrasing.');
      return;
    }
    try {
      const parsed = JSON.parse(match[0]) as Partial<CalendarEvent>;
      setNewEvent((e) => ({
        ...e,
        title: parsed.title || e.title,
        type: (parsed.type as CalendarEvent['type']) || e.type,
        property: parsed.property || e.property,
        date: parsed.date || e.date,
        time: parsed.time || e.time,
        duration: typeof parsed.duration === 'number' ? parsed.duration : e.duration,
        client: parsed.client || e.client,
        clientPhone: parsed.clientPhone || e.clientPhone,
      }));
    } catch {
      setParseError('Could not parse AI response. Try rephrasing.');
    }
  };

  const saveNewEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time) {
      setParseError('Title, date and time are required.');
      return;
    }
    setEvents((e) => [{ ...newEvent, id: String(Date.now()) } as CalendarEvent, ...e]);
    setShowNew(false);
    setNewPrompt('');
    setParseError(null);
    setNewEvent({
      title: '',
      type: 'showing',
      property: '',
      date: '',
      time: '',
      duration: 1,
      client: '',
      clientPhone: '',
      status: 'scheduled',
      hasReminder: false,
    });
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
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
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
        <h3 className="text-sm font-medium text-stone-700 mb-3">Today&apos;s Schedule</h3>
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
              <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900">New Event</h3>
              <button
                onClick={() => setShowNew(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Describe it in plain English</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="e.g., Viewing at 14 Oak Lane on 20 April at 10am with John Smith"
                  className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                />
                <Button
                  onClick={parseWithAI}
                  disabled={parsing || !newPrompt.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {parsing ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" /> Parse
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((v) => ({ ...v, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) =>
                      setNewEvent((v) => ({ ...v, type: e.target.value as CalendarEvent['type'] }))
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  >
                    <option value="showing">Showing</option>
                    <option value="inspection">Inspection</option>
                    <option value="viewing">Viewing</option>
                    <option value="meeting">Meeting</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={newEvent.duration}
                    onChange={(e) =>
                      setNewEvent((v) => ({ ...v, duration: Number(e.target.value) || 1 }))
                    }
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Property</label>
                <input
                  type="text"
                  value={newEvent.property}
                  onChange={(e) => setNewEvent((v) => ({ ...v, property: e.target.value }))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((v) => ({ ...v, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent((v) => ({ ...v, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Client (optional)</label>
                  <input
                    type="text"
                    value={newEvent.client ?? ''}
                    onChange={(e) => setNewEvent((v) => ({ ...v, client: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Client phone (optional)</label>
                  <input
                    type="text"
                    value={newEvent.clientPhone ?? ''}
                    onChange={(e) => setNewEvent((v) => ({ ...v, clientPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              {parseError && <p className="text-sm text-red-600">{parseError}</p>}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={saveNewEvent}>
                  <Plus className="w-4 h-4 mr-1" /> Add event
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CalendarView;