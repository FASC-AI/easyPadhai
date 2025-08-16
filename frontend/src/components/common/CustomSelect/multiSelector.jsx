"use client";
import * as React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
import { XIcon, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    const key = groupBy ? option[groupBy] || "" : "";
    acc[key] = acc[key] || [];
    acc[key].push(option);
    return acc;
  }, {});
}

const MultipleSelector = ({
  value = [],
  onChange,
  placeholder,
  defaultOptions = [],
  options,
  delay,
  onSearch,
  loadingIndicator,
  emptyIndicator,
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  hideClearAllButton = false,
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [inputValue, setInputValue] = useState("");
  const [groupedOptions, setGroupedOptions] = useState(
    groupOptions(defaultOptions, groupBy)
  );
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, delay);
  const containerRef = useRef(null);
  const [showPlusBadge, setShowPlusBadge] = useState(false);

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

  useEffect(() => {
    if (!containerRef.current || selected.length <= 1) {
      setShowPlusBadge(false);
      return;
    }

    const containerWidth = containerRef.current.offsetWidth;
    const badgeWidthEstimate = 60; // Approximate width per badge (px)
    const totalBadgeWidth = selected.length * badgeWidthEstimate;

    setShowPlusBadge(totalBadgeWidth > containerWidth - 40); // Subtract padding and ChevronDown
  }, [selected]);

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

  useEffect(() => {
    const flatOptions = Object.values(filteredOptions).flat();
    if (flatOptions.length < 6) {
      //
    }
  }, [filteredOptions]);

  const toggleSelection = (option) => {
    const exists = selected.some((s) => s.value === option.value);
    const updated = exists
      ? selected.filter((s) => s.value !== option.value)
      : selected.length < maxSelected
      ? [...selected, option]
      : (onMaxSelected?.(selected.length), selected);

    setSelected(updated);
    onChange?.(updated);
  };

  const selectAll = () => {
    const all = Object.values(filteredOptions).flat();
    const toAdd = all.filter(
      (opt) => !selected.find((s) => s.value === opt.value)
    );
    const spaceLeft = maxSelected - selected.length;
    const newSelected = [...selected, ...toAdd.slice(0, spaceLeft)];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  const clearAll = () => {
    const fixedOnly = selected.filter((s) => s.fixed);
    setSelected(fixedOnly);
    onChange?.(fixedOnly);
  };

  const handleUnselect = (option) => {
    const updated = selected.filter((s) => s.value !== option.value);
    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #1a6fab transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a6fab;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div className={cn("relative", className)} ref={containerRef}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "border-input focus-within:border-ring focus-within:ring-ring/50 min-h-[38px] rounded-md border text-[12px] transition-[color,box-shadow] outline-none focus-within:ring-[3px] w-full flex items-center justify-between p-1",
              { "p-1": selected.length }
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selected
                .slice(0, showPlusBadge ? 1 : selected.length)
                .map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "bg-white text-secondary-foreground relative inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium",
                      badgeClassName
                    )}
                  >
                    {option.label}
                    <button
                      className="ml-1 text-muted-foreground/80 hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(option);
                      }}
                      aria-label={`Remove ${option.label}`}
                    >
                      <XIcon size={14} aria-hidden />
                    </button>
                  </div>
                ))}
              {selected.length > 1 && showPlusBadge && (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="bg-white text-secondary-foreground inline-flex h-7 items-center rounded-md border px-2 text-xs font-medium cursor-pointer">
                      +{selected.length - 1}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      {selected.map((option) => (
                        <div key={option.value} className="p-1 text-sm">
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {selected.length === 0 && (
                <span className="text-muted-foreground text-[12px] px-2">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              className="text-muted-foreground/80 ml-2"
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        {!hideClearAllButton && selected.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className={cn(
              "text-muted-foreground/80 hover:text-foreground absolute right-9 top-1/2 transform -translate-y-1/2 flex items-center justify-center",
              disabled && "hidden"
            )}
            aria-label="Clear all"
          >
            <XIcon size={16} aria-hidden />
          </button>
        )}
      </div>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        style={{ zIndex: 99999 }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search..."
          className="border-b p-2 w-full outline-none text-[12px] px-2"
          autoFocus
        />
        <div className="max-h-[200px] overflow-y-auto text-[12px] text-gray-600 custom-scrollbar">
          {isLoading ? (
            <div className="p-2">{loadingIndicator || "Loading..."}</div>
          ) : (
            <>
              {Object.values(filteredOptions).flat().length > 0 && (
                <div
                  className="p-2 cursor-pointer hover:bg-gray-100 border font-medium"
                  onClick={selectAll}
                >
                  Select All
                </div>
              )}
              {Object.entries(filteredOptions).map(([group, opts]) => (
                <div key={group}>
                  {group && <h3 className="p-2 font-bold text-sm">{group}</h3>}
                  {opts.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleSelection(opt)}
                    >
                      <span>{opt.label}</span>
                      {selected.some((s) => s.value === opt.value) && (
                        <svg
                          className="h-5 w-5 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {Object.values(filteredOptions).flat().length === 0 && (
                <div className="p-2">
                  {emptyIndicator || "No options available"}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
