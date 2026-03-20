# Epic 5: Activity Management & Dashboard Fixes

## Goal

Give users control over their sport/activity configuration after onboarding, fix the broken dashboard today card, and make running zones understandable. Currently, users cannot see or edit their selected sports, the dashboard always shows "rest day", and running zone labels (Z1-Z5) are unexplained with non-functional buttons.

## Scope

Four workstreams in one epic, ordered by dependency:

1. **Fix: Dashboard Today Card** — show actual scheduled activities with time context
2. **Fix: Running Zones UX** — collapsible zone explainer + fix broken buttons
3. **Feature: "My Activities" in Settings** — view, add, remove, change frequency with day selection
4. **Glue: Plan Regeneration** — extract plan generation logic, reconnect profile changes to workout plan

## Architecture

### Current State

- **Onboarding** (`OnboardingFlow.jsx`) captures `mainActivities` (gym/crossfit/calisthenics/pilates) and `addOnActivities` (running/yoga with frequency 1-3x). Saved to `vida_user_profile` in localStorage and Supabase.
- **Plan generation** (`getActivityPlan()` in OnboardingFlow.jsx, ~110 lines) builds `vida_workout_plan` with `dayActivities` mapping days (Seg/Ter/etc.) to activity types and sessions. This logic is **trapped inside OnboardingFlow** and not reusable.
- **Dashboard** (`useDashboardData.js` → `getTodayActivity()`) reads the plan to determine today's activity. Returns `null` (shows "rest day") if plan doesn't exist or today's weekday key doesn't match.
- **RunCard** (`RunCard.jsx`) shows Z1-Z5 badges but provides no explanation. The "Mark Complete" button works but zone badges are static/non-interactive and confusing.

### Multi-Activity Days: Data Model

The current plan uses a single object per day with a `secondary` property for stacked activities:

```js
dayActivities: {
  'Seg': {
    type: 'gym',
    session: { label: 'A', name: 'Push', ... },
    secondary: { type: 'running', session: { ... } }  // optional
  }
}
```

**Decision: Keep the existing `secondary` property pattern.** Migrating to arrays would break existing saved plans. Instead, `getTodayActivities()` will flatten `primary + secondary` into an array for rendering:

```js
function getTodayActivities(plan) {
  const entry = plan.dayActivities[todayKey];
  if (!entry) return [];
  const activities = [{ type: entry.type, session: entry.session }];
  if (entry.secondary) {
    activities.push({ type: entry.secondary.type, session: entry.secondary.session });
  }
  return activities;
}
```

The plan generator will continue producing the same structure. `HeroHeader` consumes the flattened array.

### Target State

- **Plan generation** extracted to `src/utils/planGenerator.js` — a pure utility callable from both onboarding and settings.
- **Settings** gets a new "My Activities" section that reads/writes `mainActivities` and `addOnActivities` on the profile, then calls the plan generator to rebuild `vida_workout_plan`.
- **Dashboard today card** correctly resolves today's activities (supports multiple per day) and shows time context based on `gymPreference`.
- **RunCard** has a collapsible "What are training zones?" section with color-coded Z1-Z5 explanations.

---

## Workstream 1: Dashboard Today Card Fix

### Problem

`getTodayActivity()` in `useDashboardData.js` maps `new Date().toLocaleDateString('pt-BR', { weekday: 'long' })` to abbreviated keys (Seg, Ter, etc.). This fails when:
- The workout plan (`vida_workout_plan`) hasn't been generated yet
- The locale mapping doesn't match (accent issues, capitalization)
- Today is a rest day but there's no "next activity" context

Additionally, the card only supports a single activity per day, but the plan can stack activities (gym + running on the same day).

### Design

**Data changes in `useDashboardData.js`:**
- `getTodayActivity()` → `getTodayActivities()` (returns array). Flattens `entry + entry.secondary` into `[{ type, session }, ...]`. Returns `[]` if no plan or no activity today.
- Return shape change: `data.todayActivity` (singular object) → `data.todayActivities` (array). Only consumer is `HeroHeader.jsx`.
- Add `getNextActivity(plan)`: scans forward from tomorrow through the weekday cycle (max 7 days) to find the next day with an activity. Returns `{ dayLabel, type, session }` or `null` if no activities exist at all.
- Add time estimation based on `profile.gymPreference` mapping: morning→7h, afternoon→14h, evening→18h, flexible→null (no time shown)

