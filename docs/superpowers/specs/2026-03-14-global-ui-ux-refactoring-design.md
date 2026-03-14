# Vida App — Global UI/UX Refactoring Design Spec

## Context

Vida is a premium, holistic life and sports companion app. The app already has a working 8-step onboarding, Supabase integration, Google auth, multi-language support, and 5 main pages (Schedule, Meals, Training, Progress, Settings). This spec covers **Step 2 of Sprint 1: Global UI/UX Refactoring** — upgrading the design system to meet the premium standards defined in `md/ux_ui_designer_brief.md` and `md/vida_master_plan.md`.

## Approach

**Design Token Overhaul (Approach A):** Rebuild CSS design tokens as a comprehensive 3-tier system with light/dark themes. Swap fonts. Upgrade component CSS files incrementally. No structural JSX rewrites — components keep their existing logic, only CSS evolves.

### Design Decisions (User-Approved)

- **Theme default:** Match system preference → fallback to dark → user can override in Settings
- **Typography:** Bold distinctive pairing — Sora (display) + Outfit (body) + JetBrains Mono (data). Replaces Inter + DM Serif Display.
- **Visual intensity:** Mix approach — bold on hero moments (onboarding, generating screen, progress milestones), refined restraint on daily-use screens (schedule, meals, training). Premium without being exhausting.

---

## 1. Design Token Architecture

### 1.1 Three-Tier Token System

**Layer 1 — Primitive Tokens** (raw values, never referenced by components):
```css
/* Grays */
--primitive-gray-950: #0e0e12;
--primitive-gray-900: #14141c;
--primitive-gray-800: #1a1a24;
--primitive-gray-700: #24243a;
--primitive-gray-600: #35354a;
--primitive-gray-500: #55556a;
--primitive-gray-400: #8a8a9a;
--primitive-gray-300: #ababba;
--primitive-gray-200: #d0d0da;
--primitive-gray-100: #e8e8ee;
--primitive-gray-50: #f5f5f0;
--primitive-gray-25: #fafaf8;

/* Accents */
--primitive-lime-500: #c8f55a;
--primitive-lime-600: #a8d040;
--primitive-lime-700: #4a7a00;
--primitive-lime-800: #3d6b00;
--primitive-blue-400: #6bcfff;
--primitive-blue-600: #0077b6;
--primitive-orange-400: #ffb86c;
--primitive-orange-600: #d4850a;

/* States */
--primitive-red-400: #ff6b6b;
--primitive-red-600: #cc3333;
--primitive-green-400: #69db7c;
--primitive-green-600: #2b8a3e;
--primitive-yellow-400: #ffd43b;
--primitive-yellow-600: #e67700;
```

**Layer 2 — Semantic Tokens** (purpose-driven, what components reference):
```css
/* Backgrounds */
--color-bg-primary
--color-bg-surface
--color-bg-elevated
--color-bg-overlay

/* Text */
--color-text-primary
--color-text-secondary
--color-text-muted
--color-text-inverse

/* Accents */
--color-accent-primary
--color-accent-primary-hover
--color-accent-secondary
--color-accent-warm

/* Borders */
--color-border-default
--color-border-subtle

/* States */
--color-state-success
--color-state-warning
--color-state-error

/* Glass */
--color-glass-bg
--color-glass-border
```

**Layer 3 — Component Tokens** (scoped overrides, only when a component deviates from semantic):
```css
--button-bg
--button-text
--button-border
--card-bg
--card-border
--input-bg
--input-border
--input-focus-ring
--nav-bg
--nav-active
--nav-inactive
```

### 1.2 Spacing Scale (4px base)

```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### 1.3 Typography Scale (~1.25 ratio)

| Token | Size | Line Height | Weight | Use |
|---|---|---|---|---|
| `--text-xs` | 0.75rem | 1.5 | 400 | Captions, badges |
| `--text-sm` | 0.875rem | 1.5 | 400 | Secondary text, labels |
| `--text-base` | 1rem | 1.6 | 400 | Body text |
| `--text-lg` | 1.125rem | 1.5 | 500 | Emphasized body |
| `--text-xl` | 1.25rem | 1.4 | 600 | Section headers |
| `--text-2xl` | 1.5rem | 1.3 | 600 | Page titles |
| `--text-3xl` | 1.875rem | 1.2 | 700 | Hero headings |
| `--text-display` | 2.25rem | 1.1 | 700 | Onboarding/splash |

**Font stacks:**
- Display: `'Sora', sans-serif`
- Body: `'Outfit', sans-serif`
- Mono: `'JetBrains Mono', monospace`

### 1.4 Border Radius Scale

```css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### 1.5 Elevation System

