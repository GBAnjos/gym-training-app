# Epic 3: Expanded Sports & Activities — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Vida to support 6 activity types (Gym, CrossFit, Calisthenics, Pilates, Running, Yoga) with sport-specific training cards, multi-activity onboarding, and intelligent schedule distribution.

**Architecture:** Replace the single `gymPreference` onboarding step with a 3-part activity selection flow. Each activity type gets its own exercise catalog data file and dedicated training card component. The schedule generator distributes activities across the week based on goals and frequency. TrainingPage routes to the correct card component per day.

**Tech Stack:** React (hooks), localStorage + Supabase, CSS with design tokens, bilingual i18n (pt-BR/en)

**Spec:** `docs/superpowers/specs/2026-03-19-epic3-expanded-sports-design.md`

---

## Chunk 1: Foundation — Design Tokens, i18n, Data Catalogs

### Task 1: Add Sport Color Tokens to Design System

**Files:**
- Modify: `src/data/design.js`

- [ ] **Step 1: Add `sportColors` to DESIGN object**

Add after `blockTypeColors` (after line 30):

```js
sportColors: {
  gym: { primary: '#c8f55a', bg: 'rgba(200,245,90,0.1)', border: 'rgba(200,245,90,0.2)' },
  crossfit: { primary: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)' },
  calisthenics: { primary: '#6bcfff', bg: 'rgba(107,207,255,0.1)', border: 'rgba(107,207,255,0.2)' },
  pilates: { primary: '#c899ff', bg: 'rgba(200,153,255,0.1)', border: 'rgba(200,153,255,0.2)' },
  running: { primary: '#ffc832', bg: 'rgba(255,200,50,0.1)', border: 'rgba(255,200,50,0.2)' },
  yoga: { primary: '#82dcb4', bg: 'rgba(130,220,180,0.1)', border: 'rgba(130,220,180,0.2)' },
},
```

- [ ] **Step 2: Add `sport` block type color**

Add to `blockTypeColors` (after line 29):

```js
sport: "#ffc832",
```

- [ ] **Step 3: Commit**

```bash
git add src/data/design.js
git commit -m "feat: add sport color tokens to design system"
```

---

### Task 2: Add i18n Translation Keys

**Files:**
- Modify: `src/hooks/useLanguage.jsx`

- [ ] **Step 1: Add activity and onboarding keys to pt-BR translations**

Add to the `'pt-BR'` object (around line 300, near other onboarding keys):

```js
// Activity selection (onboarding)
onboarding_activity_title: 'Como você treina?',
onboarding_activity_subtitle: 'Selecione todas que pratica',
activity_gym: 'Academia',
activity_crossfit: 'CrossFit',
activity_calisthenics: 'Calistenia',
activity_pilates: 'Pilates',

// Activity add-ons (onboarding)
onboarding_addons_title: 'Pratica mais alguma?',
onboarding_addons_skip: 'Pular',
activity_running: 'Corrida',
activity_yoga: 'Yoga',
frequency_label: 'vezes/semana',

// Activity time preference (onboarding)
onboarding_time_title: 'Quando prefere treinar?',
time_morning: 'Manhã',
time_afternoon: 'Tarde',
time_evening: 'Noite',
time_flexible: 'Flexível',

// Activity card labels
crossfit_wod: 'WOD',
crossfit_rounds: 'Rounds',
crossfit_score: 'Score',
crossfit_movements: 'Movimentos',
calisthenics_level: 'Nível',
calisthenics_hold: 'Segurar',
calisthenics_sets: 'Séries',
pilates_flow: 'Flow',
pilates_duration: 'Duração',
pilates_moves: 'Movimentos',
running_distance: 'Distância',
running_pace: 'Pace',
running_zone: 'Zona',
yoga_style: 'Estilo',
yoga_duration: 'Duração',
yoga_focus: 'Foco',
```

- [ ] **Step 2: Add same keys to en translations**

Add to the `'en'` object:

```js
onboarding_activity_title: 'How do you train?',
onboarding_activity_subtitle: 'Select all that apply',
activity_gym: 'Gym',
activity_crossfit: 'CrossFit',
activity_calisthenics: 'Calisthenics',
activity_pilates: 'Pilates',
onboarding_addons_title: 'Do you also do any of these?',
onboarding_addons_skip: 'Skip',
activity_running: 'Running',
activity_yoga: 'Yoga',
frequency_label: 'times/week',
onboarding_time_title: 'When do you prefer to train?',
time_morning: 'Morning',
time_afternoon: 'Afternoon',
time_evening: 'Evening',
time_flexible: 'Flexible',
crossfit_wod: 'WOD',
crossfit_rounds: 'Rounds',
crossfit_score: 'Score',
crossfit_movements: 'Movements',
calisthenics_level: 'Level',
calisthenics_hold: 'Hold',
calisthenics_sets: 'Sets',
pilates_flow: 'Flow',
pilates_duration: 'Duration',
pilates_moves: 'Movements',
running_distance: 'Distance',
running_pace: 'Pace',
running_zone: 'Zone',
yoga_style: 'Style',
yoga_duration: 'Duration',
yoga_focus: 'Focus',
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLanguage.jsx
git commit -m "feat: add i18n keys for activity selection and sport cards"
```

---

### Task 3: Create Exercise Catalogs — CrossFit

**Files:**
- Create: `src/data/crossfit.js`

- [ ] **Step 1: Create CrossFit WOD catalog**

```js
// CrossFit WODs and movements catalog
// Pattern: bilingual labels (pt-BR/en), typed by WOD style

export const WOD_TYPES = {
  amrap: { 'pt-BR': 'AMRAP', 'en': 'AMRAP' },
  emom: { 'pt-BR': 'EMOM', 'en': 'EMOM' },
  fortime: { 'pt-BR': 'For Time', 'en': 'For Time' },
  strength: { 'pt-BR': 'Força', 'en': 'Strength' },
  hero: { 'pt-BR': 'Hero WOD', 'en': 'Hero WOD' },
};

export const CROSSFIT_MOVEMENTS = {
  pull_up: { 'pt-BR': 'Pull-up', 'en': 'Pull-up' },
  push_up: { 'pt-BR': 'Flexão', 'en': 'Push-up' },
  squat: { 'pt-BR': 'Agachamento', 'en': 'Squat' },
  box_jump: { 'pt-BR': 'Box Jump', 'en': 'Box Jump' },
  clean: { 'pt-BR': 'Clean', 'en': 'Clean' },
  snatch: { 'pt-BR': 'Snatch', 'en': 'Snatch' },
  deadlift: { 'pt-BR': 'Levantamento Terra', 'en': 'Deadlift' },
  thruster: { 'pt-BR': 'Thruster', 'en': 'Thruster' },
  burpee: { 'pt-BR': 'Burpee', 'en': 'Burpee' },
  double_under: { 'pt-BR': 'Double Under', 'en': 'Double Under' },
  wall_ball: { 'pt-BR': 'Wall Ball', 'en': 'Wall Ball' },
  kettlebell_swing: { 'pt-BR': 'Kettlebell Swing', 'en': 'Kettlebell Swing' },
  rowing: { 'pt-BR': 'Remo', 'en': 'Rowing' },
  toes_to_bar: { 'pt-BR': 'Toes to Bar', 'en': 'Toes to Bar' },
  muscle_up: { 'pt-BR': 'Muscle-up', 'en': 'Muscle-up' },
};

// WOD rotation: one per training day, cycles through types
export const CROSSFIT_WODS = [
  {
    id: 'amrap_classic',
    type: 'amrap',
    name: { 'pt-BR': 'AMRAP Clássico', 'en': 'Classic AMRAP' },
    timeCap: 20,
    movements: [
      { id: 'pull_up', reps: 5 },
      { id: 'push_up', reps: 10 },
      { id: 'squat', reps: 15 },
    ],
  },
  {
    id: 'emom_power',
    type: 'emom',
    name: { 'pt-BR': 'EMOM Potência', 'en': 'Power EMOM' },
    timeCap: 16,
    movements: [
      { id: 'clean', reps: 3 },
      { id: 'thruster', reps: 5 },
      { id: 'burpee', reps: 7 },
      { id: 'box_jump', reps: 9 },
    ],
  },
  {
    id: 'fortime_grind',
    type: 'fortime',
    name: { 'pt-BR': 'For Time: Grind', 'en': 'For Time: Grind' },
    timeCap: 25,
    movements: [
      { id: 'deadlift', reps: 21 },
      { id: 'wall_ball', reps: 15 },
      { id: 'kettlebell_swing', reps: 9 },
    ],
  },
  {
    id: 'strength_heavy',
    type: 'strength',
    name: { 'pt-BR': 'Dia de Força', 'en': 'Strength Day' },
    timeCap: 30,
    movements: [
      { id: 'deadlift', reps: '5-5-5-5-5' },
      { id: 'snatch', reps: '3-3-3-3-3' },
    ],
  },
  {
    id: 'hero_murph_lite',
    type: 'hero',
    name: { 'pt-BR': 'Murph Lite', 'en': 'Murph Lite' },
    timeCap: 40,
    movements: [
      { id: 'pull_up', reps: 50 },
      { id: 'push_up', reps: 100 },
      { id: 'squat', reps: 150 },
    ],
  },
];

export function getCrossFitMovementName(id, language) {
  return CROSSFIT_MOVEMENTS[id]?.[language] || CROSSFIT_MOVEMENTS[id]?.['pt-BR'] || id;
}

export function getWodByIndex(index) {
  return CROSSFIT_WODS[index % CROSSFIT_WODS.length];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/crossfit.js
git commit -m "feat: add CrossFit WOD exercise catalog"
```

