# Implementation Plan: Activity Management & Dashboard Refinement

## Overview
This plan outlines the steps to finalize the implementation of the activity management system, ensuring all new features (multi-activity support, dynamic profile updates, and dashboard integration) are fully functional and visually consistent.

## 1. Data Layer & Persistence
- [ ] **Verify Supabase Integration**: Ensure `updateProfile` and `updateActivity` functions correctly sync `main_profile` and activity preferences to the Supabase database.
- [ ] **Schema Validation**: Confirm that the `main_profile` table in Supabase supports the new JSON structure for activity preferences.

## 2. Feature Implementation (Activity Management)
- [ ] **Dynamic Profile Updates**: Implement the logic to trigger a profile refresh/re-fetch when activity preferences are changed in the settings.
- [ ] **Activity Preference Sync**: Ensure that changing an activity (e.g., adding 'Running') immediately updates the user's dashboard and available training modules.

## 3. UI/UX Refinement (Dashboard & Settings)
- [ ] **Dashboard Integration**: Update the Dashboard view to dynamically render components based on the user's active activities (e.m., showing a 'Running' tracker if running is enabled).
- [ ] **Activity Settings UI**: Refine the activity selection UI in the user settings to be more intuitive (e.g., using toggles or checkboxes).
- [ ] **Visual Consistency**: Ensure that all activity-specific widgets (e.g., Running tracker, Yoga tracker) follow the same design language as the existing gym/weightlifting widgets.

## 4. Testing & QA
- [ ] **End-to-End Testing**: Verify the full flow: User enables a new activity $\rightarrow$ Profile updates $\rightarrow$ Dashboard reflects the new activity $\rightarrow$ Activity tracker works correctly.
- [ ] **Regression Testing**: Ensure that existing weightlifting/gym features remain unaffected by the new multi-activity architecture.
- [ ] **Performance Check**: Monitor the impact of the dynamic dashboard rendering on initial load times.