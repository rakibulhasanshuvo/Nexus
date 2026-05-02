"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * A hook that syncs with both Supabase and localStorage.
 * Prioritizes Supabase if the client exists, falling back to localStorage.
 * Only syncs if we don't opt out via the `localOnly` flag.
 */
export function useSyncedData<T>(
  key: string,
  initialValue: T,
  table?: string, // e.g., 'course_progress'
  idColumn?: string, // e.g., 'course_id'
  idValue?: string, // e.g., '0533-101'
  dataColumn?: string, // e.g., 'progress_data'
  localOnly: boolean = false
) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitializing, setIsInitializing] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize value from Supabase or localStorage on mount
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      if (typeof window === "undefined") return;

      // 1. Try to load from localStorage first for immediate UI render (optimistic)
      try {
        const item = window.localStorage.getItem(key);
        if (item && isMounted) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }

      // 2. If Supabase is available and we're not local-only, try fetching from there
      if (!localOnly && supabase && table) {
        try {
          const { data: userData, error: authError } = await supabase.auth.getUser();

          if (!authError && userData.user) {
            let query = supabase
              .from(table)
              .select(dataColumn || '*');

            // If we have an ID to match against (e.g. course_id = '0533')
            if (idColumn && idValue) {
               query = query.eq(idColumn, idValue);
            }

            // If the table uniquely maps to a user via user_id, RLS will handle it, but we can also explicitly add it
            query = query.eq('user_id', userData.user.id);

            const { data, error } = await query.single();

            const rowData = data as any;
            if (rowData && dataColumn && rowData[dataColumn] !== undefined && isMounted) {
               setStoredValue(rowData[dataColumn] as T);
               // Keep localstorage in sync
               window.localStorage.setItem(key, JSON.stringify(rowData[dataColumn]));
            }
          }
        } catch (error) {
          console.warn(`Supabase fetch failed for ${key}, using local data`, error);
        }
      }

      if (isMounted) setIsInitializing(false);
    }

    initialize();

    return () => { isMounted = false; };
  }, [key, localOnly, table, idColumn, idValue, dataColumn]);

  // Setter function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Update React state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event(`${key}-update`));
      }

      // Save to Supabase (fire and forget for UI responsiveness)
      if (!localOnly && supabase && table && !isInitializing) {
        (async () => {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {

            const payload: any = {
               user_id: userData.user.id,
               updated_at: new Date().toISOString()
            };

            if (idColumn && idValue) {
               payload[idColumn] = idValue;
            }
            if (dataColumn) {
               payload[dataColumn] = valueToStore;
            }

            // Upsert the data
            // We expect the tables to have a unique constraint that we can use for upsert.
            // If idColumn is provided, the constraint is `user_id, ${idColumn}`.
            // Otherwise, we expect the table to have a unique constraint on `user_id`.
            await supabase
              .from(table)
              .upsert(payload, { onConflict: idColumn ? `user_id,${idColumn}` : 'user_id' });
          }
        })();
      }
    } catch (error) {
      console.warn(`Error setting synced data for "${key}":`, error);
    }
  }, [key, storedValue, isInitializing, localOnly, table, idColumn, idValue, dataColumn]);

  // Listen for local updates (cross-tab/component sync)
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

  return [storedValue, setValue, isInitializing] as const;
}