```css
/* Dark theme */
--elevation-1: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px var(--color-border-subtle);
--elevation-2: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-subtle);
--elevation-3: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--color-border-subtle);

/* Light theme */
--elevation-1: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px var(--color-border-subtle);
--elevation-2: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border-subtle);
--elevation-3: 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px var(--color-border-subtle);
```

### 1.6 Motion Tokens

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-dramatic: 700ms;   /* hero moments only */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

Daily screens use `--duration-fast` / `--duration-normal`. Hero moments use `--duration-slow` / `--duration-dramatic` with `--ease-bounce`.

---

## 2. Theme Palettes

### 2.1 Dark Theme (Default)

```css
[data-theme="dark"], :root {
  --color-bg-primary: var(--primitive-gray-950);     /* #0e0e12 */
  --color-bg-surface: var(--primitive-gray-800);      /* #1a1a24 */
  --color-bg-elevated: var(--primitive-gray-700);     /* #24243a */
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  --color-text-primary: #f0f0f5;
  --color-text-secondary: var(--primitive-gray-400);  /* #8a8a9a */
  --color-text-muted: var(--primitive-gray-500);      /* #55556a */
  --color-text-inverse: var(--primitive-gray-950);

  --color-accent-primary: var(--primitive-lime-500);  /* #c8f55a */
  --color-accent-primary-hover: var(--primitive-lime-600);
  --color-accent-secondary: var(--primitive-blue-400);
  --color-accent-warm: var(--primitive-orange-400);

  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.04);

  --color-state-success: var(--primitive-green-400);
  --color-state-warning: var(--primitive-yellow-400);
  --color-state-error: var(--primitive-red-400);

  --color-glass-bg: rgba(255, 255, 255, 0.04);
  --color-glass-border: rgba(255, 255, 255, 0.1);
}
```

### 2.2 Light Theme

```css
[data-theme="light"] {
  --color-bg-primary: var(--primitive-gray-50);       /* #f5f5f0 */
  --color-bg-surface: var(--primitive-gray-25);        /* #fafaf8 */
  --color-bg-elevated: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.3);

  --color-text-primary: var(--primitive-gray-800);    /* #1a1a24 */
  --color-text-secondary: #6a6a7a;
  --color-text-muted: #9a9aaa;
  --color-text-inverse: #f0f0f5;

  --color-accent-primary: var(--primitive-lime-800);  /* #3d6b00 */
  --color-accent-primary-hover: var(--primitive-lime-700);
  --color-accent-secondary: var(--primitive-blue-600);
  --color-accent-warm: var(--primitive-orange-600);

  --color-border-default: rgba(0, 0, 0, 0.08);
  --color-border-subtle: rgba(0, 0, 0, 0.04);

  --color-state-success: var(--primitive-green-600);
  --color-state-warning: var(--primitive-yellow-600);
  --color-state-error: var(--primitive-red-600);

  --color-glass-bg: rgba(255, 255, 255, 0.65);
  --color-glass-border: rgba(0, 0, 0, 0.05);
}
```

### 2.3 Theme Switch Transition

```css
html[data-theme] {
  transition: background-color 0.3s var(--ease-default),
              color 0.2s var(--ease-default);
}
```

---

## 3. Component Pattern Upgrades

### 3.1 Buttons

- **Primary:** Solid `--color-accent-primary` fill, `--color-text-inverse` text, `--radius-md`, `--elevation-2` on hover. Press: `scale(0.97)` with `--duration-fast`.
- **Secondary/Ghost:** Transparent bg, accent border, accent text. Hover: fills `rgba(accent, 0.1)`.
- **Icon button:** `--radius-full`, glass bg (dark) / surface bg (light).
- **All:** `--duration-fast` transitions, `focus-visible` ring using `--color-accent-primary` with 3px offset.

### 3.2 Cards & Containers

- **Standard Card:** `--color-bg-surface`, `--radius-lg`, `--elevation-1`, `--color-border-subtle` 1px border. Interactive cards lift to `--elevation-2` on hover.
- **Glass Card (hero only):** `--color-glass-bg` + `backdrop-filter: blur(20px)`, `--color-glass-border`. Used in onboarding, generating screen, progress highlights.
- **Stat Card:** Compact, accent-colored top border (2px), mono font for numbers.

### 3.3 Form Inputs

