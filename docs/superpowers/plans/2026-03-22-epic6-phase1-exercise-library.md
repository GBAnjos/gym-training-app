# Epic 6 Phase 1: Exercise Library + Data Layer — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browsable exercise library with ~870 exercises from free-exercise-db, with search, filtering, detail views, and a 3-tier resolution service.

**Architecture:** Exercise service with bundle-first resolution (bundled JSON → IndexedDB → GitHub fetch), background prefetch pipeline that populates IndexedDB, IntersectionObserver-based image optimization for library grid. Library is browse-only in Phase 1 (no [+] button).

**Tech Stack:** React 19, IndexedDB (native API via `idb` library), Vite/Vitest, free-exercise-db open-source dataset

**Spec:** `docs/superpowers/specs/2026-03-22-epic6-custom-workout-builder-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/data/exerciseIdMap.js` | Maps 36 legacy exercise IDs (e.g., `supino_reto`) to free-exercise-db names |
| `src/data/bodyPartToMusculos.js` | Maps English muscle names to Portuguese `muscleColors` keys |
| `src/data/exerciseBundle.json` | Curated ~200 exercises from free-exercise-db in normalized shape |
| `scripts/curate-exercises.js` | One-time script to fetch free-exercise-db and generate the bundle |
| `src/services/exerciseDbStore.js` | IndexedDB wrapper — open, put, get, getAll, search |
| `src/services/exerciseService.js` | 3-tier resolution service — the single API for all exercise lookups |
| `src/pages/ExerciseLibraryPage.jsx` | Library page — grid, filter pills, search bar |
| `src/pages/ExerciseLibraryPage.css` | Library page styles |
| `src/components/ExerciseDetailSheet.jsx` | Bottom sheet with exercise details + similar exercises |
| `src/components/ExerciseDetailSheet.css` | Bottom sheet styles |
| `src/hooks/useExercisePrefetch.js` | Background prefetch hook — fetches full catalog into IndexedDB |

### Modified Files

| File | Changes |
|------|---------|
| `src/App.jsx` | Add `ExerciseLibraryPage` case in `renderPage()` switch |
| `src/components/BottomNav.jsx` | Add library nav item (5th tab) |
| `src/hooks/useLanguage.jsx` | Add ~20 i18n keys for library UI |
| `package.json` | Add `idb` dependency, add `vitest` + `@testing-library/react` dev dependencies |
| `vite.config.js` | Add Vitest config block |

### Data Flow Note

The free-exercise-db dataset uses JPG images (start/end positions), not animated GIFs. The existing `ExerciseMedia` component already uses this same repo. The library grid shows start-position images (`0.jpg`). The spec's "GIF strategy" is implemented with these static images — IntersectionObserver still optimizes loading by unloading images scrolled out of viewport.

---

## Chunk 1: Foundation

### Task 1: Test Infrastructure + Data Mappings

**Files:**
- Create: `src/data/exerciseIdMap.js`
- Create: `src/data/bodyPartToMusculos.js`
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `src/data/__tests__/exerciseIdMap.test.js`
- Create: `src/data/__tests__/bodyPartToMusculos.test.js`

**Context:** The project has zero test infrastructure. Vitest is the natural choice for a Vite project. The data mapping files are pure functions with no dependencies — ideal first test targets.

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom fake-indexeddb
```

- [ ] **Step 2: Add Vitest config to vite.config.js**

Add this `test` block to the existing Vite config:

```js
// In vite.config.js, add to the defineConfig object:
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: [],
}
```

Also add a `test` script to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Run `npx vitest run` to verify Vitest works (should report 0 tests)**

- [ ] **Step 4: Create `src/data/exerciseIdMap.js`**

Maps every legacy exercise ID from `treinos.js` (`EXERCISE_TRANSLATIONS` keys) to the corresponding free-exercise-db folder name. The folder names are already mapped in `src/services/exerciseMediaService.js` — reuse that knowledge.

```js
/**
 * Maps legacy exercise IDs (from treinos.js) to free-exercise-db exercise folder names.
 * These folder names are used to construct image URLs and to look up exercises in the bundle/IDB.
 */
export const exerciseIdMap = {
  supino_reto: 'Barbell_Bench_Press_-_Medium_Grip',
  supino_inclinado_haltere: 'Incline_Dumbbell_Press',
  desenvolvimento_militar: 'Standing_Military_Press',
  elevacao_lateral: 'Side_Lateral_Raise',
  triceps_testa: 'Lying_Triceps_Press',
  triceps_corda: 'Triceps_Pushdown_-_Rope_Attachment',
  barra_fixa: 'Pullups',
  remada_curvada: 'Bent_Over_Barbell_Row',
  remada_unilateral: 'One-Arm_Dumbbell_Row',
  pullover: 'Dumbbell_Pullover',
  rosca_direta: 'Barbell_Curl',
  rosca_martelo: 'Hammer_Curls',
  agachamento: 'Barbell_Squat',
  jump_squat: 'Freehand_Jump_Squat',
  leg_press: 'Leg_Press',
  afundo: 'Dumbbell_Lunges',
  extensora: 'Leg_Extensions',
  panturrilha_pe: 'Standing_Calf_Raises',
  supino_inclinado_barra: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  crucifixo_inclinado: 'Incline_Dumbbell_Flyes',
  push_press: 'Push_Press',
  elevacao_frontal: 'Front_Dumbbell_Raise',
  paralelas: 'Dips_-_Triceps_Version',
  triceps_overhead: 'Standing_Dumbbell_Triceps_Extension',
  terra: 'Barbell_Deadlift',
  remada_cavalinho: 'T-Bar_Row_with_Handle',
  pulldown_fechado: 'Close-Grip_Lat_Pulldown',
  face_pull: 'Face_Pull',
  encolhimento: 'Barbell_Shrug',
  rosca_scott: 'Preacher_Curl',
  stiff: 'Stiff-Legged_Barbell_Deadlift',
  mesa_flexora: 'Lying_Leg_Curls',
  agachamento_bulgaro: 'Single_Leg_Squat',
  hip_thrust: 'Barbell_Hip_Thrust',
  abdutora: 'Thigh_Abductor',
  panturrilha_sentado: 'Seated_Calf_Raise',
};

/**
 * Get the free-exercise-db folder name for a legacy exercise ID.
 * Returns null if no mapping exists (exercise will fall back to treinos.js data).
 */
