# UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 6 UX audit findings — fix training generator, restructure navigation, redesign schedule, polish meals, elevate running, add data management to profile.

**Architecture:** Incremental changes to existing React SPA. No new dependencies. All state via localStorage. Each task is independently deployable.

**Tech Stack:** React 18 (hooks), vanilla CSS, localStorage persistence, LineIcons via Icon component.

**Spec:** `docs/superpowers/specs/2026-03-31-deep-ux-audit.md`

---

## Chunk 1: Core Fixes

### Task 1: Fix Training Generator Time Budgeting

**Files:**
- Modify: `src/utils/advancedPlanGenerator.js` (line 155 and surrounding logic)
- Modify: `src/data/scienceConfig.js` (lines 358-363, improve MINUTES_PER_EXERCISE)

The current time budgeting uses `Math.floor(duration / 5)` which produces 9 exercises for a 45-min session (would actually take 75+ min). Replace with a realistic per-exercise time model.

- [ ] **Step 1: Update MINUTES_PER_EXERCISE in scienceConfig.js**

Replace lines 358-363 with a function that calculates time based on actual sets, reps, and rest:

```javascript
// ─── Duration Constraints ───
// Calculate minutes per exercise based on sets and rest time
export function estimateExerciseMinutes(sets, restSeconds, isCompound) {
  const setDuration = isCompound ? 45 : 30; // seconds per working set
  const transitionTime = 30; // seconds to set up / move between exercises
  const totalSeconds = (sets * (setDuration + restSeconds)) + transitionTime;
  return totalSeconds / 60;
}

// Fallback constants for rough estimation
export const MINUTES_PER_EXERCISE = {
  compound: 10,  // ~4 sets, 45s work + 120s rest + 30s transition
  isolation: 6,  // ~3 sets, 30s work + 60s rest + 30s transition
};
```

- [ ] **Step 2: Replace time budgeting in advancedPlanGenerator.js**

Replace line 155 (`const maxExercises = Math.floor(duration / 5);`) with a time-budget approach. Also import `estimateExerciseMinutes` from scienceConfig.

The key change is in `selectExercisesForSession`: instead of a fixed maxExercises count, track a running time budget and stop when the budget runs out.

```javascript
// How many minutes available for exercises? (subtract 5 min warmup)
const availableMinutes = Math.max(duration - 5, 15);
let timeSpent = 0;
```

Then in the exercise selection loops (lines 202-238), before adding each exercise, estimate its time and check against the budget:

```javascript
// Before each exercise pick, check time budget:
const estMinutes = estimateExerciseMinutes(
  sets,
  isCompound ? goalConfig.compound.rest : goalConfig.isolation.rest,
  isCompound
);
if (timeSpent + estMinutes > availableMinutes) break; // time budget exceeded
// ... add exercise ...
timeSpent += estMinutes;
```

Remove the `maxExercises` variable entirely. Replace all `selectedExercises.length < maxExercises` checks with `timeSpent < availableMinutes`.

- [ ] **Step 3: Verify the math**

For a 45-min session with muscle goal:
- Warmup: 5 min
- Available: 40 min
- Compound (4 sets, 120s rest): estimateExerciseMinutes(4, 120, true) = (4 * (45+120) + 30) / 60 = 11.5 min
- Isolation (3 sets, 75s rest): estimateExerciseMinutes(3, 75, false) = (3 * (30+75) + 30) / 60 = 5.75 min
- 2 compounds (23 min) + 3 isolations (17.25 min) = 40.25 min → 5 exercises ✓
- For 60 min: 55 available → 2 compounds (23) + 5 isolations (28.75) = ~6 exercises ✓

- [ ] **Step 4: Commit**

```bash
git add src/utils/advancedPlanGenerator.js src/data/scienceConfig.js
git commit -m "fix: replace broken time budgeting with per-exercise time estimation"
```

---

### Task 2: Restructure Navigation (5→4 tabs, Profile in BottomNav)

