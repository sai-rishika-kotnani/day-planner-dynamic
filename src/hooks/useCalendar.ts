
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CalendarState, RecurrencePattern } from '@/types/calendar';
import { 
  addDays, 
  addWeeks, 
  addMonths, 
  isSameDay, 
  parseISO, 
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isAfter,
  isBefore
} from 'date-fns';

const STORAGE_KEY = 'calendar-events';

export const useCalendar = () => {
  const [state, setState] = useState<CalendarState>({
    events: [],
    currentDate: new Date(),
    selectedDate: null,
    view: 'month',
    isEventFormOpen: false,
    editingEvent: null,
    searchQuery: '',
    selectedCategory: null,
  });

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (savedEvents) {
      try {
        const events = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date),
          originalDate: event.originalDate ? new Date(event.originalDate) : undefined,
          recurrence: event.recurrence ? {
            ...event.recurrence,
            endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
          } : undefined,
        }));
        setState(prev => ({ ...prev, events }));
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
  }, [state.events]);

  const generateRecurringEvents = useCallback((event: CalendarEvent): CalendarEvent[] => {
    if (!event.recurrence || event.recurrence.type === 'none') {
      return [event];
    }

    const events: CalendarEvent[] = [event];
    const { type, interval = 1, daysOfWeek, endDate, occurrences } = event.recurrence;
    let currentDate = new Date(event.date);
    let count = 1;

    const maxOccurrences = occurrences || 365; // Limit to prevent infinite loops
    const maxEndDate = endDate || addMonths(new Date(), 12); // Default to 1 year

    while (count < maxOccurrences && isBefore(currentDate, maxEndDate)) {
      let nextDate: Date;

      switch (type) {
        case 'daily':
          nextDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          if (daysOfWeek && daysOfWeek.length > 0) {
            // Find next occurrence on specified days
            nextDate = addDays(currentDate, 1);
            while (!daysOfWeek.includes(nextDate.getDay())) {
              nextDate = addDays(nextDate, 1);
            }
          } else {
            nextDate = addWeeks(currentDate, interval);
          }
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, interval);
          break;
        case 'custom':
          nextDate = addDays(currentDate, interval);
          break;
        default:
          return events;
      }

      if (isAfter(nextDate, maxEndDate)) break;

      const recurringEvent: CalendarEvent = {
        ...event,
        id: `${event.id}-${format(nextDate, 'yyyy-MM-dd')}`,
        date: nextDate,
        originalDate: event.date,
        isRecurring: true,
      };

      events.push(recurringEvent);
      currentDate = nextDate;
      count++;
    }

    return events;
  }, []);

  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };

    const eventsToAdd = generateRecurringEvents(newEvent);
    
    setState(prev => ({
      ...prev,
      events: [...prev.events, ...eventsToAdd],
      isEventFormOpen: false,
      editingEvent: null,
    }));
  }, [generateRecurringEvents]);

  const updateEvent = useCallback((eventId: string, eventData: Partial<CalendarEvent>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId ? { ...event, ...eventData } : event
      ),
      isEventFormOpen: false,
      editingEvent: null,
    }));
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId),
      isEventFormOpen: false,
      editingEvent: null,
    }));
  }, []);

  const getEventsForDate = useCallback((date: Date) => {
    return state.events.filter(event => isSameDay(event.date, date));
  }, [state.events]);

  const getEventsForMonth = useCallback((date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    return state.events.filter(event => 
      event.date >= start && event.date <= end
    );
  }, [state.events]);

  const checkEventConflict = useCallback((newEvent: CalendarEvent, excludeId?: string) => {
    const conflictingEvents = state.events.filter(event => {
      if (excludeId && event.id === excludeId) return false;
      if (!isSameDay(event.date, newEvent.date)) return false;
      
      // Simple time conflict check
      const eventStart = event.time;
      const eventEnd = event.endTime || event.time;
      const newStart = newEvent.time;
      const newEnd = newEvent.endTime || newEvent.time;
      
      return (eventStart <= newEnd && eventEnd >= newStart);
    });
    
    return conflictingEvents;
  }, [state.events]);

  const moveEvent = useCallback((eventId: string, newDate: Date) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId ? { ...event, date: newDate } : event
      ),
    }));
  }, []);

  const setCurrentDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, currentDate: date }));
  }, []);

  const setSelectedDate = useCallback((date: Date | null) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  const openEventForm = useCallback((event?: CalendarEvent) => {
    setState(prev => ({
      ...prev,
      isEventFormOpen: true,
      editingEvent: event || null,
    }));
  }, []);

  const closeEventForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEventFormOpen: false,
      editingEvent: null,
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedCategory = useCallback((category: string | null) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const filteredEvents = state.events.filter(event => {
    const matchesSearch = !state.searchQuery || 
      event.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    const matchesCategory = !state.selectedCategory || 
      event.category === state.selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return {
    ...state,
    filteredEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    getEventsForDate,
    getEventsForMonth,
    checkEventConflict,
    setCurrentDate,
    setSelectedDate,
    openEventForm,
    closeEventForm,
    setSearchQuery,
    setSelectedCategory,
  };
};
