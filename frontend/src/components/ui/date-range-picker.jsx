import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import moment from 'moment';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { toast } from 'sonner';
import { subDays } from 'date-fns';

const CustomDatePicker = ({
  className = '',
  date,
  setDate,
  isRange = false,
  dateFormat = 'MMM DD, YYYY',
  placeholder = isRange ? 'Select a date range' : 'Select a date',
  calendarProps = {},
  buttonProps = {},
  disabled = false,
}) => {
  // Internal state to manage the temporary date selection
  const [tempDate, setTempDate] = useState(date);
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const isSelectionMade = isRange ? tempDate?.from && tempDate?.to : !!tempDate;

  const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format(dateFormat);
  };

  const handleApply = () => {
    if (!isSelectionMade) {
      toast.error('Please select a date before applying.');
      return;
    }

    if (
      isRange &&
      tempDate?.from &&
      tempDate?.to &&
      tempDate.to < tempDate.from
    ) {
      toast.error('End date cannot be before start date.');
      return;
    }

    setDate(tempDate);
    setPopoverOpen(false);
  };

  // const handleClear = () => {
  //   setTempDate(isRange ? { from: null, to: null } : null);
  // };
  const handleClear = () => {
    const defaultDateRange = {
      from: subDays(new Date(), 1), // Yesterday
      to: new Date(), // Today
    };
    
    setTempDate(defaultDateRange);
    setDate(defaultDateRange); // Reset to default values
  };
  
  return (
    <div className={cn('relative flex items-center gap-4', className)}>
      <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full max-w-[342px] justify-start text-left font-normal relative group',
              !isSelectionMade && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
            {...buttonProps}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-primary-200 group-hover:text-white" />
            {isSelectionMade ? (
              isRange ? (
                <>
                  {formatDate(tempDate?.from)} - {formatDate(tempDate?.to)}
                </>
              ) : (
                formatDate(tempDate)
              )
            ) : (
              <span className="text-blue-primary-200 group-hover:text-white">
                {placeholder}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex flex-col space-y-4">
            <Calendar
              initialFocus
              mode={isRange ? 'range' : 'single'}
              selected={tempDate}
              onSelect={setTempDate}
              numberOfMonths={isRange ? 2 : 1}
              className={
                isRange &&
                tempDate?.from &&
                tempDate?.to &&
                tempDate.to < tempDate.from
                  ? 'invalid-range'
                  : ''
              }
              {...calendarProps}
            />
            <div className="flex justify-end gap-4 items-center">
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button onClick={handleApply}>Apply</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CustomDatePicker;
