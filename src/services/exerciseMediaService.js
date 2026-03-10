/**
 * Exercise Media Service
 * Maps exercises to their media assets from free-exercise-db
 * Uses start/end position images for clear visual guidance
 *
 * Source: https://github.com/yuhonas/free-exercise-db
 */

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Map Portuguese exercise names to free-exercise-db folder names
const exerciseMap = {
  // Push exercises - Chest
  'supino': 'Barbell_Bench_Press_-_Medium_Grip',
  'supino reto': 'Barbell_Bench_Press_-_Medium_Grip',
  'supino inclinado': 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  'supino declinado': 'Decline_Barbell_Bench_Press',
  'crucifixo': 'Dumbbell_Flyes',
  'crossover': 'Cable_Crossover',
  'fly': 'Dumbbell_Flyes',
  'flexao': 'Pushups',
  'push up': 'Pushups',
  'flexão': 'Pushups',

  // Push exercises - Shoulders
  'desenvolvimento': 'Standing_Military_Press',
  'desenvolvimento militar': 'Standing_Military_Press',
  'desenvolvimento arnold': 'Arnold_Dumbbell_Press',
  'elevacao lateral': 'Side_Lateral_Raise',
  'elevação lateral': 'Side_Lateral_Raise',
  'elevacao frontal': 'Front_Dumbbell_Raise',
  'elevação frontal': 'Front_Dumbbell_Raise',

  // Push exercises - Triceps
  'triceps': 'Triceps_Pushdown',
  'tríceps': 'Triceps_Pushdown',
  'triceps corda': 'Triceps_Pushdown_-_Rope_Attachment',
  'triceps testa': 'Lying_Triceps_Press',
  'triceps pulley': 'Triceps_Pushdown',
  'triceps frances': 'Standing_Dumbbell_Triceps_Extension',
  'mergulho': 'Dips_-_Triceps_Version',

  // Pull exercises - Back
  'remada': 'Bent_Over_Barbell_Row',
  'remada curvada': 'Bent_Over_Barbell_Row',
  'remada sentada': 'Seated_Cable_Rows',
  'remada cavalinho': 'T-Bar_Row_with_Handle',
  'remada unilateral': 'One-Arm_Dumbbell_Row',
  'puxada': 'Wide-Grip_Lat_Pulldown',
  'puxada frente': 'Wide-Grip_Lat_Pulldown',
  'puxada frontal': 'Wide-Grip_Lat_Pulldown',
  'barra fixa': 'Pullups',
  'barra fixa lastro': 'Pullups',
  'pulldown': 'Wide-Grip_Lat_Pulldown',
  'face pull': 'Face_Pull',
  'encolhimento': 'Barbell_Shrug',

  // Pull exercises - Biceps
  'rosca direta': 'Barbell_Curl',
  'rosca alternada': 'Alternate_Incline_Dumbbell_Curl',
  'rosca martelo': 'Hammer_Curls',
  'rosca concentrada': 'Concentration_Curls',
  'rosca scott': 'Preacher_Curl',

  // Leg exercises - Quads
  'agachamento': 'Barbell_Squat',
  'agachamento livre': 'Barbell_Squat',
  'agachamento bulgaro': 'Single_Leg_Squat',
  'agachamento búlgaro': 'Single_Leg_Squat',
  'leg press': 'Leg_Press',
  'cadeira extensora': 'Leg_Extensions',
  'extensora': 'Leg_Extensions',
  'hack': 'Hack_Squat',
  'afundo': 'Dumbbell_Lunges',
  'passada': 'Dumbbell_Lunges',

  // Leg exercises - Hamstrings/Glutes
  'stiff': 'Stiff-Legged_Barbell_Deadlift',
  'levantamento terra': 'Barbell_Deadlift',
  'terra': 'Barbell_Deadlift',
  'mesa flexora': 'Lying_Leg_Curls',
  'flexora': 'Lying_Leg_Curls',
  'cadeira flexora': 'Seated_Leg_Curl',
  'hip thrust': 'Barbell_Hip_Thrust',
  'elevacao pelvica': 'Barbell_Hip_Thrust',
  'glúteo': 'Glute_Kickback',

  // Leg exercises - Calves
  'panturrilha': 'Standing_Calf_Raises',
  'panturrilha sentado': 'Seated_Calf_Raise',
  'gemeos': 'Standing_Calf_Raises',

  // Core
  'abdominal': 'Crunches',
  'prancha': 'Plank',
  'crunch': 'Crunches',
};

