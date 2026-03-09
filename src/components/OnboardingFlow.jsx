import { useState } from 'react';
import { useOnboarding, generatePersonalizedSchedule, generatePersonalizedMeals, generatePersonalizedWorkout } from '../hooks/useOnboarding';
import { useLanguage } from '../hooks/useLanguage.jsx';
import './OnboardingFlow.css';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SPORTS_LIST = [
  { id: 'futebol', label: 'Futebol', labelEn: 'Soccer', icon: '⚽' },
  { id: 'basquete', label: 'Basquete', labelEn: 'Basketball', icon: '🏀' },
  { id: 'volei', label: 'Vôlei', labelEn: 'Volleyball', icon: '🏐' },
  { id: 'natacao', label: 'Natação', labelEn: 'Swimming', icon: '🏊' },
  { id: 'corrida', label: 'Corrida', labelEn: 'Running', icon: '🏃' },
  { id: 'ciclismo', label: 'Ciclismo', labelEn: 'Cycling', icon: '🚴' },
  { id: 'tenis', label: 'Tênis', labelEn: 'Tennis', icon: '🎾' },
  { id: 'artes_marciais', label: 'Artes Marciais', labelEn: 'Martial Arts', icon: '🥋' },
  { id: 'danca', label: 'Dança', labelEn: 'Dance', icon: '💃' },
  { id: 'yoga', label: 'Yoga', labelEn: 'Yoga', icon: '🧘' },
  { id: 'escalada', label: 'Escalada', labelEn: 'Climbing', icon: '🧗' },
  { id: 'outro', label: 'Outro', labelEn: 'Other', icon: '🏅' },
];

const GYM_TYPES = [
  { id: 'musculacao', label: 'Musculação', labelEn: 'Weight Training', icon: '🏋️', desc: 'Levantamento de peso', descEn: 'Weight lifting' },
  { id: 'crossfit', label: 'CrossFit', labelEn: 'CrossFit', icon: '🔥', desc: 'Treino funcional intenso', descEn: 'Intense functional training' },
  { id: 'calistenia', label: 'Calistenia', labelEn: 'Calisthenics', icon: '💪', desc: 'Peso corporal', descEn: 'Bodyweight' },
  { id: 'funcional', label: 'Funcional', labelEn: 'Functional', icon: '⚡', desc: 'Treino funcional', descEn: 'Functional training' },
  { id: 'cardio', label: 'Cardio', labelEn: 'Cardio', icon: '❤️', desc: 'Esteira, bike, etc', descEn: 'Treadmill, bike, etc' },
];