**UI changes in `HeroHeader.jsx`:**
- Destructure `todayActivities` (array) instead of `todayActivity` (object)
- Map over `todayActivities` array to render multiple cards
- Each card shows: activity name, colored dot by sport type, estimated time, brief info, "Ir →" button
- When `todayActivities` is empty (rest day): show "Dia de descanso" + next scheduled activity context (e.g. "Amanhã: Legs" or "Quarta: Running" if tomorrow is also rest)
- Sport colors from existing `DESIGN.sportColors`

### Data Flow

```
vida_workout_plan.dayActivities[todayKey]
  → Flatten: { type, session, secondary? } → [{ type, session }, ...]
  → useDashboardData returns { todayActivities: [...] }
  → HeroHeader maps over array, renders one card per activity
  → "Ir →" navigates to Training tab
```

---

## Workstream 2: Running Zones UX

### Problem

RunCard shows Z1-Z5 badges but users don't know what they mean. The zone badges are non-interactive labels with no explanation. The "Mark Complete" button functionality works but the UX around zones is confusing.

### Design

**Zone data** (new constant in `src/data/running.js`):

| Zone | Name (pt-BR) | Name (en) | % HR Max | Color | Description (pt-BR) | Description (en) |
|------|-------------|-----------|----------|-------|---------------------|-------------------|
| Z1 | Recuperacao | Recovery | 50-60% | #82dcb4 (mint) | Esforco muito leve, caminhada rapida | Very light effort, brisk walk |
| Z2 | Aerobica | Aerobic | 60-70% | #60c8f0 (sky) | Ritmo de conversa, base aerobica | Conversational pace, aerobic base |
| Z3 | Tempo | Tempo | 70-80% | #ffc832 (gold) | Desconforto leve, ritmo sustentado | Comfortably hard, sustained pace |
| Z4 | Limiar | Threshold | 80-90% | #ff9432 (orange) | Fala dificil, intervalos | Hard to talk, interval work |
| Z5 | VO2 Max | VO2 Max | 90-100% | #ff4f4f (red) | Esforco maximo, sprints | Maximum effort, sprints |

**Note:** Colors match the existing `ZONE_COLORS` already in `RunCard.jsx`. No visual change for existing users.

**UI changes in `RunCard.jsx`:**
- Zone badges get colors matching the table above. Current session zone is highlighted (filled background + checkmark)
- Below zone badges: collapsible section "O que sao zonas de treino?" (collapsed by default)
- On expand: shows all 5 zones with colored badge, name, HR %, and short description
- Collapsible uses simple `useState(false)` toggle, no animation library needed

---

## Workstream 3: "My Activities" in Settings

### Problem

After onboarding, users cannot see which sports they selected, cannot add new ones, cannot change frequency, and cannot remove sports. The only option is to redo the entire onboarding flow.

### Design

**New component:** `src/components/settings/MyActivities.jsx`

**Layout:** New section in SettingsPage, positioned after the profile card and before Theme.

**Section structure:**
- Header: "Minhas Atividades" icon + "Adicionar" button
- Activity cards list (one per active sport):
  - Icon + name + badge ("Principal" or "Opcional")
  - Frequency display:
    - Main activities: static badge showing count (derived from `trainingDays.length`)
    - Add-on activities: stepper with -/+ buttons (1x to 7x range)
  - Day selector: 7 pill buttons (Seg-Dom), tappable to toggle
    - Active days filled with sport color
    - Inactive days outlined/muted
  - "Remover" button visible on each card (trash icon, right side). Tapping shows a confirmation dialog before removing.

