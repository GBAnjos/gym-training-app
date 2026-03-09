import { useState } from 'react';
import { useOnboarding, generatePersonalizedSchedule, generatePersonalizedMeals, generatePersonalizedWorkout } from '../hooks/useOnboarding';
import { useLanguage } from '../hooks/useLanguage.jsx';
import './OnboardingFlow.css';

const STEPS = [
  'welcome',
  'language',
  'profile',
  'routine',
  'lifestyle',
  'training',
  'nutrition',
  'generating'
];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function OnboardingFlow({ onComplete }) {
  const { completeOnboarding } = useOnboarding();
  const { t, language, setLanguage, languages } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({
    name: '',
    sex: '',
    age: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    wakeUpTime: '06:30',
    sleepTime: '22:30',
    dinnerTime: '19:30',
    officeDays: [],
    hobbies: '',
    choresFrequency: '',
    groceryFrequency: '',
    weekendRoutine: '',
    goal: '',
    fitnessLevel: '',
    trainingDays: [],
    trainingTime: '',
    dietaryRestrictions: [],
    mealPrep: null,
    preferredLanguage: language
  });

  const days = language === 'en' ? DAYS_EN : DAYS;

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const toggleDay = (key, day) => {
    setProfile(prev => {
      const current = prev[key];
      if (current.includes(day)) {
        return { ...prev, [key]: current.filter(d => d !== day) };
      } else {
        return { ...prev, [key]: [...current, day] };
      }
    });
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 'profile':
        if (!profile.sex) newErrors.sex = t('error_required_sex');
        if (!profile.age) newErrors.age = t('error_required_age');
        if (!profile.currentWeight) newErrors.currentWeight = t('error_required_weight');
        if (!profile.targetWeight) newErrors.targetWeight = t('error_required_target');
        break;

      case 'lifestyle':
        if (!profile.weekendRoutine) newErrors.weekendRoutine = t('error_required_weekend');
        break;

      case 'training':
        if (!profile.goal) newErrors.goal = t('error_required_goal');
        if (!profile.fitnessLevel) newErrors.fitnessLevel = t('error_required_level');
        if (profile.trainingDays.length === 0) newErrors.trainingDays = t('error_required_days');
        if (!profile.trainingTime) newErrors.trainingTime = t('error_required_time');
        break;

      case 'nutrition':
        if (profile.mealPrep === null) newErrors.mealPrep = t('error_required_meal_prep');
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const currentStepName = STEPS[currentStep];
    if (currentStepName === 'welcome' || currentStepName === 'language' || validateStep(currentStepName)) {
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

  const handleFinish = async () => {
    if (!validateStep('nutrition')) return;

    setCurrentStep(STEPS.indexOf('generating'));

    // Update profile with selected language
    const finalProfile = { ...profile, preferredLanguage: language };

    // Generate personalized data
    const schedule = generatePersonalizedSchedule(finalProfile);
    const meals = generatePersonalizedMeals(finalProfile);
    const workout = generatePersonalizedWorkout(finalProfile);

    // Save to localStorage
    localStorage.setItem('vida_user_schedule', JSON.stringify(schedule));
    localStorage.setItem('vida_user_meals', JSON.stringify(meals));
    localStorage.setItem('vida_user_workout', JSON.stringify(workout));
    localStorage.setItem('vida_user_profile', JSON.stringify(finalProfile));

    // Simulate generation time for UX
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Complete onboarding
    await completeOnboarding(finalProfile);

    onComplete();
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return <WelcomeStep t={t} onNext={nextStep} />;
      case 'language':
        return <LanguageStep t={t} language={language} setLanguage={setLanguage} languages={languages} onNext={nextStep} onBack={prevStep} />;
      case 'profile':
        return <ProfileStep t={t} profile={profile} updateProfile={updateProfile} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'routine':
        return <RoutineStep t={t} days={days} profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'lifestyle':
        return <LifestyleStep t={t} profile={profile} updateProfile={updateProfile} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'training':
        return <TrainingStep t={t} days={days} profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'nutrition':
        return <NutritionStep t={t} profile={profile} updateProfile={updateProfile} errors={errors} onNext={handleFinish} onBack={prevStep} />;
      case 'generating':
        return <GeneratingStep t={t} />;
      default:
        return null;
    }
  };

  const stepIndex = currentStep - 2; // Exclude welcome and language from progress
  const totalSteps = STEPS.length - 3; // Exclude welcome, language, and generating

  return (
    <div className="onboarding">
      {currentStep > 1 && currentStep < STEPS.length - 1 && (
        <div className="onboarding-header">
          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
            />
          </div>
          <span className="onboarding-step-count">
            {t('onboarding_step')} {stepIndex} {t('onboarding_of')} {totalSteps}
          </span>
        </div>
      )}
      <div className="onboarding-content">
        {renderStep()}
      </div>
    </div>
  );
}

function WelcomeStep({ t, onNext }) {
  return (
    <div className="step welcome-step">
      <div className="welcome-logo">
        <span className="welcome-icon">💪</span>
      </div>
      <h1 className="welcome-title">{t('onboarding_welcome_title')}</h1>
      <p className="welcome-tagline">{t('app_tagline')}</p>
      <p className="welcome-description">{t('onboarding_welcome_desc')}</p>
      <button className="btn-primary btn-large" onClick={onNext}>
        {t('onboarding_start')}
        <span className="btn-icon">→</span>
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
              <span className="language-flag">{lang.code === 'pt-BR' ? '🇧🇷' : '🇺🇸'}</span>
              <span className="language-name">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} →
        </button>
      </div>
    </div>
  );
}

function ProfileStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('profile_title')}</h2>
        <p>{t('profile_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label htmlFor="name">
            {t('profile_name')} <span className="label-optional">{t('optional')}</span>
          </label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            placeholder={t('profile_name_placeholder')}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>{t('profile_sex')} <span className="label-required">{t('required')}</span></label>
          <div className="option-row">
            <button
              type="button"
              className={`option-btn ${profile.sex === 'male' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'male')}
            >
              <span className="option-icon">♂</span>
              <span>{t('profile_sex_male')}</span>
            </button>
            <button
              type="button"
              className={`option-btn ${profile.sex === 'female' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'female')}
            >
              <span className="option-icon">♀</span>
              <span>{t('profile_sex_female')}</span>
            </button>
          </div>
          {errors.sex && <span className="error-text">{errors.sex}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="age">{t('profile_age')} <span className="label-required">{t('required')}</span></label>
          <input
            id="age"
            type="number"
            value={profile.age}
            onChange={(e) => updateProfile('age', e.target.value)}
            placeholder={t('profile_age_placeholder')}
            className={`input-field ${errors.age ? 'input-error' : ''}`}
            min="14"
            max="100"
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>

        <div className="input-row">
          <div className="input-group">
            <label htmlFor="currentWeight">{t('profile_current_weight')} <span className="label-required">{t('required')}</span></label>
            <input
              id="currentWeight"
              type="number"
              value={profile.currentWeight}
              onChange={(e) => updateProfile('currentWeight', e.target.value)}
              placeholder="Ex: 72"
              className={`input-field ${errors.currentWeight ? 'input-error' : ''}`}
              step="0.1"
            />
            {errors.currentWeight && <span className="error-text">{errors.currentWeight}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="targetWeight">{t('profile_target_weight')} <span className="label-required">{t('required')}</span></label>
            <input
              id="targetWeight"
              type="number"
              value={profile.targetWeight}
              onChange={(e) => updateProfile('targetWeight', e.target.value)}
              placeholder="Ex: 80"
              className={`input-field ${errors.targetWeight ? 'input-error' : ''}`}
              step="0.1"
            />
            {errors.targetWeight && <span className="error-text">{errors.targetWeight}</span>}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="height">{t('profile_height')} <span className="label-optional">{t('optional')}</span></label>
          <input
            id="height"
            type="number"
            value={profile.height}
            onChange={(e) => updateProfile('height', e.target.value)}
            placeholder="Ex: 178"
            className="input-field"
          />
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} →
        </button>
      </div>
    </div>
  );
}

function RoutineStep({ t, days, profile, updateProfile, toggleDay, errors, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('routine_title')}</h2>
        <p>{t('routine_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="wakeUpTime">{t('routine_wake_up')} <span className="label-required">{t('required')}</span></label>
            <input
              id="wakeUpTime"
              type="time"
              value={profile.wakeUpTime}
              onChange={(e) => updateProfile('wakeUpTime', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="input-group">
            <label htmlFor="sleepTime">{t('routine_sleep')} <span className="label-required">{t('required')}</span></label>
            <input
              id="sleepTime"
              type="time"
              value={profile.sleepTime}
              onChange={(e) => updateProfile('sleepTime', e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="dinnerTime">{t('routine_dinner')} <span className="label-optional">{t('optional')}</span></label>
          <input
            id="dinnerTime"
            type="time"
            value={profile.dinnerTime}
            onChange={(e) => updateProfile('dinnerTime', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>
            {t('routine_office_days')}
            <span className="label-hint"> — {t('routine_office_hint')}</span>
          </label>
          <div className="day-selector">
            {days.map((day, i) => (
              <button
                key={day}
                type="button"
                className={`day-btn ${profile.officeDays.includes(DAYS[i]) ? 'selected' : ''}`}
                onClick={() => toggleDay('officeDays', DAYS[i])}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">
            {profile.officeDays.length === 0
              ? t('routine_work_from_home')
              : `${profile.officeDays.length} ${t('routine_days_selected')}`}
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} →
        </button>
      </div>
    </div>
  );
}

function LifestyleStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('lifestyle_title')}</h2>
        <p>{t('lifestyle_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label htmlFor="hobbies">
            {t('lifestyle_hobbies')} <span className="label-optional">{t('optional')}</span>
          </label>
          <input
            id="hobbies"
            type="text"
            value={profile.hobbies}
            onChange={(e) => updateProfile('hobbies', e.target.value)}
            placeholder={t('lifestyle_hobbies_hint')}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>{t('lifestyle_chores')} <span className="label-optional">{t('optional')}</span></label>
          <div className="option-row triple">
            {[
              { id: 'daily', label: t('lifestyle_chores_daily') },
              { id: 'weekly', label: t('lifestyle_chores_weekly') },
              { id: 'rarely', label: t('lifestyle_chores_rarely') },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`option-btn small ${profile.choresFrequency === opt.id ? 'selected' : ''}`}
                onClick={() => updateProfile('choresFrequency', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('lifestyle_grocery')} <span className="label-optional">{t('optional')}</span></label>
          <div className="option-row triple">
            {[
              { id: 'weekly', label: t('lifestyle_grocery_weekly') },
              { id: 'biweekly', label: t('lifestyle_grocery_biweekly') },
              { id: 'monthly', label: t('lifestyle_grocery_monthly') },
            ].map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`option-btn small ${profile.groceryFrequency === opt.id ? 'selected' : ''}`}
                onClick={() => updateProfile('groceryFrequency', opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('lifestyle_weekend')} <span className="label-required">{t('required')}</span></label>
          <div className="option-row">
            <button
              type="button"
              className={`option-btn large ${profile.weekendRoutine === 'relaxed' ? 'selected' : ''}`}
              onClick={() => updateProfile('weekendRoutine', 'relaxed')}
            >
              <span className="option-icon">😴</span>
              <div className="option-content">
                <span className="option-title">{t('lifestyle_weekend_relaxed')}</span>
                <span className="option-desc">{t('lifestyle_weekend_relaxed_desc')}</span>
              </div>
            </button>
            <button
              type="button"
              className={`option-btn large ${profile.weekendRoutine === 'active' ? 'selected' : ''}`}
              onClick={() => updateProfile('weekendRoutine', 'active')}
            >
              <span className="option-icon">🏃</span>
              <div className="option-content">
                <span className="option-title">{t('lifestyle_weekend_active')}</span>
                <span className="option-desc">{t('lifestyle_weekend_active_desc')}</span>
              </div>
            </button>
          </div>
          {errors.weekendRoutine && <span className="error-text">{errors.weekendRoutine}</span>}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} →
        </button>
      </div>
    </div>
  );
}

function TrainingStep({ t, days, profile, updateProfile, toggleDay, errors, onNext, onBack }) {
  const goals = [
    { id: 'muscle_gain', icon: '💪', label: t('training_goal_muscle'), desc: t('training_goal_muscle_desc') },
    { id: 'weight_loss', icon: '🔥', label: t('training_goal_loss'), desc: t('training_goal_loss_desc') },
    { id: 'maintain', icon: '⚖️', label: t('training_goal_maintain'), desc: t('training_goal_maintain_desc') },
    { id: 'general', icon: '🎯', label: t('training_goal_general'), desc: t('training_goal_general_desc') },
  ];

  const levels = [
    { id: 'beginner', label: t('training_level_beginner'), desc: t('training_level_beginner_desc') },
    { id: 'intermediate', label: t('training_level_intermediate'), desc: t('training_level_intermediate_desc') },
    { id: 'advanced', label: t('training_level_advanced'), desc: t('training_level_advanced_desc') },
  ];

  const times = [
    { id: 'morning', icon: '🌅', label: t('training_time_morning'), desc: '6h - 12h' },
    { id: 'afternoon', icon: '☀️', label: t('training_time_afternoon'), desc: '12h - 18h' },
    { id: 'evening', icon: '🌙', label: t('training_time_evening'), desc: '18h - 22h' },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('training_title')}</h2>
        <p>{t('training_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('training_goal')} <span className="label-required">{t('required')}</span></label>
          <div className="goal-grid">
            {goals.map(goal => (
              <button
                key={goal.id}
                type="button"
                className={`goal-card ${profile.goal === goal.id ? 'selected' : ''}`}
                onClick={() => updateProfile('goal', goal.id)}
              >
                <span className="goal-icon">{goal.icon}</span>
                <span className="goal-label">{goal.label}</span>
                <span className="goal-desc">{goal.desc}</span>
              </button>
            ))}
          </div>
          {errors.goal && <span className="error-text">{errors.goal}</span>}
        </div>

        <div className="input-group">
          <label>{t('training_level')} <span className="label-required">{t('required')}</span></label>
          <div className="level-options">
            {levels.map(level => (
              <button
                key={level.id}
                type="button"
                className={`level-btn ${profile.fitnessLevel === level.id ? 'selected' : ''}`}
                onClick={() => updateProfile('fitnessLevel', level.id)}
              >
                <span className="level-label">{level.label}</span>
                <span className="level-desc">{level.desc}</span>
              </button>
            ))}
          </div>
          {errors.fitnessLevel && <span className="error-text">{errors.fitnessLevel}</span>}
        </div>

        <div className="input-group">
          <label>{t('training_days')} <span className="label-required">{t('required')}</span></label>
          <div className="day-selector">
            {days.map((day, i) => (
              <button
                key={day}
                type="button"
                className={`day-btn ${profile.trainingDays.includes(DAYS[i]) ? 'selected' : ''}`}
                onClick={() => toggleDay('trainingDays', DAYS[i])}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">
            {profile.trainingDays.length === 0
              ? t('training_days_hint')
              : `${profile.trainingDays.length} ${t('routine_days_selected')}`}
          </p>
          {errors.trainingDays && <span className="error-text">{errors.trainingDays}</span>}
        </div>

        <div className="input-group">
          <label>{t('training_time')} <span className="label-required">{t('required')}</span></label>
          <div className="time-options">
            {times.map(time => (
              <button
                key={time.id}
                type="button"
                className={`time-btn ${profile.trainingTime === time.id ? 'selected' : ''}`}
                onClick={() => updateProfile('trainingTime', time.id)}
              >
                <span className="time-icon">{time.icon}</span>
                <span className="time-label">{time.label}</span>
                <span className="time-desc">{time.desc}</span>
              </button>
            ))}
          </div>
          {errors.trainingTime && <span className="error-text">{errors.trainingTime}</span>}
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          {t('continue')} →
        </button>
      </div>
    </div>
  );
}

function NutritionStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  const restrictions = [
    { id: 'vegetarian', label: t('nutrition_vegetarian') },
    { id: 'vegan', label: t('nutrition_vegan') },
    { id: 'lactose_free', label: t('nutrition_lactose_free') },
    { id: 'gluten_free', label: t('nutrition_gluten_free') },
  ];

  const toggleRestriction = (id) => {
    const current = profile.dietaryRestrictions;
    if (current.includes(id)) {
      updateProfile('dietaryRestrictions', current.filter(r => r !== id));
    } else {
      updateProfile('dietaryRestrictions', [...current, id]);
    }
  };

  const getGoalLabel = (goal) => {
    const labels = {
      muscle_gain: t('training_goal_muscle'),
      weight_loss: t('training_goal_loss'),
      maintain: t('training_goal_maintain'),
      general: t('training_goal_general')
    };
    return labels[goal] || goal;
  };

  const getTimeLabel = (time) => {
    const labels = {
      morning: t('training_time_morning'),
      afternoon: t('training_time_afternoon'),
      evening: t('training_time_evening')
    };
    return labels[time] || time;
  };

  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('nutrition_title')}</h2>
        <p>{t('nutrition_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('nutrition_restrictions')} <span className="label-optional">{t('optional')}</span></label>
          <div className="restriction-options">
            {restrictions.map(r => (
              <button
                key={r.id}
                type="button"
                className={`restriction-btn ${profile.dietaryRestrictions.includes(r.id) ? 'selected' : ''}`}
                onClick={() => toggleRestriction(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('nutrition_meal_prep')} <span className="label-required">{t('required')}</span></label>
          <div className="option-row">
            <button
              type="button"
              className={`option-btn large ${profile.mealPrep === true ? 'selected' : ''}`}
              onClick={() => updateProfile('mealPrep', true)}
            >
              <span className="option-icon">📦</span>
              <div className="option-content">
                <span className="option-title">{t('nutrition_meal_prep_yes')}</span>
                <span className="option-desc">{t('nutrition_meal_prep_yes_desc')}</span>
              </div>
            </button>
            <button
              type="button"
              className={`option-btn large ${profile.mealPrep === false ? 'selected' : ''}`}
              onClick={() => updateProfile('mealPrep', false)}
            >
              <span className="option-icon">🍳</span>
              <div className="option-content">
                <span className="option-title">{t('nutrition_meal_prep_no')}</span>
                <span className="option-desc">{t('nutrition_meal_prep_no_desc')}</span>
              </div>
            </button>
          </div>
          {errors.mealPrep && <span className="error-text">{errors.mealPrep}</span>}
        </div>

        <div className="summary-card">
          <h4>{t('summary_title')}</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">🎯</span>
              <div className="summary-content">
                <span className="summary-label">{t('summary_goal')}</span>
                <span className="summary-value">{getGoalLabel(profile.goal)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🏋️</span>
              <div className="summary-content">
                <span className="summary-label">{t('summary_training')}</span>
                <span className="summary-value">{profile.trainingDays.length}{t('summary_per_week')}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏰</span>
              <div className="summary-content">
                <span className="summary-label">{t('summary_time')}</span>
                <span className="summary-value">{getTimeLabel(profile.trainingTime)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⚖️</span>
              <div className="summary-content">
                <span className="summary-label">{t('summary_weight')}</span>
                <span className="summary-value">{profile.currentWeight}kg → {profile.targetWeight}kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← {t('back')}
        </button>
        <button type="button" className="btn-primary btn-finish" onClick={onNext}>
          {t('create_routine')} ✨
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
          <span className="gen-icon">📅</span>
          <span className="gen-icon">🏋️</span>
          <span className="gen-icon">🥗</span>
        </div>
      </div>
      <h2>{t('generating_title')}</h2>
      <p className="generating-text">{t('generating_desc')}</p>
      <div className="generating-steps">
        <div className="gen-step done">
          <span className="gen-check">✓</span>
          <span>{t('generating_step_1')}</span>
        </div>
        <div className="gen-step active">
          <span className="gen-spinner"></span>
          <span>{t('generating_step_2')}</span>
        </div>
        <div className="gen-step">
          <span className="gen-dot"></span>
          <span>{t('generating_step_3')}</span>
        </div>
        <div className="gen-step">
          <span className="gen-dot"></span>
          <span>{t('generating_step_4')}</span>
        </div>
      </div>
    </div>
  );
}
