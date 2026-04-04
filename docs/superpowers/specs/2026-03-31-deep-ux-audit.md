# Deep UX Audit — Vida App

**Date:** 2026-03-31
**Scope:** Full app UX review based on user testing feedback, Hevy competitive analysis, and codebase audit

---

## Executive Summary

Vida has solid bones — 512 exercises, real science (volume landmarks, RPE, progressive overload), 6 modalities, bilingual support, diet builder, import system. But the UX undermines the substance. Users can't find profile (90% failure rate), the training generator ignores time constraints, the schedule page is confusing, and non-gym modalities feel like afterthoughts despite having real content behind them.

**Core problem:** The app has depth but fails to surface it clearly.

---

## 1. Schedule/Routine Page — CRITICAL

### Current State
- Vertical timeline with CSS Grid: `42px | 18px | 1fr` (time | connector dots | content)
- 8-12 static time blocks per day from hardcoded `SCHEDULE` constant
- Long-press to toggle office/home (undiscoverable — no affordance)
- Approximate times (`~HH:MM`) unexplained
- Read-only — users can't customize anything
- **Not connected to actual training plan data** — schedule shows generic "Gym" blocks regardless of what the user's workout plan says

### Problems
1. **Information overload with zero actionability** — Users see 10+ time blocks they can't edit, modify, or interact with. It's a static poster, not a tool.
2. **No "Today" focus** — Users must find today in the day tabs. No visual distinction for current day.
3. **Timeline metaphor is wrong** — A vertical timeline with dots/connectors implies sequential progression, but a daily schedule is about blocks of time. The connector lines add visual noise without meaning.
4. **Training plan disconnect** — User builds a PPL split but schedule still shows generic "Gym" with no exercise detail. The two features exist in parallel universes.
5. **Office/home toggle is hidden** — Long-press is an expert gesture. No onboarding, no hint, no visual affordance. Max 2 office days enforced silently.
6. **No customization** — Can't change wake time, meal times, add blocks. The schedule is prescribed, not personalized.

### Recommendation
**Kill the timeline. Replace with "Today" card view.**

The schedule should answer one question: "What do I do next?" Show today's plan as a stack of cards — workout card (linked to actual plan), meals card (linked to diet), and time blocks for context. Make it actionable: tap workout card → goes to training, tap meal card → goes to meals.

The day tabs stay but today is auto-selected and visually distinct. Past days show completion status. Future days show what's planned.

---

## 2. Meals/Diet Page — MODERATE

### Current State
- **Without custom diet:** Static meal plan with accordion cards, progress bar, macros panel
- **With custom diet:** Food check-off list grouped by meal, consumed vs target macros
- Action row: "Create My Diet" + "Import Diet" buttons

### Problems
1. **Accordion expansion not obvious** — Small chevron arrow is the only affordance. Cards look complete/closed by default. Users don't know there's more content inside.
2. **Check circle too subtle** — 32px dashed circle at 40% opacity. On mobile, it's hard to tap and hard to see. The dashed border doesn't communicate "tap me."
3. **Default meal plan is generic** — Shows hardcoded meals from `MEAL_PLAN` constant with no connection to user's goals/profile. It's filler content.
4. **Macro display is cramped** — 2-column grid on mobile for 4 macro items. Labels at 0.65rem are hard to read.
5. **No visual feedback on food quantities** — "200g chicken · 250 cal · 35g P" is a wall of text in mono font at 0.7rem. Hard to parse at a glance.

### Recommendation
- **Remove accordion** — Show all meal foods directly. Use a compact list view where each food is always visible.
- **Bigger, bolder check circles** — 40px minimum, solid border (not dashed), higher opacity. Use a filled checkmark that's satisfying to tap.
- **Separate macro bars** — Instead of cramming 4 macros in a grid, show them as horizontal progress bars (consumed / target) stacked vertically. Much more readable.
- **Kill the default meal plan** — If user hasn't created a diet, show an empty state with a clear CTA to create or import one. The generic plan adds noise without value.

---

## 3. Training Generator — CRITICAL

### Current State
The `advancedPlanGenerator.js` uses science-based principles:
- Volume landmarks (MEV → MRV) from ACSM + Renaissance Periodization
- RPE targets per exercise type
- Compound-first ordering
- Progressive overload models (linear, double progression, DUP)

**But the time budgeting is completely broken:**
```javascript
maxExercises = Math.floor(duration / 5)  // 45 min → 9 exercises
```
This assumes 5 minutes per exercise regardless of sets, reps, or rest. A 4×8 barbell squat with 3-min rest takes ~15 minutes. The generator routinely produces 75+ minute workouts for 45-minute slots.

