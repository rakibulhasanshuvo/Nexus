/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that provides a type-safe interface to localStorage with SSR safety.
 * It also synchronizes state across different instances of the hook in the same app.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Initialize value from localStorage on mount (SSR safety)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
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
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Synchronize across components/tabs
  useEffect(() => {
    const handleUpdate = () => {
      if (typeof window === "undefined") return;
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          setStoredValue(JSON.parse(item));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener(`${key}-update`, handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === key) handleUpdate();
    });

    return () => {
      window.removeEventListener(`${key}-update`, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
