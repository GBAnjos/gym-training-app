# Epic 4: Dashboard & Analytics — Design Spec

## Overview

Replace the existing ProgressPage with a premium, Hevy-inspired Dashboard that serves as the app's analytics hub. Single scrollable page with stacked sections covering today's workout, training history, muscle distribution, exercise progression, and body composition — adapted for Vida's multi-sport model (gym, CrossFit, calisthenics, pilates, running, yoga).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page structure | Section-based scroll (Approach A) | Matches app's existing pattern, mobile-first, simple mental model |
| Chart library | Recharts (replaces Chart.js) | More React-idiomatic, lighter, smoother animations, easier to customize |
| History browsing | Calendar view + exercise drill-down | Calendar for "what did I do?", drill-down for "am I getting stronger?" |
| Body heatmap | CSS-colored SVG silhouette | Lightweight, no 3D assets, still looks premium |
| Profile stats migration | Weight target + training days move to Dashboard | They're analytics, not settings — users couldn't find them in Settings |
| ProgressPage | Fully replaced | Dashboard subsumes all existing functionality |
| Hevy inspiration | Heavy reference for Monthly Report, Muscle Distribution, Progression charts | Proven UX patterns, adapted for multi-sport |
| Subscription gating | Everything free for now | Future epic will cap features behind subscription |

## Design Reference

