# Epic 4: Dashboard & Analytics Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ProgressPage with a premium, Hevy-inspired Dashboard featuring activity calendar, monthly reports, muscle distribution, exercise progression charts, and body composition tracking — all adapted for Vida's multi-sport model.

**Architecture:** Single scrollable DashboardPage with 6 stacked section components, each receiving computed data from a centralized `useDashboardData` hook. Charts use Recharts. Body heatmap uses inline SVG. Existing `useProgress` hook survives for mutations.

**Tech Stack:** React, Recharts, CSS custom properties (design tokens), localStorage, existing Supabase sync

---

## File Structure

```
NEW FILES:
  src/pages/DashboardPage.jsx              — main page, renders all 6 sections
  src/pages/DashboardPage.css              — page-level + section styles
  src/components/dashboard/HeroHeader.jsx  — greeting, streak, today's workout, mini stats
  src/components/dashboard/ActivityCalendar.jsx — month grid, sport-colored dots, day detail
  src/components/dashboard/MonthlyReport.jsx   — bar chart, metric tabs, summary cards
  src/components/dashboard/MuscleDistribution.jsx — radar chart, body heatmap SVG, set table
  src/components/dashboard/ProgressionChart.jsx   — exercise picker, line chart, filter tabs
  src/components/dashboard/BodyComposition.jsx    — weight/body fat charts, measurements, log CTA
  src/hooks/useDashboardData.js            — read-only aggregation hook
  src/components/dashboard/BodySilhouette.jsx — SVG body outline React component

MODIFIED FILES:
  src/App.jsx                              — swap ProgressPage → DashboardPage
  src/components/BottomNav.jsx             — rename progress tab → dashboard
  src/hooks/useLanguage.jsx                — add ~40 new translation keys
  package.json                             — add recharts, remove chart.js + react-chartjs-2

REMOVED FILES:
  src/pages/ProgressPage.jsx
  src/pages/ProgressPage.css
```

---

## Chunk 1: Foundation

### Task 1: Install Recharts and Remove Chart.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Remove chart.js and react-chartjs-2**

```bash
npm uninstall chart.js react-chartjs-2
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build
```

Note: Build will fail because ProgressPage imports chart.js. That's expected — we'll remove ProgressPage in the next task.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: replace chart.js with recharts"
```

### Task 2: Add Dashboard Translation Keys

**Files:**
- Modify: `src/hooks/useLanguage.jsx`

Add all new translation keys for the Dashboard. Insert them after the existing `progress_*` keys in both language blocks.

- [ ] **Step 1: Add pt-BR translations**

Add these keys to the `'pt-BR'` block (after line ~290):

```javascript
// Dashboard
nav_dashboard: 'Dashboard',
dashboard_greeting: 'Olá',
dashboard_rest_day: 'Dia de Descanso',
dashboard_rest_message: 'Aproveite o descanso, amanhã tem mais!',
dashboard_start: 'Iniciar',
dashboard_sessions_week: 'esta semana',
dashboard_volume: 'volume',
dashboard_prs_month: 'PRs este mês',
dashboard_distance: 'distância',
dashboard_sessions_month: 'este mês',
dashboard_longest_streak: 'maior sequência',
dashboard_skills_up: 'skills up',
dashboard_rounds: 'rounds',
dashboard_week_streak: 'semanas',
dashboard_monthly_report: 'Relatório Mensal',
dashboard_workouts: 'Treinos',
dashboard_duration: 'Duração',
dashboard_sets: 'Séries',
dashboard_muscle_distribution: 'Distribuição Muscular',
dashboard_last_7_days: 'Últimos 7 dias',
dashboard_last_30_days: 'Últimos 30 dias',
dashboard_last_90_days: 'Últimos 90 dias',
dashboard_current: 'Atual',
dashboard_previous: 'Anterior',
dashboard_progression: 'Progressão',
dashboard_search_exercise: 'Buscar exercício...',
dashboard_recent: 'Recentes',
dashboard_heaviest: 'Maior Peso',
dashboard_one_rm: '1RM',
dashboard_best_score: 'Melhor Score',
dashboard_average: 'Média',
dashboard_pace: 'Pace',
dashboard_last: 'Último',
dashboard_best: 'Melhor',
dashboard_body: 'Corpo',
dashboard_body_fat: 'Gordura Corporal',
dashboard_weight: 'Peso',
dashboard_to_goal: 'até a meta',
dashboard_log_measurement: 'Registrar Medida',
dashboard_3m: '3M',
dashboard_6m: '6M',
dashboard_1y: '1A',
dashboard_empty_calendar: 'Complete um treino para ver seu histórico aqui.',
dashboard_empty_progression: 'Busque um exercício para ver sua progressão.',
dashboard_exercises: 'exercícios',
dashboard_movements: 'movimentos',
dashboard_progressions: 'progressões',
dashboard_poses: 'poses',
dashboard_min_cap: 'min cap',
```

- [ ] **Step 2: Add en translations**

Add matching keys to the `'en'` block (after line ~616):

```javascript
// Dashboard
nav_dashboard: 'Dashboard',
dashboard_greeting: 'Hi',
dashboard_rest_day: 'Rest Day',
dashboard_rest_message: 'Enjoy the rest, tomorrow we go again!',
dashboard_start: 'Start',
dashboard_sessions_week: 'this week',
dashboard_volume: 'volume',
dashboard_prs_month: 'PRs this month',
dashboard_distance: 'distance',
dashboard_sessions_month: 'this month',
dashboard_longest_streak: 'longest streak',
dashboard_skills_up: 'skills up',
dashboard_rounds: 'rounds',
dashboard_week_streak: 'weeks',
dashboard_monthly_report: 'Monthly Report',
dashboard_workouts: 'Workouts',
dashboard_duration: 'Duration',
dashboard_sets: 'Sets',
dashboard_muscle_distribution: 'Muscle Distribution',
dashboard_last_7_days: 'Last 7 days',
dashboard_last_30_days: 'Last 30 days',
dashboard_last_90_days: 'Last 90 days',
dashboard_current: 'Current',
dashboard_previous: 'Previous',
dashboard_progression: 'Progression',
dashboard_search_exercise: 'Search exercise...',
dashboard_recent: 'Recent',
dashboard_heaviest: 'Heaviest',
dashboard_one_rm: '1RM',
dashboard_best_score: 'Best Score',
dashboard_average: 'Average',
dashboard_pace: 'Pace',
dashboard_last: 'Last',
dashboard_best: 'Best',
dashboard_body: 'Body',
dashboard_body_fat: 'Body Fat',
dashboard_weight: 'Weight',
dashboard_to_goal: 'to goal',
dashboard_log_measurement: 'Log Measurement',
dashboard_3m: '3M',
dashboard_6m: '6M',
dashboard_1y: '1Y',
dashboard_empty_calendar: 'Complete a workout to see your history here.',
dashboard_empty_progression: 'Search for an exercise to see your progression.',
dashboard_exercises: 'exercises',
dashboard_movements: 'movements',
dashboard_progressions: 'progressions',
dashboard_poses: 'poses',
dashboard_min_cap: 'min cap',
```

- [ ] **Step 3: Verify no syntax errors**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLanguage.jsx
git commit -m "feat: add Dashboard i18n translation keys"
```

### Task 3: Create useDashboardData Hook

**Files:**
- Create: `src/hooks/useDashboardData.js`

