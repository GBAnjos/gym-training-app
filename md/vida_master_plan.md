# Vida App - The Master Plan

## 1. Product Vision & Architecture Overview
Vida is evolving from a gym-focused native application into a comprehensive, highly personalized life and sports companion. The app will build a deeply custom wellbeing plan based on an engaging onboarding experience, tracking fitness, nutrition, sleep, and body measurements. It will support a wide variety of sports, connect seamlessly with smart wearables, and eventually offer a creator marketplace for training courses. It will utilize a premium subscription model to monetize the platform.

### 🎯 UX/UI & Design Principles
- **Dynamic Onboarding**: Fast, engaging, and flow-oriented. Vivid animations and immediate visual feedback.
- **Holistic Companion**: The UI needs to feel personal, supportive, and motivating.
- **Ease of Use**: Complex data (sleep schedules, nutrition) simplified into digestible, beautiful charts and cards.

### 🏗️ Technical Architecture Setup
- **Frontend Framework**: Next.js / React (or React Native for mobile).
- **Backend & Database**: **Supabase** (Postgres) handling authentication, database, edge functions, and storage.
- **Integrations**: APIs for **Oura**, **Garmin**, and Apple HealthKit/Google Fit.

---

## 2. Epics & Sprint Breakdown

### Epic 1: The "Exciting Onboarding" & Foundation
**Goal**: Create an amazing first impression where the app learns about the user to build their personalized plan.
*(See detailed Onboarding Spec in section 3)*
- **Task 1.1**: Design & implement the fluid Onboarding Flow.
- **Task 1.2**: Audit and refactor current UI/UX for consistent, premium styling.
- **Task 1.3**: Revamp User Profile & Build comprehensive Settings page.

### Epic 2: The "Smart Companion" & Routine Planner
**Goal**: Use onboarding data to generate a truly personalized wellbeing and training plan.
- **Task 2.1**: Develop the "Smart Routine Planner" engine.
- **Task 2.2**: Calendar integration for planning future training days based on the personalized plan.
- **Task 2.3**: Weekly personal summary insights.
- **Task 2.4**: Manual tracking entry for users without smart devices (web interface accessible).

### Epic 3: Expanded Sports & Activities
**Goal**: Support a wider array of disciplines beyond the gym.
- **Task 3.1**: Database schema updates (Supabase) for polymorphic sports types.
- **Task 3.2**: Immediate support for **Jogging** and **Running**.
- **Task 3.3**: Architecture prep for future sports (Swimming, Snowboarding, etc.).

### Epic 4: Biometrics, Holistic Health & Wearables
**Goal**: Integrate tracking for sleep, nutrition, and body measurements.
- **Task 4.1**: Wearable Integrations (Oura, Garmin, HealthKit/Google Fit).
- **Task 4.2**: Body Fat Calculator & Measurement logger.
- **Task 4.3**: Sleep Schedule & Nutrition/Macros tracking interfaces.

### Epic 5: The Content Hub & Creator Marketplace
**Goal**: Provide curated resources, transitioning later to a community marketplace.
- **Task 5.1**: Build initial Learning Hub for **Gym, Cross Fit, Calisthenics, Yoga, Pilates, and Cardio.**
- **Task 5.2**: Implement "Training Programs" (multi-week structured plans).
- **Task 5.3**: *(Future)* Marketplace for creators to upload courses and monetize.

### Epic 6: Monetization & Subscriptions
**Goal**: Gate premium content and handle course marketplace economics.
- **Task 6.1**: Design Subscription Paywall UI.
- **Task 6.2**: Integrate Payment Gateway.
- **Task 6.3**: Implement backend logic for Subscriptions and Creator Payouts.

---

## 3. The "Exciting Onboarding" Spec (Epic 1 Detail)

The goal is an energetic, fluid experience avoiding a "boring questionnaire" feel while capturing comprehensive health data to power the Smart Routine Planner.

### Flow Outline
1.  **Welcome & Language**: Energetic greeting. Input: Language.
2.  **Biological Clock (Sleep & Wake)**: "Let's set your foundation." Inputs: Wake Time, Target Sleep Hours. *Smart Action*: Instant ideal bedtime calculation.
3.  **Nutrition Routine (Lunch & Dinner)**: "Fueling the machine." Inputs: Lunch Time, Dinner Time. *Smart Action*: Gap checking.
4.  **Daily Life & Work**: "Balancing life and training." Inputs: Office Days, Start/End Times. *Smart Action*: Calendar blocking.
5.  **Training Preferences (When & What)**: "How do you like to move?" Inputs: Time preference (Morning/Evening/Flex) and Activities (Gym, Cross Fit, Calisthenics, Yoga, Pilates, Cardio).
6.  **Personal Goals & Aspirations**: "What are we aiming for?" Inputs: Muscle Gain, Fat Loss, Health, Energy, Strength, Flexibility, Endurance, Sleep Quality.
7.  **Physical Baseline (Optional)**: Inputs: Weight, Height, Body Fat %.
8.  **The Smart Planner Engine (Generating Step)**: High-tech loading screens showcasing the calculation process, generating the daily schedule and workout routine.