**Files:**
- Modify: `src/components/BottomNav.jsx` (NAV_ITEMS array, lines 8-14)
- Modify: `src/components/BottomNav.css` (may need minor flex adjustments for 4 items)
- Modify: `src/App.jsx` (renderPage switch, remove standalone programs route)
- Modify: `src/pages/TrainingPage.jsx` (add Programs/Dashboard access buttons)
- Modify: `src/pages/TrainingPage.css` (styles for new action buttons)
- Modify: `src/pages/SettingsPage.jsx` (add data management section)
- Modify: `src/pages/SettingsPage.css` (styles for data management)
- Modify: `src/hooks/useLanguage.jsx` (new translation keys)

- [ ] **Step 1: Update BottomNav to 4 tabs**

In `src/components/BottomNav.jsx`, replace NAV_ITEMS with:

```javascript
const NAV_ITEMS = [
  { id: 'schedule', icon: 'calendar-days', labelKey: 'nav_schedule' },
  { id: 'meals', icon: 'knife-fork-1', labelKey: 'nav_meals' },
  { id: 'training', icon: 'dumbbell-1', labelKey: 'nav_training' },
  { id: 'settings', icon: 'user-4', labelKey: 'nav_profile' },
];
```

- [ ] **Step 2: Update App.jsx routing**

