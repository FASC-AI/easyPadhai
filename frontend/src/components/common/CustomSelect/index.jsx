import { useState, useMemo, useEffect } from 'react';
import Select, { components } from 'react-select';
import { useField, useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import apiService from '@/lib/apiService';
import { useRef } from 'react';
import AxiosInstance from '@/services/baseService';
import { useCallback } from 'react';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

// Debounce function to limit API calls
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const colourStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    background: state.isDisabled ? '#e0e0e0' : 'white',
    display: 'flex',
    borderRadius: '0.375rem',
    minHeight: '20px',
    height: '100%',
    border: '1px solid #e0e0e0',
    color: '#000',
    fontSize: '12px',
    fontWeight: '500',
    // lineHeight: '1.5',
    boxShadow: state.isFocused ? '0 0 0 2px #006CB8' : 'none',
    outline: 'none',
    paddingLeft: '5px',
    '&:hover': {
      border: '1px solid #e0e0e0',
    },
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '12px',
    color: '#7c7d7e',
    fontWeight: 500,
  }),
  menu: (styles) => ({
    ...styles,
    zIndex: 999,
    fontSize: '12px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    boxShadow: '0 1px 0 rgb(0 0 0 / 6%)',
    boxSizing: 'border-box',
    borderRadius: '0.375rem',
  }),

  menuList: (baseStyles) => ({
    ...baseStyles,
    maxHeight: '200px',
    overflowY: 'auto',
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    fontSize: '12px',
    backgroundColor: state.isSelected
      ? '#006CB8'
      : state.isFocused
        ? '#CDE9F6'
        : '#fff',
    color: state.isSelected ? 'white' : '#333',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    padding: '0',
  }),
  indicatorSeparator: (styles) => ({ ...styles, display: 'none' }),
  indicatorsContainer: (baseStyles) => ({
    ...baseStyles,
    height: '30px',
    padding: '0 8px',
  }),
};

/**
 * CustomSelect Component
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isMulti - Enables multi-select mode.
 * @param {function} props.fetchData - Async function to fetch data with pagination and search.
 * @param {boolean} props.useFormik - Enables integration with Formik.
 * @param {string} props.name - Name of the form field (required if useFormik is true).
 * @param {function} props.onChange - Callback to handle change event.
 * @param {string} props.label - Label for the select component.
 * @param {boolean} props.showLabel - Whether to display the label.
 * @param {Object} props.selectProps - Additional props for the react-select component.
 *
 * @returns {JSX.Element} - The rendered select component.
 */