Heavily inspired by [Hevy app](https://www.hevyapp.com/) statistics section:
- Exercise progression chart with image + name + weight over time + filter tabs
- Muscle distribution radar chart (Current vs Previous)
- Body heatmap (front/back silhouette with muscle highlighting)
- Monthly report with bar chart + tab filters (Workouts, Duration, Volume, Sets) + summary cards with delta arrows
- Set count per muscle group table

Key adaptation: Hevy is gym-only. Vida extends all analytics to support CrossFit, Calisthenics, Pilates, Running, and Yoga data.

## Section 1: Hero Header

Always visible at top. Shows today's context and key stats at a glance.

### Layout

```
┌─────────────────────────────────┐
│  Hi, Guilherme     🔥 12 streak │
│  Muscle Gain                    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💪 Push Day (Chest/Tri)  │  │
│  │ 6 exercises · ~55 min    │  │
│  │          [Start →]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 4/5  │ │ 12.4k│ │  3   │   │
│  │ this │ │ vol  │ │ PRs  │   │
│  │ week │ │ (kg) │ │ this │   │
│  │      │ │      │ │ month│   │
│  └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────┘
```

### Components

- **User greeting + streak** — top row. User's first name from profile, flame icon + streak count on the right. Accent color when active, muted when broken (0).
- **Goal badge** — subtle label below name showing current goal (e.g., "Muscle Gain"). Uses secondary text color.
- **Today's workout card** — activity type icon, session name, exercise count, estimated duration. Left border colored by sport color. Tapping navigates to TrainingPage. If rest day, shows "Rest Day" with a calm message.
- **3 mini stat cards** — compact row below the workout card.

### Multi-Sport Adaptation

Today's workout card adapts per activity type:

| Activity | Title | Subtitle |
|----------|-------|----------|
| Gym | "Push Day (Chest/Tri)" | "6 exercises · ~55 min" |
| CrossFit | "AMRAP: Fran" | "3 movements · 12 min cap" |
| Calisthenics | "Upper Body Skills" | "4 progressions" |
| Pilates | "Core Flow" | "8 movements · 30 min" |
| Running | "Zone 2 Run" | "5 km target" |
| Yoga | "Morning Flow" | "6 poses · 20 min" |

Mini stat cards adapt:

| Card | Universal | Gym | CrossFit | Calisthenics | Running | Pilates/Yoga |
|------|-----------|-----|----------|--------------|---------|-------------|
| Card 1 | Sessions this week | — | — | — | — | — |
| Card 2 | — | Volume (kg) | Total rounds | Skills leveled up | Distance (km) | Sessions this month |
| Card 3 | — | PRs this month | PRs this month | PRs this month | Longest streak | Longest streak |

Card 2 shows the **primary activity's** key metric (whichever has more scheduled days) when the user has multiple activities.

### Data Sources

- `vida_user_profile` — name, goal
- `training_days` — streak calculation, weekly count
- `vida_workout_plan` — today's scheduled activity
- `${dayKey}_${exerciseId}` entries — volume calculation, PR detection

## Section 2: Activity Calendar

Monthly calendar showing workout history with sport-colored dots.

### Layout

```
┌─────────────────────────────────┐
│  ← March 2026 →                │
│                                 │
│  D   S   T   Q   Q   S   S    │
│                          1     │
│  2   3   4   5   6   7   8    │
│      🟢  🔴  🟢  🔵  🟢       │
│  9  10  11  12  13  14  15    │
│      🟢  🟣  🟢      🟢       │
│  16  17  18  19  20  ...       │
│      🟢                        │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Ter 4 · CrossFit         │  │
│  │ AMRAP: Fran · 8 rounds   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Behavior

- Small colored dot under each training date — color matches sport via `DESIGN.sportColors` (gym lime, crossfit red, calisthenics blue, pilates purple, running gold, yoga mint)
- Multiple dots if multiple activities on one day
- Tap a date → expands a single summary card below showing: activity type, session name, one key result
- Swipe left/right to change month
- Today highlighted with accent ring
- Days without activity are plain — no "missed" indicators
- Day labels use locale (D/S/T/Q/Q/S/S for pt-BR, S/M/T/W/T/F/S for en)

### Data Sources

- `training_days` — dates with activity
- Per-activity localStorage entries for that date (crossfit, running, gym exercise data, etc.)

## Section 3: Monthly Report

Bar chart with summary stats, inspired by Hevy's monthly report. Shows training volume and trends over time.

### Layout

```
┌─────────────────────────────────┐
│  Monthly Report                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │  ▐  ▐                     │  │
│  │  ▐  ▐     ▐               │  │
│  │  ▐  ▐  ▐  ▐  ▐            │  │
│  │  ▐  ▐  ▐  ▐  ▐  ▐  ▐     │  │
│  │  J  F  M  A  M  J  ...    │  │
│  │                            │  │
│  │ [Workouts] Duration Volume │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │ Workouts │  │ Duration │    │
│  │    18    │  │  14.5h   │    │
│  │  ↑ +3   │  │  ↑ +2.1h │    │
│  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐    │
│  │  Volume  │  │   Sets   │    │
│  │ 24,500kg │  │   312    │    │
│  │  ↑+2.1k  │  │  ↑ +28  │    │
│  └──────────┘  └──────────┘    │
└─────────────────────────────────┘
```

### Behavior

- Recharts bar chart showing last 12 months of data
- Tab filters below chart: **Workouts** (default), **Duration**, **Volume**, **Sets** — each switches the bar chart metric
- 4 summary cards in 2x2 grid: current month value + delta vs previous month
- Delta arrows: green ↑ for improvement, red ↓ for decline (contextual: for weight loss goal, losing weight = green)
- Volume is gym-specific (weight × reps × sets). For non-gym months, shows session count instead.

### Multi-Sport Adaptation

- **Workouts** and **Duration** are universal across all activities
- **Volume** applies to gym only (weight × reps × sets). CrossFit does not store per-movement weight, so it is excluded. For running, this tab switches to "Distance" showing total km. For calisthenics/pilates/yoga, this tab is hidden.
- **Sets** applies to gym only. Hidden for other activities.
- If user has mixed activities, show combined workout count and duration; Volume and Sets show gym-only data with a small label "(gym)"

### Duration Handling

Duration is **not currently persisted** for most activity types. Approach:
- **Running**: actual duration stored in `run_${day}_${date}` entries — use directly
- **CrossFit**: time cap stored in session data — use as duration estimate
- **Gym**: estimate from exercise count × average time per exercise (8 min/exercise as heuristic)
- **Calisthenics/Pilates/Yoga**: estimate from session catalog data (e.g., "30 min" in session definition)

Duration is inherently approximate for non-running activities. Display with "~" prefix (e.g., "~14.5h") to indicate estimates.

### Data Sources

- `training_days` — workout counts per month
- `${dayKey}_${exerciseId}` entries — volume and set calculation (gym). Key format: `${weekdayAbbrev}_${exerciseId}` (e.g., `segunda_supino_reto`)
- `crossfit_${day}_${date}` — CrossFit session data. Key format: `crossfit_${weekdayAbbrev}_${YYYY-MM-DD}` (e.g., `crossfit_Ter_2026-03-19`)
- `run_${day}_${date}` — Running session data with distance, duration, pace
- `calisthenics_${day}_${skillId}_${date}` — Per-skill session data. Note the skillId is part of the key.
- `pilates_${day}_${date}`, `yoga_${day}_${date}` — Session completion data

## Section 4: Muscle Distribution

Radar chart showing muscle group balance + body silhouette heatmap.

### Layout

```
┌─────────────────────────────────┐
│  Muscle Distribution            │
│  [Last 30 days ▼]               │
│                                 │
│       Back                      │
│        ╱╲                       │
│  Legs ╱  ╲ Chest                │
│      ╱ ●● ╲                    │
│      ╲ ●● ╱                    │
│  Arms ╲  ╱ Shoulders            │
│        ╲╱                       │
│       Core                      │
│                                 │
│  ● Current  ● Previous          │
│                                 │
│  ┌─────────────┬─────────────┐  │
│  │  (front)    │   (back)    │  │
│  │  silhouette │  silhouette │  │
│  │  heatmap    │  heatmap    │  │
│  └─────────────┴─────────────┘  │
│                                 │
│  Muscle          Sets           │
│  ─────────────────────          │
│  Chest            48            │
│  Back             42            │
│  Legs             36            │
│  Shoulders        30            │
│  Arms             28            │
│  Core             12            │
└─────────────────────────────────┘
```

### Behavior

- **Radar chart** (Recharts RadarChart): 6 muscle group axes — Back, Chest, Shoulders, Arms, Legs, Core. Two overlaid polygons: current period (lime, filled) and previous period (gray, outline). Shows balance at a glance.
- **Time filter dropdown**: Last 7 days, Last 30 days (default), Last 90 days
- **Body heatmap**: SVG silhouette (front + back view). Each muscle region's opacity/color intensity scales with set count for that period. Uses sport accent colors. Lightweight CSS approach — no 3D models.
- **Set count table**: Simple list of muscle groups sorted by set count, descending. Shows the raw numbers behind the radar chart.

### Muscle Group Mapping

Exercises in `treinos.js` already tag each exercise with `musculos` array using exact capitalized Portuguese strings from `MUSCLE_TRANSLATIONS`. We aggregate these into 6 groups:

| Radar Axis | Includes (exact tag values) |
|------------|----------|
| Chest | `Peito` |
| Back | `Costas`, `Trapézio` |
| Shoulders | `Ombros` |
| Arms | `Bíceps`, `Tríceps` |
| Legs | `Quadríceps`, `Posterior`, `Glúteos`, `Panturrilhas` |
| Core | (no gym exercises currently tagged — seeded from CrossFit/Pilates/Calisthenics mappings, or shows empty if no core data) |

**Note:** The muscle tags use accented characters (e.g., `Tríceps`, `Bíceps`, `Quadríceps`, `Trapézio`, `Glúteos`). The aggregation must match these exact strings. Core has no gym exercises tagged to it currently; it will be populated primarily from Pilates (core focus), CrossFit movements (e.g., sit-ups, toes-to-bar), and Calisthenics skills. If a user only does gym, the Core axis will show 0.

### Multi-Sport Adaptation

- Gym: full muscle tracking from exercise tags
- CrossFit: mapped from WOD movements (e.g., thrusters → legs + shoulders)
- Calisthenics: mapped from skill type (e.g., muscle-up → back + arms)
- Pilates: primarily Core, with some Full Body
- Running: primarily Legs + Core
- Yoga: evenly distributed (flexibility, not strength-focused) — shown as low-intensity across all groups

### Data Sources

- `${dayKey}_${exerciseId}` entries — which exercises were completed
- `treinos.js` exercise catalog — muscle group tags per exercise
- CrossFit/Calisthenics catalogs for movement-to-muscle mapping

## Section 5: Progression

Exercise-specific drill-down showing performance over time. Inspired by Hevy's exercise progression chart.

### Layout

```
┌─────────────────────────────────┐
│  Progression                    │
│                                 │
│  [Gym ·] CrossFit · Run · Cali │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🔍 Search exercise...    │  │
│  └───────────────────────────┘  │
│                                 │
│  Recent: Bench Press · Squat    │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🏋️ Bench Press    PR:80kg│  │
│  │                            │  │
│  │  80 ─            ╱──       │  │
│  │  70 ─      ╱──╱─           │  │
│  │  60 ─ ──╱─                 │  │
│  │     Feb      Mar           │  │
│  │                            │  │
│  │ [Heaviest] 1RM  Volume    │  │
│  │                            │  │
│  │  Last: 78kg · Best: 80kg  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Behavior

- **Activity filter** (segmented control): Only shown if user has multiple trackable activities. Filters: Gym, CrossFit, Running, Calisthenics. Pilates and Yoga are excluded (not progression-based).
- **Search bar**: Filters exercises from the relevant catalog. Type-ahead matching.
- **Recent chips**: Last 3 exercises the user viewed. Persisted in localStorage (`vida_recent_exercises`). Cross-activity (could be "Bench Press · Fran · 5K pace").
- **Progression chart** (Recharts LineChart):
  - Gym: weight over time. Filter tabs: Heaviest Weight (default), One Rep Max (estimated), Volume (weight × reps × sets)
  - CrossFit: rounds/score over time. Filter tabs: Best Score, Average
  - Running: pace (min/km) over time. Auto-selected, no picker needed (one thing to track). Filter tabs: Pace, Distance, Duration
  - Calisthenics: level (1→5) over time. Shows as step chart.
- **Summary line** below chart: Last value + Best/PR value

### Data Sources

- `${dayKey}_${exerciseId}` with `historico` array (gym)
- `crossfit_${day}_${date}` entries (CrossFit)
- `run_${day}_${date}` entries (Running)
- `calisthenics_level_${skillId}` entries (Calisthenics)
- New: `vida_recent_exercises` — array of last 3 viewed exercise IDs

## Section 6: Body Composition

Weight tracking, body fat, and measurements with goal progress.

### Layout

```
┌─────────────────────────────────┐
│  Body                           │
│                                 │
│  ┌──────────┐  ┌──────────┐    │
│  │  72.5 kg │  │  18.2%   │    │
│  │  ▼ 0.3   │  │  ▼ 0.5   │    │
│  │  weight  │  │  body fat │    │
│  └──────────┘  └──────────┘    │
│                                 │
│  72kg ━━━━━━━━━━━━━━━░░░ 68kg  │
│            60% to goal          │
│                                 │
│  ┌───────────────────────────┐  │
│  │  [Weight ·] Body Fat      │  │
│  │  3M · [6M] · 1Y           │  │
│  │                            │  │
│  │  74 ─╲                     │  │
│  │  73 ─  ╲     ╱╲           │  │
│  │  72 ─    ╲╱─    ╲──       │  │
│  │     Jan    Feb    Mar      │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────┐┌───────┐┌───────┐   │
│  │ Arm   ││ Waist ││ Chest │   │
│  │ 36cm  ││ 82cm  ││ 98cm  │   │
│  │ +1cm  ││ -2cm  ││ +0.5  │   │
│  └───────┘└───────┘└───────┘   │
│                                 │
│  [ + Log Measurement ]          │
└─────────────────────────────────┘
```

### Behavior

- **Two highlight cards**: Current weight and body fat with delta from previous entry. Delta color is goal-contextual: weight going down is green if goal is weight_loss, red if goal is muscle_gain.
- **Goal progress bar**: Shows current weight → target weight with percentage. Only shown if user has a weight target set.
- **Chart area**: Recharts AreaChart with gradient fill. Two metric tabs (Weight, Body Fat) and three time range tabs (3M, 6M, 1Y). One chart visible at a time.
- **Measurement cards**: Only shown if user is in advanced body composition mode. Row of cards showing latest value + delta vs previous for each measurement (arm, waist, chest, thigh).
- **Log button**: Opens existing BottomSheet component for adding a new entry. Same flow as current ProgressPage, just triggered from here.

### Data Sources

- `vida_body_composition` — entries with weight, bodyFat, measurements
- `lifeplanner_weightLog` — legacy weight entries (merged with above)
- `vida_user_profile` — currentWeight, targetWeight, goal (for contextual deltas)

## File Structure

```
src/pages/DashboardPage.jsx              — main page component (replaces ProgressPage)
src/pages/DashboardPage.css              — page styles

src/components/dashboard/
  HeroHeader.jsx                         — today's workout + streak + mini stats
  ActivityCalendar.jsx                   — month grid + day detail card
  MonthlyReport.jsx                      — bar chart + tabs + summary cards
  MuscleDistribution.jsx                 — radar chart + body heatmap SVG + set table
  ProgressionChart.jsx                   — exercise picker + line chart with filter tabs
  BodyComposition.jsx                    — weight/body fat charts + measurements + log CTA

src/hooks/useDashboardData.js            — aggregation hook: computes all derived data
src/assets/body-silhouette.svg           — front/back body outline for heatmap
```

## Technical Decisions

### New Dependencies

- `recharts` — all charts (LineChart, AreaChart, BarChart, RadarChart)

### Removed Dependencies

- `chart.js` — replaced by Recharts
- `react-chartjs-2` — replaced by Recharts

### New localStorage Keys

- `vida_recent_exercises` — array of last 3 viewed exercises, each as `{ type: 'gym'|'crossfit'|'running'|'calisthenics', id: string }` to disambiguate across catalogs

### Navigation Changes

- BottomNav: "progress" tab renamed to "dashboard", same icon position
- `App.jsx`: render `DashboardPage` instead of `ProgressPage`

### Removed Files

- `src/pages/ProgressPage.jsx`
- `src/pages/ProgressPage.css`

### Migration: `useProgress.js`

The existing `useProgress.js` hook handles body composition data **mutations** (addBodyCompEntry, addWeight, toggleMode). `useDashboardData.js` is read-only (computes derived analytics). Both hooks coexist:

- `useProgress.js` — survives, used by BodyComposition component for add/edit actions via the BottomSheet
- `useDashboardData.js` — new, read-only aggregation for all dashboard sections

### Data Aggregation Hook (`useDashboardData.js`)

Single hook that computes all derived dashboard data. Components receive computed values, no raw data processing in render.

Computes:
- Streak: counts "training weeks" — a week counts if the user trained at least once. This avoids the problem where rest days (e.g., Mon/Wed/Fri schedule) break a literal consecutive-day streak. Display as "12-week streak" not "12-day streak".
- Weekly session count and target
- Monthly totals (workouts, duration estimate, volume, sets) for current and previous month
- Per-month totals for last 12 months (for bar chart)
- Muscle group set counts for current and previous periods
- PR detection (compare latest weight to historical max per exercise)
- Today's scheduled activity from workout plan

### Body Heatmap Approach

SVG silhouette with `<path>` elements per muscle region. Each path gets an inline style with `opacity` scaled from 0.1 (no sets) to 1.0 (max sets). Color uses the accent primary. No external 3D library — pure CSS + SVG.

The SVG needs to be created as a React component with individually addressable muscle group paths. Use a simplified anatomical outline (not photorealistic). Front view: chest, shoulders, biceps, abs/core, quads. Back view: traps, back/lats, triceps, glutes, hamstrings, calves. Each muscle region is a `<path>` with a `data-muscle` attribute matching the 6 radar group names.

### Performance

- Charts lazy-render as they scroll into viewport (Intersection Observer)
- `useDashboardData` hook memoizes expensive computations
- Monthly report pre-computes on mount, not on every render
- Calendar renders only visible month

## Empty States

Each section needs a clean empty state for new users with no data:

| Section | Empty State |
|---------|-------------|
| Hero Header | Shows greeting + goal badge. Today's workout card still shows (it's from the plan, not history). Mini stats show "0". Streak shows "0 weeks". |
| Activity Calendar | Month grid renders normally. No dots. No detail card. Subtle message: "Complete a workout to see your history here." |
| Monthly Report | Bar chart area shows flat baseline. Summary cards show "0" with no deltas. No error states. |
| Muscle Distribution | Radar chart shows empty hexagon outline. Heatmap silhouettes are fully gray. Set table shows all zeros. |
| Progression | Search bar visible. No recent chips. Message: "Search for an exercise to see your progression." |
| Body Composition | If no entries: highlight cards show "--" instead of numbers. No chart. Goal progress bar still shows if target is set. Log button prominent. |