This is the core data aggregation hook. All dashboard components consume its output.

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useDashboardData.js` with this implementation:

```javascript
import { useMemo } from 'react';
import { TREINOS, getWorkoutBySplit, getExerciseName } from '../data/treinos';

// Muscle group aggregation mapping (exact accented tags from treinos.js)
const MUSCLE_GROUPS = {
  Chest: ['Peito'],
  Back: ['Costas', 'Trapézio'],
  Shoulders: ['Ombros'],
  Arms: ['Bíceps', 'Tríceps'],
  Legs: ['Quadríceps', 'Posterior', 'Glúteos', 'Panturrilhas'],
  Core: [],  // Seeded from CrossFit/Pilates/Calisthenics
};

// Reverse map: tag → group
const TAG_TO_GROUP = {};
Object.entries(MUSCLE_GROUPS).forEach(([group, tags]) => {
  tags.forEach(tag => { TAG_TO_GROUP[tag] = group; });
});

function getTrainingDays() {
  try {
    return JSON.parse(localStorage.getItem('training_days') || '[]');
  } catch { return []; }
}

function getUserProfile() {
  try {
    return JSON.parse(localStorage.getItem('vida_user_profile') || '{}');
  } catch { return {}; }
}

function getWorkoutPlan() {
  try {
    const raw = localStorage.getItem('vida_workout_plan');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Count training weeks streak (a week counts if trained at least once)
function calculateWeekStreak(trainingDays) {
  if (!trainingDays.length) return 0;

  const sortedDates = [...trainingDays].sort().reverse();
  const now = new Date();

  // Get current week's Monday
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  }

  // Build set of weeks that have training
  const weeksWithTraining = new Set();
  sortedDates.forEach(dateStr => {
    weeksWithTraining.add(getMonday(dateStr));
  });

  // Count consecutive weeks from current week backward
  let streak = 0;
  let checkDate = new Date(now);

  while (true) {
    const monday = getMonday(checkDate);
    if (weeksWithTraining.has(monday)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

// Get today's scheduled activity from workout plan
function getTodayActivity(plan) {
  if (!plan?.dayActivities) return null;

  const dayMap = {
    'domingo': 'Dom', 'segunda': 'Seg', 'terça': 'Ter',
    'quarta': 'Qua', 'quinta': 'Qui', 'sexta': 'Sex', 'sábado': 'Sáb'
  };
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const todayKey = dayMap[today.toLowerCase()];

  return todayKey ? plan.dayActivities[todayKey] || null : null;
}

// Count sessions this week
function getWeeklyCount(trainingDays) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];

  return trainingDays.filter(d => d >= mondayStr).length;
}

// Count sessions for a given month (YYYY-MM)
function getMonthCount(trainingDays, yearMonth) {
  return trainingDays.filter(d => d.startsWith(yearMonth)).length;
}

// Scan localStorage for gym exercise data to compute volume and sets
function computeGymStats(trainingDays) {
  let totalVolume = 0;
  let totalSets = 0;
  const exercisePRs = {}; // exerciseId → max weight

  // Scan all localStorage keys for exercise data
  const allKeys = Object.keys(localStorage);
  const exerciseKeys = allKeys.filter(k => {
    // Match pattern: dayKey_exerciseId (e.g., segunda_supino_reto)
    return k.includes('_') && !k.startsWith('vida_') && !k.startsWith('crossfit_')
      && !k.startsWith('run_') && !k.startsWith('calisthenics_') && !k.startsWith('pilates_')
      && !k.startsWith('yoga_') && !k.startsWith('last_') && !k.startsWith('training_')
      && !k.startsWith('lifeplanner_') && !k.startsWith('meals_') && !k.startsWith('workout_');
  });

  exerciseKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data || !data.feito) return;

      const peso = parseFloat(data.peso) || 0;
      // Extract exerciseId from key (everything after first _)
      const parts = key.split('_');
      const exerciseId = parts.slice(1).join('_');

      if (peso > 0) {
        // Find exercise in catalog for sets/reps
        let series = 3, reps = 10; // defaults
        Object.values(TREINOS).forEach(treino => {
          if (!treino?.exercicios) return;
          const ex = treino.exercicios.find(e => e.id === exerciseId);
          if (ex) {
            series = parseInt(ex.series) || 3;
            reps = parseInt(ex.reps) || 10;
          }
        });

        totalVolume += peso * series * reps;
        totalSets += series;

        // Track PRs
        if (!exercisePRs[exerciseId] || peso > exercisePRs[exerciseId]) {
          exercisePRs[exerciseId] = peso;
        }
      }
    } catch { /* skip invalid entries */ }
  });

  return { totalVolume, totalSets, exercisePRs };
}

// Compute muscle group set counts from completed exercises
function computeMuscleSets(period) {
  const counts = { Chest: 0, Back: 0, Shoulders: 0, Arms: 0, Legs: 0, Core: 0 };
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    // Match gym exercise keys
    if (key.startsWith('vida_') || key.startsWith('crossfit_') || key.startsWith('run_')
      || key.startsWith('calisthenics_') || key.startsWith('pilates_') || key.startsWith('yoga_')
      || key.startsWith('last_') || key.startsWith('training_') || key.startsWith('lifeplanner_')
      || key.startsWith('meals_') || key.startsWith('workout_')) return;

    if (!key.includes('_')) return;

    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data?.feito) return;

      const parts = key.split('_');
      const exerciseId = parts.slice(1).join('_');

      // Find exercise in catalog to get muscle groups
      Object.values(TREINOS).forEach(treino => {
        if (!treino?.exercicios) return;
        const ex = treino.exercicios.find(e => e.id === exerciseId);
        if (ex) {
          const series = parseInt(ex.series) || 3;
          ex.musculos.forEach(muscle => {
            const group = TAG_TO_GROUP[muscle];
            if (group) counts[group] += series;
          });
        }
      });
    } catch { /* skip */ }
  });

  return counts;
}

// Get monthly data for last 12 months
function getMonthlyData(trainingDays) {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = getMonthCount(trainingDays, yearMonth);
    months.push({
      month: yearMonth,
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      workouts: count,
    });
  }

  return months;
}

