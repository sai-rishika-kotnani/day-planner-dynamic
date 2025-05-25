
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, RecurrencePattern } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdate: (id: string, event: Partial<CalendarEvent>) => void;
  onDelete: (id: string) => void;
  editingEvent: CalendarEvent | null;
  selectedDate: Date | null;
  checkConflict: (event: CalendarEvent, excludeId?: string) => CalendarEvent[];
}

const eventColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

const categories = ['Work', 'Personal', 'Health', 'Social', 'Family', 'Travel', 'Education'];

const recurrenceTypes = [
  { value: 'none', label: 'No Recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

const weekdays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const EventForm = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  editingEvent,
  selectedDate,
  checkConflict,
}: EventFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate || new Date(),
    time: '09:00',
    endTime: '10:00',
    color: '#3B82F6',
    category: '',
    recurrence: {
      type: 'none' as RecurrencePattern['type'],
      interval: 1,
      daysOfWeek: [] as number[],
      endDate: undefined as Date | undefined,
      occurrences: undefined as number | undefined,
    },
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        date: editingEvent.date,
        time: editingEvent.time,
        endTime: editingEvent.endTime || '10:00',
        color: editingEvent.color,
        category: editingEvent.category || '',
        recurrence: {
          type: editingEvent.recurrence?.type || 'none',
          interval: editingEvent.recurrence?.interval || 1,
          daysOfWeek: editingEvent.recurrence?.daysOfWeek || [],
          endDate: editingEvent.recurrence?.endDate,
          occurrences: editingEvent.recurrence?.occurrences,
        },
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        title: '',
        description: '',
        time: '09:00',
        endTime: '10:00',
        color: '#3B82F6',
        category: '',
        recurrence: {
          type: 'none',
          interval: 1,
          daysOfWeek: [],
          endDate: undefined,
          occurrences: undefined,
        },
      }));
    }
  }, [editingEvent, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      });
      return;
    }

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.time,
      endTime: formData.endTime,
      color: formData.color,
      category: formData.category,
      recurrence: formData.recurrence.type === 'none' ? undefined : formData.recurrence,
    };

    // Check for conflicts
    const conflicts = checkConflict(
      { ...eventData, id: 'temp' } as CalendarEvent,
      editingEvent?.id
    );

    if (conflicts.length > 0) {
      toast({
        title: "Event Conflict",
        description: `This event conflicts with: ${conflicts.map(e => e.title).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (editingEvent) {
      onUpdate(editingEvent.id, eventData);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } else {
      onSave(eventData);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    }
  };

  const handleDelete = () => {
    if (editingEvent) {
      onDelete(editingEvent.id);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    }
  };

  const handleRecurrenceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value,
      },
    }));
  };

  const handleWeekdayToggle = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        daysOfWeek: checked
          ? [...prev.recurrence.daysOfWeek, day]
          : prev.recurrence.daysOfWeek.filter(d => d !== day),
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={format(formData.date, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    date: new Date(e.target.value) 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Event Color</Label>
                <div className="flex gap-2 mt-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Recurrence Settings</h3>
            
            <div>
              <Label htmlFor="recurrenceType">Recurrence Type</Label>
              <Select 
                value={formData.recurrence.type} 
                onValueChange={(value) => handleRecurrenceChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence.type !== 'none' && (
              <>
                {(formData.recurrence.type === 'custom' || formData.recurrence.type === 'daily') && (
                  <div>
                    <Label htmlFor="interval">
                      Repeat every {formData.recurrence.interval} {
                        formData.recurrence.type === 'daily' ? 'day(s)' : 'day(s)'
                      }
                    </Label>
                    <Input
                      id="interval"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.recurrence.interval}
                      onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                    />
                  </div>
                )}

                {formData.recurrence.type === 'weekly' && (
                  <div>
                    <Label>Repeat on days:</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {weekdays.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.recurrence.daysOfWeek.includes(day.value)}
                            onCheckedChange={(checked) => handleWeekdayToggle(day.value, checked as boolean)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-sm">
                            {day.label.slice(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.recurrence.endDate ? format(formData.recurrence.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => handleRecurrenceChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="occurrences">Max Occurrences (optional)</Label>
                    <Input
                      id="occurrences"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.recurrence.occurrences || ''}
                      onChange={(e) => handleRecurrenceChange('occurrences', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Unlimited"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {editingEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
