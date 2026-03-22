/**
 * Maps free-exercise-db primaryMuscles values to Portuguese muscleColors keys.
 * Every value MUST be a valid key in muscleColors from design.js:
 * "Peito", "Costas", "Ombros", "Bíceps", "Tríceps", "Quadríceps",
 * "Posterior", "Glúteos", "Panturrilhas", "Trapézio"
 */
export const bodyPartToMusculos = {
  chest: ['Peito'],
  shoulders: ['Ombros'],
  triceps: ['Tríceps'],
  biceps: ['Bíceps'],
  forearms: ['Bíceps'],
  lats: ['Costas'],
  'middle back': ['Costas', 'Trapézio'],
  'lower back': ['Costas'],
  traps: ['Trapézio'],
  neck: ['Trapézio'],
  quadriceps: ['Quadríceps'],
  hamstrings: ['Posterior'],
  glutes: ['Glúteos'],
  calves: ['Panturrilhas'],
  abdominals: ['Peito'],
  adductors: ['Quadríceps'],
  abductors: ['Glúteos'],
};

export const equipmentMap = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  cable: 'cable',
  machine: 'machine',
  'body only': 'bodyweight',
  'e-z curl bar': 'barbell',
  kettlebells: 'dumbbell',
  bands: 'band',
  'medicine ball': 'bodyweight',
  'exercise ball': 'bodyweight',
  foam_roll: 'bodyweight',
  other: 'bodyweight',
};

export const muscleToBodyPart = {
  chest: 'chest',
  shoulders: 'shoulders',
  triceps: 'upper arms',
  biceps: 'upper arms',
  forearms: 'lower arms',
  lats: 'back',
  'middle back': 'back',
  'lower back': 'back',
  traps: 'back',
  neck: 'back',
  quadriceps: 'upper legs',
  hamstrings: 'upper legs',
  glutes: 'upper legs',
  calves: 'lower legs',
  abdominals: 'waist',
  adductors: 'upper legs',
  abductors: 'upper legs',
};

export const filterToBodyParts = {
  Chest: ['chest'],
  Back: ['back'],
  Shoulders: ['shoulders'],
  Arms: ['upper arms', 'lower arms'],
  Legs: ['upper legs', 'lower legs'],
  Core: ['waist'],
};

export function toMusculos(primaryMuscles, secondaryMuscles = []) {
  const all = [...primaryMuscles, ...secondaryMuscles];
  const result = new Set();
  all.forEach(m => {
    const mapped = bodyPartToMusculos[m.toLowerCase()];
    if (mapped) mapped.forEach(v => result.add(v));
  });
  return [...result];
}