const CustomSelect = ({
  isMulti = false,
  fetchData,
  useFormik = false,
  name = '',
  refetch = '',
  onChange,
  label = '',
  showLabel = true,
  defaultValue = null,
  selectProps = {},
  isDisabled = false,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formikContext = useFormik ? useFormikContext() : null;
  const { setFieldValue, values, touched, errors } = formikContext || {};
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(defaultValue || []);

  const debouncedInputValue = useDebounce(inputValue, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFetchingData,
  } = useInfiniteQuery({
    queryKey: [
      'selectData',
      fetchData?.name,
      JSON.stringify(refetch),
      name,
      debouncedInputValue,
    ],
    queryFn: ({ pageParam = 1 }) => fetchData(debouncedInputValue, pageParam),
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? false,
  });

  const options = useMemo(() => {
    if (!data) return [];

    // Create a set to track existing values
    const existingValues = new Set(
      Array.isArray(selectedValue)
        ? selectedValue.map((option) => option.value)
        : []
    );

    // Create options while filtering out duplicates
    const uniqueOptions = new Set();
    const filteredOptions = data.pages.flatMap((page) =>
      page?.results?.filter((result) => {
        if (
          !existingValues.has(result.value) &&
          !uniqueOptions.has(result.value)
        ) {
          uniqueOptions.add(result.value);
          return true; // Include this result
        }
        return false; // Exclude duplicates
      })
    );

    return filteredOptions;
  }, [data, selectedValue]);

  useEffect(() => {
    if (useFormik && values[name]) {
      setSelectedValue(values[name] || []);
    }
  }, [values, name, useFormik]);

  const handleChange = (selected) => {
    setSelectedValue(selected);
    if (useFormik) {
      setFieldValue(name, selected);
    }
    if (onChange) {
      onChange(selected);
    }
  };

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
  };

  const handleMenuScrollToBottom = () => {
    // Prevent fetching next page if no next page available
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const LoadingIndicator = () => (
    <div className="loading-indicator" style={{ padding: '10px' }}>
      Loading...
    </div>
  );

  return (
    <div className="custom-select-component">
      {showLabel && label && (
        <Label htmlFor={name} className={cn(selectProps?.labelColor)}>
          {label}{' '}
          <span className="text-red-500">
            {selectProps.isRequired ? '*' : ''}{' '}
          </span>
        </Label>
      )}
      <Select
        id={name}
        isMulti={isMulti}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        styles={colourStyles}
        isDisabled={isDisabled}
        closeMenuOnSelect={!isMulti}
        components={{
          Menu: (props) => (
            <components.Menu {...props}>
              {isFetchingData && !options.length ? (
                <LoadingIndicator />
              ) : (
                props.children
              )}
            </components.Menu>
          ),
        }}
        {...selectProps}
      />
      {touched && touched[name] && errors && errors[name] && (
        <div className="error-message">{errors[name]}</div>
      )}
    </div>
  );
};
const CustomFilter = ({
  isMulti = false,
  fetchData,
  useFormik = false,
  name = '',
  refetch = '',
  onChange,
  label = '',
  showLabel = true,
  defaultValue = null,
  selectProps = {},
  isDisabled = false,
}) => {
  const formikContext = useFormik ? useFormikContext() : null;
  const { setFieldValue, values, touched, errors } = formikContext || {};
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(defaultValue || []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFetchingData,
  } = useInfiniteQuery({
    queryKey: ['selectData', fetchData.name, JSON.stringify(refetch), name], // Removed debouncedInputValue
    queryFn: ({ pageParam = 1 }) => fetchData('', pageParam), // Pass empty string or null since no search
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? false,
  });

  // All fetched options without filtering by search
  const allOptions = useMemo(() => {
    if (!data) return [];

    const existingValues = new Set(
      Array.isArray(selectedValue)
        ? selectedValue.map((option) => option.value)
        : []
    );

    const uniqueOptions = new Set();
    return data.pages.flatMap((page) =>
      page?.results?.filter((result) => {
        if (
          !existingValues.has(result.value) &&
          !uniqueOptions.has(result.value)
        ) {
          uniqueOptions.add(result.value);
          return true;
        }
        return false;
      })
    );
  }, [data, selectedValue]);

  // Filtered options based on inputValue (client-side)
  const options = useMemo(() => {
    if (!inputValue) return allOptions; // Show all options if no search input
    return allOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [allOptions, inputValue]);

  useEffect(() => {
    if (useFormik && values[name]) {
      setSelectedValue(values[name] || []);
    }
  }, [values, name, useFormik]);

  const handleChange = (selected) => {
    setSelectedValue(selected);
    if (useFormik) {
      setFieldValue(name, selected);
    }
    if (onChange) {
      onChange(selected);
    }
  };

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue); // Update input for client-side filtering
  };

  const handleMenuScrollToBottom = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage(); // Still allow infinite scroll for more data
    }
  };

  const LoadingIndicator = () => (
    <div className="loading-indicator" style={{ padding: '10px' }}>
      Loading...
    </div>
  );

  return (
    <div className="custom-select-component">
      {showLabel && label && (
        <Label htmlFor={name} className={cn(selectProps?.labelColor)}>
          {label}{' '}
          <span className="text-red-500">
            {selectProps.isRequired ? '*' : ''}{' '}
          </span>
        </Label>
      )}
      <Select
      
        id={name}
        isMulti={isMulti}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        styles={colourStyles}
        isDisabled={isDisabled}
        closeMenuOnSelect={!isMulti}
        components={{
          Menu: (props) => (
            <components.Menu {...props}>
              {isFetchingData && !options.length ? (
                <LoadingIndicator />
              ) : (
                props.children
              )}
            </components.Menu>
          ),
        }}
        {...selectProps}
      />
      {touched && touched[name] && errors && errors[name] && (
        <div className="error-message">{errors[name]}</div>
      )}
    </div>
  );
}
CustomSelect.propTypes = {
  isMulti: PropTypes.bool,
  fetchData: PropTypes.func.isRequired,
  useFormik: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  selectProps: PropTypes.object,
  isDisabled: PropTypes.bool,
  isColor: PropTypes.bool,
};

