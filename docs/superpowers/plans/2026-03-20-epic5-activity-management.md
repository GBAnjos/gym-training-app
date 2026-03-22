# Epic 5: Activity Management & Dashboard Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give users control over their sports configuration after onboarding, fix the dashboard today card, and make running zones understandable.

**Architecture:** Extract plan generation from OnboardingFlow into a reusable utility. Add a "My Activities" section in Settings that reads/writes profile data and regenerates the workout plan. Fix HeroHeader to show multiple activities per day with time context. Add collapsible zone explainer to RunCard.

**Tech Stack:** React (Vite, no TypeScript), localStorage + Supabase, existing BottomSheet component, existing useOnboarding hook with updateProfile.

**Spec:** `docs/superpowers/specs/2026-03-20-epic5-activity-management-design.md`

---

## Chunk 1: Foundation & Bug Fixes (Tasks 1-3)

### Task 1: Extract Plan Generator Utility

Extract `getActivityPlan()` from `OnboardingFlow.jsx` (lines 1109-1221) into a reusable pure utility. This is the foundation — Tasks 3 and 5 depend on it.

**Files:**
- Create: `src/utils/planGenerator.js`
- Modify: `src/components/OnboardingFlow.jsx`

- [ ] **Step 1: Create `src/utils/planGenerator.js`**

Copy the `getActivityPlan()` function from OnboardingFlow.jsx (lines 1109-1221) into a new file. Also copy the `getTrainingSplit()` helper it depends on. Wrap in a higher-level `generateWorkoutPlan()` that produces the final plan object (matching what OnboardingFlow builds at lines 1694-1702).

