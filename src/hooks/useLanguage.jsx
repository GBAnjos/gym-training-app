import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'vida_language';

// Translations
const translations = {
  'pt-BR': {
    // Common
    app_name: 'Vida',
    app_tagline: 'Estrutura real. Vida real.',
    continue: 'Continuar',
    back: 'Voltar',
    save: 'Salvar',
    cancel: 'Cancelar',
    loading: 'Carregando...',
    logout: 'Sair',
    skip: 'Pular',

    // Navigation
    nav_schedule: 'Semana',
    nav_meals: 'Refeições',
    nav_training: 'Treino',
    nav_progress: 'Progresso',

    // Onboarding - Welcome
    onboarding_welcome_title: 'Bem-vindo ao Vida',
    onboarding_welcome_desc: 'Vamos criar uma rotina personalizada pra você. Em poucos passos, você terá um plano de treino, alimentação e horários adaptados ao seu estilo de vida.',
    onboarding_start: 'Começar',
    onboarding_step: 'Passo',
    onboarding_of: 'de',

    // Onboarding Step 1 - Wake Time
    step_wake_title: 'A que horas você costuma acordar?',
    step_wake_desc: 'Vamos usar isso pra calcular sua rotina ideal',
    step_wake_label: 'Hora de acordar',
    step_wake_late_warning_title: 'Rotina diferente detectada',
    step_wake_late_warning_desc: 'Acordar depois das 10h pode dificultar alguns horários tradicionais. Vamos adaptar sua rotina pra funcionar com seu estilo.',

    // Onboarding Step 2 - Sleep Hours
    step_sleep_title: 'Quantas horas você dorme por noite?',
    step_sleep_desc: 'O sono é essencial pra recuperação e resultados',
    step_sleep_label: 'Horas de sono',
    step_sleep_feedback_low: 'Hmm, pode estar dormindo pouco. O ideal é 7-8h.',
    step_sleep_feedback_good: 'Perfeito! Essa é uma quantidade saudável.',
    step_sleep_feedback_high: 'Ótimo! Sono de sobra pra recuperar.',

    // Onboarding Step 3 - Lunch Time
    step_lunch_title: 'A que horas você costuma almoçar?',
    step_lunch_desc: 'Isso nos ajuda a organizar suas refeições e atividades',
    step_lunch_label: 'Hora do almoço',

    // Onboarding Step 4 - Dinner Time
    step_dinner_title: 'A que horas você costuma jantar?',
    step_dinner_desc: 'O ideal é ter pelo menos 3h entre almoço e jantar',
    step_dinner_label: 'Hora do jantar',
    step_dinner_gap_warning: 'Atenção: menos de 3h entre almoço e jantar. Considere ajustar.',

    // Onboarding Step 5 - Gym Preference
    step_gym_title: 'Quando você prefere treinar?',
    step_gym_desc: 'Escolha o horário que funciona melhor pra você',
    step_gym_morning: 'De manhã',
    step_gym_morning_desc: 'Antes de começar o dia',
    step_gym_evening: 'De noite',
    step_gym_evening_desc: 'Depois do trabalho',
    step_gym_flexible: 'Flexível',
    step_gym_flexible_desc: 'Depende do dia',

    // Onboarding Step 6 - Office Days
    step_office_title: 'Quantos dias você vai ao escritório?',
    step_office_desc: 'Isso nos ajuda a organizar seus dias de forma diferente',
    step_office_count_label: 'Dias por semana',
    step_office_times_label: 'Horário de trabalho',
    step_office_start: 'Entrada',
    step_office_end: 'Saída',
    step_office_remote: 'Trabalho 100% remoto',

    // Onboarding Step 7 - Goals
    step_goals_title: 'Quais são seus objetivos?',
    step_goals_desc: 'Selecione todos que se aplicam',
    step_goals_muscle: 'Ganhar massa muscular',
    step_goals_fat_loss: 'Perder gordura',
    step_goals_health: 'Melhorar a saúde',
    step_goals_energy: 'Ter mais energia',
    step_goals_strength: 'Ficar mais forte',
    step_goals_flexibility: 'Melhorar flexibilidade',
    step_goals_endurance: 'Mais resistência',
    step_goals_sleep: 'Dormir melhor',

    // Onboarding Step 8 - Physical Data
    step_physical_title: 'Seus dados físicos',
    step_physical_desc: 'Opcional, mas ajuda a personalizar ainda mais',
    step_physical_weight: 'Peso atual (kg)',
    step_physical_height: 'Altura (cm)',
    step_physical_bodyfat: 'Gordura corporal (%)',
    step_physical_skip_hint: 'Você pode pular e adicionar depois',

    // Profile step (kept for compatibility)
    profile_title: 'Seu perfil',
    profile_desc: 'Informações básicas pra personalizar sua experiência',
    profile_name: 'Nome',
    profile_name_placeholder: 'Como você se chama?',
    profile_sex: 'Sexo',
    profile_sex_male: 'Masculino',
    profile_sex_female: 'Feminino',
    profile_age: 'Idade',
    profile_age_placeholder: 'Ex: 28',
    profile_current_weight: 'Peso atual (kg)',
    profile_target_weight: 'Peso alvo (kg)',
    profile_height: 'Altura (cm)',
    optional: '(opcional)',
    required: '*',

    // Routine step
    routine_title: 'Sua rotina',
    routine_desc: 'Como é o seu dia a dia?',
    routine_wake_up: 'Você acorda às',
    routine_sleep: 'Você dorme às',
    routine_dinner: 'Você janta às',
    routine_office_days: 'Dias de escritório',
    routine_office_hint: 'Selecione os dias que você vai ao escritório',
    routine_work_from_home: 'Trabalha sempre de casa? Deixe em branco.',
    routine_days_selected: 'dia(s) selecionado(s)',

    // Lifestyle step
    lifestyle_title: 'Estilo de vida',
    lifestyle_desc: 'Pra criar uma rotina que funciona pra você',
    lifestyle_hobbies: 'Você tem hobbies regulares?',
    lifestyle_hobbies_hint: 'Ex: jogos, música, esportes, leitura...',
    lifestyle_chores: 'Com que frequência você faz tarefas de casa?',
    lifestyle_chores_daily: 'Diariamente',
    lifestyle_chores_weekly: 'Semanalmente',
    lifestyle_chores_rarely: 'Raramente',
    lifestyle_grocery: 'Frequência de compras no mercado',
    lifestyle_grocery_weekly: 'Semanal',
    lifestyle_grocery_biweekly: 'Quinzenal',
    lifestyle_grocery_monthly: 'Mensal',
    lifestyle_weekend: 'Como é seu final de semana?',
    lifestyle_weekend_relaxed: 'Relaxado',
    lifestyle_weekend_relaxed_desc: 'Acordo tarde, sem horário fixo',
    lifestyle_weekend_active: 'Ativo',
    lifestyle_weekend_active_desc: 'Mantenho a rotina, faço atividades',

    // Training step
    training_title: 'Seu treino',
    training_desc: 'Personalize seu plano de treino',
    training_goal: 'Qual é seu objetivo principal?',
    training_goal_muscle: 'Ganhar massa',
    training_goal_muscle_desc: 'Hipertrofia muscular',
    training_goal_loss: 'Perder peso',
    training_goal_loss_desc: 'Queimar gordura',
    training_goal_maintain: 'Manter forma',
    training_goal_maintain_desc: 'Estabilidade',
    training_goal_general: 'Fitness geral',
    training_goal_general_desc: 'Saúde e bem-estar',
    training_level: 'Nível de experiência',
    training_level_beginner: 'Iniciante',
    training_level_beginner_desc: 'Menos de 1 ano de treino',
    training_level_intermediate: 'Intermediário',
    training_level_intermediate_desc: '1-3 anos de treino',
    training_level_advanced: 'Avançado',
    training_level_advanced_desc: 'Mais de 3 anos de treino',
    training_days: 'Dias de treino por semana',
    training_days_hint: 'Selecione os dias que você vai treinar',
    training_time: 'Horário preferido de treino',
    training_time_morning: 'Manhã',
    training_time_afternoon: 'Tarde',
    training_time_evening: 'Noite',

    // Nutrition step
    nutrition_title: 'Alimentação',
    nutrition_desc: 'Últimos detalhes pro seu plano alimentar',
    nutrition_restrictions: 'Restrições alimentares',
    nutrition_vegetarian: 'Vegetariano',
    nutrition_vegan: 'Vegano',
    nutrition_lactose_free: 'Sem lactose',
    nutrition_gluten_free: 'Sem glúten',
    nutrition_meal_prep: 'Você prepara refeições com antecedência?',
    nutrition_meal_prep_yes: 'Sim, faço meal prep',
    nutrition_meal_prep_yes_desc: 'Preparo refeições pra vários dias',
    nutrition_meal_prep_no: 'Não, cozinho no dia',
    nutrition_meal_prep_no_desc: 'Preparo cada refeição na hora',

    // Language step
    language_title: 'Idioma',
    language_desc: 'Em qual idioma você prefere usar o app?',
    language_pt: 'Português (Brasil)',
    language_en: 'English',

    // Summary
    summary_title: 'Resumo do seu plano',
    summary_goal: 'Objetivo',
    summary_training: 'Treino',
    summary_time: 'Horário',
    summary_weight: 'Meta',
    summary_per_week: 'x por semana',
    create_routine: 'Criar minha rotina',

    // Generating
    generating_title: 'Criando sua rotina...',
    generating_desc: 'Estamos personalizando seus horários com base na sua rotina.',
    generating_step_1: 'Analisando rotina',
    generating_step_2: 'Calculando horários',
    generating_step_3: 'Montando cronograma',
    generating_step_4: 'Finalizando',

    // Exercise type step
    exercise_type_title: 'Tipo de exercício',
    exercise_type_desc: 'Que tipo de atividade física você pratica?',
    exercise_type_gym: 'Academia',
    exercise_type_gym_desc: 'Musculação, cardio, funcional...',
    exercise_type_sports: 'Esportes',
    exercise_type_sports_desc: 'Futebol, natação, corrida...',
    exercise_type_both: 'Ambos',
    exercise_type_both_desc: 'Academia + esportes',
    exercise_type_none: 'Nenhum',
    exercise_type_none_desc: 'Vou começar agora',

    // Gym details step
    gym_details_title: 'Detalhes da academia',
    gym_details_desc: 'Personalize seu plano de treino',
    gym_type_question: 'Que tipo de treino você faz?',
    gym_type_hint: 'Selecione um ou mais tipos',

    // Sports details step
    sports_details_title: 'Seus esportes',
    sports_details_desc: 'Quais esportes você pratica?',
    sports_select: 'Selecione seus esportes',
    sports_schedule: 'Horários de cada esporte',
    sports_which_days: 'Quais dias?',
    sports_what_time: 'Que horário?',

    // Summary additions
    summary_sports: 'Esportes',
    summary_sport: 'esporte',
    summary_sports_plural: 'esportes',

    // Errors
    error_required_sex: 'Selecione seu sexo',
    error_required_age: 'Informe sua idade',
    error_required_weight: 'Informe seu peso atual',
    error_required_target: 'Informe seu peso alvo',
    error_required_goal: 'Selecione seu objetivo',
    error_required_level: 'Selecione seu nível',
    error_required_days: 'Selecione pelo menos um dia',
    error_required_time: 'Selecione o horário preferido',
    error_required_meal_prep: 'Selecione uma opção',
    error_required_weekend: 'Selecione como é seu fim de semana',
    error_required_exercise_type: 'Selecione o tipo de exercício',
    error_required_gym_type: 'Selecione pelo menos um tipo de treino',
    error_required_sports: 'Selecione pelo menos um esporte',
    error_required_sports_schedule: 'Defina os dias para cada esporte',
    error_required_goals: 'Selecione pelo menos um objetivo',
    error_required_gym_pref: 'Selecione seu horário preferido',

    // Settings
    settings_title: 'Configurações',
    settings_profile: 'Editar perfil',
    settings_redo_onboarding: 'Refazer questionário',
    settings_language: 'Idioma',
  },

  'en': {
    // Common
    app_name: 'Vida',
    app_tagline: 'Real structure. Real life.',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    logout: 'Log out',
    skip: 'Skip',

    // Navigation
    nav_schedule: 'Week',
    nav_meals: 'Meals',
    nav_training: 'Training',
    nav_progress: 'Progress',

    // Onboarding - Welcome
    onboarding_welcome_title: 'Welcome to Vida',
    onboarding_welcome_desc: "Let's create a personalized routine for you. In a few steps, you'll have a training plan, nutrition, and schedule adapted to your lifestyle.",
    onboarding_start: 'Get Started',
    onboarding_step: 'Step',
    onboarding_of: 'of',

    // Onboarding Step 1 - Wake Time
    step_wake_title: 'What time do you usually wake up?',
    step_wake_desc: "We'll use this to calculate your ideal routine",
    step_wake_label: 'Wake up time',
    step_wake_late_warning_title: 'Different routine detected',
    step_wake_late_warning_desc: "Waking up after 10am may make some traditional schedules harder. We'll adapt your routine to fit your style.",

    // Onboarding Step 2 - Sleep Hours
    step_sleep_title: 'How many hours do you sleep per night?',
    step_sleep_desc: 'Sleep is essential for recovery and results',
    step_sleep_label: 'Hours of sleep',
    step_sleep_feedback_low: 'Hmm, you might be sleeping too little. Ideal is 7-8h.',
    step_sleep_feedback_good: 'Perfect! That is a healthy amount.',
    step_sleep_feedback_high: 'Great! Plenty of sleep to recover.',

    // Onboarding Step 3 - Lunch Time
    step_lunch_title: 'What time do you usually have lunch?',
    step_lunch_desc: 'This helps us organize your meals and activities',
    step_lunch_label: 'Lunch time',

    // Onboarding Step 4 - Dinner Time
    step_dinner_title: 'What time do you usually have dinner?',
    step_dinner_desc: 'Ideally at least 3h between lunch and dinner',
    step_dinner_label: 'Dinner time',
    step_dinner_gap_warning: 'Note: less than 3h between lunch and dinner. Consider adjusting.',

    // Onboarding Step 5 - Gym Preference
    step_gym_title: 'When do you prefer to workout?',
    step_gym_desc: 'Choose the time that works best for you',
    step_gym_morning: 'Morning',
    step_gym_morning_desc: 'Before starting the day',
    step_gym_evening: 'Evening',
    step_gym_evening_desc: 'After work',
    step_gym_flexible: 'Flexible',
    step_gym_flexible_desc: 'Depends on the day',

    // Onboarding Step 6 - Office Days
    step_office_title: 'How many days do you go to the office?',
    step_office_desc: 'This helps us organize your days differently',
    step_office_count_label: 'Days per week',
    step_office_times_label: 'Work hours',
    step_office_start: 'Start',
    step_office_end: 'End',
    step_office_remote: '100% remote work',

    // Onboarding Step 7 - Goals
    step_goals_title: 'What are your goals?',
    step_goals_desc: 'Select all that apply',
    step_goals_muscle: 'Build muscle',
    step_goals_fat_loss: 'Lose fat',
    step_goals_health: 'Improve health',
    step_goals_energy: 'Have more energy',
    step_goals_strength: 'Get stronger',
    step_goals_flexibility: 'Improve flexibility',
    step_goals_endurance: 'More endurance',
    step_goals_sleep: 'Sleep better',

    // Onboarding Step 8 - Physical Data
    step_physical_title: 'Your physical data',
    step_physical_desc: 'Optional, but helps personalize even more',
    step_physical_weight: 'Current weight (kg)',
    step_physical_height: 'Height (cm)',
    step_physical_bodyfat: 'Body fat (%)',
    step_physical_skip_hint: 'You can skip and add later',

    // Profile step (kept for compatibility)
    profile_title: 'Your profile',
    profile_desc: 'Basic information to personalize your experience',
    profile_name: 'Name',
    profile_name_placeholder: "What's your name?",
    profile_sex: 'Sex',
    profile_sex_male: 'Male',
    profile_sex_female: 'Female',
    profile_age: 'Age',
    profile_age_placeholder: 'Ex: 28',
    profile_current_weight: 'Current weight (kg)',
    profile_target_weight: 'Target weight (kg)',
    profile_height: 'Height (cm)',
    optional: '(optional)',
    required: '*',

    // Routine step
    routine_title: 'Your routine',
    routine_desc: "What's your daily life like?",
    routine_wake_up: 'You wake up at',
    routine_sleep: 'You sleep at',
    routine_dinner: 'You have dinner at',
    routine_office_days: 'Office days',
    routine_office_hint: 'Select the days you go to the office',
    routine_work_from_home: 'Always work from home? Leave blank.',
    routine_days_selected: 'day(s) selected',

    // Lifestyle step
    lifestyle_title: 'Lifestyle',
    lifestyle_desc: 'To create a routine that works for you',
    lifestyle_hobbies: 'Do you have regular hobbies?',
    lifestyle_hobbies_hint: 'Ex: gaming, music, sports, reading...',
    lifestyle_chores: 'How often do you do house chores?',
    lifestyle_chores_daily: 'Daily',
    lifestyle_chores_weekly: 'Weekly',
    lifestyle_chores_rarely: 'Rarely',
    lifestyle_grocery: 'Grocery shopping frequency',
    lifestyle_grocery_weekly: 'Weekly',
    lifestyle_grocery_biweekly: 'Bi-weekly',
    lifestyle_grocery_monthly: 'Monthly',
    lifestyle_weekend: 'How are your weekends?',
    lifestyle_weekend_relaxed: 'Relaxed',
    lifestyle_weekend_relaxed_desc: 'Wake up late, no fixed schedule',
    lifestyle_weekend_active: 'Active',
    lifestyle_weekend_active_desc: 'Keep the routine, do activities',

    // Training step
    training_title: 'Your training',
    training_desc: 'Customize your training plan',
    training_goal: "What's your main goal?",
    training_goal_muscle: 'Build muscle',
    training_goal_muscle_desc: 'Muscle hypertrophy',
    training_goal_loss: 'Lose weight',
    training_goal_loss_desc: 'Burn fat',
    training_goal_maintain: 'Maintain',
    training_goal_maintain_desc: 'Stay stable',
    training_goal_general: 'General fitness',
    training_goal_general_desc: 'Health and wellness',
    training_level: 'Experience level',
    training_level_beginner: 'Beginner',
    training_level_beginner_desc: 'Less than 1 year training',
    training_level_intermediate: 'Intermediate',
    training_level_intermediate_desc: '1-3 years training',
    training_level_advanced: 'Advanced',
    training_level_advanced_desc: 'More than 3 years training',
    training_days: 'Training days per week',
    training_days_hint: 'Select the days you will train',
    training_time: 'Preferred training time',
    training_time_morning: 'Morning',
    training_time_afternoon: 'Afternoon',
    training_time_evening: 'Evening',

    // Nutrition step
    nutrition_title: 'Nutrition',
    nutrition_desc: 'Last details for your meal plan',
    nutrition_restrictions: 'Dietary restrictions',
    nutrition_vegetarian: 'Vegetarian',
    nutrition_vegan: 'Vegan',
    nutrition_lactose_free: 'Lactose-free',
    nutrition_gluten_free: 'Gluten-free',
    nutrition_meal_prep: 'Do you meal prep?',
    nutrition_meal_prep_yes: 'Yes, I meal prep',
    nutrition_meal_prep_yes_desc: 'I prepare meals for several days',
    nutrition_meal_prep_no: 'No, I cook daily',
    nutrition_meal_prep_no_desc: 'I prepare each meal fresh',

    // Language step
    language_title: 'Language',
    language_desc: 'Which language do you prefer?',
    language_pt: 'Português (Brasil)',
    language_en: 'English',

    // Summary
    summary_title: 'Your plan summary',
    summary_goal: 'Goal',
    summary_training: 'Training',
    summary_time: 'Time',
    summary_weight: 'Target',
    summary_per_week: 'x per week',
    create_routine: 'Create my routine',

    // Generating
    generating_title: 'Creating your routine...',
    generating_desc: "We're personalizing your schedule based on your routine.",
    generating_step_1: 'Analyzing routine',
    generating_step_2: 'Calculating times',
    generating_step_3: 'Building schedule',
    generating_step_4: 'Finishing up',

    // Exercise type step
    exercise_type_title: 'Exercise type',
    exercise_type_desc: 'What type of physical activity do you do?',
    exercise_type_gym: 'Gym',
    exercise_type_gym_desc: 'Weight training, cardio, functional...',
    exercise_type_sports: 'Sports',
    exercise_type_sports_desc: 'Soccer, swimming, running...',
    exercise_type_both: 'Both',
    exercise_type_both_desc: 'Gym + sports',
    exercise_type_none: 'None',
    exercise_type_none_desc: "I'm starting now",

    // Gym details step
    gym_details_title: 'Gym details',
    gym_details_desc: 'Customize your training plan',
    gym_type_question: 'What type of training do you do?',
    gym_type_hint: 'Select one or more types',

    // Sports details step
    sports_details_title: 'Your sports',
    sports_details_desc: 'Which sports do you practice?',
    sports_select: 'Select your sports',
    sports_schedule: 'Schedule for each sport',
    sports_which_days: 'Which days?',
    sports_what_time: 'What time?',

    // Summary additions
    summary_sports: 'Sports',
    summary_sport: 'sport',
    summary_sports_plural: 'sports',

    // Errors
    error_required_sex: 'Select your sex',
    error_required_age: 'Enter your age',
    error_required_weight: 'Enter your current weight',
    error_required_target: 'Enter your target weight',
    error_required_goal: 'Select your goal',
    error_required_level: 'Select your level',
    error_required_days: 'Select at least one day',
    error_required_time: 'Select your preferred time',
    error_required_meal_prep: 'Select an option',
    error_required_weekend: 'Select your weekend style',
    error_required_exercise_type: 'Select the exercise type',
    error_required_gym_type: 'Select at least one training type',
    error_required_sports: 'Select at least one sport',
    error_required_sports_schedule: 'Set the days for each sport',
    error_required_goals: 'Select at least one goal',
    error_required_gym_pref: 'Select your preferred time',

    // Settings
    settings_title: 'Settings',
    settings_profile: 'Edit profile',
    settings_redo_onboarding: 'Redo questionnaire',
    settings_language: 'Language',
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['pt-BR']?.[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    languages: [
      { code: 'pt-BR', name: 'Português (Brasil)' },
      { code: 'en', name: 'English' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default useLanguage;
