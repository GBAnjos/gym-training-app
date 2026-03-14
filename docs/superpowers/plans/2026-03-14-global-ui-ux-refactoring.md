# Global UI/UX Refactoring Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Vida's design system to a 3-tier token architecture with dark/light theme support, premium typography, and polished component styling.

**Architecture:** CSS-first migration. New token files (`tokens.css`, `animations.css`) are created alongside existing tokens, then components are migrated one-by-one, and old tokens removed at the end. A `useTheme` React hook manages theme state and system preference detection. No structural JSX changes beyond ThemeProvider wiring and a Settings theme toggle.

**Tech Stack:** CSS custom properties, React Context, Google Fonts (Sora, Outfit, JetBrains Mono), `window.matchMedia` for system preference detection.

**Spec:** `docs/superpowers/specs/2026-03-14-global-ui-ux-refactoring-design.md`

---

## Chunk 1: Foundation (Tokens, Animations, Fonts, Theme Hook)

### Task 1: Create Design Tokens File

**Files:**
- Create: `src/styles/tokens.css`

This file contains all 3 token layers: primitives in `:root`, semantic tokens in `[data-theme]` selectors (dark as both `[data-theme="dark"]` and `:root` fallback), and light theme overrides in `[data-theme="light"]`.

- [ ] **Step 1: Create `src/styles/` directory**

Run: `mkdir -p src/styles`

- [ ] **Step 2: Create `src/styles/tokens.css`**

Write the complete tokens file with all content from spec sections 1.1 through 1.8 and section 2 (Theme Palettes). Structure:

```css
/* ============================================
   VIDA DESIGN TOKENS
   3-tier: Primitives → Semantic → Component
   ============================================ */

/* Layer 1: Primitives (raw values, never referenced by components) */
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

  /* Typography */
  --font-display: 'Sora', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Spacing aliases (migration compatibility — remove in cleanup) */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-dramatic: 700ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* Transition aliases (migration compatibility — remove in cleanup) */
  --transition-fast: var(--duration-fast) var(--ease-default);
  --transition-normal: var(--duration-normal) var(--ease-default);

  /* Z-Index Scale */
  --z-base: 0;
  --z-sticky: 100;
  --z-nav: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;
}

/* Layer 2: Dark Theme (also serves as :root fallback) */
[data-theme="dark"], :root {
  --color-bg-primary: var(--primitive-gray-950);
  --color-bg-surface: var(--primitive-gray-800);
  --color-bg-elevated: var(--primitive-gray-700);
  --color-bg-overlay: rgba(0, 0, 0, 0.6);

  --color-text-primary: var(--primitive-gray-0);
  --color-text-secondary: var(--primitive-gray-400);
  --color-text-muted: var(--primitive-gray-500);
  --color-text-inverse: var(--primitive-gray-950);

  --color-accent-primary: var(--primitive-lime-500);
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

  --elevation-1: 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px var(--color-border-subtle);
  --elevation-2: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-subtle);
  --elevation-3: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px var(--color-border-subtle);

  --color-morning: var(--primitive-orange-400);
  --color-gym: var(--primitive-lime-500);
  --color-food: var(--primitive-blue-400);
  --color-work: var(--primitive-gray-500);
  --color-free: var(--primitive-purple-400);
  --color-sleep: var(--primitive-gray-700);
  --color-chore: var(--primitive-gray-400);
  --color-social: var(--primitive-red-400);
  --color-flex: var(--primitive-gray-300);

  /* Migration aliases (old token names → new, remove in cleanup) */
  --color-bg: var(--color-bg-primary);
  --color-card: var(--color-bg-surface);
  --color-card-alt: var(--color-bg-elevated);
  --color-text: var(--color-text-primary);
  --color-text-dim: var(--color-text-secondary);
  --color-muted: var(--color-border-default);
  --color-muted-light: var(--color-text-muted);
  --color-border: var(--color-border-default);
  --color-accent: var(--color-accent-primary);
  --color-accent-dim: var(--color-accent-primary-hover);
  --color-red: var(--color-state-error);
  --color-blue: var(--color-accent-secondary);
  --color-orange: var(--color-accent-warm);
  --color-purple: var(--primitive-purple-400);
  --font-heading: var(--font-display);
}

/* Layer 2: Light Theme */
[data-theme="light"] {
  --color-bg-primary: var(--primitive-gray-50);
  --color-bg-surface: var(--primitive-gray-25);
  --color-bg-elevated: var(--primitive-white);
  --color-bg-overlay: rgba(0, 0, 0, 0.3);

  --color-text-primary: var(--primitive-gray-800);
  --color-text-secondary: var(--primitive-gray-500);
  --color-text-muted: var(--primitive-gray-400);
  --color-text-inverse: var(--primitive-gray-0);

  --color-accent-primary: var(--primitive-lime-800);
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

  --elevation-1: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px var(--color-border-subtle);
  --elevation-2: 0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px var(--color-border-subtle);
  --elevation-3: 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px var(--color-border-subtle);

  --color-morning: var(--primitive-orange-600);
  --color-gym: var(--primitive-lime-800);
  --color-food: var(--primitive-blue-600);
  --color-work: var(--primitive-gray-400);
  --color-free: var(--primitive-purple-600);
  --color-sleep: var(--primitive-gray-200);
  --color-chore: var(--primitive-gray-500);
  --color-social: var(--primitive-red-600);
  --color-flex: var(--primitive-gray-400);

  /* Migration aliases for light theme */
  --color-bg: var(--color-bg-primary);
  --color-card: var(--color-bg-surface);
  --color-card-alt: var(--color-bg-elevated);
  --color-text: var(--color-text-primary);
  --color-text-dim: var(--color-text-secondary);
  --color-muted: var(--color-border-default);
  --color-muted-light: var(--color-text-muted);
  --color-border: var(--color-border-default);
  --color-accent: var(--color-accent-primary);
  --color-accent-dim: var(--color-accent-primary-hover);
  --color-red: var(--color-state-error);
  --color-blue: var(--color-accent-secondary);
  --color-orange: var(--color-accent-warm);
  --color-purple: var(--primitive-purple-400);
  --font-heading: var(--font-display);
}
```

