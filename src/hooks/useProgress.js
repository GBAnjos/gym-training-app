import { useState, useEffect, useMemo } from 'react';
import { useDataSync } from './useDataSync';

const STORAGE_KEY = 'lifeplanner_weightLog';

export function useProgress() {
  const [weightLog, setWeightLog] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weightLog));
    debouncedSync();
  }, [weightLog, debouncedSync]);

  const addWeight = (weight) => {
    const today = new Date().toISOString().split('T')[0];
    setWeightLog(prev => {
      const filtered = prev.filter(entry => entry.date !== today);
      return [...filtered, { date: today, weight: parseFloat(weight) }].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );
    });
  };

  // Use profile data or fallback to defaults
  const startWeight = userProfile?.currentWeight ? parseFloat(userProfile.currentWeight) : 72;
  const targetWeight = userProfile?.targetWeight ? parseFloat(userProfile.targetWeight) : 80;

  const currentWeight = weightLog.length > 0
    ? weightLog[weightLog.length - 1].weight
    : startWeight;

  const progress = ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;

  return {
    weightLog,
    addWeight,
    currentWeight,
    startWeight,
    targetWeight,
    progress: Math.min(100, Math.max(0, progress)),
    userProfile
  };
}
