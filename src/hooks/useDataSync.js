import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../data/supabase';
import { useAuth } from './useAuth';

const STORAGE_PREFIX = 'vida_';

export function useDataSync() {
  const { user } = useAuth();
  const syncTimeoutRef = useRef(null);

  // Sync data to Supabase
  const syncToCloud = useCallback(async () => {
    if (!user) return;

    try {
      const workoutData = {};
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX) || key.includes('_') ||
            key === 'training_days' || key === 'current_streak' ||
            key === 'best_streak' || key.startsWith('lifeplanner_')) {
          try {
            workoutData[key] = JSON.parse(localStorage.getItem(key));
          } catch {
            workoutData[key] = localStorage.getItem(key);
          }
        }
      });

      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          workout_data: workoutData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Sync to cloud error:', error);
      } else {
        console.log('Data synced to cloud');
        localStorage.setItem('last_sync', new Date().toISOString());
      }
    } catch (err) {
      console.error('Sync error:', err);
    }
  }, [user]);

  // Sync data from Supabase
  const syncFromCloud = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('workout_data, updated_at')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch from cloud error:', error);
        return;
      }

      if (data && data.workout_data) {
        const cloudUpdated = new Date(data.updated_at);
        const localUpdated = new Date(localStorage.getItem('last_sync') || 0);

        if (cloudUpdated > localUpdated) {
          Object.keys(data.workout_data).forEach(key => {
            const value = data.workout_data[key];
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          });
          localStorage.setItem('last_sync', new Date().toISOString());
          console.log('Data synced from cloud');
          return true; // Indicates data was updated
        }
      }
    } catch (err) {
      console.error('Sync from cloud error:', err);
    }
    return false;
  }, [user]);

  // Debounced sync to cloud
  const debouncedSync = useCallback(() => {
    if (!user) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToCloud();
    }, 2000);
  }, [user, syncToCloud]);

  // Initial sync from cloud when user logs in
  useEffect(() => {
    if (user) {
      syncFromCloud();
    }
  }, [user, syncFromCloud]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    syncToCloud,
    syncFromCloud,
    debouncedSync
  };
}

// Hook for managing localStorage with auto-sync
export function useLocalStorage(key, initialValue) {
  const { debouncedSync } = useDataSync();
  const fullKey = key.startsWith(STORAGE_PREFIX) ? key : `${STORAGE_PREFIX}${key}`;

  const getStoredValue = () => {
    try {
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
      localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      debouncedSync();
      return valueToStore;
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  return [getStoredValue(), setValue, getStoredValue];
}
