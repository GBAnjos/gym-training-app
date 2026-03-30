# Bug Fixes, Custom Builders & File Import — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix exercise image/name bugs, enhance the workout builder, add a diet builder, and enable AI-generated plan import via paste or file upload.

**Architecture:** Four sequential epics. Epic 1 fixes display bugs in the exercise media pipeline and verifies the SmartPlan preview. Epic 2 enhances the existing WorkoutBuilderPage with per-day naming, rest time, and images. Epic 3 adds a new diet builder with macro tracking. Epic 4 adds a flexible text/file import parser for training and diet plans.

**Tech Stack:** React (functional components + hooks), localStorage, CSS, regex parsers, existing exerciseBundle.json (512 exercises)

**Spec:** `docs/superpowers/specs/2026-03-30-bugfixes-builders-import-design.md`

---

## Chunk 1: Epic 1 — Bug Fixes & Plan Preview

### Task 1: Fix exercise image resolution by ID

**Root cause analysis:** `exerciseMediaService.js` builds a `bundleMap` (line 15-28) that indexes exercises by `ex.id`, `ex.name.toLowerCase()`, and `folder.toLowerCase()`. The `findExerciseFolder()` function runs `normalizeExerciseName()` which strips numbers and accents before looking up in `bundleMap`. When `ExerciseMedia` receives `exerciseName` that contains underscores (e.g., an old plan where `nome` was set to the raw exercise ID like `"incline_dumbbell_press"`), the lookup chain fails because `normalizeExerciseName` does not convert underscores to spaces, so `"incline_dumbbell_press"` only matches `bundleMap[ex.id]` — which IS indexed. However, exercises from stale localStorage plans or other bundles (yoga, pilates, etc. which have NO `gifUrl`) show no images. The fix: add an `exerciseId` prop to media components so they can do a direct ID-based lookup from the already-imported `exerciseBundle`, bypassing name normalization entirely.

**Files:**
- Modify: `src/services/exerciseMediaService.js:166-175` (add getExerciseImageById)
- Modify: `src/components/ExerciseMedia.jsx:15-19` (ExerciseMedia props)
- Modify: `src/components/ExerciseMedia.jsx:160-194` (ExerciseMediaCompact props)
- Modify: `src/pages/SmartPlanPage.jsx:470` (pass exerciseId)
- Modify: `src/pages/TrainingPage.jsx:501-503` (pass exerciseId)

- [ ] **Step 1: Add getExerciseImageById function**

In `src/services/exerciseMediaService.js`, add a new exported function after `getExerciseImages` (after line 175). This uses the already-imported `exerciseBundle` (line 9) — no new imports needed:

```javascript
/**
 * Get exercise images by exercise ID (direct lookup, no normalization).
 * Most reliable method — bypasses name matching entirely.
 * @param {string} exerciseId - The exercise ID (e.g., "incline_dumbbell_press")
 * @returns {Object|null} { startImage, endImage } or null
 */
export function getExerciseImageById(exerciseId) {
  if (!exerciseId) return null;
  const folder = bundleMap[exerciseId];
  if (!folder) return null;
  return {
    startImage: `${BASE_URL}/${folder}/0.jpg`,
    endImage: `${BASE_URL}/${folder}/1.jpg`,
  };
}
```

Also add it to the default export object at line ~267:
```javascript
export default {
  getExerciseImages,
  getExerciseImageById,
  // ... rest unchanged
};
```

- [ ] **Step 2: Update ExerciseMedia to accept exerciseId prop**

In `src/components/ExerciseMedia.jsx`:

Update the import (line 2-7) to include `getExerciseImageById`:
```javascript
import {
  getExerciseImages,
  getExerciseImageById,
  hasExerciseImages,
  categorizeExercise,
  getCategoryIcon
} from '../services/exerciseMediaService';
```

Update `ExerciseMedia` component (line 15) to accept `exerciseId`:
```javascript
export function ExerciseMedia({ exerciseName, exerciseId, size = 'medium', className = '' }) {
```

Replace line 28 (`const images = getExerciseImages(exerciseName);`) with:
```javascript
const images = (exerciseId && getExerciseImageById(exerciseId)) || getExerciseImages(exerciseName);
```

Update `ExerciseMediaCompact` component (line 160) to accept `exerciseId`:
```javascript
export function ExerciseMediaCompact({ exerciseName, exerciseId, className = '' }) {
```

Replace line 164 (`const images = getExerciseImages(exerciseName);`) with:
```javascript
const images = (exerciseId && getExerciseImageById(exerciseId)) || getExerciseImages(exerciseName);
```

- [ ] **Step 3: Pass exerciseId in SmartPlanPage PlanPreview**

In `src/pages/SmartPlanPage.jsx`, line 470, change:
```jsx
<ExerciseMediaCompact exerciseName={ex.nome || ex.id} />
```
to:
```jsx
<ExerciseMediaCompact exerciseName={ex.nome || ex.id} exerciseId={ex.id} />
```

- [ ] **Step 4: Pass exerciseId in TrainingPage**

