# Epic 3: Expanded Sports & Activities — Design Spec

## Overview

Extend Vida beyond gym-only training to support multiple activity types. Sports coexist as **add-ons alongside the main training activity** — the gym foundation stays solid while users layer in extra activities like running and yoga.

Each activity type gets a **crafted, sport-specific UI** (not generic cards with optional fields). The training page adapts per day based on what's scheduled.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sports coexistence model | Add-ons alongside main activity | Keeps gym foundation, layers extras naturally |
| Card design per sport | Distinct tracking UI per type | Feels crafted, not generic |
| Onboarding placement | Replace `gymPreference` step with "Activity Selection" | Clean replacement, no extra steps |
| Add-on scheduling | Frequency-based auto-placement | Matches how gym split works, keeps onboarding fast |
| Main activities | Multi-select (Gym, CrossFit, Calisthenics, Pilates) | Users may do more than one |
| Add-on activities | Running, Yoga (optional, skippable) | Most common complements to gym |
| Coming soon items | Not shown in UI | Don't advertise unbuilt features |
| Legacy sports system | Replace `SPORTS_LABELS` in useOnboarding.js | New activity model supersedes it entirely |

## Sport Color System

Sport colors are used **only on training cards, day selector dots, and onboarding activity grids**. They do NOT replace the existing `blockTypeColors` in `design.js` which are used for schedule timeline blocks. The two systems coexist in different contexts.

| Sport | Color | Hex | Context |
|-------|-------|-----|---------|
| Gym | Lime | `#c8f55a` | Matches existing `DESIGN.palette.accent` |
| CrossFit | Coral Red | `#ff6b6b` | Training cards only (schedule uses this for social/flex) |
| Calisthenics | Sky Blue | `#6bcfff` | Training cards only (schedule uses this for food/office) |
| Pilates | Lavender | `#c899ff` | Training cards only (schedule uses this for free time) |
| Running | Gold | `#ffc832` | Unique — no collision |
| Yoga | Mint Green | `#82dcb4` | Unique — no collision |

Note: Gym uses `#c8f55a` (existing accent) not `#d9ff00`, to stay consistent with the app's primary accent color.

## 1. Onboarding Changes

Replace the current `gymPreference` step (STEPS index 6, "Step 5" in code comments) with a 3-part "Activity Selection" step. The STEPS array changes from:

```js
// Before
['welcome', 'language', 'wakeTime', 'sleepHours', 'lunchTime', 'dinnerTime', 'gymPreference', 'officeDays', 'goals', 'physicalData', 'generating']

// After
['welcome', 'language', 'wakeTime', 'sleepHours', 'lunchTime', 'dinnerTime', 'activitySelect', 'activityAddons', 'activityTime', 'officeDays', 'goals', 'physicalData', 'generating']
```

### `activitySelect` — "How do you train?"

- Multi-select grid of main activities: **Gym, CrossFit, Calisthenics, Pilates**
- Each shown as a card with icon and sport-colored border
- At least one must be selected to proceed
- Selection determines which training splits and exercise catalogs are used

### `activityAddons` — "Do you also do any of these?"

- Optional add-on activities: **Running, Yoga**
- Same card grid style
- Prominent **"Skip" button** at the bottom to bypass entirely (no add-ons)
- If an add-on is selected, show an inline frequency picker: 1x, 2x, or 3x per week
- Deselecting an add-on resets its frequency to 0
- Skipping or selecting none = empty `addOnActivities` array, proceed to next step

### `activityTime` — "When do you prefer to train?"

- Options: **Morning, Afternoon, Evening, Flexible**
- Applies to all selected activities
- Stored as `gymPreference` field for backward compatibility (value: `'morning'`, `'afternoon'`, `'evening'`, or `'flexible'`)

### Validation & Navigation

- Navigating back from `activityAddons` to `activitySelect` preserves main activity selections
- Navigating back from `activityTime` to `activityAddons` preserves add-on selections and frequencies
- Network failure during generation: show error toast, allow retry

### Profile Data Changes

New fields saved to profile and localStorage:

```js
{
  // Existing fields unchanged
  mainActivities: ['gym', 'crossfit'],     // multi-select from activitySelect
  addOnActivities: [                        // from activityAddons (empty array if skipped)
    { type: 'running', frequency: 2 },
    { type: 'yoga', frequency: 1 }
  ],
  gymPreference: 'morning'                  // from activityTime (now includes 'afternoon')
}
```

