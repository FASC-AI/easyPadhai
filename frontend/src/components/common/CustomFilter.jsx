"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRef } from "react";

export function CustomFilter({
  fetchData,
  selectedValues,
  onSelect,
  label,
  isMulti = false,
  searchable = false,
  className = "",
  defaultValue = null,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const cachedOptions = useRef([]);

  // Initialize local state
  useEffect(() => {
    if (selectedValues) {
      setLocalSelected(
        Array.isArray(selectedValues) ? selectedValues : [selectedValues]
      );
    } else if (defaultValue) {
      setLocalSelected(
        Array.isArray(defaultValue) ? defaultValue : [defaultValue]
      );
    } else {
      setLocalSelected([]);
    }
  }, [selectedValues, defaultValue]);

  // Memoize filtered options
  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    if (!searchable || !searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  // Fetch options when popover opens or search term changes
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        // Fetch fresh data when searchTerm is empty or no cached data exists
        if (cachedOptions.current.length === 0 || !searchTerm) {
          const data = await fetchData(searchTerm);
          cachedOptions.current = Array.isArray(data) ? data : [];
          setOptions(cachedOptions.current);
        } else {
          // Use cached options for non-empty search term, but filter them
          const data = await fetchData(searchTerm);
          setOptions(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      const debounceTimer = setTimeout(() => {
        fetchOptions();
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      // Reset search term when popover closes
      setSearchTerm("");
    }
  }, [open, searchTerm, fetchData]);

  const handleSelect = (value) => {
    if (isMulti) {
      const newSelected = localSelected.includes(value)
        ? localSelected.filter((v) => v !== value)
        : [...localSelected, value];
      setLocalSelected(newSelected);
    } else {
      setLocalSelected([value]);
      onSelect(value);
      setOpen(false);
    }
  };

  const handleApply = () => {
    if (isMulti) {
      onSelect(localSelected.length > 0 ? localSelected : null);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setLocalSelected([]);
    onSelect(null);
    setOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const displayValue = () => {
    if (localSelected.length === 0) return label;
    return `${label} (${localSelected.length})`;
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "whitespace-nowrap rounded-full !bg-gray-quaternary/10 hover:!bg-[#E5F2FF] px-4 py-2 cursor-pointer text-[13px] font-normal z-0 flex items-center gap-2 justify-center",
              localSelected.length > 0 && "bg-accent"
            )}
          >
            <span className="truncate">{displayValue()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <div className="space-y-2 p-2">
            {searchable && (
              <div className="px-2 pt-2 relative">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-8"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 mt-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[100px]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-center space-x-2 rounded p-2 hover:bg-accent cursor-pointer",
                        localSelected.includes(option.value) &&
                          "bg-blue-600"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      {isMulti && (
                        <Checkbox
                          checked={localSelected.includes(option.value)}
                          onCheckedChange={() => handleSelect(option.value)}
                        />
                      )}
                      <span>{option.label}</span>
                    </div>
                  ))}
                  {filteredOptions.length === 0 && !isLoading && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No options found
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={localSelected.length === 0}
              >
                Clear
              </Button>
              {isMulti && (
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
