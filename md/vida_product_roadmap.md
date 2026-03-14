# Vida App - Product Roadmap & Implementation Plan

## Overview
Vida is evolving from a gym-focused native application into a comprehensive, highly personalized life and sports companion. The app will build a deeply custom wellbeing plan based on an engaging onboarding experience, tracking fitness, nutrition, sleep, and body measurements. It will support a wide variety of sports, connect seamlessly with smart wearables, and eventually offer a creator marketplace for training courses. It will utilize a premium subscription model to monetize the platform.

## 🎯 UX/UI & Design Principles
- **Dynamic Onboarding**: Fast, engaging, and flow-oriented. It should feel exciting to start, never like a boring questionnaire.
- **Holistic Companion**: The UI needs to feel personal, supportive, and motivating, as if it was crafted specifically for the user.
- **Ease of Use**: Complex data (sleep schedules, nutrition, integrations) must be simplified into digestible, beautiful charts and cards.

## 🏗️ Technical Architecture Setup
- **Backend & Database**: We will use **Supabase**, which is a complete backend-as-a-service built on Postgres. It handles authentication, database, edge functions, and storage out of the box. *(Note: Neon is a fantastic serverless Postgres database, but Supabase provides more of the app-level features we need right away to move fast).*
- **Integrations**: APIs for **Oura**, **Garmin**, and Apple HealthKit/Google Fit will be essential for passive data collection (sleep, readiness, daily activity).

---

## 📦 Epics Breakdown

### Epic 1: The "Exciting Onboarding" & Foundation
**Goal**: Create an amazing first impression where the app learns about the user to build their personalized plan.
- **Task 1.1**: Design & implement the fluid, exciting Onboarding Flow (capturing diet, wake hours, life activities, goals), **integrating the existing questionnaire**.
- **Task 1.2**: Audit and refactor current UI/UX for consistent, premium styling.
- **Task 1.3**: Revamp User Profile & Build comprehensive Settings page.

### Epic 2: The "Smart Companion" & Routine Planner
**Goal**: Use onboarding data to generate a truly personalized wellbeing and training plan.
- **Task 2.1**: Develop the "Smart Routine Planner" engine (processes onboarding data for customized plans).
- **Task 2.2**: Calendar integration for planning future training days based on the personalized plan.
- **Task 2.3**: Weekly personal summary insights (adapting based on progress and wearable data).
- **Task 2.4**: Manual tracking entry for users without smart devices, ensuring the app remains accessible and tracks data via web interface (acting as a mobile proxy for now).

### Epic 3: Expanded Sports & Activities
**Goal**: Support a wider array of disciplines beyond the gym.
- **Task 3.1**: Database schema updates (Supabase) to support polymorphic sports types.
- **Task 3.2**: Add immediate support for **Jogging** and **Running**, alongside standard Gym tracking.
- **Task 3.3**: Architecture preparation for future sports expansion (Swimming, Snowboarding, Basketball, Climbing, Soccer, Hockey, Sauna, Calisthenics, Pilates, Yoga, Functional, Crossfit).

### Epic 4: Biometrics, Holistic Health & Wearables
**Goal**: Integrate tracking for sleep, nutrition, and body measurements, powered by smart devices.
- **Task 4.1**: Wearable Integrations (Oura, Garmin, HealthKit/Google Fit) for seamless health data syncing.
- **Task 4.2**: Body Fat Calculator & Measurement logger.
- **Task 4.3**: Sleep Schedule & Nutrition/Macros tracking interfaces.

### Epic 5: The Content Hub & Creator Marketplace
**Goal**: Provide curated resources, transitioning later to a community marketplace.
- **Task 5.1**: Build the initial Learning Hub focusing on templates and training protocols for our inaugural supported activities: **Gym, Cross Fit, Calisthenics, Yoga, Pilates, and general Cardio.**
- **Task 5.2**: Implement the "Training Programs" feature (multi-week structured plans).
- **Task 5.3**: *(Future)* Evolve the Hub into a **Marketplace** for creators to upload courses and monetize (implementing a platform fee system).

### Epic 6: Monetization & Subscriptions
**Goal**: Gate premium content and handle course marketplace economics.
- **Task 6.1**: Design and implement Subscription Paywall UI.
- **Task 6.2**: Integrate Payment Gateway (e.g., Apple In-App Purchases, Google Play Billing, or Stripe if web).
- **Task 6.3**: Implement backend logic for Subscriptions and Creator Payouts (for the marketplace).

---

## 🏃‍♂️ Sprint Plan (Suggested Iterations)

- **Sprint 1**: The "Exciting Onboarding" experience & Supabase Infrastructure setup.
- **Sprint 2**: Smart Routine Planner algorithm and Calendar integration.
- **Sprint 3**: Expanding Sports (Jogging, Running) & Workouts UI.
- **Sprint 4**: Wearable Integrations (Oura, Garmin) and Biometrics.
- **Sprint 5**: Sleep & Nutrition tracking UI.
- **Sprint 6**: Initial Learning Hub with template routines.
- **Sprint 7**: Subscription setup, Paywall, and Integrations.
- **Future Sprints**: Expanding sports list (Swimming, Snowboarding, Sauna, etc.), developing the Creator Marketplace.