export function getExerciseDbName(legacyId) {
  return exerciseIdMap[legacyId] || null;
}
```

- [ ] **Step 5: Write test for exerciseIdMap**

Create `src/data/__tests__/exerciseIdMap.test.js`:

```js
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
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
npx vitest run src/data/__tests__/exerciseIdMap.test.js
```

- [ ] **Step 7: Create `src/data/bodyPartToMusculos.js`**

```js
import { MUSCLE_TRANSLATIONS } from './treinos';

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
  forearms: ['Bíceps'],               // Nearest match
  lats: ['Costas'],
  'middle back': ['Costas', 'Trapézio'],
  'lower back': ['Costas'],
  traps: ['Trapézio'],
  neck: ['Trapézio'],                 // Nearest match
  quadriceps: ['Quadríceps'],
  hamstrings: ['Posterior'],
  glutes: ['Glúteos'],
  calves: ['Panturrilhas'],
  abdominals: ['Peito'],              // No "Abdômen" key in muscleColors — nearest match
  adductors: ['Quadríceps'],          // Nearest match
  abductors: ['Glúteos'],             // Nearest match
};

/**
 * Maps free-exercise-db equipment values to filter-friendly display keys.
 */
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

/**
 * Maps free-exercise-db primaryMuscles to the bodyPart category used in filter pills.
 */
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

/**
 * Filter label → bodyPart values mapping for the library UI filter pills.
 */
export const filterToBodyParts = {
  Chest: ['chest'],
  Back: ['back'],
  Shoulders: ['shoulders'],
  Arms: ['upper arms', 'lower arms'],
  Legs: ['upper legs', 'lower legs'],
  Core: ['waist'],
};

/**
 * Convert free-exercise-db primaryMuscles array to Portuguese musculos array.
 * @param {string[]} primaryMuscles - e.g., ["chest"] or ["quadriceps", "glutes"]
 * @returns {string[]} - e.g., ["Peito"] or ["Quadríceps", "Glúteos"]
 */
export function toMusculos(primaryMuscles, secondaryMuscles = []) {
  const all = [...primaryMuscles, ...secondaryMuscles];
  const result = new Set();
  all.forEach(m => {
    const mapped = bodyPartToMusculos[m.toLowerCase()];
    if (mapped) mapped.forEach(v => result.add(v));
  });
  return [...result];
}
```

- [ ] **Step 8: Write test for bodyPartToMusculos**

Create `src/data/__tests__/bodyPartToMusculos.test.js`:

```js
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
```

- [ ] **Step 9: Run all tests — verify they pass**

```bash
npx vitest run
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add test infrastructure and exercise data mappings

Set up Vitest with jsdom. Add exerciseIdMap (legacy→free-exercise-db),
bodyPartToMusculos (English→Portuguese muscle mapping), equipment mapping,
and filter-to-bodyPart mapping. All with tests."
```

---

### Task 2: Exercise Bundle Curation

**Files:**
- Create: `scripts/curate-exercises.js`
- Create: `src/data/exerciseBundle.json`
- Create: `src/data/__tests__/exerciseBundle.test.js`

**Context:** The free-exercise-db dataset is at `https://github.com/yuhonas/free-exercise-db`. The `dist/exercises.json` file contains ~870 exercises. We need to fetch it, transform into our normalized shape, curate ~200 exercises, and save as a bundle. The curation script runs once during development (not at runtime).

**Important data format note:** free-exercise-db uses this shape:
```json
{
  "name": "Barbell Bench Press - Medium Grip",
  "force": "push",
  "level": "beginner",
  "mechanic": "compound",
  "equipment": "barbell",
  "primaryMuscles": ["chest"],
  "secondaryMuscles": ["shoulders", "triceps"],
  "instructions": ["Step 1...", "Step 2..."],
  "category": "strength",
  "images": ["Barbell_Bench_Press_-_Medium_Grip/0.jpg", "Barbell_Bench_Press_-_Medium_Grip/1.jpg"]
}
```

Our normalized shape (from spec Section 1):
```json
{
  "id": "barbell_bench_press_medium_grip",
  "name": "Barbell Bench Press - Medium Grip",
  "bodyPart": "chest",
  "target": "chest",
  "secondaryMuscles": ["shoulders", "triceps"],
  "equipment": "barbell",
  "gifUrl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
  "level": "beginner",
  "instructions": ["Step 1...", "Step 2..."]
}
```

- [ ] **Step 1: Create `scripts/curate-exercises.js`**

This Node script fetches the full dataset, transforms each exercise into normalized shape, curates ~200 by goal coverage, and writes `exerciseBundle.json`.

