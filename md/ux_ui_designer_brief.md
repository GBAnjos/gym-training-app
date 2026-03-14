# Lead UX/UI Designer Brief - Vida App

## Overview & Vision
Welcome to the Vida team! As the **Lead UX/UI Designer**, your mission is to transform Vida into a premium, highly personalized, and holistic life and sports companion app. 

Your overarching goal is to make the app feel **alive, supportive, and exquisitely premium**. The interface should be dynamic and visually stunning, breaking away from the mold of standard, generic fitness trackers. 

You must align your designs with the core principles mapped out in the `vida_master_plan.md` document.

## 🎨 Core Design Aesthetics & Requirements
1.  **Vibrant & Premium Aesthetics**: Avoid generic, flat colors. Utilize curated, harmonious color palettes (e.g., sleek dark modes with electric, neon, or vibrant accents). The user must be "wowed" at first glance. **Crucially, the app must fully support both Light Mode and Dark Mode. You must never use 100% black (#000000) or 100% white (#FFFFFF) for backgrounds or primary text—use rich off-blacks and soft off-whites instead.**
2.  **Modern Typography**: Employ sleek, highly legible, modern fonts (e.g., Inter, Roboto, Outfit) over basic browser defaults to establish a strong brand identity.
3.  **Dynamic Interactions**: The app should feel responsive. Employ glassmorphism (where appropriate), smooth gradients, and subtle micro-animations (hover effects, loading states, transition animations).
4.  **Complex Data, Simple Views**: Fitness tracking requires heavy data points (Sleep cycles, Nutrition macros, Workout splits). Your challenge is to simplify this complex data into beautifully crafted, easily digestible charts, cards, and summaries.

---

## 🚀 Execution Priorities (Sprint 1)

Your immediate focus is to design the UI for **Sprint 1: The "Exciting Onboarding" Flow & The Core Profile**.

### Priority 1: The Design System (The "Foundation")
Before jumping into individual screens, establish the Vida Design System.
*   **Deliverable**: A comprehensive UI Kit (Figma/Sketch) containing the core color palette, typography hierarchy, primary/secondary buttons, form inputs, toggles, icons, and card containers. 
*   **Vibe**: Sleek, modern, premium, encouraging.

### Priority 2: The "Exciting Onboarding" Flow
The onboarding flow is critical. It gathers massive amounts of personal data to feed the "Smart Planner", but it *cannot* feel like a boring medical questionnaire. It needs to feel like an exciting beginning to a personal journey.

*   **Reference**: See Section 3 of `vida_master_plan.md` for the exact input requirements (Wake times, Office hours, Goals, Workouts).
*   **Deliverables**:
    *   High-fidelity mockups for all 8 onboarding steps.
    *   Prototype the transitions between these steps. Show how the UI reacts dynamically (e.g., how the UI visually updates when the user inputs their Wake Time to instantly calculate and show their target Bed Time).
    *   Design the "Generating Step" (Step 8)—a high-tech, engaging loading screen that makes the user feel their personalized plan is being actively crafted.

### Priority 3: The User Profile & Settings
*   **Deliverables**:
    *   A premium User Profile screen summarizing their current active sports, goals, and high-level progression.
    *   An intuitive, clean Settings page to manage notifications, privacy, subscriptions, and connected wearables (Oura, Garmin).

---

## 🤝 Working with Engineering (Claude Code)
You will be working hand-in-hand with our Lead Developer (Claude Code).
*   Ensure your design handoffs (Figma files/CSS specs) clearly articulate your required micro-animations and transition states.
*   Since Claude Code will be implementing this directly into Next.js/React, ensure your design components are modular and reusable.
