# Vida App — Global UI/UX Refactoring Design Spec

## Context

Vida is a premium, holistic life and sports companion app. The app already has a working 8-step onboarding, Supabase integration, Google auth, multi-language support, and 5 main pages (Schedule, Meals, Training, Progress, Settings). This spec covers **Step 2 of Sprint 1: Global UI/UX Refactoring** — upgrading the design system to meet the premium standards defined in `md/ux_ui_designer_brief.md` and `md/vida_master_plan.md`.

## Approach

**Design Token Overhaul (Approach A):** Rebuild CSS design tokens as a comprehensive 3-tier system with light/dark themes. Swap fonts. Upgrade component CSS files incrementally. Components keep their existing logic — changes are CSS-focused, with minimal JS changes limited to: ThemeProvider integration, theme toggle UI in Settings, and dynamic `<meta>` tag updates.

### Design Decisions (User-Approved)

- **Theme default:** Match system preference → fallback to dark → user can override in Settings
- **Typography:** Bold distinctive pairing — Sora (display/headings) + Outfit (body) + JetBrains Mono (data/stats). Replaces Inter + DM Serif Display.
- **Visual intensity:** Mix approach — bold on hero moments (onboarding, generating screen, progress milestones), refined restraint on daily-use screens (schedule, meals, training). Premium without being exhausting.

---

## 1. Design Token Architecture

### 1.1 Three-Tier Token System

All tokens live in `src/styles/tokens.css`. Primitives are defined in `:root`. Semantic tokens are assigned values inside `[data-theme]` selectors. Component tokens are defined only when a component deviates from its semantic default.

**Layer 1 — Primitive Tokens** (raw values, defined in `:root`, never referenced by components):
```css
:root {
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
  --primitive-gray-0: #f0f0f5;
  --primitive-white: #ffffff;

  /* Accents */
  --primitive-lime-500: #c8f55a;
  --primitive-lime-600: #a8d040;
  --primitive-lime-700: #4a7a00;
  --primitive-lime-800: #3d6b00;
  --primitive-blue-400: #6bcfff;
  --primitive-blue-600: #0077b6;
  --primitive-orange-400: #ffb86c;
  --primitive-orange-600: #d4850a;
  --primitive-purple-400: #c899ff;
  --primitive-purple-600: #8b5cf6;

  /* States */
  --primitive-red-400: #ff6b6b;
  --primitive-red-600: #cc3333;
  --primitive-green-400: #69db7c;
  --primitive-green-600: #2b8a3e;
  --primitive-yellow-400: #ffd43b;
  --primitive-yellow-600: #e67700;
}
```

**Layer 2 — Semantic Tokens** (purpose-driven, assigned inside `[data-theme]` selectors in section 2):

| Token | Purpose |
|---|---|
| `--color-bg-primary` | Page background |
| `--color-bg-surface` | Cards, containers |
| `--color-bg-elevated` | Modals, bottom sheets, dropdowns |
| `--color-bg-overlay` | Backdrop behind modals |
| `--color-text-primary` | Main body text |
| `--color-text-secondary` | Supporting text, descriptions |
| `--color-text-muted` | Disabled, placeholder text |
| `--color-text-inverse` | Text on accent-colored backgrounds |
| `--color-accent-primary` | Primary brand accent (lime) |
| `--color-accent-primary-hover` | Accent hover state |
| `--color-accent-secondary` | Secondary accent (blue) |
| `--color-accent-warm` | Warm accent (orange) |
| `--color-border-default` | Standard borders |
| `--color-border-subtle` | Faint separators |
| `--color-state-success` | Success indicators |
| `--color-state-warning` | Warning indicators |
| `--color-state-error` | Error indicators |
| `--color-glass-bg` | Glassmorphism background |
| `--color-glass-border` | Glassmorphism border |

**Layer 3 — Component Tokens** (scoped overrides):

Component tokens do NOT exist by default. They are created only when a specific component needs to deviate from its semantic token. For example, if BottomNav needs a different bg than `--color-bg-surface`, define `--nav-bg` locally in the component's CSS. Until that need arises, components use semantic tokens directly.

### 1.2 Spacing Scale (4px base)

New numeric naming coexists with old named tokens during migration. Mapping:

| New Token | Value | Old Token (alias) |
|---|---|---|
| `--space-1` | 0.25rem (4px) | `--space-xs` |
| `--space-2` | 0.5rem (8px) | `--space-sm` |
| `--space-3` | 0.75rem (12px) | *(new)* |
| `--space-4` | 1rem (16px) | `--space-md` |
| `--space-6` | 1.5rem (24px) | `--space-lg` |
| `--space-8` | 2rem (32px) | `--space-xl` |
| `--space-10` | 2.5rem (40px) | *(new)* |
| `--space-12` | 3rem (48px) | `--space-2xl` |
| `--space-16` | 4rem (64px) | *(new)* |

During migration, old token names are aliased to new values (e.g., `--space-xs: var(--space-1)`). Old aliases are removed in the cleanup step.

### 1.3 Typography Scale (~1.25 ratio)

| Token | Size | Line Height | Weight | Font | Use |
|---|---|---|---|---|---|
| `--text-xs` | 0.75rem | 1.5 | 400 | Outfit | Captions, badges |
| `--text-sm` | 0.875rem | 1.5 | 400 | Outfit | Secondary text, labels |
| `--text-base` | 1rem | 1.6 | 400 | Outfit | Body text |
| `--text-lg` | 1.125rem | 1.5 | 500 | Outfit | Emphasized body |
| `--text-xl` | 1.25rem | 1.4 | 600 | Sora | Section headers |
| `--text-2xl` | 1.5rem | 1.3 | 600 | Sora | Page titles |
| `--text-3xl` | 1.875rem | 1.2 | 700 | Sora | Hero headings |
| `--text-display` | 2.25rem | 1.1 | 700 | Sora | Onboarding/splash |

**Font stacks (CSS variables):**
```css
--font-display: 'Sora', sans-serif;
--font-body: 'Outfit', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Font assignment rule:** `h1`-`h4` and any element with size `--text-xl` or larger uses `--font-display`. Everything else uses `--font-body`. Numeric data/stats use `--font-mono`.

**Font loading:** Replace the existing `@import` in `index.css` with `<link>` tags in `index.html` for non-blocking loading:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```
Remove the old `@import url(...)` line from `index.css`.

### 1.4 Border Radius Scale

Unchanged from current codebase except for one addition:
```css
--radius-sm: 6px;    /* existing */
--radius-md: 12px;   /* existing */
--radius-lg: 16px;   /* existing */
--radius-xl: 24px;   /* existing */
--radius-full: 9999px;  /* NEW — for pills, circles */
```

### 1.5 Elevation System

Elevation tokens are defined **inside** `[data-theme]` selectors (not globally) since they differ per theme:

**Dark theme:**
```css
--elevation-1: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px var(--color-border-subtle);
--elevation-2: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-subtle);
--elevation-3: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--color-border-subtle);
```

**Light theme:**
```css
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

Transition aliases for migration compatibility:
```css
--transition-fast: var(--duration-fast) var(--ease-default);
--transition-normal: var(--duration-normal) var(--ease-default);
```

Daily screens use `--duration-fast` / `--duration-normal`. Hero moments use `--duration-slow` / `--duration-dramatic` with `--ease-bounce`.

### 1.7 Z-Index Scale

```css
--z-base: 0;
--z-sticky: 100;       /* sticky headers */
--z-nav: 200;           /* bottom nav */
--z-overlay: 300;       /* modal backdrop */
--z-modal: 400;         /* bottom sheet, modals */
--z-toast: 500;         /* toast notifications */
```

### 1.8 Schedule Block Colors

Functional colors used by the schedule system. These are preserved and themed:

**Dark theme:**
```css
--color-morning: var(--primitive-orange-400);   /* #ffb86c */
--color-gym: var(--primitive-lime-500);          /* #c8f55a */
--color-food: var(--primitive-blue-400);         /* #6bcfff */
--color-work: var(--primitive-gray-500);         /* #55556a */
--color-free: var(--primitive-purple-400);       /* #c899ff */
--color-sleep: var(--primitive-gray-700);        /* #24243a */
--color-chore: var(--primitive-gray-400);        /* #8a8a9a */
--color-social: var(--primitive-red-400);        /* #ff6b6b */
--color-flex: var(--primitive-gray-300);         /* #ababba */
```

**Light theme:** Same hue family but adapted for light backgrounds (darker/more saturated variants where needed for contrast).

**Note:** These values are intentional remappings to the new primitive gray scale, not exact matches of the current hardcoded hex values (e.g., old `--color-work: #666` → new `var(--primitive-gray-500)` which is `#55556a`). The shift aligns block colors with the richer, blue-undertoned gray palette used throughout the new design system.

