import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDataSync } from './useDataSync';

const WEIGHT_LOG_KEY = 'lifeplanner_weightLog';
const BODY_COMP_KEY = 'vida_body_composition';

export function useProgress() {
  // Weight log (legacy)
  const [weightLog, setWeightLog] = useState(() => {
    try {
      const stored = localStorage.getItem(WEIGHT_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Body composition data (new)
  const [bodyComposition, setBodyComposition] = useState(() => {
    try {
      const stored = localStorage.getItem(BODY_COMP_KEY);
      return stored ? JSON.parse(stored) : {
        mode: 'basic', // 'basic' | 'advanced'
        entries: []
      };
    } catch {
      return { mode: 'basic', entries: [] };
    }
  });

  const { debouncedSync } = useDataSync();

  // Get user profile data from localStorage
  const userProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem('vida_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Save weight log
  useEffect(() => {
    localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(weightLog));
    debouncedSync();
  }, [weightLog, debouncedSync]);

  // Save body composition
  useEffect(() => {
    localStorage.setItem(BODY_COMP_KEY, JSON.stringify(bodyComposition));
    debouncedSync();
  }, [bodyComposition, debouncedSync]);

  // Add weight entry (legacy)
  const addWeight = useCallback((weight) => {
    const today = new Date().toISOString().split('T')[0];
    setWeightLog(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, { date: today, weight: parseFloat(weight) }].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );
    });
  }, []);

  // Toggle mode
  const toggleMode = useCallback(() => {
    setBodyComposition(prev => ({
      ...prev,
      mode: prev.mode === 'basic' ? 'advanced' : 'basic'
    }));
  }, []);

  // Add body composition entry
  const addBodyCompEntry = useCallback((entry) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      date: today,
      weight: entry.weight ? parseFloat(entry.weight) : null,
      bodyFat: entry.bodyFat ? parseFloat(entry.bodyFat) : null,
      measurements: {
        braco: entry.braco ? parseFloat(entry.braco) : null,
        cintura: entry.cintura ? parseFloat(entry.cintura) : null,
        peito: entry.peito ? parseFloat(entry.peito) : null,
        coxa: entry.coxa ? parseFloat(entry.coxa) : null,
      }
    };

    setBodyComposition(prev => {
      const filtered = prev.entries.filter(e => e.date !== today);
      return {
        ...prev,
        entries: [...filtered, newEntry].sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        )
      };
    });

    // Also update weight log if weight is provided
    if (entry.weight) {
      addWeight(entry.weight);
    }
  }, [addWeight]);

  // Get latest measurements
  const latestEntry = useMemo(() => {
    if (bodyComposition.entries.length === 0) return null;
    return bodyComposition.entries[bodyComposition.entries.length - 1];
  }, [bodyComposition.entries]);

  // Get previous entry for delta calculation
  const previousEntry = useMemo(() => {
    if (bodyComposition.entries.length < 2) return null;
    return bodyComposition.entries[bodyComposition.entries.length - 2];
  }, [bodyComposition.entries]);

  // Calculate deltas for measurements
  const measurementDeltas = useMemo(() => {
    if (!latestEntry || !previousEntry) return null;

    const calcDelta = (key) => {
      const current = latestEntry.measurements?.[key];
      const prev = previousEntry.measurements?.[key];
      if (current == null || prev == null) return null;
      return current - prev;
    };

    return {
      braco: calcDelta('braco'),
      cintura: calcDelta('cintura'),
      peito: calcDelta('peito'),
      coxa: calcDelta('coxa'),
      bodyFat: latestEntry.bodyFat && previousEntry.bodyFat
        ? latestEntry.bodyFat - previousEntry.bodyFat
        : null
    };
  }, [latestEntry, previousEntry]);

  // Use profile data or fallback to defaults
  const startWeight = userProfile?.currentWeight
    ? parseFloat(userProfile.currentWeight)
    : userProfile?.weight
      ? parseFloat(userProfile.weight)
      : 72;

  const targetWeight = userProfile?.targetWeight
    ? parseFloat(userProfile.targetWeight)
    : startWeight + 5; // Default to +5kg if no target

  const currentWeight = weightLog.length > 0
    ? weightLog[weightLog.length - 1].weight
    : startWeight;

  const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;

  // Get body fat history for chart
  const bodyFatHistory = useMemo(() => {
    return bodyComposition.entries
      .filter(e => e.bodyFat != null)
      .map(e => ({ date: e.date, value: e.bodyFat }));
  }, [bodyComposition.entries]);

  return {
    // Legacy
    weightLog,
    addWeight,
    currentWeight,
    startWeight,
    targetWeight,
    progress: Math.min(100, Math.max(0, progress)),
    userProfile,

    // New body composition
    mode: bodyComposition.mode,
    toggleMode,
    bodyComposition,
    addBodyCompEntry,
    latestEntry,
    previousEntry,
    measurementDeltas,
    bodyFatHistory
  };
}
