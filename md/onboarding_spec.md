# Vida App - The "Exciting Onboarding" Flow Spec

## Overview
This specification details how the existing questionnaire from `OnboardingFlow.jsx` maps into the new, dynamic "Exciting Onboarding" flow that powers the **Smart Routine Planner**. The goal is an energetic, fluid experience avoiding a "boring questionnaire" feel while capturing comprehensive health data.

---

## 🚀 The Flow: Step-by-Step

### 1. Welcome & Language
*   **The Vibe**: energetic, animated greeting explaining the app will build a custom life plan.
*   **Inputs**: Choose Language.

### 2. Biological Clock (Sleep & Wake)
*(Integrating old: Wake Time, Sleep Hours)*
*   **The Vibe**: "Let's set your foundation."
*   **Inputs**:
    *   What time do you usually wake up? (e.g., 07:00)
    *   How many hours of sleep do you aim for? (Slider: 4h - 10h)
*   **Smart Action**: App instantly calculates and previews the ideal bedtime.

### 3. Nutrition Routine (Lunch & Dinner)
*(Integrating old: Lunch Time, Dinner Time)*
*   **The Vibe**: "Fueling the machine."
*   **Inputs**:
    *   Typical Lunch Time.
    *   Typical Dinner Time.
*   **Smart Action**: App checks the gap (e.g., warning if dinner is <3h after lunch).

### 4. Daily Life & Work (Office vs Remote)
*(Integrating old: Office Days, Office Start/End)*
*   **The Vibe**: "Balancing life and training."
*   **Inputs**:
    *   How many days in the office? (Counter: 0 - 5)
    *   *If > 0*: Office Start Time and Office End Time.
*   **Smart Action**: App reserves these blocks as non-negotiable "busy" periods in the calendar.

### 5. Training Preferences & Modalities (New Addition)
*(Integrating old: Gym Preference + New Sports)*
*   **The Vibe**: "How do you like to move?"
*   **Inputs**:
    *   **When**: Morning, Evening, or Flexible? (Old Gym Preference)
    *   **What**: Select primary activities (Gym, Cross Fit, Calisthenics, Yoga, Pilates, Cardio).

### 6. Personal Goals & Aspirations
*(Integrating old: Goals)*
*   **The Vibe**: "What are we aiming for?"
*   **Inputs**: Select Multiple Goals (Muscle Gain, Fat Loss, Health, Energy, Strength, Flexibility, Endurance, Sleep Quality).

### 7. Physical Baseline (Optional)
*(Integrating old: Physical Data)*
*   **The Vibe**: "Let's track the starting line."
*   **Inputs (Optional)**:
    *   Weight
    *   Height
    *   Body Fat %
*   *(Future)*: Seamless integration with Oura/Garmin/Apple Health can pre-fill or track these automatically.

### 8. The Smart Planner Engine (Generating Step)
*(Integrating old: Generating step)*
*   **The Vibe**: High-tech loading screens showcasing the calculation process.
*   **Smart Action**: The engine takes the Wake time, Sleep time, Work blocks, Meal blocks, and Training Preferences to generate a **personalized daily schedule** and **workout routine**!

---
> [!TIP]
> **UX Strategy**: Transition between steps using fluid animations. Use bold colors, engaging icons, and immediate visual feedback (like the dynamic bedtime calculation or sleep quality badge) to make inputting data feel rewarding rather than tedious.
