import exerciseBundle from '../data/exerciseBundle.json';
import yogaExercises from '../data/yogaExercises.json';
import pilatesExercises from '../data/pilatesExercises.json';
import calisthenicsExercises from '../data/calisthenicsExercises.json';
import runningExercises from '../data/runningExercises.json';
import functionalExercises from '../data/functionalExercises.json';
import { exerciseIdMap } from '../data/exerciseIdMap';
import { equipmentMap } from '../data/bodyPartToMusculos';
import * as store from './exerciseDbStore';

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const FETCH_TIMEOUT = 3000;

// Merge all exercise bundles
const allBundles = [
  ...exerciseBundle,
  ...yogaExercises,
  ...pilatesExercises,
  ...calisthenicsExercises,
  ...runningExercises,
  ...functionalExercises,
];

// Build a lookup map from all bundles for O(1) access
const bundleMap = new Map(allBundles.map(ex => [ex.id, ex]));

function degradedExercise(id, name = null) {
  return {
    id,
    name: name || id,
    bodyPart: 'unknown',
    target: 'unknown',
    secondaryMuscles: [],
    equipment: 'unknown',
    gifUrl: null,
    level: 'intermediate',
    instructions: [],
    _degraded: true,
  };
}

/**
 * Get an exercise by ID. Bundle-first 3-tier resolution:
 * 1. Bundle (synchronous)
 * 2. IndexedDB (async)
 * 3. Single fetch from GitHub (last resort, 3s timeout)
 * 4. Degraded object on failure
 */
export async function getById(id) {
  // Resolve legacy IDs
  const resolvedId = exerciseIdMap[id]
    ? slugify(exerciseIdMap[id])
    : id;

  // Tier 1: Bundle (synchronous)
  if (bundleMap.has(resolvedId)) {
    return bundleMap.get(resolvedId);
  }

  // Tier 2: IndexedDB
  try {
    const fromIdb = await store.getExercise(resolvedId);
    if (fromIdb) return fromIdb;
  } catch (e) {
    // IndexedDB not available — continue to next tier
  }

  // Tier 3: Fetch from GitHub
  try {
    const exercise = await fetchSingleExercise(resolvedId);
    if (exercise) return exercise;
  } catch (e) {
    // Fetch failed — return degraded
  }

  // Tier 4: Degraded
  return degradedExercise(id);
}

/**
 * Search exercises. Bundle results render immediately, IDB results merge async.
 * Never hits the API for list queries.
 *
 * @param {string} query - Search text
 * @param {Object} filters - { bodyParts: string[], equipment: string[] }
 * @returns {{ immediate: Object[], asyncResults: Promise<Object[]> }}
 */
export function search(query = '', filters = {}) {
  const q = query.toLowerCase().trim();
  const { bodyParts = [], equipment = [], levels = [], modalities = [] } = filters;

  const matches = (ex) => {
    if (q && !ex.name.toLowerCase().includes(q) &&
        !ex.target?.toLowerCase().includes(q) &&
        !ex.equipment?.toLowerCase().includes(q) &&
        !ex.bodyPart?.toLowerCase().includes(q)) {
      return false;
    }
    if (bodyParts.length > 0 && !bodyParts.includes(ex.bodyPart)) {
      return false;
    }
    if (equipment.length > 0) {
      // Normalize raw equipment value to match filter keys (e.g., 'body only' → 'bodyweight')
      const normalizedEquip = equipmentMap[ex.equipment] || ex.equipment;
      if (!equipment.includes(normalizedEquip) && !equipment.includes(ex.equipment)) {
        return false;
      }
    }
    if (levels.length > 0 && !levels.includes(ex.level)) {
      return false;
    }
    if (modalities.length > 0) {
      const exModality = ex.modality || 'gym';
      if (!modalities.includes(exModality)) return false;
    }
    return true;
  };

  // Tier 1: All bundles (synchronous)
  const immediate = allBundles.filter(matches);

  // Tier 2: IndexedDB (async merge)
  const asyncResults = (async () => {
    try {
      const allIdb = await store.getAllExercises();
      if (!allIdb || allIdb.length === 0) return immediate;

      const idbMatches = allIdb.filter(matches);
      const merged = new Map(immediate.map(ex => [ex.id, ex]));
      idbMatches.forEach(ex => {
        if (!merged.has(ex.id)) merged.set(ex.id, ex);
      });
      return [...merged.values()];
    } catch {
      return immediate;
    }
  })();

  return { immediate, asyncResults };
}

/**
 * Get all exercises from bundle (synchronous).
 */
export function getBundleExercises() {
  return allBundles;
}

/**
 * Check if the full catalog is available in IndexedDB.
 */
export async function isFullCatalogAvailable() {
  try {
    const count = await store.getExerciseCount();
    return count > exerciseBundle.length;
  } catch {
    return false;
  }
}

/**
 * Get the last sync timestamp.
 */
export function getLastSyncTimestamp() {
  return localStorage.getItem('exercisedb_last_sync');
}

/**
 * Get days since last sync.
 */
export function getDaysSinceSync() {
  const ts = getLastSyncTimestamp();
  if (!ts) return null;
  const diff = Date.now() - new Date(ts).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ---- Internal helpers ----

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

async function fetchSingleExercise(id) {
  // We can't fetch a single exercise from the free-exercise-db JSON easily,
  // so this tier is effectively a no-op for now.
  return null;
}
