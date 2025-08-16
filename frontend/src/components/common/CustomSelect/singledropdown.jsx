'use client';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { XIcon, ChevronDown } from 'lucide-react';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

function groupOptions(options, groupBy) {
    return options.reduce((acc, option) => {
        const key = groupBy ? option[groupBy] || '' : '';
        acc[key] = acc[key] || [];
        acc[key].push(option);
        return acc;
    }, {});
}

const SingleSelector = ({
    value = null,
    onChange,
    placeholder,
    defaultOptions = [],
    options,
    delay,
    onSearch,
    loadingIndicator,
    emptyIndicator,
    disabled,
    groupBy,
    className,
    badgeClassName,
}) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(value);
    const [inputValue, setInputValue] = useState('');
    const [groupedOptions, setGroupedOptions] = useState(groupOptions(defaultOptions, groupBy));
    const [isLoading, setIsLoading] = useState(false);
    const debouncedSearchTerm = useDebounce(inputValue, delay);

    useEffect(() => {
        setSelected(value);
    }, [value]);

    useEffect(() => {
        if (!options || onSearch) return;
        setGroupedOptions(groupOptions(options, groupBy));
    }, [options, groupBy, onSearch]);

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            const results = await onSearch?.(debouncedSearchTerm);
            setGroupedOptions(groupOptions(results || [], groupBy));
            setIsLoading(false);
        };

        if (onSearch && open) fetchOptions();
    }, [debouncedSearchTerm, onSearch, open, groupBy]);

    const filteredOptions = useMemo(() => {
        if (onSearch) return groupedOptions;
        const lowerInput = inputValue.toLowerCase();
        return Object.fromEntries(
            Object.entries(groupedOptions).map(([group, opts]) => [
                group,
                opts.filter((opt) => opt.label.toLowerCase().includes(lowerInput)),
            ])
        );
    }, [groupedOptions, inputValue, onSearch]);

    const handleSelect = (option) => {
        setSelected(option);
        onChange?.(option);
        setOpen(false);
    };

    const handleClear = () => {
        setSelected(null);
        onChange?.(null);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className={cn('relative', className)}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            'border-input focus-within:border-ring focus-within:ring-ring/50 min-h-[38px] rounded-md border text-sm transition-[color,box-shadow] outline-none focus-within:ring-[3px] w-full flex items-center justify-between p-1',
                        )}
                        disabled={disabled}
                    >
                        <div className="flex flex-wrap gap-1 items-center">
                        {selected && selected.label ? (
  <div
    className={cn(
      'bg-white text-secondary-foreground inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium',
      badgeClassName
    )}
  >
    {selected.label}
    <button
      className="ml-1 text-muted-foreground/80 hover:text-foreground"
      onClick={(e) => {
        e.stopPropagation();
        handleClear();
      }}
      aria-label={`Remove ${selected.label}`}
    >
      <XIcon size={14} aria-hidden />
    </button>
  </div>
) : (
  <span className="text-muted-foreground">{placeholder}</span>
)}

                        </div>
                        <ChevronDown size={16} className="text-muted-foreground/80 ml-2" aria-hidden />
                    </button>
                </PopoverTrigger>
            </div>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search..."
                    className="border-b p-2 w-full outline-none"
                    autoFocus
                />
                <div className="max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-2">{loadingIndicator || 'Loading...'}</div>
                    ) : (
                        <>
                            {Object.entries(filteredOptions).map(([group, opts]) => (
                                <div key={group}>
                                    {group && <h3 className="p-2 font-bold text-sm">{group}</h3>}
                                    {opts.map((opt) => (
                                        <div
                                            key={opt.value}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSelect(opt)}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            {Object.values(filteredOptions).flat().length === 0 && (
                                <div className="p-2">{emptyIndicator || 'No options available'}</div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

SingleSelector.displayName = 'SingleSelector';
export default SingleSelector;
