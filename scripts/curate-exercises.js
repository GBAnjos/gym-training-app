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