---

### Task 4: Create Exercise Catalogs — Calisthenics

**Files:**
- Create: `src/data/calisthenics.js`

- [ ] **Step 1: Create Calisthenics progressions catalog**

```js
// Calisthenics progressions and skills catalog
// Each skill has a progression path from beginner to advanced

export const CALISTHENICS_SKILLS = {
  // Push skills
  push_up_progression: {
    id: 'push_up_progression',
    name: { 'pt-BR': 'Progressão de Flexão', 'en': 'Push-up Progression' },
    category: 'push',
    levels: [
      { level: 1, name: { 'pt-BR': 'Flexão Inclinada', 'en': 'Incline Push-up' }, sets: 4, reps: '12-15' },
      { level: 2, name: { 'pt-BR': 'Flexão Normal', 'en': 'Standard Push-up' }, sets: 4, reps: '10-12' },
      { level: 3, name: { 'pt-BR': 'Flexão Diamante', 'en': 'Diamond Push-up' }, sets: 4, reps: '8-10' },
      { level: 4, name: { 'pt-BR': 'Flexão Archer', 'en': 'Archer Push-up' }, sets: 3, reps: '6-8' },
      { level: 5, name: { 'pt-BR': 'Flexão de Um Braço', 'en': 'One-arm Push-up' }, sets: 3, reps: '3-5' },
    ],
  },
  pull_up_progression: {
    id: 'pull_up_progression',
    name: { 'pt-BR': 'Progressão de Barra', 'en': 'Pull-up Progression' },
    category: 'pull',
    levels: [
      { level: 1, name: { 'pt-BR': 'Barra Australiana', 'en': 'Australian Pull-up' }, sets: 4, reps: '10-12' },
      { level: 2, name: { 'pt-BR': 'Barra Negativa', 'en': 'Negative Pull-up' }, sets: 4, reps: '5-8' },
      { level: 3, name: { 'pt-BR': 'Barra Fixa', 'en': 'Pull-up' }, sets: 4, reps: '6-10' },
      { level: 4, name: { 'pt-BR': 'Barra com Peso', 'en': 'Weighted Pull-up' }, sets: 3, reps: '5-8' },
      { level: 5, name: { 'pt-BR': 'Muscle-up', 'en': 'Muscle-up' }, sets: 3, reps: '3-5' },
    ],
  },
  front_lever: {
    id: 'front_lever',
    name: { 'pt-BR': 'Front Lever', 'en': 'Front Lever' },
    category: 'pull',
    levels: [
      { level: 1, name: { 'pt-BR': 'Tuck', 'en': 'Tuck' }, sets: 4, hold: '10-15s' },
      { level: 2, name: { 'pt-BR': 'Advanced Tuck', 'en': 'Advanced Tuck' }, sets: 4, hold: '10-15s' },
      { level: 3, name: { 'pt-BR': 'Straddle', 'en': 'Straddle' }, sets: 3, hold: '8-12s' },
      { level: 4, name: { 'pt-BR': 'Half Lay', 'en': 'Half Lay' }, sets: 3, hold: '5-10s' },
      { level: 5, name: { 'pt-BR': 'Full Front Lever', 'en': 'Full Front Lever' }, sets: 3, hold: '3-8s' },
    ],
  },
  pistol_squat: {
    id: 'pistol_squat',
    name: { 'pt-BR': 'Pistol Squat', 'en': 'Pistol Squat' },
    category: 'legs',
    levels: [
      { level: 1, name: { 'pt-BR': 'Agachamento Búlgaro', 'en': 'Bulgarian Split Squat' }, sets: 4, reps: '10-12' },
      { level: 2, name: { 'pt-BR': 'Pistol Assistido', 'en': 'Assisted Pistol' }, sets: 4, reps: '6-8' },
      { level: 3, name: { 'pt-BR': 'Pistol Negativo', 'en': 'Negative Pistol' }, sets: 3, reps: '5-6' },
      { level: 4, name: { 'pt-BR': 'Pistol Squat', 'en': 'Pistol Squat' }, sets: 3, reps: '5-8' },
      { level: 5, name: { 'pt-BR': 'Pistol com Peso', 'en': 'Weighted Pistol' }, sets: 3, reps: '3-5' },
    ],
  },
  handstand: {
    id: 'handstand',
    name: { 'pt-BR': 'Parada de Mão', 'en': 'Handstand' },
    category: 'push',
    levels: [
      { level: 1, name: { 'pt-BR': 'Pike na parede', 'en': 'Wall Pike' }, sets: 3, hold: '20-30s' },
      { level: 2, name: { 'pt-BR': 'Parada na parede', 'en': 'Wall Handstand' }, sets: 3, hold: '20-30s' },
      { level: 3, name: { 'pt-BR': 'Parada livre (kick-up)', 'en': 'Freestanding (kick-up)' }, sets: 5, hold: '5-15s' },
      { level: 4, name: { 'pt-BR': 'Parada livre sólida', 'en': 'Solid Freestanding' }, sets: 3, hold: '15-30s' },
      { level: 5, name: { 'pt-BR': 'HSPU', 'en': 'Handstand Push-up' }, sets: 3, reps: '3-5' },
    ],
  },
  planche: {
    id: 'planche',
    name: { 'pt-BR': 'Planche', 'en': 'Planche' },
    category: 'push',
    levels: [
      { level: 1, name: { 'pt-BR': 'Planche Lean', 'en': 'Planche Lean' }, sets: 4, hold: '15-20s' },
      { level: 2, name: { 'pt-BR': 'Tuck Planche', 'en': 'Tuck Planche' }, sets: 4, hold: '10-15s' },
      { level: 3, name: { 'pt-BR': 'Advanced Tuck', 'en': 'Advanced Tuck' }, sets: 3, hold: '8-12s' },
      { level: 4, name: { 'pt-BR': 'Straddle Planche', 'en': 'Straddle Planche' }, sets: 3, hold: '5-8s' },
      { level: 5, name: { 'pt-BR': 'Full Planche', 'en': 'Full Planche' }, sets: 3, hold: '3-5s' },
    ],
  },
};

// Split rotations for calisthenics days
export const CALISTHENICS_SPLITS = [
  { name: { 'pt-BR': 'Push Skills', 'en': 'Push Skills' }, category: 'push', skills: ['push_up_progression', 'handstand', 'planche'] },
  { name: { 'pt-BR': 'Pull Skills', 'en': 'Pull Skills' }, category: 'pull', skills: ['pull_up_progression', 'front_lever'] },
  { name: { 'pt-BR': 'Legs & Core', 'en': 'Legs & Core' }, category: 'legs', skills: ['pistol_squat'] },
  { name: { 'pt-BR': 'Static Holds', 'en': 'Static Holds' }, category: 'static', skills: ['front_lever', 'planche', 'handstand'] },
];

export function getCalisthenicsSkill(skillId) {
  return CALISTHENICS_SKILLS[skillId] || null;
}

export function getCalisthenicsSplitByIndex(index) {
  return CALISTHENICS_SPLITS[index % CALISTHENICS_SPLITS.length];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/calisthenics.js
git commit -m "feat: add Calisthenics progressions catalog"
```