- [ ] **Step 3: Verify file created**

Run: `cat src/styles/tokens.css | head -5`
Expected: First 5 lines of the file

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add 3-tier design token system with dark/light themes"
```

---

### Task 2: Create Animations File

**Files:**
- Create: `src/styles/animations.css`

- [ ] **Step 1: Create `src/styles/animations.css`**

Write the complete file using spec section 5 contents. Includes all keyframes (fadeIn, fadeOut, slideUp, slideDown, pulse, flame, shimmer, gradientMesh, scaleIn), utility classes (.animate-*), .skeleton shimmer, .gradient-mesh, and .glass with @supports fallback.

Full contents are in the spec section 5 — copy exactly.

- [ ] **Step 2: Commit**

```bash
git add src/styles/animations.css
git commit -m "feat: add animations file with keyframes, glass, and shimmer utilities"
```

---

### Task 3: Update index.css to Import New Files

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the `@import` font line (line 1) with imports for the new token and animation files**

Remove line 1:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap');
```

Replace with:
```css
@import './styles/tokens.css';
@import './styles/animations.css';
```

- [ ] **Step 2: Remove all CSS custom properties from `:root` block (lines 5-55)**

Remove the entire `:root { ... }` block. These tokens now live in `tokens.css`. The old token names are aliased there for backward compatibility.

- [ ] **Step 3: Remove old keyframe definitions and animation utility classes (lines 191-231)**

Remove `@keyframes fadeIn`, `@keyframes slideUp`, `@keyframes pulse`, `@keyframes flame`, and the `.animate-*` utility classes. These now live in `animations.css`.

- [ ] **Step 4: Update the typography section**

Replace the heading font-family (line 100):
```css
/* Old */
font-family: var(--font-heading);
/* New */
font-family: var(--font-display);
```

- [ ] **Step 5: Update base element styles to new token names**

Update all remaining old-token references in `index.css` base styles (body, input, a, scrollbar, focus-visible):

```css
/* body (lines 74-75) */
background-color: var(--color-bg);   →  background-color: var(--color-bg-primary);
color: var(--color-text);            →  color: var(--color-text-primary);

/* links (lines 113-114, 118) */
color: var(--color-accent);          →  color: var(--color-accent-primary);
color: var(--color-accent-dim);      →  color: var(--color-accent-primary-hover);

/* inputs (lines 135-137, 144, 149) */
background-color: var(--color-card); →  background-color: var(--color-bg-surface);
color: var(--color-text);            →  color: var(--color-text-primary);
border: 2px solid var(--color-border); → border: 2px solid var(--color-border-default);
border-color: var(--color-accent);   →  border-color: var(--color-accent-primary);
color: var(--color-muted);           →  color: var(--color-text-muted);

/* scrollbar (lines 167, 171, 176) */
background: var(--color-bg);         →  background: var(--color-bg-primary);
background: var(--color-muted);      →  background: var(--color-border-default);
background: var(--color-muted-light);→  background: var(--color-text-muted);

/* focus-visible (line 295) */
outline: 2px solid var(--color-accent); → outline: 2px solid var(--color-accent-primary);
```