// Determine primary activity type (whichever has most scheduled days)
function getPrimaryActivity(plan) {
  if (!plan?.dayActivities) return 'gym';

  const typeCounts = {};
  Object.values(plan.dayActivities).forEach(activity => {
    const type = activity.type || 'gym';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'gym';
}

// Get activity types the user has
function getUserActivityTypes(plan) {
  if (!plan?.dayActivities) return ['gym'];
  const types = new Set();
  Object.values(plan.dayActivities).forEach(a => types.add(a.type || 'gym'));
  return [...types];
}

// Get training data for a specific date (for calendar detail)
function getDateActivityData(date, plan) {
  if (!plan?.dayActivities) return null;

  // Find which weekday this date falls on
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const d = new Date(date + 'T12:00:00');
  const weekday = dayMap[d.getDay()];

  const activity = plan.dayActivities[weekday];
  if (!activity) return null;

  // Check for stored data
  const result = { type: activity.type, session: activity.session };

  if (activity.type === 'crossfit') {
    const stored = localStorage.getItem(`crossfit_${weekday}_${date}`);
    if (stored) result.data = JSON.parse(stored);
  } else if (activity.type === 'running') {
    const stored = localStorage.getItem(`run_${weekday}_${date}`);
    if (stored) result.data = JSON.parse(stored);
  }

  return result;
}

export function useDashboardData() {
  return useMemo(() => {
    const trainingDays = getTrainingDays();
    const profile = getUserProfile();
    const plan = getWorkoutPlan();
    const todayActivity = getTodayActivity(plan);
    const primaryActivity = getPrimaryActivity(plan);
    const activityTypes = getUserActivityTypes(plan);

    const weekStreak = calculateWeekStreak(trainingDays);
    const weeklyCount = getWeeklyCount(trainingDays);
    const weeklyTarget = profile.trainingDays?.length || 5;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthCount = getMonthCount(trainingDays, currentMonth);
    const prevMonthCount = getMonthCount(trainingDays, prevMonth);

    const gymStats = computeGymStats(trainingDays);
    const muscleSets = computeMuscleSets('current');
    const monthlyData = getMonthlyData(trainingDays);

    return {
      // Profile
      profile,
      plan,

      // Hero
      todayActivity,
      primaryActivity,
      activityTypes,
      weekStreak,
      weeklyCount,
      weeklyTarget,

      // Monthly
      currentMonthCount,
      prevMonthCount,
      monthlyData,
      gymStats,

      // Muscle
      muscleSets,

      // Calendar
      trainingDays,
      getDateActivityData: (date) => getDateActivityData(date, plan),

      // Utility
      getPrimaryActivity: () => primaryActivity,
    };
  }, []);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDashboardData.js
git commit -m "feat: add useDashboardData aggregation hook"
```

### Task 4: Wire Up DashboardPage Shell and Navigation

**Files:**
- Create: `src/pages/DashboardPage.jsx`
- Create: `src/pages/DashboardPage.css`
- Modify: `src/App.jsx`
- Modify: `src/components/BottomNav.jsx`
- Remove: `src/pages/ProgressPage.jsx`
- Remove: `src/pages/ProgressPage.css`

- [ ] **Step 1: Create DashboardPage shell**

Create `src/pages/DashboardPage.jsx`:

```jsx
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import './DashboardPage.css';

export function DashboardPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const data = useDashboardData();

  return (
    <div className="dashboard-page">
      <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem' }}>
        Dashboard coming soon...
      </p>
    </div>
  );
}
```

Create `src/pages/DashboardPage.css`:

```css
.dashboard-page {
  padding: var(--space-sm);
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 20px));
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 480px) {
  .dashboard-page {
    padding: var(--space-md);
    padding-bottom: calc(100px + env(safe-area-inset-bottom, 20px));
  }
}

/* Section spacing */
.dashboard-section {
  margin-bottom: var(--space-lg);
}

.dashboard-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}
```

- [ ] **Step 2: Update BottomNav**

In `src/components/BottomNav.jsx`, change the NAV_ITEMS array entry:

```javascript
// Change from:
{ id: 'progress', icon: 'bar-chart-4', labelKey: 'nav_progress' },
// To:
{ id: 'dashboard', icon: 'bar-chart-4', labelKey: 'nav_dashboard' },
```

- [ ] **Step 3: Update App.jsx**

In `src/App.jsx`:

Replace the ProgressPage import and case:

```javascript
// Replace import:
// import { ProgressPage } from './pages/ProgressPage';
import { DashboardPage } from './pages/DashboardPage';

// In renderPage() switch, replace:
// case 'progress': return <ProgressPage />;
case 'dashboard': return <DashboardPage />;
```

Also update the default activeTab or any reference to 'progress' with 'dashboard'.

- [ ] **Step 4: Delete old ProgressPage files**

```bash
rm src/pages/ProgressPage.jsx src/pages/ProgressPage.css
```

- [ ] **Step 5: Verify build and app loads**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire DashboardPage shell, replace ProgressPage"
```

---

## Chunk 2: Hero Header + Activity Calendar

### Task 5: HeroHeader Component

**Files:**
- Create: `src/components/dashboard/HeroHeader.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create HeroHeader component**

Create `src/components/dashboard/HeroHeader.jsx`:

```jsx
import { useLanguage } from '../../hooks/useLanguage';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';
import { getWorkoutName, getWorkoutBySplit } from '../../data/treinos';

