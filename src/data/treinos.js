// Workout Training Data (existing gym training app data)
// Bilingual support: pt-BR and en

// Translation maps for muscle groups
export const MUSCLE_TRANSLATIONS = {
  'Peito': { 'pt-BR': 'Peito', 'en': 'Chest' },
  'Ombros': { 'pt-BR': 'Ombros', 'en': 'Shoulders' },
  'Tríceps': { 'pt-BR': 'Tríceps', 'en': 'Triceps' },
  'Costas': { 'pt-BR': 'Costas', 'en': 'Back' },
  'Bíceps': { 'pt-BR': 'Bíceps', 'en': 'Biceps' },
  'Quadríceps': { 'pt-BR': 'Quadríceps', 'en': 'Quads' },
  'Glúteos': { 'pt-BR': 'Glúteos', 'en': 'Glutes' },
  'Panturrilhas': { 'pt-BR': 'Panturrilhas', 'en': 'Calves' },
  'Posterior': { 'pt-BR': 'Posterior', 'en': 'Hamstrings' },
  'Trapézio': { 'pt-BR': 'Trapézio', 'en': 'Traps' },
};

// Exercise name translations
export const EXERCISE_TRANSLATIONS = {
  'supino_reto': { 'pt-BR': 'Supino reto com barra', 'en': 'Barbell Bench Press' },
  'supino_inclinado_haltere': { 'pt-BR': 'Supino inclinado com halteres', 'en': 'Incline Dumbbell Press' },
  'desenvolvimento_militar': { 'pt-BR': 'Desenvolvimento militar', 'en': 'Military Press' },
  'elevacao_lateral': { 'pt-BR': 'Elevação lateral', 'en': 'Lateral Raise' },
  'triceps_testa': { 'pt-BR': 'Tríceps testa', 'en': 'Skull Crusher' },
  'triceps_corda': { 'pt-BR': 'Tríceps corda', 'en': 'Triceps Rope Pushdown' },
  'barra_fixa': { 'pt-BR': 'Barra fixa / Pulldown', 'en': 'Pull-up / Lat Pulldown' },
  'remada_curvada': { 'pt-BR': 'Remada curvada com barra', 'en': 'Bent Over Barbell Row' },
  'remada_unilateral': { 'pt-BR': 'Remada unilateral com halter', 'en': 'Single Arm Dumbbell Row' },
  'pullover': { 'pt-BR': 'Pullover', 'en': 'Pullover' },
  'rosca_direta': { 'pt-BR': 'Rosca direta com barra', 'en': 'Barbell Curl' },
  'rosca_martelo': { 'pt-BR': 'Rosca martelo', 'en': 'Hammer Curl' },
  'agachamento': { 'pt-BR': 'Agachamento livre', 'en': 'Barbell Squat' },
  'jump_squat': { 'pt-BR': 'Jump squat', 'en': 'Jump Squat' },
  'leg_press': { 'pt-BR': 'Leg press', 'en': 'Leg Press' },
  'afundo': { 'pt-BR': 'Afundo caminhando', 'en': 'Walking Lunges' },
  'extensora': { 'pt-BR': 'Extensora', 'en': 'Leg Extension' },
  'panturrilha_pe': { 'pt-BR': 'Panturrilha em pé', 'en': 'Standing Calf Raise' },
  'supino_inclinado_barra': { 'pt-BR': 'Supino inclinado com barra', 'en': 'Incline Barbell Press' },
  'crucifixo_inclinado': { 'pt-BR': 'Crucifixo inclinado', 'en': 'Incline Dumbbell Fly' },
  'push_press': { 'pt-BR': 'Push press', 'en': 'Push Press' },
  'elevacao_frontal': { 'pt-BR': 'Elevação frontal', 'en': 'Front Raise' },
  'paralelas': { 'pt-BR': 'Paralelas / Mergulho', 'en': 'Dips' },
  'triceps_overhead': { 'pt-BR': 'Extensão de tríceps overhead', 'en': 'Overhead Triceps Extension' },
  'terra': { 'pt-BR': 'Levantamento terra', 'en': 'Deadlift' },
  'remada_cavalinho': { 'pt-BR': 'Remada cavalinho', 'en': 'T-Bar Row' },
  'pulldown_fechado': { 'pt-BR': 'Pulldown pegada fechada', 'en': 'Close Grip Pulldown' },
  'face_pull': { 'pt-BR': 'Face pull', 'en': 'Face Pull' },
  'encolhimento': { 'pt-BR': 'Encolhimento com barra', 'en': 'Barbell Shrug' },
  'rosca_scott': { 'pt-BR': 'Rosca Scott', 'en': 'Preacher Curl' },
  'stiff': { 'pt-BR': 'Stiff', 'en': 'Stiff-Leg Deadlift' },
  'mesa_flexora': { 'pt-BR': 'Mesa flexora', 'en': 'Lying Leg Curl' },
  'agachamento_bulgaro': { 'pt-BR': 'Agachamento búlgaro', 'en': 'Bulgarian Split Squat' },
  'hip_thrust': { 'pt-BR': 'Hip thrust', 'en': 'Hip Thrust' },
  'abdutora': { 'pt-BR': 'Cadeira abdutora', 'en': 'Hip Abduction Machine' },
  'panturrilha_sentado': { 'pt-BR': 'Panturrilha sentado', 'en': 'Seated Calf Raise' },
};

