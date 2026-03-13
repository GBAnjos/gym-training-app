import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../data/supabase';

const STORAGE_KEY_PREFIX = 'vida_onboarding_';
const PROFILE_KEY = 'vida_user_profile';

export function useOnboarding() {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Get user-specific storage key
  const getStorageKey = useCallback(() => {
    return user ? `${STORAGE_KEY_PREFIX}${user.id}` : null;
  }, [user]);

  // Check onboarding status
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storageKey = getStorageKey();

    try {
      // 1. Check localStorage first for instant response
      const localComplete = localStorage.getItem(storageKey);
      const localProfile = localStorage.getItem(PROFILE_KEY);

      if (localComplete === 'true' && localProfile) {
        try {
          const profile = JSON.parse(localProfile);
          setUserProfile(profile);
          setIsComplete(true);
          setIsLoading(false);
          return;
        } catch (e) {
          // Invalid JSON, continue to Supabase check
        }
      }

      // 2. Check Supabase for user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // No profile found - user needs to complete onboarding
        console.log('No profile found, showing onboarding');
        setIsComplete(false);
        setIsLoading(false);
        return;
      }

      if (data?.onboarding_complete) {
        // Profile exists and onboarding is complete
        localStorage.setItem(storageKey, 'true');
        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        setUserProfile(data);
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      // On error, check if we have local data as fallback
      const localProfile = localStorage.getItem(PROFILE_KEY);
      if (localProfile) {
        try {
          setUserProfile(JSON.parse(localProfile));
          setIsComplete(true);
        } catch (e) {
          setIsComplete(false);
        }
      } else {
        setIsComplete(false);
      }
    }
    setIsLoading(false);
  }, [user, getStorageKey]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      // No user - reset all state immediately
      setIsLoading(false);
      setIsComplete(null);
      setUserProfile(null);
    }
  }, [user, checkOnboardingStatus]);

  // Complete onboarding and save profile
  const completeOnboarding = async (profileData) => {
    if (!user) return false;

    const storageKey = getStorageKey();

    try {
      // Prepare data for Supabase - support both old and new profile schemas
      const supabaseData = {
        user_id: user.id,
        // New schema fields (Patch 01)
        wake_time: profileData.wakeTime || null,
        sleep_hours: profileData.sleepHours ? parseFloat(profileData.sleepHours) : null,
        lunch_time: profileData.lunchTime || null,
        dinner_time: profileData.dinnerTime || null,
        gym_preference: profileData.gymPreference || null,
        office_days_count: profileData.officeDaysCount != null ? parseInt(profileData.officeDaysCount) : null,
        office_start: profileData.officeStart || null,
        office_end: profileData.officeEnd || null,
        goals: profileData.goals || [],
        // Physical data (optional)
        current_weight: profileData.weight ? parseFloat(profileData.weight) : null,
        height: profileData.height ? parseFloat(profileData.height) : null,
        body_fat_percent: profileData.bodyFatPercent ? parseFloat(profileData.bodyFatPercent) : null,
        // Legacy fields for compatibility
        name: profileData.name || null,
        sex: profileData.sex || null,
        age: profileData.age ? parseInt(profileData.age) : null,
        target_weight: profileData.targetWeight ? parseFloat(profileData.targetWeight) : null,
        wake_up_time: profileData.wakeTime || profileData.wakeUpTime || null,
        sleep_time: profileData.sleepTime || null,
        office_days: profileData.officeDays || [],
        goal: profileData.goal || (profileData.goals && profileData.goals[0]) || null,
        fitness_level: profileData.fitnessLevel || null,
        training_days: profileData.trainingDays || [],
        training_time: profileData.gymPreference || profileData.trainingTime || null,
        dietary_restrictions: profileData.dietaryRestrictions || [],
        meal_prep: profileData.mealPrep,
        hobbies: profileData.hobbies || [],
        chores_frequency: profileData.choresFrequency || null,
        grocery_frequency: profileData.groceryFrequency || null,
        weekend_routine: profileData.weekendRoutine || null,
        exercise_type: profileData.exerciseType || null,
        gym_type: profileData.gymType || [],
        sports: profileData.sports || [],
        preferred_language: profileData.preferredLanguage || 'pt-BR',
        onboarding_complete: true,
        updated_at: new Date().toISOString()
      };

      // Save to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert(supabaseData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Supabase error:', error);
        // Still save locally even if Supabase fails
      }

      // Save to localStorage (always, as backup)
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));

      setUserProfile(profileData);
      setIsComplete(true);
      return true;
    } catch (err) {
      console.error('Error completing onboarding:', err);
      // Try to save locally at least
      try {
        localStorage.setItem(storageKey, 'true');
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
        setUserProfile(profileData);
        setIsComplete(true);
        return true;
      } catch (localErr) {
        return false;
      }
    }
  };

  // Reset onboarding (for settings menu)
  const resetOnboarding = useCallback(async () => {
    const storageKey = getStorageKey();

    // Clear localStorage
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    localStorage.removeItem(PROFILE_KEY);

    // Update Supabase to mark onboarding as incomplete
    if (user) {
      try {
        await supabase
          .from('user_profiles')
          .update({ onboarding_complete: false })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Error resetting onboarding in Supabase:', err);
      }
    }

    setIsComplete(false);
    setUserProfile(null);
  }, [getStorageKey, user]);

  // Update profile without full onboarding
  const updateProfile = async (profileData) => {
    if (!user) return false;

    try {
      const merged = { ...userProfile, ...profileData };

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) console.error('Update error:', error);

      localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
      setUserProfile(merged);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  return {
    isOnboardingComplete: isComplete,
    isCheckingOnboarding: isLoading,
    userProfile,
    completeOnboarding,
    resetOnboarding,
    updateProfile,
    refreshOnboardingStatus: checkOnboardingStatus
  };
}