export function HeroHeader({ data, onNavigateToTraining }) {
  const { t, language } = useLanguage();
  const { profile, todayActivity, weekStreak, weeklyCount, weeklyTarget, primaryActivity, gymStats } = data;

  const firstName = (profile.name || '').split(' ')[0] || '';

  // Goal label
  const goalLabels = {
    muscle_gain: { 'pt-BR': 'Ganho Muscular', en: 'Muscle Gain' },
    weight_loss: { 'pt-BR': 'Perda de Peso', en: 'Weight Loss' },
    maintain: { 'pt-BR': 'Manutenção', en: 'Maintain' },
    general: { 'pt-BR': 'Saúde Geral', en: 'General Health' },
  };
  const goalLabel = goalLabels[profile.goal]?.[language] || '';

  // Today's workout info
  const todayInfo = getTodayInfo(todayActivity, language, t);
  const sportColor = todayActivity ? DESIGN.sportColors[todayActivity.type]?.primary : null;

  // Mini stat cards
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
          <Icon name="fire-1" />
          <span>{weekStreak} {t('dashboard_week_streak')}</span>
        </div>
      </div>

      {/* Today's workout card */}
      {todayInfo ? (
        <button className="hero-today-card" onClick={onNavigateToTraining} style={{ borderLeftColor: sportColor }}>
          <div className="hero-today-info">
            <span className="hero-today-title">{todayInfo.title}</span>
            <span className="hero-today-subtitle">{todayInfo.subtitle}</span>
          </div>
          <span className="hero-today-action">{t('dashboard_start')} →</span>
        </button>
      ) : (
        <div className="hero-today-card rest">
          <div className="hero-today-info">
            <span className="hero-today-title">{t('dashboard_rest_day')}</span>
            <span className="hero-today-subtitle">{t('dashboard_rest_message')}</span>
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

function getTodayInfo(activity, language, t) {
  if (!activity) return null;

  const session = activity.session;
  switch (activity.type) {
    case 'gym': {
      if (!session) return null;
      const workout = getWorkoutBySplit(session.name);
      const exerciseCount = workout?.exercicios?.length || 0;
      const duration = exerciseCount * 8;
      return {
        title: `${session.label}: ${session.name}`,
        subtitle: `${exerciseCount} ${t('dashboard_exercises')} · ~${duration} min`,
      };
    }
    case 'crossfit': {
      const name = session?.name?.[language] || session?.name || 'CrossFit';
      const movements = session?.movements?.length || 0;
      const cap = session?.timeCap || 20;
      return {
        title: name,
        subtitle: `${movements} ${t('dashboard_movements')} · ${cap} ${t('dashboard_min_cap')}`,
      };
    }
    case 'calisthenics': {
      const name = session?.name?.[language] || session?.name || 'Calisthenics';
      const skills = session?.skills?.length || 0;
      return {
        title: name,
        subtitle: `${skills} ${t('dashboard_progressions')}`,
      };
    }
    case 'pilates': {
      const name = session?.name?.[language] || session?.name || 'Pilates';
      const movements = session?.movements?.length || 0;
      return {
        title: name,
        subtitle: `${movements} ${t('dashboard_movements')} · ~30 min`,
      };
    }
    case 'running': {
      const name = session?.name?.[language] || session?.name || 'Running';
      const distance = session?.targetDistance || '';
      return {
        title: name,
        subtitle: distance ? `${distance} km target` : '~30 min',
      };
    }
    case 'yoga': {
      const name = session?.name?.[language] || session?.name || 'Yoga';
      const poses = session?.poses?.length || 0;
      return {
        title: name,
        subtitle: `${poses} ${t('dashboard_poses')} · ~20 min`,
      };
    }
    default:
      return { title: activity.type, subtitle: '' };
  }
}

function getMiniStats(data, language, t) {
  const { weeklyCount, weeklyTarget, primaryActivity, gymStats, currentMonthCount } = data;

  // Card 1: always sessions this week
  const card1 = {
    value: `${weeklyCount}/${weeklyTarget}`,
    label: t('dashboard_sessions_week'),
  };

  // Card 2: depends on primary activity
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

  // Card 3: PRs or streak
  const prCount = Object.keys(gymStats.exercisePRs).length;
  const card3 = ['gym', 'crossfit', 'calisthenics'].includes(primaryActivity)
    ? { value: String(prCount), label: t('dashboard_prs_month') }
    : { value: String(data.weekStreak), label: t('dashboard_longest_streak') };

  return [card1, card2, card3];
}
```

- [ ] **Step 2: Add HeroHeader styles to DashboardPage.css**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Hero Header ===== */
.hero-greeting-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.hero-greeting {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero-goal-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.hero-streak {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.hero-streak.active {
  color: var(--color-accent-primary);
}

.hero-streak .lni {
  font-size: 1rem;
}

/* Today's workout card */
.hero-today-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-left: 3px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-md);
  text-align: left;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
}

.hero-today-card:active {
  transform: scale(0.98);
}

.hero-today-card.rest {
  border-left-color: var(--color-text-muted);
  opacity: 0.7;
}

.hero-today-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-today-title {
  font-size: 1rem;
  font-weight: 700;
}

.hero-today-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.hero-today-action {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent-primary);
  white-space: nowrap;
}

/* Mini stat cards */
.hero-stats-row {
  display: flex;
  gap: var(--space-sm);
}

.hero-stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.hero-stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.hero-stat-label {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 2px;
}
```

- [ ] **Step 3: Integrate HeroHeader into DashboardPage**

Update `src/pages/DashboardPage.jsx`:

```jsx
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import './DashboardPage.css';

export function DashboardPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const data = useDashboardData();

  return (
    <div className="dashboard-page">
      <HeroHeader
        data={data}
        onNavigateToTraining={() => onTabChange?.('training')}
      />
    </div>
  );
}
```

Note: `onTabChange` needs to be passed from `App.jsx`. Update the renderPage case:

```jsx
case 'dashboard': return <DashboardPage onTabChange={setActiveTab} />;
```

- [ ] **Step 4: Verify build and visuals**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add HeroHeader component with greeting, streak, today's workout"
```

### Task 6: ActivityCalendar Component

**Files:**
- Create: `src/components/dashboard/ActivityCalendar.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create ActivityCalendar component**

Create `src/components/dashboard/ActivityCalendar.jsx`:

```jsx
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';

export function ActivityCalendar({ trainingDays, getDateActivityData }) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Day labels
  const dayLabels = language === 'pt-BR'
    ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Month/year label
  const monthLabel = currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Build training days set for fast lookup
  const trainingSet = new Set(trainingDays);

  // Get activity type for a date (simplified — checks plan schedule)
  function getDateDots(dateStr) {
    const activityData = getDateActivityData(dateStr);
    if (!activityData || !trainingSet.has(dateStr)) return [];
    const color = DESIGN.sportColors[activityData.type]?.primary || DESIGN.sportColors.gym.primary;
    return [{ color, type: activityData.type }];
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Selected date detail
  const selectedActivity = selectedDate ? getDateActivityData(selectedDate) : null;

  return (
    <div className="dashboard-section calendar-section">
      {/* Month navigation */}
      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <Icon name="chevron-left" />
        </button>
        <span className="calendar-month-label">
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </span>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <Icon name="chevron-right" />
        </button>
      </div>

      {/* Day labels */}
      <div className="calendar-grid">
        {dayLabels.map((label, i) => (
          <div key={`label-${i}`} className="calendar-day-label">{label}</div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dots = getDateDots(dateStr);

          return (
            <button
              key={dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
            >
              <span className="calendar-day-number">{day}</span>
              {dots.length > 0 && (
                <div className="calendar-dots">
                  {dots.map((dot, j) => (
                    <span key={j} className="calendar-dot" style={{ backgroundColor: dot.color }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date detail */}
      {selectedDate && trainingSet.has(selectedDate) && selectedActivity && (
        <div className="calendar-detail" style={{ borderLeftColor: DESIGN.sportColors[selectedActivity.type]?.primary }}>
          <span className="calendar-detail-date">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString(language, { weekday: 'short', day: 'numeric' })}
            {' · '}
            {selectedActivity.type.charAt(0).toUpperCase() + selectedActivity.type.slice(1)}
          </span>
          <span className="calendar-detail-info">
            {selectedActivity.session?.name?.[language] || selectedActivity.session?.name || selectedActivity.type}
            {selectedActivity.data?.rounds ? ` · ${selectedActivity.data.rounds} rounds` : ''}
            {selectedActivity.data?.distance ? ` · ${selectedActivity.data.distance} km` : ''}
          </span>
        </div>
      )}

      {/* Empty state */}
      {trainingDays.length === 0 && (
        <p className="calendar-empty">{t('dashboard_empty_calendar')}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add calendar styles to DashboardPage.css**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Activity Calendar ===== */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.calendar-nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.calendar-nav-btn:active {
  transform: scale(0.95);
}

.calendar-month-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day-label {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: var(--space-xs) 0;
}

.calendar-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  min-height: 44px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.calendar-cell.empty {
  pointer-events: none;
}

.calendar-cell.today .calendar-day-number {
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-cell.selected {
  background: var(--color-bg-elevated);
}

.calendar-day-number {
  font-size: 0.8rem;
  font-weight: 500;
}

.calendar-dots {
  display: flex;
  gap: 2px;
  margin-top: 2px;
}

.calendar-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

/* Calendar detail card */
.calendar-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-left: 3px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  margin-top: var(--space-sm);
}

.calendar-detail-date {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.calendar-detail-info {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.calendar-empty {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  padding: var(--space-md);
}
```

- [ ] **Step 3: Integrate into DashboardPage**

Add to `src/pages/DashboardPage.jsx`:

```jsx
import { ActivityCalendar } from '../components/dashboard/ActivityCalendar';

// In the return, after HeroHeader:
<ActivityCalendar
  trainingDays={data.trainingDays}
  getDateActivityData={data.getDateActivityData}
/>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ActivityCalendar with sport-colored dots and day detail"
```

---

## Chunk 3: Monthly Report + Muscle Distribution

### Task 7: MonthlyReport Component

**Files:**
- Create: `src/components/dashboard/MonthlyReport.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create MonthlyReport component**

Create `src/components/dashboard/MonthlyReport.jsx`:

```jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';

export function MonthlyReport({ monthlyData, currentMonthCount, prevMonthCount, gymStats }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('workouts');

  const tabs = [
    { key: 'workouts', label: t('dashboard_workouts') },
    { key: 'duration', label: t('dashboard_duration') },
    { key: 'volume', label: t('dashboard_volume') },
    { key: 'sets', label: t('dashboard_sets') },
  ];

  // Chart data based on active tab
  const chartData = monthlyData.map(m => ({
    name: m.label,
    value: activeTab === 'workouts' ? m.workouts
      : activeTab === 'duration' ? m.workouts * 55 / 60 // ~55min per session estimate in hours
      : activeTab === 'volume' ? 0  // TODO: per-month volume requires deeper scan
      : 0,  // TODO: per-month sets
  }));

  // Summary cards
  const workoutDelta = currentMonthCount - prevMonthCount;
  const durationCurrent = (currentMonthCount * 55 / 60).toFixed(1);
  const durationPrev = (prevMonthCount * 55 / 60).toFixed(1);
  const durationDelta = (durationCurrent - durationPrev).toFixed(1);

  const summaryCards = [
    {
      label: t('dashboard_workouts'),
      value: String(currentMonthCount),
      delta: workoutDelta,
      unit: '',
    },
    {
      label: t('dashboard_duration'),
      value: `~${durationCurrent}h`,
      delta: parseFloat(durationDelta),
      unit: 'h',
    },
    {
      label: t('dashboard_volume'),
      value: gymStats.totalVolume > 1000
        ? `${(gymStats.totalVolume / 1000).toFixed(1)}k kg`
        : `${Math.round(gymStats.totalVolume)} kg`,
      delta: 0,
      unit: '',
    },
    {
      label: t('dashboard_sets'),
      value: String(gymStats.totalSets),
      delta: 0,
      unit: '',
    },
  ];

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_monthly_report')}</h3>

      {/* Bar chart */}
      <div className="monthly-chart-container">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill="var(--color-accent-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tab filters */}
      <div className="monthly-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`monthly-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="monthly-summary-grid">
        {summaryCards.map((card, i) => (
          <div key={i} className="monthly-summary-card">
            <span className="monthly-summary-label">{card.label}</span>
            <span className="monthly-summary-value">{card.value}</span>
            {card.delta !== 0 && (
              <span className={`monthly-summary-delta ${card.delta > 0 ? 'positive' : 'negative'}`}>
                {card.delta > 0 ? '↑' : '↓'} {Math.abs(card.delta)}{card.unit}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add monthly report styles**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Monthly Report ===== */
.monthly-chart-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-xs) 0;
  margin-bottom: var(--space-sm);
}

.monthly-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-md);
  overflow-x: auto;
  scrollbar-width: none;
}

.monthly-tabs::-webkit-scrollbar { display: none; }

.monthly-tab {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.monthly-tab.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: var(--color-bg-primary);
}

.monthly-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

.monthly-summary-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.monthly-summary-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.monthly-summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.monthly-summary-delta {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 2px;
}

.monthly-summary-delta.positive { color: var(--color-state-success); }
.monthly-summary-delta.negative { color: var(--color-state-error); }
```

- [ ] **Step 3: Integrate into DashboardPage**

```jsx
import { MonthlyReport } from '../components/dashboard/MonthlyReport';

// After ActivityCalendar:
<MonthlyReport
  monthlyData={data.monthlyData}
  currentMonthCount={data.currentMonthCount}
  prevMonthCount={data.prevMonthCount}
  gymStats={data.gymStats}
/>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add MonthlyReport with bar chart and summary cards"
```

### Task 8: MuscleDistribution Component (Radar + Heatmap)

**Files:**
- Create: `src/components/dashboard/BodySilhouette.jsx`
- Create: `src/components/dashboard/MuscleDistribution.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create BodySilhouette SVG component**

Create `src/components/dashboard/BodySilhouette.jsx`:

This is a simplified anatomical SVG with addressable muscle regions. Each region is a `<path>` that accepts opacity based on set count.

```jsx
export function BodySilhouette({ muscleSets, view = 'front', maxSets }) {
  const getOpacity = (group) => {
    if (!maxSets || maxSets === 0) return 0.08;
    const sets = muscleSets[group] || 0;
    return Math.max(0.08, Math.min(1, sets / maxSets));
  };

  const color = 'var(--color-accent-primary)';

  if (view === 'front') {
    return (
      <svg viewBox="0 0 120 280" className="body-silhouette">
        {/* Head */}
        <ellipse cx="60" cy="22" rx="14" ry="16" fill="var(--color-text-muted)" opacity="0.15" />
        {/* Neck */}
        <rect x="53" y="37" width="14" height="10" rx="3" fill="var(--color-text-muted)" opacity="0.15" />
        {/* Shoulders */}
        <path d="M30,52 Q38,44 53,47 L53,60 L30,60 Z" fill={color} opacity={getOpacity('Shoulders')} />
        <path d="M90,52 Q82,44 67,47 L67,60 L90,60 Z" fill={color} opacity={getOpacity('Shoulders')} />
        {/* Chest */}
        <path d="M40,60 L80,60 L78,90 Q60,95 42,90 Z" fill={color} opacity={getOpacity('Chest')} />
        {/* Core */}
        <path d="M45,90 L75,90 L73,145 Q60,148 47,145 Z" fill={color} opacity={getOpacity('Core')} />
        {/* Biceps */}
        <path d="M25,62 L38,62 L36,105 L23,105 Z" fill={color} opacity={getOpacity('Arms')} />
        <path d="M82,62 L95,62 L97,105 L84,105 Z" fill={color} opacity={getOpacity('Arms')} />
        {/* Forearms */}
        <path d="M22,107 L36,107 L33,150 L19,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
        <path d="M84,107 L98,107 L101,150 L87,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
        {/* Quads */}
        <path d="M42,148 L58,148 L55,215 L38,215 Z" fill={color} opacity={getOpacity('Legs')} />
        <path d="M62,148 L78,148 L82,215 L65,215 Z" fill={color} opacity={getOpacity('Legs')} />
        {/* Calves */}
        <path d="M38,218 L55,218 L53,270 L40,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
        <path d="M65,218 L82,218 L80,270 L67,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
      </svg>
    );
  }

  // Back view
  return (
    <svg viewBox="0 0 120 280" className="body-silhouette">
      {/* Head */}
      <ellipse cx="60" cy="22" rx="14" ry="16" fill="var(--color-text-muted)" opacity="0.15" />
      {/* Neck */}
      <rect x="53" y="37" width="14" height="10" rx="3" fill="var(--color-text-muted)" opacity="0.15" />
      {/* Traps */}
      <path d="M38,47 L53,47 L53,60 L35,60 Z" fill={color} opacity={getOpacity('Back') * 0.8} />
      <path d="M82,47 L67,47 L67,60 L85,60 Z" fill={color} opacity={getOpacity('Back') * 0.8} />
      {/* Back / Lats */}
      <path d="M38,60 L82,60 L80,110 Q60,118 40,110 Z" fill={color} opacity={getOpacity('Back')} />
      {/* Lower back */}
      <path d="M45,110 L75,110 L73,145 Q60,148 47,145 Z" fill={color} opacity={getOpacity('Core') * 0.6} />
      {/* Triceps */}
      <path d="M22,62 L36,62 L34,105 L20,105 Z" fill={color} opacity={getOpacity('Arms')} />
      <path d="M84,62 L98,62 L100,105 L86,105 Z" fill={color} opacity={getOpacity('Arms')} />
      {/* Forearms */}
      <path d="M19,107 L34,107 L31,150 L17,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
      <path d="M86,107 L100,107 L103,150 L89,150 Z" fill="var(--color-text-muted)" opacity="0.12" />
      {/* Glutes */}
      <path d="M42,145 L78,145 L80,175 Q60,180 40,175 Z" fill={color} opacity={getOpacity('Legs') * 0.8} />
      {/* Hamstrings */}
      <path d="M40,178 L57,178 L55,230 L37,230 Z" fill={color} opacity={getOpacity('Legs') * 0.9} />
      <path d="M63,178 L80,178 L83,230 L65,230 Z" fill={color} opacity={getOpacity('Legs') * 0.9} />
      {/* Calves */}
      <path d="M37,233 L55,233 L53,270 L40,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
      <path d="M65,233 L83,233 L80,270 L67,270 Z" fill={color} opacity={getOpacity('Legs') * 0.7} />
    </svg>
  );
}
```

- [ ] **Step 2: Create MuscleDistribution component**

Create `src/components/dashboard/MuscleDistribution.jsx`:

```jsx
import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { BodySilhouette } from './BodySilhouette';

const GROUP_LABELS = {
  'pt-BR': { Chest: 'Peito', Back: 'Costas', Shoulders: 'Ombros', Arms: 'Braços', Legs: 'Pernas', Core: 'Core' },
  'en': { Chest: 'Chest', Back: 'Back', Shoulders: 'Shoulders', Arms: 'Arms', Legs: 'Legs', Core: 'Core' },
};

export function MuscleDistribution({ muscleSets }) {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState('30');

  const labels = GROUP_LABELS[language] || GROUP_LABELS['en'];
  const groups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
  const maxSets = Math.max(...groups.map(g => muscleSets[g] || 0), 1);

  const radarData = groups.map(g => ({
    subject: labels[g],
    current: muscleSets[g] || 0,
    fullMark: maxSets,
  }));

  // Sort for set count table
  const sortedGroups = [...groups].sort((a, b) => (muscleSets[b] || 0) - (muscleSets[a] || 0));

  const periods = [
    { key: '7', label: t('dashboard_last_7_days') },
    { key: '30', label: t('dashboard_last_30_days') },
    { key: '90', label: t('dashboard_last_90_days') },
  ];

  return (
    <div className="dashboard-section">
      <div className="muscle-header">
        <h3 className="dashboard-section-title">{t('dashboard_muscle_distribution')}</h3>
        <select
          className="muscle-period-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {periods.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Radar chart */}
      <div className="muscle-radar-container">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--color-border-default)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
            />
            <Radar
              name={t('dashboard_current')}
              dataKey="current"
              stroke="var(--color-accent-primary)"
              fill="var(--color-accent-primary)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Body heatmap */}
      <div className="muscle-heatmap">
        <BodySilhouette muscleSets={muscleSets} view="front" maxSets={maxSets} />
        <BodySilhouette muscleSets={muscleSets} view="back" maxSets={maxSets} />
      </div>

      {/* Set count table */}
      <div className="muscle-table">
        {sortedGroups.map(group => (
          <div key={group} className="muscle-table-row">
            <span className="muscle-table-name">{labels[group]}</span>
            <span className="muscle-table-count">{muscleSets[group] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add muscle distribution styles**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Muscle Distribution ===== */
.muscle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.muscle-header .dashboard-section-title {
  margin-bottom: 0;
}

.muscle-period-select {
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.muscle-radar-container {
  margin: var(--space-md) 0;
}

.muscle-heatmap {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-md) 0;
}

.body-silhouette {
  width: 100px;
  height: auto;
}

.muscle-table {
  margin-top: var(--space-md);
}

.muscle-table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-default);
}

.muscle-table-row:last-child {
  border-bottom: none;
}

.muscle-table-name {
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.muscle-table-count {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 4: Integrate into DashboardPage**

```jsx
import { MuscleDistribution } from '../components/dashboard/MuscleDistribution';

// After MonthlyReport:
<MuscleDistribution muscleSets={data.muscleSets} />
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add MuscleDistribution with radar chart and body heatmap"
```

---

## Chunk 4: Progression + Body Composition

### Task 9: ProgressionChart Component

**Files:**
- Create: `src/components/dashboard/ProgressionChart.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create ProgressionChart component**

Create `src/components/dashboard/ProgressionChart.jsx`:

```jsx
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { TREINOS, EXERCISE_TRANSLATIONS, getExerciseName } from '../../data/treinos';
import { Icon } from '../Icon';

// Build flat exercise list from all workouts
function getAllExercises() {
  const exercises = new Map();
  Object.values(TREINOS).forEach(treino => {
    if (!treino?.exercicios) return;
    treino.exercicios.forEach(ex => {
      if (!exercises.has(ex.id)) {
        exercises.set(ex.id, ex);
      }
    });
  });
  return [...exercises.values()];
}

// Get exercise weight history from localStorage
function getExerciseHistory(exerciseId) {
  const history = [];
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    if (!key.endsWith(`_${exerciseId}`)) return;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.historico) {
        data.historico.forEach(entry => {
          if (entry.peso && parseFloat(entry.peso) > 0) {
            history.push({
              date: entry.data,
              weight: parseFloat(entry.peso),
            });
          }
        });
      }
    } catch { /* skip */ }
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

export function ProgressionChart({ activityTypes }) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('heaviest');

  const allExercises = useMemo(() => getAllExercises(), []);

  // Filter exercises by search
  const filteredExercises = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allExercises.filter(ex => {
      const name = getExerciseName(ex.id, language).toLowerCase();
      return name.includes(q);
    }).slice(0, 5);
  }, [searchQuery, language, allExercises]);

  // Get recent exercises from localStorage
  const recentExercises = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('vida_recent_exercises') || '[]');
    } catch { return []; }
  }, []);

  // History for selected exercise
  const history = useMemo(() => {
    if (!selectedExercise) return [];
    return getExerciseHistory(selectedExercise.id);
  }, [selectedExercise]);

  const chartData = history.map(h => ({
    date: h.date.slice(5), // MM-DD format
    value: h.weight,
  }));

  const lastValue = history.length > 0 ? history[history.length - 1].weight : 0;
  const bestValue = history.length > 0 ? Math.max(...history.map(h => h.weight)) : 0;

  const selectExercise = (ex) => {
    setSelectedExercise(ex);
    setSearchQuery('');

    // Update recent exercises
    try {
      let recent = JSON.parse(localStorage.getItem('vida_recent_exercises') || '[]');
      recent = recent.filter(r => r.id !== ex.id);
      recent.unshift({ type: 'gym', id: ex.id });
      if (recent.length > 3) recent = recent.slice(0, 3);
      localStorage.setItem('vida_recent_exercises', JSON.stringify(recent));
    } catch { /* skip */ }
  };

  const tabs = [
    { key: 'heaviest', label: t('dashboard_heaviest') },
    { key: '1rm', label: t('dashboard_one_rm') },
    { key: 'volume', label: t('dashboard_volume') },
  ];

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_progression')}</h3>

      {/* Search bar */}
      <div className="progression-search">
        <Icon name="search-1" className="progression-search-icon" />
        <input
          type="text"
          className="progression-search-input"
          placeholder={t('dashboard_search_exercise')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search results dropdown */}
      {filteredExercises.length > 0 && (
        <div className="progression-results">
          {filteredExercises.map(ex => (
            <button
              key={ex.id}
              className="progression-result-item"
              onClick={() => selectExercise(ex)}
            >
              {getExerciseName(ex.id, language)}
            </button>
          ))}
        </div>
      )}

      {/* Recent chips */}
      {!selectedExercise && recentExercises.length > 0 && (
        <div className="progression-recent">
          <span className="progression-recent-label">{t('dashboard_recent')}:</span>
          {recentExercises.map((r, i) => (
            <button
              key={i}
              className="progression-recent-chip"
              onClick={() => {
                const ex = allExercises.find(e => e.id === r.id);
                if (ex) selectExercise(ex);
              }}
            >
              {getExerciseName(r.id, language)}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!selectedExercise && recentExercises.length === 0 && (
        <p className="progression-empty">{t('dashboard_empty_progression')}</p>
      )}

      {/* Chart */}
      {selectedExercise && (
        <div className="progression-chart-card">
          <div className="progression-chart-header">
            <span className="progression-chart-name">{getExerciseName(selectedExercise.id, language)}</span>
            {bestValue > 0 && <span className="progression-chart-pr">PR: {bestValue}kg</span>}
          </div>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-accent-primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent-primary)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="progression-no-data" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
              {language === 'pt-BR' ? 'Dados insuficientes para o gráfico' : 'Not enough data for chart'}
            </p>
          )}

          {/* Tab filters */}
          <div className="monthly-tabs" style={{ marginTop: 'var(--space-sm)' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`monthly-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary line */}
          <div className="progression-summary">
            <span>{t('dashboard_last')}: <strong>{lastValue}kg</strong></span>
            <span>{t('dashboard_best')}: <strong>{bestValue}kg</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add progression styles**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Progression ===== */
.progression-search {
  position: relative;
  margin-bottom: var(--space-sm);
}

.progression-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.progression-search-input {
  width: 100%;
  padding: var(--space-sm) var(--space-sm) var(--space-sm) 36px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  min-height: 44px;
}

.progression-results {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-sm);
  overflow: hidden;
}

.progression-result-item {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  background: transparent;
  border-bottom: 1px solid var(--color-border-default);
  transition: background var(--transition-fast);
}

.progression-result-item:last-child { border-bottom: none; }
.progression-result-item:active { background: var(--color-bg-elevated); }

.progression-recent {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin-bottom: var(--space-md);
}

.progression-recent-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.progression-recent-chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  color: var(--color-text-secondary);
}

.progression-empty {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  padding: var(--space-lg);
}

.progression-chart-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.progression-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.progression-chart-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.progression-chart-pr {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent-primary);
}

.progression-summary {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-sm);
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.progression-summary strong {
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: Integrate into DashboardPage**

```jsx
import { ProgressionChart } from '../components/dashboard/ProgressionChart';

// After MuscleDistribution:
<ProgressionChart activityTypes={data.activityTypes} />
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add ProgressionChart with exercise search and weight history"
```

### Task 10: BodyComposition Component

**Files:**
- Create: `src/components/dashboard/BodyComposition.jsx`
- Modify: `src/pages/DashboardPage.jsx`
- Modify: `src/pages/DashboardPage.css`

- [ ] **Step 1: Create BodyComposition component**

Create `src/components/dashboard/BodyComposition.jsx`:

```jsx
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { useProgress } from '../../hooks/useProgress';
import { BottomSheet } from '../BottomSheet';
import { useToast } from '../Toast';

export function BodyComposition({ profile }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const {
    weightLog, addWeight, mode, toggleMode,
    addBodyCompEntry, latestEntry, measurementDeltas, bodyFatHistory
  } = useProgress();

  const [metricTab, setMetricTab] = useState('weight');
  const [rangeTab, setRangeTab] = useState('6m');
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [formData, setFormData] = useState({
    weight: '', bodyFat: '', braco: '', cintura: '', peito: '', coxa: ''
  });

  // Filter data by range
  const getRangeMonths = () => ({ '3m': 3, '6m': 6, '1y': 12 }[rangeTab] || 6);
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - getRangeMonths());
  const cutoff = cutoffDate.toISOString().split('T')[0];

  const weightData = weightLog
    .filter(e => e.date >= cutoff)
    .map(e => ({ date: e.date.slice(5), value: parseFloat(e.weight) }));

  const fatData = bodyFatHistory
    .filter(e => e.date >= cutoff)
    .map(e => ({ date: e.date.slice(5), value: e.value }));

  const chartData = metricTab === 'weight' ? weightData : fatData;
  const chartColor = metricTab === 'weight' ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)';

  // Current values and deltas
  const currentWeight = latestEntry?.weight || profile.currentWeight || '--';
  const currentFat = latestEntry?.bodyFat || '--';
  const prevWeight = weightLog.length >= 2 ? parseFloat(weightLog[weightLog.length - 2]?.weight) : null;
  const weightDelta = prevWeight && currentWeight !== '--' ? (parseFloat(currentWeight) - prevWeight).toFixed(1) : null;

  // Goal progress
  const goalProgress = profile.currentWeight && profile.targetWeight
    ? Math.min(100, Math.max(0, Math.round(
        Math.abs(parseFloat(currentWeight) - profile.currentWeight) /
        Math.abs(profile.targetWeight - profile.currentWeight) * 100
      ))) : null;

  // Delta color based on goal
  const getDeltaClass = (delta) => {
    if (!delta || delta === 0) return '';
    if (profile.goal === 'weight_loss') return delta < 0 ? 'positive' : 'negative';
    if (profile.goal === 'muscle_gain') return delta > 0 ? 'positive' : 'negative';
    return '';
  };

  // Measurement cards
  const measurements = latestEntry?.measurements || {};
  const measurementKeys = [
    { key: 'braco', label: language === 'pt-BR' ? 'Braço' : 'Arm' },
    { key: 'cintura', label: language === 'pt-BR' ? 'Cintura' : 'Waist' },
    { key: 'peito', label: language === 'pt-BR' ? 'Peito' : 'Chest' },
    { key: 'coxa', label: language === 'pt-BR' ? 'Coxa' : 'Thigh' },
  ];

  const handleSubmit = () => {
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) return;

    if (mode === 'advanced') {
      addBodyCompEntry({
        weight,
        bodyFat: parseFloat(formData.bodyFat) || null,
        measurements: {
          braco: parseFloat(formData.braco) || null,
          cintura: parseFloat(formData.cintura) || null,
          peito: parseFloat(formData.peito) || null,
          coxa: parseFloat(formData.coxa) || null,
        }
      });
    } else {
      addWeight(weight);
    }

    setFormData({ weight: '', bodyFat: '', braco: '', cintura: '', peito: '', coxa: '' });
    setShowLogSheet(false);
    toast.success(language === 'pt-BR' ? 'Medida registrada!' : 'Measurement logged!');
  };

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_body')}</h3>

      {/* Highlight cards */}
      <div className="body-highlights">
        <div className="body-highlight-card">
          <span className="body-highlight-value">{currentWeight}{currentWeight !== '--' ? ' kg' : ''}</span>
          {weightDelta && (
            <span className={`body-highlight-delta ${getDeltaClass(parseFloat(weightDelta))}`}>
              {parseFloat(weightDelta) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(weightDelta))}
            </span>
          )}
          <span className="body-highlight-label">{t('dashboard_weight').toLowerCase()}</span>
        </div>
        <div className="body-highlight-card">
          <span className="body-highlight-value">{currentFat}{currentFat !== '--' ? '%' : ''}</span>
          <span className="body-highlight-label">{t('dashboard_body_fat').toLowerCase()}</span>
        </div>
      </div>

      {/* Goal progress bar */}
      {goalProgress !== null && (
        <div className="body-goal-bar">
          <div className="body-goal-labels">
            <span>{profile.currentWeight}kg</span>
            <span>{goalProgress}% {t('dashboard_to_goal')}</span>
            <span>{profile.targetWeight}kg</span>
          </div>
          <div className="body-goal-track">
            <div className="body-goal-fill" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="body-chart-card">
          {/* Metric tabs */}
          <div className="body-chart-tabs">
            <button className={`monthly-tab ${metricTab === 'weight' ? 'active' : ''}`} onClick={() => setMetricTab('weight')}>
              {t('dashboard_weight')}
            </button>
            <button className={`monthly-tab ${metricTab === 'fat' ? 'active' : ''}`} onClick={() => setMetricTab('fat')}>
              {t('dashboard_body_fat')}
            </button>
            <span className="body-chart-spacer" />
            {['3m', '6m', '1y'].map(r => (
              <button key={r} className={`monthly-tab ${rangeTab === r ? 'active' : ''}`} onClick={() => setRangeTab(r)}>
                {t(`dashboard_${r}`)}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={35}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                fill="url(#bodyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Measurement cards (advanced mode only) */}
      {mode === 'advanced' && (
        <div className="body-measurements">
          {measurementKeys.map(({ key, label }) => {
            const value = measurements[key];
            const delta = measurementDeltas?.[key];
            return (
              <div key={key} className="body-measurement-card">
                <span className="body-measurement-label">{label}</span>
                <span className="body-measurement-value">{value ? `${value}cm` : '--'}</span>
                {delta && delta !== 0 && (
                  <span className={`body-measurement-delta ${delta > 0 ? 'positive' : 'negative'}`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Log button */}
      <button className="body-log-btn" onClick={() => setShowLogSheet(true)}>
        + {t('dashboard_log_measurement')}
      </button>

      {/* Log measurement bottom sheet */}
      {showLogSheet && (
        <BottomSheet onClose={() => setShowLogSheet(false)}>
          <div className="body-log-form">
            <h3>{t('dashboard_log_measurement')}</h3>

            <div className="body-log-field">
              <label>{t('dashboard_weight')} (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="0.0"
              />
            </div>

            {mode === 'advanced' && (
              <>
                <div className="body-log-field">
                  <label>{t('dashboard_body_fat')} (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
                {measurementKeys.map(({ key, label }) => (
                  <div key={key} className="body-log-field">
                    <label>{label} (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>
                ))}
              </>
            )}

            <button className="body-log-submit" onClick={handleSubmit}>
              {t('continue')}
            </button>

            <button className="body-mode-toggle" onClick={toggleMode}>
              {mode === 'basic' ? t('progress_mode_advanced') : t('progress_mode_basic')}
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add body composition styles**

Append to `src/pages/DashboardPage.css`:

```css
/* ===== Body Composition ===== */
.body-highlights {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.body-highlight-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.body-highlight-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.body-highlight-delta {
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 2px;
}

.body-highlight-delta.positive { color: var(--color-state-success); }
.body-highlight-delta.negative { color: var(--color-state-error); }

.body-highlight-label {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Goal progress bar */
.body-goal-bar {
  margin-bottom: var(--space-md);
}

.body-goal-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.body-goal-track {
  height: 6px;
  background: var(--color-bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.body-goal-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-primary-hover));
  border-radius: 3px;
  transition: width var(--transition-normal);
}

/* Chart card */
.body-chart-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-sm);
  margin-bottom: var(--space-md);
}

.body-chart-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
}

