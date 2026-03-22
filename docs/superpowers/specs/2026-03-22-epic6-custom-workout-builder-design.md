# Epic 6: Custom Workout Builder + Exercise Library — Design Spec

## Overview

Replace the app's static 36-exercise dataset with a full exercise library powered by ExerciseDB (~1,300 exercises with animated GIFs), and add a custom workout builder that lets users create their own routines while keeping auto-generated plans as the default. Two phases: Phase 1 (Exercise Library + Data Layer), Phase 2 (Workout Builder + Plan Integration).

**Reference app**: Hevy — inline editing, smart defaults, animated exercise illustrations.

---

## Section 1: Data Architecture

### Normalized Exercise Shape

Every exercise in the system — bundled, fetched, or legacy — conforms to this shape:

```js
{
  id: "0001",                    // ExerciseDB string ID
  name: "Barbell Bench Press",
  bodyPart: "chest",            // Primary body part
  target: "pectorals",          // Primary target muscle
  secondaryMuscles: ["triceps", "anterior deltoids"],
  equipment: "barbell",
  gifUrl: "https://...gif",
  level: "intermediate",        // beginner | intermediate | advanced
  instructions: ["Step 1...", "Step 2..."]
}
```

The `level` field enables filtering by difficulty and powers smart defaults (beginner users see simpler exercises first).

### Exercise Service — 3-Tier Resolution

`exerciseService.js` provides a unified API for all exercise lookups:

```
getById(id):
  1. Check bundled JSON (synchronous — ~200 known IDs, fast path)
  2. Check IndexedDB (async — full catalog, if prefetched)
  3. Fetch single exercise from API (last resort, 3s timeout)
  4. Return degraded object on failure

search(query, filters):
  1. Search bundle (synchronous, immediate results)
  2. Merge with IndexedDB results (async, deduplicated by ID)
  — Never hits API for list queries (too slow)
```

**Bundle-first for known IDs**: The ~200 bundled exercise IDs are a known set. For `getById`, the bundle is checked synchronously first. IndexedDB is only hit for IDs outside that set. For `search`, bundle results render immediately, then IndexedDB results merge in asynchronously. This avoids unnecessary async lookups for the common case.

### Degraded Exercise Object

When all tiers fail, return a degraded object so the UI never crashes:

```js
{
  id: originalId,
  name: originalId,    // Best-effort: use stored name if available
  bodyPart: "unknown",
  gifUrl: null,        // Triggers placeholder icon in UI
  _degraded: true      // Flag for UI to show fallback styling
}
```

Including `bodyPart` (even as "unknown") ensures filter/group logic doesn't break on degraded objects.

### Legacy ID Compatibility

`exerciseIdMap.js` maps current internal IDs (e.g., `"supino_reto"`) to ExerciseDB IDs (e.g., `"0025"`):

```js
export const exerciseIdMap = {
  supino_reto: "0025",
  agachamento_livre: "0032",
  // ... all 36 current exercises
};
```

**Unknown mapping strategy**: If a legacy ID has no mapping entry, the exercise service returns the exercise data from the existing `treinos.js` dataset (current behavior) wrapped in the normalized shape. This ensures no regression — unmapped exercises continue working exactly as before.

### Bundled Exercise Subset

`src/data/exerciseBundle.json` — ~200 exercises curated by goal coverage:

| Goal | Focus | ~Count |
|------|-------|--------|
| Hypertrophy | Compound + isolation per muscle group | ~80 |
| Strength | Big lifts + accessories | ~50 |
| General fitness | Full-body + functional | ~40 |
| Bodyweight / home | No-equipment variants | ~30 |

Ships with the app. Loads synchronously. Covers auto-generated plan needs and common library searches.

### Workout Exercise Shape

When an exercise is placed inside a workout (custom or auto-generated), it uses this shape — distinct from the library exercise shape above:

```js
{
  exerciseId: "0001",           // References the library exercise by ExerciseDB ID
  name: "Barbell Bench Press",  // Denormalized for offline display
  sets: 4,                      // Number (not string)
  reps: 10,                     // Number — single value, not a range
  restSeconds: 90,              // Number
  musculos: ["Peito"],          // Portuguese keys — matches existing muscleColors
  gifUrl: "https://...gif",     // Denormalized for offline display
  notes: "",                    // User notes (replaces legacy `obs`)
  _userModified: {              // Tracks which values the user changed vs smart defaults
    sets: false,
    reps: false,
    rest: false
  }
}
```