```js
// src/utils/planGenerator.js
import { getRunSessionByIndex } from '../data/running';
import { getWodByIndex } from '../data/crossfit';
import { getCalisthenicsSplitByIndex } from '../data/calisthenics';
import { getPilatesFlowByIndex } from '../data/pilates';
import { getYogaSessionByIndex } from '../data/yoga';

// Copied verbatim from OnboardingFlow.jsx lines 1044-1085
function getTrainingSplit(goals) {
  const hasMusclGain = goals.includes('muscle_gain');
  const hasWeightLoss = goals.includes('weight_loss');

  if (hasMusclGain) {
    return {
      type: 'PPL',
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Push', focus: { 'pt-BR': 'Peito, Ombro, Tríceps', 'en': 'Chest, Shoulder, Triceps' }, icon: '💪' },
        { label: 'B', name: 'Pull', focus: { 'pt-BR': 'Costas, Bíceps', 'en': 'Back, Biceps' }, icon: '🔙' },
        { label: 'C', name: 'Legs', focus: { 'pt-BR': 'Quadríceps, Glúteo, Posterior', 'en': 'Quads, Glutes, Hamstrings' }, icon: '🦵' },
        { label: 'D', name: 'Push+', focus: { 'pt-BR': 'Ombro foco, Tríceps', 'en': 'Shoulder focus, Triceps' }, icon: '🔥' },
        { label: 'E', name: 'Pull+', focus: { 'pt-BR': 'Costas largura, Bíceps', 'en': 'Back width, Biceps' }, icon: '⚡' },
      ]
    };
  } else if (hasWeightLoss) {
    return {
      type: 'Upper/Lower',
      days: ['Seg', 'Ter', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'B', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
        { label: 'C', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'D', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
      ]
    };
  } else {
    return {
      type: 'Full Body',
      days: ['Seg', 'Qua', 'Sex'],
      split: [
        { label: 'A', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'B', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'C', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
      ]
    };
  }
}

// Based on OnboardingFlow.jsx lines 1109-1221, with trainingDays override support
// When profile.trainingDays is provided (from Settings), those explicit days are used.
// When not provided (from Onboarding), days are derived from goals as before.
function getActivityPlan(goals, mainActivities, addOnActivities, explicitTrainingDays) {
  const mains = mainActivities && mainActivities.length > 0 ? mainActivities : ['gym'];
  const addons = addOnActivities || [];

  const gymSplit = getTrainingSplit(goals);

  // Use explicit training days if provided (from Settings), otherwise derive from goals
  let trainingDaySlots;
  if (explicitTrainingDays && explicitTrainingDays.length > 0) {
    trainingDaySlots = explicitTrainingDays;
  } else {
    const hasMusclGain = goals.includes('muscle_gain');
    const hasWeightLoss = goals.includes('weight_loss');
    const totalMainDays = hasMusclGain ? 5 : hasWeightLoss ? 4 : 3;
    trainingDaySlots = gymSplit.days.slice(0, totalMainDays);
  }

  const dayActivities = {};
  const activityCounters = {};
  mains.forEach(a => { activityCounters[a] = 0; });

  trainingDaySlots.forEach((day, i) => {
    const activityType = mains[i % mains.length];
    const counter = activityCounters[activityType];

    let session = null;
    if (activityType === 'gym') {
      session = { ...gymSplit.split[counter % gymSplit.split.length] };
    } else if (activityType === 'crossfit') {
      session = getWodByIndex(counter);
    } else if (activityType === 'calisthenics') {
      session = getCalisthenicsSplitByIndex(counter);
    } else if (activityType === 'pilates') {
      session = getPilatesFlowByIndex(counter);
    }

    dayActivities[day] = { type: activityType, session };
    activityCounters[activityType] = counter + 1;
  });

  const allWeekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const freeDays = allWeekdays.filter(d => !dayActivities[d]);
  const addonCounters = {};

  addons.forEach(addon => {
    addonCounters[addon.type] = 0;
    let placed = 0;
    const targetFreq = addon.frequency || 2;

    // If add-on has explicit days (from Settings), use those directly
    if (addon.days && addon.days.length > 0) {
      addon.days.forEach(day => {
        let session = null;
        if (addon.type === 'running') {
          session = getRunSessionByIndex(addonCounters[addon.type]);
        } else if (addon.type === 'yoga') {
          session = getYogaSessionByIndex(addonCounters[addon.type]);
        }

        if (dayActivities[day]) {
          // Stack as secondary on existing day
          if (!dayActivities[day].secondary) {
            dayActivities[day].secondary = { type: addon.type, session };
          }
        } else {
          dayActivities[day] = { type: addon.type, session };
        }
        addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
        placed++;
      });
      return; // skip auto-placement below
    }

    // Auto-placement (from Onboarding — no explicit days)
    for (let d = 0; d < freeDays.length && placed < targetFreq; d++) {
      const day = freeDays[d];
      if (dayActivities[day]) continue;

      if (addon.type === 'running') {
        const dayIdx = allWeekdays.indexOf(day);
        const prevDay = dayIdx > 0 ? allWeekdays[dayIdx - 1] : null;
        const nextDay = dayIdx < allWeekdays.length - 1 ? allWeekdays[dayIdx + 1] : null;
        const isLegDay = (d) => {
          const act = dayActivities[d];
          if (!act || act.type !== 'gym') return false;
          const name = act.session?.name || '';
          return name === 'Legs' || name === 'Lower';
        };
        if ((prevDay && isLegDay(prevDay)) || (nextDay && isLegDay(nextDay))) continue;
      }

      let session = null;
      if (addon.type === 'running') {
        session = getRunSessionByIndex(addonCounters[addon.type]);
      } else if (addon.type === 'yoga') {
        session = getYogaSessionByIndex(addonCounters[addon.type]);
      }

      dayActivities[day] = { type: addon.type, session };
      addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
      placed++;
      freeDays.splice(d, 1);
      d--;
    }

    if (placed < targetFreq) {
      const mainDays = Object.keys(dayActivities).filter(d =>
        dayActivities[d].type !== addon.type && !dayActivities[d].secondary
      );
      for (let m = 0; m < mainDays.length && placed < targetFreq; m++) {
        let session = null;
        if (addon.type === 'running') {
          session = getRunSessionByIndex(addonCounters[addon.type]);
        } else if (addon.type === 'yoga') {
          session = getYogaSessionByIndex(addonCounters[addon.type]);
        }
        dayActivities[mainDays[m]].secondary = { type: addon.type, session };
        addonCounters[addon.type] = (addonCounters[addon.type] || 0) + 1;
        placed++;
      }
    }
  });

  return {
    trainingDays: Object.keys(dayActivities),
    dayActivities,
    splitType: gymSplit.type,
    split: gymSplit.split.map((s, i) => ({
      day: gymSplit.days[i],
      label: s.label,
      name: s.name,
      focus: s.focus,
      icon: s.icon
    })),
  };
}

/**
 * Generate a complete workout plan from a user profile.
 * Pure function, no side effects.
 *
 * @param {Object} profile - userProfile object from useOnboarding
 * @returns {Object} plan ready to save to vida_workout_plan
 */
export function generateWorkoutPlan(profile) {
  const goals = profile.goals || (profile.goal ? [profile.goal] : []);
  const mainActivities = profile.mainActivities || ['gym'];
  const addOnActivities = profile.addOnActivities || [];

  // profile.trainingDays is set by Settings (user-chosen days); undefined during onboarding (derived from goals)
  const activityPlan = getActivityPlan(goals, mainActivities, addOnActivities, profile.trainingDays);

  return {
    splitType: activityPlan.splitType,
    trainingDays: activityPlan.trainingDays,
    dayActivities: activityPlan.dayActivities,
    split: activityPlan.split,
    goals,
    generatedAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Update OnboardingFlow to use the new utility**

In `src/components/OnboardingFlow.jsx`:
1. Add import: `import { generateWorkoutPlan } from '../utils/planGenerator';`
2. Find where `getActivityPlan()` is called (around line 1329) and the plan assembly (lines 1694-1702)
3. Replace with: `const workoutPlan = generateWorkoutPlan(profileData);`
4. Remove the inline `getActivityPlan()` and `getTrainingSplit()` functions (lines ~1109-1221)
5. Keep the `localStorage.setItem('vida_workout_plan', JSON.stringify(workoutPlan));` call

- [ ] **Step 3: Verify build passes**

```bash
npx vite build
```

Expected: Build succeeds. The onboarding flow should work exactly as before — same plan output, just sourced from a different file.

- [ ] **Step 4: Commit**

```bash
git add src/utils/planGenerator.js src/components/OnboardingFlow.jsx
git commit -m "refactor: extract plan generator from OnboardingFlow into reusable utility"
```

---

### Task 2: Fix Dashboard Today Card

Fix `getTodayActivity()` so it correctly resolves today's activities (including stacked secondary), add `getNextActivity()` for rest day context, and update HeroHeader to render multiple activities with time.

**Files:**
- Modify: `src/hooks/useDashboardData.js`
- Modify: `src/components/dashboard/HeroHeader.jsx`
- Modify: `src/hooks/useLanguage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Add i18n keys for dashboard**

