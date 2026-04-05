import { useMemo } from 'react';
import { TREINOS, getWorkoutBySplit, getExerciseName } from '../data/treinos';

// Muscle group aggregation mapping (exact accented tags from treinos.js)
const MUSCLE_GROUPS = {
  Chest: ['Peito'],
  Back: ['Costas', 'Trapézio'],
  Shoulders: ['Ombros'],
  Arms: ['Bíceps', 'Tríceps'],
  Legs: ['Quadríceps', 'Posterior', 'Glúteos', 'Panturrilhas'],
  Core: [],  // Seeded from CrossFit/Pilates/Calisthenics
};

// Reverse map: tag → group
const TAG_TO_GROUP = {};
Object.entries(MUSCLE_GROUPS).forEach(([group, tags]) => {
  tags.forEach(tag => { TAG_TO_GROUP[tag] = group; });
});

function getTrainingDays() {
  try {
    return JSON.parse(localStorage.getItem('training_days') || '[]');
  } catch { return []; }
}

function getUserProfile() {
  try {
    return JSON.parse(localStorage.getItem('vida_user_profile') || '{}');
  } catch { return {}; }
}

function getWorkoutPlan() {
  try {
    const raw = localStorage.getItem('vida_workout_plan');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Count training weeks streak (a week counts if trained at least once)
function calculateWeekStreak(trainingDays) {
  if (!trainingDays.length) return 0;

  const sortedDates = [...trainingDays].sort().reverse();
  const now = new Date();

  // Get current week's Monday
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  }

  // Build set of weeks that have training
  const weeksWithTraining = new Set();
  sortedDates.forEach(dateStr => {
    weeksWithTraining.add(getMonday(dateStr));
  });

  // Count consecutive weeks from current week backward
  let streak = 0;
  let checkDate = new Date(now);

  while (true) {
    const monday = getMonday(checkDate);
    if (weeksWithTraining.has(monday)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

// Get today's scheduled activities from workout plan (supports stacked secondary)
function getTodayActivities(plan) {
  if (!plan?.dayActivities) return [];

  const dayMap = {
    'domingo': 'Dom', 'segunda-feira': 'Seg', 'terça-feira': 'Ter',
    'quarta-feira': 'Qua', 'quinta-feira': 'Qui', 'sexta-feira': 'Sex',
    'sábado': 'Sáb'
  };
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const todayKey = dayMap[today.toLowerCase()];

  if (!todayKey) return [];
  const entry = plan.dayActivities[todayKey];
  if (!entry) return [];

  const activities = [{ type: entry.type, session: entry.session }];
  if (entry.secondary) {
    activities.push({ type: entry.secondary.type, session: entry.secondary.session });
  }
  return activities;
}

// Get next scheduled activity (for rest day context)
function getNextActivity(plan) {
  if (!plan?.dayActivities) return null;

  const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...

  for (let i = 1; i <= 7; i++) {
    const nextIndex = (todayIndex + i) % 7;
    const dayKey = dayOrder[nextIndex];
    const entry = plan.dayActivities[dayKey];
    if (entry) {
      const isTomorrow = i === 1;
      return { dayKey, type: entry.type, session: entry.session, isTomorrow };
    }
  }
  return null;
}

// Count sessions this week
function getWeeklyCount(trainingDays) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  return trainingDays.filter(d => d >= mondayStr).length;
}

// Count sessions for a given month (YYYY-MM)
function getMonthCount(trainingDays, yearMonth) {
  return trainingDays.filter(d => d.startsWith(yearMonth)).length;
}

// Scan localStorage for gym exercise data to compute volume and sets
function computeGymStats(trainingDays) {
  let totalVolume = 0;
  let totalSets = 0;
  const exercisePRs = {}; // exerciseId → max weight

  // Scan all localStorage keys for exercise data
  const allKeys = Object.keys(localStorage);
  const exerciseKeys = allKeys.filter(k => {
    // Match pattern: dayKey_exerciseId (e.g., segunda_supino_reto)
    return k.includes('_') && !k.startsWith('vida_') && !k.startsWith('crossfit_')
      && !k.startsWith('run_') && !k.startsWith('calisthenics_') && !k.startsWith('pilates_')
      && !k.startsWith('yoga_') && !k.startsWith('last_') && !k.startsWith('training_')
      && !k.startsWith('lifeplanner_') && !k.startsWith('meals_') && !k.startsWith('workout_');
  });

  exerciseKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data || !data.feito) return;

      const peso = parseFloat(data.peso) || 0;
      // Extract exerciseId from key (everything after first _)
      const parts = key.split('_');
      const exerciseId = parts.slice(1).join('_');

      if (peso > 0) {
        // Find exercise in catalog for sets/reps
        let series = 3, reps = 10; // defaults
        Object.values(TREINOS).forEach(treino => {
          if (!treino?.exercicios) return;
          const ex = treino.execicios.find(e => e.id === exerciseId);
          if (ex) {
            series = parseInt(ex.series) || 3;
            reps = parseInt(ex.reps) || 10;
          }
        });

        totalVolume += peso * series * reps;
        totalSets += series;

        // Track PRs
        if (!exercisePRs[exerciseId] || peso > exercisePRs[exerciseId]) {
          exercisePRs[exerciseId] = peso;
        }
      }
    } catch { /* skip invalid entries */ }
  });

  return { totalVolume, totalSets, exercisePRs };
}

