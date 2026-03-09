import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../data/supabase';

const STORAGE_KEY = 'vida_onboarding_complete';

export function useOnboarding() {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    setIsLoading(true);
    try {
      // Check localStorage first for quick response
      const localComplete = localStorage.getItem(STORAGE_KEY);
      if (localComplete === 'true') {
        setIsComplete(true);
        setIsLoading(false);
        return;
      }

      // Check Supabase for user profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_complete')
        .eq('user_id', user.id)
        .single();

      if (data?.onboarding_complete) {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsComplete(true);
      } else {
        setIsComplete(false);
      }
    } catch (err) {
      // If no profile exists, onboarding is not complete
      setIsComplete(false);
    }
    setIsLoading(false);
  };

  const completeOnboarding = async (profileData) => {
    try {
      // Save profile to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          onboarding_complete: true,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('vida_user_profile', JSON.stringify(profileData));

      setIsComplete(true);
      return true;
    } catch (err) {
      console.error('Error completing onboarding:', err);
      return false;
    }
  };

  return {
    isOnboardingComplete: isComplete,
    isCheckingOnboarding: isLoading,
    completeOnboarding
  };
}

// Helper to generate personalized schedule based on user preferences
export function generatePersonalizedSchedule(profile) {
  const { wakeUpTime, workDays, officeDays, trainingDays, trainingTime, dinnerTime } = profile;

  // Parse times
  const wakeHour = parseInt(wakeUpTime.split(':')[0]);
  const dinnerHour = parseInt(dinnerTime.split(':')[0]);

  // Generate schedule based on preferences
  const schedule = {};
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  days.forEach((day, index) => {
    const isWeekend = index >= 5;
    const isOfficeDay = officeDays.includes(day);
    const isTrainingDay = trainingDays.includes(day);

    schedule[day] = {
      type: isWeekend ? 'weekend' : (isOfficeDay ? 'office' : 'home'),
      blocks: generateDayBlocks({
        day,
        isWeekend,
        isOfficeDay,
        isTrainingDay,
        wakeHour,
        dinnerHour,
        trainingTime
      })
    };
  });

  return schedule;
}

function generateDayBlocks({ day, isWeekend, isOfficeDay, isTrainingDay, wakeHour, dinnerHour, trainingTime }) {
  const blocks = [];
  const timePrefix = isWeekend ? '~' : '';

  // Wake up
  blocks.push({
    time: `${timePrefix}${wakeHour}:00`,
    icon: '🌅',
    label: 'Acorda',
    sub: isWeekend ? 'Sem pressa hoje' : 'Novo dia, novas conquistas',
    type: 'morning'
  });

  // Morning routine
  blocks.push({
    time: `${timePrefix}${wakeHour}:15`,
    icon: '☕',
    label: 'Ritual matinal',
    sub: 'Café, alongamento, prepara o dia',
    type: 'morning'
  });

  // Training (if training day and morning preference)
  if (isTrainingDay && trainingTime === 'morning') {
    blocks.push({
      time: `${timePrefix}${wakeHour}:30`,
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Breakfast
  const breakfastTime = isTrainingDay && trainingTime === 'morning' ? wakeHour + 2 : wakeHour + 1;
  blocks.push({
    time: `${timePrefix}${breakfastTime}:00`,
    icon: '🍳',
    label: 'Café da manhã',
    sub: 'Refeição completa para começar bem',
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
      sub: 'Pausa real para comer bem',
      type: 'food'
    });

    blocks.push({
      time: '14:00',
      icon: '💻',
      label: 'Trabalho — tarde',
      sub: 'Finaliza as tarefas do dia',
      type: 'work'
    });

    blocks.push({
      time: '17:00',
      icon: '🔒',
      label: 'Fecha o trabalho',
      sub: 'Acabou. Não volta mais hoje.',
      type: 'work'
    });
  }

  // Afternoon training (if applicable)
  if (isTrainingDay && trainingTime === 'afternoon') {
    blocks.push({
      time: isWeekend ? '~15:00' : '17:30',
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Evening training (if applicable)
  if (isTrainingDay && trainingTime === 'evening') {
    blocks.push({
      time: isWeekend ? '~18:00' : '18:00',
      icon: '🏋️',
      label: 'Academia',
      sub: '60-75 min de treino focado',
      type: 'gym',
      tag: 'gym'
    });
  }

  // Free time
  blocks.push({
    time: isWeekend ? '~17:00' : '18:00',
    icon: '📚',
    label: 'Tempo livre',
    sub: 'Hobbies, descanso, o que te faz bem',
    type: 'free'
  });

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
    label: 'Wind down',
    sub: 'Prepara para dormir, sem telas',
    type: 'sleep'
  });

  // Sleep
  blocks.push({
    time: isWeekend ? '~23:00' : '22:30',
    icon: '💤',
    label: 'Dorme',
    sub: '7-8h de sono reparador',
    type: 'sleep'
  });

  return blocks;
}

// Generate personalized meal plan
export function generatePersonalizedMeals(profile) {
  const { goal, dietaryRestrictions, mealPrepDays } = profile;

  // Adjust macros based on goal
  let macros;
  if (goal === 'muscle_gain') {
    macros = { calorias: '2800-3200 kcal', proteina: '150-180g', carboidrato: '350-400g', gordura: '80-100g' };
  } else if (goal === 'weight_loss') {
    macros = { calorias: '1800-2200 kcal', proteina: '140-160g', carboidrato: '150-200g', gordura: '60-80g' };
  } else if (goal === 'maintain') {
    macros = { calorias: '2200-2600 kcal', proteina: '120-150g', carboidrato: '250-300g', gordura: '70-90g' };
  } else {
    macros = { calorias: '2200-2600 kcal', proteina: '100-130g', carboidrato: '250-300g', gordura: '70-90g' };
  }

  return { macros, mealPrepDays };
}

// Generate personalized workout split
export function generatePersonalizedWorkout(profile) {
  const { trainingDays, fitnessLevel, goal } = profile;
  const numDays = trainingDays.length;

  // Different splits based on number of training days
  if (numDays <= 3) {
    return generateFullBodySplit(trainingDays, fitnessLevel);
  } else if (numDays === 4) {
    return generateUpperLowerSplit(trainingDays, fitnessLevel);
  } else {
    return generatePPLSplit(trainingDays, fitnessLevel);
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
