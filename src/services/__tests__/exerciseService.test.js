import { describe, it, expect, beforeEach } from 'vitest';
import { getById, search, getBundleExercises, isFullCatalogAvailable, getDaysSinceSync } from '../exerciseService';

describe('exerciseService', () => {
  describe('getById', () => {
    it('returns exercise from bundle for known ID', async () => {
      const bundleExercises = getBundleExercises();
      if (bundleExercises.length === 0) return;
      const firstId = bundleExercises[0].id;
      const result = await getById(firstId);
      expect(result.id).toBe(firstId);
      expect(result._degraded).toBeUndefined();
    });

    it('returns degraded exercise for unknown ID', async () => {
      const result = await getById('completely_nonexistent_exercise_xyz');
      expect(result._degraded).toBe(true);
      expect(result.id).toBe('completely_nonexistent_exercise_xyz');
    });

    it('resolves legacy IDs via exerciseIdMap', async () => {
      const result = await getById('supino_reto');
      expect(result.name).toBeDefined();
    });
  });

  describe('search', () => {
    it('returns immediate results from bundle', () => {
      const { immediate } = search('bench');
      expect(Array.isArray(immediate)).toBe(true);
    });

    it('returns all bundle exercises with empty query and no filters', () => {
      const { immediate } = search();
      expect(immediate.length).toBe(getBundleExercises().length);
    });

    it('filters by bodyPart', () => {
      const { immediate } = search('', { bodyParts: ['chest'] });
      immediate.forEach(ex => {
        expect(ex.bodyPart).toBe('chest');
      });
    });

    it('filters by equipment', () => {
      const { immediate } = search('', { equipment: ['barbell'] });
      immediate.forEach(ex => {
        expect(['barbell', 'e-z curl bar']).toContain(ex.equipment);
      });
    });

    it('combines query and filters', () => {
      const { immediate } = search('press', { bodyParts: ['chest'] });
      immediate.forEach(ex => {
        expect(ex.bodyPart).toBe('chest');
        expect(ex.name.toLowerCase()).toContain('press');
      });
    });

    it('asyncResults resolves to an array', async () => {
      const { asyncResults } = search('bench');
      const results = await asyncResults;
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getDaysSinceSync', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('returns null when no sync has occurred', () => {
      expect(getDaysSinceSync()).toBeNull();
    });

    it('returns 0 for today sync', () => {
      localStorage.setItem('exercisedb_last_sync', new Date().toISOString());
      expect(getDaysSinceSync()).toBe(0);
    });
  });
});
