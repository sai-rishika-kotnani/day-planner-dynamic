
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventForm } from './EventForm';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/types/calendar';

export const Calendar = () => {
  const {
    currentDate,
    selectedDate,
    events,
    filteredEvents,
    isEventFormOpen,
    editingEvent,
    searchQuery,
    selectedCategory,
    setCurrentDate,
    setSelectedDate,
    openEventForm,
    closeEventForm,
    addEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    getEventsForDate,
    checkEventConflict,
    setSearchQuery,
    setSelectedCategory,
  } = useCalendar();

  // Get unique categories from events
  const categories = Array.from(new Set(events.map(event => event.category).filter(Boolean))) as string[];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateDoubleClick = (date: Date) => {
    setSelectedDate(date);
    openEventForm();
  };

  const handleEventClick = (event: CalendarEvent) => {
    openEventForm(event);
  };

  const handleEventDrop = (eventId: string, newDate: Date) => {
    moveEvent(eventId, newDate);
  };

  const handleAddEvent = () => {
    openEventForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onAddEvent={handleAddEvent}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        <CalendarGrid
          currentDate={currentDate}
          events={filteredEvents}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          onDateDoubleClick={handleDateDoubleClick}
          onEventDrop={handleEventDrop}
        />

        <EventForm
          isOpen={isEventFormOpen}
          onClose={closeEventForm}
          onSave={addEvent}
          onUpdate={updateEvent}
          onDelete={deleteEvent}
          editingEvent={editingEvent}
          selectedDate={selectedDate}
          checkConflict={checkEventConflict}
        />
      </div>
    </div>
  );
};
