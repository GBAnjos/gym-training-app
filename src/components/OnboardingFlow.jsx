import { useState } from 'react';
import { useOnboarding, generatePersonalizedSchedule, generatePersonalizedMeals, generatePersonalizedWorkout } from '../hooks/useOnboarding';
import './OnboardingFlow.css';

const STEPS = [
  'welcome',
  'profile',
  'routine',
  'training',
  'nutrition',
  'generating'
];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function OnboardingFlow({ onComplete }) {
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
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
    goal: '',
    fitnessLevel: '',
    trainingDays: [],
    trainingTime: '',
    dietaryRestrictions: [],
    mealPrep: null
  });

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    // Clear error when field is updated
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
        if (!profile.sex) newErrors.sex = 'Seleciona o teu sexo';
        if (!profile.age) newErrors.age = 'Indica a tua idade';
        if (!profile.currentWeight) newErrors.currentWeight = 'Indica o teu peso atual';
        if (!profile.targetWeight) newErrors.targetWeight = 'Indica o teu peso alvo';
        break;

      case 'routine':
        if (!profile.wakeUpTime) newErrors.wakeUpTime = 'Indica a hora que acordas';
        if (!profile.sleepTime) newErrors.sleepTime = 'Indica a hora que dormes';
        break;

      case 'training':
        if (!profile.goal) newErrors.goal = 'Seleciona o teu objetivo';
        if (!profile.fitnessLevel) newErrors.fitnessLevel = 'Seleciona o teu nível';
        if (profile.trainingDays.length === 0) newErrors.trainingDays = 'Seleciona pelo menos um dia';
        if (!profile.trainingTime) newErrors.trainingTime = 'Seleciona o horário preferido';
        break;

      case 'nutrition':
        if (profile.mealPrep === null) newErrors.mealPrep = 'Seleciona uma opção';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    const currentStepName = STEPS[currentStep];
    if (validateStep(currentStepName)) {
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
    setIsGenerating(true);

    // Generate personalized data
    const schedule = generatePersonalizedSchedule(profile);
    const meals = generatePersonalizedMeals(profile);
    const workout = generatePersonalizedWorkout(profile);

    // Save to localStorage
    localStorage.setItem('vida_user_schedule', JSON.stringify(schedule));
    localStorage.setItem('vida_user_meals', JSON.stringify(meals));
    localStorage.setItem('vida_user_workout', JSON.stringify(workout));
    localStorage.setItem('vida_user_profile', JSON.stringify(profile));

    // Simulate generation time for UX
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Complete onboarding
    await completeOnboarding(profile);

    setIsGenerating(false);
    onComplete();
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />;
      case 'profile':
        return <ProfileStep profile={profile} updateProfile={updateProfile} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'routine':
        return <RoutineStep profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'training':
        return <TrainingStep profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} errors={errors} onNext={nextStep} onBack={prevStep} />;
      case 'nutrition':
        return <NutritionStep profile={profile} updateProfile={updateProfile} errors={errors} onNext={handleFinish} onBack={prevStep} />;
      case 'generating':
        return <GeneratingStep />;
      default:
        return null;
    }
  };

  const stepIndex = currentStep - 1; // Exclude welcome step from progress
  const totalSteps = STEPS.length - 2; // Exclude welcome and generating

  return (
    <div className="onboarding">
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="onboarding-header">
          <div className="onboarding-progress-bar">
            <div
              className="onboarding-progress-fill"
              style={{ width: `${(stepIndex / totalSteps) * 100}%` }}
            />
          </div>
          <span className="onboarding-step-count">
            Passo {stepIndex} de {totalSteps}
          </span>
        </div>
      )}
      <div className="onboarding-content">
        {renderStep()}
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <div className="step welcome-step">
      <div className="welcome-logo">
        <span className="welcome-icon">💪</span>
      </div>
      <h1 className="welcome-title">Bem-vindo ao Vida</h1>
      <p className="welcome-tagline">Estrutura real. Vida real.</p>
      <p className="welcome-description">
        Vamos criar uma rotina personalizada para ti. Em poucos passos, terás um plano de treino,
        alimentação e horários adaptados ao teu estilo de vida.
      </p>
      <button className="btn-primary btn-large" onClick={onNext}>
        Começar
        <span className="btn-icon">→</span>
      </button>
    </div>
  );
}