export function OnboardingFlow({ onComplete }) {
  const { completeOnboarding } = useOnboarding();
  const { t, language, setLanguage, languages } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({
    // Basic info
    name: '',
    sex: '',
    age: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    // Daily routine
    wakeUpTime: '06:30',
    sleepTime: '22:30',
    dinnerTime: '19:30',
    officeDays: [],
    // Lifestyle
    hobbies: '',
    choresFrequency: '',
    groceryFrequency: '',
    weekendRoutine: '',
    // Exercise
    exerciseType: '', // 'gym', 'sports', 'both', 'none'
    gymType: [],
    sports: [], // Array of { sportId, days: [], time: 'morning'|'afternoon'|'evening' }
    // Gym specific
    goal: '',
    fitnessLevel: '',
    trainingDays: [],
    trainingTime: '',
    // Nutrition
    dietaryRestrictions: [],
    mealPrep: null,
    // Settings
    preferredLanguage: language
  });

  const isEnglish = language === 'en';
  const days = isEnglish ? DAYS_EN : DAYS;

  // Dynamic steps based on exercise type
  const getSteps = () => {
    const baseSteps = ['welcome', 'language', 'profile', 'routine', 'lifestyle', 'exerciseType'];

    if (profile.exerciseType === 'gym' || profile.exerciseType === 'both') {
      baseSteps.push('gymDetails');
    }
    if (profile.exerciseType === 'sports' || profile.exerciseType === 'both') {
      baseSteps.push('sportsDetails');
    }
    if (profile.exerciseType !== 'none' && profile.exerciseType !== '') {
      baseSteps.push('nutrition');
    }
    baseSteps.push('generating');

    return baseSteps;
  };

  const STEPS = getSteps();

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const toggleArrayItem = (key, item) => {
    setProfile(prev => {
      const current = prev[key];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter(i => i !== item) };
      } else {
        return { ...prev, [key]: [...current, item] };
      }
    });
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  };

  const addSport = (sportId) => {
    setProfile(prev => {
      const exists = prev.sports.find(s => s.sportId === sportId);
      if (exists) {
        return { ...prev, sports: prev.sports.filter(s => s.sportId !== sportId) };
      } else {
        return { ...prev, sports: [...prev.sports, { sportId, days: [], time: 'evening' }] };
      }
    });
  };

  const updateSportSchedule = (sportId, field, value) => {
    setProfile(prev => ({
      ...prev,
      sports: prev.sports.map(s =>
        s.sportId === sportId ? { ...s, [field]: value } : s
      )
    }));
  };

  const toggleSportDay = (sportId, day) => {
    setProfile(prev => ({
      ...prev,
      sports: prev.sports.map(s => {
        if (s.sportId !== sportId) return s;
        const days = s.days.includes(day)
          ? s.days.filter(d => d !== day)
          : [...s.days, day];
        return { ...s, days };
      })
    }));
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

      case 'exerciseType':
        if (!profile.exerciseType) newErrors.exerciseType = t('error_required_exercise_type');
        break;

      case 'gymDetails':
        if (profile.gymType.length === 0) newErrors.gymType = t('error_required_gym_type');
        if (!profile.goal) newErrors.goal = t('error_required_goal');
        if (!profile.fitnessLevel) newErrors.fitnessLevel = t('error_required_level');
        if (profile.trainingDays.length === 0) newErrors.trainingDays = t('error_required_days');
        if (!profile.trainingTime) newErrors.trainingTime = t('error_required_time');
        break;

      case 'sportsDetails':
        if (profile.sports.length === 0) newErrors.sports = t('error_required_sports');
        else {
          const hasSchedule = profile.sports.every(s => s.days.length > 0);
          if (!hasSchedule) newErrors.sportsSchedule = t('error_required_sports_schedule');
        }
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
    if (['welcome', 'language'].includes(currentStepName) || validateStep(currentStepName)) {
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
    const currentStepName = STEPS[currentStep];
    if (currentStepName === 'nutrition' && !validateStep('nutrition')) return;

    // Move to generating step
    const generatingIndex = STEPS.indexOf('generating');
    setCurrentStep(generatingIndex);

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

    await new Promise(resolve => setTimeout(resolve, 2500));
    await completeOnboarding(finalProfile);
    onComplete();
  };

  const renderStep = () => {
    const stepName = STEPS[currentStep];
    const props = { t, isEnglish, days, profile, updateProfile, toggleArrayItem, errors, onNext: nextStep, onBack: prevStep };

    switch (stepName) {
      case 'welcome':
        return <WelcomeStep {...props} />;
      case 'language':
        return <LanguageStep {...props} language={language} setLanguage={setLanguage} languages={languages} />;
      case 'profile':
        return <ProfileStep {...props} />;
      case 'routine':
        return <RoutineStep {...props} />;
      case 'lifestyle':
        return <LifestyleStep {...props} />;
      case 'exerciseType':
        return <ExerciseTypeStep {...props} />;
      case 'gymDetails':
        return <GymDetailsStep {...props} />;
      case 'sportsDetails':
        return <SportsDetailsStep {...props} addSport={addSport} updateSportSchedule={updateSportSchedule} toggleSportDay={toggleSportDay} />;
      case 'nutrition':
        return <NutritionStep {...props} onNext={handleFinish} />;
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
    </div>
  );
}

// ==================== STEP COMPONENTS ====================

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
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
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
          <label>{t('profile_name')} <span className="label-optional">{t('optional')}</span></label>
          <input
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
            <button type="button" className={`option-btn ${profile.sex === 'male' ? 'selected' : ''}`} onClick={() => updateProfile('sex', 'male')}>
              <span className="option-icon">♂</span>
              <span>{t('profile_sex_male')}</span>
            </button>
            <button type="button" className={`option-btn ${profile.sex === 'female' ? 'selected' : ''}`} onClick={() => updateProfile('sex', 'female')}>
              <span className="option-icon">♀</span>
              <span>{t('profile_sex_female')}</span>
            </button>
          </div>
          {errors.sex && <span className="error-text">{errors.sex}</span>}
        </div>

        <div className="input-group">
          <label>{t('profile_age')} <span className="label-required">{t('required')}</span></label>
          <input type="number" value={profile.age} onChange={(e) => updateProfile('age', e.target.value)} placeholder={t('profile_age_placeholder')} className={`input-field ${errors.age ? 'input-error' : ''}`} min="14" max="100" />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>

        <div className="input-row">
          <div className="input-group">
            <label>{t('profile_current_weight')} <span className="label-required">{t('required')}</span></label>
            <input type="number" value={profile.currentWeight} onChange={(e) => updateProfile('currentWeight', e.target.value)} placeholder="Ex: 72" className={`input-field ${errors.currentWeight ? 'input-error' : ''}`} step="0.1" />
            {errors.currentWeight && <span className="error-text">{errors.currentWeight}</span>}
          </div>
          <div className="input-group">
            <label>{t('profile_target_weight')} <span className="label-required">{t('required')}</span></label>
            <input type="number" value={profile.targetWeight} onChange={(e) => updateProfile('targetWeight', e.target.value)} placeholder="Ex: 80" className={`input-field ${errors.targetWeight ? 'input-error' : ''}`} step="0.1" />
            {errors.targetWeight && <span className="error-text">{errors.targetWeight}</span>}
          </div>
        </div>

        <div className="input-group">
          <label>{t('profile_height')} <span className="label-optional">{t('optional')}</span></label>
          <input type="number" value={profile.height} onChange={(e) => updateProfile('height', e.target.value)} placeholder="Ex: 178" className="input-field" />
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
      </div>
    </div>
  );
}

