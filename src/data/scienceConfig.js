/**
 * Science-Based Training Configuration
 *
 * Volume guidelines based on:
 * - ACSM Position Stand on Resistance Training (2009, 2011)
 * - Renaissance Periodization (Dr. Mike Israetel) volume landmarks
 * - Brad Schoenfeld meta-analyses on hypertrophy dose-response
 *
 * All volumes are in SETS PER MUSCLE GROUP PER WEEK.
 */

// ─── Volume Landmarks per Muscle Group ───
// MV  = Maintenance Volume (minimum to not lose gains)
// MEV = Minimum Effective Volume (minimum to make progress)
// MAV = Maximum Adaptive Volume (sweet spot for most people)
// MRV = Maximum Recoverable Volume (ceiling before overtraining)
// Values indexed by experience level.

export const VOLUME_LANDMARKS = {
  chest:       { beginner: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, intermediate: { MV: 8,  MEV: 10, MAV: 16, MRV: 20 }, advanced: { MV: 8,  MEV: 12, MAV: 18, MRV: 22 } },
  back:        { beginner: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, intermediate: { MV: 8,  MEV: 10, MAV: 16, MRV: 20 }, advanced: { MV: 10, MEV: 12, MAV: 18, MRV: 22 } },
  shoulders:   { beginner: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, intermediate: { MV: 6,  MEV: 8,  MAV: 14, MRV: 18 }, advanced: { MV: 6,  MEV: 8,  MAV: 16, MRV: 20 } },
  quads:       { beginner: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, intermediate: { MV: 8,  MEV: 10, MAV: 14, MRV: 18 }, advanced: { MV: 8,  MEV: 12, MAV: 16, MRV: 20 } },
  hamstrings:  { beginner: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, intermediate: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, advanced: { MV: 6,  MEV: 8,  MAV: 14, MRV: 18 } },
  glutes:      { beginner: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, intermediate: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, advanced: { MV: 6,  MEV: 10, MAV: 14, MRV: 18 } },
  biceps:      { beginner: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, intermediate: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, advanced: { MV: 6,  MEV: 8,  MAV: 14, MRV: 20 } },
  triceps:     { beginner: { MV: 4,  MEV: 6,  MAV: 8,  MRV: 12 }, intermediate: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, advanced: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 } },
  calves:      { beginner: { MV: 4,  MEV: 6,  MAV: 10, MRV: 14 }, intermediate: { MV: 6,  MEV: 8,  MAV: 12, MRV: 16 }, advanced: { MV: 8,  MEV: 10, MAV: 14, MRV: 18 } },
  abs:         { beginner: { MV: 0,  MEV: 4,  MAV: 8,  MRV: 14 }, intermediate: { MV: 0,  MEV: 6,  MAV: 10, MRV: 16 }, advanced: { MV: 0,  MEV: 6,  MAV: 12, MRV: 18 } },
  traps:       { beginner: { MV: 0,  MEV: 4,  MAV: 8,  MRV: 12 }, intermediate: { MV: 0,  MEV: 6,  MAV: 10, MRV: 14 }, advanced: { MV: 0,  MEV: 6,  MAV: 12, MRV: 16 } },
};

// ─── Map UI muscle keys to internal scienceConfig keys ───
// Users select from these in the priority muscle picker
export const PRIORITY_MUSCLE_OPTIONS = [
  { key: 'chest',      labelKey: 'muscle_chest',      icon: 'dumbbell-1' },
  { key: 'back',       labelKey: 'muscle_back',       icon: 'dumbbell-1' },
  { key: 'shoulders',  labelKey: 'muscle_shoulders',  icon: 'dumbbell-1' },
  { key: 'quads',      labelKey: 'muscle_quads',      icon: 'dumbbell-1' },
  { key: 'hamstrings', labelKey: 'muscle_hamstrings',  icon: 'dumbbell-1' },
  { key: 'glutes',     labelKey: 'muscle_glutes',     icon: 'dumbbell-1' },
  { key: 'biceps',     labelKey: 'muscle_biceps',     icon: 'dumbbell-1' },
  { key: 'triceps',    labelKey: 'muscle_triceps',    icon: 'dumbbell-1' },
  { key: 'calves',     labelKey: 'muscle_calves',     icon: 'dumbbell-1' },
  { key: 'abs',        labelKey: 'muscle_abs',        icon: 'dumbbell-1' },
];