In `src/hooks/useLanguage.jsx`, add these keys to both language blocks:

**pt-BR block** (after existing `dashboard_*` keys):
```js
dashboard_tomorrow: 'Amanhã',
```

**en block** (same position):
```js
dashboard_tomorrow: 'Tomorrow',
```

- [ ] **Step 2: Update `useDashboardData.js` — replace getTodayActivity with getTodayActivities**

Replace the `getTodayActivity()` function (lines 78-89) with:

```js
function getTodayActivities(plan) {
  if (!plan?.dayActivities) return [];

  // toLocaleDateString('pt-BR', { weekday: 'long' }) returns full names:
  // 'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'
  const dayMap = {
    'domingo': 'Dom', 'segunda-feira': 'Seg', 'terça-feira': 'Ter',
    'quarta-feira': 'Qua', 'quinta-feira': 'Qui', 'sexta-feira': 'Sex',
    'sábado': 'Sáb'
  };
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const todayKey = dayMap[today.toLowerCase()];

  if (!todayKey) return [];
  const entry = plan.dayActivities[todayKey];
  if (!entry) return [];

  const activities = [{ type: entry.type, session: entry.session }];
  if (entry.secondary) {
    activities.push({ type: entry.secondary.type, session: entry.secondary.session });
  }
  return activities;
}
```

**Note:** The original code used short keys like `'segunda'` which never matched because `toLocaleDateString` returns `'segunda-feira'`. This was the root cause of the "always rest day" bug.

- [ ] **Step 3: Add `getNextActivity()` function**

Add this function after `getTodayActivities()`:

```js
function getNextActivity(plan) {
  if (!plan?.dayActivities) return null;

  const dayOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...

  for (let i = 1; i <= 7; i++) {
    const nextIndex = (todayIndex + i) % 7;
    const dayKey = dayOrder[nextIndex];
    const entry = plan.dayActivities[dayKey];
    if (entry) {
      const isTomorrow = i === 1;
      return { dayKey, type: entry.type, session: entry.session, isTomorrow };
    }
  }
  return null;
}
```

**Note:** `getNextActivity` does NOT resolve day labels — it returns the raw `dayKey` (e.g., `'Ter'`). HeroHeader resolves labels using `language` at render time (see Step 5).

- [ ] **Step 4: Update the useDashboardData return object**

In the `useMemo` block, replace:
```js
const todayActivity = getTodayActivity(plan);
```
with:
```js
const todayActivities = getTodayActivities(plan);
const nextActivity = getNextActivity(plan);
```

In the return object, replace:
```js
todayActivity,
```
with:
```js
todayActivities,
nextActivity,
```

- [ ] **Step 5: Update HeroHeader.jsx to consume new data shape**

Replace the entire `HeroHeader.jsx` content:

```jsx
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';
import { getWorkoutBySplit } from '../../data/treinos';

const TIME_MAP = { morning: '7h', afternoon: '14h', evening: '18h' };
const DAY_LABELS = {
  'pt-BR': { 'Dom': 'Domingo', 'Seg': 'Segunda', 'Ter': 'Terça', 'Qua': 'Quarta', 'Qui': 'Quinta', 'Sex': 'Sexta', 'Sáb': 'Sábado' },
  en: { 'Dom': 'Sunday', 'Seg': 'Monday', 'Ter': 'Tuesday', 'Qua': 'Wednesday', 'Qui': 'Thursday', 'Sex': 'Friday', 'Sáb': 'Saturday' },
};

export function HeroHeader({ data, onNavigateToTraining }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { profile, todayActivities, nextActivity, weekStreak, weeklyCount, weeklyTarget, primaryActivity, gymStats } = data;

  const firstName = (profile.name || user?.user_metadata?.full_name || '').split(' ')[0] || '';

  const goalLabels = {
    muscle_gain: { 'pt-BR': 'Ganho Muscular', en: 'Muscle Gain' },
    weight_loss: { 'pt-BR': 'Perda de Peso', en: 'Weight Loss' },
    maintain: { 'pt-BR': 'Manutenção', en: 'Maintain' },
    general: { 'pt-BR': 'Saúde Geral', en: 'General Health' },
  };
  const goalLabel = goalLabels[profile.goal]?.[language] || '';

  const timeLabel = TIME_MAP[profile.gymPreference] || null;
  const miniStats = getMiniStats(data, language, t);

  return (
    <div className="dashboard-section hero-header">
      {/* Greeting row */}
      <div className="hero-greeting-row">
        <div className="hero-greeting">
          <span className="hero-name">{t('dashboard_greeting')}, {firstName}</span>
          {goalLabel && <span className="hero-goal-badge">{goalLabel}</span>}
        </div>
        <div className={`hero-streak ${weekStreak > 0 ? 'active' : ''}`}>
          <Icon name="bolt-2" />
          <span>{weekStreak} {t('dashboard_week_streak')}</span>
        </div>
      </div>

      {/* Today's activities */}
      {todayActivities.length > 0 ? (
        todayActivities.map((activity, i) => {
          const info = getActivityInfo(activity, language, t);
          const sportColor = DESIGN.sportColors[activity.type]?.primary;
          return (
            <button key={i} className="hero-today-card" onClick={onNavigateToTraining} style={{ borderLeftColor: sportColor }}>
              <div className="hero-today-info">
                <span className="hero-today-title">{info.title}</span>
                <span className="hero-today-subtitle">
                  <span className="hero-sport-dot" style={{ color: sportColor }}>●</span>
                  {' '}{info.sportLabel}{timeLabel ? ` · ${timeLabel}` : ''} · {info.subtitle}
                </span>
              </div>
              <span className="hero-today-action">{t('dashboard_start')} →</span>
            </button>
          );
        })
      ) : (
        <div className="hero-today-card rest">
          <div className="hero-today-info">
            <span className="hero-today-title">{t('dashboard_rest_day')}</span>
            <span className="hero-today-subtitle">
              {t('dashboard_rest_message')}
              {nextActivity && (
                <>
                  {'. '}
                  {nextActivity.isTomorrow
                    ? t('dashboard_tomorrow')
                    : DAY_LABELS[language]?.[nextActivity.dayKey] || nextActivity.dayKey
                  }: {getActivityInfo(nextActivity, language, t).title}
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Mini stat cards */}
      <div className="hero-stats-row">
        {miniStats.map((stat, i) => (
          <div key={i} className="hero-stat-card">
            <span className="hero-stat-value">{stat.value}</span>
            <span className="hero-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SPORT_LABELS = {
  gym: { 'pt-BR': 'Academia', en: 'Gym' },
  crossfit: { 'pt-BR': 'CrossFit', en: 'CrossFit' },
  calisthenics: { 'pt-BR': 'Calistenia', en: 'Calisthenics' },
  pilates: { 'pt-BR': 'Pilates', en: 'Pilates' },
  running: { 'pt-BR': 'Corrida', en: 'Running' },
  yoga: { 'pt-BR': 'Yoga', en: 'Yoga' },
};

function getActivityInfo(activity, language, t) {
  const session = activity.session;
  const sportLabel = SPORT_LABELS[activity.type]?.[language] || activity.type;

  switch (activity.type) {
    case 'gym': {
      if (!session) return { title: sportLabel, subtitle: '', sportLabel };
      const workout = getWorkoutBySplit(session.name);
      const exerciseCount = workout?.exercicios?.length || 0;
      const duration = exerciseCount * 8;
      return {
        title: `${session.label}: ${session.name}`,
        subtitle: `${exerciseCount} ${t('dashboard_exercises')} · ~${duration} min`,
        sportLabel,
      };
    }
    case 'crossfit': {
      const name = session?.name?.[language] || session?.name || 'CrossFit';
      const movements = session?.movements?.length || 0;
      const cap = session?.timeCap || 20;
      return { title: name, subtitle: `${movements} ${t('dashboard_movements')} · ${cap} ${t('dashboard_min_cap')}`, sportLabel };
    }
    case 'calisthenics': {
      const name = session?.name?.[language] || session?.name || 'Calisthenics';
      const skills = session?.skills?.length || 0;
      return { title: name, subtitle: `${skills} ${t('dashboard_progressions')}`, sportLabel };
    }
    case 'pilates': {
      const name = session?.name?.[language] || session?.name || 'Pilates';
      const movements = session?.movements?.length || 0;
      return { title: name, subtitle: `${movements} ${t('dashboard_movements')} · ~30 min`, sportLabel };
    }
    case 'running': {
      const name = session?.name?.[language] || session?.name || 'Running';
      // Bug fix: old code used session?.targetDistance which doesn't exist in running data — the correct field is `distance` (e.g., '5K', '10K')
      const distance = session?.distance || '';
      return { title: name, subtitle: distance ? `${distance} · Z${session?.zone || ''}` : '~30 min', sportLabel };
    }
    case 'yoga': {
      const name = session?.name?.[language] || session?.name || 'Yoga';
      const poses = session?.poses?.length || 0;
      return { title: name, subtitle: `${poses} ${t('dashboard_poses')} · ~20 min`, sportLabel };
    }
    default:
      return { title: activity.type, subtitle: '', sportLabel };
  }
}

function getMiniStats(data, language, t) {
  const { weeklyCount, weeklyTarget, primaryActivity, gymStats, currentMonthCount } = data;

  const card1 = {
    value: `${weeklyCount}/${weeklyTarget}`,
    label: t('dashboard_sessions_week'),
  };

  let card2;
  switch (primaryActivity) {
    case 'gym':
      card2 = {
        value: gymStats.totalVolume > 1000
          ? `${(gymStats.totalVolume / 1000).toFixed(1)}k`
          : `${Math.round(gymStats.totalVolume)}`,
        label: t('dashboard_volume') + ' (kg)',
      };
      break;
    case 'running':
      card2 = { value: '—', label: t('dashboard_distance') + ' (km)' };
      break;
    default:
      card2 = { value: String(currentMonthCount), label: t('dashboard_sessions_month') };
  }

  const prCount = Object.keys(gymStats.exercisePRs).length;
  const card3 = ['gym', 'crossfit', 'calisthenics'].includes(primaryActivity)
    ? { value: String(prCount), label: t('dashboard_prs_month') }
    : { value: String(data.weekStreak), label: t('dashboard_longest_streak') };

  return [card1, card2, card3];
}
```

- [ ] **Step 6: Add CSS for sport dot**