- [ ] **Step 6: Update utility classes to new token names**

```css
/* Old */
.text-accent { color: var(--color-accent); }
.text-dim { color: var(--color-text-dim); }
.text-muted { color: var(--color-muted-light); }
.bg-card { background-color: var(--color-card); }
.bg-card-alt { background-color: var(--color-card-alt); }
.font-heading { font-family: var(--font-heading); }

/* New */
.text-accent { color: var(--color-accent-primary); }
.text-dim { color: var(--color-text-secondary); }
.text-muted { color: var(--color-text-muted); }
.bg-card { background-color: var(--color-bg-surface); }
.bg-card-alt { background-color: var(--color-bg-elevated); }
.font-heading { font-family: var(--font-display); }
```

- [ ] **Step 7: Verify the app still loads correctly in dark mode**

Run: `npm run dev`
Open in browser. The app should look identical to before (migration aliases ensure backward compatibility).

- [ ] **Step 8: Commit**

```bash
git add src/index.css
git commit -m "refactor: migrate index.css to new token and animation imports"
```

---

### Task 4: Update Font Loading in index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Google Fonts `<link>` tags with preconnect**

Add before the `<link rel="icon">` line (line 18):
```html
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Verify fonts load**

Run: `npm run dev`
Open browser dev tools → Network tab → filter by "fonts". Verify Sora, Outfit, and JetBrains Mono are loading. Text should now render in the new fonts.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Sora, Outfit, JetBrains Mono fonts with preconnect"
```

---

### Task 5: Create useTheme Hook

**Files:**
- Create: `src/hooks/useTheme.jsx`

- [ ] **Step 1: Write the useTheme hook**

```jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    return mq.matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('vida_theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  const bgColor = theme === 'dark' ? '#0e0e12' : '#f5f5f0';

  if (themeColorMeta) themeColorMeta.setAttribute('content', bgColor);
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  // Track whether user has a manual override (vs following system)
  const isManualRef = useRef(localStorage.getItem('vida_theme') !== null);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('vida_theme', newTheme);
    isManualRef.current = true;
    applyTheme(newTheme);
  }, []);

  // Reset to system preference (removes manual override)
  const setSystemTheme = useCallback(() => {
    localStorage.removeItem('vida_theme');
    isManualRef.current = false;
    const systemTheme = getSystemTheme();
    setThemeState(systemTheme);
    applyTheme(systemTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('vida_theme', newTheme);
      isManualRef.current = true;
      applyTheme(newTheme);
      return newTheme;
    });
  }, []);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system preference changes (only when no manual override)
  useEffect(() => {
    let mq;
    try {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }

    const handler = (e) => {
      if (isManualRef.current) return; // User has a manual preference, ignore system changes
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      applyTheme(newTheme);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const value = {
    theme,
    setTheme,
    setSystemTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isManual: isManualRef.current,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTheme.jsx
git commit -m "feat: add useTheme hook with system preference detection"
```

---

### Task 6: Wire ThemeProvider into App

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import**

Add to imports at top of `src/App.jsx`:
```jsx
import { ThemeProvider } from './hooks/useTheme';
```

- [ ] **Step 2: Wrap provider chain with ThemeProvider**

In the `App()` function (line 78-88), wrap `LanguageProvider` with `ThemeProvider`:

```jsx
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Verify theme applies correctly**

Run: `npm run dev`
Open browser. App should look identical (dark mode via `:root` fallback). Open dev tools → Elements → check `<html>` has `data-theme="dark"` (or `"light"` if system preference is light).

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire ThemeProvider as outermost provider in App"
```

---

## Chunk 2: Base Component CSS Migration

### Task 7: Migrate Header CSS

**Files:**
- Modify: `src/components/Header.css`

