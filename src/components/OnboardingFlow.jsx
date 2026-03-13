import { useState, useMemo } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { Icon } from './Icon';
import './OnboardingFlow.css';

// New 8-step onboarding flow per Patch 01 spec
const STEPS = [
  'welcome',
  'language',
  'wakeTime',      // Step 1: What time do you wake up?
  'sleepHours',    // Step 2: How many hours do you sleep?
  'lunchTime',     // Step 3: What time do you have lunch?
  'dinnerTime',    // Step 4: What time do you have dinner?
  'gymPreference', // Step 5: When do you prefer to workout?
  'officeDays',    // Step 6: Office days + hours
  'goals',         // Step 7: What are your goals?
  'physicalData',  // Step 8: Physical data (optional)
  'generating'
];

export function OnboardingFlow({ onComplete }) {
  const { completeOnboarding } = useOnboarding();
  const { t, language, setLanguage, languages } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showLateWarning, setShowLateWarning] = useState(false);

  const [profile, setProfile] = useState({
    // Step 1-4: Times
    wakeTime: '07:00',
    sleepHours: 7,
    lunchTime: '12:30',
    dinnerTime: '19:30',

    // Step 5: Gym preference
    gymPreference: '', // 'morning' | 'evening' | 'flexible'

    // Step 6: Office
    officeDaysCount: 0,
    officeStart: '09:00',
    officeEnd: '18:00',

    // Step 7: Goals
    goals: [],

    // Step 8: Physical data (optional)
    weight: '',
    height: '',
    bodyFatPercent: '',

    // Settings
    preferredLanguage: language
  });

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const toggleGoal = (goalId) => {
    setProfile(prev => {
      const current = prev.goals;
      if (current.includes(goalId)) {
        return { ...prev, goals: current.filter(g => g !== goalId) };
      } else {
        return { ...prev, goals: [...current, goalId] };
      }
    });
    if (errors.goals) {
      setErrors(prev => ({ ...prev, goals: null }));
    }
  };

  // Calculate sleep time dynamically
  const calculatedSleepTime = useMemo(() => {
    const [wakeHour, wakeMin] = profile.wakeTime.split(':').map(Number);
    let sleepHour = wakeHour - profile.sleepHours;
    if (sleepHour < 0) sleepHour += 24;
    return `${sleepHour.toString().padStart(2, '0')}:${wakeMin.toString().padStart(2, '0')}`;
  }, [profile.wakeTime, profile.sleepHours]);

  // Check if dinner is at least 3h after lunch
  const dinnerGapWarning = useMemo(() => {
    const [lunchH, lunchM] = profile.lunchTime.split(':').map(Number);
    const [dinnerH, dinnerM] = profile.dinnerTime.split(':').map(Number);
    const lunchMinutes = lunchH * 60 + lunchM;
    const dinnerMinutes = dinnerH * 60 + dinnerM;
    const gap = dinnerMinutes - lunchMinutes;
    return gap < 180; // Less than 3 hours
  }, [profile.lunchTime, profile.dinnerTime]);

  // Get sleep feedback message
  const sleepFeedback = useMemo(() => {
    if (profile.sleepHours < 6) return { type: 'warning', key: 'step_sleep_feedback_low' };
    if (profile.sleepHours >= 7 && profile.sleepHours <= 8) return { type: 'good', key: 'step_sleep_feedback_good' };
    return { type: 'great', key: 'step_sleep_feedback_high' };
  }, [profile.sleepHours]);

  const validateStep = (stepName) => {
    const newErrors = {};

    switch (stepName) {
      case 'wakeTime':
        // Check if wake time is after 10:00
        const [hour] = profile.wakeTime.split(':').map(Number);
        if (hour >= 10) {
          setShowLateWarning(true);
          return false; // Show warning modal first
        }
        break;

      case 'gymPreference':
        if (!profile.gymPreference) {
          newErrors.gymPreference = t('error_required_gym_pref');
        }
        break;

      case 'goals':
        if (profile.goals.length === 0) {
          newErrors.goals = t('error_required_goals');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const currentStepName = STEPS[currentStep];

    // Skip validation for welcome, language, physicalData (optional), generating
    const skipValidation = ['welcome', 'language', 'sleepHours', 'lunchTime', 'dinnerTime', 'officeDays', 'physicalData', 'generating'];

    if (skipValidation.includes(currentStepName) || validateStep(currentStepName)) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLateWarningContinue = () => {
    setShowLateWarning(false);
    setCurrentStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    // Move to generating step
    const generatingIndex = STEPS.indexOf('generating');
    setCurrentStep(generatingIndex);

    const finalProfile = {
      ...profile,
      sleepTime: calculatedSleepTime,
      preferredLanguage: language
    };

    // Generate schedule dynamically based on profile
    const schedule = generateScheduleFromProfile(finalProfile);

    // Save generated schedule
    localStorage.setItem('vida_generated_schedule', JSON.stringify(schedule));
    localStorage.setItem('vida_user_profile', JSON.stringify(finalProfile));

    await new Promise(resolve => setTimeout(resolve, 2500));
    await completeOnboarding(finalProfile);
    onComplete();
  };

  const renderStep = () => {
    const stepName = STEPS[currentStep];
    const props = {
      t,
      profile,
      updateProfile,
      toggleGoal,
      errors,
      onNext: nextStep,
      onBack: prevStep,
      language,
      setLanguage,
      languages,
      sleepFeedback,
      calculatedSleepTime,
      dinnerGapWarning,
      onFinish: handleFinish
    };

    switch (stepName) {
      case 'welcome':
        return <WelcomeStep {...props} />;
      case 'language':
        return <LanguageStep {...props} />;
      case 'wakeTime':
        return <WakeTimeStep {...props} />;
      case 'sleepHours':
        return <SleepHoursStep {...props} />;
      case 'lunchTime':
        return <LunchTimeStep {...props} />;
      case 'dinnerTime':
        return <DinnerTimeStep {...props} />;
      case 'gymPreference':
        return <GymPreferenceStep {...props} />;
      case 'officeDays':
        return <OfficeDaysStep {...props} />;
      case 'goals':
        return <GoalsStep {...props} />;
      case 'physicalData':
        return <PhysicalDataStep {...props} />;
      case 'generating':
        return <GeneratingStep {...props} />;
      default:
        return null;
    }
  };

  // Calculate progress (exclude welcome, language, generating)
  const progressSteps = STEPS.filter(s => !['welcome', 'language', 'generating'].includes(s));
  const currentProgressIndex = progressSteps.indexOf(STEPS[currentStep]);
  const showProgress = currentProgressIndex >= 0;

  return (
    <div className="onboarding">
      {showProgress && (
        <div className="onboarding-header">
          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${((currentProgressIndex + 1) / progressSteps.length) * 100}%` }}
            />
          </div>
          <span className="onboarding-step-count">
            {t('onboarding_step')} {currentProgressIndex + 1} {t('onboarding_of')} {progressSteps.length}
          </span>
        </div>
      )}
      <div className="onboarding-content">
        {renderStep()}
      </div>

      {/* Late Wake Warning Modal */}
      {showLateWarning && (
        <div className="onboarding-modal-overlay">
          <div className="onboarding-modal">
            <div className="modal-icon warning">
              <Icon name="information-circle-1" />
            </div>
            <h3>{t('step_wake_late_warning_title')}</h3>
            <p>{t('step_wake_late_warning_desc')}</p>
            <button className="btn-primary" onClick={handleLateWarningContinue}>
              {t('continue')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== STEP COMPONENTS ====================

function WelcomeStep({ t, onNext }) {
  return (
    <div className="step welcome-step">
      <div className="welcome-logo">
        <Icon name="dumbbell-1" className="welcome-icon" />
      </div>
      <h1 className="welcome-title">{t('onboarding_welcome_title')}</h1>
      <p className="welcome-tagline">{t('app_tagline')}</p>
      <p className="welcome-description">{t('onboarding_welcome_desc')}</p>
      <button className="btn-primary btn-large" onClick={onNext}>
        {t('onboarding_start')}
        <Icon name="arrow-right-1" className="btn-icon" />
      </button>
    </div>
  );
}

function LanguageStep({ t, language, setLanguage, languages, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('language_title')}</h2>
        <p>{t('language_desc')}</p>
      </div>

      <div className="form-section">
        <div className="language-options">
          {languages.map(lang => (
            <button
              key={lang.code}
              type="button"
              className={`language-btn ${language === lang.code ? 'selected' : ''}`}
              onClick={() => setLanguage(lang.code)}
            >
              <Icon name="world-1" className="language-flag" />
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function WakeTimeStep({ t, profile, updateProfile, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="sun-1" className="step-icon" />
        </div>
        <h2>{t('step_wake_title')}</h2>
        <p>{t('step_wake_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group centered">
          <label>{t('step_wake_label')}</label>
          <input
            type="time"
            value={profile.wakeTime}
            onChange={(e) => updateProfile('wakeTime', e.target.value)}
            className="input-field time-input-large"
          />
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function SleepHoursStep({ t, profile, updateProfile, sleepFeedback, calculatedSleepTime, onNext, onBack }) {
  const feedbackClass = sleepFeedback.type === 'warning' ? 'feedback-warning' :
                        sleepFeedback.type === 'good' ? 'feedback-good' : 'feedback-great';

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="moon-half-right-5" className="step-icon" />
        </div>
        <h2>{t('step_sleep_title')}</h2>
        <p>{t('step_sleep_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group centered">
          <label>{t('step_sleep_label')}</label>
          <div className="slider-container">
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={profile.sleepHours}
              onChange={(e) => updateProfile('sleepHours', parseFloat(e.target.value))}
              className="sleep-slider"
            />
            <div className="slider-value">{profile.sleepHours}h</div>
          </div>
          <div className="slider-labels">
            <span>4h</span>
            <span>10h</span>
          </div>
        </div>

        <div className={`sleep-feedback ${feedbackClass}`}>
          <Icon name={sleepFeedback.type === 'warning' ? 'information-circle-1' : 'checkmark-circle-1'} />
          <span>{t(sleepFeedback.key)}</span>
        </div>

        <div className="calculated-time">
          <Icon name="moon-half-right-5" />
          <span>Hora de dormir: <strong>{calculatedSleepTime}</strong></span>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function LunchTimeStep({ t, profile, updateProfile, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="knife-fork-1" className="step-icon" />
        </div>
        <h2>{t('step_lunch_title')}</h2>
        <p>{t('step_lunch_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group centered">
          <label>{t('step_lunch_label')}</label>
          <input
            type="time"
            value={profile.lunchTime}
            onChange={(e) => updateProfile('lunchTime', e.target.value)}
            className="input-field time-input-large"
          />
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function DinnerTimeStep({ t, profile, updateProfile, dinnerGapWarning, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="knife-fork-1" className="step-icon" />
        </div>
        <h2>{t('step_dinner_title')}</h2>
        <p>{t('step_dinner_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group centered">
          <label>{t('step_dinner_label')}</label>
          <input
            type="time"
            value={profile.dinnerTime}
            onChange={(e) => updateProfile('dinnerTime', e.target.value)}
            className="input-field time-input-large"
          />
        </div>

        {dinnerGapWarning && (
          <div className="dinner-gap-warning">
            <Icon name="information-circle-1" />
            <span>{t('step_dinner_gap_warning')}</span>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function GymPreferenceStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  const options = [
    { id: 'morning', icon: 'sun-1', label: t('step_gym_morning'), desc: t('step_gym_morning_desc') },
    { id: 'evening', icon: 'moon-half-right-5', label: t('step_gym_evening'), desc: t('step_gym_evening_desc') },
    { id: 'flexible', icon: 'refresh-circle-1-clockwise', label: t('step_gym_flexible'), desc: t('step_gym_flexible_desc') },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="dumbbell-1" className="step-icon" />
        </div>
        <h2>{t('step_gym_title')}</h2>
        <p>{t('step_gym_desc')}</p>
      </div>

      <div className="form-section">
        <div className="gym-preference-options">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`gym-pref-btn ${profile.gymPreference === opt.id ? 'selected' : ''}`}
              onClick={() => updateProfile('gymPreference', opt.id)}
            >
              <Icon name={opt.icon} className="gym-pref-icon" />
              <div className="gym-pref-content">
                <span className="gym-pref-label">{opt.label}</span>
                <span className="gym-pref-desc">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
        {errors.gymPreference && <span className="error-text">{errors.gymPreference}</span>}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function OfficeDaysStep({ t, profile, updateProfile, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="briefcase-1" className="step-icon" />
        </div>
        <h2>{t('step_office_title')}</h2>
        <p>{t('step_office_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('step_office_count_label')}</label>
          <div className="counter-input">
            <button
              type="button"
              className="counter-btn"
              onClick={() => updateProfile('officeDaysCount', Math.max(0, profile.officeDaysCount - 1))}
              disabled={profile.officeDaysCount === 0}
            >
              <Icon name="minus" />
            </button>
            <span className="counter-value">{profile.officeDaysCount}</span>
            <button
              type="button"
              className="counter-btn"
              onClick={() => updateProfile('officeDaysCount', Math.min(5, profile.officeDaysCount + 1))}
              disabled={profile.officeDaysCount === 5}
            >
              <Icon name="plus" />
            </button>
          </div>
        </div>

        {profile.officeDaysCount > 0 && (
          <div className="office-times">
            <label>{t('step_office_times_label')}</label>
            <div className="time-range">
              <div className="time-input-group">
                <span className="time-label">{t('step_office_start')}</span>
                <input
                  type="time"
                  value={profile.officeStart}
                  onChange={(e) => updateProfile('officeStart', e.target.value)}
                  className="input-field"
                />
              </div>
              <span className="time-separator">-</span>
              <div className="time-input-group">
                <span className="time-label">{t('step_office_end')}</span>
                <input
                  type="time"
                  value={profile.officeEnd}
                  onChange={(e) => updateProfile('officeEnd', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {profile.officeDaysCount === 0 && (
          <div className="remote-badge">
            <Icon name="home-2" />
            <span>{t('step_office_remote')}</span>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function GoalsStep({ t, profile, toggleGoal, errors, onNext, onBack }) {
  const goals = [
    { id: 'muscle_gain', icon: 'dumbbell-1', label: t('step_goals_muscle') },
    { id: 'fat_loss', icon: 'fire-1', label: t('step_goals_fat_loss') },
    { id: 'health', icon: 'heart', label: t('step_goals_health') },
    { id: 'energy', icon: 'bolt-alt', label: t('step_goals_energy') },
    { id: 'strength', icon: 'shield-1', label: t('step_goals_strength') },
    { id: 'flexibility', icon: 'leaf-1', label: t('step_goals_flexibility') },
    { id: 'endurance', icon: 'timer-1', label: t('step_goals_endurance') },
    { id: 'sleep', icon: 'moon-half-right-5', label: t('step_goals_sleep') },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="target-4" className="step-icon" />
        </div>
        <h2>{t('step_goals_title')}</h2>
        <p>{t('step_goals_desc')}</p>
      </div>

      <div className="form-section">
        <div className="goals-grid">
          {goals.map(goal => (
            <button
              key={goal.id}
              type="button"
              className={`goal-chip ${profile.goals.includes(goal.id) ? 'selected' : ''}`}
              onClick={() => toggleGoal(goal.id)}
            >
              <Icon name={goal.icon} className="goal-chip-icon" />
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
        {errors.goals && <span className="error-text">{errors.goals}</span>}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} <Icon name="arrow-right-1" />
        </button>
      </div>
    </div>
  );
}

function PhysicalDataStep({ t, profile, updateProfile, onBack, onFinish }) {
  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="bar-chart-4" className="step-icon" />
        </div>
        <h2>{t('step_physical_title')}</h2>
        <p>{t('step_physical_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('step_physical_weight')} <span className="label-optional">{t('optional')}</span></label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => updateProfile('weight', e.target.value)}
            placeholder="Ex: 72"
            className="input-field"
            step="0.1"
          />
        </div>

        <div className="input-group">
          <label>{t('step_physical_height')} <span className="label-optional">{t('optional')}</span></label>
          <input
            type="number"
            value={profile.height}
            onChange={(e) => updateProfile('height', e.target.value)}
            placeholder="Ex: 178"
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>{t('step_physical_bodyfat')} <span className="label-optional">{t('optional')}</span></label>
          <input
            type="number"
            value={profile.bodyFatPercent}
            onChange={(e) => updateProfile('bodyFatPercent', e.target.value)}
            placeholder="Ex: 18"
            className="input-field"
            step="0.1"
          />
        </div>

        <p className="skip-hint">
          <Icon name="information-circle-1" />
          {t('step_physical_skip_hint')}
        </p>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <Icon name="arrow-left-1" /> {t('back')}
        </button>
        <button type="button" className="btn-primary btn-finish" onClick={onFinish}>
          {t('create_routine')} <Icon name="star-fat" />
        </button>
      </div>
    </div>
  );
}

function GeneratingStep({ t }) {
  return (
    <div className="step generating-step">
      <div className="generating-animation">
        <div className="spinner-ring"></div>
        <div className="generating-icons">
          <Icon name="calendar-days" className="gen-icon" />
          <Icon name="timer-1" className="gen-icon" />
          <Icon name="checkmark-1" className="gen-icon" />
        </div>
      </div>
      <h2>{t('generating_title')}</h2>
      <p className="generating-text">{t('generating_desc')}</p>
      <div className="generating-steps">
        <div className="gen-step done"><Icon name="checkmark-1" className="gen-check" /><span>{t('generating_step_1')}</span></div>
        <div className="gen-step active"><span className="gen-spinner"></span><span>{t('generating_step_2')}</span></div>
        <div className="gen-step"><span className="gen-dot"></span><span>{t('generating_step_3')}</span></div>
        <div className="gen-step"><span className="gen-dot"></span><span>{t('generating_step_4')}</span></div>
      </div>
    </div>
  );
}

// ==================== SCHEDULE GENERATION ====================

function generateScheduleFromProfile(profile) {
  const { wakeTime, sleepHours, lunchTime, dinnerTime, gymPreference, officeDaysCount, officeStart, officeEnd } = profile;

  // Parse times
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);
  const [lunchH, lunchM] = lunchTime.split(':').map(Number);
  const [dinnerH, dinnerM] = dinnerTime.split(':').map(Number);

  // Calculate sleep time
  let sleepH = wakeH - sleepHours;
  if (sleepH < 0) sleepH += 24;

  // Calculate wind-down time (1h before sleep)
  let windDownH = sleepH - 1;
  if (windDownH < 0) windDownH += 24;

  // Helper to format time
  const formatTime = (h, m = 0, approximate = false) => {
    const prefix = approximate ? '~' : '';
    return `${prefix}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Helper to add minutes to time
  const addMinutes = (h, m, mins) => {
    const totalMins = h * 60 + m + mins;
    return [Math.floor(totalMins / 60) % 24, totalMins % 60];
  };

  // Generate blocks for a day type
  const generateDayBlocks = (isWeekday, isOfficeDay) => {
    const blocks = [];
    const approx = !isWeekday; // Weekend times are approximate

    // 1. Wake up
    blocks.push({
      time: formatTime(wakeH, wakeM, approx),
      icon: 'sun-1',
      label: { 'pt-BR': 'Acordar', 'en': 'Wake up' },
      sub: { 'pt-BR': 'Novo dia, novas conquistas', 'en': 'New day, new achievements' },
      type: 'morning'
    });

    // 2. Morning ritual
    const [ritualH, ritualM] = addMinutes(wakeH, wakeM, 15);
    blocks.push({
      time: formatTime(ritualH, ritualM, approx),
      icon: 'coffee-cup-2',
      label: { 'pt-BR': 'Rotina matinal', 'en': 'Morning routine' },
      sub: { 'pt-BR': 'Café, alongamento', 'en': 'Coffee, stretching' },
      type: 'morning'
    });

    // 3. Gym (if morning preference)
    if (gymPreference === 'morning') {
      const [gymH, gymM] = addMinutes(wakeH, wakeM, 45);
      blocks.push({
        time: formatTime(gymH, gymM, approx),
        icon: 'dumbbell-1',
        label: { 'pt-BR': 'Academia', 'en': 'Gym' },
        sub: { 'pt-BR': '60-75 min de treino', 'en': '60-75 min workout' },
        type: 'gym',
        tag: 'gym'
      });
    }

    // 4. Breakfast
    const breakfastOffset = gymPreference === 'morning' ? 120 : 45;
    const [breakfastH, breakfastM] = addMinutes(wakeH, wakeM, breakfastOffset);
    blocks.push({
      time: formatTime(breakfastH, breakfastM, approx),
      icon: 'knife-fork-1',
      label: { 'pt-BR': 'Café da manhã', 'en': 'Breakfast' },
      sub: { 'pt-BR': 'Refeição completa', 'en': 'Full meal' },
      type: 'food'
    });

    // 5. Work (if weekday)
    if (isWeekday) {
      if (isOfficeDay && officeDaysCount > 0) {
        const [startH, startM] = officeStart.split(':').map(Number);
        blocks.push({
          time: formatTime(startH, startM),
          icon: 'briefcase-1',
          label: { 'pt-BR': 'Escritório', 'en': 'Office' },
          sub: { 'pt-BR': 'Foco no trabalho', 'en': 'Focus on work' },
          type: 'work',
          tag: 'office'
        });
      } else {
        blocks.push({
          time: '09:00',
          icon: 'laptop-2',
          label: { 'pt-BR': 'Trabalho', 'en': 'Work' },
          sub: { 'pt-BR': 'Bloco de foco', 'en': 'Focus block' },
          type: 'work'
        });
      }
    }

    // 6. Lunch
    blocks.push({
      time: formatTime(lunchH, lunchM, approx),
      icon: 'knife-fork-1',
      label: { 'pt-BR': 'Almoço', 'en': 'Lunch' },
      sub: { 'pt-BR': 'Pausa pra comer bem', 'en': 'Eat well break' },
      type: 'food'
    });

    // 7. Afternoon work (if weekday)
    if (isWeekday) {
      const [afternoonH] = addMinutes(lunchH, lunchM, 60);
      blocks.push({
        time: formatTime(afternoonH, 0),
        icon: 'laptop-2',
        label: { 'pt-BR': 'Trabalho — tarde', 'en': 'Work — afternoon' },
        sub: { 'pt-BR': 'Finalizar tarefas', 'en': 'Finish tasks' },
        type: 'work'
      });

      // End of work
      if (isOfficeDay && officeDaysCount > 0) {
        const [endH, endM] = officeEnd.split(':').map(Number);
        blocks.push({
          time: formatTime(endH, endM),
          icon: 'locked-1',
          label: { 'pt-BR': 'Fechar trabalho', 'en': 'End work' },
          sub: { 'pt-BR': 'Acabou por hoje', 'en': 'Done for today' },
          type: 'work'
        });
      } else {
        blocks.push({
          time: '17:00',
          icon: 'locked-1',
          label: { 'pt-BR': 'Fechar trabalho', 'en': 'End work' },
          sub: { 'pt-BR': 'Acabou por hoje', 'en': 'Done for today' },
          type: 'work'
        });
      }
    }

    // 8. Gym (if evening preference)
    if (gymPreference === 'evening') {
      blocks.push({
        time: formatTime(18, 0, approx),
        icon: 'dumbbell-1',
        label: { 'pt-BR': 'Academia', 'en': 'Gym' },
        sub: { 'pt-BR': '60-75 min de treino', 'en': '60-75 min workout' },
        type: 'gym',
        tag: 'gym'
      });
    }

    // 9. Free time
    if (gymPreference !== 'evening' || !isWeekday) {
      blocks.push({
        time: formatTime(18, 30, approx),
        icon: 'book-1',
        label: { 'pt-BR': 'Tempo livre', 'en': 'Free time' },
        sub: { 'pt-BR': 'Hobbies, descanso', 'en': 'Hobbies, rest' },
        type: 'free'
      });
    }

    // 10. Dinner
    blocks.push({
      time: formatTime(dinnerH, dinnerM, approx),
      icon: 'knife-fork-1',
      label: { 'pt-BR': 'Jantar', 'en': 'Dinner' },
      sub: { 'pt-BR': 'Refeição nutritiva', 'en': 'Nutritious meal' },
      type: 'food'
    });

    // 11. Wind down
    blocks.push({
      time: formatTime(windDownH, 0, approx),
      icon: 'moon-half-right-5',
      label: { 'pt-BR': 'Relaxar', 'en': 'Wind down' },
      sub: { 'pt-BR': 'Preparar pra dormir', 'en': 'Prepare for sleep' },
      type: 'sleep'
    });

    // 12. Sleep
    blocks.push({
      time: formatTime(sleepH, wakeM, approx),
      icon: 'moon-half-right-5',
      label: { 'pt-BR': 'Dormir', 'en': 'Sleep' },
      sub: { 'pt-BR': `${sleepHours}h de sono`, 'en': `${sleepHours}h of sleep` },
      type: 'sleep'
    });

    return blocks;
  };

  // Generate schedule for each day
  const schedule = {
    'Seg': { type: 'weekday', blocks: generateDayBlocks(true, officeDaysCount >= 1) },
    'Ter': { type: 'weekday', blocks: generateDayBlocks(true, officeDaysCount >= 2) },
    'Qua': { type: 'weekday', blocks: generateDayBlocks(true, officeDaysCount >= 3) },
    'Qui': { type: 'weekday', blocks: generateDayBlocks(true, officeDaysCount >= 4) },
    'Sex': { type: 'weekday', blocks: generateDayBlocks(true, officeDaysCount >= 5) },
    'Sáb': { type: 'weekend', blocks: generateDayBlocks(false, false) },
    'Dom': { type: 'weekend', blocks: generateDayBlocks(false, false) },
  };

  return schedule;
}
