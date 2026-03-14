# Project Management Instructions for Claude Code

## Context for Claude Code
You are taking over development for an application called **Vida**, a premium, holistic life and sports companion app. The planning phase has been completed by Antigravity (a planning AI) and the user. Your role is now **Lead Developer**.

You must rigorously follow the `vida_master_plan.md` document for all structural and feature decisions.

## Goal
Your current focus is **Sprint 1: The "Exciting Onboarding" experience & Supabase Infrastructure setup.**

## Execution Steps for Claude Code

Please execute the following steps sequentially. Do not move to the next step until the previous one is fully functional, tested, and approved by the user.

### Step 1: Project & Supabase Initialization
1. Ensure the Next.js/React project is properly initialized (if using Vite/React, ensure dependencies are clean).
2. Set up the local Supabase environment (`supabase init`, `supabase start`).
3. Create the initial database schema (using migrations) for the Users table, taking into account the data we need to store from the Onboarding flow (Wake time, sleep hours, lunch, dinner, office times, goals, biometric baselines).

### Step 2: Global UI/UX Refactoring
1. Review the current styling in `src/`.
2. Implement a responsive, premium Design System matching the principles in the master plan (dynamic, holistic, easy to use). 
3. Setup global CSS or styled-components/Tailwind to ensure consistency across the app.

### Step 3: The Exciting Onboarding Flow (Frontend)
1. Replace the existing generic questionnaire in `src/components/OnboardingFlow.jsx` with the fluid, 8-step "Exciting Onboarding" flow outlined in Section 3 of the `vida_master_plan.md`.
2. Focus heavily on smooth transitions, micro-animations, and immediate visual feedback (e.g., dynamic bedtime calculations).
3. Ensure the form state is managed cleanly and connects to the Supabase backend upon completion.

### Step 4: The Smart Planner Hookup (Backend/Logic)
1. Implement the "Generating Step" logic.
2. Write edge functions or client-side logic that takes the onboarding inputs and generates the first "Ideal Week" schedule for the user, saving it to their Supabase profile.

## Operating Rules for Claude Code
*   **Aesthetics Matter**: If the UI looks basic, you have failed the assignment. Vida is a premium app.
*   **Atomic Commits**: Commit your code frequently after completing logical chunks.
*   **Check In**: After Step 3 (Onboarding Frontend completion), pause and ask the user to test the visual flow before wiring up complex backend generation logic.
