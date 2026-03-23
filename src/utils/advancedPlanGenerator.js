/**
 * Advanced Science-Based Workout Generator
 *
 * Produces hyper-personalized workout plans grounded in sports science:
 * - ACSM volume guidelines
 * - Renaissance Periodization volume landmarks (MEV → MRV)
 * - Movement-pattern-based exercise selection
 * - Equipment-aware filtering
 * - Built-in RPE targets and progression models
 *
 * Input: SmartPlan answers { goal, level, days, equipment, duration, priorityMuscles }
 * Output: vida_workout_plan-compatible object with enriched exercise metadata
 */

import { getBundleExercises } from '../services/exerciseService';
import {
  VOLUME_LANDMARKS,
  SPLIT_TEMPLATES,
  EQUIPMENT_SETS,
  MUSCLE_TO_BODY_PARTS,
  MUSCLE_TO_TARGETS,
  REP_RANGES,
  SETS_CONFIG,
  PROGRESSION_MODELS,
  MINUTES_PER_EXERCISE,
  classifyExercise,
  MOVEMENT_PATTERNS,
} from '../data/scienceConfig';

// ─── Seeded random for deterministic but varied plans ───
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Step 1: Choose Split Template ───
function chooseSplit(days, level, goal) {
  // For 3 days: intermediate+ with strength/muscle goal → PPL, else Full Body
  if (days === 3 && (level === 'intermediate' || level === 'advanced') && (goal === 'muscle' || goal === 'strength')) {
    return SPLIT_TEMPLATES['3_ppl'];
  }
  return SPLIT_TEMPLATES[days] || SPLIT_TEMPLATES[3];
}

// ─── Step 2: Calculate Weekly Volume Budget ───
function calculateWeeklyVolume(level, goal, priorityMuscles = []) {
  const allMuscles = Object.keys(VOLUME_LANDMARKS);
  const volumeMap = {};

  allMuscles.forEach(muscle => {
    const landmarks = VOLUME_LANDMARKS[muscle]?.[level];
    if (!landmarks) return;

    const isPriority = priorityMuscles.includes(muscle);

    if (isPriority) {
      // Push toward MRV for priority muscles
      if (goal === 'muscle') {
        volumeMap[muscle] = Math.round((landmarks.MAV + landmarks.MRV) / 2);
      } else if (goal === 'strength') {
        volumeMap[muscle] = landmarks.MAV;
      } else {
        volumeMap[muscle] = landmarks.MAV;
      }
    } else {
      // Non-priority: target MEV-MAV range depending on goal
      if (goal === 'muscle') {
        volumeMap[muscle] = Math.round((landmarks.MEV + landmarks.MAV) / 2);
      } else if (goal === 'strength') {
        volumeMap[muscle] = landmarks.MEV;
      } else if (goal === 'fat_loss') {
        volumeMap[muscle] = landmarks.MEV;
      } else {
        // general/endurance
        volumeMap[muscle] = Math.round((landmarks.MEV + landmarks.MAV) / 2);
      }
    }
  });

  return volumeMap;
}

// ─── Step 3: Distribute Volume Across Sessions ───
// Given total weekly sets for each muscle and the split's session→muscle mapping,
// figure out how many sets each muscle gets per session.
function distributeVolume(weeklyVolume, sessions) {
  // Count how many sessions train each muscle
  const muscleFrequency = {};
  sessions.forEach(session => {
    session.muscles.forEach(m => {
      muscleFrequency[m] = (muscleFrequency[m] || 0) + 1;
    });
  });

  // Distribute evenly across sessions, rounding up on first occurrence
  const sessionVolumes = sessions.map(session => {
    const vol = {};
    session.muscles.forEach(m => {
      const totalSets = weeklyVolume[m] || 0;
      const freq = muscleFrequency[m] || 1;
      vol[m] = Math.max(2, Math.round(totalSets / freq));
    });
    return vol;
  });

  return sessionVolumes;
}

// ─── Step 4: Build Exercise Pool ───
function buildExercisePool(allowedEquipment) {
  const allExercises = getBundleExercises();
  const equipmentSet = new Set(
    (EQUIPMENT_SETS[allowedEquipment] || EQUIPMENT_SETS.full_gym)
      .map(e => e.toLowerCase())
  );

  // Filter by equipment and classify
  const pool = [];
  allExercises.forEach(ex => {
    // Only gym-modality exercises (skip yoga, pilates, running, etc.)
    const mod = ex.modality || 'gym';
    if (mod !== 'gym') return;

    const equip = (ex.equipment || '').toLowerCase();
    if (!equipmentSet.has(equip)) return;

    const pattern = classifyExercise(ex);
    if (!pattern) return;

    pool.push({ ...ex, _pattern: pattern, _isCompound: MOVEMENT_PATTERNS[pattern]?.isCompound ?? false });
  });

  return pool;
}

