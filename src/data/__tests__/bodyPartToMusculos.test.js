import { describe, it, expect } from 'vitest';
import { bodyPartToMusculos, toMusculos, muscleToBodyPart, equipmentMap } from '../bodyPartToMusculos';
import { muscleColors } from '../design';

describe('bodyPartToMusculos', () => {
  it('every mapped value is a valid muscleColors key', () => {
    const validKeys = Object.keys(muscleColors);
    Object.values(bodyPartToMusculos).flat().forEach(val => {
      expect(validKeys).toContain(val);
    });
  });
});

describe('toMusculos', () => {
  it('maps chest to Peito', () => {
    expect(toMusculos(['chest'])).toEqual(['Peito']);
  });

  it('maps multiple muscles without duplicates', () => {
    const result = toMusculos(['quadriceps'], ['glutes', 'hamstrings']);
    expect(result).toContain('Quadríceps');
    expect(result).toContain('Glúteos');
    expect(result).toContain('Posterior');
  });

  it('returns empty array for unknown muscles', () => {
    expect(toMusculos(['unknown_muscle'])).toEqual([]);
  });
});

describe('muscleToBodyPart', () => {
  it('maps all known muscles to a bodyPart category', () => {
    Object.keys(bodyPartToMusculos).forEach(muscle => {
      expect(muscleToBodyPart[muscle]).toBeDefined();
    });
  });
});

describe('equipmentMap', () => {
  it('maps body only to bodyweight', () => {
    expect(equipmentMap['body only']).toBe('bodyweight');
  });
});