In `src/pages/DashboardPage.css`, add after the existing `.hero-today-subtitle` styles:

```css
.hero-sport-dot {
  font-size: 0.6rem;
  vertical-align: middle;
}
```

- [ ] **Step 7: Verify build passes**

```bash
npx vite build
```

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useDashboardData.js src/components/dashboard/HeroHeader.jsx src/hooks/useLanguage.jsx src/pages/DashboardPage.css
git commit -m "fix: dashboard today card shows actual activities with time and multi-activity support"
```

---

### Task 3: Running Zones UX

Add `ZONE_INFO` constant to `running.js` and a collapsible zone explainer section to `RunCard.jsx`.

**Files:**
- Modify: `src/data/running.js`
- Modify: `src/components/activity-cards/RunCard.jsx`
- Modify: `src/components/activity-cards/ActivityCard.css`

- [ ] **Step 1: Add ZONE_INFO constant to running.js**

At the top of `src/data/running.js`, add:

```js
export const ZONE_INFO = [
  {
    zone: 1, label: 'Z1', color: '#82dcb4',
    name: { 'pt-BR': 'Recuperação', en: 'Recovery' },
    hr: '50-60%',
    description: { 'pt-BR': 'Esforço muito leve, caminhada rápida', en: 'Very light effort, brisk walk' },
  },
  {
    zone: 2, label: 'Z2', color: '#60c8f0',
    name: { 'pt-BR': 'Aeróbica', en: 'Aerobic' },
    hr: '60-70%',
    description: { 'pt-BR': 'Ritmo de conversa, base aeróbica', en: 'Conversational pace, aerobic base' },
  },
  {
    zone: 3, label: 'Z3', color: '#ffc832',
    name: { 'pt-BR': 'Tempo', en: 'Tempo' },
    hr: '70-80%',
    description: { 'pt-BR': 'Desconforto leve, ritmo sustentado', en: 'Comfortably hard, sustained pace' },
  },
  {
    zone: 4, label: 'Z4', color: '#ff9432',
    name: { 'pt-BR': 'Limiar', en: 'Threshold' },
    hr: '80-90%',
    description: { 'pt-BR': 'Fala difícil, intervalos', en: 'Hard to talk, interval work' },
  },
  {
    zone: 5, label: 'Z5', color: '#ff4f4f',
    name: { 'pt-BR': 'VO2 Max', en: 'VO2 Max' },
    hr: '90-100%',
    description: { 'pt-BR': 'Esforço máximo, sprints', en: 'Maximum effort, sprints' },
  },
];
```

- [ ] **Step 2: No i18n keys needed for RunCard**

RunCard receives `language` as a prop and doesn't use the `t()` function from `useLanguage`. Zone labels are handled via inline ternaries (e.g., `language === 'pt-BR' ? 'O que são zonas de treino?' : 'What are training zones?'`) and the bilingual `ZONE_INFO` data already carries `name[language]` and `description[language]`. Skip to next step.

- [ ] **Step 3: Add zone explainer to RunCard.jsx**

In `src/components/activity-cards/RunCard.jsx`:

1. Update the import from `running.js` to also include `ZONE_INFO`: change `import { RUN_TYPES } from '../../data/running.js';` to `import { RUN_TYPES, ZONE_INFO } from '../../data/running.js';`
2. Add state: `const [showZones, setShowZones] = useState(false);` after the existing `useState` declarations (around line 48)
3. **Note:** RunCard already receives `language` as a prop — do NOT import `useLanguage`. For the `t()` function, create a simple inline translation object (see code below).
4. The existing `ZONE_COLORS` constant (lines 9-15) can be removed since `ZONE_INFO` now carries the same colors.

**Replace the zone badges section** (lines 142-159, the `<div className="run-zones">...</div>` block) with the new zone badges + collapsible explainer. **Note:** The existing class names `run-zones` and `run-zone` are being replaced with `run-zone-badges` and `run-zone-badge` — the old CSS rules for `.run-zones` and `.run-zone` should be removed from `src/components/activity-cards/ActivityCard.css` if they exist there.

```jsx
{/* Zone badges with ZONE_INFO colors */}
<div className="run-zone-badges">
  {ZONE_INFO.map(z => (
    <span
      key={z.zone}
      className={`run-zone-badge ${session.zone === z.zone ? 'active' : ''}`}
      style={session.zone === z.zone
        ? { background: z.color + '33', border: `1px solid ${z.color}`, color: z.color }
        : { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-muted)' }
      }
    >
      {z.label}{session.zone === z.zone ? ' ✓' : ''}
    </span>
  ))}
</div>

{/* Zone explainer - collapsible */}
<button
  className="zone-explainer-toggle"
  onClick={() => setShowZones(!showZones)}
>
  <span>ℹ {language === 'pt-BR' ? 'O que são zonas de treino?' : 'What are training zones?'}</span>
  <span className={`zone-toggle-arrow ${showZones ? 'open' : ''}`}>▼</span>
