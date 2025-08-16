import { useState, useEffect } from "react";

/**
 * Returns a debounced version of the given value. The returned value will
 * "lag behind" the original value by the given delay in milliseconds.
 *
 * @param {any} value The value to debounce.
 * @param {number} delay The amount of time in milliseconds to debounce the value.
 * @returns {any} A debounced version of the value.
 */
function useDebounce(value, delay) {
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
}

export default useDebounce;