// ─── Step 5: Select Exercises for a Session ───
function selectExercisesForSession(sessionMuscles, sessionVolume, pool, goal, level, duration, rng) {
  const goalConfig = REP_RANGES[goal] || REP_RANGES.general;
  const setsConfig = SETS_CONFIG[goal] || SETS_CONFIG.general;
  const progressionModel = PROGRESSION_MODELS[level] || PROGRESSION_MODELS.beginner;

  // How many exercises can we fit in the time budget?
  const maxExercises = Math.floor(duration / 5); // conservative: avg 5 min/exercise

  // Group pool by muscle
  const poolByMuscle = {};
  sessionMuscles.forEach(m => {
    const bodyParts = MUSCLE_TO_BODY_PARTS[m] || [];
    const targets = MUSCLE_TO_TARGETS[m] || [];

    poolByMuscle[m] = pool.filter(ex => {
      const bp = (ex.bodyPart || '').toLowerCase();
      const tgt = (ex.target || '').toLowerCase();

      // Match by bodyPart
      if (bodyParts.some(b => bp === b.toLowerCase())) {
        // If multiple muscles share a bodyPart (e.g., quads vs hamstrings for 'upper legs'),
        // use target to disambiguate
        if (targets.length > 0) {
          return targets.some(t => tgt.includes(t.toLowerCase()));
        }
        return true;
      }
      return false;
    });
  });

  const selectedExercises = [];
  const usedIds = new Set();
  let totalSetsAllocated = 0;

  // For each muscle, pick exercises to fill the volume budget
  // Sort muscles: prioritize those with more volume needed
  const musclesByVolume = [...sessionMuscles].sort((a, b) => (sessionVolume[b] || 0) - (sessionVolume[a] || 0));

  musclesByVolume.forEach(muscle => {
    const targetSets = sessionVolume[muscle] || 0;
    if (targetSets <= 0) return;

    const candidates = shuffle(poolByMuscle[muscle] || [], rng);
    if (candidates.length === 0) return;

    // Separate compounds and isolation
    const compounds = candidates.filter(e => e._isCompound);
    const isolations = candidates.filter(e => !e._isCompound);

    let setsRemaining = targetSets;

    // Pick a compound first if available
    if (compounds.length > 0 && selectedExercises.length < maxExercises) {
      const pick = compounds.find(e => !usedIds.has(e.id)) || compounds[0];
      const sets = Math.min(setsConfig.compound, setsRemaining);
      const repRange = goalConfig.compound;
      selectedExercises.push(formatExercise(pick, sets, repRange, progressionModel, true));
      usedIds.add(pick.id);
      setsRemaining -= sets;
      totalSetsAllocated += sets;
    }

    // Fill remaining volume with isolation
    let isoIdx = 0;
    while (setsRemaining > 0 && isoIdx < isolations.length && selectedExercises.length < maxExercises) {
      const pick = isolations[isoIdx];
      if (!usedIds.has(pick.id)) {
        const sets = Math.min(setsConfig.isolation, setsRemaining);
        const repRange = goalConfig.isolation;
        selectedExercises.push(formatExercise(pick, sets, repRange, progressionModel, false));
        usedIds.add(pick.id);
        setsRemaining -= sets;
        totalSetsAllocated += sets;
      }
      isoIdx++;
    }

    // If still sets remaining and we have unused compounds
    if (setsRemaining > 0 && selectedExercises.length < maxExercises) {
      for (const pick of compounds) {
        if (usedIds.has(pick.id) || setsRemaining <= 0 || selectedExercises.length >= maxExercises) continue;
        const sets = Math.min(setsConfig.compound, setsRemaining);
        const repRange = goalConfig.compound;
        selectedExercises.push(formatExercise(pick, sets, repRange, progressionModel, true));
        usedIds.add(pick.id);
        setsRemaining -= sets;
        totalSetsAllocated += sets;
      }
    }
  });

  // Sort by movement pattern order (compounds first, then isolation)
  selectedExercises.sort((a, b) => {
    const orderA = MOVEMENT_PATTERNS[a._pattern]?.order ?? 99;
    const orderB = MOVEMENT_PATTERNS[b._pattern]?.order ?? 99;
    return orderA - orderB;
  });

  return selectedExercises;
}

// ─── Format Exercise for Output ───
function formatExercise(exercise, sets, repRange, progressionModel, isCompound) {
  return {
    id: exercise.id,
    nome: exercise.name,
    series: String(sets),
    reps: `${repRange.min}–${repRange.max}`,
    musculos: [exercise.bodyPart, ...(exercise.secondaryMuscles || [])].filter(Boolean),
    // New science-based metadata
    targetRpe: repRange.targetRpe,
    restSeconds: repRange.rest,
    progressionType: progressionModel.type,
    isCompound,
    _pattern: exercise._pattern,
  };
}

// ─── Muscle → Portuguese name mapping for session grupos ───
const MUSCLE_PT = {
  chest: 'Peito',
  back: 'Costas',
  shoulders: 'Ombros',
  quads: 'Quadríceps',
  hamstrings: 'Posterior',
  glutes: 'Glúteos',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  calves: 'Panturrilhas',
  abs: 'Abdômen',
  traps: 'Trapézio',
};