// Sports label map
const SPORTS_LABELS = {
  futebol: { pt: 'Futebol', en: 'Soccer', icon: '⚽' },
  basquete: { pt: 'Basquete', en: 'Basketball', icon: '🏀' },
  volei: { pt: 'Vôlei', en: 'Volleyball', icon: '🏐' },
  natacao: { pt: 'Natação', en: 'Swimming', icon: '🏊' },
  corrida: { pt: 'Corrida', en: 'Running', icon: '🏃' },
  ciclismo: { pt: 'Ciclismo', en: 'Cycling', icon: '🚴' },
  tenis: { pt: 'Tênis', en: 'Tennis', icon: '🎾' },
  artes_marciais: { pt: 'Artes Marciais', en: 'Martial Arts', icon: '🥋' },
  danca: { pt: 'Dança', en: 'Dance', icon: '💃' },
  yoga: { pt: 'Yoga', en: 'Yoga', icon: '🧘' },
  escalada: { pt: 'Escalada', en: 'Climbing', icon: '🧗' },
  outro: { pt: 'Esporte', en: 'Sport', icon: '🏅' },
};

// Helper to generate personalized schedule based on user preferences
export function generatePersonalizedSchedule(profile) {
  const { wakeUpTime, officeDays, trainingDays, trainingTime, dinnerTime, weekendRoutine, choresFrequency, exerciseType, sports } = profile;

  // Parse times
  const wakeHour = parseInt((wakeUpTime || '06:30').split(':')[0]);
  const dinnerHour = parseInt((dinnerTime || '19:30').split(':')[0]);

  // Build sports schedule lookup by day
  const sportsScheduleByDay = {};
  if (sports && sports.length > 0) {
    sports.forEach(sport => {
      (sport.days || []).forEach(day => {
        if (!sportsScheduleByDay[day]) {
          sportsScheduleByDay[day] = [];
        }
        sportsScheduleByDay[day].push({
          sportId: sport.sportId,
          time: sport.time || 'evening'
        });
      });
    });
  }

  // Generate schedule based on preferences
  const schedule = {};
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  days.forEach((day, index) => {
    const isWeekend = index >= 5;
    const isOfficeDay = (officeDays || []).includes(day);
    const isTrainingDay = (trainingDays || []).includes(day);
    const daySports = sportsScheduleByDay[day] || [];

    schedule[day] = {
      type: isWeekend ? 'weekend' : (isOfficeDay ? 'office' : 'home'),
      blocks: generateDayBlocks({
        day,
        isWeekend,
        isOfficeDay,
        isTrainingDay,
        wakeHour,
        dinnerHour,
        trainingTime: trainingTime || 'morning',
        weekendRoutine: weekendRoutine || 'relaxed',
        choresFrequency: choresFrequency || 'weekly',
        exerciseType: exerciseType || 'none',
        sports: daySports
      })
    };
  });

  return schedule;
}