In App.jsx:
- Change `case 'programs':` to route through training (keep the route but it goes through TrainingPage now)
- Change `case 'dashboard':` to also route through training
- Remove the separate `programs` case from renderPage — TrainingPage handles it internally
- Keep `programs-from-training`, `smart-plan`, `build-plan`, `import-training` routes as they are (they're sub-pages)
- Keep `settings` route as-is

Key change in renderPage switch — remove `programs` and `dashboard` as standalone routes, change default fallback:

```javascript
case 'settings': return <SettingsPage />;
// Remove these standalone cases:
// case 'programs': ...
// case 'dashboard': ...
```

But we still need programs accessible. In TrainingPage, add navigation buttons.

- [ ] **Step 3: Add action buttons to TrainingPage**

At the bottom of TrainingPage (after the exercise list, before the floating timer), add a section with quick-access buttons when a workout plan exists:

```jsx
{/* Quick Actions */}
<div className="training-actions">
  <button className="training-action-btn" onClick={() => onTabChange?.('programs')}>
    <Icon name="list-3" />
    <span>{t('training_programs')}</span>
  </button>
  <button className="training-action-btn" onClick={() => onTabChange?.('dashboard')}>
    <Icon name="bar-chart-4" />
    <span>{t('training_dashboard')}</span>
  </button>
</div>
```

When no workout plan exists (empty state), the existing "get started" buttons should still navigate to programs/smart-plan.

Re-add the `programs` and `dashboard` routes back to App.jsx renderPage — they're still valid sub-pages, just not in the BottomNav:

```javascript
case 'programs':
  return <ProgramsPage onBack={() => setActiveTab('training')} onComplete={() => setActiveTab('training')} onTabChange={setActiveTab} />;
case 'dashboard':
  return <DashboardPage onTabChange={setActiveTab} />;
```

- [ ] **Step 4: Add training-actions CSS**

In `src/pages/TrainingPage.css`, add:

```css
.training-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  padding-bottom: var(--space-md);
}

.training-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.85rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.training-action-btn:active {
  transform: scale(0.98);
}
```

- [ ] **Step 5: Add data management to SettingsPage**

In SettingsPage.jsx, add a "Data Management" section before the existing "Reset Onboarding" section:

```jsx
{/* Data Management */}
<div className="settings-section">
  <h3 className="settings-section-title">{t('settings_data_management')}</h3>
  <button className="settings-action warning" onClick={handleClearWorkout}>
    <Icon name="dumbbell-1" />
    <span>{t('settings_clear_workout')}</span>
  </button>
  <button className="settings-action warning" onClick={handleClearDiet}>
    <Icon name="knife-fork-1" />
    <span>{t('settings_clear_diet')}</span>
  </button>
  <button className="settings-action danger" onClick={handleClearAll}>
    <Icon name="trash-1" />
    <span>{t('settings_clear_all')}</span>
  </button>
</div>
```

Handler functions:
```javascript
const handleClearWorkout = () => {
  if (window.confirm(language === 'pt-BR' ? 'Apagar plano de treino?' : 'Delete workout plan?')) {
    localStorage.removeItem('vida_workout_plan');
    toast.success(language === 'pt-BR' ? 'Treino apagado' : 'Workout cleared');
  }
};

const handleClearDiet = () => {
  if (window.confirm(language === 'pt-BR' ? 'Apagar dieta?' : 'Delete diet?')) {
    localStorage.removeItem('vida_custom_diet');
    toast.success(language === 'pt-BR' ? 'Dieta apagada' : 'Diet cleared');
  }
};

const handleClearAll = () => {
  if (window.confirm(language === 'pt-BR' ? 'Apagar TODOS os dados? Esta ação não pode ser desfeita.' : 'Delete ALL data? This cannot be undone.')) {
    const keysToKeep = ['vida_theme', 'vida_language'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) localStorage.removeItem(key);
    });
    toast.success(language === 'pt-BR' ? 'Dados apagados' : 'Data cleared');
    window.location.reload();
  }
};
```

- [ ] **Step 6: Add translation keys**

Add to useLanguage.jsx for both pt-BR and en:
- `nav_profile`: "Perfil" / "Profile"
- `training_programs`: "Programas" / "Programs"
- `training_dashboard`: "Progresso" / "Progress"
- `settings_data_management`: "Gerenciar Dados" / "Manage Data"
- `settings_clear_workout`: "Apagar Plano de Treino" / "Clear Workout Plan"
- `settings_clear_diet`: "Apagar Dieta" / "Clear Diet"
- `settings_clear_all`: "Apagar Todos os Dados" / "Clear All Data"

- [ ] **Step 7: Commit**

```bash
git add src/components/BottomNav.jsx src/App.jsx src/pages/TrainingPage.jsx src/pages/TrainingPage.css src/pages/SettingsPage.jsx src/pages/SettingsPage.css src/hooks/useLanguage.jsx
git commit -m "feat: restructure nav to 4 tabs, add Profile to BottomNav, add data management"
```

---

## Chunk 2: Page Redesigns

### Task 3: Redesign Schedule as "Today" Card View

**Files:**
- Rewrite: `src/pages/SchedulePage.jsx`
- Rewrite: `src/pages/SchedulePage.css`
- Keep: `src/data/schedule.js` (data structure stays, just rendered differently)

The new design replaces the vertical timeline with actionable cards. The page answers "What do I do today?" with tappable cards that link to Training and Meals.

- [ ] **Step 1: Rewrite SchedulePage.jsx**

The new component structure:

```jsx
export function SchedulePage({ onTabChange }) {
  // Keep: day tabs, selectedDay, office toggle, schedule loading from localStorage
  // New: load workout plan + custom diet for card data

  return (
    <div className="schedule-page">
      {/* Day Tabs - keep existing but add "today" dot indicator */}
      <div className="day-tabs">...</div>

      {/* Day Type Banner - simplified */}
      <div className="day-banner">...</div>

      {/* Action Cards */}
      <div className="schedule-cards">
        {/* Workout Card - tappable, links to training */}
        {workoutForDay && (
          <div className="schedule-card workout" onClick={() => onTabChange?.('training')}>
            <div className="schedule-card-icon">
              <Icon name="dumbbell-1" />
            </div>
            <div className="schedule-card-info">
              <span className="schedule-card-title">{workoutName}</span>
              <span className="schedule-card-sub">{exerciseCount} exercises · {estimatedTime} min</span>
            </div>
            <Icon name="chevron-right" className="schedule-card-arrow" />
          </div>
        )}

        {/* Meals Card - tappable, links to meals */}
        <div className="schedule-card meals" onClick={() => onTabChange?.('meals')}>
          <div className="schedule-card-icon">
            <Icon name="knife-fork-1" />
          </div>
          <div className="schedule-card-info">
            <span className="schedule-card-title">{mealsTitle}</span>
            <span className="schedule-card-sub">{mealsProgress}</span>
          </div>
          <Icon name="chevron-right" className="schedule-card-arrow" />
        </div>
      </div>

      {/* Daily Blocks - simplified list, no timeline connectors */}
      <div className="schedule-blocks">
        {dayData.blocks.map((block, i) => (
          <div key={i} className={`schedule-block ${block.type}`}>
            <span className="schedule-block-time">{block.time}</span>
            <Icon name={BLOCK_ICONS[block.type]} className="schedule-block-icon" />
            <span className="schedule-block-label">{getBlockLabel(block, language)}</span>
          </div>
        ))}
      </div>

      {/* Office toggle hint */}
      <p className="office-hint">...</p>
    </div>
  );
}
```

Key changes:
- Accept `onTabChange` prop (needs wiring in App.jsx)
- Load `vida_workout_plan` and `vida_custom_diet` from localStorage to populate cards
- Workout card shows actual plan data (session name, exercise count, estimated time)
- Meals card shows diet progress or "Set up your diet" CTA
- Daily blocks become a simple flat list (no dots, no connectors, no vertical line)
- Today's day tab gets a visible dot/underline indicator
- Past days in the day tabs could show a subtle checkmark if workouts were completed

- [ ] **Step 2: Wire onTabChange in App.jsx**

Change SchedulePage rendering:
```javascript
case 'schedule': return <SchedulePage onTabChange={setActiveTab} />;
```

- [ ] **Step 3: Write new SchedulePage.css**

Key new classes:
- `.schedule-cards` — flex column, gap, main actionable section
- `.schedule-card` — elevated bg, border, border-radius-lg, flex row, tappable
- `.schedule-card.workout` — left border accent color based on modality
- `.schedule-card.meals` — left border in blue/food color
- `.schedule-card-icon` — 40px circle bg with icon
- `.schedule-card-info` — flex column with title + subtitle
- `.schedule-card-arrow` — chevron-right, muted
- `.schedule-blocks` — simplified list replacing timeline
- `.schedule-block` — single row: time | icon | label, no connectors

Remove all timeline-specific CSS: `.block-dot`, `.block-connector`, `.block-line`, `.time-block` grid layout.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SchedulePage.jsx src/pages/SchedulePage.css src/App.jsx
git commit -m "feat: redesign Schedule as Today card view with actionable workout/meals cards"
```

---

### Task 4: Polish Meals Page

**Files:**
- Modify: `src/pages/MealsPage.jsx`
- Modify: `src/pages/MealsPage.css`

- [ ] **Step 1: Remove accordion from DefaultMealsView**

In `DefaultMealsView`, remove expandedMeal state and the toggle logic. Show all meal options directly in a flat list. Each meal becomes a simpler card with visible content (no expand/collapse).

Replace the MealCard accordion pattern with:
```jsx
<div className="meal-card">
  <div className="meal-header">
    <button className={`meal-check ${isCompleted ? 'checked' : ''}`} onClick={onToggleComplete}>
      <Icon name="checkmark-1" />
    </button>
    <Icon name={meal.icon} className="meal-icon" />
    <div className="meal-info">
      <span className="meal-name">{mealName}</span>
      <span className="meal-time">{mealTime}</span>
    </div>
  </div>
  {/* Always visible content */}
  <div className="meal-content-visible">
    <p className="meal-note">{mealNote}</p>
    <div className="meal-options">
      {mealOptions.map((option, i) => (
        <div key={i} className="meal-option">
          <span className="option-number">{i + 1}</span>
          <span className="option-text">{option}</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

Remove the arrow icon, the expanded state check, and the conditional rendering of meal-content.

- [ ] **Step 2: Bigger check circles**

Update `.meal-check` CSS:
```css
.meal-check {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-border-default);  /* solid, not dashed */
  background: transparent;
  opacity: 0.6;  /* up from 0.4 */
  /* ... rest stays */
}
```

Same for `.meals-diet-food-check`:
```css
.meals-diet-food-check {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border: 2px solid var(--color-border-default);  /* solid */
  opacity: 0.5;  /* up from 0.4 */
}
```

- [ ] **Step 3: Replace macro grid with progress bars in CustomDietView**

Replace the MacroItem grid with horizontal progress bars:

```jsx
{/* Consumed vs Targets — as progress bars */}
{(targets.calories || targets.protein) && (
  <div className="meals-macro-bars">
    {targets.calories && (
      <MacroBar
        label={language === 'pt-BR' ? 'Calorias' : 'Calories'}
        current={consumed.calories}
        target={targets.calories}
        unit="cal"
        color="var(--color-accent-primary)"
      />
    )}
    {targets.protein && (
      <MacroBar
        label={language === 'pt-BR' ? 'Proteína' : 'Protein'}
        current={consumed.protein}
        target={targets.protein}
        unit="g"
        color="var(--color-red)"
      />
    )}
    {targets.carbs && (
      <MacroBar
        label={language === 'pt-BR' ? 'Carboidrato' : 'Carbs'}
        current={consumed.carbs}
        target={targets.carbs}
        unit="g"
        color="var(--color-blue)"
      />
    )}
    {targets.fat && (
      <MacroBar
        label={language === 'pt-BR' ? 'Gordura' : 'Fat'}
        current={consumed.fat}
        target={targets.fat}
        unit="g"
        color="var(--color-orange)"
      />
    )}
  </div>
)}
```

New MacroBar component:
```jsx
function MacroBar({ label, current, target, unit, color }) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="macro-bar-item">
      <div className="macro-bar-header">
        <span className="macro-bar-label">{label}</span>
        <span className="macro-bar-value">{current}{unit} / {target}{unit}</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add macro bar CSS**

```css
.meals-macro-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-md);
}

.macro-bar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.macro-bar-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.macro-bar-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

.macro-bar-track {
  height: 6px;
  background: var(--color-bg-surface);
  border-radius: 3px;
  overflow: hidden;
}

.macro-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-normal);
}
```

- [ ] **Step 5: Kill default meal plan empty state**

In `MealsPage`, when there's no custom diet, instead of showing the hardcoded MEAL_PLAN, show an empty state with CTAs:

```jsx
function DefaultMealsView({ t, language, toast, onTabChange }) {
  return (
    <div className="meals-page">
      <h2 className="meals-title">
        {language === 'pt-BR' ? 'Plano Alimentar' : 'Meal Plan'}
      </h2>
      <p className="meals-subtitle">
        {language === 'pt-BR' ? 'Configure sua dieta personalizada' : 'Set up your personalized diet'}
      </p>

      <div className="meals-empty-state">
        <Icon name="knife-fork-1" className="meals-empty-icon" />
        <p className="meals-empty-text">
          {language === 'pt-BR'
            ? 'Crie sua dieta personalizada ou importe de outra fonte'
            : 'Create your personalized diet or import from another source'}
        </p>
      </div>

      <div className="meals-action-row">
        <button className="meals-create-diet-btn" onClick={() => onTabChange?.('diet-builder')}>
          <Icon name="plus-circle" className="meals-create-diet-icon" />
          <span>{t('meals_create_diet')}</span>
          <Icon name="chevron-right" className="meals-create-diet-arrow" />
        </button>
        <button className="meals-import-diet-btn" onClick={() => onTabChange?.('import-diet')}>
          <Icon name="upload-1" />
          <span>{t('meals_import_diet')}</span>
        </button>
      </div>
    </div>
  );
}
```

Remove all references to MEAL_PLAN, MACRO_TARGETS, getMealName, getMealTime, getMealNote, getMealOptions from MealsPage.jsx (they were only used in the default view).

- [ ] **Step 6: Add empty state CSS**

```css
.meals-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xl) var(--space-md);
  text-align: center;
}