// ─── Main Generator ───
/**
 * Generate a science-based workout plan.
 *
 * @param {Object} params
 * @param {string|string[]} params.goals - Array of goals, or single goal string (backward compat)
 * @param {string} [params.goal] - Single goal string (backward compat, use goals instead)
 * @param {string} params.level - 'beginner' | 'intermediate' | 'advanced'
 * @param {number} params.days - 2-6
 * @param {string} params.equipment - 'full_gym' | 'home' | 'minimal'
 * @param {number} params.duration - session duration in minutes (30, 45, 60, 90)
 * @param {string[]} params.priorityMuscles - 0-2 muscle keys (e.g., ['chest', 'glutes'])
 * @returns {Object} vida_workout_plan-compatible plan
 */
export function generateAdvancedPlan({ goals, goal, level, days, equipment, duration, priorityMuscles = [] }) {
  // Normalize: accept goals array or single goal string
  const goalsArray = goals ? (Array.isArray(goals) ? goals : [goals]) : (goal ? [goal] : ['general']);
  const primaryGoal = goalsArray[0];

  const seed = (goalsArray.join(',') + level + days + equipment + (priorityMuscles.join(','))).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);

  // 1. Choose split
  const split = chooseSplit(days, level, primaryGoal);

  // 2. Calculate weekly volume
  const weeklyVolume = calculateWeeklyVolume(level, primaryGoal, priorityMuscles);

  // 3. Distribute volume across sessions
  const sessionVolumes = distributeVolume(weeklyVolume, split.sessions);

  // 4. Build exercise pool
  const pool = buildExercisePool(equipment);

  // 5. Select exercises for each session
  const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Assign days — spread evenly with recovery
  const trainingDays = pickTrainingDays(days, WEEKDAYS);

  const dayActivities = {};
  const splitEntries = [];

  split.sessions.forEach((session, i) => {
    const day = trainingDays[i];
    const exercises = selectExercisesForSession(
      session.muscles,
      sessionVolumes[i],
      pool,
      primaryGoal,
      level,
      duration,
      rng
    );

    // Clean up internal fields before output
    const cleanExercises = exercises.map(({ _pattern, ...rest }) => rest);

    const sessionObj = {
      label: String(i + 1),
      name: session.name,
      focus: session.focus,
      icon: session.icon || 'dumbbell-1',
      // Science metadata
      targetMuscles: session.muscles,
      volumeDistribution: sessionVolumes[i],
    };

    dayActivities[day] = {
      type: 'gym',
      session: sessionObj,
      exercises: cleanExercises,
    };

    splitEntries.push({
      day,
      label: sessionObj.label,
      name: session.name,
      focus: session.focus,
      icon: sessionObj.icon,
    });
  });

  return {
    name: generatePlanName(split.type, primaryGoal, level),
    splitType: split.type,
    trainingDays,
    dayActivities,
    split: splitEntries,
    goals: goalsArray,
    // Science metadata
    level,
    equipment,
    duration,
    priorityMuscles,
    weeklyVolume,
    progressionModel: PROGRESSION_MODELS[level],
    generatedAt: new Date().toISOString(),
    generatorVersion: 'advanced-v1',
  };
}

// ─── Pick Training Days with Optimal Recovery ───
function pickTrainingDays(numDays, weekdays) {
  // Spread days as evenly as possible across the week
  const patterns = {
    2: [0, 3],               // Mon, Thu
    3: [0, 2, 4],            // Mon, Wed, Fri
    4: [0, 1, 3, 4],         // Mon, Tue, Thu, Fri
    5: [0, 1, 2, 3, 4],      // Mon-Fri
    6: [0, 1, 2, 3, 4, 5],   // Mon-Sat
  };
  const indices = patterns[numDays] || patterns[3];
  return indices.map(i => weekdays[i]);
}

// ─── Generate a descriptive plan name ───
function generatePlanName(splitType, goal, level) {
  const goalNames = {
    muscle: { 'pt-BR': 'Hipertrofia', en: 'Hypertrophy' },
    strength: { 'pt-BR': 'Força', en: 'Strength' },
    fat_loss: { 'pt-BR': 'Queima', en: 'Fat Loss' },
    endurance: { 'pt-BR': 'Resistência', en: 'Endurance' },
    general: { 'pt-BR': 'Geral', en: 'General' },
  };
  const levelNames = {
    beginner: { 'pt-BR': 'Iniciante', en: 'Beginner' },
    intermediate: { 'pt-BR': 'Intermediário', en: 'Intermediate' },
    advanced: { 'pt-BR': 'Avançado', en: 'Advanced' },
  };
  return {
    'pt-BR': `${splitType} — ${goalNames[goal]?.['pt-BR'] || goal} (${levelNames[level]?.['pt-BR'] || level})`,
    en: `${splitType} — ${goalNames[goal]?.en || goal} (${levelNames[level]?.en || level})`,
  };
}