In `src/pages/TrainingPage.jsx`, line 501-503, change:
```jsx
<ExerciseMedia
  exerciseName={exercise.nome}
  size="small"
/>
```
to:
```jsx
<ExerciseMedia
  exerciseName={exercise.nome}
  exerciseId={exercise.id}
  size="small"
/>
```

- [ ] **Step 5: Verify images load for previously broken exercises**

Run: `npm run dev`
Test: Navigate to SmartPlan, generate a plan, verify that exercises like incline dumbbell press, barbell shoulder press, decline push up all show images. Also check TrainingPage after activating a plan.

- [ ] **Step 6: Commit**

```bash
git add src/services/exerciseMediaService.js src/components/ExerciseMedia.jsx src/pages/SmartPlanPage.jsx src/pages/TrainingPage.jsx
git commit -m "fix: resolve exercise images by ID for all bundled exercises"
```

---

### Task 2: Fix underscore names in exercise display

**Files:**
- Create: `src/utils/formatExerciseName.js`
- Modify: `src/pages/TrainingPage.jsx`
- Modify: `src/pages/SmartPlanPage.jsx`

- [ ] **Step 1: Create formatExerciseName utility**

Create `src/utils/formatExerciseName.js`:

```javascript
/**
 * Safety net: convert underscore IDs to readable names.
 * "incline_dumbbell_press" → "Incline Dumbbell Press"
 */
export function formatExerciseName(name) {
  if (!name || typeof name !== 'string') return name;
  // If no underscores, return as-is
  if (!name.includes('_')) return name;
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
```

- [ ] **Step 2: Apply in TrainingPage (replace existing inline conversion)**

In `src/pages/TrainingPage.jsx`, there is already an inline underscore conversion at ~line 489-493:
```javascript
const rawName = getExerciseName(exercise.id, language) || exercise.nome || exercise.id;
const exerciseName = rawName.includes('_')
  ? rawName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  : rawName;
```

**Replace** this with the shared utility:
```javascript
import { formatExerciseName } from '../utils/formatExerciseName';
// ...
const exerciseName = formatExerciseName(getExerciseName(exercise.id, language) || exercise.nome || exercise.id);
```

- [ ] **Step 3: Apply in SmartPlanPage PlanPreview (replace existing formatName)**

In `src/pages/SmartPlanPage.jsx`, PlanPreview already has a local `formatName` function at ~lines 436-441 doing the same underscore conversion. **Replace** it with the imported utility:

```javascript
import { formatExerciseName } from '../utils/formatExerciseName';
// ...
// DELETE the local formatName function
// Use formatExerciseName(ex.nome) wherever formatName was used
```

- [ ] **Step 4: Verify no underscore names appear**