### i18n Keys

New translation keys needed:

```js
// activitySelect step
'onboarding_activity_title': { 'pt-BR': 'Como você treina?', 'en': 'How do you train?' },
'onboarding_activity_subtitle': { 'pt-BR': 'Selecione todas que pratica', 'en': 'Select all that apply' },
'activity_gym': { 'pt-BR': 'Academia', 'en': 'Gym' },
'activity_crossfit': { 'pt-BR': 'CrossFit', 'en': 'CrossFit' },
'activity_calisthenics': { 'pt-BR': 'Calistenia', 'en': 'Calisthenics' },
'activity_pilates': { 'pt-BR': 'Pilates', 'en': 'Pilates' },

// activityAddons step
'onboarding_addons_title': { 'pt-BR': 'Pratica mais alguma?', 'en': 'Do you also do any of these?' },
'onboarding_addons_skip': { 'pt-BR': 'Pular', 'en': 'Skip' },
'activity_running': { 'pt-BR': 'Corrida', 'en': 'Running' },
'activity_yoga': { 'pt-BR': 'Yoga', 'en': 'Yoga' },
'frequency_label': { 'pt-BR': 'vezes/semana', 'en': 'times/week' },

// activityTime step
'onboarding_time_title': { 'pt-BR': 'Quando prefere treinar?', 'en': 'When do you prefer to train?' },
'time_morning': { 'pt-BR': 'Manhã', 'en': 'Morning' },
'time_afternoon': { 'pt-BR': 'Tarde', 'en': 'Afternoon' },
'time_evening': { 'pt-BR': 'Noite', 'en': 'Evening' },
'time_flexible': { 'pt-BR': 'Flexível', 'en': 'Flexible' },
```

## 2. Schedule Generation

Enhance `generateScheduleFromProfile()` to distribute all activities across the week.

### Training Day Calculation Algorithm

**Step 1: Determine total main training days based on goals (same as today)**
- `muscle_gain` → 5 days
- `weight_loss` → 4 days
- General/other → 3 days

**Step 2: Distribute main activity days**
- **Single main activity**: All training days go to that activity (same as today for Gym)
- **Two main activities**: Split proportionally. Example: Gym + CrossFit with 5 days → Gym 3x + CrossFit 2x, alternating
- **Three main activities**: Round-robin. Example: 5 days → A 2x, B 2x, C 1x
- **Four main activities**: Round-robin with 1-2 days each. Example: 5 days → A 2x, B 1x, C 1x, D 1x
- Distribution order: activities are assigned days in the order selected during onboarding (first selected = most days)