// Normalize exercise name for lookup
function normalizeExerciseName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[0-9×x]+/g, '') // Remove sets/reps like "4×8"
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the exercise folder name
function findExerciseFolder(exerciseName) {
  const normalized = normalizeExerciseName(exerciseName);

  // Try exact match first
  if (exerciseMap[normalized]) {
    return exerciseMap[normalized];
  }

  // Try finding by prefix
  for (const [key, folder] of Object.entries(exerciseMap)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) {
      return folder;
    }
  }

  // Try finding key as substring
  for (const [key, folder] of Object.entries(exerciseMap)) {
    if (normalized.includes(key)) {
      return folder;
    }
  }

  return null;
}

/**
 * Get exercise images (start and end positions)
 * @param {string} exerciseName - The exercise name (can include sets/reps)
 * @returns {Object|null} Object with startImage and endImage URLs
 */
export function getExerciseImages(exerciseName) {
  const folder = findExerciseFolder(exerciseName);
  if (!folder) return null;

  return {
    startImage: `${BASE_URL}/${folder}/0.jpg`,
    endImage: `${BASE_URL}/${folder}/1.jpg`,
    folder: folder
  };
}

/**
 * Get start position image URL
 * @param {string} exerciseName - The exercise name
 * @returns {string|null} Image URL or null
 */
export function getStartImage(exerciseName) {
  const images = getExerciseImages(exerciseName);
  return images?.startImage || null;
}

/**
 * Get end position image URL
 * @param {string} exerciseName - The exercise name
 * @returns {string|null} Image URL or null
 */
export function getEndImage(exerciseName) {
  const images = getExerciseImages(exerciseName);
  return images?.endImage || null;
}

/**
 * Check if exercise has images available
 * @param {string} exerciseName - The exercise name
 * @returns {boolean}
 */
export function hasExerciseImages(exerciseName) {
  return findExerciseFolder(exerciseName) !== null;
}

/**
 * Categorize an exercise based on its name
 * @param {string} exerciseName - The exercise name
 * @returns {string} Category: 'push', 'pull', 'legs', or 'core'
 */
export function categorizeExercise(exerciseName) {
  const normalized = normalizeExerciseName(exerciseName);

  const pushExercises = ['supino', 'desenvolvimento', 'elevacao', 'elevação', 'crossover', 'triceps', 'tríceps', 'crucifixo', 'fly', 'flexao', 'flexão', 'mergulho'];
  const pullExercises = ['remada', 'puxada', 'barra fixa', 'rosca', 'face pull', 'encolhimento', 'pulldown'];
  const legExercises = ['agachamento', 'stiff', 'leg press', 'extensora', 'flexora', 'hip thrust', 'panturrilha', 'gemeos', 'afundo', 'passada', 'hack', 'terra', 'glute'];
  const coreExercises = ['abdominal', 'prancha', 'crunch'];

  for (const ex of pushExercises) {
    if (normalized.includes(ex)) return 'push';
  }
  for (const ex of pullExercises) {
    if (normalized.includes(ex)) return 'pull';
  }
  for (const ex of legExercises) {
    if (normalized.includes(ex)) return 'legs';
  }
  for (const ex of coreExercises) {
    if (normalized.includes(ex)) return 'core';
  }

  return 'default';
}

/**
 * Get category icon (LineIcons name)
 * @param {string} category - Exercise category
 * @returns {string} LineIcons icon name
 */
export function getCategoryIcon(category) {
  const icons = {
    push: 'dumbbell-1',
    pull: 'dumbbell-1',
    legs: 'bolt-alt',
    core: 'target-4',
    default: 'dumbbell-1'
  };
  return icons[category] || icons.default;
}

/**
 * Preload images for exercises (for performance)
 * @param {string[]} exerciseNames - Array of exercise names to preload
 */
export function preloadExerciseImages(exerciseNames) {
  exerciseNames.forEach(name => {
    const images = getExerciseImages(name);
    if (images) {
      const img1 = new Image();
      img1.src = images.startImage;
      const img2 = new Image();
      img2.src = images.endImage;
    }
  });
}

export default {
  getExerciseImages,
  getStartImage,
  getEndImage,
  hasExerciseImages,
  categorizeExercise,
  getCategoryIcon,
  preloadExerciseImages
};