---

## 2. Theme Palettes

### 2.1 Dark Theme (Default fallback)

```css
[data-theme="dark"], :root {
  /* Backgrounds */
  --color-bg-primary: var(--primitive-gray-950);     /* #0e0e12 */
  --color-bg-surface: var(--primitive-gray-800);      /* #1a1a24 */
  --color-bg-elevated: var(--primitive-gray-700);     /* #24243a */
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  /* Text */
  --color-text-primary: var(--primitive-gray-0);      /* #f0f0f5 */
  --color-text-secondary: var(--primitive-gray-400);  /* #8a8a9a */
  --color-text-muted: var(--primitive-gray-500);      /* #55556a */
  --color-text-inverse: var(--primitive-gray-950);    /* #0e0e12 */

  /* Accents */
  --color-accent-primary: var(--primitive-lime-500);  /* #c8f55a */
  --color-accent-primary-hover: var(--primitive-lime-600);
  --color-accent-secondary: var(--primitive-blue-400);
  --color-accent-warm: var(--primitive-orange-400);

  /* Borders */
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-subtle: rgba(255, 255, 255, 0.04);

  /* States */
  --color-state-success: var(--primitive-green-400);
  --color-state-warning: var(--primitive-yellow-400);
  --color-state-error: var(--primitive-red-400);

  /* Glass */
  --color-glass-bg: rgba(255, 255, 255, 0.04);
  --color-glass-border: rgba(255, 255, 255, 0.1);

  /* Elevations */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px var(--color-border-subtle);
  --elevation-2: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-subtle);
  --elevation-3: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--color-border-subtle);

  /* Schedule blocks */
  --color-morning: var(--primitive-orange-400);
  --color-gym: var(--primitive-lime-500);
  --color-food: var(--primitive-blue-400);
  --color-work: var(--primitive-gray-500);
  --color-free: var(--primitive-purple-400);
  --color-sleep: var(--primitive-gray-700);
  --color-chore: var(--primitive-gray-400);
  --color-social: var(--primitive-red-400);
  --color-flex: var(--primitive-gray-300);
}
```

### 2.2 Light Theme

```css
[data-theme="light"] {
  /* Backgrounds */
  --color-bg-primary: var(--primitive-gray-50);       /* #f5f5f0 */
  --color-bg-surface: var(--primitive-gray-25);        /* #fafaf8 */
  --color-bg-elevated: var(--primitive-white);         /* #ffffff */
  --color-bg-overlay: rgba(0, 0, 0, 0.3);

  /* Text */
  --color-text-primary: var(--primitive-gray-800);    /* #1a1a24 */
  --color-text-secondary: var(--primitive-gray-500);  /* #55556a */
  --color-text-muted: var(--primitive-gray-400);      /* #8a8a9a */
  --color-text-inverse: var(--primitive-gray-0);      /* #f0f0f5 */

  /* Accents */
  --color-accent-primary: var(--primitive-lime-800);  /* #3d6b00 */
  --color-accent-primary-hover: var(--primitive-lime-700);
  --color-accent-secondary: var(--primitive-blue-600);
  --color-accent-warm: var(--primitive-orange-600);

  /* Borders */
  --color-border-default: rgba(0, 0, 0, 0.08);
  --color-border-subtle: rgba(0, 0, 0, 0.04);

  /* States */
  --color-state-success: var(--primitive-green-600);
  --color-state-warning: var(--primitive-yellow-600);
  --color-state-error: var(--primitive-red-600);

  /* Glass */
  --color-glass-bg: rgba(255, 255, 255, 0.65);
  --color-glass-border: rgba(0, 0, 0, 0.05);

  /* Elevations */
  --elevation-1: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px var(--color-border-subtle);
  --elevation-2: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border-subtle);
  --elevation-3: 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px var(--color-border-subtle);

  /* Schedule blocks — same hues, adjusted for light bg contrast */
  --color-morning: var(--primitive-orange-600);
  --color-gym: var(--primitive-lime-800);
  --color-food: var(--primitive-blue-600);
  --color-work: var(--primitive-gray-400);
  --color-free: var(--primitive-purple-600);
  --color-sleep: var(--primitive-gray-200);
  --color-chore: var(--primitive-gray-500);
  --color-social: var(--primitive-red-600);
  --color-flex: var(--primitive-gray-400);
}
```