Current token usage: `--color-card`, `--color-card-alt`, `--color-border`, `--space-sm`, `--space-md`, `--space-xs`, `--space-lg`, `--color-text`, `--color-accent`, `--font-heading`, `--font-mono`, `--transition-fast`

- [ ] **Step 1: Replace old token references with new semantic tokens**

Search-and-replace in `Header.css`:
| Find | Replace |
|---|---|
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-card-alt)` | `var(--color-bg-elevated)` |
| `var(--color-border)` | `var(--color-border-default)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--font-heading)` | `var(--font-display)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |

Keep `--space-*`, `--radius-*`, `--font-mono`, `--transition-fast` as-is (aliased in tokens.css).

- [ ] **Step 2: Verify header renders correctly**

Run: `npm run dev` — check header looks the same.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.css
git commit -m "refactor: migrate Header.css to new design tokens"
```

---

### Task 8: Migrate BottomNav CSS

**Files:**
- Modify: `src/components/BottomNav.css`

Current token usage: `--color-card`, `--color-border`, `--space-sm`, `--space-xs`, `--space-md`, `--space-lg`, `--radius-md`, `--transition-fast`, `--color-card-alt`, `--color-text-dim`, `--color-accent`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-card-alt)` | `var(--color-bg-elevated)` |
| `var(--color-border)` | `var(--color-border-default)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |

- [ ] **Step 2: Add glass effect to bottom nav background**

Per spec section 4.4, the BottomNav gets a glass bg. Add/update the `.bottom-nav` rule:
```css
.bottom-nav {
  background: var(--color-glass-bg);
  border-top: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  z-index: var(--z-nav);
}

@supports not (backdrop-filter: blur(24px)) {
  .bottom-nav {
    background: var(--color-bg-surface);
    opacity: 0.95;
  }
}
```

- [ ] **Step 3: Verify bottom nav renders correctly**

Run: `npm run dev` — check bottom nav.

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomNav.css
git commit -m "refactor: migrate BottomNav.css to new tokens with glass effect"
```

---

### Task 9: Migrate Toast CSS

**Files:**
- Modify: `src/components/Toast.css`

Current token usage: `--space-sm`, `--space-md`, `--space-lg`, `--radius-lg`, `--color-card`, `--color-border`, `--color-text`, `--color-accent`, `--color-red`, `--color-blue`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-border)` | `var(--color-border-default)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--color-red)` | `var(--color-state-error)` |
| `var(--color-blue)` | `var(--color-accent-secondary)` |

- [ ] **Step 2: Update toast to pill shape per spec**

Update toast container border-radius to `var(--radius-full)` and add `z-index: var(--z-toast)`.

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.css
git commit -m "refactor: migrate Toast.css to new tokens with pill shape"
```

---

### Task 10: Migrate BottomSheet CSS

**Files:**
- Modify: `src/components/BottomSheet.css`

Current token usage: `--color-card`, `--radius-xl`, `--space-sm`, `--space-md`, `--space-lg`, `--color-muted`, `--color-text`, `--transition-fast`, `--color-card-alt`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-card-alt)` | `var(--color-bg-elevated)` |
| `var(--color-muted)` | `var(--color-border-default)` |
| `var(--color-text)` | `var(--color-text-primary)` |

- [ ] **Step 2: Add z-index and drag handle styling per spec**

Add `z-index: var(--z-modal)` to the sheet element. If overlay exists, add `z-index: var(--z-overlay)`.

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomSheet.css
git commit -m "refactor: migrate BottomSheet.css to new design tokens"
```

---

### Task 11: Migrate LoadingScreen CSS

**Files:**
- Modify: `src/components/LoadingScreen.css`