// ─── Movement Pattern Classification ───
// Each pattern maps to exercise bodyPart/target values from our exercise bundles.
// Order within a session: compound patterns first, isolation last.

export const MOVEMENT_PATTERNS = {
  horizontal_push: {
    bodyParts: ['chest'],
    targets: ['pectorals', 'chest'],
    isCompound: true,
    order: 1,
  },
  vertical_push: {
    bodyParts: ['shoulders'],
    targets: ['delts', 'shoulders'],
    isCompound: true,
    order: 2,
  },
  horizontal_pull: {
    bodyParts: ['back'],
    targets: ['lats', 'upper back', 'middle back'],
    isCompound: true,
    order: 3,
  },
  vertical_pull: {
    bodyParts: ['back'],
    targets: ['lats'],
    isCompound: true,
    order: 4,
  },
  knee_dominant: {
    bodyParts: ['upper legs'],
    targets: ['quads', 'quadriceps', 'glutes'],
    isCompound: true,
    order: 5,
  },
  hip_hinge: {
    bodyParts: ['upper legs'],
    targets: ['hamstrings', 'glutes'],
    isCompound: true,
    order: 6,
  },
  isolation_chest: {
    bodyParts: ['chest'],
    targets: ['pectorals', 'chest'],
    isCompound: false,
    order: 10,
  },
  isolation_shoulder: {
    bodyParts: ['shoulders'],
    targets: ['delts', 'shoulders'],
    isCompound: false,
    order: 11,
  },
  isolation_back: {
    bodyParts: ['back'],
    targets: ['lats', 'upper back'],
    isCompound: false,
    order: 12,
  },
  isolation_biceps: {
    bodyParts: ['upper arms'],
    targets: ['biceps'],
    isCompound: false,
    order: 13,
  },
  isolation_triceps: {
    bodyParts: ['upper arms'],
    targets: ['triceps'],
    isCompound: false,
    order: 14,
  },
  isolation_quads: {
    bodyParts: ['upper legs'],
    targets: ['quads', 'quadriceps'],
    isCompound: false,
    order: 15,
  },
  isolation_hamstrings: {
    bodyParts: ['upper legs'],
    targets: ['hamstrings'],
    isCompound: false,
    order: 16,
  },
  isolation_glutes: {
    bodyParts: ['upper legs'],
    targets: ['glutes', 'abductors'],
    isCompound: false,
    order: 17,
  },
  isolation_calves: {
    bodyParts: ['lower legs'],
    targets: ['calves'],
    isCompound: false,
    order: 18,
  },
  isolation_abs: {
    bodyParts: ['waist'],
    targets: ['abs', 'abdominals'],
    isCompound: false,
    order: 19,
  },
};