**Key decisions:**
- **`reps` is a single number**, not a range string. The existing `treinos.js` uses range strings like `"8-12"`, but the builder stepper needs a numeric value for `+/-1` operations. ExerciseCard will handle both formats: if `reps` is a number, display as-is; if a string (legacy), display as-is.
- **`musculos` uses Portuguese keys** to match the existing `muscleColors` lookup in `design.js`. A `bodyPartToMusculos` mapping translates ExerciseDB English values (`"chest"` → `["Peito"]`, `"back"` → `["Costas"]`, etc.) when creating workout exercises from library exercises.
- **`_userModified`** persists with the workout (saved to plan object). This enables the "Reset" link on user-modified values and the muted/primary visual distinction across sessions.
- **`sets`/`reps`/`restSeconds` are numbers** in workout exercises. The time estimate formula uses them directly: `totalTime = Σ(sets × (45 + restSeconds))`.

This shape maps directly to `ExerciseCard` props: `exerciseId` → `id`, `sets` → `series`, `reps` → `reps`, `musculos` → `musculos`. A thin adapter in TrainingPage handles the field name mapping.

### Muscle Name Mapping

`bodyPartToMusculos.js` bridges ExerciseDB English values to the existing Portuguese `muscleColors` keys:

```js
export const bodyPartToMusculos = {
  chest: ["Peito"],
  back: ["Costas", "Trapézio"],
  shoulders: ["Ombros"],
  "upper arms": ["Bíceps", "Tríceps"],
  "lower arms": ["Bíceps"],              // Falls back to nearest match
  "upper legs": ["Quadríceps", "Posterior", "Glúteos"],
  "lower legs": ["Panturrilhas"],
  waist: ["Peito"],                       // Core — falls back to nearest match
  cardio: [],                             // No muscle tag (gray fallback OK)
  neck: ["Trapézio"],                     // Nearest match
};
```

**Key constraint**: Every value in this mapping MUST be a valid key in `muscleColors` from `design.js`. The valid keys are: `"Peito"`, `"Costas"`, `"Ombros"`, `"Bíceps"`, `"Tríceps"`, `"Quadríceps"`, `"Posterior"`, `"Glúteos"`, `"Panturrilhas"`, `"Trapézio"`. Body parts without a clean match (waist, cardio, lower arms) use the nearest existing key or an empty array (gray fallback).

Used when: (1) adding a library exercise to a workout, (2) rendering muscle tags in the library detail sheet, (3) powering the muscle balance signal in the builder.

### Filter-to-Data Mapping

Library filter pills use display labels that map to ExerciseDB `bodyPart` values:

| Filter Label | ExerciseDB `bodyPart` values |
|-------------|------------------------------|
| Chest | `"chest"` |
| Back | `"back"` |
| Shoulders | `"shoulders"` |
| Arms | `"upper arms"`, `"lower arms"` |
| Legs | `"upper legs"`, `"lower legs"` |
| Core | `"waist"` |
| Full Body | No filter (show all) |

Labels are translated via i18n (`useLanguage`). Equipment filter pills map 1:1 to ExerciseDB `equipment` values (barbell, dumbbell, cable, machine, body weight, band).

### Smart Defaults Data Path

The builder reads the user's training goals from `vida_workout_plan.goals` (an array set during onboarding — e.g., `["muscle_gain"]`, `["weight_loss", "muscle_gain"]`). Uses `goals[0]` to select smart defaults. Goal-to-defaults mapping:

| `goals[0]` value | Smart Defaults Row |
|-------------------|-------------------|
| `"muscle_gain"` | Hypertrophy (4×10, 90s) |
| `"strength"` | Strength (5×5, 180s) |
| `"weight_loss"` | General fitness (3×12, 60s) |
| `"general_fitness"` | General fitness (3×12, 60s) |
| absent / unknown | General fitness (3×12, 60s) |

### ExerciseDB API Reference

