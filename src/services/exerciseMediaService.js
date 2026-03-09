/**
 * Exercise Media Service
 * Maps exercises to their media assets (thumbnails and videos)
 */

// Base paths for media assets
const MEDIA_BASE_PATH = '/media/exercises';

// Media mappings for exercises
// Each exercise can have a thumbnail and optionally a video
const exerciseMedia = {
  // Push exercises
  'supino': {
    thumbnail: `${MEDIA_BASE_PATH}/supino-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/supino.mp4`,
    alt: 'Supino reto com barra'
  },
  'supino reto': {
    thumbnail: `${MEDIA_BASE_PATH}/supino-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/supino.mp4`,
    alt: 'Supino reto com barra'
  },
  'supino inclinado': {
    thumbnail: `${MEDIA_BASE_PATH}/supino-inclinado-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/supino-inclinado.mp4`,
    alt: 'Supino inclinado com halteres'
  },
  'desenvolvimento': {
    thumbnail: `${MEDIA_BASE_PATH}/desenvolvimento-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/desenvolvimento.mp4`,
    alt: 'Desenvolvimento de ombros'
  },
  'desenvolvimento arnold': {
    thumbnail: `${MEDIA_BASE_PATH}/desenvolvimento-arnold-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/desenvolvimento-arnold.mp4`,
    alt: 'Desenvolvimento Arnold'
  },
  'elevacao lateral': {
    thumbnail: `${MEDIA_BASE_PATH}/elevacao-lateral-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/elevacao-lateral.mp4`,
    alt: 'Elevacao lateral com halteres'
  },
  'elevacao frontal': {
    thumbnail: `${MEDIA_BASE_PATH}/elevacao-frontal-thumb.jpg`,
    video: null,
    alt: 'Elevacao frontal'
  },
  'crossover': {
    thumbnail: `${MEDIA_BASE_PATH}/crossover-thumb.jpg`,
    video: null,
    alt: 'Crossover na polia'
  },
  'triceps': {
    thumbnail: `${MEDIA_BASE_PATH}/triceps-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/triceps.mp4`,
    alt: 'Triceps na polia'
  },
  'triceps corda': {
    thumbnail: `${MEDIA_BASE_PATH}/triceps-corda-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/triceps-corda.mp4`,
    alt: 'Triceps corda na polia'
  },
  'triceps testa': {
    thumbnail: `${MEDIA_BASE_PATH}/triceps-testa-thumb.jpg`,
    video: null,
    alt: 'Triceps testa'
  },

  // Pull exercises
  'remada': {
    thumbnail: `${MEDIA_BASE_PATH}/remada-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/remada.mp4`,
    alt: 'Remada com barra'
  },
  'remada curvada': {
    thumbnail: `${MEDIA_BASE_PATH}/remada-curvada-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/remada-curvada.mp4`,
    alt: 'Remada curvada com barra'
  },
  'remada sentada': {
    thumbnail: `${MEDIA_BASE_PATH}/remada-sentada-thumb.jpg`,
    video: null,
    alt: 'Remada sentada na polia'
  },
  'puxada': {
    thumbnail: `${MEDIA_BASE_PATH}/puxada-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/puxada.mp4`,
    alt: 'Puxada frontal'
  },
  'puxada frente': {
    thumbnail: `${MEDIA_BASE_PATH}/puxada-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/puxada.mp4`,
    alt: 'Puxada frontal'
  },
  'barra fixa': {
    thumbnail: `${MEDIA_BASE_PATH}/barra-fixa-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/barra-fixa.mp4`,
    alt: 'Barra fixa'
  },
  'barra fixa lastro': {
    thumbnail: `${MEDIA_BASE_PATH}/barra-fixa-lastro-thumb.jpg`,
    video: null,
    alt: 'Barra fixa com lastro'
  },
  'face pull': {
    thumbnail: `${MEDIA_BASE_PATH}/face-pull-thumb.jpg`,
    video: null,
    alt: 'Face pull na polia'
  },
  'rosca direta': {
    thumbnail: `${MEDIA_BASE_PATH}/rosca-direta-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/rosca-direta.mp4`,
    alt: 'Rosca direta com barra'
  },
  'rosca martelo': {
    thumbnail: `${MEDIA_BASE_PATH}/rosca-martelo-thumb.jpg`,
    video: null,
    alt: 'Rosca martelo com halteres'
  },
  'encolhimento': {
    thumbnail: `${MEDIA_BASE_PATH}/encolhimento-thumb.jpg`,
    video: null,
    alt: 'Encolhimento de ombros'
  },

  // Leg exercises
  'agachamento': {
    thumbnail: `${MEDIA_BASE_PATH}/agachamento-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/agachamento.mp4`,
    alt: 'Agachamento livre com barra'
  },
  'agachamento bulgaro': {
    thumbnail: `${MEDIA_BASE_PATH}/agachamento-bulgaro-thumb.jpg`,
    video: null,
    alt: 'Agachamento bulgaro'
  },
  'stiff': {
    thumbnail: `${MEDIA_BASE_PATH}/stiff-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/stiff.mp4`,
    alt: 'Stiff com barra'
  },
  'leg press': {
    thumbnail: `${MEDIA_BASE_PATH}/leg-press-thumb.jpg`,
    video: `${MEDIA_BASE_PATH}/leg-press.mp4`,
    alt: 'Leg press 45 graus'
  },
  'cadeira extensora': {
    thumbnail: `${MEDIA_BASE_PATH}/cadeira-extensora-thumb.jpg`,
    video: null,
    alt: 'Cadeira extensora'
  },
  'extensora': {
    thumbnail: `${MEDIA_BASE_PATH}/cadeira-extensora-thumb.jpg`,
    video: null,
    alt: 'Cadeira extensora'
  },
  'mesa flexora': {
    thumbnail: `${MEDIA_BASE_PATH}/mesa-flexora-thumb.jpg`,
    video: null,
    alt: 'Mesa flexora'
  },
  'hip thrust': {
    thumbnail: `${MEDIA_BASE_PATH}/hip-thrust-thumb.jpg`,
    video: null,
    alt: 'Hip thrust'
  },
  'panturrilha': {
    thumbnail: `${MEDIA_BASE_PATH}/panturrilha-thumb.jpg`,
    video: null,
    alt: 'Panturrilha em pe'
  }
};