## Calendar Navigation

Month navigation uses **arrow buttons** (< >) not swipe gestures. This avoids needing a gesture library and keeps interaction simple. Tapping arrows animates the month transition.

## i18n

All user-facing strings added to the translation system in `useLanguage.jsx`:

- Section titles: "Monthly Report" / "Relatório Mensal", "Muscle Distribution" / "Distribuição Muscular", "Progression" / "Progressão", "Body" / "Corpo"
- Tab labels: "Workouts" / "Treinos", "Duration" / "Duração", "Volume" / "Volume", "Sets" / "Séries"
- Time filters: "Last 7 days" / "Últimos 7 dias", "Last 30 days" / "Últimos 30 dias", etc.
- Stats: "this week" / "esta semana", "PRs this month" / "PRs este mês", "streak" / "sequência"
- Calendar: month names, day abbreviations (already in JS locale)
- Deltas: "to goal" / "até a meta"
- Actions: "Log Measurement" / "Registrar Medida", "Search exercise..." / "Buscar exercício..."
- Hero: "Hi, {name}" / "Olá, {name}", "Rest Day" / "Dia de Descanso", "Start" / "Iniciar"
- Empty states: "Complete a workout to see your history here." / "Complete um treino para ver seu histórico aqui.", "Search for an exercise to see your progression." / "Busque um exercício para ver sua progressão."
- Streak: "{n}-week streak" / "sequência de {n} semanas"
- Measurements: reuse existing keys from ProgressPage (braço, cintura, peito, coxa)