// ─── Classify an exercise into a movement pattern ───
export function classifyExercise(exercise) {
  const bp = (exercise.bodyPart || '').toLowerCase();
  const tgt = (exercise.target || '').toLowerCase();
  const name = (exercise.name || '').toLowerCase();
  const equip = (exercise.equipment || '').toLowerCase();

  // Compound detection heuristics
  const compoundKeywords = ['squat', 'deadlift', 'press', 'row', 'pull-up', 'pulldown', 'dip', 'lunge', 'thrust', 'clean', 'snatch'];
  const isolationKeywords = ['curl', 'extension', 'fly', 'raise', 'kickback', 'pushdown', 'crossover', 'pullover', 'shrug', 'crunch', 'sit-up', 'plank'];
  const isLikelyCompound = compoundKeywords.some(kw => name.includes(kw));
  const isLikelyIsolation = isolationKeywords.some(kw => name.includes(kw));

  // Chest
  if (bp === 'chest' || tgt === 'pectorals') {
    if (isLikelyCompound || name.includes('press') || name.includes('dip')) return 'horizontal_push';
    return 'isolation_chest';
  }
  // Shoulders
  if (bp === 'shoulders' || tgt === 'delts') {
    if (name.includes('press') || name.includes('push')) return 'vertical_push';
    return 'isolation_shoulder';
  }
  // Back
  if (bp === 'back' || tgt === 'lats' || tgt === 'upper back' || tgt === 'traps') {
    if (name.includes('pull') || name.includes('pulldown') || name.includes('chin')) return 'vertical_pull';
    if (name.includes('row') || name.includes('deadlift') || name.includes('shrug')) return 'horizontal_pull';
    return 'isolation_back';
  }
  // Upper legs
  if (bp === 'upper legs') {
    if (tgt === 'hamstrings') {
      if (name.includes('deadlift') || name.includes('thrust') || name.includes('good morning')) return 'hip_hinge';
      return 'isolation_hamstrings';
    }
    if (tgt === 'glutes') {
      if (name.includes('squat') || name.includes('lunge') || name.includes('thrust')) return 'hip_hinge';
      return 'isolation_glutes';
    }
    if (tgt === 'adductors' || tgt === 'abductors') return 'isolation_glutes';
    // Default quads
    if (isLikelyCompound || name.includes('squat') || name.includes('press') || name.includes('lunge')) return 'knee_dominant';
    return 'isolation_quads';
  }
  // Arms
  if (bp === 'upper arms') {
    if (tgt === 'triceps') return 'isolation_triceps';
    return 'isolation_biceps';
  }
  if (bp === 'lower arms') return 'isolation_biceps';
  // Lower legs
  if (bp === 'lower legs') return 'isolation_calves';
  // Core
  if (bp === 'waist') return 'isolation_abs';

  return null; // Unclassifiable
}

// ─── Equipment Sets ───
// Map SmartPlan equipment choice to allowed equipment types from exercise data.
export const EQUIPMENT_SETS = {
  full_gym: ['barbell', 'dumbbell', 'cable', 'machine', 'body only', 'e-z curl bar', 'kettlebells', 'bands', 'medicine ball', 'exercise ball', 'other', 'leverage machine', 'smith machine'],
  home: ['dumbbell', 'body only', 'bands', 'kettlebells', 'medicine ball', 'exercise ball', 'other'],
  minimal: ['body only', 'bands', 'other'],
};

// ─── Split Templates ───
// Dynamic split assignment based on training days/week.
// Each entry defines which muscle groups are trained on each day.

