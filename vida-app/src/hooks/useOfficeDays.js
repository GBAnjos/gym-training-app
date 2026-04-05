import { useState, useEffect } from 'react';
import { useDataSync } from './useDataSync';

const STORAGE_KEY = 'lifeplanner_officeDays';
const DEFAULT_OFFICE_DAYS = ['Ter', 'Qui'];

export function useOfficeDays() {
  const [officeDays, setOfficeDays] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_OFFICE_DAYS;
    } catch {
      return DEFAULT_OFFICE_DAYS;
    }
  });

  const { debouncedSync } = useDataSync();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(officeDays));
    debouncedSync();
  }, [officeDays, debouncedSync]);

  const toggleOfficeDay = (day) => {
    setOfficeDays(prev => {
      if (prev.includes(day)) {
        // Remove the day
        return prev.filter(d => d !== day);
      } else if (prev.length < 2) {
        // Add the day (max 2)
        return [...prev, day];
      } else {
        // Replace the first day with the new one
        return [prev[1], day];
      }
    });
  };

  const isOfficeDay = (day) => officeDays.includes(day);

  return { officeDays, toggleOfficeDay, isOfficeDay };
}
