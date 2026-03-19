// CrossFit WOD Exercise Catalog
// Bilingual support: pt-BR and en

// ─── WOD Types ───────────────────────────────────────────────
export const WOD_TYPES = {
  amrap:    { 'pt-BR': 'AMRAP',          'en': 'AMRAP' },
  emom:     { 'pt-BR': 'EMOM',           'en': 'EMOM' },
  fortime:  { 'pt-BR': 'For Time',       'en': 'For Time' },
  strength: { 'pt-BR': 'Força',          'en': 'Strength' },
  hero:     { 'pt-BR': 'Hero WOD',       'en': 'Hero WOD' },
};

// ─── CrossFit Movements ──────────────────────────────────────
export const CROSSFIT_MOVEMENTS = {
  pull_up:          { 'pt-BR': 'Barra fixa',           'en': 'Pull-Up' },
  push_up:          { 'pt-BR': 'Flexão',               'en': 'Push-Up' },
  squat:            { 'pt-BR': 'Agachamento',           'en': 'Squat' },
  box_jump:         { 'pt-BR': 'Salto na caixa',       'en': 'Box Jump' },
  clean:            { 'pt-BR': 'Clean',                 'en': 'Clean' },
  snatch:           { 'pt-BR': 'Snatch',                'en': 'Snatch' },
  deadlift:         { 'pt-BR': 'Levantamento terra',    'en': 'Deadlift' },
  thruster:         { 'pt-BR': 'Thruster',              'en': 'Thruster' },
  burpee:           { 'pt-BR': 'Burpee',                'en': 'Burpee' },
  double_under:     { 'pt-BR': 'Double under',          'en': 'Double Under' },
  wall_ball:        { 'pt-BR': 'Wall ball',             'en': 'Wall Ball' },
  kettlebell_swing: { 'pt-BR': 'Swing de kettlebell',   'en': 'Kettlebell Swing' },
  rowing:           { 'pt-BR': 'Remo',                  'en': 'Rowing' },
  toes_to_bar:      { 'pt-BR': 'Toes to bar',           'en': 'Toes to Bar' },
  muscle_up:        { 'pt-BR': 'Muscle-up',             'en': 'Muscle-Up' },
};

// ─── Pre-built WODs (one per type) ──────────────────────────
export const CROSSFIT_WODS = [
  {
    id: 'wod_amrap_1',
    type: 'amrap',
    name: { 'pt-BR': 'Circuito Explosivo', 'en': 'Explosive Circuit' },
    timeCap: 12,
    movements: [
      { id: 'pull_up',      reps: 10 },
      { id: 'push_up',      reps: 15 },
      { id: 'squat',        reps: 20 },
    ],
  },
  {
    id: 'wod_emom_1',
    type: 'emom',
    name: { 'pt-BR': 'Motor EMOM', 'en': 'Engine EMOM' },
    timeCap: 16,
    movements: [
      { id: 'kettlebell_swing', reps: 12 },
      { id: 'burpee',           reps: 8 },
      { id: 'box_jump',         reps: 10 },
      { id: 'rowing',           reps: 15 },
    ],
  },
  {
    id: 'wod_fortime_1',
    type: 'fortime',
    name: { 'pt-BR': 'Sprint Total', 'en': 'Total Sprint' },
    timeCap: 20,
    movements: [
      { id: 'thruster',     reps: 21 },
      { id: 'pull_up',      reps: 21 },
      { id: 'thruster',     reps: 15 },
      { id: 'pull_up',      reps: 15 },
      { id: 'thruster',     reps: 9 },
      { id: 'pull_up',      reps: 9 },
    ],
  },
  {
    id: 'wod_strength_1',
    type: 'strength',
    name: { 'pt-BR': 'Força Olímpica', 'en': 'Olympic Strength' },
    timeCap: 25,
    movements: [
      { id: 'deadlift', reps: 5 },
      { id: 'clean',    reps: 5 },
      { id: 'snatch',   reps: 5 },
    ],
  },
  {
    id: 'wod_hero_1',
    type: 'hero',
    name: { 'pt-BR': 'Murph', 'en': 'Murph' },
    timeCap: 60,
    movements: [
      { id: 'pull_up',  reps: 100 },
      { id: 'push_up',  reps: 200 },
      { id: 'squat',    reps: 300 },
    ],
  },
];

// ─── Helper Functions ────────────────────────────────────────

/**
 * Returns the bilingual name for a CrossFit movement.
 * @param {string} id - Movement ID (e.g. 'pull_up')
 * @param {string} language - 'pt-BR' or 'en'
 * @returns {string} Translated movement name, or the id as fallback
 */
export function getCrossFitMovementName(id, language = 'pt-BR') {
  const movement = CROSSFIT_MOVEMENTS[id];
  if (!movement) return id;
  return movement[language] || movement['pt-BR'];
}

/**
 * Returns a WOD by index, cycling through the array.
 * @param {number} index - Any non-negative integer
 * @returns {object} The WOD at the cycled position
 */
export function getWodByIndex(index) {
  const len = CROSSFIT_WODS.length;
  return CROSSFIT_WODS[((index % len) + len) % len];
}