function ProfileStep({ profile, updateProfile, errors, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>O teu perfil</h2>
        <p>Informações básicas para personalizar a tua experiência</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label htmlFor="name">
            Nome <span className="label-optional">(opcional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            placeholder="Como te chamas?"
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Sexo <span className="label-required">*</span></label>
          <div className="option-row">
            <button
              type="button"
              className={`option-btn ${profile.sex === 'male' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'male')}
            >
              <span className="option-icon">♂</span>
              <span>Masculino</span>
            </button>
            <button
              type="button"
              className={`option-btn ${profile.sex === 'female' ? 'selected' : ''}`}
              onClick={() => updateProfile('sex', 'female')}
            >
              <span className="option-icon">♀</span>
              <span>Feminino</span>
            </button>
          </div>
          {errors.sex && <span className="error-text">{errors.sex}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="age">Idade <span className="label-required">*</span></label>
          <input
            id="age"
            type="number"
            value={profile.age}
            onChange={(e) => updateProfile('age', e.target.value)}
            placeholder="Ex: 28"
            className={`input-field ${errors.age ? 'input-error' : ''}`}
            min="14"
            max="100"
          />
          {errors.age && <span className="error-text">{errors.age}</span>}
        </div>

        <div className="input-row">
          <div className="input-group">
            <label htmlFor="currentWeight">Peso atual (kg) <span className="label-required">*</span></label>
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
            <label htmlFor="targetWeight">Peso alvo (kg) <span className="label-required">*</span></label>
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
          <label htmlFor="height">Altura (cm) <span className="label-optional">(opcional)</span></label>
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
          ← Voltar
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

function RoutineStep({ profile, updateProfile, toggleDay, errors, onNext, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <h2>A tua rotina</h2>
        <p>Como é o teu dia-a-dia?</p>
      </div>

      <div className="form-section">
        <div className="input-row">
          <div className="input-group">
            <label htmlFor="wakeUpTime">Acordas às <span className="label-required">*</span></label>
            <input
              id="wakeUpTime"
              type="time"
              value={profile.wakeUpTime}
              onChange={(e) => updateProfile('wakeUpTime', e.target.value)}
              className={`input-field ${errors.wakeUpTime ? 'input-error' : ''}`}
            />
            {errors.wakeUpTime && <span className="error-text">{errors.wakeUpTime}</span>}
          </div>
          <div className="input-group">
            <label htmlFor="sleepTime">Dormes às <span className="label-required">*</span></label>
            <input
              id="sleepTime"
              type="time"
              value={profile.sleepTime}
              onChange={(e) => updateProfile('sleepTime', e.target.value)}
              className={`input-field ${errors.sleepTime ? 'input-error' : ''}`}
            />
            {errors.sleepTime && <span className="error-text">{errors.sleepTime}</span>}
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="dinnerTime">Jantas às <span className="label-optional">(opcional)</span></label>
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
            Dias de escritório
            <span className="label-hint"> — seleciona os dias que vais ao escritório</span>
          </label>
          <div className="day-selector">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                className={`day-btn ${profile.officeDays.includes(day) ? 'selected' : ''}`}
                onClick={() => toggleDay('officeDays', day)}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">
            {profile.officeDays.length === 0
              ? 'Trabalhas sempre de casa? Deixa em branco.'
              : `${profile.officeDays.length} dia${profile.officeDays.length > 1 ? 's' : ''} selecionado${profile.officeDays.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Voltar
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

function TrainingStep({ profile, updateProfile, toggleDay, errors, onNext, onBack }) {
  const goals = [
    { id: 'muscle_gain', icon: '💪', label: 'Ganhar massa', desc: 'Hipertrofia muscular' },
    { id: 'weight_loss', icon: '🔥', label: 'Perder peso', desc: 'Queimar gordura' },
    { id: 'maintain', icon: '⚖️', label: 'Manter forma', desc: 'Estabilidade' },
    { id: 'general', icon: '🎯', label: 'Fitness geral', desc: 'Saúde e bem-estar' },
  ];

  const levels = [
    { id: 'beginner', label: 'Iniciante', desc: 'Menos de 1 ano de treino' },
    { id: 'intermediate', label: 'Intermédio', desc: '1-3 anos de treino' },
    { id: 'advanced', label: 'Avançado', desc: 'Mais de 3 anos de treino' },
  ];

  const times = [
    { id: 'morning', icon: '🌅', label: 'Manhã', desc: '6h - 12h' },
    { id: 'afternoon', icon: '☀️', label: 'Tarde', desc: '12h - 18h' },
    { id: 'evening', icon: '🌙', label: 'Noite', desc: '18h - 22h' },
  ];

  return (
    <div className="step">
      <div className="step-header">
        <h2>O teu treino</h2>
        <p>Personaliza o teu plano de treino</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>Qual é o teu objetivo principal? <span className="label-required">*</span></label>
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
          <label>Nível de experiência <span className="label-required">*</span></label>
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
          <label>Dias de treino por semana <span className="label-required">*</span></label>
          <div className="day-selector">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                className={`day-btn ${profile.trainingDays.includes(day) ? 'selected' : ''}`}
                onClick={() => toggleDay('trainingDays', day)}
              >
                {day}
              </button>
            ))}
          </div>
          <p className="input-hint">
            {profile.trainingDays.length === 0
              ? 'Seleciona os dias que vais treinar'
              : `${profile.trainingDays.length} dia${profile.trainingDays.length > 1 ? 's' : ''} de treino por semana`}
          </p>
          {errors.trainingDays && <span className="error-text">{errors.trainingDays}</span>}
        </div>

        <div className="input-group">
          <label>Horário preferido de treino <span className="label-required">*</span></label>
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
          ← Voltar
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

function NutritionStep({ profile, updateProfile, errors, onNext, onBack }) {
  const restrictions = [
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'lactose_free', label: 'Sem lactose' },
    { id: 'gluten_free', label: 'Sem glúten' },
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
      muscle_gain: 'Ganhar massa',
      weight_loss: 'Perder peso',
      maintain: 'Manter forma',
      general: 'Fitness geral'
    };
    return labels[goal] || goal;
  };

  const getTimeLabel = (time) => {
    const labels = { morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite' };
    return labels[time] || time;
  };

  return (
    <div className="step">
      <div className="step-header">
        <h2>Alimentação</h2>
        <p>Últimos detalhes para o teu plano alimentar</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>Restrições alimentares <span className="label-optional">(opcional)</span></label>
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
          <label>Preparas refeições com antecedência? <span className="label-required">*</span></label>
          <div className="option-row">
            <button
              type="button"
              className={`option-btn large ${profile.mealPrep === true ? 'selected' : ''}`}
              onClick={() => updateProfile('mealPrep', true)}
            >
              <span className="option-icon">📦</span>
              <div className="option-content">
                <span className="option-title">Sim, faço meal prep</span>
                <span className="option-desc">Preparo refeições para vários dias</span>
              </div>
            </button>
            <button
              type="button"
              className={`option-btn large ${profile.mealPrep === false ? 'selected' : ''}`}
              onClick={() => updateProfile('mealPrep', false)}
            >
              <span className="option-icon">🍳</span>
              <div className="option-content">
                <span className="option-title">Não, cozinho no dia</span>
                <span className="option-desc">Preparo cada refeição na hora</span>
              </div>
            </button>
          </div>
          {errors.mealPrep && <span className="error-text">{errors.mealPrep}</span>}
        </div>

        <div className="summary-card">
          <h4>Resumo do teu plano</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">🎯</span>
              <div className="summary-content">
                <span className="summary-label">Objetivo</span>
                <span className="summary-value">{getGoalLabel(profile.goal)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🏋️</span>
              <div className="summary-content">
                <span className="summary-label">Treino</span>
                <span className="summary-value">{profile.trainingDays.length}x por semana</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏰</span>
              <div className="summary-content">
                <span className="summary-label">Horário</span>
                <span className="summary-value">{getTimeLabel(profile.trainingTime)}</span>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⚖️</span>
              <div className="summary-content">
                <span className="summary-label">Meta</span>
                <span className="summary-value">{profile.currentWeight}kg → {profile.targetWeight}kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Voltar
        </button>
        <button type="button" className="btn-primary btn-finish" onClick={onNext}>
          Criar minha rotina ✨
        </button>
      </div>
    </div>
  );
}

function GeneratingStep() {
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
      <h2>A criar a tua rotina...</h2>
      <p className="generating-text">
        Estamos a personalizar o teu plano de treino, alimentação e horários.
      </p>
      <div className="generating-steps">
        <div className="gen-step done">
          <span className="gen-check">✓</span>
          <span>Analisando objetivos</span>
        </div>
        <div className="gen-step active">
          <span className="gen-spinner"></span>
          <span>Criando plano de treino</span>
        </div>
        <div className="gen-step">
          <span className="gen-dot"></span>
          <span>Montando horários</span>
        </div>
        <div className="gen-step">
          <span className="gen-dot"></span>
          <span>Ajustando alimentação</span>
        </div>
      </div>
    </div>
  );
}