.meals-empty-icon {
  font-size: 2.5rem;
  color: var(--color-text-muted);
  opacity: 0.5;
}

.meals-empty-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  max-width: 280px;
  line-height: 1.5;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/MealsPage.jsx src/pages/MealsPage.css
git commit -m "feat: polish Meals page — remove accordion, bigger checks, macro progress bars, empty state"
```

---

## Chunk 3: Strategic Enhancements

### Task 5: Elevate Running to Equal Status

**Files:**
- Modify: `src/pages/TrainingPage.jsx` (add running progress tracking, running-specific section)
- Modify: `src/pages/TrainingPage.css` (running progress styles)
- Modify: `src/components/activity-cards/RunCard.jsx` (enhance with progress bar showing run metrics)

The goal: when a user has a running day, the TrainingPage should feel as rich as a gym day — with progress tracking, structured display, and clear metrics.

- [ ] **Step 1: Add progress bar for running days in TrainingPage**

Currently, lines 364-375 skip the progress bar for non-gym days. Add a running-specific progress section:

```jsx
{/* Progress for running days */}
{workoutPlan?.dayActivities?.[selectedDay]?.type === 'running' && (
  <RunProgress day={selectedDay} session={workoutPlan.dayActivities[selectedDay].session} language={language} />
)}
```

New RunProgress component (inside TrainingPage.jsx):
```jsx
function RunProgress({ day, session, language }) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `run_${day}_${today}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

  return (
    <div className="run-progress-section">
      <div className="run-progress-target">
        <Icon name="direction-1" className="run-progress-icon" />
        <span className="run-progress-label">
          {session?.distance || '5K'} · Zone {session?.zone || 2}
        </span>
      </div>
      {saved.completed && (
        <div className="run-progress-stats">
          {saved.distance && <span>{saved.distance} km</span>}
          {saved.pace && <span>{saved.pace} /km</span>}
          {saved.duration && <span>{saved.duration} min</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Enhance RunCard with structured run plan display**

In RunCard.jsx, add a "Run Plan" section that shows the structure of the run (warmup → main → cooldown):

```jsx
{/* Run Structure */}
<div className="run-structure">
  <div className="run-phase">
    <span className="run-phase-label">{language === 'pt-BR' ? 'Aquecimento' : 'Warm-up'}</span>
    <span className="run-phase-detail">5 min · Z1</span>
  </div>
  <div className="run-phase main">
    <span className="run-phase-label">{language === 'pt-BR' ? 'Principal' : 'Main'}</span>
    <span className="run-phase-detail">
      {session.distance} · Z{session.zone}
    </span>
  </div>
  <div className="run-phase">
    <span className="run-phase-label">{language === 'pt-BR' ? 'Volta à calma' : 'Cool-down'}</span>
    <span className="run-phase-detail">5 min · Z1</span>
  </div>
