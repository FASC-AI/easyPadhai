import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState, useImperativeHandle, forwardRef } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRef } from "react";

const MultiSelectWithoutSelect = forwardRef(
  (
    {
      fetchOptions, // Function to fetch options (supports pagination or infinite scrolling)
      initialValues = [],
      onSelectionChange,
      label = "Select options",
      isMulti = true, // Prop to toggle between multi-select and single-select
      isDisabled = false, // Prop to disable the select
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedValues, setSelectedValues] = useState(
      Array.isArray(initialValues) ? initialValues : []
    );
    const [initialCount, setInitialCount] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Track if more options can be loaded
    const listRef = useRef(null); // Reference to the scrollable list

    // Expose ref methods for refetching and resetting
    useImperativeHandle(ref, () => ({
      refetch: async () => {
        setInitialCount(1); // Reset to first page for refetch
        setHasMore(true); // Reset the "more" flag
        const fetchedOptions = await fetchOptions(searchTerm, 1); // Fetch from the first page
        setOptions(fetchedOptions); // Reset options with fresh data
        setSelectedValues(Array.isArray(initialValues) ? initialValues : []); // Reset selected values
      },
      resetSelections: () => {
        setSelectedValues([]);
        onSelectionChange?.([]);
      },
    }));

    // Load initial options on first render or search change
    useEffect(() => {
      async function loadInitialOptions() {
        const fetchedOptions = await fetchOptions(searchTerm, initialCount);
        setOptions(fetchedOptions);
      }
      loadInitialOptions();
    }, [fetchOptions, initialCount, searchTerm]); // Dependency on search term and initial count

    const handleSelect = (value) => {
      if (isDisabled) return;

      if (isMulti) {
        const isSelected = selectedValues.includes(value);
        const newValues = isSelected
          ? selectedValues.filter((item) => item !== value)
          : [...selectedValues, value];

        setSelectedValues(newValues);
        onSelectionChange?.(newValues);
      } else {
        const newValues = selectedValues[0] === value ? [] : [value];

        setSelectedValues(newValues);
        onSelectionChange?.(newValues);
      }
    };

    const computeLabel = () => {
      if (selectedValues.length === 0) return label;
      const firstSelected = options?.find(
        (item) => item.value === selectedValues[0]
      );
      return firstSelected
        ? `${firstSelected.label} ${
            selectedValues.length === 1 ? "" : `+ ${selectedValues.length - 1}`
          }`
        : label;
    };

    const filteredOptions = options?.filter((item) =>
      item?.label?.toLowerCase().includes(searchTerm?.toLowerCase())
    );

    const handleScroll = async () => {
      if (!listRef.current || isLoadingMore || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      // Check if the user scrolled to the bottom
      if (scrollHeight - scrollTop <= clientHeight + 10) {
        setIsLoadingMore(true);
        const newOptions = await fetchOptions(searchTerm, initialCount); // Use the current initialCount
        if (newOptions.length > 0) {
          setOptions((prev) => [...prev, ...newOptions]);
          setInitialCount((prev) => prev + 1); // Increment the count for the next page
        } else {
          setHasMore(false); // Stop fetching if no more options are available
        }
        setIsLoadingMore(false);
      }
    };

    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="multi-select"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={`w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background text-black border-black hover:text-black focus-visible:border-black focus-visible:outline-[3px] focus-visible:outline-black/20 ${
                isDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
              style={{
                borderColor: "rgb(224 224 224 / var(--tw-border-opacity))",
              }}
              disabled={isDisabled}
            >
              <span className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 c-black mb-1">
                {computeLabel()}
              </span>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={`shrink-0 text-muted-foreground/20 ${
                  isDisabled ? "opacity-50" : ""
                }`}
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0 z-[99999] relative"
            align="start"
          >
            <Command>
              <div
                className="flex items-center border rounded-md h-8 bg-white px-3"
                style={{
                  borderColor: "rgb(224 224 224 / var(--tw-border-opacity))",
                }}
              >
                {searchIcon({
                  className:
                    "mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-quaternary",
                })}
                <input
                  className="w-full p-2 border-none focus:outline-none rounded-md text-xs font-medium h-7 placeholder:text-xs placeholder:font-medium"
                  placeholder="Search options"
                  value={searchTerm}
                  onChange={(e) => {
                    if (isDisabled) return;
                    setSearchTerm(e.target.value);
                  }}
                  disabled={isDisabled}
                />
              </div>

              <CommandList
                ref={listRef}
                style={{
                  maxHeight: "200px", // Set the max height for the scrollable area
                  overflowY: "auto", // Enable vertical scrolling
                  scrollbarWidth: "thin",
                }}
                className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                onScroll={handleScroll} // Attach the scroll handler
              >
                {filteredOptions?.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => handleSelect(item.value)}
                    disabled={isDisabled}
                  >
                    <span className="text-sm leading-none">{item.label}</span>
                    {selectedValues.includes(item.value) && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
                {isLoadingMore && (
                  <div className="p-2 text-center text-sm text-gray-500">
                    Loading...
                  </div>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

MultiSelectWithoutSelect.displayName = "MultiSelectWithoutSelect";

export default MultiSelectWithoutSelect;