Current token usage: `--color-bg`, `--color-accent`, `--font-heading`, `--color-text`, `--space-md`, `--space-lg`, `--color-border`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-bg)` | `var(--color-bg-primary)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--font-heading)` | `var(--font-display)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-border)` | `var(--color-border-default)` |

- [ ] **Step 2: Commit**

```bash
git add src/components/LoadingScreen.css
git commit -m "refactor: migrate LoadingScreen.css to new design tokens"
```

---

## Chunk 3: Page CSS Migration + Theme Toggle

### Task 12: Migrate SchedulePage CSS

**Files:**
- Modify: `src/pages/SchedulePage.css`

Current token usage: `--space-sm`, `--space-md`, `--space-xs`, `--color-card`, `--color-border`, `--radius-md`, `--transition-fast`, `--color-accent`, `--color-text`, `--color-muted`, `--color-text-dim`, `--font-mono`, `--color-blue`, `--color-red`, `--color-muted-light`, `--radius-sm`, `--space-lg`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-border)` | `var(--color-border-default)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-muted)` but NOT `--color-muted-light` | `var(--color-border-default)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |
| `var(--color-blue)` | `var(--color-accent-secondary)` |
| `var(--color-red)` | `var(--color-state-error)` |
| `var(--color-muted-light)` | `var(--color-text-muted)` |

- [ ] **Step 2: Commit**

```bash
git add src/pages/SchedulePage.css
git commit -m "refactor: migrate SchedulePage.css to new design tokens"
```

---

### Task 13: Migrate MealsPage CSS

**Files:**
- Modify: `src/pages/MealsPage.css`

- [ ] **Step 1: Replace old token references**

Same pattern: `--color-card` → `--color-bg-surface`, `--color-border` → `--color-border-default`, `--color-accent` → `--color-accent-primary`, `--color-text` → `--color-text-primary`, `--color-text-dim` → `--color-text-secondary`, `--color-card-alt` → `--color-bg-elevated`, `--color-bg` → `--color-bg-primary`, `--color-muted` → `--color-border-default`, `--color-accent-dim` → `--color-accent-primary-hover`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/MealsPage.css
git commit -m "refactor: migrate MealsPage.css to new design tokens"
```

---

### Task 14: Migrate TrainingPage CSS

**Files:**
- Modify: `src/pages/TrainingPage.css`

- [ ] **Step 1: Replace old token references**

