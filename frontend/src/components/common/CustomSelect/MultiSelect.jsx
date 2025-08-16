import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Checkbox } from "@/components/ui/checkbox";

export default function MultiSelect({
  fetchOptions,
  initialValues = [],
  onSelectionChange,
  label = "Select options",
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState(initialValues);
  const [selectAll, setSelectAll] = useState(false);
  useEffect(() => {
    async function loadOptions() {
      const fetchedOptions = await fetchOptions();
      setOptions(fetchedOptions);
    }

    loadOptions();
  }, [fetchOptions]);

  const handleSelect = (value) => {
    const isSelected = selectedValues.includes(value);
    const newValues = isSelected
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];

    setSelectedValues(newValues);
    onSelectionChange?.(newValues);
  };
  useEffect(() => {
    setSelectAll(
      selectedValues?.length === options?.length && options?.length > 0
    );
  }, [selectedValues, options]);
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all are selected, deselect all
      setSelectedValues([]);
      onSelectionChange?.([]);
    } else {
      // Select all options
      const newValues = options.map((option) => option?.value);
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

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="multi-select"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background hover:text-blue-primary-200 focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            {computeLabel()}
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0 z-[99999] relative"
          align="start"
        >
          <Command>
            <div className="flex items-center border-b px-3">
              {searchIcon({
                className:
                  "mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-quaternary",
              })}
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-quaternary disabled:cursor-not-allowed disabled:opacity-50 "
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />

              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="size-5"
                />
              </div>
            </div>

            <CommandList>
              {filteredOptions?.length === 0 ? (
                <CommandEmpty>No options found.</CommandEmpty>
              ) : (
                filteredOptions?.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => handleSelect(item.value)}
                  >
                    <span className="text-lg leading-none">{item.label}</span>
                    {selectedValues.includes(item.value) && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