// Observation translations
export const OBS_TRANSLATIONS = {
  'Carga pesada': { 'pt-BR': 'Carga pesada', 'en': 'Heavy load' },
  'Concêntrica explosiva': { 'pt-BR': 'Concêntrica explosiva', 'en': 'Explosive concentric' },
  'Adicionar peso se possível': { 'pt-BR': 'Adicionar peso se possível', 'en': 'Add weight if possible' },
  'Explosivo': { 'pt-BR': 'Explosivo', 'en': 'Explosive' },
  'Carga máxima': { 'pt-BR': 'Carga máxima', 'en': 'Max load' },
  'Explosivo na subida': { 'pt-BR': 'Explosivo na subida', 'en': 'Explosive on the way up' },
};

export const TREINOS = {
  "segunda": {
    "nome": { "pt-BR": "Push A", "en": "Push A" },
    "grupos": ["Peito", "Ombros", "Tríceps"],
    "exercicios": [
      { "id": "supino_reto", "nome": "Supino reto com barra", "series": "4", "reps": "6–8", "obs": "Carga pesada", "musculos": ["Peito"] },
      { "id": "supino_inclinado_haltere", "nome": "Supino inclinado com halteres", "series": "3", "reps": "8–10", "obs": "Concêntrica explosiva", "musculos": ["Peito"] },
      { "id": "desenvolvimento_militar", "nome": "Desenvolvimento militar", "series": "4", "reps": "6–8", "obs": "", "musculos": ["Ombros"] },
      { "id": "elevacao_lateral", "nome": "Elevação lateral", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Ombros"] },
      { "id": "triceps_testa", "nome": "Tríceps testa", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Tríceps"] },
      { "id": "triceps_corda", "nome": "Tríceps corda", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Tríceps"] }
    ]
  },

  "terca": {
    "nome": { "pt-BR": "Pull A", "en": "Pull A" },
    "grupos": ["Costas", "Bíceps"],
    "exercicios": [
      { "id": "barra_fixa", "nome": "Barra fixa / Pulldown", "series": "4", "reps": "6–8", "obs": "Adicionar peso se possível", "musculos": ["Costas"] },
      { "id": "remada_curvada", "nome": "Remada curvada com barra", "series": "4", "reps": "6–8", "obs": "", "musculos": ["Costas"] },
      { "id": "remada_unilateral", "nome": "Remada unilateral com halter", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Costas"] },
      { "id": "pullover", "nome": "Pullover", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Costas", "Peito"] },
      { "id": "rosca_direta", "nome": "Rosca direta com barra", "series": "3", "reps": "8–10", "obs": "", "musculos": ["Bíceps"] },
      { "id": "rosca_martelo", "nome": "Rosca martelo", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Bíceps"] }
    ]
  },

  "quarta": {
    "nome": { "pt-BR": "Legs A", "en": "Legs A" },
    "grupos": ["Quadríceps", "Glúteos", "Panturrilhas"],
    "exercicios": [
      { "id": "agachamento", "nome": "Agachamento livre", "series": "4", "reps": "6–8", "obs": "Carga pesada", "musculos": ["Quadríceps", "Glúteos"] },
      { "id": "jump_squat", "nome": "Jump squat", "series": "3", "reps": "8–10", "obs": "Explosivo", "musculos": ["Quadríceps"] },
      { "id": "leg_press", "nome": "Leg press", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Quadríceps", "Glúteos"] },
      { "id": "afundo", "nome": "Afundo caminhando", "series": "3", "reps": "12 passos", "obs": "", "musculos": ["Quadríceps", "Glúteos"] },
      { "id": "extensora", "nome": "Extensora", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Quadríceps"] },
      { "id": "panturrilha_pe", "nome": "Panturrilha em pé", "series": "4", "reps": "15–20", "obs": "", "musculos": ["Panturrilhas"] }
    ]
  },

  "quinta": {
    "nome": { "pt-BR": "Push B", "en": "Push B" },
    "grupos": ["Peito", "Ombros", "Tríceps"],
    "exercicios": [
      { "id": "supino_inclinado_barra", "nome": "Supino inclinado com barra", "series": "4", "reps": "6–8", "obs": "", "musculos": ["Peito"] },
      { "id": "crucifixo_inclinado", "nome": "Crucifixo inclinado", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Peito"] },
      { "id": "push_press", "nome": "Push press", "series": "3", "reps": "6–8", "obs": "Explosivo", "musculos": ["Ombros"] },
      { "id": "elevacao_frontal", "nome": "Elevação frontal", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Ombros"] },
      { "id": "paralelas", "nome": "Paralelas / Mergulho", "series": "3", "reps": "8–10", "obs": "", "musculos": ["Peito", "Tríceps"] },
      { "id": "triceps_overhead", "nome": "Extensão de tríceps overhead", "series": "3", "reps": "12–15", "obs": "", "musculos": ["Tríceps"] }
    ]
  },

  "sexta": {
    "nome": { "pt-BR": "Pull B", "en": "Pull B" },
    "grupos": ["Costas", "Bíceps", "Trapézio"],
    "exercicios": [
      { "id": "terra", "nome": "Levantamento terra", "series": "4", "reps": "5–6", "obs": "Carga máxima", "musculos": ["Costas", "Posterior"] },
      { "id": "remada_cavalinho", "nome": "Remada cavalinho", "series": "3", "reps": "8–10", "obs": "", "musculos": ["Costas"] },
      { "id": "pulldown_fechado", "nome": "Pulldown pegada fechada", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Costas"] },
      { "id": "face_pull", "nome": "Face pull", "series": "3", "reps": "15–20", "obs": "", "musculos": ["Ombros", "Trapézio"] },
      { "id": "encolhimento", "nome": "Encolhimento com barra", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Trapézio"] },
      { "id": "rosca_scott", "nome": "Rosca Scott", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Bíceps"] }
    ]
  },

  "sabado": {
    "nome": { "pt-BR": "Legs B", "en": "Legs B" },
    "grupos": ["Posterior", "Glúteos", "Panturrilhas"],
    "exercicios": [
      { "id": "stiff", "nome": "Stiff", "series": "4", "reps": "8–10", "obs": "", "musculos": ["Posterior", "Glúteos"] },
      { "id": "mesa_flexora", "nome": "Mesa flexora", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Posterior"] },
      { "id": "agachamento_bulgaro", "nome": "Agachamento búlgaro", "series": "3", "reps": "10–12", "obs": "", "musculos": ["Quadríceps", "Glúteos"] },
      { "id": "hip_thrust", "nome": "Hip thrust", "series": "4", "reps": "10–12", "obs": "Explosivo na subida", "musculos": ["Glúteos"] },
      { "id": "abdutora", "nome": "Cadeira abdutora", "series": "3", "reps": "15–20", "obs": "", "musculos": ["Glúteos"] },
      { "id": "panturrilha_sentado", "nome": "Panturrilha sentado", "series": "3", "reps": "15–20", "obs": "", "musculos": ["Panturrilhas"] }
    ]
  }
};

export const DAY_MAP = {
  "domingo": "domingo",
  "segunda-feira": "segunda",
  "terça-feira": "terca",
  "quarta-feira": "quarta",
  "quinta-feira": "quinta",
  "sexta-feira": "sexta",
  "sábado": "sabado"
};

export const TRAINING_DAYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

// Helper functions for translations
export function getExerciseName(id, language = 'pt-BR') {
  return EXERCISE_TRANSLATIONS[id]?.[language] || EXERCISE_TRANSLATIONS[id]?.['pt-BR'] || id;
}

export function getMuscle(muscle, language = 'pt-BR') {
  return MUSCLE_TRANSLATIONS[muscle]?.[language] || muscle;
}

export function getObs(obs, language = 'pt-BR') {
  if (!obs) return '';
  return OBS_TRANSLATIONS[obs]?.[language] || obs;
}

export function getWorkoutName(treino, language = 'pt-BR') {
  if (typeof treino.nome === 'object') {
    return treino.nome[language] || treino.nome['pt-BR'];
  }
  return treino.nome;
}