**Removal flow:**
1. User taps trash icon → confirmation dialog: "Remover [activity]? Seu plano sera atualizado."
2. On confirm: activity removed from profile, plan regenerated
3. **Minimum constraint:** User must keep at least 1 main activity. If they try to remove the last main activity, show warning: "Voce precisa de pelo menos uma atividade principal." Add-on activities can all be removed (they're optional).

**Add Activity BottomSheet:**
- Opens from "+ Adicionar" button
- Grid of available activity types (gym, crossfit, calisthenics, pilates, running, yoga)
- Already-added activities greyed out with "Ja adicionado" label
- Tapping an available activity adds it with frequency=1 and no days selected
- User then picks days via the day selector pills

**Data flow:**
1. User changes frequency or days → local state updates immediately
2. On any change: `updateProfile({ mainActivities, addOnActivities })` saves to localStorage + Supabase
3. After profile save: call `generateWorkoutPlan(updatedProfile)` from the extracted plan generator (synchronous, pure function — no loading spinner needed)
4. New plan saved to `vida_workout_plan` in localStorage
5. Dashboard/Training reflect changes on next mount
6. If Supabase save fails, localStorage still saves (offline-first). No sync recovery needed — next onboarding check will reconcile.
7. Show toast: "Plano atualizado!"

**Constraints:**
- The 7-day limit applies to **unique days**, not total activity slots. Stacking (add-on on same day as main) is allowed and does NOT count as an extra day. For example: gym on Mon-Fri (5 days) + running on Tue/Thu (stacked) = 5 unique days, not 7.
- Main activities share a single `trainingDays` array — the day pills for main activities control which days have gym/crossfit/calisthenics/pilates. The plan generator distributes main activities round-robin across these days. Changing days for the main activity pool affects all main activities equally.
- Add-on activities have their own independent day arrays. They stack as `secondary` on existing main days, or get their own day entry if placed on a rest day.
- Minimum 1 day when an activity is active (can't have 0 days)
- Minimum 1 main activity (cannot remove all main activities)

---

## Workstream 4: Plan Regeneration (Glue)

### Problem

`getActivityPlan()` lives inside `OnboardingFlow.jsx` (~lines 1109-1221) and is only called during onboarding. It needs to be callable from Settings when the user changes their activity configuration.

### Design

**Extract to:** `src/utils/planGenerator.js`

**Exported function:**
```js
export function generateWorkoutPlan(profile) → plan
```

Takes a profile object (same shape as `userProfile`) and returns a complete `vida_workout_plan` object. Pure function, no side effects.

**Callers:**
1. `OnboardingFlow.jsx` — calls it during onboarding completion (replaces inline logic)
2. `MyActivities.jsx` — calls it after saving activity changes

**Save logic:** Caller is responsible for saving the returned plan to localStorage:
```js
const plan = generateWorkoutPlan(updatedProfile);
localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
```

**Plan structure (unchanged):**
```js
{
  splitType: 'PPL' | 'Upper/Lower' | 'Full Body',
  trainingDays: ['Seg', 'Ter', ...],
  dayActivities: {
    'Seg': { type: 'gym', session: { label, name, ... } },
    'Ter': { type: 'running', session: { ... } },
    ...
  },
  split: [...],
  goals: [...],
  generatedAt: ISO string
}
```

---

## i18n

New translation keys needed:

| Key | pt-BR | en |
|-----|-------|-----|
| settings_my_activities | Minhas Atividades | My Activities |
| settings_add_activity | Adicionar Atividade | Add Activity |
| settings_main_activity | Principal | Main |
| settings_addon_activity | Opcional | Optional |
| settings_per_week | /sem | /week |
| settings_already_added | Ja adicionado | Already added |
| settings_remove | Remover | Remove |
| settings_swipe_hint | Deslize para remover | Swipe to remove |
| settings_plan_updated | Plano atualizado! | Plan updated! |
| settings_max_days_warning | Maximo de 7 dias por semana | Maximum 7 days per week |
| run_zone_explainer_title | O que sao zonas de treino? | What are training zones? |
| run_zone_recovery | Recuperacao | Recovery |
| run_zone_aerobic | Aerobica | Aerobic |
| run_zone_tempo | Tempo | Tempo |
| run_zone_threshold | Limiar | Threshold |
| run_zone_vo2max | VO2 Max | VO2 Max |
| dashboard_next_activity | Amanha | Tomorrow |
| dashboard_at_time | as | at |

## Files Changed

### New Files
- `src/utils/planGenerator.js` — extracted plan generation logic
- `src/components/settings/MyActivities.jsx` — activity management section

### Modified Files
- `src/pages/SettingsPage.jsx` — import and render MyActivities section
- `src/pages/SettingsPage.css` — styles for MyActivities
- `src/hooks/useDashboardData.js` — fix `getTodayActivity` → `getTodayActivities`, add `getNextActivity`
- `src/components/dashboard/HeroHeader.jsx` — support multiple activity cards, time display, rest day context
- `src/components/activity-cards/RunCard.jsx` — add zone explainer collapsible, zone colors
- `src/data/running.js` — add ZONE_INFO constant with colors/descriptions
- `src/hooks/useLanguage.jsx` — add new translation keys
- `src/components/OnboardingFlow.jsx` — replace inline plan generation with call to `planGenerator.js`
- `src/pages/DashboardPage.css` — minor adjustments for multi-card today layout

## Out of Scope

- Drag-and-drop reordering of activities
- Custom activity types beyond the existing 6 (gym, crossfit, calisthenics, pilates, running, yoga)
- Per-activity time-of-day preferences (all activities use the global `gymPreference`)
- MonthlyReport, MuscleDistribution, ProgressionChart tab functionality (documented stubs from Epic 4)