// Normalize exercise name for lookup
function normalizeExerciseName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[0-9×x]+/g, '') // Remove sets/reps like "4×8"
    .trim();
}

// Find best match for an exercise name
function findExerciseMatch(exerciseName) {
  const normalized = normalizeExerciseName(exerciseName);

  // Try exact match first
  if (exerciseMedia[normalized]) {
    return exerciseMedia[normalized];
  }

  // Try partial match - check if normalized name starts with any key
  for (const key of Object.keys(exerciseMedia)) {
    if (normalized.startsWith(key) || key.startsWith(normalized)) {
      return exerciseMedia[key];
    }
  }

  // Try finding key as substring
  for (const key of Object.keys(exerciseMedia)) {
    if (normalized.includes(key)) {
      return exerciseMedia[key];
    }
  }

  return null;
}

/**
 * Get media info for an exercise
 * @param {string} exerciseName - The exercise name (can include sets/reps)
 * @returns {Object|null} Media info with thumbnail, video, alt text or null if not found
 */
export function getExerciseMedia(exerciseName) {
  return findExerciseMatch(exerciseName);
}

/**
 * Get thumbnail URL for an exercise
 * @param {string} exerciseName - The exercise name
 * @returns {string|null} Thumbnail URL or null
 */
export function getExerciseThumbnail(exerciseName) {
  const media = findExerciseMatch(exerciseName);
  return media?.thumbnail || null;
}

/**
 * Get video URL for an exercise
 * @param {string} exerciseName - The exercise name
 * @returns {string|null} Video URL or null
 */
export function getExerciseVideo(exerciseName) {
  const media = findExerciseMatch(exerciseName);
  return media?.video || null;
}

/**
 * Check if an exercise has a video
 * @param {string} exerciseName - The exercise name
 * @returns {boolean}
 */
export function hasExerciseVideo(exerciseName) {
  const media = findExerciseMatch(exerciseName);
  return !!media?.video;
}

/**
 * Get placeholder image for exercises without media
 * @param {string} category - Exercise category (push, pull, legs)
 * @returns {string} Placeholder image URL
 */
export function getPlaceholderImage(category = 'default') {
  const placeholders = {
    push: `${MEDIA_BASE_PATH}/placeholder-push.svg`,
    pull: `${MEDIA_BASE_PATH}/placeholder-pull.svg`,
    legs: `${MEDIA_BASE_PATH}/placeholder-legs.svg`,
    default: `${MEDIA_BASE_PATH}/placeholder-exercise.svg`
  };
  return placeholders[category] || placeholders.default;
}

/**
 * Categorize an exercise based on its name
 * @param {string} exerciseName - The exercise name
 * @returns {string} Category: 'push', 'pull', 'legs', or 'default'
 */
export function categorizeExercise(exerciseName) {
  const normalized = normalizeExerciseName(exerciseName);

  const pushExercises = ['supino', 'desenvolvimento', 'elevacao', 'crossover', 'triceps'];
  const pullExercises = ['remada', 'puxada', 'barra fixa', 'rosca', 'face pull', 'encolhimento'];
  const legExercises = ['agachamento', 'stiff', 'leg press', 'extensora', 'flexora', 'hip thrust', 'panturrilha'];

  for (const ex of pushExercises) {
    if (normalized.includes(ex)) return 'push';
  }
  for (const ex of pullExercises) {
    if (normalized.includes(ex)) return 'pull';
  }
  for (const ex of legExercises) {
    if (normalized.includes(ex)) return 'legs';
  }

  return 'default';
}

/**
 * Preload media for exercises (for performance)
 * @param {string[]} exerciseNames - Array of exercise names to preload
 */
export function preloadExerciseMedia(exerciseNames) {
  exerciseNames.forEach(name => {
    const media = getExerciseMedia(name);
    if (media?.thumbnail) {
      const img = new Image();
      img.src = media.thumbnail;
    }
  });
}

export default {
  getExerciseMedia,
  getExerciseThumbnail,
  getExerciseVideo,
  hasExerciseVideo,
  getPlaceholderImage,
  categorizeExercise,
  preloadExerciseMedia
};
