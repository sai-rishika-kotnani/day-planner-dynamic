
import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay 
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onDateDoubleClick: (date: Date) => void;
  onEventDrop: (eventId: string, newDate: Date) => void;
}

export const CalendarGrid = ({
  currentDate,
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  onDateDoubleClick,
  onEventDrop,
}: CalendarGridProps) => {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      onEventDrop(draggedEvent.id, date);
      setDraggedEvent(null);
      setDragOverDate(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-700 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDragOver = dragOverDate && isSameDay(dragOverDate, day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] p-2 border-r border-b last:border-r-0 transition-colors",
                "relative group cursor-pointer hover:bg-gray-50",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                isToday(day) && "bg-blue-50",
                selectedDate && isSameDay(selectedDate, day) && "bg-blue-100",
                isDragOver && "bg-green-100 border-green-300"
              )}
              onClick={() => onDateSelect(day)}
              onDoubleClick={() => onDateDoubleClick(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isToday(day) && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                {/* Add event button (visible on hover) */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateDoubleClick(day);
                  }}
                >
                  +
                </Button>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    className={cn(
                      "text-xs p-1 rounded cursor-pointer text-white font-medium",
                      "hover:opacity-80 transition-opacity truncate"
                    )}
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    title={`${event.title} at ${event.time}`}
                  >
                    <div className="flex items-center gap-1">
                      {event.isRecurring && (
                        <span className="text-xs">⟲</span>
                      )}
                      <span className="truncate">{event.time} {event.title}</span>
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dayEvents.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
