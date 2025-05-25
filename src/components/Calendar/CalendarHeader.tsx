
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAddEvent: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

export const CalendarHeader = ({
  currentDate,
  onDateChange,
  onAddEvent,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: CalendarHeaderProps) => {
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-blue-600 hover:text-blue-700"
        >
          Today
        </Button>
      </div>

      {/* Right side - Search and Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory || 'all'} onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Event Button */}
        <Button onClick={onAddEvent} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
    </div>
  );
};
