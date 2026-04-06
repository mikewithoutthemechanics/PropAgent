import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PropertyStatus } from "@/types/property";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency in South African Rand
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

// Get status badge styles
export function getStatusBadgeStyles(status: PropertyStatus): string {
  const styles: Record<PropertyStatus, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    sold: 'bg-blue-100 text-blue-700 border-blue-200',
    rented: 'bg-purple-100 text-purple-700 border-purple-200',
    under_offer: 'bg-orange-100 text-orange-700 border-orange-200',
    withdrawn: 'bg-gray-100 text-gray-700 border-gray-200',
    draft: 'bg-stone-100 text-stone-700 border-stone-200',
  };
  return styles[status] || 'bg-stone-100 text-stone-700';
}

// Get status color (for non-badge uses)
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    sold: 'bg-blue-100 text-blue-700',
    rented: 'bg-purple-100 text-purple-700',
    draft: 'bg-stone-100 text-stone-700',
  };
  return colors[status] || 'bg-stone-100 text-stone-700';
}

// Get inquiry status styles
export function getInquiryStatusStyles(status: string): string {
  const styles: Record<string, string> = {
    new: 'bg-red-100 text-red-700 border-red-200',
    contacted: 'bg-blue-100 text-blue-700 border-blue-200',
    viewing_scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
    converted: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[status] || 'bg-stone-100 text-stone-700';
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-ZA').format(num);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate South African phone number
export function isValidSAPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '').replace(/^0/, '+27');
  const regex = /^(\+27|0)[6-8][0-9]{8}$/;
  return regex.test(cleaned);
}

// Format South African phone number
export function formatSAPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/^0/, '+27');
  if (cleaned.startsWith('+27')) {
    return cleaned.replace(/(\+27)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Capitalize first letter
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format property type for display
export function formatPropertyType(type: string): string {
  const types: Record<string, string> = {
    house: 'House',
    apartment: 'Apartment',
    flat: 'Flat',
    townhouse: 'Townhouse',
    duplex: 'Duplex',
    penthouse: 'Penthouse',
    commercial: 'Commercial',
    industrial: 'Industrial',
    land: 'Land',
    vacant_land: 'Vacant Land',
  };
  return types[type] || capitalizeFirst(type);
}

// Format province name
export function formatProvince(province: string): string {
  const provinces: Record<string, string> = {
    gauteng: 'Gauteng',
    western_cape: 'Western Cape',
    kwazulu_natal: 'KwaZulu-Natal',
    eastern_cape: 'Eastern Cape',
    free_state: 'Free State',
    mpumalanga: 'Mpumalanga',
    limpopo: 'Limpopo',
    north_west: 'North West',
    northern_cape: 'Northern Cape',
  };
  return provinces[province] || capitalizeFirst(province.replace(/_/g, ' '));
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Sort array by key
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

// Check if file is an image
export function isImageFile(filename: string): boolean {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return extensions.includes(getFileExtension(filename));
}

// Format duration in seconds to readable string
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Local storage helpers with error handling
export function setLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}