### 2.3 Theme Accessibility Notes

Contrast ratios to verify during implementation (WCAG AA minimum 4.5:1 for text):
- `--color-text-muted` on `--color-bg-primary` (both themes)
- `--color-accent-primary` as text on `--color-bg-primary` (light theme: `#3d6b00` on `#f5f5f0`)
- `--color-accent-primary` as text on `--color-bg-surface` (both themes)

If any fail AA, adjust the primitive value. The accent colors are fine for large text (3:1 ratio) and decorative use regardless.

---

## 3. useTheme Hook API

### 3.1 Interface

```typescript
const { theme, setTheme, toggleTheme, isDark } = useTheme()
```

| Property | Type | Description |
|---|---|---|
| `theme` | `'dark' \| 'light'` | Current active theme |
| `setTheme` | `(theme: string) => void` | Set specific theme |
| `toggleTheme` | `() => void` | Toggle between dark/light |
| `isDark` | `boolean` | Convenience flag |

### 3.2 Initialization Logic

```
1. Check localStorage key 'vida_theme'
2. If found → use that value
3. If not found → check window.matchMedia('(prefers-color-scheme: dark)')
   - If matches dark → 'dark'
   - If matches light → 'light'
   - If matchMedia unavailable → 'dark' (fallback)
4. Apply to document: document.documentElement.setAttribute('data-theme', theme)
5. Update <meta name="theme-color"> to match bg-primary
6. Update <meta name="color-scheme"> to match theme
```

### 3.3 System Preference Listener

The hook registers a `matchMedia` change listener. If the user has NOT manually set a preference (no `vida_theme` in localStorage), theme updates live when system preference changes.

### 3.4 Persistence

- **localStorage key:** `vida_theme`
- **Values:** `'dark'` | `'light'`
- **Not synced to Supabase** — theme is device-local, not account-level.

### 3.5 Provider Placement

`ThemeProvider` is added to the provider chain in `App.jsx` as the outermost wrapper. `main.jsx` is NOT modified. The full provider chain order becomes:

```
ThemeProvider          (NEW — outermost, no dependencies)
  → LanguageProvider   (existing — no theme dependency)
    → AuthProvider     (existing)
      → ToastProvider  (existing)
        → AppContent
```

This reorders the existing chain by placing ThemeProvider outside LanguageProvider. LanguageProvider has no dependency on theme context, so this is safe.

---

## 4. Component Pattern Upgrades

### 4.1 Buttons

- **Primary:** Solid `--color-accent-primary` fill, `--color-text-inverse` text, `--radius-md`, `--elevation-2` on hover. Press: `scale(0.97)` with `--duration-fast`.
- **Secondary/Ghost:** Transparent bg, accent border, accent text. Hover: fills `rgba(accent, 0.1)`.
- **Icon button:** `--radius-full`, glass bg (dark) / surface bg (light).
- **All:** `--duration-fast` transitions, `focus-visible` ring using `--color-accent-primary` with 3px offset.

### 4.2 Cards & Containers

- **Standard Card:** `--color-bg-surface`, `--radius-lg`, `--elevation-1`, `--color-border-subtle` 1px border. Interactive cards lift to `--elevation-2` on hover.
- **Glass Card (hero only):** `--color-glass-bg` + `backdrop-filter: blur(20px)`, `--color-glass-border`. Fallback for unsupported browsers: solid `--color-bg-elevated` with 0.85 opacity (no blur). Used in onboarding, generating screen, progress highlights.
- **Stat Card:** Compact, accent-colored top border (2px), mono font for numbers.

### 4.3 Form Inputs

- **Text/Time:** `--color-bg-elevated` fill, `--radius-md`, `--color-border-default`. Focus: border → `--color-accent-primary` + glow `box-shadow: 0 0 0 3px rgba(accent, 0.15)`.
- **Sliders:** Custom track (`--color-border-subtle`), filled portion uses accent. Thumb: solid accent circle, `--elevation-2`.
- **Multi-select chips:** `--radius-full`, ghost default, accent fill on selection + checkmark. Staggered entrance on step load.
- **Day counter:** Large touch targets, accent highlight on active number.