// Compute muscle group set counts from completed exercises
function computeMuscleSets(period) {
  const counts = { Chest: 0, Back: 0, Shoulders: 0, Arms: 0, Legs: 0, Core: 0 };
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    // Match gym exercise keys
    if (key.startsWith('vida_') || key.startsWith('crossfit_') || key.startsWith('run_')
      || key.startsWith('calisthenics_') || key.startsWith('pilates_') || key.startsWith('yoga_')
      || key.startsWith('last_') || key.startsWith('training_') || key.startsWith('lifeplanner_')
      || key.startsWith('meals_') || key.startsWith('workout_')) return;

    if (!key.includes('_')) return;

    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data?.feito) return;

      const parts = key.split('_');
      const exerciseId = parts.slice(1).join('_');

      // Find exercise in catalog to get muscle groups
      Object.values(TREINOS).forEach(treino => {
        if (!treino?.exercicios) return;
        const ex = treino.exercicios.find(e => e.id === exerciseId);
        if (ex) {
          const series = parseInt(ex.series) || 3;
          ex.musculos.forEach(muscle => {
            const group = TAG_TO_GROUP[muscle];
            if (group) counts[group] += series;
          });
        }
      });
    } catch { /* skip */ }
  });

  return counts;
}

// Get monthly data for last 12 months
function getMonthlyData(trainingDays) {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = getMonthCount(trainingDays, yearMonth);
    months.push({
      month: yearMonth,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      workouts: count,
    });
  }

  return months;
}

// Determine primary activity type (whichever has most scheduled days)
function getPrimaryActivity(plan) {
  if (!plan?.dayActivities) return 'gym';

  const typeCounts = {};
  Object.values(plan.dayActivities).forEach(activity => {
    const type = activity.type || 'gym';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'gym';
}

// Get activity types the user has
function getUserActivityTypes(plan) {
  if (!plan?.dayActivities) return ['gym'];
  const types = new Set();
  Object.values(plan.dayActivities).forEach(a => types.add(a.type || 'gym'));
  return [...types];
}

// Get training data for a specific date (for calendar detail)
function getDateActivityData(date, plan) {
  if (!plan?.dayActivities) return null;

  // Find which weekday this date falls on
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const d = new Date(date + 'T12:00:00');
  const weekday = dayMap[d.getDay()];

  const activity = plan.dayActivities[weekday];
  if (!activity) return null;

  // Check for stored data
  const result = { type: activity.type, session: activity.session };

  if (activity.type === 'crossfit') {
    const stored = localStorage.getItem(`crossfit_${weekday}_${date}`);
    if (stored) result.data = JSON.parse(stored);
  } else if (activity.type === 'running') {
    const stored = localStorage.getItem(`run_${weekday}_${date}`);
    if (stored) result.data = JSON.parse(stored);
  }

  return result;
}

export function useDashboardData() {
  return useMemo(() => {
    const trainingDays = getTrainingDays();
    const profile = getUserProfile();
    const plan = getWorkoutPlan();
    const todayActivities = getTodayActivities(plan);
    const nextActivity = getNextActivity(plan);
    const primaryActivity = getPrimaryActivity(plan);
    const activityTypes = getUserActivityTypes(plan);

    const weekStreak = calculateWeekStreak(trainingDays);
    const weeklyCount = getWeeklyCount(trainingDays);
    const weeklyTarget = profile.trainingDays?.length || 5;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthCount = getMonthCount(trainingDays, currentMonth);
    const prevMonthCount = getMonthCount(trainingDays, prevMonth);

    const gymStats = computeGymStats(trainingDays);
    const muscleSets = computeMuscleSets('current');
    const monthlyData = getMonthlyData(trainingDays);

    return {
      // Profile
      profile,
      plan,

      // Hero
      todayActivities,
      nextActivity,
      primaryActivity,
      activityTypes,
      weekStreak,
      weeklyCount,
      weeklyTarget,

      // Monthly
      currentMonthCount,
      prevMonthCount,
      monthlyData,
      gymStats,

      // Muscle
      muscleSets,

      // Calendar
      trainingDays,
      getDateActivityData: (date) => getDateActivityData(date, plan),

      // Utility
      getPrimaryActivity: () => primaryActivity,
    };
  }, []);
}