</button>
{showZones && (
  <div className="zone-explainer-content">
    {ZONE_INFO.map(z => (
      <div key={z.zone} className="zone-explainer-row">
        <span className="zone-explainer-badge" style={{ background: z.color }}>
          {z.label}
        </span>
        <div className="zone-explainer-info">
          <span className="zone-explainer-name">{z.name[language]}</span>
          <span className="zone-explainer-hr">{z.hr} {language === 'pt-BR' ? 'FC máx' : 'HR max'}</span>
          <span className="zone-explainer-desc">{z.description[language]}</span>
        </div>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 4: Add CSS for zone explainer**

Add to `src/components/activity-cards/ActivityCard.css` (this is the CSS file imported by RunCard.jsx). Also remove the old `.run-zones` and `.run-zone` CSS rules from this file if they exist, since they've been replaced by `.run-zone-badges` and `.run-zone-badge`:

```css
.zone-explainer-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 8px;
  -webkit-tap-highlight-color: transparent;
}

.zone-toggle-arrow {
  transition: transform 0.2s;
  font-size: 0.65rem;
}

.zone-toggle-arrow.open {
  transform: rotate(180deg);
}

.zone-explainer-content {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-default);
  border-top: none;
  border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  padding: 12px;
}

.zone-explainer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.zone-explainer-row:last-child {
  margin-bottom: 0;
}

.zone-explainer-badge {
  color: white;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 28px;
  text-align: center;
}

.zone-explainer-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.zone-explainer-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.zone-explainer-hr {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.zone-explainer-desc {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.run-zone-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}

.run-zone-badge {
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.run-zone-badge.active {
  font-weight: 700;
}
```

- [ ] **Step 5: Verify build passes**

```bash
npx vite build
```

- [ ] **Step 6: Commit**

```bash
git add src/data/running.js src/components/activity-cards/RunCard.jsx src/components/activity-cards/ActivityCard.css
git commit -m "feat: add collapsible zone explainer to running card with colored Z1-Z5 info"
```

---

## Chunk 2: My Activities Feature (Tasks 4-5)

### Task 4: "My Activities" Settings Component

Build the main UI component for viewing, editing, adding, and removing activities in Settings.

**Files:**
- Create: `src/components/settings/MyActivities.jsx`
- Modify: `src/pages/SettingsPage.jsx`
- Modify: `src/pages/SettingsPage.css`
- Modify: `src/hooks/useLanguage.jsx`

- [ ] **Step 1: Add all i18n keys**

In `src/hooks/useLanguage.jsx`:

**pt-BR block:**
```js
settings_my_activities: 'Minhas Atividades',
settings_add_activity: 'Adicionar Atividade',
settings_main_activity: 'Principal',
settings_addon_activity: 'Opcional',
settings_per_week: '/sem',
settings_already_added: 'Já adicionado',
settings_remove: 'Remover',
settings_remove_confirm: 'Remover {activity}? Seu plano será atualizado.',
settings_plan_updated: 'Plano atualizado!',
settings_max_days_warning: 'Máximo de 7 dias por semana',
settings_min_main_warning: 'Você precisa de pelo menos uma atividade principal',
```

**en block:**
```js
settings_my_activities: 'My Activities',
settings_add_activity: 'Add Activity',
settings_main_activity: 'Main',
settings_addon_activity: 'Optional',
settings_per_week: '/week',
settings_already_added: 'Already added',
settings_remove: 'Remove',
settings_remove_confirm: 'Remove {activity}? Your plan will be updated.',
settings_plan_updated: 'Plan updated!',
settings_max_days_warning: 'Maximum 7 days per week',
settings_min_main_warning: 'You need at least one main activity',
```

- [ ] **Step 2: Create `src/components/settings/MyActivities.jsx`**

```jsx
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useToast } from '../Toast';
import { BottomSheet } from '../BottomSheet';
import { Icon } from '../Icon';
import { generateWorkoutPlan } from '../../utils/planGenerator';

const MAIN_TYPES = ['gym', 'crossfit', 'calisthenics', 'pilates'];
const ADDON_TYPES = ['running', 'yoga'];
const ALL_TYPES = [...MAIN_TYPES, ...ADDON_TYPES];
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Icon names verified from actual activity cards (RunCard, CrossFitCard, etc.)
const ACTIVITY_META = {
  gym: { icon: 'dumbbell-1', color: '#c8f55a' },
  crossfit: { icon: 'fire-1', color: '#ff6b6b' },
  calisthenics: { icon: 'bolt-alt', color: '#6bcfff' },
  pilates: { icon: 'heart', color: '#c899ff' },
  running: { icon: 'direction-1', color: '#ffc832' },
  yoga: { icon: 'moon-half-right-5', color: '#82dcb4' },
};

const ACTIVITY_NAMES = {
  gym: { 'pt-BR': 'Academia', en: 'Gym' },
  crossfit: { 'pt-BR': 'CrossFit', en: 'CrossFit' },
  calisthenics: { 'pt-BR': 'Calistenia', en: 'Calisthenics' },
  pilates: { 'pt-BR': 'Pilates', en: 'Pilates' },
  running: { 'pt-BR': 'Corrida', en: 'Running' },
  yoga: { 'pt-BR': 'Yoga', en: 'Yoga' },
};

export function MyActivities() {
  const { t, language } = useLanguage();
  const { userProfile, updateProfile } = useOnboarding();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  if (!userProfile) return null;

  const mainActivities = userProfile.mainActivities || ['gym'];
  const addOnActivities = userProfile.addOnActivities || [];
  const trainingDays = userProfile.trainingDays || [];

  // Get all currently active types
  const activeTypes = [...mainActivities, ...addOnActivities.map(a => a.type)];

  const saveAndRegenerate = async (updates) => {
    const merged = { ...userProfile, ...updates };
    await updateProfile(updates);
    const plan = generateWorkoutPlan(merged);
    localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
    toast.success(t('settings_plan_updated'));
  };

  // --- Main activity day toggle ---
  const toggleMainDay = (day) => {
    const current = [...trainingDays];
    const idx = current.indexOf(day);
    if (idx >= 0) {
      if (current.length <= 1) return; // minimum 1 day
      current.splice(idx, 1);
    } else {
      const unique = getUniqueDays();
      if (unique.length >= 7 && !unique.includes(day)) {
        toast.error(t('settings_max_days_warning'));
        return;
      }
      current.push(day);
    }
    saveAndRegenerate({ trainingDays: current });
  };

  // --- Add-on frequency change ---
  const changeAddonFrequency = (type, delta) => {
    const updated = addOnActivities.map(a => {
      if (a.type !== type) return a;
      const newFreq = Math.max(1, Math.min(7, (a.frequency || 1) + delta));
      // Trim days if reducing frequency below current day count
      const days = (a.days || []).slice(0, newFreq);
      return { ...a, frequency: newFreq, days };
    });
    saveAndRegenerate({ addOnActivities: updated });
  };

  // --- Add-on day toggle ---
  const toggleAddonDay = (type, day) => {
    const updated = addOnActivities.map(a => {
      if (a.type !== type) return a;
      const days = a.days ? [...a.days] : [];
      const idx = days.indexOf(day);
      if (idx >= 0) {
        if (days.length <= 1) return a; // minimum 1 day
        days.splice(idx, 1);
      } else {
        if (days.length >= (a.frequency || 1)) return a; // can't exceed frequency
        days.push(day);
      }
      return { ...a, days };
    });
    saveAndRegenerate({ addOnActivities: updated });
  };

  // --- Add activity ---
  const addActivity = (type) => {
    if (activeTypes.includes(type)) return;
    setShowAdd(false);

    if (MAIN_TYPES.includes(type)) {
      saveAndRegenerate({ mainActivities: [...mainActivities, type] });
    } else {
      saveAndRegenerate({
        addOnActivities: [...addOnActivities, { type, frequency: 1, days: [] }],
      });
    }
  };

  // --- Remove activity ---
  const removeActivity = (type) => {
    setConfirmRemove(null);

    if (MAIN_TYPES.includes(type)) {
      if (mainActivities.length <= 1) {
        toast.error(t('settings_min_main_warning'));
        return;
      }
      saveAndRegenerate({ mainActivities: mainActivities.filter(a => a !== type) });
    } else {
      saveAndRegenerate({
        addOnActivities: addOnActivities.filter(a => a.type !== type),
      });
    }
  };

  // Count unique days used
  const getUniqueDays = () => {
    const days = new Set(trainingDays);
    addOnActivities.forEach(a => (a.days || []).forEach(d => days.add(d)));
    return [...days];
  };

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <Icon name="bar-chart-4" className="section-icon" />
        <h2>{t('settings_my_activities')}</h2>
        <button className="activity-add-btn" onClick={() => setShowAdd(true)}>
          + {t('settings_add_activity')}
        </button>
      </div>

      {/* Main activities */}
      {mainActivities.map(type => (
        <div key={type} className="activity-card">
          <div className="activity-card-header">
            <div className="activity-card-info">
              <Icon name={ACTIVITY_META[type]?.icon || 'star-1'} className="activity-card-icon" style={{ color: ACTIVITY_META[type]?.color }} />
              <div>
                <span className="activity-card-name">{ACTIVITY_NAMES[type]?.[language] || type}</span>
                <span className="activity-card-badge main">{t('settings_main_activity')}</span>
              </div>
            </div>
            <div className="activity-card-actions">
              <span className="activity-freq-badge">{trainingDays.length}x{t('settings_per_week')}</span>
              <button className="activity-remove-btn" onClick={() => setConfirmRemove(type)}>
                <Icon name="trash-3" />
              </button>
            </div>
          </div>
          <div className="activity-day-pills">
            {DAYS.map(day => (
              <button
                key={day}
                className={`day-pill ${trainingDays.includes(day) ? 'active' : ''}`}
                style={trainingDays.includes(day) ? { background: ACTIVITY_META[type]?.color + '33', borderColor: ACTIVITY_META[type]?.color, color: ACTIVITY_META[type]?.color } : {}}
                onClick={() => toggleMainDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Add-on activities */}
      {addOnActivities.map(addon => {
        const meta = ACTIVITY_META[addon.type] || {};
        return (
          <div key={addon.type} className="activity-card">
            <div className="activity-card-header">
              <div className="activity-card-info">
                <Icon name={meta.icon || 'star-1'} className="activity-card-icon" style={{ color: meta.color }} />
                <div>
                  <span className="activity-card-name">{ACTIVITY_NAMES[addon.type]?.[language] || addon.type}</span>
                  <span className="activity-card-badge addon">{t('settings_addon_activity')}</span>
                </div>
              </div>
              <div className="activity-card-actions">
                <div className="activity-freq-stepper">
                  <button className="freq-btn" onClick={() => changeAddonFrequency(addon.type, -1)}>−</button>
                  <span className="freq-value">{addon.frequency || 1}x</span>
                  <button className="freq-btn" onClick={() => changeAddonFrequency(addon.type, 1)}>+</button>
                </div>
                <span className="activity-per-week">{t('settings_per_week')}</span>
                <button className="activity-remove-btn" onClick={() => setConfirmRemove(addon.type)}>
                  <Icon name="trash-3" />
                </button>
              </div>
            </div>
            <div className="activity-day-pills">
              {DAYS.map(day => (
                <button
                  key={day}
                  className={`day-pill ${(addon.days || []).includes(day) ? 'active' : ''}`}
                  style={(addon.days || []).includes(day) ? { background: meta.color + '33', borderColor: meta.color, color: meta.color } : {}}
                  onClick={() => toggleAddonDay(addon.type, day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Activity BottomSheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title={t('settings_add_activity')}>
        <div className="add-activity-grid">
          {ALL_TYPES.map(type => {
            const isAdded = activeTypes.includes(type);
            const meta = ACTIVITY_META[type] || {};
            return (
              <button
                key={type}
                className={`add-activity-option ${isAdded ? 'disabled' : ''}`}
                onClick={() => !isAdded && addActivity(type)}
                disabled={isAdded}
              >
                <Icon name={meta.icon || 'star-1'} style={{ color: isAdded ? undefined : meta.color }} />
                <span>{ACTIVITY_NAMES[type]?.[language] || type}</span>
                {isAdded && <span className="add-activity-added">{t('settings_already_added')}</span>}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Remove confirmation modal */}
      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Icon name="warning" /></div>
            <h3>{t('settings_remove')}</h3>
            <p>{t('settings_remove_confirm').replace('{activity}', ACTIVITY_NAMES[confirmRemove]?.[language] || confirmRemove)}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmRemove(null)}>{t('cancel')}</button>
              <button className="btn-confirm" onClick={() => removeActivity(confirmRemove)}>{t('settings_remove')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Add MyActivities to SettingsPage**

In `src/pages/SettingsPage.jsx`:

1. Add import at top:
```js
import { MyActivities } from '../components/settings/MyActivities';
```

2. Add the component after the profile section (after the closing `</section>` of the profile card, before the Theme section):
```jsx
<MyActivities />
```

- [ ] **Step 4: Add CSS for MyActivities**

Add to `src/pages/SettingsPage.css`:

```css
/* ===== My Activities ===== */
.settings-section-header {
  position: relative;
}

.activity-add-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-accent-primary);
  color: var(--color-bg-base);
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.activity-card {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 10px;
}

.activity-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.activity-card-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-card-icon {
  font-size: 1.3rem;
}

.activity-card-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  display: block;
}

.activity-card-badge {
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.activity-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.activity-freq-badge {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.activity-per-week {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.activity-remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  font-size: 0.9rem;
  opacity: 0.6;
}

.activity-remove-btn:hover {
  opacity: 1;
  color: #ef4444;
}

.activity-freq-stepper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.freq-btn {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  -webkit-tap-highlight-color: transparent;
}

.freq-value {
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 24px;
  text-align: center;
  color: var(--color-text-primary);
}

.activity-day-pills {
  display: flex;
  gap: 4px;
}

.day-pill {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-muted);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
}

.day-pill.active {
  font-weight: 700;
}

/* Add Activity BottomSheet */
.add-activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 8px 0;
}

.add-activity-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  -webkit-tap-highlight-color: transparent;
}

.add-activity-option .lni {
  font-size: 1.5rem;
}

.add-activity-option.disabled {
  opacity: 0.4;
  cursor: default;
}

.add-activity-added {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 400;
}
```

- [ ] **Step 5: Verify build passes**

```bash
npx vite build
```

- [ ] **Step 6: Commit**

```bash
git add src/components/settings/MyActivities.jsx src/pages/SettingsPage.jsx src/pages/SettingsPage.css src/hooks/useLanguage.jsx
git commit -m "feat: add My Activities section in Settings for managing sports and frequency"
```

---

### Task 5: Final Integration & Cleanup

Ensure plan regeneration works end-to-end and verify all icons exist.

**Files:**
- Possibly modify: `src/components/settings/MyActivities.jsx` (icon fixes)
- Possibly modify: `src/utils/planGenerator.js` (edge cases)

- [ ] **Step 1: Verify icon names render correctly**

Icon names in Task 4 have been pre-verified from actual activity card components: `dumbbell-1` (GymCard), `fire-1` (CrossFitCard), `bolt-alt` (CalisthenicsCard), `heart` (PilatesCard), `direction-1` (RunCard), `moon-half-right-5` (YogaCard), `trash-3` (AppIcons.delete). Visually confirm they render in the browser.

- [ ] **Step 2: Test the full flow manually**

1. Open the app → Settings → verify "My Activities" section shows current activities
2. Change add-on frequency with +/- → verify toast appears
3. Toggle day pills → verify they update
4. Click "+ Adicionar" → verify BottomSheet opens with available activities
5. Add a new activity → verify it appears in the list
6. Remove an activity → verify confirmation dialog, then removal
7. Go to Dashboard → verify today card shows correct activity (not "rest day" if today has one)
8. Go to Training → verify the plan reflects changes

- [ ] **Step 3: Build and verify**

```bash
npx vite build
```

- [ ] **Step 4: Final commit**

```bash
git add -u
git commit -m "feat: complete Epic 5 — activity management, dashboard fix, and running zones"
```