Same pattern plus: `--color-orange` → `--color-accent-warm`, `--color-muted-light` → `--color-text-muted`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/TrainingPage.css
git commit -m "refactor: migrate TrainingPage.css to new design tokens"
```

---

### Task 15: Migrate ProgressPage CSS

**Files:**
- Modify: `src/pages/ProgressPage.css`

- [ ] **Step 1: Replace old token references**

Same pattern. Note this file already uses some new-style tokens (`--space-3`, `--space-4`) — leave those as-is since they match the new system.

- [ ] **Step 2: Commit**

```bash
git add src/pages/ProgressPage.css
git commit -m "refactor: migrate ProgressPage.css to new design tokens"
```

---

### Task 16: Migrate SettingsPage CSS + Add Theme Toggle

**Files:**
- Modify: `src/pages/SettingsPage.css`
- Modify: `src/pages/SettingsPage.jsx`

- [ ] **Step 1: Replace old token references in SettingsPage.css**

Same pattern as other pages.

- [ ] **Step 2: Add theme selector CSS**

Add to `SettingsPage.css`:
```css
.theme-selector {
  display: flex;
  gap: var(--space-2);
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  background: var(--color-bg-surface);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.theme-option:hover {
  border-color: var(--color-accent-primary);
}

.theme-option.active {
  border-color: var(--color-accent-primary);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.theme-option .theme-icon {
  font-size: 1.25rem;
}
```

- [ ] **Step 3: Add theme toggle section to SettingsPage.jsx**

Add import:
```jsx
import { useTheme } from '../hooks/useTheme';
```

Add to component (after existing hooks):
```jsx
const { theme, setTheme, setSystemTheme, isManual } = useTheme();

const currentThemeSelection = isManual ? theme : 'system';
```

Add a new section between the Language section and Actions section:
```jsx
{/* Theme Section */}
<section className="settings-section">
  <div className="settings-section-header">
    <Icon name="moon-half-right-5" className="section-icon" />
    <h2>{language === 'pt-BR' ? 'Tema' : 'Theme'}</h2>
  </div>

  <div className="theme-selector">
    <button
      className={`theme-option ${currentThemeSelection === 'light' ? 'active' : ''}`}
      onClick={() => setTheme('light')}
    >
      <Icon name="sun-1" className="theme-icon" />
      <span>{language === 'pt-BR' ? 'Claro' : 'Light'}</span>
    </button>
    <button
      className={`theme-option ${currentThemeSelection === 'dark' ? 'active' : ''}`}
      onClick={() => setTheme('dark')}
    >
      <Icon name="moon-half-right-5" className="theme-icon" />
      <span>{language === 'pt-BR' ? 'Escuro' : 'Dark'}</span>
    </button>
    <button
      className={`theme-option ${currentThemeSelection === 'system' ? 'active' : ''}`}
      onClick={() => setSystemTheme()}
    >
      <Icon name="laptop-2" className="theme-icon" />
      <span>{language === 'pt-BR' ? 'Sistema' : 'System'}</span>
    </button>
  </div>
</section>
```

- [ ] **Step 4: Verify theme toggle works**

Run: `npm run dev` → Settings → tap Light/Dark/System. Verify:
- Light: backgrounds go off-white, text goes dark
- Dark: backgrounds go dark, text goes light
- System: follows OS preference

- [ ] **Step 5: Commit**

```bash
git add src/pages/SettingsPage.css src/pages/SettingsPage.jsx
git commit -m "feat: add theme toggle to Settings with light/dark/system options"
```

---

## Chunk 4: Hero Moments & Remaining Components

### Task 17: Migrate ExerciseMedia CSS

**Files:**
- Modify: `src/components/ExerciseMedia.css`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-card-alt)` | `var(--color-bg-elevated)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--color-muted)` | `var(--color-border-default)` |
| `var(--color-card)` | `var(--color-bg-surface)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |

- [ ] **Step 2: Commit**

```bash
git add src/components/ExerciseMedia.css
git commit -m "refactor: migrate ExerciseMedia.css to new design tokens"
```

---

### Task 18: Migrate VideoPlayerModal CSS

**Files:**
- Modify: `src/components/VideoPlayerModal.css`

This file uses a **different naming convention** (`--bg-primary`, `--text-primary`, `--border-color`, `--accent`). These don't match either the old OR new system — they need to be mapped to the new tokens.

- [ ] **Step 1: Replace non-standard token references**

| Find | Replace |
|---|---|
| `var(--bg-primary)` | `var(--color-bg-primary)` |
| `var(--bg-secondary)` | `var(--color-bg-surface)` |
| `var(--bg-tertiary)` | `var(--color-bg-elevated)` |
| `var(--text-primary)` | `var(--color-text-primary)` |
| `var(--text-secondary)` | `var(--color-text-secondary)` |
| `var(--text-tertiary)` | `var(--color-text-muted)` |
| `var(--border-color)` | `var(--color-border-default)` |
| `var(--accent)` | `var(--color-accent-primary)` |

Note: This file already uses `--space-3`, `--space-4`, `--space-6`, `--radius-full` which match the new system — leave them as-is.

- [ ] **Step 2: Commit**

```bash
git add src/components/VideoPlayerModal.css
git commit -m "refactor: migrate VideoPlayerModal.css to new design tokens"
```

---

### Task 19: Migrate LoginScreen CSS (Hero Moment)

**Files:**
- Modify: `src/components/LoginScreen.css`

- [ ] **Step 1: Replace old token references**

| Find | Replace |
|---|---|
| `var(--color-bg)` | `var(--color-bg-primary)` |
| `var(--color-accent)` | `var(--color-accent-primary)` |
| `var(--font-heading)` | `var(--font-display)` |
| `var(--color-text)` | `var(--color-text-primary)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |
| `var(--color-muted-light)` | `var(--color-text-muted)` |

- [ ] **Step 2: Add hero moment styling**

Add gradient mesh background and glass card effects to the login screen per spec section 4.9. The login screen should feel premium — add the `.gradient-mesh` class as a background element and use `.glass` for the login card container.

- [ ] **Step 3: Verify login screen looks premium**

Run: `npm run dev` → log out → check login screen has gradient mesh bg and glass card.

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginScreen.css
git commit -m "refactor: migrate LoginScreen.css with hero moment glass effects"
```

---

### Task 20: Migrate OnboardingFlow CSS (Hero Moment)

**Files:**
- Modify: `src/components/OnboardingFlow.css`

This is the largest CSS file (~1700 lines). It has extensive use of old tokens throughout.

- [ ] **Step 1: Global search-and-replace old token references**

Apply the same token replacement pattern across the entire file:
| Find | Replace |
|---|---|
| `var(--color-bg)` | `var(--color-bg-primary)` |
| `var(--color-card)` (not `--color-card-alt`) | `var(--color-bg-surface)` |
| `var(--color-card-alt)` | `var(--color-bg-elevated)` |
| `var(--color-border)` | `var(--color-border-default)` |
| `var(--color-text)` (not `--color-text-dim`) | `var(--color-text-primary)` |
| `var(--color-text-dim)` | `var(--color-text-secondary)` |
| `var(--color-accent)` (not `--color-accent-dim`) | `var(--color-accent-primary)` |
| `var(--color-accent-dim)` | `var(--color-accent-primary-hover)` |
| `var(--color-muted)` (not `--color-muted-light`) | `var(--color-border-default)` |
| `var(--color-muted-light)` | `var(--color-text-muted)` |
| `var(--color-red)` | `var(--color-state-error)` |
| `var(--color-blue)` | `var(--color-accent-secondary)` |
| `var(--color-orange)` | `var(--color-accent-warm)` |
| `var(--font-heading)` | `var(--font-display)` |

- [ ] **Step 2: Add glass card styling to onboarding step containers**

For the step content containers, add glass card treatment:
```css
.onboarding-step-content {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
}

@supports not (backdrop-filter: blur(20px)) {
  .onboarding-step-content {
    background: var(--color-bg-elevated);
    opacity: 0.95;
  }
}
```

- [ ] **Step 3: Enhance generating screen (step 8) with dramatic timing**

Update the generating/loading step animations to use `--duration-dramatic` and `--ease-bounce` for the calculation reveal steps. Add the `.gradient-mesh` class to the generating screen background.

- [ ] **Step 4: Verify onboarding flow visually**

Run: `npm run dev` → reset onboarding in Settings → go through all 8 steps. Verify:
- Glass card effects on step containers
- Generating screen has dramatic animations
- All text readable in both themes

- [ ] **Step 5: Commit**

```bash
git add src/components/OnboardingFlow.css
git commit -m "refactor: migrate OnboardingFlow.css with hero glass effects and dramatic animations"
```

---

### Task 21: Migrate App.css

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Check for hardcoded colors or old tokens**

`App.css` currently uses no CSS variables — only structural layout. No changes needed unless hardcoded colors are found. Verify and move on.

- [ ] **Step 2: Commit (if changes made)**

```bash
git add src/App.css
git commit -m "refactor: verify App.css uses no hardcoded colors"
```

---

## Chunk 5: Cleanup & Verification

### Task 22: Final Cleanup

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/index.css`

- [ ] **Step 1: Verify no old token names remain in component CSS files**

Run a search for old token names across all CSS files:
```bash
grep -rn "var(--color-card)" src/ --include="*.css" | grep -v tokens.css
grep -rn "var(--color-bg)" src/ --include="*.css" | grep -v tokens.css | grep -v "color-bg-"
grep -rn "var(--color-text)" src/ --include="*.css" | grep -v tokens.css | grep -v "color-text-"
grep -rn "var(--color-accent)" src/ --include="*.css" | grep -v tokens.css | grep -v "color-accent-"
grep -rn "var(--font-heading)" src/ --include="*.css" | grep -v tokens.css
```

Each command should return no results. If any old references remain, fix them.

- [ ] **Step 2: Verify no hardcoded hex colors remain in component CSS**

```bash
grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" | grep -v tokens.css | grep -v animations.css | grep -v index.css
```

Review any hits — some may be legitimate (e.g., gradient stops, box-shadow colors). Ensure none are colors that should be tokens.

- [ ] **Step 3: Test both themes end-to-end**

Run: `npm run dev`
1. Test dark mode: navigate all 5 pages, check all components render correctly
2. Switch to light mode in Settings: navigate all 5 pages again
3. Switch to system: verify it follows OS preference
4. Check onboarding flow in light mode (reset onboarding if needed)
5. Check login screen in both themes (log out)

- [ ] **Step 4: Run build to verify no CSS errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit final cleanup (only stage files that were modified)**

```bash
git add src/styles/ src/index.css src/components/*.css src/pages/*.css
git commit -m "chore: final cleanup — verify all CSS migrated to new design tokens"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|---|---|---|
| 1: Foundation | Tasks 1-6 | Token files, animations, fonts, theme hook, provider wiring |
| 2: Base Components | Tasks 7-11 | Header, BottomNav, Toast, BottomSheet, LoadingScreen migrated |
| 3: Pages + Toggle | Tasks 12-16 | All 5 pages migrated, theme toggle in Settings |
| 4: Hero + Remaining | Tasks 17-21 | Login, Onboarding, ExerciseMedia, VideoPlayerModal, App.css |
| 5: Cleanup | Task 22 | Verify migration complete, test both themes, build check |