export const SPLIT_TEMPLATES = {
  2: {
    type: 'Full Body',
    sessions: [
      { name: 'Full Body A', muscles: ['chest', 'back', 'quads', 'shoulders', 'biceps', 'triceps', 'abs'], focus: { 'pt-BR': 'Corpo Inteiro A', en: 'Full Body A' }, icon: 'dumbbell-1' },
      { name: 'Full Body B', muscles: ['chest', 'back', 'hamstrings', 'glutes', 'shoulders', 'calves', 'abs'], focus: { 'pt-BR': 'Corpo Inteiro B', en: 'Full Body B' }, icon: 'dumbbell-1' },
    ],
  },
  3: {
    type: 'Full Body',
    sessions: [
      { name: 'Full Body A', muscles: ['chest', 'back', 'quads', 'shoulders', 'triceps'], focus: { 'pt-BR': 'Corpo Inteiro A', en: 'Full Body A' }, icon: 'dumbbell-1' },
      { name: 'Full Body B', muscles: ['back', 'hamstrings', 'glutes', 'biceps', 'calves'], focus: { 'pt-BR': 'Corpo Inteiro B', en: 'Full Body B' }, icon: 'dumbbell-1' },
      { name: 'Full Body C', muscles: ['chest', 'quads', 'shoulders', 'abs', 'triceps'], focus: { 'pt-BR': 'Corpo Inteiro C', en: 'Full Body C' }, icon: 'dumbbell-1' },
    ],
  },
  '3_ppl': {
    type: 'PPL',
    sessions: [
      { name: 'Push', muscles: ['chest', 'shoulders', 'triceps'], focus: { 'pt-BR': 'Peito, Ombro, Tríceps', en: 'Chest, Shoulders, Triceps' }, icon: 'dumbbell-1' },
      { name: 'Pull', muscles: ['back', 'biceps', 'traps'], focus: { 'pt-BR': 'Costas, Bíceps', en: 'Back, Biceps' }, icon: 'dumbbell-1' },
      { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'], focus: { 'pt-BR': 'Pernas', en: 'Legs' }, icon: 'dumbbell-1' },
    ],
  },
  4: {
    type: 'Upper/Lower',
    sessions: [
      { name: 'Upper A', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], focus: { 'pt-BR': 'Superior A', en: 'Upper A' }, icon: 'dumbbell-1' },
      { name: 'Lower A', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'], focus: { 'pt-BR': 'Inferior A', en: 'Lower A' }, icon: 'dumbbell-1' },
      { name: 'Upper B', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], focus: { 'pt-BR': 'Superior B', en: 'Upper B' }, icon: 'dumbbell-1' },
      { name: 'Lower B', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'], focus: { 'pt-BR': 'Inferior B', en: 'Lower B' }, icon: 'dumbbell-1' },
    ],
  },
  5: {
    type: 'ULPPL',
    sessions: [
      { name: 'Upper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], focus: { 'pt-BR': 'Superior', en: 'Upper' }, icon: 'dumbbell-1' },
      { name: 'Lower', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'], focus: { 'pt-BR': 'Inferior', en: 'Lower' }, icon: 'dumbbell-1' },
      { name: 'Push', muscles: ['chest', 'shoulders', 'triceps'], focus: { 'pt-BR': 'Push', en: 'Push' }, icon: 'dumbbell-1' },
      { name: 'Pull', muscles: ['back', 'biceps', 'traps'], focus: { 'pt-BR': 'Pull', en: 'Pull' }, icon: 'dumbbell-1' },
      { name: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'], focus: { 'pt-BR': 'Pernas', en: 'Legs' }, icon: 'dumbbell-1' },
    ],
  },
  6: {
    type: 'PPL',
    sessions: [
      { name: 'Push A', muscles: ['chest', 'shoulders', 'triceps'], focus: { 'pt-BR': 'Push A', en: 'Push A' }, icon: 'dumbbell-1' },
      { name: 'Pull A', muscles: ['back', 'biceps', 'traps'], focus: { 'pt-BR': 'Pull A', en: 'Pull A' }, icon: 'dumbbell-1' },
      { name: 'Legs A', muscles: ['quads', 'hamstrings', 'glutes', 'calves'], focus: { 'pt-BR': 'Legs A', en: 'Legs A' }, icon: 'dumbbell-1' },
      { name: 'Push B', muscles: ['chest', 'shoulders', 'triceps'], focus: { 'pt-BR': 'Push B', en: 'Push B' }, icon: 'dumbbell-1' },
      { name: 'Pull B', muscles: ['back', 'biceps', 'traps'], focus: { 'pt-BR': 'Pull B', en: 'Pull B' }, icon: 'dumbbell-1' },
      { name: 'Legs B', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'], focus: { 'pt-BR': 'Legs B', en: 'Legs B' }, icon: 'dumbbell-1' },
    ],
  },
};

// ─── Map muscle keys to exercise bodyPart values ───
// Used to filter exercises from our bundles by muscle group.
export const MUSCLE_TO_BODY_PARTS = {
  chest:      ['chest'],
  back:       ['back'],
  shoulders:  ['shoulders'],
  quads:      ['upper legs'],
  hamstrings: ['upper legs'],
  glutes:     ['upper legs'],
  biceps:     ['upper arms'],
  triceps:    ['upper arms'],
  calves:     ['lower legs'],
  abs:        ['waist'],
  traps:      ['back'],
};

// Target refinements — when bodyPart matches multiple muscles,
// use the target field to disambiguate.
export const MUSCLE_TO_TARGETS = {
  chest:      ['pectorals', 'chest'],
  back:       ['lats', 'upper back', 'traps', 'spine'],
  shoulders:  ['delts', 'shoulders', 'serratus anterior'],
  quads:      ['quads', 'quadriceps'],
  hamstrings: ['hamstrings'],
  glutes:     ['glutes', 'abductors', 'adductors'],
  biceps:     ['biceps'],
  triceps:    ['triceps'],
  calves:     ['calves'],
  abs:        ['abs', 'abdominals'],
  traps:      ['traps', 'levator scapulae'],
};

// ─── Rep Ranges by Goal ───
export const REP_RANGES = {
  muscle: {
    compound:  { min: 6, max: 12, targetRpe: 7.5, rest: 120 },
    isolation: { min: 10, max: 15, targetRpe: 8, rest: 75 },
  },
  strength: {
    compound:  { min: 3, max: 6, targetRpe: 8.5, rest: 180 },
    isolation: { min: 8, max: 12, targetRpe: 7.5, rest: 90 },
  },
  fat_loss: {
    compound:  { min: 8, max: 15, targetRpe: 7, rest: 60 },
    isolation: { min: 12, max: 20, targetRpe: 7, rest: 45 },
  },
  endurance: {
    compound:  { min: 12, max: 20, targetRpe: 6.5, rest: 45 },
    isolation: { min: 15, max: 25, targetRpe: 6.5, rest: 30 },
  },
  general: {
    compound:  { min: 8, max: 12, targetRpe: 7, rest: 90 },
    isolation: { min: 10, max: 15, targetRpe: 7, rest: 60 },
  },
};

// ─── Sets per Exercise by Goal ───
export const SETS_CONFIG = {
  muscle:    { compound: 4, isolation: 3 },
  strength:  { compound: 5, isolation: 3 },
  fat_loss:  { compound: 3, isolation: 3 },
  endurance: { compound: 3, isolation: 2 },
  general:   { compound: 3, isolation: 3 },
};

// ─── Progression Models ───
export const PROGRESSION_MODELS = {
  beginner: {
    type: 'linear',
    description: { 'pt-BR': 'Progressão Linear: aumente peso a cada sessão', en: 'Linear Progression: add weight every session' },
  },
  intermediate: {
    type: 'double',
    description: { 'pt-BR': 'Progressão Dupla: aumente reps, depois peso', en: 'Double Progression: increase reps, then weight' },
  },
  advanced: {
    type: 'periodized',
    description: { 'pt-BR': 'Periodização: cicle volume e intensidade', en: 'Periodization: cycle volume and intensity' },
  },
};

// ─── Duration Constraints ───
// Approximate minutes per exercise (including rest between sets)
export const MINUTES_PER_EXERCISE = {
  compound: 10,  // ~4 sets, 45s work + 120s rest + 30s transition
  isolation: 6,  // ~3 sets, 30s work + 60s rest + 30s transition
};

// Calculate realistic minutes per exercise based on sets and rest
export function estimateExerciseMinutes(sets, restSeconds, isCompound) {
  const setDuration = isCompound ? 45 : 30; // seconds per working set
  const transitionTime = 30; // seconds to set up / move between exercises
  const totalSeconds = (sets * (setDuration + restSeconds)) + transitionTime;
  return totalSeconds / 60;
}