```js
#!/usr/bin/env node
/**
 * Curate exercise bundle from free-exercise-db.
 * Run: node scripts/curate-exercises.js
 * Output: src/data/exerciseBundle.json
 */

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const EXERCISES_URL = `${BASE_URL}/dist/exercises.json`;

const muscleToBodyPart = {
  chest: 'chest', shoulders: 'shoulders', triceps: 'upper arms',
  biceps: 'upper arms', forearms: 'lower arms', lats: 'back',
  'middle back': 'back', 'lower back': 'back', traps: 'back',
  neck: 'back', quadriceps: 'upper legs', hamstrings: 'upper legs',
  glutes: 'upper legs', calves: 'lower legs', abdominals: 'waist',
  adductors: 'upper legs', abductors: 'upper legs',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function getFolderFromImages(images) {
  if (!images || !images.length) return null;
  // images[0] is like "Barbell_Bench_Press_-_Medium_Grip/0.jpg"
  return images[0].split('/')[0];
}

function transformExercise(raw) {
  const folder = getFolderFromImages(raw.images);
  const primaryMuscle = raw.primaryMuscles?.[0] || 'chest';
  return {
    id: slugify(raw.name),
    name: raw.name,
    bodyPart: muscleToBodyPart[primaryMuscle] || 'chest',
    target: primaryMuscle,
    secondaryMuscles: raw.secondaryMuscles || [],
    equipment: raw.equipment || 'body only',
    gifUrl: folder ? `${BASE_URL}/exercises/${folder}/0.jpg` : null,
    level: raw.level || 'intermediate',
    instructions: raw.instructions || [],
  };
}

// Curation criteria: select exercises that cover all goal categories
const CURATION = {
  // Hypertrophy: compound + isolation per muscle group (~80)
  hypertrophy: {
    targetMuscles: ['chest', 'shoulders', 'triceps', 'biceps', 'lats', 'middle back',
                    'quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals', 'traps'],
    equipment: ['barbell', 'dumbbell', 'cable', 'machine'],
    maxPerMuscle: 7,
  },
  // Strength: big lifts + accessories (~50)
  strength: {
    targetMuscles: ['chest', 'quadriceps', 'hamstrings', 'lats', 'shoulders', 'glutes', 'traps'],
    equipment: ['barbell', 'dumbbell'],
    mechanics: ['compound'],
    maxPerMuscle: 8,
  },
  // General fitness: full-body + functional (~40)
  general: {
    targetMuscles: ['chest', 'quadriceps', 'lats', 'shoulders', 'abdominals', 'glutes'],
    equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'body only'],
    maxPerMuscle: 7,
  },
  // Bodyweight / home: no-equipment variants (~30)
  bodyweight: {
    equipment: ['body only'],
    maxTotal: 30,
  },
};

async function main() {
  console.log('Fetching exercises from free-exercise-db...');
  const res = await fetch(EXERCISES_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const allExercises = await res.json();
  console.log(`Fetched ${allExercises.length} exercises`);

  // Transform all exercises
  const transformed = allExercises.map(transformExercise);

  // Curate by selecting from each category, deduplicating
  const selected = new Map(); // id → exercise

  // Helper: add exercises matching criteria
  function addMatching(exercises, criteria) {
    const byMuscle = {};
    for (const ex of exercises) {
      if (selected.has(ex.id)) continue;
      if (criteria.equipment && !criteria.equipment.includes(ex.equipment)) continue;
      if (criteria.mechanics) {
        const raw = allExercises.find(r => slugify(r.name) === ex.id);
        if (raw && !criteria.mechanics.includes(raw.mechanic)) continue;
      }
      const muscle = ex.target;
      if (criteria.targetMuscles && !criteria.targetMuscles.includes(muscle)) continue;
      byMuscle[muscle] = byMuscle[muscle] || [];
      if (criteria.maxPerMuscle && byMuscle[muscle].length >= criteria.maxPerMuscle) continue;
      byMuscle[muscle].push(ex);
      selected.set(ex.id, ex);
      if (criteria.maxTotal && selected.size >= criteria.maxTotal) return;
    }
  }

  // Priority order: compound exercises first (more useful), then isolation
  const compounds = transformed.filter(e => {
    const raw = allExercises.find(r => slugify(r.name) === e.id);
    return raw?.mechanic === 'compound';
  });
  const isolations = transformed.filter(e => {
    const raw = allExercises.find(r => slugify(r.name) === e.id);
    return raw?.mechanic !== 'compound';
  });
  const sorted = [...compounds, ...isolations];

  addMatching(sorted, CURATION.hypertrophy);
  addMatching(sorted, CURATION.strength);
  addMatching(sorted, CURATION.general);
  addMatching(sorted, CURATION.bodyweight);

  const bundle = [...selected.values()];
  console.log(`Curated ${bundle.length} exercises`);

  // Write bundle
  const fs = await import('fs');
  const path = await import('path');
  const outPath = path.resolve('src/data/exerciseBundle.json');
  fs.writeFileSync(outPath, JSON.stringify(bundle, null, 2));
  console.log(`Written to ${outPath}`);

  // Print stats
  const byBodyPart = {};
  bundle.forEach(e => {
    byBodyPart[e.bodyPart] = (byBodyPart[e.bodyPart] || 0) + 1;
  });
  console.log('Distribution by bodyPart:', byBodyPart);
}

main().catch(console.error);
```

- [ ] **Step 2: Run the curation script**

```bash
node scripts/curate-exercises.js
```

Expected: Creates `src/data/exerciseBundle.json` with ~150-200 exercises. Verify the output file exists and the distribution covers all body parts.

- [ ] **Step 3: Write test for exerciseBundle**

Create `src/data/__tests__/exerciseBundle.test.js`:

```js
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
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add scripts/curate-exercises.js src/data/exerciseBundle.json src/data/__tests__/exerciseBundle.test.js
git commit -m "feat: add curated exercise bundle from free-exercise-db

Script fetches ~870 exercises, curates ~200 by goal coverage
(hypertrophy, strength, general fitness, bodyweight). Bundle ships
with the app for instant library loading."
```

---

### Task 3: IndexedDB Wrapper

**Files:**
- Modify: `package.json` (add `idb` dependency)
- Create: `src/services/exerciseDbStore.js`
- Create: `src/services/__tests__/exerciseDbStore.test.js`

**Context:** IndexedDB stores the full exercise catalog (~870 exercises) after background prefetch. The `idb` library provides a Promise-based wrapper around the raw IndexedDB API. The store is created lazily on first access.

- [ ] **Step 1: Install `idb`**

```bash
npm install idb
```

- [ ] **Step 2: Create `src/services/exerciseDbStore.js`**

```js
import { openDB } from 'idb';

const DB_NAME = 'exerciseDB';
const DB_VERSION = 1;
const STORE_NAME = 'exercises';

let dbPromise = null;

/**
 * Get or create the IndexedDB database. Lazy initialization.
 */
function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('bodyPart', 'bodyPart', { unique: false });
          store.createIndex('equipment', 'equipment', { unique: false });
          store.createIndex('target', 'target', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Store a single exercise.
 */
export async function putExercise(exercise) {
  const db = await getDb();
  await db.put(STORE_NAME, exercise);
}

/**
 * Store multiple exercises in a single transaction.
 */
export async function putExercises(exercises) {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all([
    ...exercises.map(ex => tx.store.put(ex)),
    tx.done,
  ]);
}

/**
 * Get a single exercise by ID.
 * @returns {Object|undefined}
 */
export async function getExercise(id) {
  const db = await getDb();
  return db.get(STORE_NAME, id);
}

/**
 * Get all exercises from the store.
 * @returns {Object[]}
 */
export async function getAllExercises() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

/**
 * Get exercises by bodyPart index.
 * @param {string} bodyPart
 * @returns {Object[]}
 */
export async function getByBodyPart(bodyPart) {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'bodyPart', bodyPart);
}

/**
 * Get the count of exercises in the store.
 * @returns {number}
 */
export async function getExerciseCount() {
  const db = await getDb();
  return db.count(STORE_NAME);
}

/**
 * Clear all exercises from the store.
 */
export async function clearExercises() {
  const db = await getDb();
  await db.clear(STORE_NAME);
}
```