Run: `npm run dev`
Test: Generate a SmartPlan, check all exercise names are properly formatted. Activate the plan, check TrainingPage.

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatExerciseName.js src/pages/TrainingPage.jsx src/pages/SmartPlanPage.jsx
git commit -m "fix: format underscore exercise names to readable titles"
```

---

### Task 3: Verify and fix SmartPlan preview with swap/remove

**Files:**
- Modify: `src/pages/SmartPlanPage.jsx:104-146` (handlers)
- Modify: `src/pages/SmartPlanPage.jsx:425-502` (PlanPreview)

- [ ] **Step 1: Read and verify PlanPreview renders correctly**

Read `src/pages/SmartPlanPage.jsx` fully. Verify:
- PlanPreview shows day tabs from `plan.trainingDays`
- Each exercise shows image (ExerciseMediaCompact), name, sets × reps, RPE
- Swap button calls `handleSwapExercise`
- Remove button calls `handleRemoveExercise`
- "Activate Plan" button is present and calls `handleActivate`

- [ ] **Step 2: Fix any issues found in the preview**

Common issues to check:
- Is the plan auto-activated on generation? If so, change flow: generate → show preview → user clicks activate
- Does `handleSwapExercise` correctly call `getAlternativeExercise` from advancedPlanGenerator?
- Does the remove handler update the plan state properly?
- Are the swap/remove buttons accessible (not hidden behind overflow)?

- [ ] **Step 3: Test the full flow end-to-end**

Run: `npm run dev`
Test flow:
1. Open Smart Plan
2. Complete all 6 steps
3. See plan preview with all days
4. Tap swap on an exercise → verify it changes to an alternative
5. Tap remove on an exercise → verify it's removed
6. Tap "Activate Plan" → verify it saves and navigates to Training

- [ ] **Step 4: Commit if changes were needed**

```bash
git add src/pages/SmartPlanPage.jsx
git commit -m "fix: ensure SmartPlan preview with swap/remove works correctly"
```

---

### Task 4: Build and push Epic 1

- [ ] **Step 1: Run build**

```bash
npm run build
```

Verify no errors.

- [ ] **Step 2: Push**

```bash
git push
```

---

## Chunk 2: Epic 2 — Enhance Workout Builder

### Task 5: Add per-day session naming to WorkoutBuilderPage

**Files:**
- Modify: `src/pages/WorkoutBuilderPage.jsx:117-149` (handleSave)
- Modify: `src/pages/WorkoutBuilderPage.jsx:220-248` (exercise list section)
- Modify: `src/hooks/useLanguage.jsx` (add translation keys)

- [ ] **Step 1: Add dayNames state**

In `src/pages/WorkoutBuilderPage.jsx`, add state for per-day session names after line 27:

```javascript
const [dayNames, setDayNames] = useState({});
```

- [ ] **Step 2: Add session name input per day**

After the day tabs section (~line 217) and before the exercise list (~line 220), add a name input for the active day:

```jsx
{activeDay && (
  <input
    className="builder-day-name-input"
    type="text"
    placeholder={t('builder_day_name_placeholder')}
    value={dayNames[activeDay] || ''}
    onChange={e => setDayNames(prev => ({ ...prev, [activeDay]: e.target.value }))}
  />
)}
```

- [ ] **Step 3: Use per-day name in handleSave**

In `handleSave` (~line 121-123), update session name to use per-day name:

```javascript
session: {
  label: String(selectedDays.indexOf(day) + 1),
  name: dayNames[day] || workoutName || (language === 'pt-BR' ? 'Treino Personalizado' : 'Custom Workout'),
  focus: 'custom',
  icon: 'pencil-1',
},
```

- [ ] **Step 4: Add translation keys**

In `src/hooks/useLanguage.jsx`, add to pt-BR section (after existing builder_ keys):
```javascript
builder_day_name_placeholder: 'Nome da sessão (ex: Peito + Tríceps)',
builder_rest: 'Descanso',
builder_rest_placeholder: '60s',
```

Add to en section:
```javascript
builder_day_name_placeholder: 'Session name (e.g., Chest + Triceps)',
builder_rest: 'Rest',
builder_rest_placeholder: '60s',
```

- [ ] **Step 5: Add CSS for day name input**

In `src/pages/WorkoutBuilderPage.css`, add after `.builder-day-tab` styles:

```css
.builder-day-name-input {
  width: 100%;
  padding: 10px 14px;
  margin: 0 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  color: var(--text);
  font-size: 14px;
  outline: none;
}
.builder-day-name-input:focus {
  border-color: var(--primary);
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/WorkoutBuilderPage.jsx src/pages/WorkoutBuilderPage.css src/hooks/useLanguage.jsx
git commit -m "feat: add per-day session naming to workout builder"
```

---

### Task 6: Add rest time input to builder exercise cards

**Files:**
- Modify: `src/pages/WorkoutBuilderPage.jsx:46-63` (addExercise)
- Modify: `src/pages/WorkoutBuilderPage.jsx:277-321` (BuilderExerciseCard)
- Modify: `src/pages/WorkoutBuilderPage.jsx:116-134` (handleSave)
- Modify: `src/pages/WorkoutBuilderPage.css`

- [ ] **Step 1: Add rest field to exercise shape**

In `addExercise` (~line 54), add `rest: 60` to the default:

```javascript
return {
  ...prev,
  [activeDay]: [...dayExercises, {
    id: exercise.id,
    name: exercise.name,
    bodyPart: exercise.bodyPart,
    sets: 3,
    reps: '12',
    rest: 60,
  }],
};
```

- [ ] **Step 2: Add rest input to BuilderExerciseCard**

In `BuilderExerciseCard` (~line 298), after the reps input group, add:

```jsx
<div className="builder-input-group builder-input-rest">
  <label>{t('builder_rest')}</label>
  <input
    type="number"
    min="0"
    max="300"
    value={exercise.rest || 60}
    onChange={e => onUpdate('rest', parseInt(e.target.value) || 60)}
  />
  <span className="builder-input-unit">s</span>
</div>
```

- [ ] **Step 3: Save restSeconds in handleSave**

In `handleSave` (~line 127-133), add `restSeconds`:

```javascript
exercises: (days[day] || []).map(e => ({
  id: e.id,
  nome: e.name,
  series: e.sets,
  reps: e.reps,
  restSeconds: e.rest || 60,
  musculos: [e.bodyPart].filter(Boolean),
})),
```

- [ ] **Step 4: Add CSS for rest input**

In `src/pages/WorkoutBuilderPage.css`, add:

```css
.builder-input-rest {
  position: relative;
}
.builder-input-unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 12px;
  pointer-events: none;
}
.builder-input-rest input {
  padding-right: 24px;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/WorkoutBuilderPage.jsx src/pages/WorkoutBuilderPage.css
git commit -m "feat: add rest time input to workout builder exercise cards"
```

---

### Task 7: Add exercise images to builder cards

**Files:**
- Modify: `src/pages/WorkoutBuilderPage.jsx:277-321` (BuilderExerciseCard)
- Modify: `src/pages/WorkoutBuilderPage.jsx:379-399` (ExercisePickerView items)
- Modify: `src/pages/WorkoutBuilderPage.css`

- [ ] **Step 1: Import ExerciseMediaCompact**

At top of `src/pages/WorkoutBuilderPage.jsx`:

```javascript
import { ExerciseMediaCompact } from '../components/ExerciseMedia';
```

- [ ] **Step 2: Add image to BuilderExerciseCard**

In `BuilderExerciseCard` (~line 278-321), the existing `.builder-exercise-header` div (line 280) contains the exercise name and action buttons. Insert the thumbnail **as the first child** inside this div, before the existing `<span className="builder-exercise-name">`. Keep all existing action buttons (move up/down, delete) intact:

```jsx
<div className="builder-exercise-header">
  <ExerciseMediaCompact exerciseName={exercise.name} exerciseId={exercise.id} className="builder-exercise-thumb" />
  <span className="builder-exercise-name">{exercise.name}</span>
  <div className="builder-exercise-actions">
    {/* KEEP existing onMoveUp, onMoveDown, onDelete buttons unchanged */}
  </div>
</div>
```

- [ ] **Step 3: Add image to ExercisePickerView items**

In `ExercisePickerView` (~line 380-406), inside each `.builder-pick-item` button, add the thumbnail **before** the existing `.builder-pick-info` div:

```jsx
<button key={exercise.id} className={`builder-pick-item ${alreadyAdded ? 'disabled' : ''}`} ...>
  <ExerciseMediaCompact exerciseName={exercise.name} exerciseId={exercise.id} className="builder-pick-thumb" />
  <div className="builder-pick-info">
    {/* KEEP existing name and meta spans unchanged */}
  </div>
  {/* KEEP existing checkmark/plus icon unchanged */}
</button>
```

- [ ] **Step 4: Add CSS for thumbnails**

```css
.builder-exercise-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  flex-shrink: 0;
}
.builder-pick-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  margin-right: 10px;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/WorkoutBuilderPage.jsx src/pages/WorkoutBuilderPage.css
git commit -m "feat: add exercise images to workout builder cards and picker"
```

---

### Task 8: Add "Create My Own" and "Import" cards to Programs page

**Files:**
- Modify: `src/pages/ProgramsPage.jsx`
- Modify: `src/pages/ProgramsPage.css`
- Modify: `src/hooks/useLanguage.jsx`

- [ ] **Step 1: Add translation keys**

In `src/hooks/useLanguage.jsx`, add to both pt-BR and en:

pt-BR:
```javascript
programs_create_own: 'Montar Meu Treino',
programs_create_own_desc: 'Crie seu treino do zero',
programs_import: 'Importar Treino',
programs_import_desc: 'Cole ou envie um treino gerado por IA',
```

en:
```javascript
programs_create_own: 'Create My Own',
programs_create_own_desc: 'Build your workout from scratch',
programs_import: 'Import Training',
programs_import_desc: 'Paste or upload an AI-generated workout',
```

- [ ] **Step 2: Add "Create My Own" card to ProgramsPage**

In `src/pages/ProgramsPage.jsx`, programs are rendered inline (not in a separate component). The program list starts at line 118 with the `{filtered.length > 0 ? (` conditional. `ProgramsPage` already receives `onTabChange` as a prop (line 16).

Add the action card **before** line 118 (after the level filter section, before the program cards):

```jsx
{/* Action Cards */}
<div className="programs-action-cards">
  <button className="programs-action-card" onClick={() => onTabChange?.('build-plan')}>
    <Icon name="pencil-1" className="programs-action-icon" />
    <div>
      <h3>{t('programs_create_own')}</h3>
      <p>{t('programs_create_own_desc')}</p>
    </div>
  </button>
</div>
```

**Note:** Do NOT add the "Import Training" button here yet — the import route (`import-training`) is not wired until Epic 4. It will be added in Task 17.

- [ ] **Step 3: (No action needed)**

`ProgramsPage` already receives `onTabChange` as a prop at line 16. No threading needed.

- [ ] **Step 4: Add CSS**

```css
.programs-action-cards {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding: 0 16px;
}
.programs-action-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
}
.programs-action-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}
.programs-action-card p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 2px 0 0;
}
.programs-action-icon {
  font-size: 22px;
  color: var(--primary);
  flex-shrink: 0;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProgramsPage.jsx src/pages/ProgramsPage.css src/hooks/useLanguage.jsx
git commit -m "feat: add Create My Own and Import Training cards to Programs page"
```

---

### Task 9: Build and push Epic 2

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Push**

```bash
git push
```

---

## Chunk 3: Epic 3 — Custom Diet Builder

### Task 10: Create DietBuilderPage component

**Files:**
- Create: `src/pages/DietBuilderPage.jsx`
- Create: `src/pages/DietBuilderPage.css`
- Modify: `src/hooks/useLanguage.jsx` (diet builder keys)

- [ ] **Step 1: Add translation keys**

In `src/hooks/useLanguage.jsx`, add to pt-BR:
```javascript
diet_builder_title: 'Criar Minha Dieta',
diet_builder_name_placeholder: 'Nome da dieta (ex: Cutting 2026)',
diet_builder_targets: 'Metas Diárias',
diet_builder_targets_skip: 'Pular — não quero contar macros',
diet_builder_calories: 'Calorias',
diet_builder_protein: 'Proteína (g)',
diet_builder_carbs: 'Carboidratos (g)',
diet_builder_fat: 'Gordura (g)',
diet_builder_meals: 'Refeições',
diet_builder_add_meal: 'Adicionar Refeição',
diet_builder_meal_name: 'Nome da refeição',
diet_builder_add_food: 'Adicionar alimento',
diet_builder_food_name: 'Nome do alimento',
diet_builder_food_qty: 'Quantidade',
diet_builder_food_cal: 'Cal',
diet_builder_food_protein: 'P',
diet_builder_food_carbs: 'C',
diet_builder_food_fat: 'G',
diet_builder_save: 'Salvar Dieta',
diet_builder_meal_breakfast: 'Café da manhã',
diet_builder_meal_lunch: 'Almoço',
diet_builder_meal_snack: 'Lanche',
diet_builder_meal_dinner: 'Jantar',
diet_builder_delete_meal: 'Remover refeição',
diet_builder_delete_food: 'Remover alimento',
```

Add to en:
```javascript
diet_builder_title: 'Create My Diet',
diet_builder_name_placeholder: 'Diet name (e.g., Cutting 2026)',
diet_builder_targets: 'Daily Targets',
diet_builder_targets_skip: 'Skip — I don\'t want to count macros',
diet_builder_calories: 'Calories',
diet_builder_protein: 'Protein (g)',
diet_builder_carbs: 'Carbs (g)',
diet_builder_fat: 'Fat (g)',
diet_builder_meals: 'Meals',
diet_builder_add_meal: 'Add Meal',
diet_builder_meal_name: 'Meal name',
diet_builder_add_food: 'Add food',
diet_builder_food_name: 'Food name',
diet_builder_food_qty: 'Qty',
diet_builder_food_cal: 'Cal',
diet_builder_food_protein: 'P',
diet_builder_food_carbs: 'C',
diet_builder_food_fat: 'F',
diet_builder_save: 'Save Diet',
diet_builder_meal_breakfast: 'Breakfast',
diet_builder_meal_lunch: 'Lunch',
diet_builder_meal_snack: 'Snack',
diet_builder_meal_dinner: 'Dinner',
diet_builder_delete_meal: 'Remove meal',
diet_builder_delete_food: 'Remove food',
```

- [ ] **Step 2: Create DietBuilderPage.jsx**

Create `src/pages/DietBuilderPage.jsx` with:
- State: `name`, `dailyTargets` (calories/protein/carbs/fat, all nullable), `meals` array
- Default meals: Breakfast, Lunch, Snack, Dinner (using translation keys)
- Each meal: `{ id: crypto.randomUUID(), name, time, foods: [] }`
- Each food: `{ id: crypto.randomUUID(), name, calories, protein, carbs, fat, quantity }`
- UX: name input → targets section (with skip button) → meals list → per-meal food list → save button
- Save to `localStorage.setItem('vida_custom_diet', JSON.stringify(...))`
- Props: `onBack`, `onComplete`

The component structure:
```jsx
export function DietBuilderPage({ onBack, onComplete }) {
  // State for name, targets, meals
  // handleAddMeal, handleRemoveMeal, handleRenameMeal
  // handleAddFood, handleRemoveFood, handleUpdateFood
  // handleSave → persist to vida_custom_diet → onComplete()

  return (
    <div className="diet-builder-page">
      {/* Header with back button */}
      {/* Diet name input */}
      {/* Daily targets section (collapsible, skippable) */}
      {/* Meals list — each meal is a card with foods inside */}
      {/* Add meal button */}
      {/* Save button (fixed bottom bar) */}
    </div>
  );
}
```

- [ ] **Step 3: Create DietBuilderPage.css**

Style classes following existing builder patterns:
- `.diet-builder-page`, `.diet-builder-header`, `.diet-builder-name-input`
- `.diet-targets-section`, `.diet-targets-grid`, `.diet-targets-input`
- `.diet-meal-card`, `.diet-meal-header`, `.diet-meal-foods`
- `.diet-food-row`, `.diet-food-inputs`
- `.diet-add-meal-btn`, `.diet-add-food-btn`
- `.diet-save-bar`

- [ ] **Step 4: Commit**

```bash
git add src/pages/DietBuilderPage.jsx src/pages/DietBuilderPage.css src/hooks/useLanguage.jsx
git commit -m "feat: create DietBuilderPage with meals and macro tracking"
```

---

### Task 11: Wire DietBuilderPage into app navigation

**Files:**
- Modify: `src/App.jsx:55-80` (renderPage switch)
- Modify: `src/pages/MealsPage.jsx`
- Modify: `src/hooks/useLanguage.jsx`

- [ ] **Step 1: Add route and wire onTabChange in App.jsx**

In `src/App.jsx`, add case in `renderPage()`:

```javascript
case 'diet-builder':
  return <DietBuilderPage onBack={() => setActiveTab('meals')} onComplete={() => setActiveTab('meals')} />;
```

Add import at top:
```javascript
import { DietBuilderPage } from './pages/DietBuilderPage';
```

**CRITICAL:** Also update the existing MealsPage route (line 59-60) to pass `onTabChange`:
```javascript
case 'meals':
  return <MealsPage onTabChange={setActiveTab} />;
```

Currently (line 60) it renders `<MealsPage />` with **no props at all**. Without this change, the "Create My Diet" and "Import Diet" buttons will silently do nothing.

- [ ] **Step 2: Update MealsPage to accept onTabChange prop**

In `src/pages/MealsPage.jsx`, update the component signature to accept the prop:
```javascript
export function MealsPage({ onTabChange }) {
```

Then add a button near the top of the page (after the header) that navigates to the diet builder:

```jsx
<button className="meals-create-diet-btn" onClick={() => onTabChange?.('diet-builder')}>
  <Icon name="plus-circle" />
  <span>{t('meals_create_diet')}</span>
</button>
```

Add translation keys:
```javascript
// pt-BR
meals_create_diet: 'Criar Minha Dieta',
meals_import_diet: 'Importar Dieta',
meals_edit_diet: 'Editar Dieta',
meals_my_diet: 'Minha Dieta',

// en
meals_create_diet: 'Create My Diet',
meals_import_diet: 'Import Diet',
meals_edit_diet: 'Edit Diet',
meals_my_diet: 'My Diet',
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/pages/MealsPage.jsx src/hooks/useLanguage.jsx
git commit -m "feat: wire DietBuilderPage into app navigation and MealsPage"
```

---

### Task 12: Update MealsPage to display custom diet

**Files:**
- Modify: `src/pages/MealsPage.jsx`
- Modify: `src/pages/MealsPage.css`

- [ ] **Step 1: Load custom diet from localStorage**

At the top of MealsPage component, add:

```javascript
const customDiet = useMemo(() => {
  try {
    const raw = localStorage.getItem('vida_custom_diet');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}, []);
```

- [ ] **Step 2: Add custom diet view**

If `customDiet` exists, render a different view:
- Diet name at top
- Daily progress bar (sum of checked foods' calories vs target)
- Each meal as a card with foods inside
- Each food has a checkbox (check-off tracking)
- Macro totals per meal and daily total
- "Edit" button to go back to diet builder
- Toggle to switch between custom diet and static meals

Storage for check-offs: `diet_completed_YYYY-MM-DD` → `{ [mealId]: [foodId, ...] }`

- [ ] **Step 3: Add CSS for custom diet view**

```css
.meals-diet-header { ... }
.meals-diet-progress { ... }
.meals-diet-meal-card { ... }
.meals-diet-food-row { ... }
.meals-diet-food-check { ... }
.meals-diet-macros { ... }
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/MealsPage.jsx src/pages/MealsPage.css
git commit -m "feat: display custom diet with food check-off tracking in MealsPage"
```

---

### Task 13: Build and push Epic 3

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Push**

```bash
git push
```

---

## Chunk 4: Epic 4 — File Import

### Task 14: Create training text parser

**Files:**
- Create: `src/utils/importParser.js`

- [ ] **Step 1: Create parseTrainingText function**

Create `src/utils/importParser.js` with `parseTrainingText(text)`:

```javascript
/**
 * Parse AI-generated training plan text into structured data.
 * Handles markdown tables, bullet lists, numbered lists from any AI.
 *
 * @param {string} text - Raw text from paste or file
 * @returns {{ days: Array<{ name: string, exercises: Array<{ name, sets, reps, rest?, confidence }> }>, errors: string[] }}
 */
export function parseTrainingText(text) {
  // 1. Detect format
  // 2. Split by day headers (## Day 1, **Monday**, ### Push, Segunda, etc.)
  // 3. Per section: extract exercises
  //    - Table row: | Exercise | Sets | Reps | Rest |
  //    - Bullet: - Bench Press: 4x12
  //    - Numbered: 1. Squat — 3 sets x 8 reps
  //    - Plain: Bench Press 4x12
  // 4. Return structured data with confidence per item
}
```

Key regex patterns:
- Day headers: `/^#{1,3}\s+(?:day|dia|monday|tuesday|segunda|terça|push|pull|leg|upper|lower|full)/im`
- Sets×reps: `/(\d+)\s*[x×]\s*(\d+(?:\s*[-–]\s*\d+)?)/i`
- Table row: `/\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\d+(?:\s*[-–]\s*\d+)?)\s*\|/`

- [ ] **Step 2: Add exercise matching against bundle**

Import exercise bundle and add fuzzy matching:

```javascript
import { getBundleExercises } from '../services/exerciseService';

function matchExerciseToBundle(name) {
  const exercises = getBundleExercises();
  const normalized = name.toLowerCase().trim();

  // Exact match
  const exact = exercises.find(ex => ex.name.toLowerCase() === normalized || ex.id === normalized.replace(/\s+/g, '_'));
  if (exact) return { exercise: exact, confidence: 'high' };

  // Token overlap
  const tokens = normalized.split(/\s+/);
  let bestMatch = null, bestScore = 0;
  for (const ex of exercises) {
    const exTokens = ex.name.toLowerCase().split(/\s+/);
    const overlap = tokens.filter(t => exTokens.includes(t)).length / Math.max(tokens.length, exTokens.length);
    if (overlap > bestScore) { bestScore = overlap; bestMatch = ex; }
  }

  if (bestScore >= 0.7) return { exercise: bestMatch, confidence: 'high' };
  if (bestScore >= 0.5) return { exercise: bestMatch, confidence: 'medium' };
  return { exercise: null, confidence: 'low' };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/importParser.js
git commit -m "feat: add training text parser with exercise matching"
```

---

### Task 15: Create diet text parser

**Files:**
- Modify: `src/utils/importParser.js`

- [ ] **Step 1: Add parseDietText function**

```javascript
/**
 * Parse AI-generated diet plan text into structured data.
 *
 * @param {string} text
 * @returns {{ meals: Array<{ name, foods: Array<{ name, quantity?, calories?, protein?, carbs?, fat?, confidence }> }>, dailyTargets?: { calories?, protein?, carbs?, fat? }, errors: string[] }}
 */
export function parseDietText(text) {
  // 1. Detect format
  // 2. Split by meal headers (## Breakfast, **Meal 1**, Café da manhã, etc.)
  // 3. Per section: extract foods
  //    - Table row: | Food | Qty | Cal | P | C | F |
  //    - Bullet: - Chicken breast 200g (180 cal, 38P/0C/2F)
  //    - Plain: Rice 150g — 195 kcal
  // 4. Extract daily targets if present
  // 5. Return structured data with confidence
}
```

Key regex patterns:
- Meal headers: `/^#{1,3}\s+(?:breakfast|lunch|dinner|snack|meal|café|almoço|jantar|lanche|refeição)/im`
- Macros inline: `/(\d+)\s*(?:cal|kcal).*?(\d+)\s*[pg].*?(\d+)\s*[cg].*?(\d+)\s*[fg]/i`
- Macro shorthand: `/(\d+)P\s*\/?\s*(\d+)C\s*\/?\s*(\d+)[FG]/i`
- Daily target: `/(?:total|daily|target|meta).*?(\d{3,4})\s*(?:cal|kcal)/i`

- [ ] **Step 2: Commit**

```bash
git add src/utils/importParser.js
git commit -m "feat: add diet text parser with macro extraction"
```

---

### Task 16: Create ImportPage component

**Files:**
- Create: `src/pages/ImportPage.jsx`
- Create: `src/pages/ImportPage.css`
- Modify: `src/hooks/useLanguage.jsx`

- [ ] **Step 1: Add translation keys**

In `src/hooks/useLanguage.jsx`, add to both pt-BR and en:

pt-BR:
```javascript
import_title_training: 'Importar Treino',
import_title_diet: 'Importar Dieta',
import_tab_paste: 'Colar Texto',
import_tab_upload: 'Enviar Arquivo',
import_paste_placeholder: 'Cole aqui o treino gerado por IA...',
import_paste_placeholder_diet: 'Cole aqui a dieta gerada por IA...',
import_upload_hint: 'Aceita .txt, .md, .csv (máx 500KB)',
import_upload_btn: 'Escolher Arquivo',
import_parse_btn: 'Analisar',
import_parsing: 'Analisando...',
import_preview_title: 'Pré-visualização',
import_confidence_low: 'Não reconhecido — edite manualmente',
import_confidence_medium: 'Verifique este item',
import_activate_btn: 'Importar e Ativar',
import_error_too_large: 'Texto muito grande (máximo 50.000 caracteres)',
import_error_file_too_large: 'Arquivo muito grande (máximo 500KB)',
import_error_no_data: 'Não foi possível extrair dados do texto',
import_error_format: 'Formato de arquivo não suportado',
```

en:
```javascript
import_title_training: 'Import Training',
import_title_diet: 'Import Diet',
import_tab_paste: 'Paste Text',
import_tab_upload: 'Upload File',
import_paste_placeholder: 'Paste your AI-generated workout here...',
import_paste_placeholder_diet: 'Paste your AI-generated diet here...',
import_upload_hint: 'Accepts .txt, .md, .csv (max 500KB)',
import_upload_btn: 'Choose File',
import_parse_btn: 'Analyze',
import_parsing: 'Analyzing...',
import_preview_title: 'Preview',
import_confidence_low: 'Not recognized — edit manually',
import_confidence_medium: 'Please verify this item',
import_activate_btn: 'Import & Activate',
import_error_too_large: 'Text too large (max 50,000 characters)',
import_error_file_too_large: 'File too large (max 500KB)',
import_error_no_data: 'Could not extract data from text',
import_error_format: 'Unsupported file format',
```

- [ ] **Step 2: Create ImportPage.jsx**

Create `src/pages/ImportPage.jsx`:

```jsx
export function ImportPage({ type = 'training', onBack, onComplete }) {
  // type: 'training' | 'diet'
  // State: inputMethod ('paste'|'upload'), text, parsedResult, error
  //
  // Flow:
  // 1. Show paste textarea or file upload input
  // 2. On "Analyze" → call parseTrainingText or parseDietText
  // 3. Show preview with confidence indicators
  // 4. Allow inline editing of parsed items
  // 5. On "Import & Activate" → save to vida_workout_plan or vida_custom_diet
  //
  // Input validation:
  // - Paste: max 50,000 chars
  // - File: max 500KB, only .txt/.md/.csv
  //
  // Preview: reuse builder-style cards with colored confidence indicators
  // - high: normal
  // - medium: amber/yellow left border
  // - low: red left border with edit prompt
}
```

- [ ] **Step 3: Create ImportPage.css**

Style the import page:
- `.import-page`, `.import-header`
- `.import-tabs`, `.import-tab`
- `.import-textarea`
- `.import-upload-zone` (drag & drop area)
- `.import-preview`, `.import-preview-day`, `.import-preview-item`
- `.import-confidence-high`, `.import-confidence-medium`, `.import-confidence-low`
- `.import-actions`

- [ ] **Step 4: Commit**

```bash
git add src/pages/ImportPage.jsx src/pages/ImportPage.css src/hooks/useLanguage.jsx
git commit -m "feat: create ImportPage with paste/upload and preview flow"
```

---

### Task 17: Wire ImportPage into app navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/ProgramsPage.jsx` (add Import Training button — deferred from Task 8)
- Modify: `src/pages/MealsPage.jsx` (add Import Diet button)

- [ ] **Step 1: Add routes in App.jsx**

```javascript
case 'import-training':
  return <ImportPage type="training" onBack={() => setActiveTab('programs')} onComplete={() => setActiveTab('training')} />;
case 'import-diet':
  return <ImportPage type="diet" onBack={() => setActiveTab('meals')} onComplete={() => setActiveTab('meals')} />;
```

Add import:
```javascript
import { ImportPage } from './pages/ImportPage';
```

- [ ] **Step 2: Add "Import Training" button to ProgramsPage**

Now that the `import-training` route exists, add the import card to `src/pages/ProgramsPage.jsx`. In the `.programs-action-cards` div (added in Task 8), add the import button next to the "Create My Own" button:

```jsx
<button className="programs-action-card" onClick={() => onTabChange?.('import-training')}>
  <Icon name="upload-1" className="programs-action-icon" />
  <div>
    <h3>{t('programs_import')}</h3>
    <p>{t('programs_import_desc')}</p>
  </div>
</button>
```

- [ ] **Step 3: Add "Import Diet" button to MealsPage**

In `src/pages/MealsPage.jsx`, next to the "Create My Diet" button, add:

```jsx
<button className="meals-import-diet-btn" onClick={() => onTabChange?.('import-diet')}>
  <Icon name="upload-1" />
  <span>{t('meals_import_diet')}</span>
</button>
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/pages/ProgramsPage.jsx src/pages/MealsPage.jsx
git commit -m "feat: wire ImportPage into app navigation for training and diet"
```

---

### Task 18: Add premium feature flag

**Files:**
- Modify: `src/pages/ImportPage.jsx`

- [ ] **Step 1: Add premium check**

At the top of ImportPage:

```javascript
const isPremium = () => {
  try { return localStorage.getItem('vida_premium') !== 'false'; }
  catch { return true; }
};
```

For now this always returns true (no premium gate active). The check is in place for future monetization.

- [ ] **Step 2: Commit**

```bash
git add src/pages/ImportPage.jsx
git commit -m "feat: add premium feature flag for import (free for now)"
```

---

### Task 19: Build and push Epic 4

- [ ] **Step 1: Run build**

```bash
npm run build
```

Fix any errors.

- [ ] **Step 2: Push**

```bash
git push
```

---

## Final: Integration Testing Checklist

After all epics are implemented, manually test:

- [ ] SmartPlan: all exercises show images (no blanks)
- [ ] SmartPlan: no underscore names visible
- [ ] SmartPlan: preview shows all days, swap works, remove works
- [ ] SmartPlan: "Activate" saves correctly, Training page works
- [ ] Workout Builder: per-day session names save correctly
- [ ] Workout Builder: rest time shows and saves
- [ ] Workout Builder: exercise images visible in cards and picker
- [ ] Programs page: "Create My Own" and "Import Training" cards visible
- [ ] Diet Builder: can create diet with meals and foods
- [ ] Diet Builder: daily targets work (and skipping works)
- [ ] Meals page: custom diet displays correctly
- [ ] Meals page: food check-off tracking works
- [ ] Import Training: paste text → parse → preview → import works
- [ ] Import Diet: paste text → parse → preview → import works
- [ ] Import: file upload (.txt) works
- [ ] Import: input limits enforced (50K chars, 500KB file)
- [ ] All pages work in both pt-BR and en
