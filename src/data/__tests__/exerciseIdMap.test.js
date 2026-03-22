import { describe, it, expect } from 'vitest';
import { exerciseIdMap, getExerciseDbName } from '../exerciseIdMap';

describe('exerciseIdMap', () => {
  it('maps all 36 legacy exercise IDs', () => {
    expect(Object.keys(exerciseIdMap).length).toBe(36);
  });

  it('returns folder name for known ID', () => {
    expect(getExerciseDbName('supino_reto')).toBe('Barbell_Bench_Press_-_Medium_Grip');
  });

  it('returns null for unknown ID', () => {
    expect(getExerciseDbName('nonexistent')).toBeNull();
  });

  it('every mapped value is a non-empty string', () => {
    Object.values(exerciseIdMap).forEach(val => {
      expect(typeof val).toBe('string');
      expect(val.length).toBeGreaterThan(0);
    });
  });
});