---

### Task 5: Create Exercise Catalogs — Pilates, Running, Yoga

**Files:**
- Create: `src/data/pilates.js`
- Create: `src/data/running.js`
- Create: `src/data/yoga.js`

- [ ] **Step 1: Create Pilates flows catalog**

Create `src/data/pilates.js` with flow rotations (Core Flow, Full Body, Lower Body, Flexibility), each containing a sequence of movements with bilingual names. Export `PILATES_FLOWS`, `PILATES_SPLITS`, and `getPilatesFlowByIndex(index)`.

Flows should follow the same bilingual pattern as crossfit.js. Include 4 flows with 8-12 movements each. Movements: The Hundred, Roll Up, Leg Circle, Single Leg Stretch, Double Leg Stretch, Spine Stretch, Saw, Swan, Teaser, Shoulder Bridge, Side Kick, Swimming.

- [ ] **Step 2: Create Running plans catalog**

Create `src/data/running.js` with run types and training sessions. Export `RUN_TYPES`, `RUNNING_SESSIONS`, and `getRunSessionByIndex(index)`.

Run types: Easy Run, Long Run, Intervals, Tempo, Recovery. Each session has: id, type, name (i18n), distance, targetPace (description), zone (1-5). Include 5 sessions rotating through types.

- [ ] **Step 3: Create Yoga poses catalog**