function RoutineStep({ t, days, profile, updateProfile, toggleArrayItem, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('routine_title')}</h2>
        <p>{t('routine_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-row">
          <div className="input-group">
            <label>{t('routine_wake_up')}</label>
            <input type="time" value={profile.wakeUpTime} onChange={(e) => updateProfile('wakeUpTime', e.target.value)} className="input-field" />
          </div>
          <div className="input-group">
            <label>{t('routine_sleep')}</label>
            <input type="time" value={profile.sleepTime} onChange={(e) => updateProfile('sleepTime', e.target.value)} className="input-field" />
          </div>
        </div>

        <div className="input-group">
          <label>{t('routine_dinner')} <span className="label-optional">{t('optional')}</span></label>
          <input type="time" value={profile.dinnerTime} onChange={(e) => updateProfile('dinnerTime', e.target.value)} className="input-field" />
        </div>

        <div className="input-group">
          <label>{t('routine_office_days')} <span className="label-hint">— {t('routine_office_hint')}</span></label>
          <div className="day-selector">
            {days.map((day, i) => (
              <button key={day} type="button" className={`day-btn ${profile.officeDays.includes(DAYS[i]) ? 'selected' : ''}`} onClick={() => toggleArrayItem('officeDays', DAYS[i])}>
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">{profile.officeDays.length === 0 ? t('routine_work_from_home') : `${profile.officeDays.length} ${t('routine_days_selected')}`}</p>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
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
          <label>{t('lifestyle_hobbies')} <span className="label-optional">{t('optional')}</span></label>
          <input type="text" value={profile.hobbies} onChange={(e) => updateProfile('hobbies', e.target.value)} placeholder={t('lifestyle_hobbies_hint')} className="input-field" />
        </div>

        <div className="input-group">
          <label>{t('lifestyle_chores')} <span className="label-optional">{t('optional')}</span></label>
          <div className="option-row triple">
            {['daily', 'weekly', 'rarely'].map(opt => (
              <button key={opt} type="button" className={`option-btn small ${profile.choresFrequency === opt ? 'selected' : ''}`} onClick={() => updateProfile('choresFrequency', opt)}>
                {t(`lifestyle_chores_${opt}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('lifestyle_grocery')} <span className="label-optional">{t('optional')}</span></label>
          <div className="option-row triple">
            {['weekly', 'biweekly', 'monthly'].map(opt => (
              <button key={opt} type="button" className={`option-btn small ${profile.groceryFrequency === opt ? 'selected' : ''}`} onClick={() => updateProfile('groceryFrequency', opt)}>
                {t(`lifestyle_grocery_${opt}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('lifestyle_weekend')} <span className="label-required">{t('required')}</span></label>
          <div className="option-row">
            <button type="button" className={`option-btn large ${profile.weekendRoutine === 'relaxed' ? 'selected' : ''}`} onClick={() => updateProfile('weekendRoutine', 'relaxed')}>
              <span className="option-icon">😴</span>
              <div className="option-content">
                <span className="option-title">{t('lifestyle_weekend_relaxed')}</span>
                <span className="option-desc">{t('lifestyle_weekend_relaxed_desc')}</span>
              </div>
            </button>
            <button type="button" className={`option-btn large ${profile.weekendRoutine === 'active' ? 'selected' : ''}`} onClick={() => updateProfile('weekendRoutine', 'active')}>
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
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
      </div>
    </div>
  );
}

function ExerciseTypeStep({ t, profile, updateProfile, errors, onNext, onBack }) {
  const options = [
    { id: 'gym', icon: '🏋️', label: t('exercise_type_gym'), desc: t('exercise_type_gym_desc') },
    { id: 'sports', icon: '⚽', label: t('exercise_type_sports'), desc: t('exercise_type_sports_desc') },
    { id: 'both', icon: '💪', label: t('exercise_type_both'), desc: t('exercise_type_both_desc') },
    { id: 'none', icon: '🧘', label: t('exercise_type_none'), desc: t('exercise_type_none_desc') },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('exercise_type_title')}</h2>
        <p>{t('exercise_type_desc')}</p>
      </div>

      <div className="form-section">
        <div className="exercise-type-grid">
          {options.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`exercise-type-card ${profile.exerciseType === opt.id ? 'selected' : ''}`}
              onClick={() => updateProfile('exerciseType', opt.id)}
            >
              <span className="exercise-type-icon">{opt.icon}</span>
              <span className="exercise-type-label">{opt.label}</span>
              <span className="exercise-type-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
        {errors.exerciseType && <span className="error-text">{errors.exerciseType}</span>}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
      </div>
    </div>
  );
}

function GymDetailsStep({ t, isEnglish, days, profile, updateProfile, toggleArrayItem, errors, onNext, onBack }) {
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
        <h2>{t('gym_details_title')}</h2>
        <p>{t('gym_details_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('gym_type_question')} <span className="label-required">{t('required')}</span></label>
          <div className="gym-type-grid">
            {GYM_TYPES.map(type => (
              <button
                key={type.id}
                type="button"
                className={`gym-type-btn ${profile.gymType.includes(type.id) ? 'selected' : ''}`}
                onClick={() => toggleArrayItem('gymType', type.id)}
              >
                <span className="gym-type-icon">{type.icon}</span>
                <span className="gym-type-label">{isEnglish ? type.labelEn : type.label}</span>
                <span className="gym-type-desc">{isEnglish ? type.descEn : type.desc}</span>
              </button>
            ))}
          </div>
          <p className="input-hint">{t('gym_type_hint')}</p>
          {errors.gymType && <span className="error-text">{errors.gymType}</span>}
        </div>

        <div className="input-group">
          <label>{t('training_goal')} <span className="label-required">{t('required')}</span></label>
          <div className="goal-grid">
            {goals.map(goal => (
              <button key={goal.id} type="button" className={`goal-card ${profile.goal === goal.id ? 'selected' : ''}`} onClick={() => updateProfile('goal', goal.id)}>
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
              <button key={level.id} type="button" className={`level-btn ${profile.fitnessLevel === level.id ? 'selected' : ''}`} onClick={() => updateProfile('fitnessLevel', level.id)}>
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
              <button key={day} type="button" className={`day-btn ${profile.trainingDays.includes(DAYS[i]) ? 'selected' : ''}`} onClick={() => toggleArrayItem('trainingDays', DAYS[i])}>
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">{profile.trainingDays.length === 0 ? t('training_days_hint') : `${profile.trainingDays.length} ${t('routine_days_selected')}`}</p>
          {errors.trainingDays && <span className="error-text">{errors.trainingDays}</span>}
        </div>

        <div className="input-group">
          <label>{t('training_time')} <span className="label-required">{t('required')}</span></label>
          <div className="time-options">
            {times.map(time => (
              <button key={time.id} type="button" className={`time-btn ${profile.trainingTime === time.id ? 'selected' : ''}`} onClick={() => updateProfile('trainingTime', time.id)}>
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
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
      </div>
    </div>
  );
}

function SportsDetailsStep({ t, isEnglish, days, profile, addSport, toggleSportDay, updateSportSchedule, errors, onNext, onBack }) {
  const selectedSports = profile.sports;

  return (
    <div className="step">
      <div className="step-header">
        <h2>{t('sports_details_title')}</h2>
        <p>{t('sports_details_desc')}</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>{t('sports_select')} <span className="label-required">{t('required')}</span></label>
          <div className="sports-grid">
            {SPORTS_LIST.map(sport => (
              <button
                key={sport.id}
                type="button"
                className={`sport-btn ${selectedSports.find(s => s.sportId === sport.id) ? 'selected' : ''}`}
                onClick={() => addSport(sport.id)}
              >
                <span className="sport-icon">{sport.icon}</span>
                <span className="sport-label">{isEnglish ? sport.labelEn : sport.label}</span>
              </button>
            ))}
          </div>
          {errors.sports && <span className="error-text">{errors.sports}</span>}
        </div>

        {selectedSports.length > 0 && (
          <div className="sports-schedule">
            <label>{t('sports_schedule')} <span className="label-required">{t('required')}</span></label>
            {selectedSports.map(sport => {
              const sportInfo = SPORTS_LIST.find(s => s.id === sport.sportId);
              return (
                <div key={sport.sportId} className="sport-schedule-card">
                  <div className="sport-schedule-header">
                    <span className="sport-schedule-icon">{sportInfo?.icon}</span>
                    <span className="sport-schedule-name">{isEnglish ? sportInfo?.labelEn : sportInfo?.label}</span>
                  </div>
                  <div className="sport-schedule-days">
                    <span className="schedule-label">{t('sports_which_days')}</span>
                    <div className="day-selector compact">
                      {days.map((day, i) => (
                        <button
                          key={day}
                          type="button"
                          className={`day-btn small ${sport.days.includes(DAYS[i]) ? 'selected' : ''}`}
                          onClick={() => toggleSportDay(sport.sportId, DAYS[i])}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sport-schedule-time">
                    <span className="schedule-label">{t('sports_what_time')}</span>
                    <div className="time-options compact">
                      {['morning', 'afternoon', 'evening'].map(time => (
                        <button
                          key={time}
                          type="button"
                          className={`time-btn small ${sport.time === time ? 'selected' : ''}`}
                          onClick={() => updateSportSchedule(sport.sportId, 'time', time)}
                        >
                          {time === 'morning' ? '🌅' : time === 'afternoon' ? '☀️' : '🌙'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {errors.sportsSchedule && <span className="error-text">{errors.sportsSchedule}</span>}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary" onClick={onNext}>{t('continue')} →</button>
      </div>
    </div>
  );
}

function NutritionStep({ t, profile, updateProfile, toggleArrayItem, errors, onNext, onBack }) {
  const restrictions = [
    { id: 'vegetarian', label: t('nutrition_vegetarian') },
    { id: 'vegan', label: t('nutrition_vegan') },
    { id: 'lactose_free', label: t('nutrition_lactose_free') },
    { id: 'gluten_free', label: t('nutrition_gluten_free') },
  ];

  const getGoalLabel = (goal) => {
    const labels = {
      muscle_gain: t('training_goal_muscle'),
      weight_loss: t('training_goal_loss'),
      maintain: t('training_goal_maintain'),
      general: t('training_goal_general')
    };
    return labels[goal] || '-';
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
              <button key={r.id} type="button" className={`restriction-btn ${profile.dietaryRestrictions.includes(r.id) ? 'selected' : ''}`} onClick={() => toggleArrayItem('dietaryRestrictions', r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>{t('nutrition_meal_prep')} <span className="label-required">{t('required')}</span></label>
          <div className="option-row">
            <button type="button" className={`option-btn large ${profile.mealPrep === true ? 'selected' : ''}`} onClick={() => updateProfile('mealPrep', true)}>
              <span className="option-icon">📦</span>
              <div className="option-content">
                <span className="option-title">{t('nutrition_meal_prep_yes')}</span>
                <span className="option-desc">{t('nutrition_meal_prep_yes_desc')}</span>
              </div>
            </button>
            <button type="button" className={`option-btn large ${profile.mealPrep === false ? 'selected' : ''}`} onClick={() => updateProfile('mealPrep', false)}>
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
            {profile.goal && (
              <div className="summary-item">
                <span className="summary-icon">🎯</span>
                <div className="summary-content">
                  <span className="summary-label">{t('summary_goal')}</span>
                  <span className="summary-value">{getGoalLabel(profile.goal)}</span>
                </div>
              </div>
            )}
            {profile.trainingDays.length > 0 && (
              <div className="summary-item">
                <span className="summary-icon">🏋️</span>
                <div className="summary-content">
                  <span className="summary-label">{t('summary_training')}</span>
                  <span className="summary-value">{profile.trainingDays.length}{t('summary_per_week')}</span>
                </div>
              </div>
            )}
            {profile.sports.length > 0 && (
              <div className="summary-item">
                <span className="summary-icon">⚽</span>
                <div className="summary-content">
                  <span className="summary-label">{t('summary_sports')}</span>
                  <span className="summary-value">{profile.sports.length} {profile.sports.length === 1 ? t('summary_sport') : t('summary_sports_plural')}</span>
                </div>
              </div>
            )}
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
        <button type="button" className="btn-secondary" onClick={onBack}>← {t('back')}</button>
        <button type="button" className="btn-primary btn-finish" onClick={onNext}>{t('create_routine')} ✨</button>
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
        <div className="gen-step done"><span className="gen-check">✓</span><span>{t('generating_step_1')}</span></div>
        <div className="gen-step active"><span className="gen-spinner"></span><span>{t('generating_step_2')}</span></div>
        <div className="gen-step"><span className="gen-dot"></span><span>{t('generating_step_3')}</span></div>
        <div className="gen-step"><span className="gen-dot"></span><span>{t('generating_step_4')}</span></div>
      </div>
    </div>
  );
}
