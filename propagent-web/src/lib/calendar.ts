// PropAgent - Calendar Types and Functions
// Property viewing scheduling and agent calendar management

import { supabase } from './supabase';

export type ViewingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type SlotStatus = 'available' | 'booked' | 'blocked';
export type CalendarSyncProvider = 'google' | 'outlook' | 'none';

export interface ViewingSlot {
  id: string;
  agentId: string;
  propertyId: string;
  
  // Time slot
  startTime: string;
  endTime: string;
  date: string;
  
  // Status
  status: SlotStatus;
  
  // Notes
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PropertyViewing {
  id: string;
  slotId: string;
  propertyId: string;
  agentId: string;
  clientId: string;
  
  // Client info
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Property info
  propertyAddress: string;
  propertyTitle?: string;
  
  // Time
  scheduledTime: string;
  duration: number; // minutes
  
  // Status
  status: ViewingStatus;
  
  // Reminders
  reminderSent: boolean;
  reminderSentAt?: string;
  
  // Notes
  notes?: string;
  
  // External sync
  externalEventId?: string;
  googleEventId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AgentAvailability {
  id: string;
  agentId: string;
  
  // Day of week (0-6, Sunday-Saturday)
  dayOfWeek: number;
  
  // Time range
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  
  // Slot duration
  slotDuration: number; // minutes (15, 30, 60)
  
  // Buffer between slots
  bufferMinutes: number;
  
  // Specific dates to block (holidays, etc.)
  blockedDates?: string[];
  
  // Areas served
  areas: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CalendarSyncConfig {
  id: string;
  agentId: string;
  
  provider: CalendarSyncProvider;
  
  // Google Calendar
  googleCalendarId?: string;
  googleRefreshToken?: string;
  googleSyncEnabled: boolean;
  
  // Outlook Calendar
  outlookCalendarId?: string;
  outlookRefreshToken?: string;
  outlookSyncEnabled: boolean;
  
  // Sync settings
  syncDirection: 'import' | 'export' | 'bidirectional';
  autoSync: boolean;
  syncInterval: number; // minutes
  
  lastSyncedAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Viewing status helpers
export function getViewingStatusStyles(status: ViewingStatus): string {
  const styles: Record<ViewingStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    no_show: 'bg-red-50 text-red-700 border-red-200',
  };
  return styles[status];
}

export function getViewingStatusLabel(status: ViewingStatus): string {
  const labels: Record<ViewingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show',
  };
  return labels[status];
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Format datetime for display
export function formatViewingDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-ZA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Generate time slots for a day
export function generateTimeSlots(
  date: string,
  startTime: string,
  endTime: string,
  duration: number,
  bufferMinutes: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    currentMinutes += duration + bufferMinutes;
  }
  
  return slots;
}

// Check if a slot is available
export function isSlotAvailable(
  slot: ViewingSlot,
  existingViewings: PropertyViewing[]
): boolean {
  if (slot.status !== 'available') return false;
  
  const conflictingViewing = existingViewings.find(v => 
    v.slotId === slot.id && 
    v.status !== 'cancelled' &&
    v.status !== 'completed'
  );
  
  return !conflictingViewing;
}

// Supabase functions
export async function getViewingSlots(agentId: string, date: string) {
  const { data, error } = await supabase
    .from('viewing_slots')
    .select('*')
    .eq('agent_id', agentId)
    .eq('date', date)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getPropertyViewings(agentId: string, startDate?: string, endDate?: string) {
  let query = supabase
    .from('property_viewings')
    .select('*')
    .eq('agent_id', agentId);
  
  if (startDate) {
    query = query.gte('scheduled_time', startDate);
  }
  if (endDate) {
    query = query.lte('scheduled_time', endDate);
  }
  
  const { data, error } = await query.order('scheduled_time', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createViewingSlot(slot: Partial<ViewingSlot>) {
  const { data, error } = await supabase
    .from('viewing_slots')
    .insert(slot)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateViewingSlot(id: string, updates: Partial<ViewingSlot>) {
  const { data, error } = await supabase
    .from('viewing_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function createPropertyViewing(viewing: Partial<PropertyViewing>) {
  const { data, error } = await supabase
    .from('property_viewings')
    .insert(viewing)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePropertyViewing(id: string, updates: Partial<PropertyViewing>) {
  const { data, error } = await supabase
    .from('property_viewings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAgentAvailability(agentId: string) {
  const { data, error } = await supabase
    .from('agent_availability')
    .select('*')
    .eq('agent_id', agentId);
  
  if (error) throw error;
  return data;
}

export async function updateAgentAvailability(agentId: string, availability: Partial<AgentAvailability>) {
  const { data, error } = await supabase
    .from('agent_availability')
    .upsert({ ...availability, agent_id: agentId })
    .select();
  
  if (error) throw error;
  return data;
}

export async function getCalendarSyncConfig(agentId: string) {
  const { data, error } = await supabase
    .from('calendar_sync_config')
    .select('*')
    .eq('agent_id', agentId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateCalendarSyncConfig(agentId: string, config: Partial<CalendarSyncConfig>) {
  const { data, error } = await supabase
    .from('calendar_sync_config')
    .upsert({ ...config, agent_id: agentId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sample data for demo
export const sampleViewingSlots: ViewingSlot[] = [
  {
    id: 'slot1',
    agentId: 'agent1',
    propertyId: 'prop1',
    date: '2026-04-07',
    startTime: '09:00',
    endTime: '17:00',
    status: 'available',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'slot2',
    agentId: 'agent1',
    propertyId: 'prop1',
    date: '2026-04-08',
    startTime: '10:00',
    endTime: '16:00',
    status: 'available',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
  {
    id: 'slot3',
    agentId: 'agent1',
    propertyId: 'prop2',
    date: '2026-04-09',
    startTime: '09:00',
    endTime: '17:00',
    status: 'booked',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01',
  },
];

export const samplePropertyViewings: PropertyViewing[] = [
  {
    id: 'viewing1',
    slotId: 'slot3',
    propertyId: 'prop2',
    agentId: 'agent1',
    clientId: 'client1',
    clientName: 'Jane Doe',
    clientEmail: 'jane.doe@email.com',
    clientPhone: '+27831234567',
    propertyAddress: '45 Beach Road, Umhlanga',
    propertyTitle: 'Luxury Beach Apartment',
    scheduledTime: '2026-04-09T10:00:00',
    duration: 30,
    status: 'confirmed',
    reminderSent: false,
    createdAt: '2026-04-02',
    updatedAt: '2026-04-02',
  },
  {
    id: 'viewing2',
    slotId: 'slot1',
    propertyId: 'prop1',
    agentId: 'agent1',
    clientId: 'client2',
    clientName: 'Tom Smith',
    clientEmail: 'tom.smith@email.com',
    clientPhone: '+27839876543',
    propertyAddress: '12 Lagoon Drive, Ballito',
    propertyTitle: 'Modern Family Home',
    scheduledTime: '2026-04-07T11:00:00',
    duration: 30,
    status: 'pending',
    reminderSent: false,
    createdAt: '2026-04-03',
    updatedAt: '2026-04-03',
  },
  {
    id: 'viewing3',
    slotId: 'slot2',
    propertyId: 'prop3',
    agentId: 'agent1',
    clientId: 'client3',
    clientName: 'Sarah Wilson',
    clientEmail: 'sarah.w@email.com',
    clientPhone: '+27835551234',
    propertyAddress: '8 Marine Parade, Durban',
    propertyTitle: 'Waterfront Penthouse',
    scheduledTime: '2026-04-08T14:00:00',
    duration: 45,
    status: 'confirmed',
    reminderSent: true,
    reminderSentAt: '2026-04-05T09:00:00',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-05',
  },
];

export const sampleAgentAvailability: AgentAvailability[] = [
  {
    id: 'avail1',
    agentId: 'agent1',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferMinutes: 15,
    areas: ['Umhlanga', 'Durban North'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'avail2',
    agentId: 'agent1',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferMinutes: 15,
    areas: ['Umhlanga', 'Durban North'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'avail3',
    agentId: 'agent1',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferMinutes: 15,
    areas: ['Umhlanga', 'Durban North'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'avail4',
    agentId: 'agent1',
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferMinutes: 15,
    areas: ['Umhlanga', 'Durban North'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'avail5',
    agentId: 'agent1',
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    bufferMinutes: 15,
    areas: ['Umhlanga', 'Durban North'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const sampleCalendarSyncConfig: CalendarSyncConfig = {
  id: 'sync1',
  agentId: 'agent1',
  provider: 'google',
  googleCalendarId: 'primary',
  googleSyncEnabled: true,
  syncDirection: 'bidirectional',
  autoSync: true,
  syncInterval: 15,
  lastSyncedAt: '2026-04-06T08:00:00',
  createdAt: '2024-01-01',
  updatedAt: '2026-04-06',
};

// Viewing stats
export function getViewingStats(viewings: PropertyViewing[]) {
  const byStatus: Record<ViewingStatus, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    no_show: 0,
  };
  
  const upcoming = viewings.filter(v => 
    new Date(v.scheduledTime) > new Date() && 
    (v.status === 'pending' || v.status === 'confirmed')
  );
  
  viewings.forEach(viewing => {
    byStatus[viewing.status]++;
  });
  
  return {
    total: viewings.length,
    byStatus,
    upcoming: upcoming.length,
    confirmed: byStatus.confirmed,
    pending: byStatus.pending,
  };
}