function generateDayBlocks({ day, isWeekend, isOfficeDay, isTrainingDay, wakeHour, dinnerHour, trainingTime, weekendRoutine, choresFrequency, exerciseType, sports }) {
  const blocks = [];
  const isRelaxedWeekend = isWeekend && weekendRoutine === 'relaxed';
  const timePrefix = isRelaxedWeekend ? '~' : '';

  // Check if this day has gym or sports
  const hasGymToday = isTrainingDay && (exerciseType === 'gym' || exerciseType === 'both');
  const morningSports = sports.filter(s => s.time === 'morning');
  const afternoonSports = sports.filter(s => s.time === 'afternoon');
  const eveningSports = sports.filter(s => s.time === 'evening');

  // Adjust wake time for relaxed weekends
  const adjustedWakeHour = isRelaxedWeekend ? wakeHour + 1 : wakeHour;

  // Wake up
  blocks.push({
    time: `${timePrefix}${adjustedWakeHour}:00`,
    icon: '🌅',
    label: 'Acordar',
    sub: isRelaxedWeekend ? 'Sem pressa hoje' : 'Novo dia, novas conquistas',
    type: 'morning'
  });

  // Morning routine
  blocks.push({
    time: `${timePrefix}${adjustedWakeHour}:15`,
    icon: '☕',
    label: 'Rotina matinal',
    sub: 'Café, alongamento, preparar o dia',
    type: 'morning'
  });

  // Morning gym (if training day and morning preference)
  if (hasGymToday && trainingTime === 'morning') {
    blocks.push({
      time: `${timePrefix}${adjustedWakeHour}:30`,
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Morning sports
  morningSports.forEach(sport => {
    const sportInfo = SPORTS_LABELS[sport.sportId] || SPORTS_LABELS.outro;
    blocks.push({
      time: `${timePrefix}${adjustedWakeHour + 1}:00`,
      icon: sportInfo.icon,
      label: sportInfo.pt,
      sub: 'Treino de esporte',
      type: 'sport',
      tag: 'sport'
    });
  });

  // Breakfast
  const breakfastTime = (hasGymToday && trainingTime === 'morning') || morningSports.length > 0
    ? adjustedWakeHour + 2
    : adjustedWakeHour + 1;
  blocks.push({
    time: `${timePrefix}${breakfastTime}:00`,
    icon: '🍳',
    label: 'Café da manhã',
    sub: 'Refeição completa pra começar bem',
    type: 'food'
  });

  // Work (if not weekend)
  if (!isWeekend) {
    blocks.push({
      time: '9:00',
      icon: isOfficeDay ? '💼' : '💻',
      label: isOfficeDay ? 'Escritório' : 'Trabalho',
      sub: isOfficeDay ? 'Foco no que importa' : 'Bloco de trabalho profundo',
      type: 'work',
      tag: isOfficeDay ? 'office' : undefined
    });

    blocks.push({
      time: '13:00',
      icon: '🥗',
      label: 'Almoço',
      sub: 'Pausa real pra comer bem',
      type: 'food'
    });

    blocks.push({
      time: '14:00',
      icon: '💻',
      label: 'Trabalho — tarde',
      sub: 'Finalizar as tarefas do dia',
      type: 'work'
    });

    blocks.push({
      time: '17:00',
      icon: '🔒',
      label: 'Fechar o trabalho',
      sub: 'Acabou. Não volta mais hoje.',
      type: 'work'
    });
  } else {
    // Weekend activities
    if (weekendRoutine === 'active') {
      blocks.push({
        time: '~10:00',
        icon: '🎯',
        label: 'Atividade livre',
        sub: 'Hobbies, projetos pessoais',
        type: 'free'
      });
    }

    blocks.push({
      time: '~12:30',
      icon: '🥗',
      label: 'Almoço',
      sub: 'Refeição sem pressa',
      type: 'food'
    });
  }

  // Chores (based on frequency)
  if (choresFrequency === 'daily' || (choresFrequency === 'weekly' && day === 'Sáb')) {
    blocks.push({
      time: isWeekend ? '~14:00' : '17:30',
      icon: '🧹',
      label: 'Tarefas de casa',
      sub: choresFrequency === 'daily' ? 'Organização diária' : 'Limpeza semanal',
      type: 'chore'
    });
  }

  // Afternoon gym (if applicable)
  if (hasGymToday && trainingTime === 'afternoon') {
    blocks.push({
      time: isWeekend ? '~15:00' : '17:30',
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Afternoon sports
  afternoonSports.forEach(sport => {
    const sportInfo = SPORTS_LABELS[sport.sportId] || SPORTS_LABELS.outro;
    blocks.push({
      time: isWeekend ? '~15:30' : '16:00',
      icon: sportInfo.icon,
      label: sportInfo.pt,
      sub: 'Treino de esporte',
      type: 'sport',
      tag: 'sport'
    });
  });

  // Evening gym (if applicable)
  if (hasGymToday && trainingTime === 'evening') {
    blocks.push({
      time: isWeekend ? '~18:00' : '18:00',
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Evening sports
  eveningSports.forEach(sport => {
    const sportInfo = SPORTS_LABELS[sport.sportId] || SPORTS_LABELS.outro;
    blocks.push({
      time: isWeekend ? '~18:30' : '18:30',
      icon: sportInfo.icon,
      label: sportInfo.pt,
      sub: 'Treino de esporte',
      type: 'sport',
      tag: 'sport'
    });
  });

  // Free time (only if no evening activities)
  if (!((hasGymToday && trainingTime === 'evening') || eveningSports.length > 0)) {
    blocks.push({
      time: isWeekend ? '~17:00' : '18:30',
      icon: '📚',
      label: 'Tempo livre',
      sub: 'Hobbies, descanso, o que te faz bem',
      type: 'free'
    });
  }

  // Dinner
  blocks.push({
    time: `${timePrefix}${dinnerHour}:30`,
    icon: '🍽️',
    label: 'Jantar',
    sub: 'Refeição nutritiva e saborosa',
    type: 'food'
  });

  // Wind down
  blocks.push({
    time: isWeekend ? '~22:00' : '21:30',
    icon: '🌙',
    label: 'Relaxar',
    sub: 'Preparar pra dormir, sem telas',
    type: 'sleep'
  });

  // Sleep
  blocks.push({
    time: isWeekend ? '~23:00' : '22:30',
    icon: '💤',
    label: 'Dormir',
    sub: '7-8h de sono reparador',
    type: 'sleep'
  });

  return blocks;
}

// Generate personalized meal plan
export function generatePersonalizedMeals(profile) {
  const { goal, sex, dietaryRestrictions, mealPrep } = profile;

  // Adjust macros based on goal and sex
  let macros;
  const isFemale = sex === 'female';

  if (goal === 'muscle_gain') {
    macros = isFemale
      ? { calorias: '2200-2500 kcal', proteina: '120-140g', carboidrato: '280-320g', gordura: '65-80g' }
      : { calorias: '2800-3200 kcal', proteina: '150-180g', carboidrato: '350-400g', gordura: '80-100g' };
  } else if (goal === 'weight_loss') {
    macros = isFemale
      ? { calorias: '1400-1700 kcal', proteina: '110-130g', carboidrato: '120-160g', gordura: '45-60g' }
      : { calorias: '1800-2200 kcal', proteina: '140-160g', carboidrato: '150-200g', gordura: '60-80g' };
  } else if (goal === 'maintain') {
    macros = isFemale
      ? { calorias: '1800-2100 kcal', proteina: '100-120g', carboidrato: '200-240g', gordura: '55-70g' }
      : { calorias: '2200-2600 kcal', proteina: '120-150g', carboidrato: '250-300g', gordura: '70-90g' };
  } else {
    macros = isFemale
      ? { calorias: '1800-2100 kcal', proteina: '80-100g', carboidrato: '200-240g', gordura: '55-70g' }
      : { calorias: '2200-2600 kcal', proteina: '100-130g', carboidrato: '250-300g', gordura: '70-90g' };
  }

  return { macros, mealPrep, dietaryRestrictions };
}

// Generate personalized workout split
export function generatePersonalizedWorkout(profile) {
  const { trainingDays, fitnessLevel } = profile;
  const numDays = (trainingDays || []).length;

  // Different splits based on number of training days
  if (numDays <= 3) {
    return generateFullBodySplit(trainingDays || [], fitnessLevel || 'intermediate');
  } else if (numDays === 4) {
    return generateUpperLowerSplit(trainingDays || [], fitnessLevel || 'intermediate');
  } else {
    return generatePPLSplit(trainingDays || [], fitnessLevel || 'intermediate');
  }
}

function generateFullBodySplit(days, level) {
  const sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 4;
  const reps = level === 'beginner' ? '10-12' : level === 'intermediate' ? '8-10' : '6-8';

  return days.map((day, i) => ({
    day,
    label: `Dia ${String.fromCharCode(65 + i)}`,
    name: 'Full Body',
    icon: '💪',
    focus: 'Corpo Inteiro',
    exercises: [
      `Agachamento ${sets}×${reps}`,
      `Supino ${sets}×${reps}`,
      `Remada ${sets}×${reps}`,
      `Desenvolvimento ${sets}×${reps}`,
      `Rosca direta 3×12`,
      `Tríceps 3×12`,
    ]
  }));
}

function generateUpperLowerSplit(days, level) {
  const sets = level === 'beginner' ? 3 : 4;
  const reps = level === 'beginner' ? '10-12' : '8-10';

  const split = [
    { name: 'Upper', focus: 'Peito, Costas, Ombros, Braços', icon: '💪' },
    { name: 'Lower', focus: 'Quadríceps, Posterior, Glúteos', icon: '🦵' },
    { name: 'Upper', focus: 'Peito, Costas, Ombros, Braços', icon: '💪' },
    { name: 'Lower', focus: 'Quadríceps, Posterior, Glúteos', icon: '🦵' },
  ];

  return days.map((day, i) => ({
    day,
    label: `Dia ${String.fromCharCode(65 + i)}`,
    name: split[i % 4].name,
    icon: split[i % 4].icon,
    focus: split[i % 4].focus,
    exercises: split[i % 4].name === 'Upper' ? [
      `Supino ${sets}×${reps}`,
      `Remada ${sets}×${reps}`,
      `Desenvolvimento ${sets}×${reps}`,
      `Puxada ${sets}×${reps}`,
      `Rosca direta 3×12`,
      `Tríceps 3×12`,
    ] : [
      `Agachamento ${sets}×${reps}`,
      `Stiff ${sets}×${reps}`,
      `Leg press ${sets}×12`,
      `Cadeira extensora 3×15`,
      `Mesa flexora 3×12`,
      `Panturrilha 4×15`,
    ]
  }));
}

function generatePPLSplit(days, level) {
  const sets = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 4;
  const reps = level === 'beginner' ? '10-12' : level === 'intermediate' ? '8-10' : '6-8';

  const split = [
    { name: 'Push', focus: 'Peito, Ombro, Tríceps', icon: '💪' },
    { name: 'Pull', focus: 'Costas, Bíceps', icon: '🔙' },
    { name: 'Legs', focus: 'Quadríceps, Posterior, Glúteos', icon: '🦵' },
    { name: 'Push+', focus: 'Ombro foco, Tríceps', icon: '🔥' },
    { name: 'Pull+', focus: 'Costas largura, Bíceps', icon: '⚡' },
    { name: 'Legs+', focus: 'Posterior, Glúteos', icon: '🦵' },
  ];

  const exercises = {
    'Push': [`Supino reto ${sets}×${reps}`, `Desenvolvimento ${sets}×${reps}`, `Supino inclinado 3×10`, `Elevação lateral 3×15`, `Tríceps corda 3×12`],
    'Pull': [`Barra fixa ${sets}×${reps}`, `Remada curvada ${sets}×${reps}`, `Puxada frente 3×10`, `Face pull 3×15`, `Rosca direta 3×12`],
    'Legs': [`Agachamento ${sets}×${reps}`, `Stiff 3×10`, `Leg press 3×12`, `Extensora 3×15`, `Panturrilha 4×15`],
    'Push+': [`Desenvolvimento Arnold ${sets}×${reps}`, `Elevação frontal 3×12`, `Crossover 3×15`, `Tríceps testa 3×12`, `Elevação lateral 4×15`],
    'Pull+': [`Barra fixa lastro ${sets}×6`, `Remada sentada 3×10`, `Puxada frente 3×12`, `Rosca martelo 3×12`, `Encolhimento 3×15`],
    'Legs+': [`Stiff ${sets}×${reps}`, `Hip thrust 4×10`, `Agachamento búlgaro 3×10`, `Mesa flexora 3×12`, `Panturrilha 4×15`],
  };

  return days.map((day, i) => ({
    day,
    label: `Dia ${String.fromCharCode(65 + i)}`,
    name: split[i % 6].name,
    icon: split[i % 6].icon,
    focus: split[i % 6].focus,
    exercises: exercises[split[i % 6].name]
  }));
}
