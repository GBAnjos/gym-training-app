import { useState, useMemo } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { Icon } from './Icon';
import { DESIGN } from '../data/design.js';
import './OnboardingFlow.css';

// New 8-step onboarding flow per Patch 01 spec
const STEPS = [
  'welcome',
  'language',
  'wakeTime',      // Step 1: What time do you wake up?
  'sleepHours',    // Step 2: How many hours do you sleep?
  'lunchTime',     // Step 3: What time do you have lunch?
  'dinnerTime',    // Step 4: What time do you have dinner?
  'activitySelect',   // Step 5: What activities do you do?
  'activityAddons',    // Step 5b: Any add-on activities?
  'activityTime',      // Step 5c: When do you prefer to train?
  'officeDays',
  'goals',
  'physicalData',
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

    // Step 5: Activities
    mainActivities: [],          // ['gym', 'crossfit', ...]
    addOnActivities: [],         // [{ type: 'running', frequency: 2 }, ...]
    gymPreference: '',           // 'morning' | 'afternoon' | 'evening' | 'flexible'

    // Step 6: Office
    officeDaysCount: 0,
    officeStart: '09:00',
    officeEnd: '18:00',

    // Step 7: Goals
    goals: [],

    // Step 8: Physical data
    sex: '', // 'male' | 'female'
    age: '',
    weight: '',
    height: '',
    // Advanced mode fields
    physicalMode: 'basic', // 'basic' | 'advanced'
    bodyFatPercent: '',
    braco: '',
    peito: '',
    cintura: '',
    coxa: '',

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

      case 'activitySelect':
        if (profile.mainActivities.length === 0) {
          newErrors.mainActivities = t('error_required_activity');
        }
        break;

      case 'activityTime':
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
    const skipValidation = ['welcome', 'language', 'sleepHours', 'lunchTime', 'dinnerTime', 'activityAddons', 'officeDays', 'physicalData', 'generating'];

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
      case 'activitySelect':
        return <ActivitySelectStep {...props} />;
      case 'activityAddons':
        return <ActivityAddonsStep {...props} />;
      case 'activityTime':
        return <ActivityTimeStep {...props} />;
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

const MAIN_ACTIVITIES = [
  { id: 'gym', icon: 'dumbbell-1', color: DESIGN.sportColors.gym },
  { id: 'crossfit', icon: 'fire-1', color: DESIGN.sportColors.crossfit },
  { id: 'calisthenics', icon: 'bolt-alt', color: DESIGN.sportColors.calisthenics },
  { id: 'pilates', icon: 'heart', color: DESIGN.sportColors.pilates },
];

function ActivitySelectStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  const toggleActivity = (id) => {
    const current = profile.mainActivities;
    const updated = current.includes(id)
      ? current.filter(a => a !== id)
      : [...current, id];
    updateProfile('mainActivities', updated);
  };

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="dumbbell-1" className="step-icon" />
        </div>
        <h2>{t('onboarding_activity_title')}</h2>
        <p>{t('onboarding_activity_subtitle')}</p>
      </div>
      <div className="form-section">
        <div className="activity-grid">
          {MAIN_ACTIVITIES.map(act => {
            const selected = profile.mainActivities.includes(act.id);
            return (
              <button
                key={act.id}
                type="button"
                className={`activity-card ${selected ? 'selected' : ''}`}
                style={selected ? {
                  borderColor: act.color.primary,
                  background: act.color.bg,
                } : {}}
                onClick={() => toggleActivity(act.id)}
              >
                <Icon name={act.icon} className="activity-card-icon" style={selected ? { color: act.color.primary } : {}} />
                <span className="activity-card-label">{t(`activity_${act.id}`)}</span>
              </button>
            );
          })}
        </div>
        {errors.mainActivities && <span className="error-text">{errors.mainActivities}</span>}
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

const ADDON_ACTIVITIES = [
  { id: 'running', icon: 'direction-1', color: DESIGN.sportColors.running },
  { id: 'yoga', icon: 'moon-half-right-5', color: DESIGN.sportColors.yoga },
];

function ActivityAddonsStep({ t, profile, updateProfile, onNext, onBack }) {
  const toggleAddon = (id) => {
    const current = profile.addOnActivities;
    const existing = current.find(a => a.type === id);
    if (existing) {
      updateProfile('addOnActivities', current.filter(a => a.type !== id));
    } else {
      updateProfile('addOnActivities', [...current, { type: id, frequency: 2 }]);
    }
  };

  const setFrequency = (id, freq) => {
    updateProfile('addOnActivities', profile.addOnActivities.map(a =>
      a.type === id ? { ...a, frequency: freq } : a
    ));
  };

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="direction-1" className="step-icon" />
        </div>
        <h2>{t('onboarding_addons_title')}</h2>
      </div>
      <div className="form-section">
        <div className="addon-list">
          {ADDON_ACTIVITIES.map(act => {
            const addon = profile.addOnActivities.find(a => a.type === act.id);
            const selected = !!addon;
            return (
              <div key={act.id} className={`addon-card ${selected ? 'selected' : ''}`}
                style={selected ? { borderColor: act.color.primary, background: act.color.bg } : {}}>
                <button type="button" className="addon-toggle" onClick={() => toggleAddon(act.id)}>
                  <Icon name={act.icon} className="addon-icon" style={selected ? { color: act.color.primary } : {}} />
                  <span className="addon-label">{t(`activity_${act.id}`)}</span>
                </button>
                {selected && (
                  <div className="addon-frequency">
                    {[1, 2, 3].map(f => (
                      <button key={f} type="button"
                        className={`addon-frequency-btn ${addon.frequency === f ? 'active' : ''}`}
                        style={addon.frequency === f ? { background: act.color.primary, color: '#0d0d0d' } : {}}
                        onClick={() => setFrequency(act.id, f)}
                      >
                        {f}x
                      </button>
                    ))}
                    <span className="addon-frequency-label">{t('frequency_label')}</span>
                  </div>
                )}
              </div>
            );
          })}
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
      <button type="button" className="skip-btn" onClick={onNext}>
        {t('onboarding_addons_skip')}
      </button>
    </div>
  );
}

function ActivityTimeStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  const options = [
    { id: 'morning', icon: 'sun-1', label: t('time_morning'), desc: t('step_gym_morning_desc') },
    { id: 'afternoon', icon: 'clock-3', label: t('time_afternoon'), desc: '' },
    { id: 'evening', icon: 'moon-half-right-5', label: t('time_evening'), desc: t('step_gym_evening_desc') },
    { id: 'flexible', icon: 'refresh-circle-1-clockwise', label: t('time_flexible'), desc: t('step_gym_flexible_desc') },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <div className="step-icon-wrapper">
          <Icon name="clock-3" className="step-icon" />
        </div>
        <h2>{t('onboarding_time_title')}</h2>
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
                {opt.desc && <span className="gym-pref-desc">{opt.desc}</span>}
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

function PhysicalDataStep({ t, profile, updateProfile, onBack, onFinish, language }) {
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
        {/* Sex Selection */}
        <div className="input-group">
          <label>{t('step_physical_sex')}</label>
          <div className="sex-options">
            <button
              type="button"
              className={`sex-btn ${profile.sex === 'male' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'male')}
            >
              <Icon name="male-1" className="sex-icon" />
              <span>{t('step_physical_male')}</span>
            </button>
            <button
              type="button"
              className={`sex-btn ${profile.sex === 'female' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'female')}
            >
              <Icon name="female-1" className="sex-icon" />
              <span>{t('step_physical_female')}</span>
            </button>
          </div>
        </div>

        {/* Basic fields row */}
        <div className="physical-row">
          <div className="input-group half">
            <label>{t('step_physical_age')}</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => updateProfile('age', e.target.value)}
              placeholder="Ex: 28"
              className="input-field"
            />
          </div>
          <div className="input-group half">
            <label>{t('step_physical_height')}</label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => updateProfile('height', e.target.value)}
              placeholder="Ex: 178"
              className="input-field"
            />
          </div>
        </div>

        <div className="input-group">
          <label>{t('step_physical_weight')}</label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => updateProfile('weight', e.target.value)}
            placeholder="Ex: 72"
            className="input-field"
            step="0.1"
          />
        </div>

        {/* Advanced Mode Toggle */}
        <div className="recomp-toggle-section">
          <div className="recomp-toggle-header" onClick={() => updateProfile('physicalMode', profile.physicalMode === 'basic' ? 'advanced' : 'basic')}>
            <div className="recomp-toggle-info">
              <Icon name="fire-1" className="recomp-icon" />
              <div className="recomp-toggle-text">
                <span className="recomp-toggle-title">{t('step_physical_recomp_title')}</span>
                <span className="recomp-toggle-desc">{t('step_physical_recomp_desc')}</span>
              </div>
            </div>
            <div className={`toggle-switch ${profile.physicalMode === 'advanced' ? 'active' : ''}`}>
              <div className="toggle-thumb"></div>
            </div>
          </div>
        </div>

        {/* Advanced fields */}
        {profile.physicalMode === 'advanced' && (
          <div className="advanced-measurements">
            <div className="input-group">
              <label>
                <Icon name="fire-1" />
                {t('step_physical_bodyfat')}
              </label>
              <input
                type="number"
                value={profile.bodyFatPercent}
                onChange={(e) => updateProfile('bodyFatPercent', e.target.value)}
                placeholder="Ex: 18"
                className="input-field"
                step="0.1"
              />
            </div>

            <div className="measurements-title">
              <Icon name="ruler-1" />
              <span>{language === 'pt-BR' ? 'Medidas (cm)' : 'Measurements (cm)'}</span>
            </div>

            <div className="physical-row">
              <div className="input-group half">
                <label>{t('progress_arm')}</label>
                <input
                  type="number"
                  value={profile.braco}
                  onChange={(e) => updateProfile('braco', e.target.value)}
                  placeholder="Ex: 35"
                  className="input-field"
                  step="0.1"
                />
              </div>
              <div className="input-group half">
                <label>{t('progress_chest')}</label>
                <input
                  type="number"
                  value={profile.peito}
                  onChange={(e) => updateProfile('peito', e.target.value)}
                  placeholder="Ex: 100"
                  className="input-field"
                  step="0.1"
                />
              </div>
            </div>

            <div className="physical-row">
              <div className="input-group half">
                <label>{t('progress_waist')}</label>
                <input
                  type="number"
                  value={profile.cintura}
                  onChange={(e) => updateProfile('cintura', e.target.value)}
                  placeholder="Ex: 80"
                  className="input-field"
                  step="0.1"
                />
              </div>
              <div className="input-group half">
                <label>{t('progress_thigh')}</label>
                <input
                  type="number"
                  value={profile.coxa}
                  onChange={(e) => updateProfile('coxa', e.target.value)}
                  placeholder="Ex: 55"
                  className="input-field"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

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

// Determine training split based on goals
function getTrainingSplit(goals) {
  const hasMusclGain = goals.includes('muscle_gain');
  const hasWeightLoss = goals.includes('weight_loss');

  if (hasMusclGain) {
    // 5-day PPL for muscle gain
    return {
      type: 'PPL',
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Push', focus: { 'pt-BR': 'Peito, Ombro, Tríceps', 'en': 'Chest, Shoulder, Triceps' }, icon: '💪' },
        { label: 'B', name: 'Pull', focus: { 'pt-BR': 'Costas, Bíceps', 'en': 'Back, Biceps' }, icon: '🔙' },
        { label: 'C', name: 'Legs', focus: { 'pt-BR': 'Quadríceps, Glúteo, Posterior', 'en': 'Quads, Glutes, Hamstrings' }, icon: '🦵' },
        { label: 'D', name: 'Push+', focus: { 'pt-BR': 'Ombro foco, Tríceps', 'en': 'Shoulder focus, Triceps' }, icon: '🔥' },
        { label: 'E', name: 'Pull+', focus: { 'pt-BR': 'Costas largura, Bíceps', 'en': 'Back width, Biceps' }, icon: '⚡' },
      ]
    };
  } else if (hasWeightLoss) {
    // 4-day Upper/Lower for weight loss
    return {
      type: 'Upper/Lower',
      days: ['Seg', 'Ter', 'Qui', 'Sex'],
      split: [
        { label: 'A', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'B', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
        { label: 'C', name: 'Upper', focus: { 'pt-BR': 'Peito, Costas, Ombros, Braços', 'en': 'Chest, Back, Shoulders, Arms' }, icon: '💪' },
        { label: 'D', name: 'Lower', focus: { 'pt-BR': 'Quadríceps, Posterior, Glúteos', 'en': 'Quads, Hamstrings, Glutes' }, icon: '🦵' },
      ]
    };
  } else {
    // 3-day Full Body for maintain/general
    return {
      type: 'Full Body',
      days: ['Seg', 'Qua', 'Sex'],
      split: [
        { label: 'A', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'B', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
        { label: 'C', name: 'Full Body', focus: { 'pt-BR': 'Corpo Inteiro', 'en': 'Full Body' }, icon: '💪' },
      ]
    };
  }
}

// Per-day motivational wake-up subs
const WAKE_SUBS = {
  'Seg': { 'pt-BR': 'Semana começa agora. Bora.', 'en': 'Week starts now. Let\'s go.' },
  'Ter': { 'pt-BR': 'Segundo dia — mantém o ritmo.', 'en': 'Day two — keep the rhythm.' },
  'Qua': { 'pt-BR': 'Metade da semana — tá no caminho.', 'en': 'Halfway — you\'re on track.' },
  'Qui': { 'pt-BR': 'Quase lá. Foco mais um dia.', 'en': 'Almost there. One more focused day.' },
  'Sex': { 'pt-BR': 'Sexta. A semana é sua agora.', 'en': 'Friday. The week is yours now.' },
  'Sáb': { 'pt-BR': 'Sem alarme. Descansa.', 'en': 'No alarm. Rest up.' },
  'Dom': { 'pt-BR': 'Sem pressa. É domingo.', 'en': 'No rush. It\'s Sunday.' },
};

// Per-day dinner subs (varied)
const DINNER_SUBS = {
  'Seg': { 'pt-BR': 'Proteína + carboidrato + legume', 'en': 'Protein + carb + veggies' },
  'Ter': { 'pt-BR': 'Salmão, ovo ou frango — varia', 'en': 'Salmon, egg or chicken — vary it' },
  'Qua': { 'pt-BR': 'Carne vermelha ou leguminosa', 'en': 'Red meat or legumes tonight' },
  'Qui': { 'pt-BR': 'Peru, atum, frango — come com calma', 'en': 'Turkey, tuna, chicken — eat calmly' },
  'Sex': { 'pt-BR': 'Algo gostoso. Não precisa ser perfeito.', 'en': 'Something tasty. Doesn\'t need to be perfect.' },
  'Sáb': { 'pt-BR': 'Mais solto — entrega, restaurante, o que vier', 'en': 'More relaxed — delivery, restaurant, whatever' },
  'Dom': { 'pt-BR': 'Comida da semana pronta — usa ela', 'en': 'Week food is ready — use it' },
};

function generateScheduleFromProfile(profile) {
  const { wakeTime, sleepHours, lunchTime, dinnerTime, gymPreference, officeDaysCount, officeStart, officeEnd, goals } = profile;

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

  const formatTime = (h, m = 0, approximate = false) => {
    const prefix = approximate ? '~' : '';
    return `${prefix}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const addMinutes = (h, m, mins) => {
    const totalMins = h * 60 + m + mins;
    return [Math.floor(totalMins / 60) % 24, totalMins % 60];
  };

  // Get workout split based on goals
  const trainingSplit = getTrainingSplit(goals || []);
  const trainingDaySet = new Set(trainingSplit.days);

  // Build a map of day → split info
  const daySplitMap = {};
  trainingSplit.days.forEach((day, i) => {
    daySplitMap[day] = trainingSplit.split[i];
  });

  // Goal-aware helpers
  const hasWeightLoss = (goals || []).includes('weight_loss');
  const hasMusclGain = (goals || []).includes('muscle_gain');

  // Office days: assign by count (Mon first, then Tue, etc.)
  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const officeDaySet = new Set(weekdays.slice(0, officeDaysCount || 0));

  const allDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const schedule = {};

  allDays.forEach(day => {
    const isWeekend = day === 'Sáb' || day === 'Dom';
    const isWeekday = !isWeekend;
    const isFriday = day === 'Sex';
    const isSunday = day === 'Dom';
    const isSaturday = day === 'Sáb';
    const isOfficeDay = officeDaySet.has(day);
    const isTrainingDay = trainingDaySet.has(day);
    const splitInfo = daySplitMap[day];
    const approx = isWeekend;

    const blocks = [];

    // 1. Wake up (varied per day)
    const wakeUpH = isWeekend ? wakeH + 1 : wakeH;
    const wakeUpM = isWeekend ? 0 : wakeM;
    blocks.push({
      time: formatTime(wakeUpH, wakeUpM, approx),
      icon: 'sun-1',
      label: { 'pt-BR': isWeekend ? 'Acorda no seu tempo' : 'Acordar', 'en': isWeekend ? 'Wake up at your pace' : 'Wake up' },
      sub: WAKE_SUBS[day],
      type: 'morning'
    });

    // 2. Morning ritual
    const [ritualH, ritualM] = addMinutes(wakeUpH, wakeUpM, 15);
    blocks.push({
      time: formatTime(ritualH, ritualM, approx),
      icon: 'coffee-cup-2',
      label: { 'pt-BR': 'Rotina matinal', 'en': 'Morning routine' },
      sub: { 'pt-BR': 'Café, alongamento, intenção do dia', 'en': 'Coffee, stretching, set intention' },
      type: 'morning'
    });

    // 3. Morning gym (with split info)
    const isMorningGym = isTrainingDay && (gymPreference === 'morning' || (gymPreference === 'flexible' && !isOfficeDay));
    if (isMorningGym && splitInfo) {
      const [gymH, gymM] = addMinutes(wakeUpH, wakeUpM, 45);
      const focusPt = splitInfo.focus['pt-BR'];
      const focusEn = splitInfo.focus['en'];
      blocks.push({
        time: formatTime(gymH, gymM, approx),
        icon: 'dumbbell-1',
        label: { 'pt-BR': 'Academia', 'en': 'Gym' },
        sub: {
          'pt-BR': `60–75 min · Dia ${splitInfo.label}: ${splitInfo.name} (${focusPt})`,
          'en': `60–75 min · Day ${splitInfo.label}: ${splitInfo.name} (${focusEn})`
        },
        type: 'gym',
        tag: 'gym'
      });
    }

    // 4. Breakfast
    const breakfastOffset = isMorningGym ? 120 : 45;
    const [breakfastH, breakfastM] = addMinutes(wakeUpH, wakeUpM, breakfastOffset);
    blocks.push({
      time: formatTime(breakfastH, breakfastM, approx),
      icon: 'knife-fork-1',
      label: {
        'pt-BR': isMorningGym ? 'Ducha + café da manhã' : 'Café da manhã',
        'en': isMorningGym ? 'Shower + breakfast' : 'Breakfast'
      },
      sub: {
        'pt-BR': hasMusclGain ? 'Ovos, aveia, fruta — refeição completa' : 'Refeição completa pra começar bem',
        'en': hasMusclGain ? 'Eggs, oatmeal, fruit — full meal' : 'Full meal to start the day right'
      },
      type: 'food'
    });

    // 5. Work blocks (weekday only)
    if (isWeekday) {
      if (isOfficeDay) {
        const [startH, startM] = (officeStart || '09:00').split(':').map(Number);
        blocks.push({
          time: formatTime(startH, startM),
          icon: 'briefcase-1',
          label: { 'pt-BR': 'Escritório', 'en': 'Office' },
          sub: { 'pt-BR': 'Foco no que importa', 'en': 'Focus on what matters' },
          type: 'work',
          tag: 'office'
        });
      } else {
        blocks.push({
          time: '09:00',
          icon: 'laptop-2',
          label: { 'pt-BR': 'Trabalho — bloco profundo', 'en': 'Work — deep focus block' },
          sub: { 'pt-BR': 'Tarefa mais importante primeiro', 'en': 'Most important task first' },
          type: 'work'
        });
      }
    }

    // 6. Lunch
    blocks.push({
      time: formatTime(lunchH, lunchM, approx),
      icon: 'knife-fork-1',
      label: { 'pt-BR': 'Almoço', 'en': 'Lunch' },
      sub: {
        'pt-BR': isWeekend ? 'Refeição sem pressa' : 'Refeição de verdade · sai da mesa',
        'en': isWeekend ? 'Unhurried meal' : 'Real meal · step away from desk'
      },
      type: 'food'
    });

    // 6b. Post-lunch walk (home office weekdays)
    if (isWeekday && !isOfficeDay) {
      const [walkH, walkM] = addMinutes(lunchH, lunchM, 45);
      blocks.push({
        time: formatTime(walkH, walkM),
        icon: 'direction-1',
        label: { 'pt-BR': 'Caminhada curta', 'en': 'Short walk' },
        sub: { 'pt-BR': '15 min fora · obrigatório em dias home', 'en': '15 min outside · mandatory on home days' },
        type: 'free'
      });
    }

    // 7. Afternoon work (weekday)
    if (isWeekday) {
      const [afternoonH] = addMinutes(lunchH, lunchM, 60);
      blocks.push({
        time: formatTime(afternoonH, 0),
        icon: 'laptop-2',
        label: {
          'pt-BR': isFriday ? 'Trabalho — tarde curta' : 'Trabalho — tarde',
          'en': isFriday ? 'Work — short afternoon' : 'Work — afternoon'
        },
        sub: {
          'pt-BR': isFriday ? 'Fecha pendências, não começa coisa nova' : 'Finalizar tarefas do dia',
          'en': isFriday ? 'Close pending items, don\'t start new things' : 'Finish today\'s tasks'
        },
        type: 'work'
      });

      // End of work
      if (isOfficeDay) {
        const [endH, endM] = (officeEnd || '18:00').split(':').map(Number);
        blocks.push({
          time: formatTime(endH, endM),
          icon: 'locked-1',
          label: { 'pt-BR': 'Fechar trabalho', 'en': 'End work' },
          sub: { 'pt-BR': 'Acabou. Não volta mais hoje.', 'en': 'Done. Not coming back today.' },
          type: 'work'
        });
      } else {
        blocks.push({
          time: '17:00',
          icon: 'locked-1',
          label: { 'pt-BR': 'Fecha o laptop', 'en': 'Close laptop' },
          sub: {
            'pt-BR': isFriday ? 'Semana encerrada. Sério.' : 'Acabou por hoje.',
            'en': isFriday ? 'Week closed. Seriously.' : 'Done for today.'
          },
          type: 'work'
        });
      }
    }

    // 8. Post-work chores (weekday, varied by day)
    if (isWeekday && !isFriday) {
      if (day === 'Seg') {
        blocks.push({
          time: '17:15',
          icon: 'home-2',
          label: { 'pt-BR': 'Limpeza rápida', 'en': 'Quick cleaning' },
          sub: { 'pt-BR': '30 min · aspirar, organizar', 'en': '30 min · vacuum, organize' },
          type: 'chore',
          tag: 'chore'
        });
      } else if (day === 'Ter') {
        blocks.push({
          time: '17:15',
          icon: 'home-2',
          label: { 'pt-BR': 'Mercado', 'en': 'Grocery store' },
          sub: { 'pt-BR': 'Lista no celular · compra pra semana', 'en': 'List on phone · buy for the week' },
          type: 'chore',
          tag: 'chore'
        });
      } else if (day === 'Qua') {
        blocks.push({
          time: '17:15',
          icon: 'home-2',
          label: { 'pt-BR': 'Lavar roupa', 'en': 'Do laundry' },
          sub: { 'pt-BR': 'Coloca na máquina — termina sozinha', 'en': 'Put in machine — finishes on its own' },
          type: 'chore',
          tag: 'chore'
        });
      }
    }

    // 9. Evening gym (with split info)
    const isEveningGym = isTrainingDay && !isMorningGym;
    if (isEveningGym && splitInfo) {
      const focusPt = splitInfo.focus['pt-BR'];
      const focusEn = splitInfo.focus['en'];
      blocks.push({
        time: formatTime(18, 0, approx),
        icon: 'dumbbell-1',
        label: { 'pt-BR': 'Academia', 'en': 'Gym' },
        sub: {
          'pt-BR': `60–75 min · Dia ${splitInfo.label}: ${splitInfo.name} (${focusPt})`,
          'en': `60–75 min · Day ${splitInfo.label}: ${splitInfo.name} (${focusEn})`
        },
        type: 'gym',
        tag: 'gym'
      });
    }

    // 10. Friday flex block
    if (isFriday) {
      blocks.push({
        time: '17:15',
        icon: 'star-fat',
        label: { 'pt-BR': 'BLOCO FLEX', 'en': 'FLEX BLOCK' },
        sub: { 'pt-BR': 'Festa? Amigos? Série? Você decide na hora.', 'en': 'Party? Friends? Series? You decide on the spot.' },
        type: 'flex',
        tag: 'flex'
      });
    }

    // 11. Weekend-specific blocks
    if (isSaturday) {
      // Optional gym / cardio
      if (!isTrainingDay) {
        blocks.push({
          time: formatTime(wakeUpH + 2, 30, true),
          icon: 'dumbbell-1',
          label: { 'pt-BR': 'Academia (opcional)', 'en': 'Gym (optional)' },
          sub: {
            'pt-BR': hasWeightLoss ? 'Cardio leve ou caminhada — sem pressão' : 'Sessão leve, mobilidade — sem pressão',
            'en': hasWeightLoss ? 'Light cardio or walk — no pressure' : 'Light session, mobility — no pressure'
          },
          type: 'gym',
          tag: 'gym'
        });
      }
      blocks.push({
        time: '~14:00',
        icon: 'book-1',
        label: { 'pt-BR': 'Tarde livre', 'en': 'Free afternoon' },
        sub: { 'pt-BR': 'Amigos, passeio, hobby — tudo válido', 'en': 'Friends, outing, hobby — all valid' },
        type: 'free'
      });
    }

    if (isSunday) {
      blocks.push({
        time: '~10:00',
        icon: 'book-1',
        label: { 'pt-BR': 'Tempo de qualidade', 'en': 'Quality time' },
        sub: { 'pt-BR': 'Leitura, hobby, saída curta — o que renova', 'en': 'Reading, hobby, short outing — whatever renews' },
        type: 'free'
      });
      blocks.push({
        time: '~14:30',
        icon: 'home-2',
        label: { 'pt-BR': 'MEAL PREP', 'en': 'MEAL PREP' },
        sub: { 'pt-BR': '2–3h cozinhando pra semana · arroz, proteínas, legumes', 'en': '2–3h cooking for the week · rice, proteins, veggies' },
        type: 'chore',
        tag: 'meal'
      });
      blocks.push({
        time: '~17:30',
        icon: 'home-2',
        label: { 'pt-BR': 'Limpeza rápida', 'en': 'Quick cleaning' },
        sub: { 'pt-BR': '30 min · aspirador, banheiro, organiza', 'en': '30 min · vacuum, bathroom, organize' },
        type: 'chore',
        tag: 'chore'
      });
      blocks.push({
        time: '~18:30',
        icon: 'star-fat',
        label: { 'pt-BR': 'Semana planejada', 'en': 'Week planned' },
        sub: { 'pt-BR': '5 min: o que tem pra fazer? Pronto.', 'en': '5 min: what to do this week? Done.' },
        type: 'free'
      });
    }

    // 12. Free time (weekdays, if no evening gym and not Friday)
    if (isWeekday && !isEveningGym && !isFriday) {
      blocks.push({
        time: formatTime(18, 30),
        icon: 'book-1',
        label: { 'pt-BR': 'Tempo seu', 'en': 'Your time' },
        sub: { 'pt-BR': 'Leitura, projeto pessoal — sem culpa', 'en': 'Reading, personal project — guilt-free' },
        type: 'free'
      });
    }

    // 13. Dinner (varied per day)
    blocks.push({
      time: formatTime(dinnerH, dinnerM, approx),
      icon: 'knife-fork-1',
      label: {
        'pt-BR': isFriday ? 'Jantar (se em casa)' : 'Jantar',
        'en': isFriday ? 'Dinner (if at home)' : 'Dinner'
      },
      sub: DINNER_SUBS[day],
      type: 'food'
    });

    // 13b. Friday night
    if (isFriday) {
      blocks.push({
        time: '?',
        icon: 'heart',
        label: { 'pt-BR': 'A noite é sua', 'en': 'The night is yours' },
        sub: { 'pt-BR': 'Sem horário, sem regra. Só não dorme menos de 6h.', 'en': 'No schedule, no rules. Just don\'t sleep less than 6h.' },
        type: 'social',
        tag: 'social'
      });
    }

    // 14. Wind down + sleep (skip for Friday)
    if (!isFriday) {
      blocks.push({
        time: formatTime(windDownH, 0, approx),
        icon: 'moon-half-right-5',
        label: {
          'pt-BR': isSunday ? 'Wind down longo' : 'Relaxar',
          'en': isSunday ? 'Long wind down' : 'Wind down'
        },
        sub: {
          'pt-BR': 'Prepara pra dormir, sem telas',
          'en': 'Prepare for sleep, no screens'
        },
        type: 'sleep'
      });

      blocks.push({
        time: formatTime(sleepH, wakeM, approx),
        icon: 'moon-half-right-5',
        label: { 'pt-BR': 'Dormir', 'en': 'Sleep' },
        sub: {
          'pt-BR': `${sleepHours}h de sono`,
          'en': `${sleepHours}h of sleep`
        },
        type: 'sleep'
      });
    }

    // Determine day type
    let type = 'home';
    if (isWeekend) type = 'weekend';
    else if (isOfficeDay) type = 'office';

    schedule[day] = { type, blocks };
  });

  // Save workout plan data alongside the schedule
  const workoutPlan = {
    splitType: trainingSplit.type,
    trainingDays: trainingSplit.days,
    split: trainingSplit.split.map((s, i) => ({
      day: trainingSplit.days[i],
      label: s.label,
      name: s.name,
      focus: s.focus,
      icon: s.icon
    })),
    goals: goals || [],
    generatedAt: new Date().toISOString()
  };
  localStorage.setItem('vida_workout_plan', JSON.stringify(workoutPlan));

  return schedule;
}