Create `src/data/yoga.js` with yoga styles and pose sequences. Export `YOGA_STYLES`, `YOGA_SESSIONS`, and `getYogaSessionByIndex(index)`.

Styles: Vinyasa, Hatha, Yin, Power. Each session has: id, style, name (i18n), duration (min), focus (strength/flexibility/balance/relaxation), poses[] (array of pose names i18n). Include 4 sessions, one per style.

- [ ] **Step 4: Commit**

```bash
git add src/data/pilates.js src/data/running.js src/data/yoga.js
git commit -m "feat: add Pilates, Running, and Yoga exercise catalogs"
```

---

## Chunk 2: Onboarding Flow Changes

### Task 6: Update STEPS Array and Profile State

**Files:**
- Modify: `src/components/OnboardingFlow.jsx:8-20` (STEPS array)
- Modify: `src/components/OnboardingFlow.jsx:29-55` (profile state)

- [ ] **Step 1: Replace STEPS array**

Replace lines 8-20:

```js
const STEPS = [
  'welcome',
  'language',
  'wakeTime',
  'sleepHours',
  'lunchTime',
  'dinnerTime',
  'activitySelect',   // Step 5: What activities do you do?
  'activityAddons',    // Step 5b: Any add-on activities?
  'activityTime',      // Step 5c: When do you prefer to train?
  'officeDays',
  'goals',
  'physicalData',
  'generating'
];
```

- [ ] **Step 2: Add new profile fields**

In the profile state (around line 29), replace `gymPreference` field and add new fields:

```js
// Step 5: Activities
mainActivities: [],          // ['gym', 'crossfit', ...]
addOnActivities: [],         // [{ type: 'running', frequency: 2 }, ...]
gymPreference: '',           // 'morning' | 'afternoon' | 'evening' | 'flexible'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingFlow.jsx
git commit -m "feat: update STEPS array and profile state for multi-activity"
```

---

### Task 7: Build Activity Selection Steps (JSX)

**Files:**
- Modify: `src/components/OnboardingFlow.jsx` — replace `GymPreferenceStep` (lines 502-549) and add new step components
- Modify: `src/components/OnboardingFlow.css` — add styles for activity grid

- [ ] **Step 1: Create `ActivitySelectStep` component**

Replace the `GymPreferenceStep` function (lines 502-549) with `ActivitySelectStep`. This renders a 2x2 grid of main activities (Gym, CrossFit, Calisthenics, Pilates) as toggle cards with sport-colored borders. Uses `DESIGN.sportColors` for styling. Multi-select — at least one required.

Activity data:
```js
const MAIN_ACTIVITIES = [
  { id: 'gym', icon: 'dumbbell-1', color: DESIGN.sportColors.gym },
  { id: 'crossfit', icon: 'fire-1', color: DESIGN.sportColors.crossfit },
  { id: 'calisthenics', icon: 'bolt-alt', color: DESIGN.sportColors.calisthenics },
  { id: 'pilates', icon: 'heart', color: DESIGN.sportColors.pilates },
];
```

