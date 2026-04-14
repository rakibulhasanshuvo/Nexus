/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAcademicStats } from '../useAcademicStats';

/**
 * Syncs local storage data (CGPA Vault) to Supabase when a user logs in.
 * Designed to run once per session.
 */
export function useSupabaseSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { results, setResults } = useAcademicStats();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const performSync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only sync if logged in

      // Check if we have local data to push
      const localResults = window.localStorage.getItem('bou_cgpa_vault');
      const hasLocalData = localResults && JSON.parse(localResults).length > 0;

      if (!hasLocalData) {
         // If no local data, pull from Supabase
         const { data, error } = await supabase
            .from('vault_results')
            .select('*')
            .order('semester', { ascending: true });

         if (!error && data && mounted) {
            const formatted = data.map(d => ({ semester: d.semester, gpa: Number(d.gpa), credits: Number(d.credits) }));
            setResults(formatted); // Update local state with DB state
         }
         return;
      }

      // If we have local data, push it to Supabase (upsert)
      try {
        setIsSyncing(true);
        const parsed = JSON.parse(localResults);

        const updates = parsed.map((r: any) => ({
          user_id: user.id,
          semester: r.semester,
          gpa: r.gpa,
          credits: r.credits,
        }));

        const { error } = await supabase
          .from('vault_results')
          .upsert(updates, { onConflict: 'user_id,semester' });

        if (error) throw error;
        if (mounted) setSyncStatus('success');
      } catch (err) {
        console.error("Failed to sync vault to Supabase", err);
        if (mounted) setSyncStatus('error');
      } finally {
        if (mounted) setIsSyncing(false);
      }
    };

    performSync();

    return () => {
      mounted = false;
    };
  }, []);

  return { isSyncing, syncStatus };
}