### Hevy's Approach (from their guides)
- **6 exercises per session**, always
- **3 sets each** (18 total sets)
- **Compound-first** ordering (heavy → secondary → isolation)
- **Rep ranges:** 6-10 (compounds) → 10-12 (secondary) → 12-15 (isolation)
- **Rest:** 2-3 min (compounds), 1:30-2 min (isolation)
- **Volume:** 10-20 sets/muscle/week distributed across sessions
- **Time estimate:** ~60 min for 6 exercises × 3 sets

### Realistic Time Model
```
Time per exercise = (sets × (time_per_set + rest_between_sets)) + transition_time

Compound (4×8, 2.5 min rest): 4 × (0.75 + 2.5) + 0.5 = 13.5 min
Secondary (3×10, 1.5 min rest): 3 × (0.75 + 1.5) + 0.5 = 7.25 min
Isolation (3×12, 1 min rest): 3 × (0.5 + 1.0) + 0.5 = 5.0 min

Typical 6-exercise session:
2 compound (27 min) + 2 secondary (14.5 min) + 2 isolation (10 min) = ~52 min
+ 5 min warmup = ~57 min
```

### Recommendation
**Replace `Math.floor(duration / 5)` with proper time budgeting:**

1. Start with warmup allocation (5 min)
2. Calculate available training time = `duration - 5`
3. Fill exercises using per-exercise time estimates based on:
   - Exercise type (compound/isolation)
   - Sets × (set_duration + rest_duration)
   - Transition time (~30s)
4. Stop adding exercises when time budget runs out
5. For short sessions (30 min): 4 exercises, supersets allowed
6. For medium sessions (45 min): 5 exercises, standard rest
7. For long sessions (60+ min): 6 exercises, full rest

**Also fix:**
- Programs (24 in `programs.js`) are metadata-only shells with no exercise lists. Either populate them or remove them. Currently they're misleading — user clicks "PPL 6-Day" and gets... a card with a description but no actual program.

---

## 4. Profile/Settings — CRITICAL

### Current State
- Accessible ONLY via avatar button in Header (top-right, 32-36px)
- BottomNav has 5 tabs: Schedule, Meals, Training, Programs, Dashboard — **no Settings**
- Contains: name edit, profile stats, activity management, theme/language toggles, reset onboarding, logout
- **No data deletion** — users can't clear their workout plan, diet, or progress data
- **No data export**

### The Problem
90% of test users couldn't find the profile. The avatar button is:
- Small (32px on mobile)
- Has no label
- Looks decorative, not interactive
- Competes visually with the app logo/title

### Recommendation
**Option A (Preferred): Add Profile to BottomNav**
Replace one of the 5 tabs. The most expendable tab is **Programs** — it's a sub-feature of Training, not a top-level destination.

New nav: `Schedule | Meals | Training | Dashboard | Profile`

Programs becomes a section within Training (where it logically belongs).

**Option B: Make avatar button obvious**
Add a label, make it bigger, add a notification dot for incomplete profile. But this is a band-aid — BottomNav is where users look for navigation.

**Additionally:**
- Add "Clear Workout Plan" button (resets `vida_workout_plan`)
- Add "Clear Diet" button (resets `vida_custom_diet`)
- Add "Clear All Data" with confirmation modal
- Add "Export My Data" (JSON download)

---

## 5. Non-Gym Modalities — STRATEGIC

### Current State

The app supports 6 modalities with **real, substantial implementations**:

| Modality | Card Component | Exercises | Features |
|----------|---------------|-----------|----------|
| Gym | ExerciseList | 158 (with GIFs) | Set/rep tracking, rest timer, progressive overload |
| CrossFit | CrossFitCard (106 lines) | via movements | WOD types (AMRAP/EMOM/For Time), round counter, score input |
| Calisthenics | CalisthenicsCard (104 lines) | 93 | Skill progressions, level badges (1-5), per-skill completion |
| Pilates | PilatesCard (102 lines) | 75 | Flow sessions, ordered movements, focus tags |
| Running | RunCard (195 lines) | 47 | Distance/duration/pace tracking, 5-zone training, auto-pace calc |
| Yoga | YogaCard (105 lines) | 92 | Pose sequences, style badges, flow completion |

**This is not shell content.** Each card has 100-195 lines of real functionality with:
- Bilingual content (pt-BR/en)
- LocalStorage persistence per day
- Completion tracking
- Type-specific metrics (zones for running, levels for calisthenics, WOD types for CrossFit)

### The Problem
Despite the substance, non-gym feels second-class because:

1. **No exercise images** — All non-gym exercises have `gifUrl: null`. Gym has 158 animated GIFs.
2. **No granular tracking** — Gym tracks per-set completion. Non-gym is session-level toggle only.
3. **No progress bar** — Gym days show "3 of 8 exercises, 37%". Non-gym shows nothing.
4. **Cards are flat** — Gym exercises expand to show instructions, muscles, history. Non-gym cards show a list and a checkbox.
5. **Schedule doesn't differentiate** — SchedulePage shows "Gym" for all workout blocks regardless of actual modality.
6. **Programs are gym-only in practice** — The 24 programs include non-gym labels but no actual exercise lists.