- [ ] **Step 2: Create `ActivityAddonsStep` component**

Renders Running and Yoga as optional toggle cards. When selected, shows an inline frequency picker (1x, 2x, 3x buttons). Has a prominent "Skip" button at the bottom that calls `nextStep()` with empty addOnActivities.

Add-on data:
```js
const ADDON_ACTIVITIES = [
  { id: 'running', icon: 'direction-1', color: DESIGN.sportColors.running },
  { id: 'yoga', icon: 'moon-half-right-5', color: DESIGN.sportColors.yoga },
];
```

- [ ] **Step 3: Create `ActivityTimeStep` component**

Renders 4 time preference options (Morning, Afternoon, Evening, Flexible) as vertical cards with icons. Same layout pattern as the old `GymPreferenceStep` but with 4 options. Stores value in `profile.gymPreference` for backward compatibility.

- [ ] **Step 4: Update the main step router**

In the main `OnboardingFlow` component's render logic, update the step-to-component mapping to route `activitySelect` → `ActivitySelectStep`, `activityAddons` → `ActivityAddonsStep`, `activityTime` → `ActivityTimeStep`. Remove old `gymPreference` case.

- [ ] **Step 5: Add CSS for activity selection grid**

Add to `OnboardingFlow.css` (replace the `.gym-preference-options` block at lines 1047-1103):

Styles needed:
- `.activity-grid` — 2x2 grid, gap 12px
- `.activity-card` — elevated bg, border, border-radius, padding, flex column center, cursor pointer, transition
- `.activity-card.selected` — colored border from sport color, colored bg from sport bg
- `.activity-card-icon` — 2rem, margin bottom
- `.activity-card-label` — font-weight 600, 0.9rem
- `.addon-card` — similar to activity-card but wider (row layout)
- `.addon-frequency` — flex row of 3 small buttons (1x, 2x, 3x)
- `.addon-frequency-btn.active` — sport-colored background
- `.skip-btn` — full width, muted background, centered text

- [ ] **Step 6: Commit**

```bash
git add src/components/OnboardingFlow.jsx src/components/OnboardingFlow.css
git commit -m "feat: add multi-activity onboarding steps (select, addons, time)"
```

---

### Task 8: Update Schedule Generation for Multi-Activity

**Files:**
- Modify: `src/components/OnboardingFlow.jsx` — `getTrainingSplit` (line 890) and `generateScheduleFromProfile` (line 955)

- [ ] **Step 1: Replace `getTrainingSplit` with `getActivityPlan`**

New function that accepts `(goals, mainActivities, addOnActivities)` and returns:

```js
{
  trainingDays: ['Seg', 'Ter', ...],
  dayActivities: { 'Seg': { type: 'gym', split: {...} }, 'Ter': { type: 'running', session: {...} }, ... },
  splitType: 'PPL',  // primary activity's split type
  split: [...],      // backward compat: gym-only split array
}
```

Algorithm:
1. Total main training days from goals (muscle_gain→5, weight_loss→4, general→3)
2. Distribute main activities: round-robin in selection order, first selected gets most days
3. Assign splits for each main activity day:
   - Gym days: assign from existing getTrainingSplit logic (PPL/UL/FB)
   - CrossFit days: assign WOD from `getWodByIndex`
   - Calisthenics days: assign from `getCalisthenicsSplitByIndex`
   - Pilates days: assign flow from `getPilatesFlowByIndex`
4. Place add-ons on remaining free days:
   - **Running avoids leg-heavy gym days** — check if adjacent gym day has Legs/Lower split, skip that day
   - **Yoga can go on any day** (recovery-friendly)
   - Max 6 active days per week (at least 1 rest day always)
5. **Overflow/stacking**: if add-on frequency exceeds free days:
   - First: reduce add-on frequency to fit available slots
   - If still overflowing: stack add-ons as secondary blocks on main activity days (e.g., morning yoga + evening gym). In `dayActivities`, add a `secondary` field: `{ type: 'yoga', session: {...} }`. The schedule generator creates a separate schedule block for the secondary activity.
6. Assign add-on sessions:
   - Running days: assign from `getRunSessionByIndex`
   - Yoga days: assign from `getYogaSessionByIndex`