.body-chart-spacer {
  flex: 1;
}

/* Measurements */
.body-measurements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.body-measurement-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
}

.body-measurement-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.body-measurement-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 2px 0;
}

.body-measurement-delta {
  font-size: 0.7rem;
  font-weight: 600;
}

.body-measurement-delta.positive { color: var(--color-state-success); }
.body-measurement-delta.negative { color: var(--color-state-error); }

/* Log button */
.body-log-btn {
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.body-log-btn:active {
  background: var(--color-bg-elevated);
}

/* Log form */
.body-log-form {
  padding: var(--space-md);
}

.body-log-form h3 {
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.body-log-field {
  margin-bottom: var(--space-md);
}

.body-log-field label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.body-log-field input {
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 1rem;
  text-align: center;
  min-height: 44px;
}

.body-log-submit {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-bg-primary);
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.body-mode-toggle {
  width: 100%;
  padding: var(--space-sm);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  text-decoration: underline;
}
```

- [ ] **Step 3: Integrate into DashboardPage**

```jsx
import { BodyComposition } from '../components/dashboard/BodyComposition';

// After ProgressionChart:
<BodyComposition profile={data.profile} />
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add BodyComposition with charts, measurements, and log sheet"
```

---

## Chunk 5: Final Assembly + Polish

### Task 11: Assemble Final DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.jsx`

- [ ] **Step 1: Write final DashboardPage with all sections**

Update `src/pages/DashboardPage.jsx` to its final form with all 6 sections:

```jsx
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { useDashboardData } from '../hooks/useDashboardData';
import { HeroHeader } from '../components/dashboard/HeroHeader';
import { ActivityCalendar } from '../components/dashboard/ActivityCalendar';
import { MonthlyReport } from '../components/dashboard/MonthlyReport';
import { MuscleDistribution } from '../components/dashboard/MuscleDistribution';
import { ProgressionChart } from '../components/dashboard/ProgressionChart';
import { BodyComposition } from '../components/dashboard/BodyComposition';
import './DashboardPage.css';

export function DashboardPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const data = useDashboardData();

  return (
    <div className="dashboard-page">
      <HeroHeader
        data={data}
        onNavigateToTraining={() => onTabChange?.('training')}
      />

      <ActivityCalendar
        trainingDays={data.trainingDays}
        getDateActivityData={data.getDateActivityData}
      />

      <MonthlyReport
        monthlyData={data.monthlyData}
        currentMonthCount={data.currentMonthCount}
        prevMonthCount={data.prevMonthCount}
        gymStats={data.gymStats}
      />

      <MuscleDistribution muscleSets={data.muscleSets} />

      <ProgressionChart activityTypes={data.activityTypes} />

      <BodyComposition profile={data.profile} />
    </div>
  );
}
```

- [ ] **Step 2: Verify final build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/DashboardPage.jsx
git commit -m "feat: assemble final DashboardPage with all 6 sections"
```

### Task 12: Visual Polish and Deploy

**Files:**
- Modify: `src/pages/DashboardPage.css` (tweaks)

- [ ] **Step 1: Run local dev server and test all sections visually**

```bash
npm run dev
```

Test checklist:
- Hero header renders with name, streak, today's workout
- Calendar shows month grid with navigation arrows
- Monthly report bar chart renders
- Muscle distribution radar chart renders with body silhouettes
- Progression search works and shows exercise chart
- Body composition shows weight/body fat cards and chart
- Log measurement bottom sheet opens and submits
- All sections have proper empty states when no data

- [ ] **Step 2: Build for production**

```bash
npm run build
```

- [ ] **Step 3: Deploy**

```bash
git push origin main
```

- [ ] **Step 4: Commit any final tweaks**

```bash
git add -A
git commit -m "style: polish Dashboard layout and responsive spacing"
```