### 4.4 Navigation

- **Bottom Nav:** Glass bg (dark: `backdrop-filter: blur(24px)`, light: semi-transparent surface). `backdrop-filter` fallback: solid `--color-bg-surface` with 0.95 opacity. Active: accent icon + label + dot indicator. Inactive: `--color-text-muted`. `z-index: var(--z-nav)`.
- **Header:** Minimal — display font (Sora), avatar with glass bg. No heavy background. `z-index: var(--z-sticky)`.

### 4.5 Bottom Sheet & Modals

Glass bg (`--color-bg-elevated` + blur overlay at `var(--z-overlay)`). Sheet at `var(--z-modal)`. `--radius-xl` top corners. Drag handle pill at top center. Enter: slide up `--ease-out` `--duration-normal`. Exit: faster slide down.

### 4.6 Toast Notifications

Pill shape (`--radius-full`), top-center. `z-index: var(--z-toast)`. State colors for bg. Entrance: fade + slide down. Auto-dismiss with shrinking accent progress bar.

### 4.7 Charts (Progress Page)

- Grid lines: `--color-border-subtle`
- Data: accent gradient fills
- Tooltips: glass card style
- Labels: Outfit, `--color-text-secondary`

### 4.8 Loading & Skeleton States

Shimmer keyframe definition (in `animations.css`):
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-surface) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s var(--ease-default) infinite;
  border-radius: var(--radius-md);
}
```

### 4.9 Onboarding Hero Moments

- **Step transitions:** Crossfade + slight vertical slide
- **Welcome screen:** Animated gradient mesh background, display font, accent glow
- **Generating screen (Step 8):** Pulse animation behind progress, staggered reveal of calculation steps, `--duration-dramatic` timing
- **Dynamic calculations:** Animate with `--ease-bounce`, accent color pop

---

## 5. Animations File Contents (`src/styles/animations.css`)

```css
/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes flame {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes gradientMesh {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* Utility classes */
.animate-fade-in { animation: fadeIn var(--duration-normal) var(--ease-default); }
.animate-slide-up { animation: slideUp var(--duration-normal) var(--ease-default); }
.animate-slide-down { animation: slideDown var(--duration-normal) var(--ease-default); }
.animate-pulse { animation: pulse 2s infinite; }
.animate-flame { animation: flame 1s ease-in-out infinite; }
.animate-scale-in { animation: scaleIn var(--duration-normal) var(--ease-bounce); }

/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(90deg,
    var(--color-bg-surface) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s var(--ease-default) infinite;
  border-radius: var(--radius-md);
}

/* Hero-only: gradient mesh background */
.gradient-mesh {
  background: linear-gradient(-45deg,
    var(--color-accent-primary),
    var(--color-accent-secondary),
    var(--color-accent-warm),
    var(--color-accent-primary)
  );
  background-size: 400% 400%;
  animation: gradientMesh 8s ease infinite;
}

/* Glass effect with fallback */
.glass {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

@supports not (backdrop-filter: blur(20px)) {
  .glass {
    background: var(--color-bg-elevated);
    opacity: 0.95;
  }
}
```

---

## 6. Token & Utility Class Migration Map

### 6.1 Core Token Renames

These are the primary design token renames. During migration, old names are aliased to new values. Aliases are removed in the cleanup step.

| Old Token | New Token | Notes |
|---|---|---|
| `--color-bg` | `--color-bg-primary` | Page background |
| `--color-card` | `--color-bg-surface` | Card/container bg |
| `--color-card-alt` | `--color-bg-elevated` | Elevated surface bg |
| `--color-text` | `--color-text-primary` | Main text color |
| `--color-text-dim` | `--color-text-secondary` | Supporting text |
| `--color-muted` | `--color-border-default` | Was used for borders/muted UI |
| `--color-muted-light` | `--color-text-muted` | Placeholder/disabled text |
| `--color-border` | `--color-border-default` | Standard borders |
| `--color-accent` | `--color-accent-primary` | Primary accent |
| `--color-accent-dim` | `--color-accent-primary-hover` | Accent hover state |
| `--color-red` | `--color-state-error` | Error/danger |
| `--color-blue` | `--color-accent-secondary` | Secondary accent |
| `--color-orange` | `--color-accent-warm` | Warm accent |
| `--color-purple` | *(kept as primitive)* | `var(--primitive-purple-400)` |
| `--font-heading` | `--font-display` | Display/heading font |
| `--transition-fast` | Alias: `var(--duration-fast) var(--ease-default)` | Kept as alias during migration |
| `--transition-normal` | Alias: `var(--duration-normal) var(--ease-default)` | Kept as alias during migration |

### 6.2 Utility Class Updates

| Old Class | Old Token | New Token |
|---|---|---|
| `.text-accent` | `--color-accent` | `--color-accent-primary` |
| `.text-dim` | `--color-text-dim` | `--color-text-secondary` |
| `.text-muted` | `--color-muted-light` | `--color-text-muted` |
| `.bg-card` | `--color-card` | `--color-bg-surface` |
| `.bg-card-alt` | `--color-card-alt` | `--color-bg-elevated` |
| `.font-mono` | `--font-mono` | `--font-mono` (unchanged) |
| `.font-heading` | `--font-heading` | `--font-display` |

---

## 7. Migration Strategy

### 7.1 File Changes

**New files (3):**
- `src/styles/tokens.css` — all 3 token layers + theme palettes
- `src/styles/animations.css` — motion tokens + keyframes + utility classes
- `src/hooks/useTheme.jsx` — ThemeProvider + context + hook

**Modified files — JS changes (3):**
- `src/App.jsx` — wrap provider chain with `ThemeProvider` (outermost)
- `src/pages/SettingsPage.jsx` — add theme toggle UI (dark/light/system)
- `index.html` — replace font loading, update meta tags

**Modified files — CSS migration (all existing `.css` files):**
- `src/index.css` — remove old tokens (moved to `tokens.css`), remove old `@import`, remove old animations (moved to `animations.css`), keep reset/base styles, add `@import` for new files
- `src/App.css`
- `src/components/Header.css`
- `src/components/BottomNav.css`
- `src/components/Toast.css`
- `src/components/BottomSheet.css`
- `src/components/LoadingScreen.css`
- `src/components/LoginScreen.css`
- `src/components/OnboardingFlow.css`
- `src/components/ExerciseMedia.css`
- `src/components/VideoPlayerModal.css`
- `src/pages/SchedulePage.css`
- `src/pages/MealsPage.css`
- `src/pages/TrainingPage.css`
- `src/pages/ProgressPage.css`
- `src/pages/SettingsPage.css`

**Untouched:**
- `src/components/Icon.jsx` (no CSS, just a wrapper)
- All hooks except adding `useTheme`
- `src/data/*`
- `src/services/*`
- `supabase/*`

### 7.2 Migration Order

1. **Tokens + Animations** — Create `src/styles/tokens.css` and `src/styles/animations.css`. Import them in `index.css`. Old and new tokens coexist side by side.

2. **Fonts** — Update `index.html` with `<link>` tags for Sora, Outfit, JetBrains Mono (with preconnect). Remove old `@import` from `index.css`. Update `--font-heading` → `--font-display`, `--font-body`, `--font-mono` to new stacks.

3. **Theme hook** — Create `useTheme.jsx`. Add `ThemeProvider` to `App.jsx` provider chain (outermost). Default dark theme matches current look — no visual change.

4. **Base components** — Migrate Header, BottomNav, Toast, BottomSheet, LoadingScreen CSS to new tokens. These are shared, so upgrading them lifts everything.

5. **Page CSS** — Update each page's CSS. Add theme toggle to SettingsPage (dark/light/system selector).

6. **Login & Onboarding** — Hero moment upgrades: glass cards, enhanced animations, generating screen drama. Also migrate ExerciseMedia.css, VideoPlayerModal.css.

7. **Cleanup** — Remove old token definitions from `index.css`. Update utility classes. Remove old `--transition-*` aliases. Verify no hardcoded colors remain. Remove old spacing aliases.

### 7.3 Risk Mitigation

- Token coexistence — old variables remain until each component is migrated, preventing unstyled flashes.
- One component at a time — app stays deployable after each migration step.
- Theme fallback — `:root` selector includes dark theme values, so even without the hook the app looks correct.
- `backdrop-filter` fallback — solid backgrounds provided for browsers without blur support.
- Font `display=swap` — prevents invisible text during font loading.
- No structural JSX changes — component logic stays untouched. JS changes are limited to ThemeProvider wiring and a theme toggle in Settings.