- [ ] **Step 2: Update `generateScheduleFromProfile` to use `getActivityPlan`**

Replace the call to `getTrainingSplit(goals)` with `getActivityPlan(goals, mainActivities, addOnActivities)`. Update the gym block generation to read from `dayActivities` — for gym days show split info as before, for other activity types show the activity-specific description.

Add `'afternoon'` handling: when `gymPreference === 'afternoon'`, place training blocks at `~14:00` instead of morning or evening.

- [ ] **Step 3: Update `handleGenerate` to pass new profile fields**

Ensure `handleGenerate` passes `mainActivities` and `addOnActivities` from the profile to `generateScheduleFromProfile`.

- [ ] **Step 4: Commit**

```bash
git add src/components/OnboardingFlow.jsx
git commit -m "feat: multi-activity schedule generation with day distribution"
```

---

## Chunk 3: Activity Card Components & Training Page

### Task 9: Create CrossFitCard Component

**Files:**
- Create: `src/components/activity-cards/CrossFitCard.jsx`
- Create: `src/components/activity-cards/ActivityCard.css`

- [ ] **Step 1: Create shared ActivityCard.css**

Shared base styles for all activity cards:
- `.activity-card` — elevated bg, border, border-radius 12px, padding, margin-bottom
- `.activity-card-header` — flex row, sport icon + name + type badge
- `.activity-card-badge` — small colored pill (sport color bg + text)
- `.activity-card-body` — padding, content area
- `.activity-card-field` — input group with label and value
- `.activity-card-actions` — flex row, timer/complete buttons
- `.activity-card-complete` — checkbox with sport-colored check icon

Then CrossFit-specific:
- `.crossfit-movements` — list of movements with reps
- `.crossfit-timer` — large centered timer display with coral accent
- `.crossfit-score` — input for rounds/time result

- [ ] **Step 2: Create CrossFitCard.jsx**

Component receives `{ dayActivity, day, language, toast }`. Renders:
- WOD name + type badge (AMRAP/EMOM/etc)
- Movement list from catalog
- Round counter (+ / - buttons)
- Timer (WOD timer using existing timer logic)
- Score input
- Complete checkbox
- Storage: `crossfit_${day}_${today}` → `{ rounds, score, completed, date }`

- [ ] **Step 3: Commit**

```bash
git add src/components/activity-cards/
git commit -m "feat: add CrossFitCard component with WOD tracking"
```

---

### Task 10: Create CalisthenicsCard Component

**Files:**
- Create: `src/components/activity-cards/CalisthenicsCard.jsx`

- [ ] **Step 1: Create CalisthenicsCard.jsx**

Renders a list of skills for the day's split (from `CALISTHENICS_SPLITS`). Each skill shows:
- Skill name + level badge (LVL N in calisthenics blue)
- Visual progression path: all levels listed, current highlighted
- Hold time or reps input (depending on skill type)
- Sets counter
- Complete checkbox
- Storage: `calisthenics_${day}_${skillId}` → `{ level, holdTime, sets, completed }`

User's progression level defaults to 1, stored per skill in localStorage `calisthenics_levels_${skillId}`.

- [ ] **Step 2: Commit**

```bash
git add src/components/activity-cards/CalisthenicsCard.jsx
git commit -m "feat: add CalisthenicsCard with progression tracking"
```

---

### Task 11: Create PilatesCard, RunCard, YogaCard

**Files:**
- Create: `src/components/activity-cards/PilatesCard.jsx`
- Create: `src/components/activity-cards/RunCard.jsx`
- Create: `src/components/activity-cards/YogaCard.jsx`

- [ ] **Step 1: Create PilatesCard.jsx**

Renders:
- Flow name + duration badge (lavender accent)
- Ordered movement sequence (numbered list)
- Duration tracker (elapsed time)
- Focus area tag
- Complete checkbox
- Storage: `pilates_${day}_${today}` → `{ duration, completed }`

- [ ] **Step 2: Create RunCard.jsx**

Renders:
- Run type + distance badge (gold accent)
- Distance input (km)
- Pace display (min/km) — auto-calculated if distance + time entered
- Duration input (minutes)
- Heart rate zone indicator (1-5 with color scale)
- Complete checkbox
- Storage: `run_${day}_${today}` → `{ distance, duration, pace, zone, completed }`

