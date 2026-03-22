import { describe, it, expect } from 'vitest';
import bundle from '../exerciseBundle.json';

describe('exerciseBundle', () => {
  it('contains between 100 and 250 exercises', () => {
    expect(bundle.length).toBeGreaterThan(100);
    expect(bundle.length).toBeLessThan(250);
  });

  it('every exercise has the normalized shape', () => {
    const requiredFields = ['id', 'name', 'bodyPart', 'target', 'secondaryMuscles', 'equipment', 'level'];
    bundle.forEach(ex => {
      requiredFields.forEach(field => {
        expect(ex).toHaveProperty(field);
      });
      expect(typeof ex.id).toBe('string');
      expect(typeof ex.name).toBe('string');
      expect(Array.isArray(ex.secondaryMuscles)).toBe(true);
    });
  });

  it('covers all major body parts', () => {
    const bodyParts = new Set(bundle.map(e => e.bodyPart));
    ['chest', 'back', 'shoulders', 'upper arms', 'upper legs', 'lower legs', 'waist'].forEach(bp => {
      expect(bodyParts.has(bp)).toBe(true);
    });
  });

  it('has no duplicate IDs', () => {
    const ids = bundle.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes bodyweight exercises', () => {
    const bodyweight = bundle.filter(e => e.equipment === 'body only');
    expect(bodyweight.length).toBeGreaterThan(10);
  });
});
