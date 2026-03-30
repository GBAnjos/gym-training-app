# Bug Fixes, Custom Builders & File Import — Design Spec

**Date:** 2026-03-30
**Status:** Approved

## Overview

Four sequential epics that fix exercise display bugs, add custom workout/diet builders, and enable AI-generated plan import via paste or file upload.

---

## Epic 1: Bug Fixes & Plan Preview

### 1.1 — Exercise Images Missing

**Problem:** Exercises like `incline_dumbbell_press`, `barbell_shoulder_press`, `bent_arm_barbell_pullover`, `decline_push_up` show no image.

**Root cause:** `exerciseMediaService.js` relies on name-based fuzzy matching to map exercises to GitHub image folders. Many exercises from the bundle don't have mapping entries.

**Fix:**
- Build an ID-based lookup: exercise `id` → bundle entry → `gifUrl` field (which already contains the correct GitHub folder URL)
- In `exerciseMediaService.js`, add a function `getExerciseImageById(id)` that resolves directly from the exercise bundle
- Update `ExerciseMedia` and `ExerciseMediaCompact` components to prefer ID-based lookup before falling back to name-based matching
- This covers all 512 exercises in the bundle automatically

### 1.2 — Underscore Names

**Problem:** Exercise names display with underscores (e.g., `incline_dumbbell_press`).

**Root cause:** `advancedPlanGenerator.js` sometimes stores the raw exercise `id` in `nome` when the bundle name lookup fails.

**Fix:**
- Generator: ensure `nome` always resolves to the proper English name from the bundle's `name` field
- Display safety net: add a `formatExerciseName()` utility that converts `some_name` → `Some Name` as a last resort
- Apply this in TrainingPage, SmartPlanPage preview, and ExerciseCard

### 1.3 — Plan Preview with Swap/Remove

**Already partially built** in SmartPlanPage (`PlanPreview` component, `handleSwapExercise`, `handleRemoveExercise`).

**Verify & fix:**
- Ensure preview screen shows all training days in tabs
- Each exercise shows: image, name, sets × reps, RPE
- Swap button: generates an alternative exercise targeting the same muscle group/movement pattern
- Remove button: removes the exercise from that day
- "Activate Plan" button only appears on the preview screen (not auto-activated)

---

## Epic 2: Custom Workout Builder

### Entry Point
- "Create My Own" card on Programs page (prominent position, top of program list)

### Data Model
Uses the same `vida_workout_plan` localStorage structure with `source: 'custom'` flag.

```javascript
{
  name: string,
  source: 'custom',
  trainingDays: ['Seg', 'Qua', 'Sex'],
  dayActivities: {
    'Seg': {
      type: 'gym',
      session: { label: '1', name: 'Chest + Triceps', focus: '...', icon: 'dumbbell' },
      exercises: [
        { id, nome, series, reps, restSeconds, musculos }
      ]
    }
  },
  createdAt: ISO8601
}
```

### UX Flow
1. **Plan basics** — Name the plan, tap weekdays to select training days
2. **Build each day** — For each day:
   - Name the session (freeform text, e.g., "Chest + Triceps")
   - Add exercises from exercise library (search by name, filter by muscle/equipment)
   - Per exercise: input sets, reps, rest time (optional)
   - Reorder exercises (up/down buttons)
   - Remove exercises (X button)
3. **Preview** — Full plan view across all days
4. **Save & Activate** — Saves to `vida_workout_plan`, navigates to Training tab

### Key Decisions
- No split logic, progression model, or RPE — user controls everything
- Exercise search reuses existing `exerciseService.js` search/filter logic
- Exercises store same shape as generated plans for TrainingPage compatibility
- No science metadata (targetRpe, progressionType, etc.) — just raw sets × reps

---

## Epic 3: Custom Diet Builder

### Entry Point
- "Create My Diet" button on Meals page

### Data Model
New localStorage key `vida_custom_diet`:

```javascript
{
  name: string,
  source: 'custom',
  meals: [
    {
      id: string,           // uuid
      name: string,         // "Breakfast", "Lunch", custom
      time: '07:00',        // optional display time
      foods: [
        {
          id: string,       // uuid
          name: string,     // "Chicken breast"
          calories: number,
          protein: number,
          carbs: number,
          fat: number,
          quantity: string,  // "200g", "1 cup", freeform
        }
      ]
    }
  ],
  dailyTargets: {
    calories: number | null,
    protein: number | null,
    carbs: number | null,
    fat: number | null
  },
  createdAt: ISO8601
}
```

### UX Flow
1. **Set daily targets** (optional) — Calories, protein, carbs, fat inputs. Can skip.
2. **Add meals** — Starts with templates (Breakfast, Lunch, Dinner, Snacks). User can rename, add, remove meals.
3. **Add foods per meal** — Type food name + calories + macros. Simple form, one food at a time.
4. **Save** — Persists to `vida_custom_diet`

### Meals Page Updates
- If custom diet exists, show as daily view: meals with foods, macros per meal
- Daily total bar at top (calories consumed vs target)
- Check-off foods as eaten (extends existing `meals_completed_YYYY-MM-DD` pattern)
- Edit button to modify meals/foods anytime

### Key Decisions
- No food database — user types everything manually (future enhancement)
- Daily targets optional
- Bilingual labels (pt-BR / en)

---

## Epic 4: File Import (Training + Diet)

### Entry Points
- Programs page: "Import Training" button
- Meals page: "Import Diet" button
- Both open an import flow with the type pre-selected

### UX Flow
1. **Input method** — Two tabs: "Paste Text" (textarea) | "Upload File" (.txt, .md, .pdf, .csv)
2. **Parse** — Client-side parser extracts structured data
3. **Preview** — Shows parsed result in builder format. Yellow highlights on items parser is unsure about.
4. **Edit** — User can fix, rename, adjust, remove, add items
5. **Import & Activate** — Saves to `vida_workout_plan` or `vida_custom_diet`

### Parser Design

Two parsers: `parseTrainingText(text)` and `parseDietText(text)`

**Training parser** recognizes:
- Day headers: `## Day 1`, `**Monday**`, `### Push Day`, `Día 1:`, numbered days
- Exercise lines: `- Bench Press: 4x12`, `1. Squat — 3 sets x 8 reps`, table rows
- Markdown tables: Exercise | Sets | Reps | Rest
- Bullet lists, numbered lists, plain text with delimiters

**Diet parser** recognizes:
- Meal headers: `## Breakfast`, `**Meal 1**`, `### Lunch`
- Food lines: `- Chicken breast 200g (180 cal, 38P/0C/2F)`, `Rice: 150g — 195 kcal`
- Markdown tables: Food | Quantity | Calories | Protein | Carbs | Fat
- Daily totals: `Total: 2200 kcal`, `Daily target: 180g protein`

**Parser strategy:**
1. Detect format (markdown table vs bullet list vs plain text)
2. Split into sections by day/meal headers
3. Extract items per section via regex
4. For training: fuzzy-match exercise names against 512-exercise bundle → auto-link IDs, images, muscle data
5. Unmatched exercises kept as plain text (user can edit)
6. Return structured data + confidence scores per item

**File handling:**
- `.txt`, `.md` — read as plain text
- `.csv` — parse columns
- `.pdf` — extract text via lightweight JS lib (pdf.js), then run same parser

### Key Decisions
- All parsing is client-side (no API calls)
- AI-agnostic: handles ChatGPT, Claude, Gemini, etc. output formats
- Bilingual parsing: handles English and Portuguese patterns
- Paid feature flag: `vida_premium` in localStorage (always `true` for now)
- Confidence UI: yellow highlights on uncertain items

---

## Implementation Order

1. **Epic 1** — Bug fixes (images, names, plan preview) — quick wins
2. **Epic 2** — Custom Workout Builder — establishes the training data model pattern
3. **Epic 3** — Custom Diet Builder — establishes the diet data model
4. **Epic 4** — File Import — targets the data models from Epics 2 & 3

## Future Enhancements (Not in Scope)
- Food database search (Epic 3 evolution → option C)
- AI-powered parsing via Claude API (Epic 4 evolution → option C)
- Cloud sync of custom plans/diets via Supabase
- Sharing plans between users