- [ ] **Step 3: Create YogaCard.jsx**

Renders:
- Style name + duration badge (mint accent)
- Pose sequence list
- Focus area tag (strength/flexibility/balance/relaxation)
- Duration tracker
- Complete checkbox
- Storage: `yoga_${day}_${today}` → `{ duration, focus, completed }`

- [ ] **Step 4: Commit**

```bash
git add src/components/activity-cards/
git commit -m "feat: add PilatesCard, RunCard, YogaCard components"
```

---

### Task 12: Update TrainingPage Routing

**Files:**
- Modify: `src/pages/TrainingPage.jsx`

**Note:** This task depends on Tasks 9-11 (card components must exist before importing them).

- [ ] **Step 1: Update `useWorkoutPlan` and `buildTrainingMap`**

Modify `buildTrainingMap` (lines 25-44) to check for `plan.dayActivities` first. If present, build the training map from `dayActivities` instead of `split`. Fall back to existing `split` logic for backward compatibility.

Update `getActiveDays` (lines 46-49) to read from `dayActivities` keys when available.

- [ ] **Step 2: Add activity type color dots to day selector**

Import `DESIGN` from `design.js`. In the day selector buttons (line 154), add a `<span>` after the day abbreviation with a 6px colored circle using the sport color from `DESIGN.sportColors[activityType].primary`. Use the existing `.day-indicators` / `.indicator` CSS pattern already in SchedulePage as reference. Add CSS:

```css
.training-day-btn .activity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 2px;
}
```

- [ ] **Step 3: Add card routing based on activity type**

Import all card components from `activity-cards/`. Below the progress bar, replace the static `ExerciseCard` list with a switch on `activityType`. The existing `ExerciseCard` list remains the `'gym'` / `default` case. Non-gym types render their dedicated card component.

Note: `ExerciseCard` is NOT renamed to `GymCard` — it stays as-is for backward compatibility.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TrainingPage.jsx
git commit -m "feat: TrainingPage routes to sport-specific cards per day"
```

---

## Chunk 4: Database & Cleanup

### Task 13: Database Migration and Supabase Mapping


**Files:**
- Create: `supabase/migrations/002_activity_support.sql`
- Modify: `src/hooks/useOnboarding.js`

- [ ] **Step 1: Create migration file**

```sql
-- Add activity support columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS main_activities TEXT[] DEFAULT '{"gym"}',
  ADD COLUMN IF NOT EXISTS addon_activities JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS activity_preference TEXT DEFAULT 'flexible';
```

- [ ] **Step 2: Update `completeOnboarding` in useOnboarding.js**

Add to the `supabaseData` object (around line 107-147):

```js
main_activities: profileData.mainActivities || ['gym'],
addon_activities: JSON.stringify(profileData.addOnActivities || []),
activity_preference: profileData.gymPreference || 'flexible',
```

- [ ] **Step 3: Remove old `SPORTS_LABELS` constant**

Delete `SPORTS_LABELS` (lines 247-260) and any references to it. The old `generatePersonalizedSchedule` function that uses it is already unused — leave it for now but remove `SPORTS_LABELS`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/002_activity_support.sql src/hooks/useOnboarding.js
git commit -m "feat: add activity support DB migration and Supabase mapping"
```

---

### Task 14: Manual Smoke Test & Final Commit


- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Smoke test the full flow**

1. Open the app, trigger onboarding (clear `vida_onboarding_complete` from localStorage if needed)
2. Go through onboarding — verify:
   - Activity selection step shows 4 main activities as colored cards
   - Multi-select works
   - Add-ons step shows Running and Yoga with frequency pickers
   - Skip button works
   - Time preference step shows 4 options including Afternoon
3. Complete onboarding — verify schedule generates with mixed activities
4. Go to Training page — verify:
   - Day selector shows colored dots per activity type
   - Gym days show existing exercise cards
   - Non-gym days show the correct sport-specific card
   - Cards are functional (inputs, checkboxes, timers work)
5. Check backward compat: existing users with old `vida_workout_plan` (gym-only) should still see gym cards

- [ ] **Step 3: Fix any issues found during smoke test**

- [ ] **Step 4: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: address smoke test issues for multi-activity support"
```