- **Text/Time:** `--color-bg-elevated` fill, `--radius-md`, `--color-border-default`. Focus: border → `--color-accent-primary` + glow `box-shadow: 0 0 0 3px rgba(accent, 0.15)`.
- **Sliders:** Custom track (`--color-border-subtle`), filled portion uses accent. Thumb: solid accent circle, `--elevation-2`.
- **Multi-select chips:** `--radius-full`, ghost default, accent fill on selection + checkmark. Staggered entrance on step load.
- **Day counter:** Large touch targets, accent highlight on active number.

### 3.4 Navigation

- **Bottom Nav:** Glass bg (dark: `backdrop-filter: blur(24px)`, light: semi-transparent surface). Active: accent icon + label + dot indicator. Inactive: `--color-text-muted`.
- **Header:** Minimal — display font (Sora), avatar with glass bg. No heavy background.

### 3.5 Bottom Sheet & Modals

Glass bg (`--color-bg-elevated` + blur overlay). `--radius-xl` top corners. Drag handle pill at top center. Enter: slide up `--ease-out` `--duration-normal`. Exit: faster slide down.

### 3.6 Toast Notifications

Pill shape (`--radius-full`), top-center. State colors for bg. Entrance: fade + slide down. Auto-dismiss with shrinking accent progress bar.

### 3.7 Charts (Progress Page)

- Grid lines: `--color-border-subtle`
- Data: accent gradient fills
- Tooltips: glass card style
- Labels: Outfit, `--color-text-secondary`

### 3.8 Loading & Skeleton States

Shimmer gradient animation: `--color-bg-surface` → `--color-bg-elevated` → `--color-bg-surface`. Applied via `.skeleton` CSS class.

### 3.9 Onboarding Hero Moments

- **Step transitions:** Crossfade + slight vertical slide
- **Welcome screen:** Animated gradient mesh background, display font, accent glow
- **Generating screen (Step 8):** Pulse animation behind progress, staggered reveal of calculation steps, `--duration-dramatic` timing
- **Dynamic calculations:** Animate with `--ease-bounce`, accent color pop

---

## 4. Migration Strategy

### 4.1 File Changes

**New files:**
- `src/styles/tokens.css` — all 3 token layers
- `src/styles/animations.css` — motion tokens + reusable keyframes
- `src/hooks/useTheme.jsx` — ThemeProvider + context + hook

**Modified files (CSS only, no logic changes):**
- `src/index.css` — strip old tokens, import new token files, keep reset/base
- `src/main.jsx` — wrap with ThemeProvider
- `src/App.jsx` — add ThemeProvider to provider chain
- `index.html` — Google Fonts link (Sora, Outfit, JetBrains Mono)
- `src/components/Header.jsx` + `.css`
- `src/components/BottomNav.jsx` + `.css`
- `src/components/Toast.jsx` + `.css`
- `src/components/BottomSheet.jsx` + `.css`
- `src/components/LoadingScreen.jsx` + `.css`
- `src/components/LoginScreen.jsx` + `.css`
- `src/components/OnboardingFlow.jsx` + `.css`
- `src/pages/SchedulePage.jsx` + `.css`
- `src/pages/MealsPage.jsx` + `.css`
- `src/pages/TrainingPage.jsx` + `.css`
- `src/pages/ProgressPage.jsx` + `.css`
- `src/pages/SettingsPage.jsx` + `.css`

**Untouched:**
- All hooks (except adding useTheme)
- `src/data/*`
- `src/services/*`
- `supabase/*`

### 4.2 Migration Order

1. **Tokens** — Create `tokens.css` + `animations.css`, import in `index.css`. Old and new tokens coexist.
2. **Fonts** — Add Sora/Outfit/JetBrains Mono to `index.html`, update font-family variables.
3. **Theme hook** — Create `useTheme.jsx`, add `ThemeProvider` to `main.jsx`. Dark matches current look.
4. **Base components** — Migrate Header, BottomNav, Toast, BottomSheet, LoadingScreen to new tokens.
5. **Page CSS** — Update each page's CSS. Add theme toggle to Settings.
6. **Login & Onboarding** — Hero moment upgrades: glass cards, enhanced animations, generating screen.
7. **Cleanup** — Remove old token definitions, verify no hardcoded colors remain.

### 4.3 Risk Mitigation

- No structural JSX changes — only CSS and className additions.
- Token coexistence — old variables remain until each component migrates.
- One component at a time — app stays deployable after each step.
- Theme fallback — `:root` level dark tokens ensure app looks correct even if hook fails.
