import { describe, it, expect, beforeEach } from 'vitest';
import { putExercise, putExercises, getExercise, getAllExercises, getExerciseCount, clearExercises } from '../exerciseDbStore';

const mockExercise = {
  id: 'test_bench_press',
  name: 'Test Bench Press',
  bodyPart: 'chest',
  target: 'chest',
  secondaryMuscles: ['shoulders'],
  equipment: 'barbell',
  gifUrl: null,
  level: 'beginner',
  instructions: [],
};

describe('exerciseDbStore', () => {
  beforeEach(async () => {
    await clearExercises();
  });

  it('stores and retrieves a single exercise', async () => {
    await putExercise(mockExercise);
    const result = await getExercise('test_bench_press');
    expect(result).toEqual(mockExercise);
  });

  it('stores multiple exercises in batch', async () => {
    const exercises = [
      mockExercise,
      { ...mockExercise, id: 'test_squat', name: 'Test Squat', bodyPart: 'upper legs' },
    ];
    await putExercises(exercises);
    const count = await getExerciseCount();
    expect(count).toBe(2);
  });

  it('returns undefined for missing exercise', async () => {
    const result = await getExercise('nonexistent');
    expect(result).toBeUndefined();
  });

  it('getAllExercises returns all stored exercises', async () => {
    await putExercise(mockExercise);
    const all = await getAllExercises();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('test_bench_press');
  });
});