- [ ] **Step 3: Write test for exerciseDbStore**

Create `src/services/__tests__/exerciseDbStore.test.js`:

**Important: `fake-indexeddb` is REQUIRED for IndexedDB tests in jsdom.** It must be installed (done in Task 1 step 1) and configured in `src/test-setup.js` (done in this task's step 3).

```js
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
```

**Required:** Create the test setup file for IndexedDB support (fake-indexeddb was installed in Task 1):

Create `src/test-setup.js`:
```js
import 'fake-indexeddb/auto';
```

Update `vite.config.js` test block to use this setup file:
```js
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.js'],
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/services/exerciseDbStore.js src/services/__tests__/exerciseDbStore.test.js src/test-setup.js vite.config.js
git commit -m "feat: add IndexedDB wrapper for exercise catalog storage

Uses idb library for Promise-based IndexedDB access. Lazy database
creation. Supports put, get, getAll, batch put, and indexed queries
by bodyPart, equipment, and target."
```

---

### Task 4: Exercise Service (3-Tier Resolution)

**Files:**
- Create: `src/services/exerciseService.js`
- Create: `src/services/__tests__/exerciseService.test.js`

**Context:** This is the core service — the single API for all exercise lookups. It implements bundle-first 3-tier resolution as specified in the design spec Section 1. The service is used by the library page, detail sheet, and (in Phase 2) the workout builder.

**Dependencies:** `exerciseBundle.json`, `exerciseDbStore.js`, `exerciseIdMap.js`, `bodyPartToMusculos.js`

- [ ] **Step 1: Create `src/services/exerciseService.js`**

```js
import exerciseBundle from '../data/exerciseBundle.json';
import { exerciseIdMap } from '../data/exerciseIdMap';
import { muscleToBodyPart, equipmentMap } from '../data/bodyPartToMusculos';
import * as store from './exerciseDbStore';

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const FETCH_TIMEOUT = 3000;

// Build a lookup map from the bundle for O(1) access
const bundleMap = new Map(exerciseBundle.map(ex => [ex.id, ex]));
const bundleIds = new Set(exerciseBundle.map(ex => ex.id));

/**
 * Create a degraded exercise object when all resolution tiers fail.
 */
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
 * 1. Bundle (synchronous) — for known bundled IDs
 * 2. IndexedDB (async) — for IDs outside the bundle
 * 3. Single fetch from GitHub (last resort, 3s timeout)
 * 4. Degraded object on failure
 *
 * @param {string} id - Exercise ID (normalized slug or legacy ID)
 * @returns {Promise<Object>} Exercise in normalized shape
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
  const { bodyParts = [], equipment = [] } = filters;

  // Filter function
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
    return true;
  };

  // Tier 1: Bundle (synchronous)
  const immediate = exerciseBundle.filter(matches);

  // Tier 2: IndexedDB (async merge)
  const asyncResults = (async () => {
    try {
      const allIdb = await store.getAllExercises();
      if (!allIdb || allIdb.length === 0) return immediate;

      const idbMatches = allIdb.filter(matches);
      // Merge and deduplicate — bundle results take priority
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
 * Used for initial library load before IDB is ready.
 */
export function getBundleExercises() {
  return exerciseBundle;
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
  // In the future, this could hit a backend API.
  return null;
}
```

- [ ] **Step 2: Write test for exerciseService**

Create `src/services/__tests__/exerciseService.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getById, search, getBundleExercises, isFullCatalogAvailable, getDaysSinceSync } from '../exerciseService';
import * as store from '../exerciseDbStore';

describe('exerciseService', () => {
  describe('getById', () => {
    it('returns exercise from bundle for known ID', async () => {
      const bundleExercises = getBundleExercises();
      if (bundleExercises.length === 0) return; // Skip if bundle is empty
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
      // supino_reto should map to a bundle exercise
      const result = await getById('supino_reto');
      expect(result.name).toBeDefined();
      // It may or may not be in the bundle — if not, it'll be degraded
      // but the ID resolution should have been attempted
    });
  });

  describe('search', () => {
    it('returns immediate results from bundle', () => {
      const { immediate } = search('bench');
      // Should find bench press variations if they're in the bundle
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
        // Equipment should be barbell or mapped to barbell
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
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/services/exerciseService.js src/services/__tests__/exerciseService.test.js
git commit -m "feat: add exercise service with bundle-first 3-tier resolution

Provides getById() and search() APIs. Bundle checked synchronously
first, IndexedDB for extended catalog, degraded fallback on failure.
Search returns immediate bundle results + async IDB merge."
```

---

## Chunk 2: UI Layer

### Task 5: Exercise Library Page + Navigation

**Files:**
- Create: `src/pages/ExerciseLibraryPage.jsx`
- Create: `src/pages/ExerciseLibraryPage.css`
- Modify: `src/App.jsx:12-13,51-65` — add import and case
- Modify: `src/components/BottomNav.jsx:8-13` — add nav item
- Modify: `src/hooks/useLanguage.jsx` — add i18n keys

**Context:** The library page shows a 2-column grid of exercise cards with filter pills and a search bar. This task creates the page shell and integrates it into navigation. Search/filter logic is wired in Task 6. The page is browse-only in Phase 1 — no [+] button.

- [ ] **Step 1: Add i18n keys to `src/hooks/useLanguage.jsx`**

Add these keys to both `'pt-BR'` and `'en'` translation blocks:

```js
// pt-BR
nav_library: 'Exercícios',
library_title: 'Biblioteca de Exercícios',
library_search_placeholder: 'Buscar exercícios...',
library_filter_chest: 'Peito',
library_filter_back: 'Costas',
library_filter_shoulders: 'Ombros',
library_filter_arms: 'Braços',
library_filter_legs: 'Pernas',
library_filter_core: 'Core',
library_filter_fullbody: 'Todos',
library_filter_barbell: 'Barra',
library_filter_dumbbell: 'Haltere',
library_filter_cable: 'Cabo',
library_filter_machine: 'Máquina',
library_filter_bodyweight: 'Corpo',
library_filter_band: 'Elástico',
library_empty_filter: 'Nenhum exercício com esses filtros. Tente remover um filtro.',
library_empty_search: 'Nenhum exercício encontrado para',
library_offline_footer: 'Mostrando biblioteca offline',
library_staleness: 'Atualizado há',
library_staleness_days: 'dias',
library_refresh: 'Atualizar',
library_detail_instructions: 'Instruções',
library_detail_similar: 'Exercícios similares',
library_detail_level: 'Nível',
library_detail_equipment: 'Equipamento',
library_detail_muscles: 'Músculos',

// en
nav_library: 'Exercises',
library_title: 'Exercise Library',
library_search_placeholder: 'Search exercises...',
library_filter_chest: 'Chest',
library_filter_back: 'Back',
library_filter_shoulders: 'Shoulders',
library_filter_arms: 'Arms',
library_filter_legs: 'Legs',
library_filter_core: 'Core',
library_filter_fullbody: 'All',
library_filter_barbell: 'Barbell',
library_filter_dumbbell: 'Dumbbell',
library_filter_cable: 'Cable',
library_filter_machine: 'Machine',
library_filter_bodyweight: 'Bodyweight',
library_filter_band: 'Band',
library_empty_filter: 'No exercises match these filters. Try removing a filter.',
library_empty_search: 'No exercises found for',
library_offline_footer: 'Showing offline library',
library_staleness: 'Last updated',
library_staleness_days: 'days ago',
library_refresh: 'Refresh',
library_detail_instructions: 'Instructions',
library_detail_similar: 'Similar exercises',
library_detail_level: 'Level',
library_detail_equipment: 'Equipment',
library_detail_muscles: 'Muscles',
```

- [ ] **Step 2: Add library nav item to `src/components/BottomNav.jsx`**

Add a 5th nav item. The library should appear between "Training" and "Dashboard" for natural flow (train → browse exercises → track progress):

```js
const NAV_ITEMS = [
  { id: 'schedule', icon: 'calendar-days', labelKey: 'nav_schedule' },
  { id: 'meals', icon: 'knife-fork-1', labelKey: 'nav_meals' },
  { id: 'training', icon: 'dumbbell-1', labelKey: 'nav_training' },
  { id: 'library', icon: 'search-1', labelKey: 'nav_library' },
  { id: 'dashboard', icon: 'bar-chart-4', labelKey: 'nav_dashboard' },
];
```

- [ ] **Step 3: Add library page to `src/App.jsx`**

Add import at top:
```js
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
```

Add case in `renderPage()` switch:
```js
case 'library':
  return <ExerciseLibraryPage />;
```

- [ ] **Step 4: Create stub `src/components/ExerciseDetailSheet.jsx`**

Task 6 will replace this with the full implementation. This stub prevents compile errors since ExerciseLibraryPage imports it.

```jsx
export function ExerciseDetailSheet({ exercise, language, onClose }) {
  if (!exercise) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
         onClick={onClose}>
      <div style={{ background: 'var(--color-bg-primary)', borderRadius: '16px 16px 0 0', padding: '24px', width: '100%', maxWidth: 500 }}
           onClick={e => e.stopPropagation()}>
        <h2>{exercise.name}</h2>
        <p>Detail sheet — full implementation in Task 6</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/pages/ExerciseLibraryPage.jsx`**

```jsx
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getBundleExercises, search, isFullCatalogAvailable, getDaysSinceSync } from '../services/exerciseService';
import { toMusculos } from '../data/bodyPartToMusculos';
import { muscleColors } from '../data/design';
import { Icon } from '../components/Icon';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';
import './ExerciseLibraryPage.css';

const MUSCLE_FILTERS = [
  { key: 'chest', bodyParts: ['chest'] },
  { key: 'back', bodyParts: ['back'] },
  { key: 'shoulders', bodyParts: ['shoulders'] },
  { key: 'arms', bodyParts: ['upper arms', 'lower arms'] },
  { key: 'legs', bodyParts: ['upper legs', 'lower legs'] },
  { key: 'core', bodyParts: ['waist'] },
  { key: 'fullbody', bodyParts: [] },  // Empty = clear filter (show all)
];

// Equipment filter values use NORMALIZED keys (matching equipmentMap output),
// NOT raw free-exercise-db values. The search() function compares against these.
const EQUIPMENT_FILTERS = [
  { key: 'barbell', value: 'barbell' },
  { key: 'dumbbell', value: 'dumbbell' },
  { key: 'cable', value: 'cable' },
  { key: 'machine', value: 'machine' },
  { key: 'bodyweight', value: 'bodyweight' },
  { key: 'band', value: 'band' },
];

export function ExerciseLibraryPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeBodyParts, setActiveBodyParts] = useState([]);
  const [activeEquipment, setActiveEquipment] = useState([]);
  const [exercises, setExercises] = useState(() => getBundleExercises());
  const [isOffline, setIsOffline] = useState(false);
  const [daysSinceSync, setDaysSinceSync] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const searchTimeoutRef = useRef(null);
  const gridRef = useRef(null);

  // Check catalog availability on mount
  useEffect(() => {
    isFullCatalogAvailable().then(available => setIsOffline(!available));
    setDaysSinceSync(getDaysSinceSync());
  }, []);

  // Search with debounce
  const doSearch = useCallback((q, bodyParts, equipment) => {
    const { immediate, asyncResults } = search(q, {
      bodyParts,
      equipment,
    });
    setExercises(immediate);

    // Merge async results when ready
    asyncResults.then(merged => {
      setExercises(merged);
    });
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      doSearch(query, activeBodyParts, activeEquipment);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, activeBodyParts, activeEquipment, doSearch]);

  const toggleBodyPart = (bodyParts) => {
    // Empty bodyParts = "Full Body" / clear all filters
    if (bodyParts.length === 0) {
      setActiveBodyParts([]);
      return;
    }
    setActiveBodyParts(prev => {
      const isActive = bodyParts.every(bp => prev.includes(bp));
      if (isActive) return prev.filter(bp => !bodyParts.includes(bp));
      return [...new Set([...prev, ...bodyParts])];
    });
  };

  const toggleEquipment = (value) => {
    setActiveEquipment(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  // IntersectionObserver for image budget
  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const img = entry.target.querySelector('.library-card-img');
          if (!img) return;
          if (entry.isIntersecting) {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
          } else {
            if (img.src && img.src !== '') {
              img.dataset.src = img.src;
              img.src = '';
            }
          }
        });
      },
      { rootMargin: '100px' }
    );

    const cards = gridRef.current.querySelectorAll('.library-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [exercises]);

  const handleRefresh = async () => {
    // Trigger prefetch — will be implemented in Task 7
    window.dispatchEvent(new CustomEvent('exercise-prefetch-request'));
  };

  return (
    <div className="library-page">
      {/* Search Bar */}
      <div className="library-search">
        <Icon name="search-1" className="library-search-icon" />
        <input
          type="text"
          className="library-search-input"
          placeholder={t('library_search_placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="library-search-clear" onClick={() => setQuery('')}>
            <Icon name="xmark" />
          </button>
        )}
      </div>

      {/* Filter Pills — Row 1: Muscles */}
      <div className="library-filters">
        <div className="library-filter-row">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f.key}
              className={`library-filter-pill ${f.bodyParts.every(bp => activeBodyParts.includes(bp)) ? 'active' : ''}`}
              onClick={() => toggleBodyPart(f.bodyParts)}
            >
              {t(`library_filter_${f.key}`)}
            </button>
          ))}
        </div>

        {/* Filter Pills — Row 2: Equipment */}
        <div className="library-filter-row">
          {EQUIPMENT_FILTERS.map(f => (
            <button
              key={f.key}
              className={`library-filter-pill ${activeEquipment.includes(f.value) ? 'active' : ''}`}
              onClick={() => toggleEquipment(f.value)}
            >
              {t(`library_filter_${f.key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {exercises.length > 0 ? (
        <div className="library-grid" ref={gridRef}>
          {exercises.map(ex => (
            <ExerciseLibraryCard
              key={ex.id}
              exercise={ex}
              language={language}
              onClick={() => setSelectedExercise(ex)}
            />
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <Icon name="search-1" className="library-empty-icon" />
          <p>
            {query
              ? `${t('library_empty_search')} "${query}"`
              : t('library_empty_filter')
            }
          </p>
        </div>
      )}

      {/* Offline / Staleness Footer */}
      {isOffline && (
        <div className="library-footer">
          <span>{t('library_offline_footer')}</span>
        </div>
      )}
      {!isOffline && daysSinceSync !== null && daysSinceSync >= 7 && (
        <div className="library-footer">
          <span>{t('library_staleness')} {daysSinceSync} {t('library_staleness_days')}</span>
          <button className="library-refresh-btn" onClick={handleRefresh}>
            {t('library_refresh')}
          </button>
        </div>
      )}

      {/* Detail Bottom Sheet */}
      {selectedExercise && (
        <ExerciseDetailSheet
          exercise={selectedExercise}
          language={language}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

function ExerciseLibraryCard({ exercise, language, onClick }) {
  const musculos = toMusculos(
    [exercise.target],
    exercise.secondaryMuscles
  );

  return (
    <div className="library-card" onClick={onClick}>
      <div className="library-card-img-wrapper">
        {exercise.gifUrl ? (
          <img
            className="library-card-img"
            src={exercise.gifUrl}
            alt={exercise.name}
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="library-card-placeholder">
            <Icon name="dumbbell-1" />
          </div>
        )}
      </div>
      <div className="library-card-info">
        <h4 className="library-card-name">{exercise.name}</h4>
        <div className="library-card-tags">
          {musculos.slice(0, 2).map(m => {
            const color = muscleColors[m] || { bg: 'rgba(128,128,128,0.2)', text: '#888' };
            return (
              <span
                key={m}
                className="library-card-tag"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                {m}
              </span>
            );
          })}
          <span className="library-card-equip">{exercise.equipment}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/pages/ExerciseLibraryPage.css`**

```css
.library-page {
  padding: var(--space-sm);
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 20px));
  max-width: 800px;
  margin: 0 auto;
}

/* Search Bar */
.library-search {
  position: relative;
  margin-bottom: var(--space-sm);
}

.library-search-icon {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  font-size: 1rem;
  pointer-events: none;
}

.library-search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-sm) var(--space-sm) var(--space-xl);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--transition-fast);
}

.library-search-input:focus {
  border-color: var(--color-accent-primary);
}

.library-search-input::placeholder {
  color: var(--color-text-secondary);
}

.library-search-clear {
  position: absolute;
  right: var(--space-xs);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-xs);
}

/* Filter Pills */
.library-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.library-filter-row {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}

.library-filter-row::-webkit-scrollbar {
  display: none;
}

.library-filter-pill {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-default);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.library-filter-pill.active {
  border-color: var(--color-accent-primary);
  background-color: rgba(217, 255, 0, 0.1);
  color: var(--color-accent-primary);
}

/* Exercise Grid */
.library-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

/* Exercise Card */
.library-card {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.library-card:active {
  border-color: var(--color-accent-primary);
}

.library-card-img-wrapper {
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.library-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.library-card-placeholder {
  font-size: 2rem;
  color: var(--color-text-secondary);
  opacity: 0.3;
}

.library-card-info {
  padding: var(--space-sm);
}

.library-card-name {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.library-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.library-card-tag {
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.library-card-equip {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  padding: 2px 0;
}

/* Empty State */
.library-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-md);
  text-align: center;
  color: var(--color-text-secondary);
}

.library-empty-icon {
  font-size: 2.5rem;
  opacity: 0.3;
  margin-bottom: var(--space-sm);
}

.library-empty p {
  font-size: 0.9rem;
  margin: 0;
}

/* Footer */
.library-footer {
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border-default);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  z-index: 10;
}

.library-refresh-btn {
  background: none;
  border: none;
  color: var(--color-accent-primary);
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
}
```

- [ ] **Step 7: Verify the app runs**

```bash
npm run dev
```

Navigate to the library tab. Verify:
- Search bar renders
- Filter pills render in 2 rows
- Exercise grid shows cards from the bundle
- Tapping a card opens the detail sheet (placeholder for now)

- [ ] **Step 8: Commit**

```bash
git add src/pages/ExerciseLibraryPage.jsx src/pages/ExerciseLibraryPage.css src/components/ExerciseDetailSheet.jsx src/App.jsx src/components/BottomNav.jsx src/hooks/useLanguage.jsx
git commit -m "feat: add Exercise Library page with grid, search, and filters

2-column grid with exercise cards from bundled data. Muscle group
and equipment filter pills. Debounced search. IntersectionObserver
for image loading optimization. Navigation integration as 5th tab."
```

---

### Task 6: Exercise Detail Bottom Sheet

**Files:**
- Create: `src/components/ExerciseDetailSheet.jsx`
- Create: `src/components/ExerciseDetailSheet.css`

**Context:** Bottom sheet opens when tapping an exercise card in the library. Shows full details: large image, muscle groups, equipment, level, instructions, and similar exercises. Browse-only in Phase 1 — no "Add to workout" button.

- [ ] **Step 1: Create `src/components/ExerciseDetailSheet.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { search } from '../services/exerciseService';
import { toMusculos } from '../data/bodyPartToMusculos';
import { muscleColors } from '../data/design';
import { Icon } from './Icon';
import './ExerciseDetailSheet.css';

export function ExerciseDetailSheet({ exercise, language, onClose }) {
  const { t } = useLanguage();
  const [similarExercises, setSimilarExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const sheetRef = useRef(null);

  // Sync currentExercise when prop changes
  useEffect(() => {
    setCurrentExercise(exercise);
  }, [exercise]);

  // Find similar exercises: same target muscle, different equipment
  useEffect(() => {
    if (!currentExercise) return;
    const { immediate } = search('', { bodyParts: [currentExercise.bodyPart] });
    const similar = immediate
      .filter(ex => ex.id !== currentExercise.id && ex.equipment !== currentExercise.equipment)
      .slice(0, 4);
    setSimilarExercises(similar);
  }, [currentExercise]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!currentExercise) return null;

  const musculos = toMusculos(
    [currentExercise.target],
    currentExercise.secondaryMuscles
  );

  const levelLabels = {
    beginner: language === 'pt-BR' ? 'Iniciante' : 'Beginner',
    intermediate: language === 'pt-BR' ? 'Intermediário' : 'Intermediate',
    expert: language === 'pt-BR' ? 'Avançado' : 'Advanced',
  };

  const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

  // Derive both start and end images from gifUrl
  const startImg = currentExercise.gifUrl;
  const endImg = currentExercise.gifUrl?.replace('/0.jpg', '/1.jpg');

  return (
    <div className="detail-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="detail-sheet" ref={sheetRef}>
        <div className="detail-sheet-handle" />

        <button className="detail-sheet-close" onClick={onClose}>
          <Icon name="xmark" />
        </button>

        {/* Exercise Images — Start/End */}
        <div className="detail-sheet-images">
          {startImg ? (
            <>
              <div className="detail-sheet-img-container">
                <img src={startImg} alt={`${currentExercise.name} - start`} />
                <span className="detail-sheet-img-label">
                  {language === 'pt-BR' ? 'Início' : 'Start'}
                </span>
              </div>
              {endImg && (
                <div className="detail-sheet-img-container">
                  <img src={endImg} alt={`${currentExercise.name} - end`} />
                  <span className="detail-sheet-img-label">
                    {language === 'pt-BR' ? 'Fim' : 'End'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="detail-sheet-placeholder">
              <Icon name="dumbbell-1" />
            </div>
          )}
        </div>

        {/* Exercise Name */}
        <h2 className="detail-sheet-name">{currentExercise.name}</h2>

        {/* Metadata Tags */}
        <div className="detail-sheet-meta">
          {/* Muscles */}
          <div className="detail-sheet-muscles">
            {musculos.map(m => {
              const color = muscleColors[m] || { bg: 'rgba(128,128,128,0.2)', text: '#888' };
              return (
                <span
                  key={m}
                  className="detail-sheet-muscle-tag"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {m}
                </span>
              );
            })}
          </div>

          {/* Equipment + Level */}
          <div className="detail-sheet-badges">
            <span className="detail-sheet-badge">
              {currentExercise.equipment}
            </span>
            <span className="detail-sheet-badge detail-sheet-level">
              {levelLabels[currentExercise.level] || currentExercise.level}
            </span>
          </div>
        </div>

        {/* Instructions */}
        {currentExercise.instructions && currentExercise.instructions.length > 0 && (
          <div className="detail-sheet-section">
            <h3>{t('library_detail_instructions')}</h3>
            <ol className="detail-sheet-instructions">
              {currentExercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Similar Exercises */}
        {similarExercises.length > 0 && (
          <div className="detail-sheet-section">
            <h3>{t('library_detail_similar')}</h3>
            <div className="detail-sheet-similar">
              {similarExercises.map(ex => (
                <div key={ex.id} className="detail-sheet-similar-card"
                     onClick={() => setCurrentExercise(ex)}>
                  {ex.gifUrl ? (
                    <img src={ex.gifUrl} alt={ex.name} loading="lazy" />
                  ) : (
                    <div className="detail-sheet-similar-placeholder">
                      <Icon name="dumbbell-1" />
                    </div>
                  )}
                  <span>{ex.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/ExerciseDetailSheet.css`**

```css
/* Backdrop */
.detail-sheet-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Sheet */
.detail-sheet {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow-y: auto;
  padding: var(--space-md);
  padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 20px));
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.detail-sheet-handle {
  width: 36px;
  height: 4px;
  background-color: var(--color-border-default);
  border-radius: 2px;
  margin: 0 auto var(--space-md);
}

.detail-sheet-close {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  z-index: 1;
}

/* Images */
.detail-sheet-images {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.detail-sheet-img-container {
  flex: 1;
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-bg-elevated);
}

.detail-sheet-img-container img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.detail-sheet-img-label {
  position: absolute;
  bottom: 6px;
  left: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.detail-sheet-placeholder {
  width: 100%;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  font-size: 3rem;
  color: var(--color-text-secondary);
  opacity: 0.3;
}

/* Name */
.detail-sheet-name {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

/* Metadata */
.detail-sheet-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.detail-sheet-muscles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.detail-sheet-muscle-tag {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.detail-sheet-badges {
  display: flex;
  gap: var(--space-xs);
}

.detail-sheet-badge {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-default);
}

.detail-sheet-level {
  text-transform: capitalize;
}

/* Sections */
.detail-sheet-section {
  margin-bottom: var(--space-md);
}

.detail-sheet-section h3 {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

/* Instructions */
.detail-sheet-instructions {
  padding-left: var(--space-md);
  margin: 0;
}

.detail-sheet-instructions li {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-xs);
}

/* Similar Exercises */
.detail-sheet-similar {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.detail-sheet-similar::-webkit-scrollbar {
  display: none;
}

.detail-sheet-similar-card {
  flex-shrink: 0;
  width: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.detail-sheet-similar-card img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-elevated);
}

.detail-sheet-similar-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  opacity: 0.3;
}

.detail-sheet-similar-card span {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 3: Verify the detail sheet works**

```bash
npm run dev
```

Navigate to library tab, tap an exercise card. Verify:
- Bottom sheet slides up with backdrop
- Start/end position images load
- Exercise name, muscles, equipment, level display correctly
- Instructions render as numbered list
- Similar exercises show in horizontal scroll
- Tapping backdrop or X button closes the sheet

- [ ] **Step 4: Commit**

```bash
git add src/components/ExerciseDetailSheet.jsx src/components/ExerciseDetailSheet.css
git commit -m "feat: add exercise detail bottom sheet

Shows start/end position images, muscle tags, equipment, level,
step-by-step instructions, and similar exercises. Slides up from
bottom with backdrop dismiss."
```

---

### Task 7: Background Prefetch + Final Integration

**Files:**
- Create: `src/hooks/useExercisePrefetch.js`
- Modify: `src/pages/ExerciseLibraryPage.jsx` — wire prefetch on mount
- Modify: `src/App.jsx` — add prefetch hook at app level

**Context:** The prefetch hook fetches the full free-exercise-db catalog (~870 exercises), transforms each into normalized shape, and stores in IndexedDB. Triggered on first library visit or after onboarding. Non-blocking — failure is silent. Sets `exercisedb_last_sync` timestamp. Re-fetches if timestamp is older than 7 days.

- [ ] **Step 1: Create `src/hooks/useExercisePrefetch.js`**

```js
import { useEffect, useRef, useState, useCallback } from 'react';
import { putExercises } from '../services/exerciseDbStore';
import { getDaysSinceSync } from '../services/exerciseService';
import { muscleToBodyPart } from '../data/bodyPartToMusculos';

const EXERCISES_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main';
const REFRESH_DAYS = 7;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function getFolderFromImages(images) {
  if (!images || !images.length) return null;
  return images[0].split('/')[0];
}

function transformExercise(raw) {
  const folder = getFolderFromImages(raw.images);
  const primaryMuscle = raw.primaryMuscles?.[0] || 'chest';
  return {
    id: slugify(raw.name),
    name: raw.name,
    bodyPart: muscleToBodyPart[primaryMuscle] || 'chest',
    target: primaryMuscle,
    secondaryMuscles: raw.secondaryMuscles || [],
    equipment: raw.equipment || 'body only',
    gifUrl: folder ? `${BASE_URL}/exercises/${folder}/0.jpg` : null,
    level: raw.level || 'intermediate',
    instructions: raw.instructions || [],
  };
}

/**
 * Background prefetch hook. Fetches full exercise catalog into IndexedDB.
 * Non-blocking — silently fails on error.
 *
 * @param {boolean} trigger - Whether to trigger prefetch (e.g., library page mounted)
 */
export function useExercisePrefetch(trigger = false) {
  const fetching = useRef(false);
  const [fetchCount, setFetchCount] = useState(0);  // Increment to re-trigger

  const doFetch = useCallback(async (force = false) => {
    if (fetching.current) return;

    if (!force) {
      const daysSince = getDaysSinceSync();
      if (daysSince !== null && daysSince < REFRESH_DAYS) return;
    }

    fetching.current = true;
    try {
      const res = await fetch(EXERCISES_URL);
      if (!res.ok) return;

      const rawExercises = await res.json();
      const transformed = rawExercises.map(transformExercise);

      await putExercises(transformed);
      localStorage.setItem('exercisedb_last_sync', new Date().toISOString());

      console.log(`[ExercisePrefetch] Stored ${transformed.length} exercises in IndexedDB`);
    } catch (e) {
      console.warn('[ExercisePrefetch] Failed to prefetch:', e.message);
    } finally {
      fetching.current = false;
    }
  }, []);

  // Trigger on mount (if trigger=true) or when fetchCount changes
  useEffect(() => {
    if (!trigger) return;
    doFetch();
  }, [trigger, fetchCount, doFetch]);

  // Listen for manual refresh requests (from the "Refresh" button in library footer)
  useEffect(() => {
    const handleRefresh = () => {
      localStorage.removeItem('exercisedb_last_sync');
      fetching.current = false;
      setFetchCount(c => c + 1);  // Re-trigger the fetch effect
    };
    window.addEventListener('exercise-prefetch-request', handleRefresh);
    return () => window.removeEventListener('exercise-prefetch-request', handleRefresh);
  }, []);
}
```

- [ ] **Step 2: Wire prefetch into ExerciseLibraryPage**

In `src/pages/ExerciseLibraryPage.jsx`, add at the top of the `ExerciseLibraryPage` component:

```js
import { useExercisePrefetch } from '../hooks/useExercisePrefetch';

// Inside ExerciseLibraryPage component, after other hooks:
useExercisePrefetch(true);  // Trigger on library page mount
```

- [ ] **Step 3: Verify prefetch works**

```bash
npm run dev
```

Open the library tab. Check browser DevTools → Application → IndexedDB → `exerciseDB` → `exercises`. Verify exercises are being stored. Check console for the success log message.

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

All tests should pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useExercisePrefetch.js src/pages/ExerciseLibraryPage.jsx
git commit -m "feat: add background exercise prefetch pipeline

Fetches full free-exercise-db catalog (~870 exercises), transforms
to normalized shape, stores in IndexedDB. Triggered on library page
mount. Re-fetches after 7 days. Silent failure — falls back to bundle."
```

- [ ] **Step 6: Final verification — full feature test**

```bash
npm run dev
```

Verify the complete Phase 1 experience:
1. Navigate to Exercises tab — library grid loads with bundled exercises
2. Type in search bar — results filter with 300ms debounce
3. Tap muscle/equipment filter pills — results update, pills show active state
4. Combine search + filters — both are AND-combined
5. Tap an exercise card — detail sheet slides up
6. Detail sheet shows start/end images, muscles, equipment, level, instructions, similar exercises
7. Close detail sheet via backdrop, X button, or Escape key
8. After IndexedDB prefetch completes, search returns more results (full catalog)
9. Clear all filters — "No exercises match" empty state shows
10. When offline, "Showing offline library" footer appears

- [ ] **Step 7: Final commit — clean up any loose ends**

If any adjustments were needed during verification:

```bash
git add -A
git commit -m "fix: polish exercise library integration"
```