- **Data source**: [ExerciseDB open-source dataset](https://github.com/yuhonas/free-exercise-db)
- **Bundled locally**: The ~200 exercise subset and full catalog are sourced from the open-source JSON dataset, not from a paid API
- **No API key required**: Data is bundled or fetched from the open-source repository
- **Full catalog**: ~1,300 exercises with GIF URLs hosted on GitHub

### IndexedDB Initialization

The `exerciseDB` IndexedDB database and object store are created lazily on first access — either when the prefetch pipeline runs (after onboarding or first library visit) or when `exerciseService` first attempts an IndexedDB lookup. If the store doesn't exist when read, the service treats it as a cache miss and falls back to the next tier.

### Data Persistence

- **Source of truth**: Supabase (user profiles, workout plans, custom workouts, saved workouts)
- **Write-ahead cache**: localStorage (`vida_workout_plan`) — offline writes sync to Supabase when online
- **Exercise catalog cache**: IndexedDB (`exerciseDB` object store, keyed by exercise ID)
- **Sync mechanism**: Existing `useDataSync` hook handles plan object sync. Custom workouts and saved workouts live inside the plan object (same sync path, no separate key).

---

## Section 2: Exercise Library UI

### Layout

2-column grid of exercise cards. Each card shows:
- Animated GIF (native `<img>`, plays automatically)
- Exercise name
- Target muscle + equipment as subtle tags
- Action button: `[+]` (add to workout) or `[✓ 3×8]` (already added, showing sets×reps)

### Filtering

Two rows of horizontal filter pills, both visible by default (no collapsed state):
- **Row 1**: Muscle groups (Chest, Back, Shoulders, Arms, Legs, Core, Full Body)
- **Row 2**: Equipment (Barbell, Dumbbell, Cable, Machine, Bodyweight, Band)

Filters are AND-combined (selecting "Chest" + "Barbell" shows barbell chest exercises). Session-scoped — reset when leaving the library page.

### Search

Free-text search across name, target muscle, equipment, and body part. Debounced (300ms). Combines with active filters.

### GIF Loading Strategy

- **Default**: Native `<img>` elements with animated GIFs. Subtle motion in the grid helps exercise identification (Hevy does this).
- **Performance optimization**: IntersectionObserver swaps `src` to empty string for cards scrolled out of viewport, restores on re-entry. This caps active GIF animations to visible cards only (~6-8 per viewport).
- **Fallback**: If GIF fails to load, show a muscle-group icon placeholder with exercise name.
- **Future optimization**: If scroll jank is measurable on mid-range devices despite IntersectionObserver, add canvas-based first-frame rendering. Not in initial implementation.

### [+] Button Behavior

- **Phase 1** (no builder yet): `[+]` button is **hidden entirely**. No dead-end prompts. The library is browse-only in Phase 1.
- **Phase 2** (builder exists): `[+]` triggers "Start a workout?" prompt if no workout is in progress, or adds directly to the current builder session.

### Added State

When an exercise is already in the current builder session, the card shows `[✓ 3×8]` instead of `[+]`, displaying the configured sets×reps. Tapping it scrolls to that exercise in the builder tray.

### Detail Bottom Sheet

Tapping a card (not the action button) opens a bottom sheet with:
- Large animated GIF
- Full exercise name, muscle groups, equipment
- Step-by-step instructions
- Level indicator (beginner/intermediate/advanced)
- **Similar exercises**: 3-4 alternatives targeting the same muscle with different equipment
- `[+ Add to workout]` button (Phase 2 only)

### Empty States

Contextual empty states based on what caused zero results:
- **Filter mismatch**: "No exercises match these filters. Try removing [specific filter]."
- **Search no results**: "No exercises found for '[query]'. Try a different search term."
- **Offline + sparse results**: Persistent subtle footer: "Showing offline library" whenever the full ExerciseDB catalog is unavailable, regardless of result count.

### Staleness Indicator

When the IndexedDB cache exists and is older than 7 days, a subtle footer appears: "Last updated X days ago · Refresh". Tapping "Refresh" triggers a manual re-fetch of the full catalog. The 7-day threshold matches the auto-refresh window in Section 5.

---

## Section 3: Workout Builder UI

### Entry Points (Phase 2)

- `[+]` button on exercise cards in library (when builder is active)
- "Create Workout" button in weekly view / settings
- "Edit" button on a custom workout day

### Smart Defaults

When a user adds an exercise, the builder pre-populates sets, reps, and rest based on their onboarding goal:

| Goal | Sets | Reps | Rest |
|------|------|------|------|
| Hypertrophy | 4 | 8-12 | 90s |
| Strength | 5 | 3-5 | 180s |
| General fitness | 3 | 12-15 | 60s |

**Visual distinction**: Smart-defaulted values render in `--color-text-secondary` (muted). Once the user taps a value to change it, it renders in `--color-text-primary` (bright). This communicates "suggested" vs "you chose this" at a glance, without labels or tooltips.

### Inline Editing — Tappable Stepper

Each exercise row shows sets, reps, and rest as tappable values. Tapping opens an inline stepper:
- `[-]` and `[+]` buttons with the current value between them
- Changes apply immediately on each tap (no confirm button needed)
- Step sizes: sets ±1, reps ±1, rest ±15s
- Long-press on `[-]`/`[+]` for fast increment

**Revert affordance**: A small "Reset" link appears next to any user-modified value. Tapping it restores the smart default and returns the value to muted styling.

### Drag Reorder

Exercises in the builder can be reordered via drag handle (grip dots on the left). Order determines exercise sequence in the workout.

### Day Assignment

The builder includes a day selector for assigning the workout to a specific day of the week:
- Shows all 7 days as pills
- Days with existing auto-generated workouts show the split label (e.g., "A: Push")
- Selecting an auto-generated day shows an override warning: "This will replace your auto-generated [Day A: Push] workout. You can revert anytime."
- Days with existing custom workouts show the custom name

### Persistent Bottom Tray

When a builder session is in progress and the user navigates to the library, a floating tray appears at the bottom:
- Shows workout name, exercise count, and estimated time
- "View Workout" button expands back to full builder
- Tray sits above the tab bar with proper z-index layering
- Tray renders over library content, not pushing it up (overlay, not layout shift)

### Time Estimates

Transparent formula based on exercises, sets, and rest periods:
```
totalTime = Σ(exercise.sets × (avgSetDuration + exercise.restSeconds))
```
Where `avgSetDuration` = 45s. Uses numeric `sets` and `restSeconds` from the Workout Exercise Shape. Shown as "~XX min" in the builder header and tray.

### Empty Builder State

When the builder opens with no exercises:
- Encouraging message: "Add your first exercise from the library"
- Direct link/button to open the Exercise Library
- If user has a goal set, suggest: "Based on your [goal] goal, start with compound movements"

### Muscle Balance Signal

A subtle horizontal bar at the top of the builder shows which muscle groups are covered:
- Color-coded segments using existing `muscleColors`
- Helps users spot imbalances (e.g., all push, no pull)
- Non-blocking — informational only, no warnings or gates

---

## Section 4: Plan Integration & Weekly View

### Data Model Extension

Each day in `dayActivities` gains optional custom workout fields:

```js
dayActivities: {
  "Seg": { type: "gym", session: { label: "A", name: "Push" }, custom: false },
  "Qua": {
    type: "gym",
    customWorkout: {
      id: "uuid",
      name: "My Pull Day",
      exercises: [
        // Uses Workout Exercise Shape from Section 1:
        { exerciseId: "0001", name: "Barbell Bench Press", sets: 4, reps: 10,
          restSeconds: 90, musculos: ["Peito"], gifUrl: "https://...",
          notes: "", _userModified: { sets: true, reps: false, rest: false } }
      ],
      createdAt: "2026-03-22T...",
      updatedAt: "2026-03-22T..."
    },
    custom: true
  }
}
```

When `custom: true`, TrainingPage reads from `customWorkout.exercises` instead of looking up `getWorkoutBySplit`.

### TrainingPage Rendering Fork

When a gym day has `custom: true`:
1. Header shows `customWorkout.name` instead of split label
2. Exercise list renders from `customWorkout.exercises` using the same `ExerciseCard` component
3. Progress bar counts custom exercises identically
4. A small "Custom" chip appears next to the workout name

**Key contract**: `ExerciseCard` is data-source-agnostic. It needs `exercise.id`, `series`, `reps`, and `musculos`. Custom workouts store these as `exerciseId`, `sets`, `reps`, `musculos` (see Workout Exercise Shape in Section 1). A thin adapter in TrainingPage maps `exerciseId` → `id` and `sets` → `series` before passing to ExerciseCard. Zero changes to ExerciseCard internals. This contract means any future exercise source (AI-generated, imported, coach-assigned) can feed ExerciseCard through the same adapter.

### Weekly View Day Indicators

| Status | Indicator | Meaning |
|--------|-----------|---------|
| Auto-generated gym | Sport-color dot (existing) | No change |
| Custom workout | Sport-color dot + pencil badge | User built this day |
| In-progress build | Dashed outline on pill | Builder targets this day, not yet saved |
| Non-gym activity | Sport-color dot (existing) | No change |
| Rest / empty | No dot (existing) | No change |

**Pencil badge styling**: `--color-text-secondary` icon on a `--color-background-primary` micro-circle, positioned bottom-right of the sport dot. Neutral color ensures readability against any sport color.

### Copy-on-Assign

When assigning a saved workout to a day, the system copies the workout data into `customWorkout` (not a reference to the saved template). **UI messaging at assignment time**: "Assigned a copy of [Workout Name] to [Day]. Changes here won't affect your saved template." Shown once as an inline toast.

### Revert to Auto Flow

Available from a "..." menu on custom days:

1. User taps "..." → "Revert to auto-generated"
2. Confirmation: "This will replace your custom workout with the auto-generated [Day A: Push]. Your custom workout will be saved in your library."
3. On confirm:
   - **Dedup guard**: Check `savedWorkouts` for existing entry with same `id`. If found, update it. If not, append.
   - Set `custom: false`, restore the original split session
4. The saved workout remains available in the builder for re-assignment

Non-destructive — the user never loses work.

### Saved Workouts

Stored inside the plan sync object (not a separate localStorage key):

```js
// Inside vida_workout_plan
{
  dayActivities: { ... },
  savedWorkouts: [
    { id: "uuid", name: "My Pull Day", exercises: [...], createdAt, updatedAt, lastUsed }
  ]
}
```

This ensures saved workouts sync via the same `useDataSync` path as day assignments — no inconsistency between what survives a localStorage clear vs what's in Supabase.

---

## Section 5: Background Prefetch & Offline Strategy

### Prefetch Pipeline

Triggered after onboarding completes or when the user first opens the Exercise Library:

1. Fetch full ExerciseDB catalog (~1,300 exercises, ~400KB JSON)
2. Store in IndexedDB (`exerciseDB` object store, keyed by exercise ID)
3. Set `exercisedb_last_sync` timestamp in localStorage
4. Re-fetch if timestamp is older than 7 days

Non-blocking fetch. If it fails (offline, API down), the app falls back to the bundle. No error shown to user.

### Offline Indicators

- **Persistent footer** in library: "Showing offline library" whenever the full ExerciseDB catalog is unavailable, regardless of search result count. Prevents confusion when filters return sparse results from the bundle.
- **Staleness footer**: "Last updated X days ago · Refresh" when IndexedDB cache exists but is aging. Tapping "Refresh" triggers manual re-fetch.

### GIF Budget — IntersectionObserver

To prevent performance issues with many animated GIFs:
- IntersectionObserver monitors exercise cards in the library grid
- Cards scrolled out of viewport get `src` swapped to empty string (stops animation/download)
- Cards scrolled back into viewport get `src` restored
- Effective budget: only visible cards (~6-8) animate simultaneously
- Lighter than canvas-based optimization, solves the same problem

---

## Phase Boundaries

### Phase 1: Exercise Library + Data Layer

- `exerciseService.js` (3-tier resolution, IndexedDB, bundle-first)
- `exerciseBundle.json` (curated ~200 exercises)
- `exerciseIdMap.js` (legacy ID → ExerciseDB ID mapping)
- Exercise Library page (search, filter, detail bottom sheet)
- Background prefetch pipeline
- IntersectionObserver GIF management
- Offline/staleness indicators
- **No `[+]` button** — library is browse-only in Phase 1

**Standalone value**: Users can browse 1,300+ exercises with animated GIFs, search, filter, and view details — even before the builder exists.

### Phase 2: Workout Builder + Plan Integration

- Builder UI (add exercises, smart defaults, inline stepper, drag reorder)
- Day assignment with override model (`custom: true`)
- Saved workouts (inside plan sync object)
- Revert-to-auto flow with dedup guard
- Weekly view status indicators (pencil badge, in-progress dashed outline)
- Persistent bottom tray
- Copy-on-assign messaging
- Muscle balance signal
- `[+]` button enabled in library
- Empty builder state guidance

### Migration

Existing auto-generated plans continue working unchanged. The `custom: true` flag is additive — no migration needed.

**Phase 2 launch nudge** (launch checklist item): One-time contextual tooltip on weekly view for existing users: "New: customize any day with your own workout." Not a modal, not an onboarding flow — just one contextual nudge pointing at the entry point.