</div>
```

- [ ] **Step 3: Add RunCard CSS for phases**

```css
.run-structure {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-sm);
}

.run-phase {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  background: rgba(255, 200, 50, 0.05);
  border-radius: var(--radius-sm);
}

.run-phase.main {
  background: rgba(255, 200, 50, 0.12);
  border-left: 3px solid #ffc832;
}

.run-phase-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.run-phase-detail {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
}

.run-progress-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
}

.run-progress-target {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.run-progress-icon {
  color: #ffc832;
}

.run-progress-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.run-progress-stats {
  display: flex;
  gap: var(--space-sm);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/TrainingPage.jsx src/pages/TrainingPage.css src/components/activity-cards/RunCard.jsx
git commit -m "feat: elevate Running with progress tracking, structured run phases, and equal-status display"
```

---

### Task 6: Add Data Management Styles & Populate Key Programs

**Files:**
- Modify: `src/pages/SettingsPage.css` (data management button styles — if not done in Task 2)
- Modify: `src/data/programs.js` (add exercise lists to top 3 gym programs + top running programs)

- [ ] **Step 1: Ensure SettingsPage data management styles exist**

If not already added in Task 2, add to SettingsPage.css:

```css
.settings-action {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.85rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: var(--space-xs);
}

.settings-action.warning {
  border-color: rgba(255, 159, 10, 0.3);
  color: var(--color-orange, #ff9f0a);
}

.settings-action.danger {
  border-color: rgba(255, 59, 48, 0.3);
  color: var(--color-red, #ff3b30);
}

.settings-action:active {
  transform: scale(0.98);
}
```

- [ ] **Step 2: Add exercise lists to PPL Classic program**

In programs.js, add an `exercises` field to the `ppl-classic` program. This turns the metadata-only shell into a usable program. Structure:

```javascript
{
  id: 'ppl-classic',
  // ... existing fields ...
  days: [
    {
      name: { 'pt-BR': 'Push (Peito, Ombro, Tríceps)', 'en': 'Push (Chest, Shoulders, Triceps)' },
      exercises: [
        { id: 'barbell_bench_press', sets: 4, reps: '6-10', rest: 150 },
        { id: 'overhead_press', sets: 3, reps: '8-10', rest: 120 },
        { id: 'incline_dumbbell_press', sets: 3, reps: '10-12', rest: 90 },
        { id: 'lateral_raise', sets: 3, reps: '12-15', rest: 60 },
        { id: 'tricep_pushdown', sets: 3, reps: '12-15', rest: 60 },
        { id: 'overhead_tricep_extension', sets: 3, reps: '12-15', rest: 60 },
      ]
    },
    {
      name: { 'pt-BR': 'Pull (Costas, Bíceps)', 'en': 'Pull (Back, Biceps)' },
      exercises: [
        { id: 'barbell_row', sets: 4, reps: '6-10', rest: 150 },
        { id: 'pull_up', sets: 3, reps: '6-10', rest: 120 },
        { id: 'seated_cable_row', sets: 3, reps: '10-12', rest: 90 },
        { id: 'face_pull', sets: 3, reps: '12-15', rest: 60 },
        { id: 'barbell_curl', sets: 3, reps: '10-12', rest: 60 },
        { id: 'hammer_curl', sets: 3, reps: '12-15', rest: 60 },
      ]
    },
    {
      name: { 'pt-BR': 'Legs (Pernas)', 'en': 'Legs' },
      exercises: [
        { id: 'barbell_squat', sets: 4, reps: '6-10', rest: 180 },
        { id: 'romanian_deadlift', sets: 3, reps: '8-10', rest: 120 },
        { id: 'leg_press', sets: 3, reps: '10-12', rest: 90 },
        { id: 'leg_curl', sets: 3, reps: '10-12', rest: 60 },
        { id: 'calf_raise', sets: 4, reps: '12-15', rest: 60 },
        { id: 'leg_extension', sets: 3, reps: '12-15', rest: 60 },
      ]
    },
  ]
}
```

Also add exercise lists to `upper-lower` and `full-body-3x` programs (same pattern, different exercises). And add to running programs `couch-to-5k` (weekly plan with run types).

**Note:** The exercise IDs must match IDs in exerciseBundle.json. Cross-reference before adding. Use existing IDs from the 158 gym exercises and 47 running exercises.

- [ ] **Step 3: Commit**

```bash
git add src/data/programs.js src/pages/SettingsPage.css
git commit -m "feat: populate PPL, Upper/Lower, Full Body programs with exercises, add data management styles"
```

---

## Final Steps

- [ ] **Verify all routes work:** Test navigation flow: Schedule → Training, Meals → Diet Builder, Profile/Settings → Data Management, Training → Programs, Training → Dashboard
- [ ] **Test on mobile viewport:** Ensure 4-tab BottomNav looks good, schedule cards are tappable, meal checks are large enough
- [ ] **Final commit and push to main**
