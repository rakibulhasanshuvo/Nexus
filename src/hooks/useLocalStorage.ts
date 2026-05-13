"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { safeJsonParse } from '@/lib/json-utils';

/**
 * A hook that provides a type-safe interface to localStorage with SSR safety.
 * It also synchronizes state across different instances of the hook in the same app.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (data: unknown) => data is T
) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const initialValueRef = useRef(initialValue);
  const validatorRef = useRef(validator);

  useEffect(() => {
    initialValueRef.current = initialValue;
    validatorRef.current = validator;
  }, [initialValue, validator]);

  // Initialize value from localStorage on mount (SSR safety)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const item = window.localStorage.getItem(key);
      if (item) {
        queueMicrotask(() => setStoredValue(safeJsonParse(item, initialValueRef.current, validatorRef.current)));
      }
    } catch (error) {
      // Safely swallow storage errors to avoid leaking implementation details
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event for cross-component sync
        window.dispatchEvent(new Event(`${key}-update`));
      }
    } catch (error) {
      // Safely swallow storage errors to avoid leaking implementation details
    }
  }, [key, storedValue]);

  // Synchronize across components/tabs
  useEffect(() => {
    const handleUpdate = (e?: StorageEvent) => {
      if (typeof window === "undefined") return;
      if (e && e.key !== key) return;

      const item = window.localStorage.getItem(key);
      if (item) {
        queueMicrotask(() => setStoredValue(safeJsonParse(item, initialValueRef.current, validatorRef.current)));
      }
    };

    window.addEventListener(`${key}-update`, handleUpdate as any);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(`${key}-update`, handleUpdate as any);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