const CustomSelectById = ({
  id,
  isMulti = false,
  useFormik = false,
  refetch = '',
  name = '',
  onChange,
  label = '',
  showLabel = true,
  filters = {},
  endpoint,
  defaultValue = null,
  selectProps = {},
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formikContext = useFormik ? useFormikContext() : null;
  const { setFieldValue, values, touched, errors } = formikContext || {};
  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(defaultValue || []);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const debouncedInputValue = useDebounce(inputValue, 300);

  const fetchData = async (searchValue, isInitialFetch = false) => {
    const response = await apiService.get(
      endpoint ? endpoint : `/${id}`,
      {
        params: {
          search: searchValue,
          ...(isInitialFetch && defaultValue ? { _id: defaultValue } : {}),
          ...filters,
        },
      }
    );

    if (isInitialFetch && defaultValue && response.data.length > 0) {
      setSelectedValue(response.data);
      setInitialFetchDone(true);
    }

    return { results: response.data };
  };

  const { data, isLoading: isFetchingData } = useQuery({
    queryKey: [
      'master',
      refetch,
      id,
      JSON.stringify(filters),
      debouncedInputValue,
    ],
    queryFn: () => fetchData(debouncedInputValue, !initialFetchDone),
  });

  const options = useMemo(() => (data ? data.results : []), [data]);

  useEffect(() => {
    if (useFormik && Array.isArray(values[name])) {
      setSelectedValue(values[name]);
    }
  }, [values, name, useFormik]);

  const handleChange = (selected) => {
    const newValue = isMulti ? selected || [] : selected;
    setSelectedValue(newValue);

    if (useFormik) {
      setFieldValue(name, newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <div className="custom-select-component">
      {showLabel && label && (
        <Label htmlFor={name} className={cn(selectProps?.labelColor)}>
          {label}{' '}
          <span className="text-red-500">
            {selectProps.isRequired ? '*' : ''}{' '}
          </span>
        </Label>
      )}
      <Select
        id={name}
        isMulti={isMulti}
        options={options}
        value={selectedValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        styles={colourStyles}
        components={{
          Menu: (props) => (
            <components.Menu {...props}>
              {isFetchingData && !options.length ? (
                <div className="loading-indicator" style={{ padding: '10px' }}>
                  Loading...
                </div>
              ) : (
                props.children
              )}
            </components.Menu>
          ),
        }}
        {...selectProps}
      />
      {touched && touched[name] && errors && errors[name] && (
        <div className="error-message">{errors[name]}</div>
      )}
    </div>
  );
};

const FormikSelect = ({
  isMulti = false,
  name,
  label,
  id,
  defaultValue,
  endpoint,
  otherFilters = {},
  onChange = () => {},
  limit = 10000,
  selectProps = {},
}) => {
  const getDefaultEndpoint = (id) => `/${id}`;

  const { setFieldValue, values } = useFormikContext();
  const [field, meta] = useField(name);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasFetchedDefault = useRef(false); // Ref to track default fetch state

  const fetchOptions = async (inputValue, defaultValue, filters) => {
    try {
      setLoading(true);
      let params = { limit: limit, ...filters };
      if (inputValue || defaultValue) {
        params = {
          search: inputValue,
          ...(defaultValue ? { _id: defaultValue } : {}),
          ...filters,
        };
      }
      const { data } = await AxiosInstance.get(
        `${endpoint ? endpoint : getDefaultEndpoint(id)}`,
        { params }
      );
      setOptions(data.data);

      // Update selected value if it matches with fetched options
      if (defaultValue && !hasFetchedDefault.current) {
        hasFetchedDefault.current = true;
        const defaultOption = data.data.filter((opt) =>
          defaultValue.includes(opt.value)
        );
        if (defaultOption) {
          const selectedValues = isMulti
            ? defaultOption.map((opt) => opt.value)
            : defaultOption[0].value;

          setFieldValue(name, selectedValues);
        }
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchOptions = useCallback(
    debounce(async (inputValue, filters) => {
      await fetchOptions(inputValue, null, filters);
    }, 300),
    []
  );

  const handleChange = (selectedOption) => {
    if (isMulti) {
      const ids = selectedOption.map((option) => option.value);
      setFieldValue(name, ids);
      onChange(selectedOption);
      return;
    }
    if (!selectedOption && selectProps.isClearable) {
      // Assign an initial value when the field is cleared
      setFieldValue(name, '');
    } else {
      setFieldValue(name, selectedOption?.value || null);
    }
    // setFieldValue(name, selectedOption?.value || null);
    onChange(selectedOption);
  };

  const handleInputChange = (inputValue) => {
    debouncedFetchOptions(inputValue, otherFilters);
  };

  useEffect(() => {
    fetchOptions('', defaultValue, otherFilters);
  }, [defaultValue, JSON.stringify(otherFilters)]);

  const selectedValue = isMulti
    ? options.filter(({ value }) => field?.value?.includes(value))
    : options.find(({ value }) => value === field.value);

  const LoadingIndicator = () => (
    <div className="loading-indicator" style={{ padding: '10px' }}>
      Loading...
    </div>
  );

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {selectProps.isRequired && <span className="text-red-500"> *</span>}
      </Label>
      <Select
        id={id}
        isMulti={isMulti}
        {...selectProps}
        menuPortalTarget={document.body}
        name={name}
        value={selectedValue || null}
        options={options}
        onChange={handleChange}
        onInputChange={handleInputChange}
        isClearable
        isLoading={loading}
        styles={colourStyles}
        components={{
          Menu: (props) => (
            <components.Menu {...props}>
              {loading && !options.length ? (
                <LoadingIndicator />
              ) : (
                props.children
              )}
            </components.Menu>
          ),
        }}
      />
      {meta.error && meta.touched && !meta.value && !selectProps.isDisabled ? (
        <div className="error-message">{meta.error}</div>
      ) : null}
    </div>
  );
};

CustomSelectById.propTypes = {
  id: PropTypes.string.isRequired,
  isMulti: PropTypes.bool,
  useFormik: PropTypes.bool,
  refetch: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  filters: PropTypes.object,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  selectProps: PropTypes.object,
};

export { CustomSelect,CustomFilter, CustomSelectById, FormikSelect };
