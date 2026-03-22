import { useEffect, useRef, useState, useCallback } from 'react';
import { putExercises } from '../services/exerciseDbStore';
import { getDaysSinceSync } from '../services/exerciseService';
import { muscleToBodyPart } from '../data/bodyPartToMusculos';

const EXERCISES_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const REFRESH_DAYS = 7;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function getFolderFromImages(images) {
  if (!images || !images.length) return null;
  return images[0].split('/')[0];
}

function transformExercise(raw) {
  const folder = getFolderFromImages(raw.images);
  const primaryMuscle = raw.primaryMuscles?.[0] || 'chest';
  return {
    id: slugify(raw.name),
    name: raw.name,
    bodyPart: muscleToBodyPart[primaryMuscle] || 'chest',
    target: primaryMuscle,
    secondaryMuscles: raw.secondaryMuscles || [],
    equipment: raw.equipment || 'body only',
    gifUrl: folder ? `${BASE_URL}/exercises/${folder}/0.jpg` : null,
    level: raw.level || 'intermediate',
    instructions: raw.instructions || [],
  };
}

/**
 * Background prefetch hook. Fetches full exercise catalog into IndexedDB.
 * Non-blocking — silently fails on error.
 *
 * @param {boolean} trigger - Whether to trigger prefetch (e.g., library page mounted)
 */
export function useExercisePrefetch(trigger = false) {
  const fetching = useRef(false);
  const [fetchCount, setFetchCount] = useState(0);

  const doFetch = useCallback(async (force = false) => {
    if (fetching.current) return;

    if (!force) {
      const daysSince = getDaysSinceSync();
      if (daysSince !== null && daysSince < REFRESH_DAYS) return;
    }

    fetching.current = true;
    try {
      const res = await fetch(EXERCISES_URL);
      if (!res.ok) return;

      const rawExercises = await res.json();
      const transformed = rawExercises.map(transformExercise);

      await putExercises(transformed);
      localStorage.setItem('exercisedb_last_sync', new Date().toISOString());

      console.log(`[ExercisePrefetch] Stored ${transformed.length} exercises in IndexedDB`);
    } catch (e) {
      console.warn('[ExercisePrefetch] Failed to prefetch:', e.message);
    } finally {
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    if (!trigger) return;
    doFetch();
  }, [trigger, fetchCount, doFetch]);

  useEffect(() => {
    const handleRefresh = () => {
      localStorage.removeItem('exercisedb_last_sync');
      fetching.current = false;
      setFetchCount(c => c + 1);
    };
    window.addEventListener('exercise-prefetch-request', handleRefresh);
    return () => window.removeEventListener('exercise-prefetch-request', handleRefresh);
  }, []);
}