### Which Second Modality to Focus On?

**Analysis based on:**
- Market size and growth trends
- Overlap with gym users (cross-sell potential)
- Technical feasibility in our app
- Content depth we already have

| Modality | Market Size | Gym Overlap | Our Content | Recommendation |
|----------|------------|-------------|-------------|----------------|
| Running | Largest (300M+ runners globally) | High — most gym-goers also run | 47 exercises, RunCard is our most sophisticated card (195 lines), 5-zone training already built | **BEST CHOICE** |
| Calisthenics | Growing fast | Very high — bodyweight complements weights | 93 exercises, progression levels built | Strong second choice |
| CrossFit | Niche but passionate | Moderate | WOD system built, movement tracking | Too niche for second focus |
| Yoga | Large market | Moderate | 92 poses, flow system | Different audience, harder to do well |
| Pilates | Growing | Low-moderate | 75 movements | Specialized audience |

**Recommendation: Focus on Running as the second modality.**

Why:
- Largest addressable market after gym
- Highest overlap with gym users (most people who lift also run or want to)
- We already have the most sophisticated card for it (RunCard: 195 lines, 5-zone training, pace calculator)
- Running + gym is the most common fitness combo worldwide
- Running has clear, measurable progression (distance, pace, zones) that maps well to our tracking model
- Content creation is straightforward (structured run plans are well-documented in sports science)

**What "equal importance" means for Running:**
- Running should have its own section in the Training tab (not just a card inside a gym-centric view)
- Run history with distance/pace/zone trends
- Structured run plans (Couch to 5K, 10K prep, half-marathon, interval training)
- Run-specific progress tracking (weekly distance, pace improvement, zone distribution)
- Integration with schedule (run days vs gym days visualized differently)

---

## 6. Navigation — MODERATE

### Current State
5 bottom tabs: Schedule | Meals | Training | Programs | Dashboard

Plus 8 sub-pages via `setActiveTab`:
- `programs-from-training`, `smart-plan`, `build-plan` (from Training/Programs)
- `diet-builder`, `import-diet` (from Meals)
- `import-training` (from Programs)
- `library` (Exercise Library)
- `settings` (from Header avatar)

### Problems
1. **Programs tab is redundant** — It's a sub-feature of Training. Users go Training → "I need a program" → Programs. Having it as a top-level tab is confusing.
2. **Dashboard is underused** — Currently shows basic stats. Not enough content to justify a top-level tab, but it has potential.
3. **No settings in nav** — Covered above.
4. **Sub-page navigation is confusing** — `programs-from-training` vs `programs` is the same page with different back buttons. This indicates the routing model is straining.

### Recommendation
**Merge to 4 tabs:**

```
Schedule | Meals | Training | Profile
```

- **Schedule:** Today's plan (redesigned as card view)
- **Meals:** Diet tracking (simplified)
- **Training:** Workout + Programs + Dashboard combined. Main view shows today's workout. Secondary sections: My Programs, Progress/Stats, Exercise Library
- **Profile:** Settings + stats + data management

This reduces cognitive load, eliminates the Programs orphan tab, gives Profile a proper home, and makes Dashboard accessible as a section within Training where it contextually belongs.

---

## 7. Priority Order for Implementation

| # | Item | Severity | Effort | Impact |
|---|------|----------|--------|--------|
| 1 | Fix training generator time budgeting | Critical | Medium | Users get usable workouts instead of garbage |
| 2 | Add Profile to BottomNav (merge Programs into Training) | Critical | Medium | 90% of users can now find settings |
| 3 | Redesign Schedule as "Today" card view | Critical | Large | Schedule becomes useful instead of confusing |
| 4 | Polish Meals page (kill accordion, bigger checks, macro bars) | Moderate | Medium | Diet tracking becomes intuitive |
| 5 | Elevate Running to equal status | Strategic | Large | Differentiator — gym + running done right |
| 6 | Populate program exercise lists | Moderate | Medium | Programs become real instead of metadata shells |

---

## Appendix: What's Working Well

Don't throw these out:
- **Science-based volume/RPE model** in generator — the science is right, only time budgeting is wrong
- **Exercise database** — 512 exercises with instructions, levels, muscle mapping is a real asset
- **Bilingual support** — full pt-BR/en across all features
- **Import system** — paste/upload text parser for training and diet is unique
- **Diet builder + check-off tracking** — the custom diet flow works, just needs polish
- **Non-gym card architecture** — RunCard's zone system, Calisthenics progressions, CrossFit WOD types are solid foundations to build on
- **Activity management in settings** — MyActivities component for adding/configuring modalities is well-built
