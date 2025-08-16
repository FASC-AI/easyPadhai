import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";

const Dropdown = ({
  options: initialOptions,
  isMulti,
  onChange,
  placeholder,
  defaultValue,
  value,
  disabled,
  apiContext,
  fetchApi,
  getOptionLabel,
  getOptionValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    isMulti ? value || defaultValue || [] : value || defaultValue || null
  );
  const [options, setOptions] = useState(initialOptions || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const optionsCacheRef = useRef(new Map());

  const fetchOptions = useCallback(
    debounce(async (newPage = 1, append = false, isSearch = false) => {
      if (!fetchApi || isLoading) return;
      if (!isSearch && !hasMore && append) return;

      const cacheKey = JSON.stringify({
        page: newPage,
        search: isSearch ? searchQuery : "",
        context: apiContext,
      });

      if (optionsCacheRef.current.has(cacheKey)) {
        const cached = optionsCacheRef.current.get(cacheKey);
        setOptions((prev) =>
          append && !isSearch ? [...prev, ...cached.options] : cached.options
        );
        setHasMore(cached.hasMore);
        setPage(newPage);
        return;
      }

      setIsLoading(true);
      try {
        const params = {
          search: isSearch ? searchQuery : "",
          page: newPage,
          limit: 10,
          context: apiContext,
        };
        const response = await fetchApi(params);
        const newOptions = Array.isArray(response.options)
          ? response.options.map((opt) => ({
              label: getOptionLabel(opt),
              value: getOptionValue(opt),
            }))
          : [];

        setOptions((prev) =>
          append && !isSearch ? [...prev, ...newOptions] : newOptions
        );
        const newHasMore =
          newOptions.length === 10 && (response.total || 0) > newPage * 10;
        setHasMore(newHasMore);
        setPage(newPage);

        optionsCacheRef.current.set(cacheKey, {
          options: newOptions,
          hasMore: newHasMore,
        });
        newOptions.forEach((opt) => {
          optionsCacheRef.current.set(`option:${opt.value}`, opt);
        });
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [fetchApi, apiContext, hasMore, searchQuery, getOptionLabel, getOptionValue]
  );

  // Handle options fetching or filtering when dropdown opens or search changes
  useEffect(() => {
    if (!isOpen) return;

    if (Array.isArray(initialOptions) && initialOptions.length > 0) {
      // Local filtering for initialOptions
      const filteredOptions = searchQuery
        ? initialOptions.filter((opt) =>
            getOptionLabel(opt)
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        : initialOptions;
      setOptions(filteredOptions);
      setHasMore(false); // No pagination for local options
    } else if (fetchApi) {
      // Fetch options for API with search query
      setPage(1);
      fetchOptions(1, false, searchQuery.length > 0);
    }
  }, [
    isOpen,
    searchQuery,
    fetchApi,
    initialOptions,
    getOptionLabel,
    fetchOptions,
  ]);

  // Initialize options and cache on mount or when value/defaultValue changes
  useEffect(() => {
    if (Array.isArray(initialOptions)) {
      setOptions(initialOptions);
      initialOptions.forEach((opt) => {
        optionsCacheRef.current.set(`option:${getOptionValue(opt)}`, opt);
      });
    }
  }, [initialOptions, getOptionValue]);

  // Sync selected state with value prop
  useEffect(() => {
    if (isMulti) {
      if (Array.isArray(value)) {
        const selectedOptions = value
          .map((val) => {
            const cached = optionsCacheRef.current.get(`option:${val}`);
            if (cached) return cached;
            const opt = (initialOptions || options || []).find(
              (opt) => getOptionValue(opt) === val
            );
            return opt || { value: val, label: val };
          })
          .filter(Boolean);
        setSelected(selectedOptions);
      } else {
        setSelected([]);
      }
    } else {
      if (value) {
        const cached = optionsCacheRef.current.get(`option:${value}`);
        const selectedOption = cached ||
          (initialOptions || options || []).find(
            (opt) => getOptionValue(opt) === value
          ) || { value, label: `Option ${value}` };
        optionsCacheRef.current.set(`option:${value}`, selectedOption);
        setSelected(selectedOption);
      } else {
        setSelected(null);
      }
    }
  }, [value, isMulti, initialOptions, options, getOptionValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !(listRef.current && listRef.current.contains(event.target))
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setPage(1);
        setHasMore(true);
        if (Array.isArray(initialOptions)) {
          setOptions(initialOptions);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [initialOptions]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      fetchOptions.cancel();
    };
  }, [fetchOptions]);

  // Handle infinite scroll
  const handleScroll = () => {
    if (!listRef.current || isLoading || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      fetchOptions(page + 1, true, searchQuery.length > 0);
    }
  };

  // Handle single-select
  const handleSingleSelect = (option) => {
    const newSelected =
      selected && selected.value === option.value ? null : option;
    setSelected(newSelected);
    optionsCacheRef.current.set(`option:${option.value}`, option);
    setIsOpen(false);
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    setOptions(initialOptions || []); // Reset options
    onChange(newSelected ? newSelected.value : null);
  };

  // Handle multi-select
  const handleMultiSelect = (option) => {
    let newSelected;
    if (selected.some((item) => item.value === option.value)) {
      newSelected = selected.filter((item) => item.value !== option.value);
    } else {
      newSelected = [...selected, option];
    }
    setSelected(newSelected);
    newSelected.forEach((item) =>
      optionsCacheRef.current.set(`option:${item.value}`, item)
    );
    onChange(newSelected.map((item) => item.value));
    setSearchQuery("");
    setPage(1);
    setHasMore(true);
    setOptions(initialOptions || []);
  };

  // Handle Enter key to reset search
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() === "") {
      setIsOpen(false);
      setSearchQuery("");
      setPage(1);
      setHasMore(true);
      setOptions(initialOptions || []);
    }
  };

  // Get display text for selected option(s)
  const getDisplayText = () => {
    if (isLoading && !selected) return placeholder;
    if (isMulti) {
      if (selected.length > 0) {
        const selectedLabel = selected[0].label || selected[0].value;
        const additionalCount = selected.length - 1;
        return additionalCount > 0
          ? `${selectedLabel} +${additionalCount} (${selected.length} selected)`
          : `${selectedLabel} (${selected.length} selected)`;
      }
      return placeholder;
    } else {
      if (selected) return selected.label || selected.value;
      return placeholder;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
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
      <div
        className={`bg-white mt-2.5 border border-gray-300 rounded-md p-2 flex justify-between items-center w-full ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-50"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="text-gray-500 truncate text-xs">
          {getDisplayText()}
        </span>
        <svg
          className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""} ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && !disabled && (
        <ul
          className="absolute z-[99999] w-full bg-white border border-gray-300 rounded-md mt-1 max-h-[250px] overflow-y-auto shadow-lg custom-scrollbar"
          ref={listRef}
          onScroll={handleScroll}
        >
          <li className="p-2 sticky top-0 bg-white border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              className="mt-2 flex h-10 w-full rounded-md border px-3 py-2 text-xs ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-primary-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#e0e0e0] disabled:text-[#999999] border-border-primary bg-white"
            />
          </li>
          {Array.isArray(options) && options.length > 0 ? (
            options.map((option) => (
              <li
                key={option.value}
                className={`p-2 hover:bg-gray-100-dot-1 cursor-pointer text-gray-500 truncate text-xs flex justify-between items-center`}
                onClick={(e) => {
                  e.stopPropagation();
                  isMulti
                    ? handleMultiSelect(option)
                    : handleSingleSelect(option);
                }}
              >
                <span>{option.label || option.value}</span>
                {(isMulti
                  ? selected.some((item) => item.value === option.value)
                  : selected && selected.value === option.value) && (
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </li>
            ))
          ) : isLoading ? (
            <li className="p-2 text-center text-gray-500">Loading...</li>
          ) : (
            <li className="p-2 text-center text-gray-500">No options found</li>
          )}
          {isLoading && options.length > 0 && (
            <li className="p-2 text-center text-gray-500">Loading more...</li>
          )}
        </ul>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ),
  isMulti: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ]),
  value: PropTypes.oneOfType([PropTypes.any, PropTypes.array]),
  disabled: PropTypes.bool,
  apiContext: PropTypes.any,
  fetchApi: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

Dropdown.defaultProps = {
  options: null,
  isMulti: false,
  placeholder: "Select an option",
  defaultValue: null,
  value: null,
  disabled: false,
  apiContext: null,
  fetchApi: null,
  getOptionLabel: (option) => option.label || String(option),
  getOptionValue: (option) => option.value || String(option),
};

export default React.memo(Dropdown);
