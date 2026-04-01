/**
 * Ready-made training programs catalog.
 * Each program has metadata for browsing and filtering.
 */

export const PROGRAM_MODALITIES = ['gym', 'crossfit', 'calisthenics', 'pilates', 'running', 'yoga', 'mixed'];
export const PROGRAM_LEVELS = ['beginner', 'intermediate', 'advanced'];
export const PROGRAM_GOALS = ['muscle', 'fat_loss', 'strength', 'endurance', 'flexibility', 'general'];

export const PROGRAMS = [
  // — Gym Programs —
  {
    id: 'ppl-classic',
    name: { 'pt-BR': 'Push Pull Legs Clássico', en: 'Classic Push Pull Legs' },
    modality: 'gym',
    level: 'intermediate',
    goal: 'muscle',
    weeks: 12,
    daysPerWeek: 6,
    description: {
      'pt-BR': 'O programa PPL clássico: peito/ombros/tríceps, costas/bíceps, pernas. Duas rotações por semana para máximo volume.',
      en: 'The classic PPL split: chest/shoulders/triceps, back/biceps, legs. Two rotations per week for maximum volume.',
    },
    icon: 'dumbbell-1',
    days: [
      {
        name: { 'pt-BR': 'Push (Peito/Ombro/Tríceps)', en: 'Push (Chest/Shoulder/Triceps)' },
        exercises: [
          { id: 'barbell_bench_press_medium_grip', sets: 4, reps: '6-10', rest: 150 },
          { id: 'barbell_shoulder_press', sets: 4, reps: '6-10', rest: 120 },
          { id: 'incline_dumbbell_press', sets: 3, reps: '8-12', rest: 90 },
          { id: 'dumbbell_raise', sets: 3, reps: '12-15', rest: 60 },
          { id: 'bench_dips', sets: 3, reps: '10-12', rest: 60 },
          { id: 'decline_close_grip_bench_to_skull_crusher', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: { 'pt-BR': 'Pull (Costas/Bíceps)', en: 'Pull (Back/Biceps)' },
        exercises: [
          { id: 'bent_over_barbell_row', sets: 4, reps: '6-10', rest: 150 },
          { id: 'pullups', sets: 4, reps: '6-10', rest: 120 },
          { id: 'elevated_cable_rows', sets: 3, reps: '8-12', rest: 90 },
          { id: 'face_pull', sets: 3, reps: '12-15', rest: 60 },
          { id: 'barbell_curl', sets: 3, reps: '8-12', rest: 60 },
          { id: 'alternate_hammer_curl', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: { 'pt-BR': 'Legs (Pernas)', en: 'Legs' },
        exercises: [
          { id: 'barbell_squat', sets: 4, reps: '6-10', rest: 180 },
          { id: 'romanian_deadlift', sets: 4, reps: '8-10', rest: 150 },
          { id: 'calf_press_on_the_leg_press_machine', sets: 3, reps: '10-12', rest: 90 },
          { id: 'glute_ham_raise', sets: 3, reps: '8-12', rest: 90 },
          { id: 'rocking_standing_calf_raise', sets: 4, reps: '12-15', rest: 60 },
          { id: 'dumbbell_lunges', sets: 3, reps: '10-12', rest: 90 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    name: { 'pt-BR': 'Upper Lower 4x', en: 'Upper Lower 4x' },
    modality: 'gym',
    level: 'intermediate',
    goal: 'muscle',
    weeks: 10,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Divisão upper/lower com 4 treinos por semana. Equilíbrio entre volume e recuperação.',
      en: 'Upper/lower split with 4 workouts per week. Balance between volume and recovery.',
    },
    icon: 'dumbbell-1',
    days: [
      {
        name: { 'pt-BR': 'Upper (Superior)', en: 'Upper Body' },
        exercises: [
          { id: 'barbell_bench_press_medium_grip', sets: 4, reps: '6-10', rest: 150 },
          { id: 'bent_over_barbell_row', sets: 4, reps: '6-10', rest: 150 },
          { id: 'barbell_shoulder_press', sets: 3, reps: '8-12', rest: 120 },
          { id: 'close_grip_front_lat_pulldown', sets: 3, reps: '8-12', rest: 90 },
          { id: 'dumbbell_raise', sets: 3, reps: '12-15', rest: 60 },
          { id: 'barbell_curl', sets: 3, reps: '8-12', rest: 60 },
        ],
      },
      {
        name: { 'pt-BR': 'Lower (Inferior)', en: 'Lower Body' },
        exercises: [
          { id: 'barbell_squat', sets: 4, reps: '6-10', rest: 180 },
          { id: 'romanian_deadlift', sets: 4, reps: '8-10', rest: 150 },
          { id: 'calf_press_on_the_leg_press_machine', sets: 3, reps: '10-12', rest: 90 },
          { id: 'glute_ham_raise', sets: 3, reps: '8-12', rest: 90 },
          { id: 'rocking_standing_calf_raise', sets: 4, reps: '12-15', rest: 60 },
          { id: 'barbell_hip_thrust', sets: 3, reps: '8-12', rest: 90 },
        ],
      },
    ],
  },
  {
    id: 'full-body-3x',
    name: { 'pt-BR': 'Full Body 3x Iniciante', en: 'Full Body 3x Beginner' },
    modality: 'gym',
    level: 'beginner',
    goal: 'general',
    weeks: 8,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Programa ideal para iniciantes. 3 treinos full body por semana com foco em movimentos compostos.',
      en: 'Ideal program for beginners. 3 full body workouts per week focusing on compound movements.',
    },
    icon: 'dumbbell-1',
    days: [
      {
        name: { 'pt-BR': 'Dia A', en: 'Day A' },
        exercises: [
          { id: 'barbell_squat', sets: 4, reps: '6-10', rest: 180 },
          { id: 'barbell_bench_press_medium_grip', sets: 4, reps: '6-10', rest: 150 },
          { id: 'bent_over_barbell_row', sets: 3, reps: '8-12', rest: 120 },
          { id: 'dumbbell_raise', sets: 3, reps: '12-15', rest: 60 },
          { id: 'barbell_curl', sets: 3, reps: '8-12', rest: 60 },
          { id: 'bench_dips', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: { 'pt-BR': 'Dia B', en: 'Day B' },
        exercises: [
          { id: 'clean_deadlift', sets: 4, reps: '5-8', rest: 180 },
          { id: 'barbell_shoulder_press', sets: 4, reps: '6-10', rest: 120 },
          { id: 'close_grip_front_lat_pulldown', sets: 3, reps: '8-12', rest: 90 },
          { id: 'glute_ham_raise', sets: 3, reps: '8-12', rest: 90 },
          { id: 'face_pull', sets: 3, reps: '12-15', rest: 60 },
          { id: 'alternate_hammer_curl', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
      {
        name: { 'pt-BR': 'Dia C', en: 'Day C' },
        exercises: [
          { id: 'calf_press_on_the_leg_press_machine', sets: 4, reps: '8-12', rest: 120 },
          { id: 'incline_dumbbell_press', sets: 4, reps: '8-12', rest: 90 },
          { id: 'elevated_cable_rows', sets: 3, reps: '8-12', rest: 90 },
          { id: 'dumbbell_raise', sets: 3, reps: '12-15', rest: 60 },
          { id: 'rocking_standing_calf_raise', sets: 4, reps: '12-15', rest: 60 },
          { id: 'decline_close_grip_bench_to_skull_crusher', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
    ],
  },
  {
    id: 'strength-5x5',
    name: { 'pt-BR': 'Força 5x5', en: 'Strength 5x5' },
    modality: 'gym',
    level: 'beginner',
    goal: 'strength',
    weeks: 12,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Programa de força baseado em 5 séries de 5 repetições nos levantamentos básicos. Progressão linear semanal.',
      en: 'Strength program based on 5 sets of 5 reps on basic lifts. Weekly linear progression.',
    },
    icon: 'dumbbell-1',
  },
  {
    id: 'bro-split',
    name: { 'pt-BR': 'Bro Split 5 Dias', en: '5-Day Bro Split' },
    modality: 'gym',
    level: 'advanced',
    goal: 'muscle',
    weeks: 12,
    daysPerWeek: 5,
    description: {
      'pt-BR': 'Um grupo muscular por dia: peito, costas, ombros, braços, pernas. Alto volume por sessão.',
      en: 'One muscle group per day: chest, back, shoulders, arms, legs. High volume per session.',
    },
    icon: 'dumbbell-1',
  },
  {
    id: 'powerbuilding',
    name: { 'pt-BR': 'Powerbuilding', en: 'Powerbuilding' },
    modality: 'gym',
    level: 'advanced',
    goal: 'strength',
    weeks: 16,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Combina treinamento de força nos compostos com trabalho de hipertrofia. O melhor dos dois mundos.',
      en: 'Combines strength training on compounds with hypertrophy work. Best of both worlds.',
    },
    icon: 'dumbbell-1',
  },
  {
    id: 'fat-loss-circuit',
    name: { 'pt-BR': 'Circuito Queima Total', en: 'Total Burn Circuit' },
    modality: 'gym',
    level: 'beginner',
    goal: 'fat_loss',
    weeks: 8,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Circuitos de alta intensidade com pesos moderados. Foco em gasto calórico e condicionamento.',
      en: 'High-intensity circuits with moderate weights. Focus on calorie burn and conditioning.',
    },
    icon: 'dumbbell-1',
  },
  {
    id: 'women-glute-focus',
    name: { 'pt-BR': 'Glúteos & Lower Body', en: 'Glutes & Lower Body' },
    modality: 'gym',
    level: 'intermediate',
    goal: 'muscle',
    weeks: 12,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Ênfase em glúteos e pernas com 3 sessões lower e 1 upper por semana.',
      en: 'Emphasis on glutes and legs with 3 lower and 1 upper session per week.',
    },
    icon: 'dumbbell-1',
  },
  {
    id: 'minimalist-2x',
    name: { 'pt-BR': 'Minimalista 2x Semana', en: 'Minimalist 2x Week' },
    modality: 'gym',
    level: 'beginner',
    goal: 'general',
    weeks: 8,
    daysPerWeek: 2,
    description: {
      'pt-BR': 'Para quem tem pouco tempo. 2 treinos full body intensos por semana com os movimentos essenciais.',
      en: 'For busy schedules. 2 intense full body workouts per week with essential movements.',
    },
    icon: 'dumbbell-1',
  },

  // — CrossFit Programs —
  {
    id: 'crossfit-foundations',
    name: { 'pt-BR': 'CrossFit Fundamentos', en: 'CrossFit Foundations' },
    modality: 'crossfit',
    level: 'beginner',
    goal: 'general',
    weeks: 6,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Introdução ao CrossFit com foco em técnica dos movimentos fundamentais.',
      en: 'Introduction to CrossFit focusing on fundamental movement technique.',
    },
    icon: 'fire-1',
  },
  {
    id: 'crossfit-compete',
    name: { 'pt-BR': 'CrossFit Competição', en: 'CrossFit Competition' },
    modality: 'crossfit',
    level: 'advanced',
    goal: 'endurance',
    weeks: 12,
    daysPerWeek: 5,
    description: {
      'pt-BR': 'Preparação para competições com WODs intensos, skill work e programação de força.',
      en: 'Competition prep with intense WODs, skill work, and strength programming.',
    },
    icon: 'fire-1',
  },
  {
    id: 'crossfit-wod-4x',
    name: { 'pt-BR': 'WOD Semanal 4x', en: 'Weekly WOD 4x' },
    modality: 'crossfit',
    level: 'intermediate',
    goal: 'endurance',
    weeks: 8,
    daysPerWeek: 4,
    description: {
      'pt-BR': '4 WODs variados por semana combinando força, cardio e ginástica.',
      en: '4 varied WODs per week combining strength, cardio, and gymnastics.',
    },
    icon: 'fire-1',
  },

  // — Calisthenics Programs —
  {
    id: 'cali-beginner',
    name: { 'pt-BR': 'Calistenia Iniciante', en: 'Beginner Calisthenics' },
    modality: 'calisthenics',
    level: 'beginner',
    goal: 'strength',
    weeks: 8,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Construa força com o peso do corpo. Progressões de flexão, barra e agachamento.',
      en: 'Build strength with bodyweight. Push-up, pull-up, and squat progressions.',
    },
    icon: 'bolt-alt',
  },
  {
    id: 'cali-skills',
    name: { 'pt-BR': 'Skills Avançadas', en: 'Advanced Skills' },
    modality: 'calisthenics',
    level: 'advanced',
    goal: 'strength',
    weeks: 16,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Muscle-up, handstand, front lever e planche. Para quem já domina o básico.',
      en: 'Muscle-up, handstand, front lever, and planche. For those who mastered the basics.',
    },
    icon: 'bolt-alt',
  },
  {
    id: 'cali-hybrid',
    name: { 'pt-BR': 'Calistenia + Peso', en: 'Calisthenics + Weights' },
    modality: 'calisthenics',
    level: 'intermediate',
    goal: 'muscle',
    weeks: 10,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'O melhor da calistenia com acessórios de musculação para hipertrofia.',
      en: 'Best of calisthenics with weight training accessories for hypertrophy.',
    },
    icon: 'bolt-alt',
  },

  // — Pilates Programs —
  {
    id: 'pilates-core',
    name: { 'pt-BR': 'Pilates Core & Postura', en: 'Pilates Core & Posture' },
    modality: 'pilates',
    level: 'beginner',
    goal: 'flexibility',
    weeks: 8,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Fortaleça o core e melhore sua postura com exercícios de Pilates mat.',
      en: 'Strengthen your core and improve posture with Pilates mat exercises.',
    },
    icon: 'heart',
  },
  {
    id: 'pilates-advanced',
    name: { 'pt-BR': 'Pilates Avançado', en: 'Advanced Pilates' },
    modality: 'pilates',
    level: 'advanced',
    goal: 'flexibility',
    weeks: 12,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Sequências avançadas com aparelhos e movimentos desafiadores.',
      en: 'Advanced sequences with equipment and challenging movements.',
    },
    icon: 'heart',
  },

  // — Running Programs —
  {
    id: 'couch-to-5k',
    name: { 'pt-BR': 'Do Zero aos 5km', en: 'Couch to 5K' },
    modality: 'running',
    level: 'beginner',
    goal: 'endurance',
    weeks: 8,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Comece do zero e corra 5km em 8 semanas com progressão gradual.',
      en: 'Start from zero and run 5K in 8 weeks with gradual progression.',
    },
    icon: 'direction-1',
    plan: [
      {
        week: 1,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 1 min corrida / 2 min caminhada × 8', en: 'Alternate 1 min run / 2 min walk × 8' }, duration: 24, zone: 1 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 1 min corrida / 2 min caminhada × 8', en: 'Alternate 1 min run / 2 min walk × 8' }, duration: 24, zone: 1 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 1 min corrida / 2 min caminhada × 8', en: 'Alternate 1 min run / 2 min walk × 8' }, duration: 24, zone: 1 },
        ],
      },
      {
        week: 2,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 2 min corrida / 2 min caminhada × 6', en: 'Alternate 2 min run / 2 min walk × 6' }, duration: 24, zone: 1 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 2 min corrida / 2 min caminhada × 6', en: 'Alternate 2 min run / 2 min walk × 6' }, duration: 24, zone: 1 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 2 min corrida / 2 min caminhada × 6', en: 'Alternate 2 min run / 2 min walk × 6' }, duration: 24, zone: 1 },
        ],
      },
      {
        week: 3,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 3 min corrida / 1.5 min caminhada × 5', en: 'Alternate 3 min run / 1.5 min walk × 5' }, duration: 22, zone: 2 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 3 min corrida / 1.5 min caminhada × 5', en: 'Alternate 3 min run / 1.5 min walk × 5' }, duration: 22, zone: 2 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 3 min corrida / 1.5 min caminhada × 5', en: 'Alternate 3 min run / 1.5 min walk × 5' }, duration: 22, zone: 2 },
        ],
      },
      {
        week: 4,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 4 min corrida / 1 min caminhada × 5', en: 'Alternate 4 min run / 1 min walk × 5' }, duration: 25, zone: 2 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 4 min corrida / 1 min caminhada × 5', en: 'Alternate 4 min run / 1 min walk × 5' }, duration: 25, zone: 2 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 4 min corrida / 1 min caminhada × 5', en: 'Alternate 4 min run / 1 min walk × 5' }, duration: 25, zone: 2 },
        ],
      },
      {
        week: 5,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 5 min corrida / 1 min caminhada × 4', en: 'Alternate 5 min run / 1 min walk × 4' }, duration: 24, zone: 2 },
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 8 min corrida / 2 min caminhada × 2 + 4 min corrida', en: 'Alternate 8 min run / 2 min walk × 2 + 4 min run' }, duration: 24, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 20 min contínuos em ritmo confortável', en: 'Run 20 min continuously at comfortable pace' }, duration: 20, zone: 2 },
        ],
      },
      {
        week: 6,
        sessions: [
          { type: 'walk_run', description: { 'pt-BR': 'Alternar 8 min corrida / 1 min caminhada × 3', en: 'Alternate 8 min run / 1 min walk × 3' }, duration: 27, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 22 min contínuos', en: 'Run 22 min continuously' }, duration: 22, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 25 min contínuos', en: 'Run 25 min continuously' }, duration: 25, zone: 2 },
        ],
      },
      {
        week: 7,
        sessions: [
          { type: 'easy_run', description: { 'pt-BR': 'Correr 25 min contínuos', en: 'Run 25 min continuously' }, duration: 25, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 28 min contínuos', en: 'Run 28 min continuously' }, duration: 28, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 25 min contínuos', en: 'Run 25 min continuously' }, duration: 25, zone: 2 },
        ],
      },
      {
        week: 8,
        sessions: [
          { type: 'easy_run', description: { 'pt-BR': 'Correr 28 min contínuos', en: 'Run 28 min continuously' }, duration: 28, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 30 min contínuos', en: 'Run 30 min continuously' }, duration: 30, zone: 2 },
          { type: 'easy_run', description: { 'pt-BR': 'Correr 30 min contínuos — Parabéns, você conseguiu! 🎉', en: 'Run 30 min continuously — Congratulations, you did it!' }, duration: 30, zone: 2 },
        ],
      },
    ],
  },
  {
    id: 'half-marathon',
    name: { 'pt-BR': 'Meia Maratona', en: 'Half Marathon' },
    modality: 'running',
    level: 'intermediate',
    goal: 'endurance',
    weeks: 12,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Prepare-se para sua primeira meia maratona com treinos de base, tempo e longão.',
      en: 'Prepare for your first half marathon with base, tempo, and long runs.',
    },
    icon: 'direction-1',
  },
  {
    id: 'speed-intervals',
    name: { 'pt-BR': 'Intervalados de Velocidade', en: 'Speed Intervals' },
    modality: 'running',
    level: 'advanced',
    goal: 'endurance',
    weeks: 6,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Melhore seu pace com treinos intervalados, fartlek e repetições em subida.',
      en: 'Improve your pace with interval training, fartlek, and hill repeats.',
    },
    icon: 'direction-1',
  },

  // — Yoga Programs —
  {
    id: 'yoga-flexibility',
    name: { 'pt-BR': 'Yoga Flexibilidade', en: 'Yoga Flexibility' },
    modality: 'yoga',
    level: 'beginner',
    goal: 'flexibility',
    weeks: 8,
    daysPerWeek: 3,
    description: {
      'pt-BR': 'Aumente sua flexibilidade com sequências de Hatha e Yin yoga.',
      en: 'Increase your flexibility with Hatha and Yin yoga sequences.',
    },
    icon: 'moon-half-right-5',
  },
  {
    id: 'yoga-power',
    name: { 'pt-BR': 'Power Yoga', en: 'Power Yoga' },
    modality: 'yoga',
    level: 'intermediate',
    goal: 'strength',
    weeks: 10,
    daysPerWeek: 4,
    description: {
      'pt-BR': 'Yoga dinâmico e intenso que combina força, equilíbrio e flexibilidade.',
      en: 'Dynamic and intense yoga combining strength, balance, and flexibility.',
    },
    icon: 'moon-half-right-5',
  },

  // — Mixed Programs —
  {
    id: 'hybrid-athlete',
    name: { 'pt-BR': 'Atleta Híbrido', en: 'Hybrid Athlete' },
    modality: 'mixed',
    level: 'advanced',
    goal: 'general',
    weeks: 12,
    daysPerWeek: 5,
    description: {
      'pt-BR': 'Combine musculação, corrida e mobilidade em um programa completo para o atleta completo.',
      en: 'Combine weight training, running, and mobility in a complete program for the complete athlete.',
    },
    icon: 'star-1',
  },
];

export const MODALITY_META = {
  gym: { color: '#c8f55a', icon: 'dumbbell-1' },
  crossfit: { color: '#ff6b6b', icon: 'fire-1' },
  calisthenics: { color: '#6bcfff', icon: 'bolt-alt' },
  pilates: { color: '#c899ff', icon: 'heart' },
  running: { color: '#ffc832', icon: 'direction-1' },
  yoga: { color: '#82dcb4', icon: 'moon-half-right-5' },
  mixed: { color: '#94a3b8', icon: 'star-1' },
};
