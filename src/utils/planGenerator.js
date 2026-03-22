// src/utils/planGenerator.js
import { getRunSessionByIndex } from '../data/running';
import { getWodByIndex } from '../data/crossfit';
import { getCalisthenicsSplitByIndex } from '../data/calisthenics';
import { getPilatesFlowByIndex } from '../data/pilates';
import { getYogaSessionByIndex } from '../data/yoga';

// Copied verbatim from OnboardingFlow.jsx lines 1044-1085
function getTrainingSplit(goals) {
  const hasMusclGain = goals.includes('muscle_gain');
  const hasWeightLoss = goals.includes('weight_loss');

  if (hasMusclGain) {
    return {
      type: 'PPL',
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Push', focus: { 'pt-BR': 'Peito, Ombro, Tríceps', 'en': 'Chest, Shoulder, Triceps' }, icon: '💪' },
        { label: 'B', name: 'Pull', focus: { 'pt-BR': 'Costas, Bíceps', 'en': 'Back, Biceps' }, icon: '🔙' },
        { label: 'C', name: 'Legs', focus: { 'pt-BR': 'Quadríceps, Glúteo, Posterior', 'en': 'Quads, Glutes, Hamstrings' }, icon: '🦵' },
        { label: 'D', name: 'Push+', focus: { 'pt-BR': 'Ombro foco, Tríceps', 'en': 'Shoulder focus, Triceps' }, icon: '🔥' },
        { label: 'E', name: 'Pull+', focus: { 'pt-BR': 'Costas largura, Bíceps', 'en': 'Back width, Biceps' }, icon: '⚡' },
      ]
    };
  } else if (hasWeightLoss) {
    return {
      type: 'Upper/Lower',
      days: ['Seg', 'Ter', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'B', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
        { label: 'C', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'D', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
      ]
    };
  } else {
    return {
      type: 'Full Body',
      days: ['Seg', 'Qua', 'Sex'],
      split: [
        { label: 'A', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'B', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'C', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
      ]
    };
  }
}

// Based on OnboardingFlow.jsx lines 1109-1221, with trainingDays override support
// When profile.trainingDays is provided (from Settings), those explicit days are used.
// When not provided (from Onboarding), days are derived from goals as before.
function getActivityPlan(goals, mainActivities, addOnActivities, explicitTrainingDays) {
  const mains = mainActivities && mainActivities.length > 0 ? mainActivities : ['gym'];
  const addons = addOnActivities || [];

  const gymSplit = getTrainingSplit(goals);

  // Use explicit training days if provided (from Settings), otherwise derive from goals
  let trainingDaySlots;
  if (explicitTrainingDays && explicitTrainingDays.length > 0) {
    trainingDaySlots = explicitTrainingDays;
  } else {
    const hasMusclGain = goals.includes('muscle_gain');
    const hasWeightLoss = goals.includes('weight_loss');
    const totalMainDays = hasMusclGain ? 5 : hasWeightLoss ? 4 : 3;
    trainingDaySlots = gymSplit.days.slice(0, totalMainDays);
  }

  const dayActivities = {};
  const activityCounters = {};
  mains.forEach(a => { activityCounters[a] = 0; });

  trainingDaySlots.forEach((day, i) => {
    const activityType = mains[i % mains.length];
    const counter = activityCounters[activityType];

    let session = null;
    if (activityType === 'gym') {
      session = { ...gymSplit.split[counter % gymSplit.split.length] };
    } else if (activityType === 'crossfit') {
      session = getWodByIndex(counter);
    } else if (activityType === 'calisthenics') {
      session = getCalisthenicsSplitByIndex(counter);
    } else if (activityType === 'pilates') {
      session = getPilatesFlowByIndex(counter);
    }

    dayActivities[day] = { type: activityType, session };
    activityCounters[activityType] = counter + 1;
  });

  const allWeekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const freeDays = allWeekdays.filter(d => !dayActivities[d]);
  const addonCounters = {};

  addons.forEach(addon => {
    addonCounters[addon.type] = 0;
    let placed = 0;
    const targetFreq = addon.frequency || 2;

    // If add-on has explicit days (from Settings), use those directly
    if (addon.days && addon.days.length > 0) {
      addon.days.forEach(day => {
        let session = null;
        if (addon.type === 'running') {
          session = getRunSessionByIndex(addonCounters[addon.type]);
        } else if (addon.type === 'yoga') {
          session = getYogaSessionByIndex(addonCounters[addon.type]);
        }

        if (dayActivities[day]) {
          // Stack as secondary on existing day
          if (!dayActivities[day].secondary) {
            dayActivities[day].secondary = { type: addon.type, session };
          }
        } else {
          dayActivities[day] = { type: addon.type, session };
        }
        addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
        placed++;
      });
      return; // skip auto-placement below
    }

    // Auto-placement (from Onboarding — no explicit days)
    for (let d = 0; d < freeDays.length && placed < targetFreq; d++) {
      const day = freeDays[d];
      if (dayActivities[day]) continue;

      if (addon.type === 'running') {
        const dayIdx = allWeekdays.indexOf(day);
        const prevDay = dayIdx > 0 ? allWeekdays[dayIdx - 1] : null;
        const nextDay = dayIdx < allWeekdays.length - 1 ? allWeekdays[dayIdx + 1] : null;
        const isLegDay = (d) => {
          const act = dayActivities[d];
          if (!act || act.type !== 'gym') return false;
          const name = act.session?.name || '';
          return name === 'Legs' || name === 'Lower';
        };
        if ((prevDay && isLegDay(prevDay)) || (nextDay && isLegDay(nextDay))) continue;
      }

      let session = null;
      if (addon.type === 'running') {
        session = getRunSessionByIndex(addonCounters[addon.type]);
      } else if (addon.type === 'yoga') {
        session = getYogaSessionByIndex(addonCounters[addon.type]);
      }

      dayActivities[day] = { type: addon.type, session };
      addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
      placed++;
      freeDays.splice(d, 1);
      d--;
    }

    if (placed < targetFreq) {
      const mainDays = Object.keys(dayActivities).filter(d =>
        dayActivities[d].type !== addon.type && !dayActivities[d].secondary
      );
      for (let m = 0; m < mainDays.length && placed < targetFreq; m++) {
        let session = null;
        if (addon.type === 'running') {
          session = getRunSessionByIndex(addonCounters[addon.type]);
        } else if (addon.type === 'yoga') {
          session = getYogaSessionByIndex(addonCounters[addon.type]);
        }
        dayActivities[mainDays[m]].secondary = { type: addon.type, session };
        addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
        placed++;
      }
    }
  });

  return {
    trainingDays: Object.keys(dayActivities),
    dayActivities,
    splitType: gymSplit.type,
    split: gymSplit.split.map((s, i) => ({
      day: gymSplit.days[i],
      label: s.label,
      name: s.name,
      focus: s.focus,
      icon: s.icon
    })),
  };
}

/**
 * Generate a complete workout plan from a user profile.
 * Pure function, no side effects.
 *
 * @param {Object} profile - userProfile object from useOnboarding
 * @returns {Object} plan ready to save to vida_workout_plan
 */
export function generateWorkoutPlan(profile) {
  const goals = profile.goals || (profile.goal ? [profile.goal] : []);
  const mainActivities = profile.mainActivities || ['gym'];
  const addOnActivities = profile.addOnActivities || [];

  // profile.trainingDays is set by Settings (user-chosen days); undefined during onboarding (derived from goals)
  const activityPlan = getActivityPlan(goals, mainActivities, addOnActivities, profile.trainingDays);

  return {
    splitType: activityPlan.splitType,
    trainingDays: activityPlan.trainingDays,
    dayActivities: activityPlan.dayActivities,
    split: activityPlan.split,
    goals,
    generatedAt: new Date().toISOString(),
  };
}
