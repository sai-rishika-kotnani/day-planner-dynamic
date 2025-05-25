
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  endTime?: string;
  color: string;
  category?: string;
  recurrence?: RecurrencePattern;
  originalDate?: Date; // For recurring events
  isRecurring?: boolean;
}

export interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number; // For custom patterns (e.g., every 2 weeks)
  daysOfWeek?: number[]; // For weekly patterns (0-6, Sunday-Saturday)
  endDate?: Date;
  occurrences?: number;
}

export interface CalendarState {
  events: CalendarEvent[];
  currentDate: Date;
  selectedDate: Date | null;
  view: 'month' | 'week' | 'day';
  isEventFormOpen: boolean;
  editingEvent: CalendarEvent | null;
  searchQuery: string;
  selectedCategory: string | null;
}