**Step 3: Place add-on activities**
- Add-ons go on days NOT already assigned to main activities
- If not enough free days, add-ons stack as secondary (lower intensity) sessions on main activity days — shown as a separate block in the schedule, not replacing the main
- Running avoids being placed on leg-heavy gym days (Legs/Lower)
- Yoga can go on any day (it's recovery-friendly)
- Max 6 active days per week (at least 1 rest day always)

**Step 4: Overflow handling**
- If main days (5) + add-on frequency (3) > 6, reduce add-on frequency to fit
- Priority: main activities > add-ons. Add-ons are trimmed first.

### Split Assignment Per Main Activity

Each main activity type uses its own split logic:

- **Gym**: PPL (5d), Upper/Lower (4d), or Full Body (3d) — same as today
- **CrossFit**: Rotates WOD types (AMRAP → EMOM → For Time → Strength → Hero)
- **Calisthenics**: Skill-focused rotation (Push skills → Pull skills → Legs/Core → Static holds)
- **Pilates**: Flow rotation (Core Flow → Full Body → Lower Body → Flexibility)

### Workout Plan Storage

The `vida_workout_plan` adds `dayActivities` alongside existing fields. The existing `split` and `trainingDays` fields are kept for backward compatibility — `buildTrainingMap()` in TrainingPage checks `dayActivities` first, falls back to `split`.

```js
{
  // Existing fields (kept for backward compatibility)
  splitType: 'PPL',
  trainingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  split: [...],  // kept for old TrainingPage code fallback
  goals: [...],
  generatedAt: '...',

  // New fields
  mainActivities: ['gym'],
  addOnActivities: [
    { type: 'running', frequency: 2 },
    { type: 'yoga', frequency: 1 }
  ],
  dayActivities: {
    'Seg': { type: 'gym', split: { label: 'A', name: 'Push', focus: { 'pt-BR': '...', 'en': '...' } } },
    'Ter': { type: 'running', session: { name: { 'pt-BR': 'Corrida Leve', 'en': 'Easy Run' }, distance: '5K', zone: 2 } },
    'Qua': { type: 'gym', split: { label: 'B', name: 'Pull', focus: { 'pt-BR': '...', 'en': '...' } } },
    'Qui': { type: 'yoga', session: { name: { 'pt-BR': 'Vinyasa Flow', 'en': 'Vinyasa Flow' }, duration: 60, focus: 'strength' } },
    'Sex': { type: 'gym', split: { label: 'C', name: 'Legs', focus: { 'pt-BR': '...', 'en': '...' } } },
    'Sáb': { type: 'running', session: { name: { 'pt-BR': 'Corrida Longa', 'en': 'Long Run' }, distance: '10K', zone: 2 } },
  }
}
```

### Migration for Existing Users

If `dayActivities` is absent in `vida_workout_plan`, TrainingPage falls back to the existing `split` array path. No migration needed — old plans work as-is, new onboardings produce the new format.

## 3. Training Page Architecture

The Training tab becomes the unified "Activity" page. Same shell, different card internals per day.

### Shared Shell (unchanged)

- Day selector (shows only active training days)
- Progress bar (completed / total for the day)
- Completion tracking and haptic feedback

### Day Selector Enhancement

Each day button shows a small colored dot matching the activity type for that day (lime for gym, gold for running, etc.). This gives an at-a-glance view of the week's variety.

### Card Routing Logic

```js
// In TrainingPage.jsx
const dayActivity = dayActivities?.[selectedDay];
const activityType = dayActivity?.type || 'gym'; // fallback for old plans

switch (activityType) {
  case 'gym': return <GymExerciseList ... />;        // existing ExerciseCard list
  case 'crossfit': return <CrossFitCard ... />;
  case 'calisthenics': return <CalisthenicsCard ... />;
  case 'pilates': return <PilatesCard ... />;
  case 'running': return <RunCard ... />;
  case 'yoga': return <YogaCard ... />;
}
```

### Activity Card Components

Each activity type renders its own card component.

#### GymCard (exists today — rename from ExerciseCard)
- Exercise name, sets x reps, muscle tags
- Weight input (kg), rest timer, completion checkbox
- Storage key: `${treino_day}_${exerciseId}` (e.g., `segunda_supino_reto`) — unchanged

#### CrossFitCard (new)
- WOD name and type badge (AMRAP / EMOM / For Time)
- Movement checklist with reps
- Round counter, WOD timer with time cap
- Score input (rounds+reps or total time)
- Storage key: `crossfit_${dayAbbrev}_${date}` (e.g., `crossfit_Seg_2026-03-19`)

#### CalisthenicsCard (new)
- Exercise name with progression level badge (LVL 1-5)
- Visual progression path (Tuck → Adv. Tuck → **Straddle** → Full)
- Hold time input, sets counter
- Storage key: `calisthenics_${dayAbbrev}_${exerciseId}` (e.g., `calisthenics_Seg_front_lever`)

#### PilatesCard (new)
- Flow name with duration badge
- Movement sequence list (ordered)
- Duration tracker, focus area tag
- Storage key: `pilates_${dayAbbrev}_${date}` (e.g., `pilates_Qua_2026-03-19`)

#### RunCard (new)
- Run type with distance badge (Easy 5K, Long 10K, Intervals)
- Distance input, pace display, heart rate zone indicator
- Storage key: `run_${dayAbbrev}_${date}` (e.g., `run_Ter_2026-03-19`)

#### YogaCard (new)
- Style name with duration badge (Vinyasa 60min)
- Pose sequence, focus area tag
- Duration tracker
- Storage key: `yoga_${dayAbbrev}_${date}` (e.g., `yoga_Qui_2026-03-19`)

## 4. Data Architecture

### Polymorphic Activity Model

All activities share a base interface, extended per type:

```
Base: { id, name (i18n), type, completed, date }

Gym extends Base:      + { series, reps, weight, musculos[], restTime }
CrossFit extends Base: + { wodType, timeCap, rounds, movements[], score }
Calisthenics extends:  + { progressionLevel, holdTime, sets, difficulty, nextProgression }
Pilates extends Base:  + { flowName, duration, movements[], equipment, focus }
Running extends Base:  + { runType, distance, pace, zone, elevation }
Yoga extends Base:     + { style, duration, poses[], focusArea, breathwork }
```

### Exercise Catalogs

New data files per activity type:

- `src/data/treinos.js` — Gym exercises (exists, keep as-is)
- `src/data/crossfit.js` — WODs, movements, benchmarks
- `src/data/calisthenics.js` — Progressions, skills, holds
- `src/data/pilates.js` — Flows, movements, sequences
- `src/data/running.js` — Run types, training plans, zones
- `src/data/yoga.js` — Styles, pose sequences, flows

Each catalog follows the same pattern: exportable workout data with bilingual labels (pt-BR/en).

### Design Tokens

Add `sportColors` to `src/data/design.js` inside the `DESIGN` object:

```js
sportColors: {
  gym: { primary: '#c8f55a', bg: 'rgba(200,245,90,0.1)', border: 'rgba(200,245,90,0.2)' },
  crossfit: { primary: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)' },
  calisthenics: { primary: '#6bcfff', bg: 'rgba(107,207,255,0.1)', border: 'rgba(107,207,255,0.2)' },
  pilates: { primary: '#c899ff', bg: 'rgba(200,153,255,0.1)', border: 'rgba(200,153,255,0.2)' },
  running: { primary: '#ffc832', bg: 'rgba(255,200,50,0.1)', border: 'rgba(255,200,50,0.2)' },
  yoga: { primary: '#82dcb4', bg: 'rgba(130,220,180,0.1)', border: 'rgba(130,220,180,0.2)' },
}
```

## 5. Database Schema

New migration file `supabase/migrations/002_activity_support.sql`:

```sql
ALTER TABLE user_profiles
  ADD COLUMN main_activities TEXT[] DEFAULT '{"gym"}',
  ADD COLUMN addon_activities JSONB DEFAULT '[]',
  ADD COLUMN activity_preference TEXT DEFAULT 'flexible';
```

Supabase data mapping in `useOnboarding.js` `completeOnboarding`:

```js
// Add to supabaseData object:
main_activities: profileData.mainActivities || ['gym'],
addon_activities: JSON.stringify(profileData.addOnActivities || []),
activity_preference: profileData.gymPreference || 'flexible',
```

## 6. Files to Create/Modify

### New Files
- `src/data/crossfit.js` — CrossFit WODs and movements
- `src/data/calisthenics.js` — Calisthenics progressions
- `src/data/pilates.js` — Pilates flows and movements
- `src/data/running.js` — Running plans and zones
- `src/data/yoga.js` — Yoga styles and poses
- `src/components/activity-cards/CrossFitCard.jsx`
- `src/components/activity-cards/CalisthenicsCard.jsx`
- `src/components/activity-cards/PilatesCard.jsx`
- `src/components/activity-cards/RunCard.jsx`
- `src/components/activity-cards/YogaCard.jsx`
- `src/components/activity-cards/ActivityCard.css` — shared card styles + per-type overrides
- `supabase/migrations/002_activity_support.sql`

### Modified Files
- `src/components/OnboardingFlow.jsx` — Replace `gymPreference` step with `activitySelect`/`activityAddons`/`activityTime`
- `src/pages/TrainingPage.jsx` — Load `dayActivities`, route to correct card component, add colored dots to day selector
- `src/data/design.js` — Add `sportColors` to DESIGN object
- `src/data/treinos.js` — Export activity type constants
- `src/hooks/useOnboarding.js` — Remove old `SPORTS_LABELS`, add activity fields to `completeOnboarding` Supabase mapping
- `src/hooks/useLanguage.jsx` — Add new i18n keys

## 7. Scope Boundaries

### In Scope
- 4 main activities: Gym, CrossFit, Calisthenics, Pilates
- 2 add-on activities: Running, Yoga
- Onboarding activity selection (3 sub-steps)
- Sport-specific training cards (6 types)
- Schedule generation distributing all activities
- Sport color system and design tokens
- Exercise catalogs for each activity type
- Database schema for activities
- Backward compatibility with existing gym-only workout plans

### Out of Scope
- "Coming soon" labels or grayed-out sports
- Wearable integration for running (Epic 4)
- Social/sharing features
- Sport-specific progress charts (use existing generic progress)
- Multi-sport progress comparison
- Custom workout builder
